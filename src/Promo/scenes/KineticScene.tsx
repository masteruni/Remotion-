import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {thumbSrc} from '../../Keynote/components/Thumbnail';
import {ShotBlur, Stage} from '../components';
import {FONT, P, PINK, PINK_RGB} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** A word that racks into focus at `at`. */
const Word: React.FC<{children: React.ReactNode; at: number; pink?: boolean}> = ({children, at, pink}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [at, at + 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<span
			style={{
				display: 'inline-block',
				opacity: p,
				filter: `blur(${(1 - p) * 14}px)`,
				translate: `0px ${(1 - p) * 18}px`,
				color: pink ? PINK : P.text,
				textShadow: pink ? `0 0 30px rgba(${PINK_RGB},0.55)` : undefined,
				marginRight: '0.26em',
			}}
		>
			{children}
		</span>
	);
};

/** Inline stack of real reel thumbnails, like the reference's inline avatars. */
const ReelStack: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<span style={{display: 'inline-flex', verticalAlign: 'middle', marginRight: '0.26em'}}>
			{['2168-a', '4881-a', '10419-a'].map((t, k) => {
				const s = spring({frame: frame - at - k * 3, fps, config: {damping: 12, stiffness: 240, mass: 0.5}});
				return (
					<Img
						key={t}
						src={thumbSrc(t)}
						style={{
							width: 78,
							height: 78,
							objectFit: 'cover',
							borderRadius: '50%',
							border: `4px solid ${P.bg}`,
							marginLeft: k === 0 ? 0 : -24,
							scale: String(s),
							boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
						}}
					/>
				);
			})}
		</span>
	);
};

const Line: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 84}) => (
	<div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: '-0.035em', lineHeight: 1.18, textAlign: 'center'}}>{children}</div>
);

const Drift: React.FC<{duration: number; children: React.ReactNode}> = ({duration, children}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 70px', scale: String(interpolate(frame, [0, duration], [1, 1.05]))}}>
			{children}
		</AbsoluteFill>
	);
};

export const L1 = 48;
export const L2 = 30;
export const L3 = 27;

export const KineticScene: React.FC = () => (
	<AbsoluteFill>
		<Stage glow={0.8} />
		<Sequence durationInFrames={L1} name="Social media that people stop for">
			<ShotBlur duration={L1}>
				<Drift duration={L1}>
					<Line>
						<Word at={2}>Social</Word>
						<Word at={5}>media</Word>
						<Word at={8}>that</Word>
					</Line>
					<Line>
						<Word at={11}>people</Word>
						<ReelStack at={13} />
						<Word at={18} pink>
							stop
						</Word>
						<Word at={21} pink>
							for.
						</Word>
					</Line>
				</Drift>
			</ShotBlur>
		</Sequence>
		<Sequence from={L1} durationInFrames={L2} name="We plan, film, edit">
			<ShotBlur duration={L2}>
				<Drift duration={L2}>
					<Line size={72}>
						<Word at={1}>We</Word>
						<Word at={3}>plan,</Word>
						<Word at={5}>film,</Word>
						<Word at={7}>edit</Word>
					</Line>
					<Line size={72}>
						<Word at={10}>and</Word>
						<Word at={12} pink>
							post
						</Word>
						<Word at={14} pink>
							it.
						</Word>
					</Line>
				</Drift>
			</ShotBlur>
		</Sequence>
		<Sequence from={L1 + L2} durationInFrames={L3} name="Your story">
			<ShotBlur duration={L3} exitDir="none">
				<Drift duration={L3}>
					<Line size={64}>
						<Word at={1}>Your</Word>
						<Word at={3}>story.</Word>
					</Line>
					<Line size={64}>
						<Word at={7}>Our</Word>
						<Word at={9} pink>
							creative
						</Word>
						<Word at={11} pink>
							orbit.
						</Word>
					</Line>
				</Drift>
			</ShotBlur>
		</Sequence>
	</AbsoluteFill>
);
