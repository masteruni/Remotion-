import type {Cue} from '../Keynote/Sfx';
import {L1, L2} from './scenes/KineticScene';
import {SHOTS} from './theme';

const S2 = SHOTS.formats;
const S3 = S2 + SHOTS.services;
const S4 = S3 + SHOTS.contact;
const S5 = S4 + SHOTS.kinetic; // 285 = 9.5s, the hit

export const PROMO_CUES: Cue[] = [
	// Formats: chip highlight hops, cards land
	{file: 'ui-tick', at: 22, peak: 0.08, volume: 0.3},
	{file: 'whoosh-pointer', at: 24, peak: 0.31, volume: 0.2},
	{file: 'ui-tick', at: 42, peak: 0.08, volume: 0.3},
	{file: 'whoosh-pointer', at: 44, peak: 0.31, volume: 0.2},
	{file: 'pop-multi', at: 10, peak: 0.03, volume: 0.2},
	// Cuts
	{file: 'swoosh', at: S2, peak: 0.29, volume: 0.45},
	{file: 'whoosh-fast', at: S3, peak: 0.56, volume: 0.45},
	{file: 'swoosh', at: S4, peak: 0.29, volume: 0.45},
	// Services: rows tick in, first row opens, result pills pop
	...[0, 1, 2, 3, 4].map((i) => ({file: 'ui-tick', at: S2 + 6 + i * 4, peak: 0.08, volume: 0.18})),
	{file: 'pop-ui-2', at: S2 + 30, peak: 0.03, volume: 0.35},
	...[0, 1, 2].map((k) => ({file: 'pop-multi', at: S2 + 38 + k * 4, peak: 0.03, volume: 0.25})),
	// Contact: typing, send
	{file: 'ui-tick-roll', at: S3 + 3, peak: 0, volume: 0.3},
	{file: 'pop-bubble', at: S3 + 29, peak: 0.12, volume: 0.45},
	{file: 'whoosh-pointer', at: S3 + 33, peak: 0.31, volume: 0.35},
	// Kinetic lines
	{file: 'pop-multi', at: S4 + 13, peak: 0.03, volume: 0.22},
	{file: 'pop-multi', at: S4 + 16, peak: 0.03, volume: 0.22},
	{file: 'pop-multi', at: S4 + 19, peak: 0.03, volume: 0.22},
	{file: 'swoosh', at: S4 + L1, peak: 0.29, volume: 0.25},
	{file: 'swoosh', at: S4 + L1 + L2, peak: 0.29, volume: 0.22},
	// Logo: riser into the hit, twinkle as the wordmark wipes, ping for the URL
	{file: 'riser-impact', at: S5, peak: 2.66, volume: 0.5},
	{file: 'magic-twinkle', at: S5 + 20, peak: 0.16, volume: 0.5},
	{file: 'notification', at: S5 + 40, peak: 0.07, volume: 0.35},
];
