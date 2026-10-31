import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {LightBackdrop} from '../components/Backdrops';
import {Odometer} from '../components/Odometer';
import {Shot} from '../components/Shot';
import {rand} from '../components/Thumbnail';
import {COLORS, FONT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const TILE_COLORS: [string, string][] = [
	['#FF5A4E', '#FFB86B'],
	['#6A5BFF', '#B05BFF'],
	['#00C2A8', '#2E7BFF'],
	['#FFCE3A', '#FF6A3D'],
	['#FF4FA3', '#7A3CFF'],
	['#16D17A', '#00A3FF'],
];

const Orbs: React.FC = () => {
	const frame = useCurrentFrame();
	const orbs = [
		{x: 520, y: 300, s: 520, c: 'rgba(255,90,78,0.55)'},
		{x: 1450, y: 760, s: 620, c: 'rgba(122,92,255,0.45)'},
		{x: 1350, y: 200, s: 420, c: 'rgba(0,194,168,0.40)'},
	];
	return (
		<AbsoluteFill style={{filter: 'blur(70px)'}}>
			{orbs.map((o, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: o.x - o.s / 2 + Math.sin(frame / 20 + i) * 30,
						top: o.y - o.s / 2,
						width: o.s,
						height: o.s,
						borderRadius: '50%',
						background: o.c,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

const Tile: React.FC<{i: number; start: number}> = ({i, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - start, fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
	const [a, b] = TILE_COLORS[i % TILE_COLORS.length];
	return (
		<div
			style={{
				aspectRatio: '3 / 4',
				borderRadius: 18,
				background: 'rgba(0,0,0,0.06)',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: 18,
					background: `linear-gradient(${140 + rand(i) * 80}deg, ${a}, ${b})`,
					scale: String(interpolate(s, [0, 1], [0.4, 1])),
					opacity: interpolate(frame, [start, start + 2], [0, 1], clamp),
				}}
			>
				<div style={{position: 'absolute', left: '30%', top: '28%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(255,255,255,0.35)'}} />
				<svg width={22} height={22} viewBox="0 0 10 10" style={{position: 'absolute', left: 12, bottom: 12}}>
					<path d="M2 1 L9 5 L2 9Z" fill="#fff" />
				</svg>
			</div>
		</div>
	);
};

const Stat: React.FC<{label: string; children: React.ReactNode; strong?: boolean}> = ({label, children, strong}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
		<div style={{fontWeight: 800, fontSize: strong ? 64 : 40, letterSpacing: '-0.03em', color: COLORS.ink, display: 'flex', alignItems: 'center'}}>
			{children}
		</div>
		<div style={{fontWeight: 500, fontSize: 22, color: COLORS.muted}}>{label}</div>
	</div>
);

const ProfileCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const rise = spring({frame, fps, config: {damping: 17, stiffness: 120, mass: 0.9}});
	const countP = interpolate(frame, [6, 32], [0, 1], {...clamp, easing: Easing.bezier(0.12, 0.9, 0.25, 1)});
	const speed = interpolate(frame, [6, 12, 32], [1, 1, 0], clamp);
	const sheen = interpolate(frame, [4, 36], [-40, 150], clamp);

	return (
		<AbsoluteFill style={{perspective: 1600, justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					width: 760,
					padding: '44px 48px 48px',
					borderRadius: 48,
					position: 'relative',
					overflow: 'hidden',
					fontFamily: FONT,
					background: 'linear-gradient(160deg, rgba(255,255,255,0.82), rgba(255,255,255,0.55))',
					backdropFilter: 'blur(30px) saturate(1.6)',
					border: '1.5px solid rgba(255,255,255,0.95)',
					boxShadow:
						'0 60px 120px rgba(30,30,60,0.28), 0 10px 30px rgba(30,30,60,0.12), inset 0 1px 0 rgba(255,255,255,1)',
					translate: `0px ${interpolate(rise, [0, 1], [700, 0])}px`,
					transform: `rotateX(${interpolate(rise, [0, 1], [32, 0])}deg) rotateY(${interpolate(frame, [0, 45], [4, -3])}deg)`,
				}}
			>
				{/* header */}
				<div style={{display: 'flex', alignItems: 'center', gap: 26}}>
					<div
						style={{
							width: 116,
							height: 116,
							borderRadius: '50%',
							padding: 5,
							background: `conic-gradient(from 200deg, ${COLORS.coral}, #FFB86B, #B05BFF, ${COLORS.coral})`,
						}}
					>
						<div
							style={{
								width: '100%',
								height: '100%',
								borderRadius: '50%',
								border: '4px solid #fff',
								background: 'radial-gradient(circle at 35% 30%, #FFD3C9, #FF7A6E 55%, #7A3CFF)',
							}}
						/>
					</div>
					<div style={{flex: 1}}>
						<div style={{fontWeight: 800, fontSize: 42, letterSpacing: '-0.03em', color: COLORS.ink}}>Leiluna Studio</div>
						<div style={{fontWeight: 500, fontSize: 24, color: COLORS.muted, marginTop: 2}}>@leilunastudio</div>
					</div>
					<div
						style={{
							padding: '14px 30px',
							borderRadius: 999,
							background: COLORS.coral,
							color: '#fff',
							fontWeight: 700,
							fontSize: 24,
							boxShadow: '0 10px 24px rgba(255,90,78,0.35)',
						}}
					>
						Follow
					</div>
				</div>
				{/* stats */}
				<div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', margin: '40px 0 34px'}}>
					<Stat label="Posts">482</Stat>
					<Stat label="Followers" strong>
						<Odometer value={countP * 306} digits={3} fontSize={64} speed={speed} />
						<span>K</span>
					</Stat>
					<Stat label="Following">189</Stat>
				</div>
				{/* grid */}
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<Tile key={i} i={i} start={12 + i * 3} />
					))}
				</div>
				{/* glass reflection sweep */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen - 18}%, rgba(255,255,255,0.55) ${sheen}%, rgba(255,255,255,0) ${sheen + 18}%)`,
						mixBlendMode: 'soft-light',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const ProfileScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => (
	<Shot
		durationInFrames={durationInFrames}
		enter="up"
		exit="zoom"
		background={
			<>
				<LightBackdrop />
				<Orbs />
			</>
		}
	>
		<ProfileCard />
	</Shot>
);
