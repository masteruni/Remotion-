import React from 'react';
import {DirectionalBlur} from './DirectionalBlur';

/**
 * Rolling digits. `value` can be fractional; each digit column spins with the
 * value beneath it, and gets vertical motion blur from `speed` (0..1).
 */
export const Odometer: React.FC<{
	value: number;
	digits: number;
	fontSize: number;
	speed: number;
	style?: React.CSSProperties;
}> = ({value, digits, fontSize, speed, style}) => {
	const lineH = fontSize * 1.1;
	const cols = [];
	for (let i = digits - 1; i >= 0; i--) {
		const place = Math.pow(10, i);
		// Continuous position of this digit wheel.
		// Ones wheel turns continuously; higher wheels only turn while the wheel below rolls over.
		const below = (value % place) / place;
		const carry = i === 0 ? value % 1 : Math.max(0, (below - 0.9) / 0.1);
		const wheel = (Math.floor(value / place) % 10) + carry;
		const hidden = i > 0 && value < place;
		cols.push(
			<div
				key={i}
				style={{
					position: 'relative',
					height: lineH,
					width: hidden ? 0 : fontSize * 0.62,
					overflow: 'hidden',
				}}
			>
				<DirectionalBlur x={0} y={speed * (6 - i * 2.2)} style={{inset: 0}}>
					<div style={{translate: `0px ${-wheel * lineH}px`}}>
						{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
							<div key={k} style={{height: lineH, lineHeight: `${lineH}px`, textAlign: 'center'}}>
								{d}
							</div>
						))}
					</div>
				</DirectionalBlur>
			</div>,
		);
	}
	return (
		<div style={{display: 'flex', fontSize, fontVariantNumeric: 'tabular-nums', ...style}}>
			{cols}
		</div>
	);
};
