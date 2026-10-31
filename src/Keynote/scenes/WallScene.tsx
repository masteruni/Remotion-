import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {CharcoalBackdrop, Vignette} from '../components/Backdrops';
import {Shot} from '../components/Shot';
import {Thumbnail} from '../components/Thumbnail';
import {COLORS, FONT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const COLS = 11;
const ROWS = 7;
const W = 230;
const H = (W * 16) / 9;
const GAP = 30;
const HERO = {col: 5, row: 3};
const TILT_X = 12;
const TILT_Z = -5;
const LIFT_START = 30;

const Badge: React.FC<{start: number}> = ({start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - start, fps, config: {damping: 12, stiffness: 240, mass: 0.6}});
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				bottom: -34,
				translate: '-50% 0',
				scale: String(s),
				opacity: interpolate(frame, [start, start + 3], [0, 1], clamp),
				display: 'flex',
				alignItems: 'center',
				gap: 10,
				padding: '12px 24px',
				borderRadius: 999,
				background: '#FFFFFF',
				color: COLORS.ink,
				fontFamily: FONT,
				fontWeight: 800,
				fontSize: 30,
				letterSpacing: '-0.02em',
				whiteSpace: 'nowrap',
				boxShadow: '0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.6)',
			}}
		>
			<svg width={22} height={22} viewBox="0 0 10 10">
				<path d="M2 1 L9 5 L2 9Z" fill={COLORS.coral} />
			</svg>
			9M views
		</div>
	);
};

const Wall: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const lift = spring({frame: frame - LIFT_START, fps, config: {damping: 15, stiffness: 120}});

	const cells = [];
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			const isHero = c === HERO.col && r === HERO.row;
			const x = (c - (COLS - 1) / 2) * (W + GAP);
			const y = (r - (ROWS - 1) / 2) * (H + GAP);
			// Staggered columns, like a feed.
			const stagger = c % 2 === 0 ? 0 : (H + GAP) * 0.35;
			const seed = r * COLS + c + 4;
			cells.push(
				<div
					key={seed}
					style={{
						position: 'absolute',
						left: x - W / 2,
						top: y - H / 2 + (isHero ? 0 : stagger),
						width: W,
						height: H,
						transformStyle: 'preserve-3d',
						zIndex: isHero ? 2 : 1,
						transform: isHero
							? `translateZ(${lift * 300}px) rotateZ(${-TILT_Z * lift * 0.9}deg) rotateX(${-TILT_X * lift * 0.9}deg) scale(${1 + lift * 0.18})`
							: undefined,
						filter: isHero ? undefined : `brightness(${1 - lift * 0.5}) saturate(${1 - lift * 0.25})`,
					}}
				>
					<Thumbnail
						seed={isHero ? 0 : seed}
						width={W}
						style={
							isHero
								? {
										boxShadow: `0 0 0 ${3 * lift}px rgba(255,255,255,0.9), 0 0 ${80 * lift}px ${10 * lift}px rgba(255,120,100,${0.55 * lift}), 0 40px 80px rgba(0,0,0,0.6)`,
									}
								: undefined
						}
					/>
					{isHero ? <Badge start={LIFT_START + 8} /> : null}
				</div>,
			);
		}
	}

	const pan = interpolate(frame, [0, LIFT_START + 6], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.2, 0.7, 0.3, 1),
	});
	const drift = frame * 0.6;
	const panX = interpolate(pan, [0, 1], [1100, 0]) - drift;
	const panY = interpolate(pan, [0, 1], [-260, 0]) + drift * 0.2;

	return (
		<AbsoluteFill style={{perspective: 1500, perspectiveOrigin: '50% 45%'}}>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transformStyle: 'preserve-3d',
					transform: `translateZ(-120px) rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg) translate(${panX}px, ${panY}px)`,
				}}
			>
				{cells}
			</div>
		</AbsoluteFill>
	);
};

/** Out-of-focus thumbnails close to the lens, moving faster for parallax. */
const ForegroundParallax: React.FC = () => {
	const frame = useCurrentFrame();
	const items = [
		{x: 1300, y: -260, s: 340, seed: 21},
		{x: 1900, y: 720, s: 300, seed: 33},
		{x: 2500, y: -200, s: 360, seed: 45},
	];
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{items.map((it) => (
				<div
					key={it.seed}
					style={{
						position: 'absolute',
						left: it.x - frame * 95,
						top: it.y,
						rotate: '-12deg',
						filter: 'blur(18px)',
						opacity: 0.85,
					}}
				>
					<Thumbnail seed={it.seed} width={it.s} />
				</div>
			))}
		</AbsoluteFill>
	);
};

export const WallScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
	<Shot
		durationInFrames={durationInFrames}
		enter="up"
		exit="left"
		background={<CharcoalBackdrop />}
	>
		<Wall />
		<ForegroundParallax />
		<Vignette strength={0.55} />
	</Shot>
);
