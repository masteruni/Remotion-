import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {NavyBackdrop, Vignette} from '../components/Backdrops';
import {Shot} from '../components/Shot';
import {FONT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Neon tube flicker, one value per frame, then steady.
const FLICKER = [0, 0.9, 0.15, 1, 0.05, 0, 0.8, 0.4, 1, 1, 0.7, 1, 1, 0.92, 1];

const NeonText: React.FC = () => {
	const frame = useCurrentFrame();
	const on = frame < FLICKER.length ? FLICKER[frame] : 1;
	const aberration = interpolate(frame, [0, 22], [14, 1.6], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	});
	const bloom = interpolate(frame, [0, 10, 30], [1.6, 1.25, 1], clamp);

	const base: React.CSSProperties = {
		fontFamily: FONT,
		fontStyle: 'italic',
		fontWeight: 800,
		fontSize: 128,
		letterSpacing: '-0.035em',
		whiteSpace: 'nowrap',
		lineHeight: 1,
		paddingRight: '0.08em',
	};

	return (
		<div style={{position: 'relative', opacity: on}}>
			{/* chromatic aberration fringes */}
			<div style={{...base, position: 'absolute', inset: 0, color: 'rgba(255,40,80,0.75)', translate: `${-aberration}px 0px`, mixBlendMode: 'screen'}}>
				Leiluna Studio
			</div>
			<div style={{...base, position: 'absolute', inset: 0, color: 'rgba(40,220,255,0.6)', translate: `${aberration}px 0px`, mixBlendMode: 'screen'}}>
				Leiluna Studio
			</div>
			{/* tube core + bloom */}
			<div
				style={{
					...base,
					position: 'relative',
					color: '#FFE3DC',
					textShadow: [
						`0 0 ${6 * bloom}px #FF9C8F`,
						`0 0 ${18 * bloom}px #FF6F61`,
						`0 0 ${42 * bloom}px rgba(255,90,78,0.9)`,
						`0 0 ${90 * bloom}px rgba(255,90,78,0.6)`,
						`0 0 ${160 * bloom}px rgba(255,90,78,0.35)`,
					].join(', '),
				}}
			>
				Leiluna Studio
			</div>
		</div>
	);
};

const Flare: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: 1700,
				height: 6,
				translate: '-50% -60px',
				borderRadius: 99,
				background:
					'linear-gradient(90deg, rgba(255,110,97,0), rgba(255,140,128,0.9) 50%, rgba(255,110,97,0))',
				filter: 'blur(3px)',
				opacity: interpolate(frame, [0, 4, 30], [0, 0.9, 0.18], clamp),
			}}
		/>
	);
};

const Lockup: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				scale: String(interpolate(frame, [0, 60], [1, 1.08], {...clamp, easing: Easing.out(Easing.quad)})),
			}}
		>
			<Flare />
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
				<NeonText />
				<div
					style={{
						fontFamily: FONT,
						fontWeight: 500,
						fontSize: 28,
						letterSpacing: interpolate(frame, [18, 40], [0.5, 0.32], clamp) + 'em',
						color: '#C9CDD6',
						opacity: interpolate(frame, [18, 32], [0, 1], clamp),
						translate: `0px ${interpolate(frame, [18, 34], [12, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px`,
						marginRight: '-0.32em',
					}}
				>
					Video · Design · Strategy
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const LogoScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
	<Shot
		durationInFrames={durationInFrames}
		enter="zoom"
		background={
			<>
				<NavyBackdrop />
				<Vignette strength={0.5} />
			</>
		}
	>
		<Lockup />
	</Shot>
);
