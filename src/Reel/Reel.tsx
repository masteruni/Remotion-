import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {SfxTrack, type Cue} from '../Keynote/Sfx';
import {FONT} from '../Keynote/theme';
import {REEL_FPS, type ReelJob, type ReelProps} from './job';

/**
 * "Tweet card" repost edit: black 9:16 frame, account header + hook line,
 * the clip in the middle with phrase subtitles, hard punch-in zooms,
 * white flash cuts and a slow push-in on the payoff.
 */

const W = 1080;
const H = 1920;
const PAD = 64;
const HEADER_H = 250; // avatar row + headline (2 lines max)
const MAX_CLIP_H = 1350; // 4:5 cap for portrait sources

export const clipBox = (job: ReelJob) => {
	const c = job.crop ?? {x: 0, y: 0, w: job.width, h: job.height};
	const clipH = Math.min(MAX_CLIP_H, Math.round((W * c.h) / c.w));
	const block = HEADER_H + clipH;
	// a little above centre: the bottom of a reel is covered by Instagram's UI
	const top = Math.max(120, Math.round((H - block) / 2 - 60));
	return {crop: c, clipH, headerTop: top, clipTop: top + HEADER_H};
};

export const Verified: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path
			fill="#1D9BF0"
			d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"
		/>
		<path fill="#fff" d="M10.54 16.7 6.8 12.96l1.42-1.41 2.32 2.32 5.24-5.24 1.42 1.42z" />
	</svg>
);

