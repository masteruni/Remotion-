import {loadFont} from '@remotion/google-fonts/Montserrat';
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['500', '600', '700', '800'],
	subsets: ['latin'],
});

// Sampled from the supplied logo file.
const NAVY = '#00325A';
const NAVY_DEEP = '#00284A';
const GOLD = '#E0B04C';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.72)';

const PROGRAMS = [
	'HR & People Management',
	'Supervisory & Leadership Development',
	'Difficult Conversations at Work',
	'Accountability, Ownership & Professional Growth',
	'Practical Learning for SMEs, Cooperatives & Startups',
];

const W = 1080;
const H = 1350;
const PAD = 72;

// Photo placement: cut-out is 766x711, cropped from the brand banner.
const PHOTO_SCALE = 0.98;
const PHOTO_W = 766 * PHOTO_SCALE;
const PHOTO_H = 711 * PHOTO_SCALE;
const PHOTO_LEFT = 488;

const Logo: React.FC = () => (
	<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
		<Img src={staticFile('md-raymundo/mark.png')} style={{height: 84}} />
		<div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
			<Img src={staticFile('md-raymundo/word_md.png')} style={{width: 330}} />
			<Img src={staticFile('md-raymundo/word_cs.png')} style={{width: 272}} />
		</div>
	</div>
);

/** The rising gold arrow from the logo, used large behind the portrait as on the banner. */
const RisingArrow: React.FC = () => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		<defs>
			<linearGradient id="shaft" gradientUnits="userSpaceOnUse" x1="560" y1="1080" x2="760" y2="880">
				<stop offset="0" stopColor={GOLD} stopOpacity="0" />
				<stop offset="1" stopColor={GOLD} stopOpacity="1" />
			</linearGradient>
			<linearGradient id="pane" x1="0" y1="1" x2="1" y2="0">
				<stop offset="0" stopColor="#0A3D6B" stopOpacity="0" />
				<stop offset="1" stopColor="#0A3D6B" stopOpacity="0.9" />
			</linearGradient>
		</defs>
		{/* faint diagonal planes, echoing the banner background */}
		<polygon points="560,1350 1080,830 1080,1350" fill="url(#pane)" opacity={0.55} />
		<polygon points="760,1350 1080,1030 1080,1350" fill="#0A3D6B" opacity={0.35} />
		{/* arrow shaft + head */}
		<polygon points="540,1100 572,1100 1004,668 1004,636" fill="url(#shaft)" />
		<polygon points="960,606 1050,584 1028,674" fill={GOLD} />
	</svg>
);

const Program: React.FC<{n: number; title: string}> = ({n, title}) => (
	<div
		style={{
			display: 'flex',
			gap: 20,
			padding: '17px 0',
			borderTop: '1.5px solid rgba(255,255,255,0.14)',
		}}
	>
		<div style={{width: 38, flexShrink: 0, color: GOLD, fontWeight: 700, fontSize: 20, paddingTop: 4, letterSpacing: '0.04em'}}>
			{String(n).padStart(2, '0')}
		</div>
		<div style={{color: WHITE, fontWeight: 600, fontSize: 25, lineHeight: 1.28}}>{title}</div>
	</div>
);

const ChatIcon: React.FC = () => (
	<svg width={30} height={30} viewBox="0 0 24 24">
		<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.5 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill={NAVY} />
		<path d="M7.5 9.5h9M7.5 12.5h6" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
	</svg>
);

export const TrainingPost: React.FC = () => (
	<AbsoluteFill style={{background: NAVY, fontFamily, overflow: 'hidden'}}>
		{/* soft key light behind the portrait */}
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 520px 560px at 830px 860px, #0B4478 0%, ${NAVY} 70%), linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
			}}
		/>
		<RisingArrow />
		<Img
			src={staticFile('md-raymundo/marielle.png')}
			style={{position: 'absolute', left: PHOTO_LEFT, top: H - PHOTO_H, width: PHOTO_W, height: PHOTO_H}}
		/>

		{/* header */}
		<div style={{position: 'absolute', left: PAD, top: 64, right: PAD, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
			<Logo />
			<div style={{textAlign: 'right', color: MUTED, fontWeight: 600, fontSize: 18, lineHeight: 1.45, letterSpacing: '0.02em'}}>
				Better people.
				<br />
				Stronger teams.
				<br />
				<span style={{color: GOLD}}>Greater results.</span>
			</div>
		</div>

		{/* headline block */}
		<div style={{position: 'absolute', left: PAD, top: 232, right: PAD}}>
			<div style={{color: GOLD, fontWeight: 700, fontSize: 21, letterSpacing: '0.24em'}}>NOVEMBER 2026 TRAINING PROGRAMS</div>
			<div style={{marginTop: 22, fontWeight: 800, fontSize: 94, lineHeight: 1.02, letterSpacing: '-0.025em'}}>
				<div style={{color: WHITE}}>Your next level</div>
				<div style={{color: GOLD}}>starts here.</div>
			</div>
			<div style={{marginTop: 26, width: 560, color: MUTED, fontWeight: 500, fontSize: 28, lineHeight: 1.4}}>
				Practical learning for people, leaders, and businesses.
			</div>
		</div>

		{/* programs */}
		<div style={{position: 'absolute', left: PAD, top: 648, width: 460}}>
			{PROGRAMS.map((t, i) => (
				<Program key={t} n={i + 1} title={t} />
			))}
		</div>

		{/* trainer + call to action */}
		<div style={{position: 'absolute', left: PAD, bottom: 64}}>
			<div style={{borderLeft: `3px solid ${GOLD}`, paddingLeft: 16, marginBottom: 30}}>
				<div style={{color: WHITE, fontWeight: 700, fontSize: 21, letterSpacing: '0.06em'}}>MARIELLE RAYMUNDO</div>
				<div style={{color: MUTED, fontWeight: 500, fontSize: 18, marginTop: 5}}>HR & Organizational Development Leader</div>
				<div style={{color: GOLD, fontWeight: 700, fontSize: 15, letterSpacing: '0.14em', marginTop: 6}}>20+ YEARS EXPERIENCE</div>
			</div>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 14,
					padding: '18px 30px 18px 22px',
					borderRadius: 999,
					background: GOLD,
					color: NAVY,
					fontWeight: 700,
					fontSize: 23,
					boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
				}}
			>
				<ChatIcon />
				Message us to be the first to know
			</div>
		</div>
	</AbsoluteFill>
);

export const POST_WIDTH = W;
export const POST_HEIGHT = H;
