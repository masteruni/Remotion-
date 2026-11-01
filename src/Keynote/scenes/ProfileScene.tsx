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
import {LightBackdrop} from '../components/Backdrops';
import {Odometer} from '../components/Odometer';
import {Shot} from '../components/Shot';
import {thumbSrc} from '../components/Thumbnail';
import {COLORS, FONT} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const TILE_IMAGES = ['41858-a', '51500-a', '10419-a', '4064-b', '4149-a', '44001-a'];

const Tile: React.FC<{i: number; start: number}> = ({i, start}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 240, mass: 0.5}});
	return (
		<div style={{aspectRatio: '3 / 4', borderRadius: 14, background: '#EDEDF0', overflow: 'hidden', position: 'relative'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: 14,
					overflow: 'hidden',
					scale: String(interpolate(s, [0, 1], [0.6, 1])),
					opacity: interpolate(frame, [start, start + 3], [0, 1], clamp),
				}}
			>
				<Img src={thumbSrc(TILE_IMAGES[i])} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				<svg width={20} height={20} viewBox="0 0 10 10" style={{position: 'absolute', left: 10, bottom: 10, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'}}>
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
	// Icon pops in at screen centre, then morphs open into the full card.
	const pop = spring({frame, fps, config: {damping: 13, stiffness: 220, mass: 0.6}});
	const m = spring({frame: frame - 7, fps, config: {damping: 20, stiffness: 150, mass: 0.8}});
	const countP = interpolate(frame, [13, 36], [0, 1], {...clamp, easing: Easing.bezier(0.12, 0.9, 0.25, 1)});
	const speed = interpolate(frame, [13, 18, 36], [1, 1, 0], clamp);
	const sheen = interpolate(frame, [10, 40], [-40, 150], clamp);
	const reveal = interpolate(m, [0.55, 1], [0, 1], clamp);
	const k = 1 - m;

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
					background: '#FFFFFF',
					backdropFilter: 'blur(30px) saturate(1.6)',
					border: '1.5px solid rgba(255,255,255,0.95)',
					boxShadow:
						'0 60px 120px rgba(30,30,60,0.28), 0 10px 30px rgba(30,30,60,0.12), inset 0 1px 0 rgba(255,255,255,1)',
					// Avatar centre sits ~(-274, -373)px from the card centre: start with it at screen centre.
					translate: `${274 * k}px ${373 * k}px`,
					scale: String(interpolate(pop, [0, 1], [0.3, 1])),
					opacity: interpolate(frame, [0, 3], [0, 1], clamp),
					clipPath: `inset(${30 * k}px ${582 * k}px calc((100% - 174px) * ${k}) ${34 * k}px round ${interpolate(m, [0, 1], [44, 48])}px)`,
					transform: `rotateY(${interpolate(frame, [0, 45], [3, -2])}deg)`,
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
							background: 'linear-gradient(135deg, #FF7199, #FFC2D3)',
						}}
					>
						<div
							style={{
								position: 'relative',
								width: '100%',
								height: '100%',
								borderRadius: '50%',
								border: '4px solid #fff',
								background: 'radial-gradient(circle at 50% 40%, #1A2556, #0A1230)',
								overflow: 'hidden',
							}}
						>
							{['crescent-white', 'crescent-pink'].map((n) => (
								<Img
									key={n}
									src={staticFile(`brand/${n}.png`)}
									style={{position: 'absolute', left: '50%', top: '52%', width: '78%', translate: '-50% -50%'}}
								/>
							))}
						</div>
					</div>
					<div style={{flex: 1, opacity: reveal}}>
						<div style={{fontWeight: 800, fontSize: 42, letterSpacing: '-0.03em', color: COLORS.ink}}>Leiluna Studio</div>
						<div style={{fontWeight: 500, fontSize: 24, color: COLORS.muted, marginTop: 2}}>@leilunastudio</div>
					</div>
					<div
						style={{
							opacity: reveal,
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
				<div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', margin: '40px 0 34px', opacity: reveal}}>
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
						<Tile key={i} i={i} start={18 + i * 3} />
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
			</>
		}
	>
		<ProfileCard />
	</Shot>
);
