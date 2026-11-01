// Synthesizes the 10s keynote soundtrack (beat, whooshes, UI clicks, final bass hit)
// and writes public/audio/keynote-soundtrack.wav. No samples or external assets.
// Usage: node scripts/generate-soundtrack.mjs
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const LENGTH = 10;
const N = SR * LENGTH;
const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);
const duck = new Float32Array(N).fill(1); // sidechain from the kick

// Deterministic noise so every run produces the same file.
let seed = 1234567;
const noise = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 2147483648 - 1;
};

const BPM = 120;
const BEAT = 60 / BPM; // 0.5s: every cut (1.5, 3, 5, 6.5, 8) lands on a beat
const CUTS = [1.5, 3.0, 5.0, 6.5, 8.0];
const DROP = 8.0;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/** Write a mono voice into the mix. fn(t) returns a sample for local time t. */
const voice = (start, dur, fn, {gain = 1, pan = 0, send = 0, ducked = false} = {}) => {
	const s0 = Math.max(0, Math.floor(start * SR));
	const s1 = Math.min(N, Math.floor((start + dur) * SR));
	const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
	const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
	for (let i = s0; i < s1; i++) {
		const t = (i - s0) / SR;
		let v = fn(t, i);
		if (ducked) v *= duck[i];
		L[i] += v * gl;
		R[i] += v * gr;
		sendL[i] += v * gl * send;
		sendR[i] += v * gr * send;
	}
};

/** State-variable filter factory (Chamberlin). Returns {lp, bp, hp}. */
const svf = () => {
	let low = 0;
	let band = 0;
	return (x, cutoff, q = 0.7) => {
		const f = 2 * Math.sin((Math.PI * Math.min(cutoff, SR / 6)) / SR);
		low += f * band;
		const high = x - low - (1 / q) * band;
		band += f * high;
		return {lp: low, bp: band, hp: high};
	};
};

// ---------- Instruments ----------

const kick = (t0, amp = 1) => {
	let phase = 0;
	voice(
		t0,
		0.45,
		(t) => {
			const f = 44 + 120 * Math.exp(-t * 32);
			phase += (2 * Math.PI * f) / SR;
			const body = Math.sin(phase) * Math.exp(-t * 7.5);
			const click = noise() * Math.exp(-t * 400) * 0.35;
			return Math.tanh((body + click) * 1.8) * 0.9;
		},
		{gain: amp},
	);
	// Sidechain: duck the music under the kick.
	const s0 = Math.floor(t0 * SR);
	for (let i = 0; i < SR * 0.3 && s0 + i < N; i++) {
		const t = i / SR;
		duck[s0 + i] = Math.min(duck[s0 + i], 1 - 0.7 * Math.exp(-t * 14));
	}
};

const clap = (t0, amp = 1) => {
	const f = svf();
	voice(
		t0,
		0.3,
		(t) => {
			const bursts = [0, 0.011, 0.022].reduce(
				(a, o) => a + (t >= o ? Math.exp(-(t - o) * (o === 0.022 ? 22 : 180)) : 0),
				0,
			);
			return f(noise() * bursts, 1600, 1.4).bp * 1.6;
		},
		{gain: 0.42 * amp, send: 0.35},
	);
};

const hat = (t0, amp = 1, open = false) => {
	const f = svf();
	voice(
		t0,
		open ? 0.22 : 0.06,
		(t) => f(noise(), 9000, 0.8).hp * Math.exp(-t * (open ? 16 : 75)),
		{gain: 0.13 * amp, pan: 0.25},
	);
};

const bass = (t0, midi, dur) => {
	const f = svf();
	const freq = mtof(midi);
	let ph = 0;
	voice(
		t0,
		dur,
		(t) => {
			ph = (ph + freq / SR) % 1;
			const saw = 2 * ph - 1;
			const sub = Math.sin(2 * Math.PI * ph);
			const env = Math.min(1, t * 300) * Math.exp(-t * 4);
			const cut = 180 + 1400 * Math.exp(-t * 18);
			return Math.tanh((f(saw, cut, 1.1).lp * 0.8 + sub * 0.6) * 1.4) * env;
		},
		{gain: 0.42, ducked: true},
	);
};

