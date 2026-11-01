import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DirectionalBlur} from '../Keynote/components/DirectionalBlur';
import {P, PINK_RGB} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Near-black stage with a soft pink floor glow, like a lit product set. */
export const Stage: React.FC<{glow?: number}> = ({glow = 1}) => (
	<AbsoluteFill style={{background: P.bg}}>
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 70% 38% at 50% 100%, rgba(${PINK_RGB},${0.2 * glow}), rgba(${PINK_RGB},0) 70%)`,
			}}
		/>
		<AbsoluteFill
			style={{
				background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(40,44,70,0.35), rgba(0,0,0,0) 70%)',
			}}
		/>
	</AbsoluteFill>
);

/**
 * Camera-style transition for a shot: rack-focus in (blur + slight push) and
 * blur out with a directional smear along `exitDir`.
 */
export const ShotBlur: React.FC<{
	duration: number;
	exitDir?: 'up' | 'left' | 'none';
	children: React.ReactNode;
}> = ({duration, exitDir = 'up', children}) => {
	const frame = useCurrentFrame();
	const enter = interpolate(frame, [0, 8], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	const exit = interpolate(frame, [duration - 6, duration - 1], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const ex = exitDir === 'left' ? -1 : 0;
	const ey = exitDir === 'up' ? -1 : 0;
	return (
		<DirectionalBlur
			x={enter * 10 + exit * 40 * Math.abs(ex)}
			y={enter * 10 + exit * 40 * Math.abs(ey)}
			style={{
				opacity: 1 - exit * 0.9 - enter * 0.6,
				scale: String(1 + enter * 0.06),
				translate: `${ex * exit * 260}px ${ey * exit * 360}px`,
			}}
		>
			{children}
		</DirectionalBlur>
	);
};

/** The Leiluna crescents, from the supplied logo. Source art is 563x479. */
export const Crescents: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => {
	const width = (height * 563) / 479;
	return (
		<div style={{position: 'relative', width, height, flexShrink: 0, ...style}}>
			{['crescent-white', 'crescent-pink'].map((n) => (
				<Img key={n} src={staticFile(`brand/${n}.png`)} style={{position: 'absolute', inset: 0, width, height}} />
			))}
		</div>
	);
};
