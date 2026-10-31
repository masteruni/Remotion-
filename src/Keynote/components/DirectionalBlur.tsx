import React, {useId} from 'react';

/**
 * Wraps children in an SVG Gaussian blur that can differ per axis,
 * which reads as directional motion blur (x for horizontal moves, y for vertical).
 */
export const DirectionalBlur: React.FC<{
	x: number;
	y: number;
	edgeMode?: 'none' | 'duplicate';
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({x, y, edgeMode = 'none', style, children}) => {
	const id = 'dblur-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const active = x > 0.05 || y > 0.05;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				...style,
				filter: active ? `url(#${id})` : undefined,
			}}
		>
			<svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
				<defs>
					<filter
						id={id}
						x="-50%"
						y="-50%"
						width="200%"
						height="200%"
						colorInterpolationFilters="sRGB"
					>
						<feGaussianBlur
							stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`}
							edgeMode={edgeMode}
						/>
					</filter>
				</defs>
			</svg>
			{children}
		</div>
	);
};
