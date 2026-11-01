import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {NavyBackdrop, Vignette} from '../components/Backdrops';
import {Shot} from '../components/Shot';
import {FONT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Source art is 563px wide; the crescents layer is 563x479 and the wordmark
// sits under it, as in the supplied lockup.
const ART_W = 563;
const CRESCENT_H = 479;
const PIVOT = '285px 245px'; // shared centre the two moons orbit around
const BRAND_PINK = '255,113,153';

// Glow flicker as the moons lock, one value per frame from LOCK.
const LOCK = 11;
const FLICKER = [1.8, 0.5, 1.5, 0.3, 1.2, 1.1, 0.6, 1.3, 1];

/** Rotation of a crescent at a (fractional) frame. */
const useOrbit = (from: number, delay: number) => {
	const {fps} = useVideoConfig();
	return (f: number) =>
		interpolate(
			spring({frame: f - delay, fps, config: {damping: 15, stiffness: 140, mass: 0.7}}),
			[0, 1],
			[from, 0],
		);
};

/** One crescent with true rotational motion blur: shutter samples summed with plus-lighter. */
const Crescent: React.FC<{src: string; from: number; delay: number}> = ({src, from, delay}) => {
	const frame = useCurrentFrame();
	const rot = useOrbit(from, delay);
	const SAMPLES = 6;
	const SHUTTER = 0.6;
	const opacity = interpolate(frame, [delay, delay + 4], [0, 1], clamp);
	return (
		<div style={{position: 'absolute', inset: 0, opacity}}>
			{new Array(SAMPLES).fill(0).map((_, k) => {
				const t = frame - (k / (SAMPLES - 1)) * SHUTTER;
				return (
					<Img
						key={k}
						src={src}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: ART_W,
							height: CRESCENT_H,
							transformOrigin: PIVOT,
							rotate: `${rot(t)}deg`,
							scale: String(1 - 0.3 * (rot(t) / from)),
							opacity: 1 / SAMPLES,
							mixBlendMode: 'plus-lighter',
						}}
					/>
				);
			})}
		</div>
	);
};

const Moons: React.FC = () => {
	const frame = useCurrentFrame();
	const glow =
		frame < LOCK
			? interpolate(frame, [0, LOCK], [0.3, 1], clamp)
			: frame < LOCK + FLICKER.length
				? FLICKER[frame - LOCK]
				: 1;
	return (
		<div
			style={{
				position: 'relative',
				width: ART_W,
				height: CRESCENT_H,
				filter: `drop-shadow(0 0 ${18 * glow}px rgba(${BRAND_PINK},${0.55 * glow})) drop-shadow(0 0 ${60 * glow}px rgba(${BRAND_PINK},${0.35 * glow}))`,
			}}
		>
			<Crescent src={staticFile('brand/crescent-white.png')} from={-160} delay={0} />
			<Crescent src={staticFile('brand/crescent-pink.png')} from={150} delay={2} />
		</div>
	);
};

const Wordmark: React.FC = () => {
	const frame = useCurrentFrame();
	const wipe = interpolate(frame, [15, 29], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const studio = interpolate(frame, [24, 38], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const mask = `linear-gradient(90deg, black ${wipe * 130 - 30}%, transparent ${wipe * 130}%)`;
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 22}}>
			<Img
				src={staticFile('brand/wordmark-leiluna.png')}
				style={{
					width: ART_W,
					maskImage: mask,
					WebkitMaskImage: mask,
					filter: `blur(${(1 - wipe) * 10}px)`,
					translate: `0px ${(1 - wipe) * 18}px`,
				}}
			/>
			<Img
				src={staticFile('brand/wordmark-studio.png')}
				style={{
					width: ART_W,
					opacity: studio,
					scale: `${interpolate(studio, [0, 1], [1.25, 1])} 1`,
					filter: `blur(${(1 - studio) * 8}px)`,
				}}
			/>
		</div>
	);
};

const Lockup: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				scale: String(
					interpolate(frame, [0, 60], [0.78, 0.83], {...clamp, easing: Easing.out(Easing.quad)}),
				),
			}}
		>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Moons />
				<Wordmark />
				<div
					style={{
						marginTop: 44,
						fontFamily: FONT,
						fontWeight: 500,
						fontSize: 34,
						letterSpacing: interpolate(frame, [34, 52], [0.5, 0.32], clamp) + 'em',
						marginRight: '-0.32em',
						color: '#C9CDD6',
						opacity: interpolate(frame, [34, 46], [0, 1], clamp),
						translate: `0px ${interpolate(frame, [34, 48], [12, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px`,
					}}
				>
					Video · Design · Strategy
				</div>
			</div>
		</AbsoluteFill>
	);
};

const PinkAmbience: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 40% 45% at 50% 38%, rgba(${BRAND_PINK},0.22), rgba(${BRAND_PINK},0) 70%)`,
				opacity: interpolate(frame, [0, LOCK, LOCK + 10], [0, 1, 0.7], clamp),
			}}
		/>
	);
};

export const LogoScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
	<Shot
		durationInFrames={durationInFrames}
		enter="zoom"
		background={
			<>
				<NavyBackdrop />
				<PinkAmbience />
				<Vignette strength={0.5} />
			</>
		}
	>
		<Lockup />
	</Shot>
);
