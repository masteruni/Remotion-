import React from 'react';
import {Img, staticFile} from 'remotion';
import {FONT} from '../theme';

/** Frames from royalty-free Mixkit clips (see public/footage/CREDITS.md), 360x640. */
const CLIPS = ['10419', '2168', '4064', '4149', '41858', '43063', '4308', '44001', '4416', '44370', '44818', '4881', '4985', '50566', '51500', '51689'];
export const THUMBS = CLIPS.flatMap((id) => [`${id}-a`, `${id}-b`]);

export const thumbSrc = (name: string) => staticFile(`thumbs/${name}.webp`);

const VIEWS = ['1.2M', '842K', '3.4M', '518K', '2.1M', '96K', '4.8M', '730K', '1.7M', '260K', '61K', '1.1M'];
const TIMES = ['0:15', '0:32', '0:09', '0:58', '0:21', '0:44', '0:12', '0:27'];

/** Deterministic pseudo-random from an integer seed. */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

/** A short-form video thumbnail (9:16) with a real frame. */
export const Thumbnail: React.FC<{
	seed: number;
	width: number;
	image?: string;
	views?: string;
	style?: React.CSSProperties;
}> = ({seed, width, image, views, style}) => {
	// Stride through the list so neighbouring cells don't share a clip.
	const name = image ?? THUMBS[(seed * 11) % THUMBS.length];
	const height = (width * 16) / 9;
	const u = width / 220;
	return (
		<div
			style={{
				position: 'relative',
				width,
				height,
				borderRadius: 18 * u,
				overflow: 'hidden',
				background: '#222',
				boxShadow: `0 ${18 * u}px ${40 * u}px rgba(0,0,0,0.45)`,
				...style,
			}}
		>
			<Img
				src={thumbSrc(name)}
				style={{width: '100%', height: '100%', objectFit: 'cover', transform: rand(seed) > 0.5 ? 'scaleX(-1)' : undefined}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(to bottom, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 12 * u,
					right: 12 * u,
					padding: `${3 * u}px ${9 * u}px`,
					borderRadius: 99,
					background: 'rgba(0,0,0,0.38)',
					color: '#fff',
					fontFamily: FONT,
					fontWeight: 600,
					fontSize: 14 * u,
				}}
			>
				{TIMES[seed % TIMES.length]}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 14 * u,
					bottom: 14 * u,
					display: 'flex',
					alignItems: 'center',
					gap: 6 * u,
					color: '#fff',
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 17 * u,
					textShadow: '0 1px 6px rgba(0,0,0,0.4)',
				}}
			>
				<svg width={13 * u} height={13 * u} viewBox="0 0 10 10">
					<path d="M2 1 L9 5 L2 9Z" fill="#fff" />
				</svg>
				{views ?? VIEWS[seed % VIEWS.length]}
			</div>
		</div>
	);
};
