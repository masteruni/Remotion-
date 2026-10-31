import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {LightBackdrop, Vignette} from '../components/Backdrops';
import {DirectionalBlur} from '../components/DirectionalBlur';
import {Shot} from '../components/Shot';
import {COLORS, FONT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FocusWord: React.FC<{text: string; start: number}> = ({text, start}) => {
	const frame = useCurrentFrame();
	return (
		<span
			style={{
				display: 'inline-block',
				opacity: interpolate(frame, [start, start + 7], [0, 1], clamp),
				filter: `blur(${interpolate(frame, [start, start + 10], [26, 0], {
					...clamp,
					easing: Easing.out(Easing.cubic),
				})}px)`,
				translate: interpolate(frame, [start, start + 12], ['0px 14px', '0px 0px'], {
					...clamp,
					easing: Easing.out(Easing.cubic),
				}),
				scale: interpolate(frame, [start, start + 12], [1.08, 1], {
					...clamp,
					easing: Easing.out(Easing.cubic),
				}),
			}}
		>
			{text}
		</span>
	);
};

const SnapWord: React.FC<{text: string; start: number}> = ({text, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({
		frame: frame - start,
		fps,
		config: {damping: 11, stiffness: 260, mass: 0.55},
	});
	const streak = interpolate(frame, [start, start + 5], [34, 0], {
		...clamp,
		easing: Easing.out(Easing.quad),
	});
	return (
		<span style={{position: 'relative', display: 'inline-block'}}>
			<span style={{visibility: 'hidden'}}>{text}</span>
			<DirectionalBlur x={streak} y={streak * 0.15} style={{overflow: 'visible'}}>
				<span
					style={{
						display: 'inline-block',
						color: COLORS.coral,
						opacity: interpolate(frame, [start, start + 3], [0, 1], clamp),
						scale: String(interpolate(pop, [0, 1], [0.35, 1])),
						translate: `${interpolate(pop, [0, 1], [-60, 0])}px 0px`,
						transformOrigin: '0% 60%',
						textShadow: '0 10px 34px rgba(255,90,78,0.45), 0 2px 8px rgba(255,90,78,0.25)',
					}}
				>
					{text}
				</span>
			</DirectionalBlur>
		</span>
	);
};

const Headline: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				scale: String(
					interpolate(frame, [0, 45], [1, 1.06], {
						...clamp,
						easing: Easing.out(Easing.quad),
					}),
				),
			}}
		>
			<div
				style={{
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 120,
					letterSpacing: '-0.045em',
					color: COLORS.ink,
					display: 'flex',
					gap: '0.24em',
					alignItems: 'baseline',
					lineHeight: 1.2,
					whiteSpace: 'nowrap',
				}}
			>
				<FocusWord text="Content" start={1} />
				<FocusWord text="that" start={6} />
				<SnapWord text="performs" start={14} />
			</div>
		</AbsoluteFill>
	);
};

export const TitleScene: React.FC<{durationInFrames: number}> = ({
	durationInFrames,
}) => (
	<Shot
		durationInFrames={durationInFrames}
		exit="left"
		background={
			<>
				<LightBackdrop />
				<Vignette strength={0.22} />
			</>
		}
	>
		<Headline />
	</Shot>
);
