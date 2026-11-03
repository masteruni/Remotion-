import {CalculateMetadataFunction, staticFile} from 'remotion';
import {z} from 'zod';

/** The edit plan written by scripts/reel/prepare.py into public/reels/<slug>/job.json. */
export type ReelJob = {
	slug: string;
	url: string;
	src: string;
	width: number;
	height: number;
	duration: number;
	/** The picture inside a letterboxed / templated source, in source pixels. */
	crop: {x: number; y: number; w: number; h: number} | null;
	brand: {name: string; handle: string; avatar: string; avatarBg?: string; verified: boolean};
	headline: string;
	showSubtitles: boolean;
	/** Times are milliseconds in the source clip. */
	subtitles: {text: string; startMs: number; endMs: number}[];
	/** Seconds of the source clip to use. */
	trim: {start: number; end: number};
	/** Hard zoom steps (source seconds). x/y = zoom centre, 0..1 of the picture. */
	punchIns: {at: number; scale: number; x?: number; y?: number}[];
	/** White flash cuts (source seconds). */
	flashes: number[];
	/** Slow push-in for the payoff (source seconds). */
	reveal: {at: number; scale: number; x?: number; y?: number} | null;
	/** Meme / reaction cut-ins that replace the picture (src inside public/). */
	inserts: {at: number; duration: number; src: string; audio?: boolean; volume?: number}[];
	thumbnail: {time: number; text: string; highlight: string[]};
	caption: string;
};

export const reelSchema = z.object({
	/** Path inside public/, e.g. "reels/DfBgrJXTT0b/job.json". Empty = latest prepared reel. */
	job: z.string(),
});

export type ReelProps = z.infer<typeof reelSchema> & {data?: ReelJob | null};

export const REEL_FPS = 30;

const loadJob = async (job: string): Promise<ReelJob | null> => {
	try {
		let path = job;
		if (!path) {
			const latest = await fetch(staticFile('reels/latest.json'));
			if (!latest.ok) return null;
			path = ((await latest.json()) as {job: string}).job;
		}
		const res = await fetch(staticFile(path));
		if (!res.ok) return null;
		return (await res.json()) as ReelJob;
	} catch {
		return null;
	}
};

export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = async ({props}) => {
	const data = await loadJob(props.job);
	const seconds = data ? data.trim.end - data.trim.start : 5;
	return {
		durationInFrames: Math.max(1, Math.round(seconds * REEL_FPS)),
		props: {...props, data},
	};
};

export const calculateThumbnailMetadata: CalculateMetadataFunction<ReelProps> = async ({props}) => {
	const data = await loadJob(props.job);
	return {durationInFrames: 1, props: {...props, data}};
};
