import {loadFont} from '@remotion/google-fonts/Inter';

const normal = loadFont('normal', {
	weights: ['400', '500', '600', '700', '800'],
	subsets: ['latin'],
});
loadFont('italic', {weights: ['800', '900'], subsets: ['latin']});

export const FONT = normal.fontFamily;

export const COLORS = {
	coral: '#FF5A4E',
	coralSoft: '#FF7A6E',
	ink: '#0B0B0D',
	paleGray: '#ECECEE',
	charcoal: '#131417',
	navy: '#0A1230',
	muted: '#8A8D96',
};

// Scene lengths in seconds. Keep the total at 10s.
export const SCENES = {
	title: 1.5,
	objects: 1.5,
	wall: 2,
	card: 1.5,
	profile: 1.5,
	logo: 2,
} as const;

export const TOTAL_SECONDS = Object.values(SCENES).reduce((a, b) => a + b, 0);
