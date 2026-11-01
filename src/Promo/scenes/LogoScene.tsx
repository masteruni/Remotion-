import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crescents, Stage} from '../components';
import {FONT, P, PINK, PINK_RGB} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ICON_H = 210;
const ICON_W = (ICON_H * 563) / 479;
const WORD_W = 520; // wordmark art is 563 wide; leiluna 563x162, studio 563x50
const GAP = 34;
const SLIDE_AT = 16;

export const LogoScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
	const slide = spring({frame: frame - SLIDE_AT, fps, config: {damping: 20, stiffness: 120}});
	const wipe = interpolate(frame, [SLIDE_AT + 4, SLIDE_AT + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const url = spring({frame: frame - 40, fps, config: {damping: 16, stiffness: 140}});
	const glow = interpolate(frame, [0, 4, 24], [2.2, 1.6, 1], clamp);
	// Icon starts centred, ends at the left of the lockup.
	const lockupW = ICON_W + GAP + WORD_W;
	const iconX = interpolate(slide, [0, 1], [0, -(lockupW / 2 - ICON_W / 2)]);
	const mask = `linear-gradient(90deg, black ${wipe * 130 - 30}%, transparent ${wipe * 130}%)`;

	return (
		<AbsoluteFill>
			<Stage glow={1.2 + (glow - 1) * 0.5} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', scale: String(interpolate(frame, [0, 75], [0.97, 1.03]))}}>
				<div style={{position: 'relative', width: lockupW, height: ICON_H}}>
					<div
						style={{
							position: 'absolute',
							left: lockupW / 2 - ICON_W / 2,
							top: 0,
							translate: `${iconX}px 0px`,
							scale: String(interpolate(pop, [0, 1], [0.4, 1])),
							filter: `drop-shadow(0 0 ${24 * glow}px rgba(${PINK_RGB},${0.5 * glow}))`,
						}}
					>
						<Crescents height={ICON_H} />
					</div>
					<div
						style={{
							position: 'absolute',
							left: ICON_W + GAP,
							top: ICON_H / 2 - 82,
							width: WORD_W,
							maskImage: mask,
							WebkitMaskImage: mask,
							filter: `blur(${(1 - wipe) * 8}px)`,
						}}
					>
						<Img src={staticFile('brand/wordmark-leiluna.png')} style={{width: WORD_W, display: 'block'}} />
						<Img src={staticFile('brand/wordmark-studio.png')} style={{width: WORD_W, display: 'block', marginTop: 4}} />
					</div>
				</div>
				<div
					style={{
						marginTop: 90,
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						padding: '20px 36px',
						borderRadius: 999,
						background: P.panel,
						border: `1.5px solid rgba(${PINK_RGB},0.45)`,
						boxShadow: `0 0 40px rgba(${PINK_RGB},0.25)`,
						fontFamily: FONT,
						fontWeight: 600,
						fontSize: 36,
						color: P.text,
						opacity: url,
						translate: `0px ${(1 - url) * 30}px`,
					}}
				>
					<svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth={2} strokeLinecap="round">
						<circle cx="12" cy="12" r="9" />
						<path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
					</svg>
					leilunastudio.com
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
