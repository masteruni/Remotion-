import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';
import {DirectionalBlur} from './DirectionalBlur';
import {rand} from './Thumbnail';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const SCREEN_W = 268;
const SCREEN_H = 580;

const FeedVideo: React.FC<{colors: [string, string, string]; seed: number}> = ({colors, seed}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'relative',
				width: SCREEN_W,
				height: SCREEN_H,
				overflow: 'hidden',
				background: `linear-gradient(170deg, ${colors[0]}, ${colors[1]})`,
			}}
		>
			<svg viewBox="0 0 268 580" style={{position: 'absolute', inset: 0}}>
				<circle cx={134 + Math.sin(frame / 9 + seed) * 20} cy={230} r={70} fill={colors[2]} opacity={0.9} />
				<path
					d={`M${-40 - (frame * 3) % 80} 360 q 40 -26 80 0 t 80 0 t 80 0 t 80 0 t 80 0 V580 H-80Z`}
					fill="rgba(255,255,255,0.28)"
				/>
				<path
					d={`M${-80 + (frame * 2) % 80} 400 q 40 -22 80 0 t 80 0 t 80 0 t 80 0 t 80 0 V580 H-80Z`}
					fill="rgba(0,0,0,0.18)"
				/>
			</svg>
			<div style={{position: 'absolute', right: 12, bottom: 120, display: 'flex', flexDirection: 'column', gap: 18}}>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 34, height: 34, borderRadius: 99, background: 'rgba(255,255,255,0.9)', opacity: 0.9 - i * 0.15}} />
				))}
			</div>
			<div style={{position: 'absolute', left: 16, bottom: 40, width: 180}}>
				<div style={{height: 9, width: '70%', borderRadius: 9, background: '#fff'}} />
				<div style={{height: 8, width: '95%', borderRadius: 9, background: 'rgba(255,255,255,0.7)', marginTop: 8}} />
				<div style={{height: 8, width: '60%', borderRadius: 9, background: 'rgba(255,255,255,0.7)', marginTop: 6}} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, background: 'rgba(255,255,255,0.3)'}}>
				<div style={{height: '100%', width: `${30 + ((frame * 1.5 + seed * 40) % 60)}%`, background: '#fff'}} />
			</div>
		</div>
	);
};

const Bokeh: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{filter: 'blur(16px)'}}>
			{new Array(14).fill(0).map((_, i) => {
				const size = 60 + rand(i) * 140;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: rand(i + 20) * 1200 - size / 2 + frame * (0.4 + rand(i + 5)),
							top: rand(i + 40) * 600 - size / 2,
							width: size,
							height: size,
							borderRadius: '50%',
							background: `radial-gradient(circle, rgba(255,${200 + rand(i + 7) * 50},${140 + rand(i + 9) * 80},0.85), rgba(255,200,140,0) 70%)`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const SKIN = 'radial-gradient(ellipse 80% 70% at 35% 30%, #F6CFAE 0%, #E3A985 45%, #B97A57 100%)';

/**
 * Stand-in for "a hand scrolling a smartphone, warm natural light, shallow depth of field".
 * Built from shapes so the project renders without stock footage.
 */
export const HandScrollFootage: React.FC = () => {
	const frame = useCurrentFrame();
	const scroll = interpolate(frame, [12, 26], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const velocity = interpolate(frame, [12, 19, 26], [0, 1, 0], clamp);
	const thumbY = interpolate(frame, [6, 12, 24, 34], [40, 0, -150, -40], {
		...clamp,
		easing: Easing.inOut(Easing.quad),
	});
	const handBob = Math.sin(frame / 8) * 3;

	return (
		<AbsoluteFill
			style={{
				background:
					'linear-gradient(120deg, #2A1810 0%, #6B3D22 30%, #C07A45 58%, #F3C48C 82%, #FFE6C2 100%)',
				overflow: 'hidden',
			}}
		>
			<Bokeh />
			{/* window light */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 50% 70% at 88% 18%, rgba(255,236,200,0.75), rgba(255,236,200,0) 70%)',
					mixBlendMode: 'screen',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 470,
					top: 60 + handBob,
					width: 300,
					height: 640,
					rotate: '-9deg',
				}}
			>
				{/* palm behind the phone */}
				<div
					style={{
						position: 'absolute',
						left: 120,
						top: 330,
						width: 330,
						height: 420,
						borderRadius: '48% 52% 40% 60%',
						background: SKIN,
						boxShadow: '0 30px 60px rgba(60,25,10,0.45)',
					}}
				/>
				{/* phone */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: 48,
						background: 'linear-gradient(135deg, #3A3A3E, #0C0C0E 40%, #26262A)',
						boxShadow:
							'0 40px 70px rgba(40,15,5,0.55), inset 0 0 0 2px rgba(255,255,255,0.18)',
						padding: 16,
					}}
				>
					<div
						style={{
							position: 'relative',
							width: SCREEN_W,
							height: SCREEN_H + 28,
							borderRadius: 36,
							overflow: 'hidden',
							background: '#000',
						}}
					>
						<DirectionalBlur x={0} y={velocity * 14}>
							<div style={{translate: `0px ${-scroll * SCREEN_H}px`}}>
								<FeedVideo colors={[COLORS.coral, '#FFB35C', '#FFF1D6']} seed={1} />
								<FeedVideo colors={['#6A5BFF', '#00C2C7', '#E8FFFC']} seed={4} />
							</div>
						</DirectionalBlur>
						{/* dynamic island */}
						<div style={{position: 'absolute', top: 12, left: '50%', translate: '-50% 0', width: 86, height: 24, borderRadius: 20, background: '#000'}} />
						{/* glass reflection */}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background:
									'linear-gradient(115deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.08) 100%)',
							}}
						/>
					</div>
				</div>
				{/* fingers wrapping the left edge */}
				{[360, 440, 520].map((y, i) => (
					<div
						key={y}
						style={{
							position: 'absolute',
							left: -30,
							top: y,
							width: 62,
							height: 60,
							borderRadius: '40% 55% 55% 40%',
							background: SKIN,
							boxShadow: '4px 6px 12px rgba(60,25,10,0.35)',
							rotate: `${-8 + i * 4}deg`,
						}}
					/>
				))}
				{/* thumb */}
				<div
					style={{
						position: 'absolute',
						left: 170,
						top: 420 + thumbY,
						width: 92,
						height: 250,
						borderRadius: '46px 46px 40px 40px',
						background: SKIN,
						rotate: '-24deg',
						boxShadow: '-10px 18px 30px rgba(60,25,10,0.45)',
						filter: 'blur(0.6px)',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 20,
							top: 12,
							width: 52,
							height: 62,
							borderRadius: '26px 26px 18px 18px',
							background: 'linear-gradient(180deg, #FBE2D2, #EBC0A6)',
							opacity: 0.85,
						}}
					/>
				</div>
			</div>
			{/* warm grade + vignette */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 80% 80% at 55% 50%, rgba(0,0,0,0) 50%, rgba(30,10,0,0.45) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