const stab = (t0, midis, dur, amp = 1) => {
	const filters = midis.map(() => [svf(), svf()]);
	const phases = midis.map(() => [Math.random() * 0, 0.37]);
	voice(
		t0,
		dur + 0.4,
		(t) => {
			let s = 0;
			const env = Math.min(1, t * 200) * (t < dur ? Math.exp(-t * 5) : Math.exp(-dur * 5) * Math.exp(-(t - dur) * 18));
			const cut = 700 + 4200 * Math.exp(-t * 9);
			midis.forEach((m, k) => {
				const freq = mtof(m);
				[1.004, 0.996].forEach((det, j) => {
					phases[k][j] = (phases[k][j] + (freq * det) / SR) % 1;
					s += filters[k][j](2 * phases[k][j] - 1, cut, 0.9).lp;
				});
			});
			return (s / (midis.length * 2)) * env;
		},
		{gain: 0.55 * amp, send: 0.45, ducked: true},
	);
};

const pad = (t0, midis, dur) => {
	const filters = midis.map(() => svf());
	const phases = midis.map(() => [0, 0.5, 0.25]);
	voice(
		t0,
		dur,
		(t) => {
			let s = 0;
			const env = Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 1.2);
			midis.forEach((m, k) => {
				const freq = mtof(m);
				let v = 0;
				[1.006, 0.994, 1].forEach((det, j) => {
					phases[k][j] = (phases[k][j] + (freq * det) / SR) % 1;
					v += 2 * phases[k][j] - 1;
				});
				s += filters[k](v, 900 + 500 * Math.sin(t * 2), 0.8).lp;
			});
			return (s / (midis.length * 3)) * env;
		},
		{gain: 0.6, send: 0.6},
	);
};

/** Filtered-noise whoosh that swells into `peak` and tails off after it. */
const whoosh = (peak, {pre = 0.32, post = 0.22, lo = 250, hi = 5200, pan = [-0.7, 0.7], amp = 1} = {}) => {
	const f = svf();
	const dur = pre + post;
	voice(
		peak - pre,
		dur,
		(t) => {
			const x = t < pre ? t / pre : 1 - (t - pre) / post;
			const env = Math.pow(Math.max(0, x), 2.2);
			const cut = lo + (hi - lo) * Math.pow(Math.max(0, x), 1.5);
			return f(noise(), cut, 1.6).bp * env * 1.3;
		},
		{gain: 0.5 * amp, pan: pan[0], send: 0.25},
	);
	// Second layer panned the other way, slightly later, for movement.
	const g = svf();
	voice(
		peak - pre * 0.6,
		pre * 0.6 + post,
		(t) => {
			const x = t < pre * 0.6 ? t / (pre * 0.6) : 1 - (t - pre * 0.6) / post;
			const env = Math.pow(Math.max(0, x), 2);
			return g(noise(), lo * 2 + hi * 0.6 * Math.max(0, x), 2).bp * env;
		},
		{gain: 0.32 * amp, pan: pan[1], send: 0.25},
	);
};

const click = (t0, freq = 3200, amp = 1, pan = 0) => {
	voice(
		t0,
		0.05,
		(t) => (Math.sin(2 * Math.PI * freq * t) * 0.7 + noise() * 0.3) * Math.exp(-t * 260),
		{gain: 0.3 * amp, pan, send: 0.15},
	);
};

const pop = (t0, base = 520, amp = 1, pan = 0) => {
	let ph = 0;
	voice(
		t0,
		0.14,
		(t) => {
			const f = base * (1 + 1.6 * Math.exp(-t * 60));
			ph += (2 * Math.PI * f) / SR;
			return Math.sin(ph) * Math.exp(-t * 34);
		},
		{gain: 0.32 * amp, pan, send: 0.2},
	);
};

const thud = (t0, amp = 1, pan = 0) => {
	let ph = 0;
	voice(
		t0,
		0.25,
		(t) => {
			const f = 55 + 90 * Math.exp(-t * 40);
			ph += (2 * Math.PI * f) / SR;
			return (Math.sin(ph) * Math.exp(-t * 18) + noise() * Math.exp(-t * 120) * 0.25) * 0.9;
		},
		{gain: 0.55 * amp, pan},
	);
};

