import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {thumbSrc} from '../../Keynote/components/Thumbnail';
import {Crescents, ShotBlur, Stage} from '../components';
import {FONT, P, PINK_RGB, SHOTS} from '../theme';


// Formats from the site's "Pick a format. See it work." section.
const CHIPS = ['Talking head', 'Product ad', '3D reveal', 'Kinetic type'];
const CARDS = [
	{img: '44001-a', title: 'Animated menu ad', meta: 'Food & beverage · 0:15'},
	{img: '41858-a', title: 'Luxury product ad', meta: 'Hospitality · 0:20'},
];

const Chips: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Highlight springs from chip 1 -> 2 -> 3.
	const pos =
		1 +
		spring({frame: frame - 22, fps, config: {damping: 16, stiffness: 160}}) +
		spring({frame: frame - 42, fps, config: {damping: 16, stiffness: 160}});
	return (
		<div style={{display: 'flex', gap: 18, flexWrap: 'nowrap'}}>
			{CHIPS.map((c, i) => {
				const on = Math.max(0, 1 - Math.abs(pos - i));
				return (
					<div
						key={c}
						style={{
							padding: '18px 30px',
							borderRadius: 999,
							fontFamily: FONT,
							fontWeight: 700,
							fontSize: 30,
							whiteSpace: 'nowrap',
							color: on > 0.5 ? '#160A10' : P.text,
							background: `rgba(${PINK_RGB},${on})`,
							boxShadow: on > 0.05 ? `0 0 ${40 * on}px rgba(${PINK_RGB},${0.55 * on})` : undefined,
							border: `1.5px solid ${on > 0.5 ? 'transparent' : P.line}`,
							backgroundColor: on > 0.02 ? `rgba(${PINK_RGB},${on})` : P.panelHi,
						}}
					>
						{c}
					</div>
				);
			})}
		</div>
	);
};

const Card: React.FC<{img: string; title: string; meta: string; delay: number}> = ({img, title, meta, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 140}});
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 26,
				padding: 18,
				borderRadius: 28,
				background: P.panel,
				border: `1.5px solid ${P.line}`,
				opacity: s,
				translate: `0px ${(1 - s) * 60}px`,
			}}
		>
			<Img src={thumbSrc(img)} style={{width: 120, height: 150, objectFit: 'cover', borderRadius: 18}} />
			<div style={{fontFamily: FONT}}>
				<div style={{fontWeight: 700, fontSize: 34, color: P.text}}>{title}</div>
				<div style={{fontWeight: 500, fontSize: 24, color: P.muted, marginTop: 6}}>{meta}</div>
			</div>
		</div>
	);
};

const Board: React.FC = () => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [0, SHOTS.formats], [0, 1], {easing: Easing.inOut(Easing.sin)});
	return (
		<AbsoluteFill style={{perspective: 1300, perspectiveOrigin: '50% 40%'}}>
			<div
				style={{
					position: 'absolute',
					left: 90,
					top: 620,
					width: 900,
					transformStyle: 'preserve-3d',
					transform: `translateY(${interpolate(t, [0, 1], [140, -80])}px) translateZ(${interpolate(t, [0, 1], [120, -40])}px) rotateX(${interpolate(t, [0, 1], [46, 32])}deg) rotateZ(${interpolate(t, [0, 1], [-9, -5])}deg)`,
					transformOrigin: '50% 30%',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 44}}>
					<Crescents height={56} />
					<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 58, letterSpacing: '-0.03em', color: P.text}}>
						Pick a format.
					</div>
				</div>
				<Chips />
				<div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 50}}>
					{CARDS.map((c, i) => (
						<Card key={c.title} {...c} delay={8 + i * 6} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const FormatsScene: React.FC = () => (
	<AbsoluteFill>
		<Stage />
		<ShotBlur duration={SHOTS.formats}>
			<Board />
		</ShotBlur>
		{/* shallow depth of field: soften the far and near edges of the board */}
		<AbsoluteFill
			style={{
				backdropFilter: 'blur(7px)',
				maskImage: 'linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)',
				WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)',
			}}
		/>
	</AbsoluteFill>
);

