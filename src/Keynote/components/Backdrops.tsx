import React from 'react';
import {AbsoluteFill} from 'remotion';

export const LightBackdrop: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse 75% 70% at 50% 45%, #F8F8F9 0%, #ECECEE 55%, #D6D6DA 100%)',
		}}
	/>
);

export const CharcoalBackdrop: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse 80% 70% at 50% 50%, #24262B 0%, #141518 60%, #0A0A0C 100%)',
		}}
	/>
);

export const NavyBackdrop: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse 70% 65% at 50% 48%, #1A2556 0%, #0C1434 55%, #050816 100%)',
		}}
	/>
);

/** Shallow depth-of-field: blurs the top and bottom bands of whatever is behind it. */
export const TiltShift: React.FC<{amount?: number; band?: number}> = ({
	amount = 6,
	band = 26,
}) => {
	const mask = `linear-gradient(to bottom, black 0%, transparent ${band}%, transparent ${100 - band}%, black 100%)`;
	return (
		<AbsoluteFill
			style={{
				backdropFilter: `blur(${amount}px)`,
				WebkitBackdropFilter: `blur(${amount}px)`,
				maskImage: mask,
				WebkitMaskImage: mask,
				pointerEvents: 'none',
			}}
		/>
	);
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.35}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);
