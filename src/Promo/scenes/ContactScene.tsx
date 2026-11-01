import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DirectionalBlur} from '../../Keynote/components/DirectionalBlur';
import {ShotBlur, Stage} from '../components';
import {FONT, P, PINK, PINK_RGB, SHOTS} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const MESSAGE = "Let's build your brand.";
const TYPE_START = 3;
const TYPE_END = 24;
const SEND = 29;

const Input: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const chars = Math.round(interpolate(frame, [TYPE_START, TYPE_END], [0, MESSAGE.length], clamp));
	const press = spring({frame: frame - SEND, fps, config: {damping: 10, stiffness: 300, mass: 0.5}});
	const sent = interpolate(frame, [SEND + 1, SEND + 8], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const caretOn = frame < SEND && Math.floor(frame / 8) % 2 === 0;
	const glow = interpolate(frame, [TYPE_END, SEND, SEND + 6], [0.4, 0.8, 1.4], clamp);
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
			<div
				style={{
					position: 'relative',
					width: 760,
					height: 120,
					borderRadius: 999,
					background: P.panel,
					border: `1.5px solid ${P.line}`,
					overflow: 'hidden',
					display: 'flex',
					alignItems: 'center',
					padding: '0 44px',
				}}
			>
				<DirectionalBlur x={sent * 30} y={0} style={{position: 'relative', inset: 'auto'}}>
					<div
						style={{
							fontFamily: FONT,
							fontWeight: 600,
							fontSize: 44,
							color: P.text,
							whiteSpace: 'nowrap',
							translate: `${-sent * 700}px 0px`,
							opacity: 1 - sent,
						}}
					>
						{MESSAGE.slice(0, chars)}
						<span style={{display: 'inline-block', width: 3, height: 46, marginLeft: 4, background: PINK, verticalAlign: 'middle', opacity: caretOn ? 1 : 0}} />
					</div>
				</DirectionalBlur>
			</div>
			<div
				style={{
					width: 120,
					height: 120,
					borderRadius: '50%',
					background: PINK,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					scale: String(1 - Math.sin(Math.min(1, press) * Math.PI) * 0.12),
					boxShadow: `0 0 ${50 * glow}px rgba(${PINK_RGB},${0.6 * glow}), 0 0 ${120 * glow}px rgba(${PINK_RGB},${0.3 * glow})`,
				}}
			>
				<svg width={52} height={52} viewBox="0 0 24 24">
					<path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#160A10" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		</div>
	);
};

const Board: React.FC = () => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [0, SHOTS.contact], [0, 1], {easing: Easing.out(Easing.quad)});
	return (
		<AbsoluteFill style={{perspective: 1200, justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					transform: `rotateX(${interpolate(t, [0, 1], [18, 8])}deg) rotateY(${interpolate(t, [0, 1], [-16, -6])}deg) translateZ(${interpolate(t, [0, 1], [0, 90])}px)`,
				}}
			>
				<div style={{fontFamily: FONT, fontWeight: 600, fontSize: 30, color: P.muted, marginBottom: 26, marginLeft: 44}}>Start a project</div>
				<Input />
			</div>
		</AbsoluteFill>
	);
};

export const ContactScene: React.FC = () => (
	<AbsoluteFill>
		<Stage glow={1.3} />
		<ShotBlur duration={SHOTS.contact} exitDir="left">
			<Board />
		</ShotBlur>
	</AbsoluteFill>
);
