import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crescents, ShotBlur, Stage} from '../components';
import {FONT, P, PINK, PINK_RGB, SHOTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// "Services, five orbits" from leilunastudio.com
const SERVICES = [
	{title: 'Social Media Management', sub: 'Plan · Film · Edit · Post'},
	{title: 'Content Creation & Production', sub: 'Reels, ads, photo'},
	{title: 'AI-Powered Content Generation', sub: 'Visuals at scale'},
	{title: 'AI Automation & Workflows', sub: 'Less busywork'},
	{title: 'Content Strategy & Growth', sub: 'Hooks, data, cadence'},
];

// "Numbers that travel." from the site
const RESULTS = ['29M+ views', '9M on one reel', '306K followers'];

const EXPAND_AT = 30;

const Chevron: React.FC<{open: number}> = ({open}) => (
	<svg width={30} height={30} viewBox="0 0 24 24" style={{rotate: `${open * 180}deg`}}>
		<path d="M6 9l6 6 6-6" fill="none" stroke={P.muted} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const OrbitIcon: React.FC<{n: number; active: number}> = ({n, active}) => (
	<div style={{position: 'relative', width: 84, height: 84, flexShrink: 0}}>
		<div
			style={{
				width: 84,
				height: 84,
				borderRadius: '50%',
				background: 'radial-gradient(circle at 40% 35%, #1E2140, #0B0D1C)',
				border: `2px solid rgba(${PINK_RGB},${0.35 + active * 0.5})`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: FONT,
				fontWeight: 700,
				fontSize: 26,
				color: P.text,
			}}
		>
			{n === 0 ? <Crescents height={40} /> : `0${n + 1}`}
		</div>
		<div
			style={{
				position: 'absolute',
				right: 2,
				bottom: 2,
				width: 20,
				height: 20,
				borderRadius: '50%',
				background: PINK,
				border: `4px solid ${P.bg}`,
				boxShadow: `0 0 12px rgba(${PINK_RGB},0.8)`,
			}}
		/>
	</div>
);

const Row: React.FC<{i: number}> = ({i}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - 4 - i * 4, fps, config: {damping: 18, stiffness: 150}});
	const open = i === 0 ? spring({frame: frame - EXPAND_AT, fps, config: {damping: 18, stiffness: 120}}) : 0;
	const svc = SERVICES[i];
	return (
		<div
			style={{
				opacity: s,
				translate: `${(1 - s) * 120}px 0px`,
				padding: '22px 26px',
				borderRadius: 30,
				background: i === 0 ? `rgba(27,28,39,${0.4 + open * 0.6})` : 'transparent',
				border: `1.5px solid ${i === 0 ? `rgba(255,255,255,${0.04 + open * 0.06})` : 'transparent'}`,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 26}}>
				<OrbitIcon n={i} active={i === 0 ? open : 0} />
				<div style={{flex: 1, fontFamily: FONT}}>
					<div style={{fontWeight: 700, fontSize: 36, color: P.text, letterSpacing: '-0.01em'}}>{svc.title}</div>
					<div style={{fontWeight: 500, fontSize: 26, color: P.muted, marginTop: 4}}>{svc.sub}</div>
				</div>
				<Chevron open={open} />
			</div>
			{i === 0 ? <Results open={open} /> : null}
		</div>
	);
};

const Results: React.FC<{open: number}> = ({open}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{height: open * 190, overflow: 'hidden'}}>
			<div style={{paddingTop: 30, paddingLeft: 110, fontFamily: FONT}}>
				<div style={{fontWeight: 600, fontSize: 26, color: P.muted, marginBottom: 18}}>Results</div>
				<div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
					{RESULTS.map((r, k) => {
						const p = spring({frame: frame - EXPAND_AT - 8 - k * 4, fps, config: {damping: 13, stiffness: 220, mass: 0.6}});
						return (
							<div
								key={r}
								style={{
									padding: '12px 22px',
									borderRadius: 999,
									fontWeight: 700,
									fontSize: 28,
									color: k === 0 ? '#160A10' : PINK,
									background: k === 0 ? PINK : `rgba(${PINK_RGB},0.12)`,
									boxShadow: k === 0 ? `0 0 30px rgba(${PINK_RGB},0.5)` : undefined,
									scale: String(interpolate(p, [0, 1], [0.6, 1])),
									opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
								}}
							>
								{r}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

const Board: React.FC = () => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [0, SHOTS.services], [0, 1], {easing: Easing.inOut(Easing.sin)});
	const push = interpolate(frame, [EXPAND_AT, EXPAND_AT + 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<AbsoluteFill style={{perspective: 1400, perspectiveOrigin: '50% 45%'}}>
			<div
				style={{
					position: 'absolute',
					left: 70,
					top: 470,
					width: 940,
					transformStyle: 'preserve-3d',
					transform: `translateY(${interpolate(t, [0, 1], [120, -60]) + push * 40}px) translateZ(${push * 160}px) rotateX(${interpolate(t, [0, 1], [26, 14])}deg) rotateY(${interpolate(t, [0, 1], [10, -6])}deg)`,
				}}
			>
				<div style={{fontFamily: FONT, fontWeight: 600, fontSize: 28, color: P.muted, margin: '0 0 22px 26px', letterSpacing: '0.04em'}}>
					SERVICES · FIVE ORBITS
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
					{SERVICES.map((_, i) => (
						<Row key={i} i={i} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const ServicesScene: React.FC = () => (
	<AbsoluteFill>
		<Stage />
		<ShotBlur duration={SHOTS.services}>
			<Board />
		</ShotBlur>
		<AbsoluteFill
			style={{
				backdropFilter: 'blur(6px)',
				maskImage: 'linear-gradient(to bottom, black 0%, transparent 24%, transparent 78%, black 100%)',
				WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 24%, transparent 78%, black 100%)',
			}}
		/>
	</AbsoluteFill>
);
