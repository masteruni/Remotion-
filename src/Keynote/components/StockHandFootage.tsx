import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import track from '../../../public/footage/hand/track.json';
import {COLORS} from '../theme';
import {DirectionalBlur} from './DirectionalBlur';
import {Bokeh, FeedVideo} from './HandScrollFootage';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FRAME_COUNT = track.matrices.length;

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
							<FeedVideo colors={[COLORS.coral, '#FFB35C', '#FFF1D6']} seed={1} width={track.screenW} height={track.screenH} />
							<FeedVideo colors={['#6A5BFF', '#00C2C7', '#E8FFFC']} seed={4} width={track.screenW} height={track.screenH} />
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
