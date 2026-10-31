import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {DirectionalBlur} from './DirectionalBlur';

export type Whip = 'left' | 'right' | 'up' | 'down' | 'zoom';

const VECTORS: Record<Whip, [number, number]> = {
	left: [-1, 0],
	right: [1, 0],
	up: [0, -1],
	down: [0, 1],
	zoom: [0, 0],
};

const ENTER_FRAMES = 7;
const EXIT_FRAMES = 5;
const MAX_BLUR = 48;

/**
 * One shot of the edit. Handles the whip-pan cut in and out:
 * the content flies along the cut direction with directional motion blur,
 * and the background gets a lighter blur with a little parallax.
 */
export const Shot: React.FC<{
	durationInFrames: number;
	enter?: Whip;
	exit?: Whip;
	background: React.ReactNode;
	children: React.ReactNode;
}> = ({durationInFrames, enter, exit, background, children}) => {
	const frame = useCurrentFrame();
	const {width} = useVideoConfig();

	const enterP = enter
		? interpolate(frame, [0, ENTER_FRAMES], [1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.cubic),
			})
		: 0;
	const exitP = exit
		? interpolate(
				frame,
				[durationInFrames - EXIT_FRAMES, durationInFrames - 1],
				[0, 1],
				{
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.in(Easing.cubic),
				},
			)
		: 0;

	const dist = width * 0.45;
	const [ex, ey] = enter ? VECTORS[enter] : [0, 0];
	const [xx, xy] = exit ? VECTORS[exit] : [0, 0];
	const tx = -ex * enterP * dist + xx * exitP * dist;
	const ty = -ey * enterP * dist + xy * exitP * dist;

	const zoomIn = enter === 'zoom' ? enterP : 0;
	const zoomOut = exit === 'zoom' ? exitP : 0;
	const scale = 1 + zoomIn * 0.25 + zoomOut * 0.4;

	const blurAmount = (enterP + exitP) * MAX_BLUR;
	const axisX = Math.abs(enterP > exitP ? ex : xx);
	const axisY = Math.abs(enterP > exitP ? ey : xy);
	const isZoom = (enterP > exitP ? enter : exit) === 'zoom';
	const bx = isZoom ? blurAmount * 0.35 : blurAmount * axisX;
	const by = isZoom ? blurAmount * 0.35 : blurAmount * axisY;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<DirectionalBlur
				x={bx * 0.6}
				y={by * 0.6}
				edgeMode="duplicate"
				style={{
					translate: `${tx * 0.06}px ${ty * 0.06}px`,
					scale: String(1.12 + (scale - 1) * 0.5),
				}}
			>
				{background}
			</DirectionalBlur>
			<DirectionalBlur
				x={bx}
				y={by}
				style={{translate: `${tx}px ${ty}px`, scale: String(scale)}}
			>
				{children}
			</DirectionalBlur>
		</AbsoluteFill>
	);
};
