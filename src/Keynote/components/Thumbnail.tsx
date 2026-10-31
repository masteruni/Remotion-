import React from 'react';
import {FONT} from '../theme';

const PALETTES: [string, string, string][] = [
	['#FF5A4E', '#FFB86B', '#FFF1DC'],
	['#5B5BFF', '#B05BFF', '#F3E9FF'],
	['#00C2A8', '#2E7BFF', '#E3FFFA'],
	['#FFCE3A', '#FF6A3D', '#FFF6D6'],
	['#FF4FA3', '#7A3CFF', '#FFE3F2'],
	['#16D17A', '#00A3FF', '#E2FFF0'],
	['#FF8A3D', '#FF2E63', '#FFE7D6'],
	['#3DD6FF', '#6A5BFF', '#E6F9FF'],
	['#C6FF3D', '#16B57A', '#F4FFE0'],
	['#FF6B6B', '#FFD93D', '#FFF8E0'],
];

const VIEWS = ['1.2M', '842K', '3.4M', '518K', '2.1M', '96K', '4.8M', '730K', '1.7M', '260K'];
const TIMES = ['0:15', '0:32', '0:09', '0:58', '0:21', '0:44', '0:12', '0:27'];

/** Deterministic pseudo-random from an integer seed. */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

const Motif: React.FC<{kind: number; c: [string, string, string]; seed: number}> = ({
	kind,
	c,
	seed,
}) => {
	const r = rand(seed);
	switch (kind) {
		case 0: // sun over waves
			return (
				<svg viewBox="0 0 90 160" style={{position: 'absolute', inset: 0}} preserveAspectRatio="xMidYMid slice">
					<circle cx={45} cy={62} r={24 + r * 6} fill={c[2]} opacity={0.95} />
					<path d="M0 100 Q 22 88 45 100 T 90 100 V160 H0Z" fill={c[1]} opacity={0.85} />
					<path d="M0 116 Q 22 104 45 116 T 90 116 V160 H0Z" fill={c[0]} opacity={0.9} />
				</svg>
			);
		case 1: // stacked pills
			return (
				<svg viewBox="0 0 90 160" style={{position: 'absolute', inset: 0}} preserveAspectRatio="xMidYMid slice">
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={12 + i * 4} y={30 + i * 24} width={66 - i * 8} height={16} rx={8} fill={c[2]} opacity={0.9 - i * 0.15} />
					))}
				</svg>
			);
		case 2: // concentric rings
			return (
				<svg viewBox="0 0 90 160" style={{position: 'absolute', inset: 0}} preserveAspectRatio="xMidYMid slice">
					{[46, 34, 22, 10].map((rad, i) => (
						<circle key={rad} cx={45} cy={70} r={rad} fill="none" stroke={c[2]} strokeWidth={5} opacity={0.35 + i * 0.18} />
					))}
				</svg>
			);
		case 3: // bar chart
			return (
				<svg viewBox="0 0 90 160" style={{position: 'absolute', inset: 0}} preserveAspectRatio="xMidYMid slice">
					{[0, 1, 2, 3, 4].map((i) => {
						const h = 20 + rand(seed + i) * 60;
						return <rect key={i} x={12 + i * 14} y={110 - h} width={9} height={h} rx={3} fill={c[2]} opacity={0.9} />;
					})}
				</svg>
			);
		case 4: // product blob on pedestal
			return (
				<svg viewBox="0 0 90 160" style={{position: 'absolute', inset: 0}} preserveAspectRatio="xMidYMid slice">
					<ellipse cx={45} cy={112} rx={30} ry={7} fill="rgba(0,0,0,0.25)" />
					<rect x={22} y={92} width={46} height={20} rx={4} fill={c[2]} opacity={0.9} />
					<path d={`M45 ${38 + r * 6} C 70 40, 70 88, 45 90 C 20 88, 20 40, 45 ${38 + r * 6}Z`} fill={c[1]} />
					<ellipse cx={38} cy={56} rx={6} ry={12} fill="#fff" opacity={0.5} />
				</svg>
			);
		default: // diagonal stripes
			return (
				<svg viewBox="0 0 90 160" style={{position: 'absolute', inset: 0}} preserveAspectRatio="xMidYMid slice">
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<rect key={i} x={-60 + i * 28} y={-20} width={12} height={220} fill={c[2]} opacity={0.22} transform="rotate(28 45 80)" />
					))}
					<circle cx={45} cy={72} r={18} fill={c[2]} opacity={0.9} />
				</svg>
			);
	}
};

/** A vivid, logo-free short-form video thumbnail (9:16). */
export const Thumbnail: React.FC<{
	seed: number;
	width: number;
	style?: React.CSSProperties;
}> = ({seed, width, style}) => {
	const c = PALETTES[seed % PALETTES.length];
	const kind = Math.floor(rand(seed + 3) * 6);
	const height = (width * 16) / 9;
	const u = width / 220;
	return (
		<div
			style={{
				position: 'relative',
				width,
				height,
				borderRadius: 22 * u,
				overflow: 'hidden',
				background: `linear-gradient(${150 + rand(seed) * 60}deg, ${c[0]}, ${c[1]})`,
				boxShadow: `0 ${18 * u}px ${40 * u}px rgba(0,0,0,0.45)`,
				...style,
			}}
		>
			<Motif kind={kind} c={c} seed={seed} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 14 * u,
					right: 14 * u,
					padding: `${4 * u}px ${10 * u}px`,
					borderRadius: 99,
					background: 'rgba(0,0,0,0.35)',
					color: '#fff',
					fontFamily: FONT,
					fontWeight: 600,
					fontSize: 15 * u,
				}}
			>
				{TIMES[seed % TIMES.length]}
			</div>
			<div style={{position: 'absolute', left: 16 * u, right: 16 * u, bottom: 18 * u}}>
				<div style={{height: 10 * u, width: '82%', borderRadius: 9, background: 'rgba(255,255,255,0.92)'}} />
				<div style={{height: 10 * u, width: '56%', borderRadius: 9, background: 'rgba(255,255,255,0.6)', marginTop: 8 * u}} />
				<div
					style={{
						marginTop: 12 * u,
						display: 'flex',
						alignItems: 'center',
						gap: 6 * u,
						color: '#fff',
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 17 * u,
					}}
				>
					<svg width={14 * u} height={14 * u} viewBox="0 0 10 10">
						<path d="M2 1 L9 5 L2 9Z" fill="#fff" />
					</svg>
					{VIEWS[seed % VIEWS.length]}
				</div>
			</div>
		</div>
	);
};
