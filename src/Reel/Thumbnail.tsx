import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {FONT} from '../Keynote/theme';
import type {ReelProps} from './job';
import {Placeholder, Verified} from './Reel';

/**
 * Reel cover, 1080x1920, in the account's house style: one frame of the clip
 * full-bleed (zoomed to fill), a navy fade top and bottom, and the account
 * lockup (big avatar, name + badge, handle) in the upper third. No headline.
 */
const W = 1080;
const H = 1920;
const NAVY = '6, 20, 88';

export const Thumbnail: React.FC<ReelProps> = ({data}) => {
	if (!data) return <Placeholder />;
	const job = data;
	const c = job.crop ?? {x: 0, y: 0, w: job.width, h: job.height};
	const cx = job.thumbnail.x ?? 0.5;
	const cy = job.thumbnail.y ?? 0.4;
	const s = Math.max(W / c.w, H / c.h) * (job.thumbnail.zoom ?? 1);
	// centre on (cx, cy) but never show anything outside the picture
	const offX = Math.min(0, Math.max(W - c.w * s, W / 2 - cx * c.w * s)) - c.x * s;
	const offY = Math.min(0, Math.max(H - c.h * s, H / 2 - cy * c.h * s)) - c.y * s;
	// slide the frame down when the face sits high in the picture; the navy fade covers the gap
	const shiftY = job.thumbnail.offsetY ?? 0;

	return (
		<AbsoluteFill style={{background: `rgb(${NAVY})`, fontFamily: FONT, overflow: 'hidden'}}>
			{/* clip to the picture so another page's template never shows */}
			<div
				style={{
					position: 'absolute',
					left: offX + c.x * s,
					top: offY + shiftY + c.y * s,
					width: c.w * s,
					height: c.h * s,
					overflow: 'hidden',
				}}
			>
				<OffthreadVideo
					src={staticFile(job.src)}
					muted
					trimBefore={Math.round(job.thumbnail.time * 30)}
					style={{
						position: 'absolute',
						left: -c.x * s,
						top: -c.y * s,
						width: job.width * s,
						height: job.height * s,
						maxWidth: 'none',
						filter: 'saturate(1.05) contrast(1.04)',
					}}
				/>
			</div>
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg,
						rgba(${NAVY},1) 0%,
						rgba(${NAVY},0.96) 7%,
						rgba(14,23,62,0.9) 15%,
						rgba(18,24,46,0.72) 24%,
						rgba(18,24,46,0) 38%,
						rgba(${NAVY},0) 66%,
						rgba(${NAVY},0.55) 82%,
						rgba(${NAVY},0.95) 100%)`,
				}}
			/>
			<div style={{position: 'absolute', top: 310, left: 95, display: 'flex', alignItems: 'center', gap: 64}}>
				<div
					style={{
						width: 240,
						height: 240,
						borderRadius: 120,
						overflow: 'hidden',
						background: job.brand.avatarBg ?? '#000',
						boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
						flexShrink: 0,
					}}
				>
					<Img src={staticFile(job.brand.avatar)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</div>
				<div style={{marginTop: -20}}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							fontSize: 64,
							fontWeight: 700,
							letterSpacing: -1.5,
							color: 'rgba(226,228,255,0.78)',
							whiteSpace: 'nowrap',
						}}
					>
						{job.brand.name}
						{job.brand.verified ? <Verified size={70} /> : null}
					</div>
					<div style={{fontSize: 46, fontStyle: 'italic', color: 'rgba(255,255,255,0.32)', marginTop: 2}}>
						{job.brand.handle}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
