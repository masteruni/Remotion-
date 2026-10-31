import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {LightBackdrop, Vignette} from '../components/Backdrops';
import {HandScrollFootage} from '../components/HandScrollFootage';
import {Shot} from '../components/Shot';

const CARD_W = 1200;
const CARD_H = 675;

const FloatingCard: React.FC<{footageSrc: string}> = ({footageSrc}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 16, stiffness: 110, mass: 0.9}});
	const sheen = interpolate(frame, [8, 40], [-60, 160], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{perspective: 1800, justifyContent: 'center', alignItems: 'center'}}>
			{/* contact shadow */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					width: CARD_W * 0.9,
					height: 90,
					translate: `-50% ${CARD_H / 2 + 20}px`,
					borderRadius: '50%',
					background: 'rgba(20,20,30,0.35)',
					filter: `blur(${interpolate(s, [0, 1], [70, 40])}px)`,
					opacity: interpolate(s, [0, 1], [0.2, 0.9]),
				}}
			/>
			<div
				style={{
					width: CARD_W,
					height: CARD_H,
					borderRadius: 44,
					overflow: 'hidden',
					position: 'relative',
					translate: `0px ${interpolate(s, [0, 1], [320, 0])}px`,
					rotate: `${interpolate(s, [0, 1], [5, 0])}deg`,
					transform: `rotateX(${interpolate(s, [0, 1], [24, 3])}deg) rotateY(${interpolate(s, [0, 1], [-30, -6]) + frame * 0.08}deg)`,
					boxShadow: '0 50px 120px rgba(20,20,35,0.35), 0 12px 30px rgba(20,20,35,0.2)',
				}}
			>
				{footageSrc ? (
					<Video
						src={staticFile(footageSrc)}
						muted
						objectFit="cover"
						style={{width: '100%', height: '100%'}}
					/>
				) : (
					<HandScrollFootage />
				)}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `linear-gradient(110deg, rgba(255,255,255,0) ${sheen - 20}%, rgba(255,255,255,0.22) ${sheen}%, rgba(255,255,255,0) ${sheen + 20}%)`,
						borderRadius: 44,
						boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const CardScene: React.FC<{durationInFrames: number; footageSrc: string}> = ({
	durationInFrames,
	footageSrc,
}) => (
	<Shot
		durationInFrames={durationInFrames}
		enter="left"
		exit="up"
		background={
			<>
				<LightBackdrop />
				<Vignette strength={0.2} />
			</>
		}
	>
		<FloatingCard footageSrc={footageSrc} />
	</Shot>
);