export const Header: React.FC<{job: ReelJob; top: number}> = ({job, top}) => {
	const {brand} = job;
	return (
		<div style={{position: 'absolute', top, left: PAD, right: PAD, fontFamily: FONT, color: '#fff'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
				<div
					style={{
						width: 96,
						height: 96,
						borderRadius: 48,
						background: brand.avatarBg ?? '#111',
						border: '2px solid rgba(255,255,255,0.12)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
					}}
				>
					<Img src={staticFile(brand.avatar)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</div>
				<div>
					<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 42, fontWeight: 700}}>
						{brand.name}
						{brand.verified ? <Verified size={40} /> : null}
					</div>
					<div style={{fontSize: 30, color: '#8B8D9A', marginTop: 2}}>{brand.handle}</div>
				</div>
			</div>
			<div style={{marginTop: 26, fontSize: 46, lineHeight: 1.22, fontWeight: 500, letterSpacing: -0.3}}>
				{job.headline}
			</div>
		</div>
	);
};

/** Zoom at source time t: last punch-in step, then an eased push on the reveal. */
const zoomAt = (job: ReelJob, t: number) => {
	// Burned-in captions (our subtitles off) sit at the top: zoom from the top edge so they stay in frame.
	const defaultY = job.showSubtitles ? 0.45 : 0;
	let z = {scale: 1, x: 0.5, y: defaultY};
	for (const p of job.punchIns) {
		if (p.at <= t) z = {scale: p.scale, x: p.x ?? 0.5, y: p.y ?? defaultY};
	}
	const r = job.reveal;
	if (r && t >= r.at) {
		const k = interpolate(t, [r.at, r.at + 1.4], [0, 1], {
			extrapolateRight: 'clamp',
			easing: Easing.bezier(0.2, 0.8, 0.2, 1),
		});
		const drift = Math.max(0, t - r.at - 1.4) * 0.02; // keeps it alive after the push
		z = {scale: 1.12 + (r.scale - 1.12) * k + drift, x: r.x ?? 0.5, y: r.y ?? 0.45};
	}
	return z;
};

const Clip: React.FC<{job: ReelJob; top: number; height: number}> = ({job, top, height}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = job.trim.start + frame / fps;
	const {crop} = clipBox(job);
	// size the full source so the crop rectangle exactly covers the box
	const s = Math.max(W / crop.w, height / crop.h);
	const vw = job.width * s;
	const vh = job.height * s;
	const offX = -crop.x * s + (W - crop.w * s) / 2;
	const offY = -crop.y * s + (height - crop.h * s) / 2;
	const z = zoomAt(job, t);

	const flash = job.flashes.reduce((acc, f) => {
		const d = (t - f) * fps;
		return d >= -1 && d < 9 ? Math.max(acc, interpolate(d, [-1, 0, 9], [0.4, 0.92, 0])) : acc;
	}, 0);

	const insert = job.inserts.find((i) => t >= i.at && t < i.at + i.duration);

	return (
		<div style={{position: 'absolute', top, left: 0, width: W, height, overflow: 'hidden', background: '#000'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: `scale(${z.scale})`,
					transformOrigin: `${z.x * 100}% ${z.y * 100}%`,
				}}
			>
				<OffthreadVideo
					src={staticFile(job.src)}
					trimBefore={Math.round(job.trim.start * fps)}
					style={{position: 'absolute', left: offX, top: offY, width: vw, height: vh, maxWidth: 'none'}}
				/>
			</div>
			{job.inserts.map((ins, i) => (
				<Sequence
					key={i}
					from={Math.round((ins.at - job.trim.start) * fps)}
					durationInFrames={Math.round(ins.duration * fps)}
					layout="none"
					name={`insert ${ins.src}`}
				>
					{/\.(png|jpe?g|webp|gif)$/i.test(ins.src) ? (
						<Img src={staticFile(ins.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
					) : (
						<OffthreadVideo
							src={staticFile(ins.src)}
							muted={!ins.audio}
							volume={ins.volume ?? 1}
							style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
						/>
					)}
				</Sequence>
			))}
			{job.showSubtitles && !insert ? <Subtitles job={job} t={t} /> : null}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</div>
	);
};

const Subtitles: React.FC<{job: ReelJob; t: number}> = ({job, t}) => {
	const {fps} = useVideoConfig();
	const ms = t * 1000;
	const page = job.subtitles.find((p) => ms >= p.startMs && ms < p.endMs);
	if (!page) return null;
	const age = Math.round(((ms - page.startMs) / 1000) * fps);
	const pop = spring({frame: age, fps, config: {damping: 14, stiffness: 260}, durationInFrames: 6});
	return (
		<div
			style={{
				position: 'absolute',
				top: 26,
				left: 40,
				right: 40,
				textAlign: 'center',
				fontFamily: FONT,
				fontWeight: 800,
				fontSize: 54,
				lineHeight: 1.12,
				color: '#fff',
				WebkitTextStroke: '9px #000',
				paintOrder: 'stroke fill',
				textShadow: '0 4px 14px rgba(0,0,0,0.55)',
				transform: `scale(${0.9 + 0.1 * pop})`,
				transformOrigin: '50% 0%',
			}}
		>
			{page.text}
		</div>
	);
};

export const Placeholder: React.FC = () => (
	<AbsoluteFill
		style={{
			background: '#000',
			color: '#fff',
			fontFamily: FONT,
			fontSize: 44,
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			padding: 80,
		}}
	>
		No reel prepared yet. Run:
		<br />
		<code style={{color: '#FF7199', marginTop: 24}}>npm run reel -- &lt;instagram link&gt;</code>
	</AbsoluteFill>
);

export const Reel: React.FC<ReelProps> = ({data}) => {
	if (!data) return <Placeholder />;
	const {clipH, headerTop, clipTop} = clipBox(data);
	const toFrame = (s: number) => Math.round((s - data.trim.start) * REEL_FPS);
	const cues: Cue[] = [
		...data.flashes
			.filter((f) => f !== data.reveal?.at)
			.map((f) => ({file: 'whoosh-fast', at: toFrame(f), peak: 0.56, volume: 0.3})),
		...(data.reveal ? [{file: 'riser-impact', at: toFrame(data.reveal.at), peak: 2.66, volume: 0.35}] : []),
	].filter((c) => c.at >= 0);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Header job={data} top={headerTop} />
			<Clip job={data} top={clipTop} height={clipH} />
			<SfxTrack cues={cues} />
		</AbsoluteFill>
	);
};