const chime = (t0, midi, amp = 1, pan = 0) => {
	const f = mtof(midi);
	voice(
		t0,
		0.7,
		(t) =>
			(Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 8)) *
			Math.exp(-t * 6),
		{gain: 0.12 * amp, pan, send: 0.5},
	);
};

const riser = (t0, dur) => {
	const f = svf();
	let ph = 0;
	voice(
		t0,
		dur,
		(t) => {
			const x = t / dur;
			const tone = Math.sin((ph += (2 * Math.PI * (200 + 900 * x * x)) / SR)) * 0.25;
			return (f(noise(), 400 + 7000 * x * x, 2.2).bp + tone) * x * x;
		},
		{gain: 0.38, send: 0.3},
	);
};

const impact = (t0) => {
	let ph = 0;
	voice(
		t0,
		2,
		(t) => {
			const f = 38 + 60 * Math.exp(-t * 14);
			ph += (2 * Math.PI * f) / SR;
			const sub = Math.sin(ph) * Math.exp(-t * 1.5);
			return Math.tanh(sub * 2.4) * 0.95;
		},
		{gain: 1},
	);
	const lp = svf();
	voice(
		t0,
		1.6,
		(t) => lp(noise(), 120 + 2400 * Math.exp(-t * 10), 0.7).lp * Math.exp(-t * 3.2) * 1.6,
		{gain: 0.8, send: 0.9},
	);
	kick(t0, 1.15);
};

/** Short electrical buzz for the neon flicker. */
const buzz = (t0, dur, amp = 1) => {
	const f = svf();
	voice(
		t0,
		dur,
		(t) => {
			const sq = Math.sign(Math.sin(2 * Math.PI * 120 * t)) * 0.5 + noise() * 0.3;
			return f(sq, 2400, 1).lp * Math.min(1, t * 400) * Math.min(1, (dur - t) * 400);
		},
		{gain: 0.12 * amp, pan: 0.1},
	);
};

// ---------- Arrangement ----------

// Progression per 2s bar: Am, F, C, G
const BASS_NOTES = [33, 29, 36, 31];
const CHORDS = [
	[57, 60, 64, 69],
	[53, 57, 60, 65],
	[55, 60, 64, 67],
	[55, 59, 62, 67],
];

for (let b = 0; b < DROP / BEAT; b++) {
	const t = b * BEAT;
	const inFinalBreak = t >= DROP - BEAT; // half-beat of air before the hit
	if (!inFinalBreak) kick(t, b === 0 ? 1.1 : 1);
	if (b % 2 === 1 && !inFinalBreak) clap(t);
	// 16th hats with accents on the off-beats
	for (let s = 0; s < 4; s++) {
		const ht = t + (s * BEAT) / 4;
		if (ht >= DROP - BEAT * 0.5) continue;
		hat(ht, s === 2 ? 1 : 0.45, s === 2 && b % 4 === 3);
	}
	const bar = Math.floor(t / 2);
	if (!inFinalBreak) bass(t + BEAT / 2, BASS_NOTES[bar % 4], BEAT * 0.45);
}

for (let bar = 0; bar < 4; bar++) {
	const t = bar * 2;
	const chord = CHORDS[bar];
	stab(t, chord, 0.16, 1);
	stab(t + 0.75, chord, 0.12, 0.7);
	if (t + 1.5 < DROP - BEAT) stab(t + 1.5, chord, 0.14, 0.8);
}

// Cuts: whoosh into every cut, alternating stereo direction
CUTS.forEach((c, i) => {
	const dir = i % 2 === 0 ? [0.7, -0.7] : [-0.6, 0.6];
	whoosh(c, {pan: dir, amp: c === DROP ? 1.2 : 1, hi: c === DROP ? 7000 : 5200});
});

// 0–1.5s: words focusing in, "performs" snaps
click(1 / 30, 2600, 0.7, -0.2);
click(6 / 30, 2900, 0.7, 0);
whoosh(14 / 30 + 0.04, {pre: 0.1, post: 0.12, lo: 900, hi: 6000, amp: 0.6});
pop(14 / 30 + 0.03, 640, 1.1, 0.15);

// 1.5–3s: objects land
thud(1.5 + 4 / 30 + 0.21, 1, -0.4);
click(1.5 + 4 / 30 + 0.22, 1800, 0.5, -0.4);
thud(1.5 + 10 / 30 + 0.21, 0.8, 0);
chime(1.5 + 10 / 30 + 0.22, 93, 1, 0);
thud(1.5 + 16 / 30 + 0.21, 0.9, 0.4);
click(1.5 + 16 / 30 + 0.22, 2200, 0.6, 0.4);

