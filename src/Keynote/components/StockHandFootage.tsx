import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import track from '../../../public/footage/hand/track.json';
import {FONT} from '../theme';
import {DirectionalBlur} from './DirectionalBlur';
import {Bokeh} from './HandScrollFootage';
import {Video} from '@remotion/media';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FRAME_COUNT = track.matrices.length;

const Icon: React.FC<{d: string}> = ({d}) => (
	<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'}}>
		<path d={d} />
	</svg>
);

/** One vertical clip in the phone, with a minimal short-form app overlay. */
const ScreenClip: React.FC<{src: string; caption: string}> = ({src, caption}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{position: 'relative', width: track.screenW, height: track.screenH, overflow: 'hidden', background: '#000'}}>
			<Video src={staticFile(src)} muted objectFit="cover" style={{width: '100%', height: '100%'}} />
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.55) 100%)'}} />
			<div style={{position: 'absolute', right: 12, bottom: 110, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>
				<Icon d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
				<Icon d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z" />
				<Icon d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
			</div>
			<div style={{position: 'absolute', left: 14, right: 60, bottom: 28, color: '#fff', fontFamily: FONT, textShadow: '0 1px 4px rgba(0,0,0,0.45)'}}>
				<div style={{fontWeight: 700, fontSize: 15}}>@leilunastudio</div>
				<div style={{fontWeight: 500, fontSize: 13, marginTop: 4, opacity: 0.92}}>{caption}</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.3)'}}>
				<div style={{height: '100%', width: `${20 + frame * 1.2}%`, background: '#fff'}} />
			</div>
		</div>
	);
};

/**
 * Real hand + phone (Mixkit #42636, Stock Video Free License), keyed by
 * scripts/prepare-hand-footage.py. The vertical video is placed in the screen
 * with the per-frame tracking matrix, behind the keyed hand layer.
 * Designed at 1200x675.
 */
export const StockHandFootage: React.FC = () => {
	const frame = useCurrentFrame();
	const i = Math.min(FRAME_COUNT - 1, Math.max(0, frame));
	const src = staticFile(`footage/hand/${String(i).padStart(3, '0')}.webp`);
	const matrix = `matrix3d(${track.matrices[i].join(',')})`;
	const scroll = interpolate(frame, [12, 24], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const velocity = interpolate(frame, [12, 18, 24], [0, 1, 0], clamp);
	// Slightly overscanned so the arm runs off the left edge of the card.
	const footageScale = (675 / track.height) * 1.12;

	return (
		<AbsoluteFill
			style={{
				background:
					'linear-gradient(120deg, #2A1810 0%, #6B3D22 30%, #C07A45 58%, #F3C48C 82%, #FFE6C2 100%)',
				overflow: 'hidden',
			}}
		>
			<Bokeh />
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 50% 70% at 88% 18%, rgba(255,236,200,0.75), rgba(255,236,200,0) 70%)',
					mixBlendMode: 'screen',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: -40,
					top: -30,
					width: track.width,
					height: track.height,
					scale: String(footageScale),
					transformOrigin: '0 0',
				}}
			>
				{/* screen content, tracked to the phone */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: track.screenW,
						height: track.screenH,
						transformOrigin: '0 0',
						transform: matrix,
						overflow: 'hidden',
						background: '#000',
					}}
				>
					<DirectionalBlur x={0} y={velocity * 10}>
						<div style={{translate: `0px ${-scroll * track.screenH}px`}}>
							<ScreenClip src="footage/screen/cappuccino.mp4" caption="Slow mornings, done right." />
							<ScreenClip src="footage/screen/sunset.mp4" caption="Golden hour, 30 seconds." />
						</div>
					</DirectionalBlur>
				</div>
				{/* keyed hand + phone, warm graded */}
				<Img
					src={src}
					style={{
						position: 'absolute',
						inset: 0,
						width: track.width,
						height: track.height,
						filter: 'sepia(0.22) saturate(1.15) brightness(1.04) contrast(1.04) drop-shadow(0 30px 40px rgba(60,25,10,0.45))',
					}}
				/>
			</div>
			{/* window light wrapping over the hand */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 60% 80% at 85% 10%, rgba(255,214,160,0.35), rgba(255,214,160,0) 65%)',
					mixBlendMode: 'soft-light',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 80% 80% at 55% 50%, rgba(0,0,0,0) 50%, rgba(30,10,0,0.45) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
