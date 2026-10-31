import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Fine animated film grain to unify the CG and UI shots. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
			<svg width="100%" height="100%">
				<filter id="keynote-grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 97} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#keynote-grain)" />
			</svg>
		</AbsoluteFill>
	);
};