// 3–5s: hero thumbnail lifts, badge pops
riser(3.0 + 26 / 30, 0.35);
pop(3.0 + 38 / 30 + 0.03, 760, 1.2, 0);
chime(3.0 + 38 / 30 + 0.03, 88, 0.8, 0.2);

// 5–6.5s: thumb scroll swipe
whoosh(5.0 + 19 / 30, {pre: 0.18, post: 0.16, lo: 1500, hi: 7500, amp: 0.45, pan: [0.2, -0.2]});

// 6.5–8s: counter ticks speeding down, tiles pop in
for (let k = 0; k < 22; k++) {
	const x = k / 21;
	const t = 6.5 + 13 / 30 + Math.pow(x, 1.8) * 0.75;
	click(t, 3600 - x * 800, 0.45, 0.1);
}
pop(6.5 + 5 / 30, 700, 0.9, 0); // icon pop
for (let i = 0; i < 6; i++) pop(6.5 + (18 + i * 3) / 30 + 0.02, 480 + i * 70, 0.8, -0.5 + i * 0.2);
riser(7.1, 0.88);

// 8–10s: bass hit, neon buzz, pad tail
impact(DROP);
// Logo: two crescents orbit in from opposite sides and lock at frame 11.
whoosh(DROP + 11 / 30, {pre: 0.3, post: 0.25, lo: 400, hi: 6500, pan: [-0.8, 0.8], amp: 0.8});
whoosh(DROP + 12 / 30, {pre: 0.28, post: 0.25, lo: 500, hi: 7000, pan: [0.8, -0.8], amp: 0.7});
pop(DROP + 11 / 30, 420, 1.1, 0);
// Glow flicker as they lock
buzz(DROP + 12 / 30, 0.03);
buzz(DROP + 14 / 30, 0.02, 0.8);
buzz(DROP + 16 / 30, 0.05, 0.9);
// Wordmark wipe
whoosh(DROP + 22 / 30, {pre: 0.22, post: 0.2, lo: 1200, hi: 8000, pan: [-0.4, 0.4], amp: 0.4});
pad(DROP, [45, 52, 55, 59, 60, 64], LENGTH - DROP);
chime(DROP + 11 / 30, 81, 0.9, -0.3);
chime(DROP + 26 / 30, 88, 0.7, 0.3);

// ---------- Reverb (Schroeder) on the send bus ----------

const reverb = (input, offset) => {
	const out = new Float32Array(N);
	const combs = [1557, 1617, 1491, 1422].map((d) => ({buf: new Float32Array(d + offset), i: 0, store: 0}));
	const aps = [225, 556].map((d) => ({buf: new Float32Array(d), i: 0}));
	for (let n = 0; n < N; n++) {
		let s = 0;
		for (const c of combs) {
			const y = c.buf[c.i];
			c.store = y * 0.6 + c.store * 0.4;
			c.buf[c.i] = input[n] + c.store * 0.82;
			c.i = (c.i + 1) % c.buf.length;
			s += y;
		}
		for (const a of aps) {
			const b = a.buf[a.i];
			const y = -s + b;
			a.buf[a.i] = s + b * 0.5;
			a.i = (a.i + 1) % a.buf.length;
			s = y;
		}
		out[n] = s * 0.18;
	}
	return out;
};
const wetL = reverb(sendL, 0);
const wetR = reverb(sendR, 23);

// ---------- Master: sum, soft clip, normalize, fade ----------

let peak = 0;
for (let i = 0; i < N; i++) {
	L[i] = Math.tanh((L[i] + wetL[i]) * 1.1);
	R[i] = Math.tanh((R[i] + wetR[i]) * 1.1);
	peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak; // about -1 dBFS
const fadeStart = N - SR * 0.25;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
	const fade = i > fadeStart ? (N - i) / (N - fadeStart) : 1;
	pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * fade)) * 32767), i * 4);
	pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * fade)) * 32767), i * 4 + 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio', 'keynote-soundtrack.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`Wrote ${out} (${LENGTH}s, ${SR} Hz stereo)`);
