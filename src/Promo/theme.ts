export {FONT} from '../Keynote/theme';

export const PINK = '#FF7199';
export const PINK_RGB = '255,113,153';

export const P = {
	bg: '#07080F',
	panel: '#12131C',
	panelHi: '#1B1C27',
	line: 'rgba(255,255,255,0.08)',
	text: '#F4F4F7',
	muted: '#8B8D9A',
};

// Scene lengths in frames at 30fps (total 12s). The logo hit lands at 285 (9.5s), on the beat.
export const SHOTS = {
	formats: 66,
	services: 72,
	contact: 42,
	kinetic: 105,
	logo: 75,
} as const;
