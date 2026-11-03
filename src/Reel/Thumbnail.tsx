import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {FONT} from '../Keynote/theme';
import type {ReelJob, ReelProps} from './job';
import {Placeholder} from './Reel';

/**
 * Reel cover, 1080x1920. Everything that matters sits inside the centre 3:4
 * (y 240..1680), which is what the profile grid shows.
 */
const W = 1080;
const ACCENT = '#FFD60A';

const Frame: React.FC<{job: ReelJob; style: React.CSSProperties; box: {w: number; h: number}; zoom: number}> = ({
	job,
	style,
	box,
	zoom,
}) => {
	const c = job.crop ?? {x: 0, y: 0, w: job.width, h: job.height};
	const cx = job.reveal?.x ?? 0.5;
	const cy = job.reveal?.y ?? 0.45;
	const s = Math.max(box.w / c.w, box.h / c.h) * zoom;
	// keep the zoom centre in view without showing anything outside the crop
	const offX = Math.min(0, Math.max(box.w - c.w * s, box.w / 2 - cx * c.w * s)) - c.x * s;
	const offY = Math.min(0, Math.max(box.h - c.h * s, box.h / 2 - cy * c.h * s)) - c.y * s;
	return (
		<div style={{position: 'absolute', overflow: 'hidden', width: box.w, height: box.h, ...style}}>
			<OffthreadVideo
				src={staticFile(job.src)}
				muted
				trimBefore={Math.round(job.thumbnail.time * 30)}
				style={{position: 'absolute', left: offX, top: offY, width: job.width * s, height: job.height * s, maxWidth: 'none'}}
			/>
		</div>
	);
};

export const Thumbnail: React.FC<ReelProps> = ({data}) => {
	if (!data) return <Placeholder />;
	const words = data.thumbnail.text.split(/\s+/).filter(Boolean);
	const hl = data.thumbnail.highlight.length
		? data.thumbnail.highlight.map((w) => w.toLowerCase())
		: words.slice(-2).map((w) => w.toLowerCase());
	const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'*]/gu, '');
	const long = data.thumbnail.text.length > 26;

	return (
		<AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
			<Frame job={data} box={{w: W, h: 1920}} zoom={1} style={{filter: 'blur(40px) brightness(0.35)', transform: 'scale(1.1)'}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.85) 100%)'}} />

			{/* brand pill */}
			<div style={{position: 'absolute', top: 268, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						padding: '10px 24px 10px 10px',
						borderRadius: 40,
						background: 'rgba(255,255,255,0.16)',
						border: '1px solid rgba(255,255,255,0.18)',
						color: '#fff',
						fontSize: 30,
						fontWeight: 600,
					}}
				>
					<div style={{width: 52, height: 52, borderRadius: 26, background: data.brand.avatarBg ?? '#111', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Img src={staticFile(data.brand.avatar)} style={{width: '70%', height: '70%', objectFit: 'contain'}} />
					</div>
					{data.brand.handle}
				</div>
			</div>

			{/* hook */}
			<div
				style={{
					position: 'absolute',
					top: 370,
					left: 60,
					right: 60,
					textAlign: 'center',
					color: '#fff',
					fontSize: long ? 92 : 112,
					fontWeight: 900,
					lineHeight: 1.02,
					letterSpacing: -2,
					textTransform: 'uppercase',
					textShadow: '0 6px 30px rgba(0,0,0,0.7)',
				}}
			>
				{words.map((w, i) => (
					<span key={i} style={{color: hl.includes(clean(w)) ? ACCENT : '#fff'}}>
						{w}
						{i < words.length - 1 ? ' ' : ''}
					</span>
				))}
			</div>

			{/* the payoff frame */}
			<Frame
				job={data}
				box={{w: 960, h: 860}}
				zoom={1.25}
				style={{
					left: 60,
					top: 800,
					borderRadius: 36,
					border: `6px solid ${ACCENT}`,
					boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
				}}
			/>
		</AbsoluteFill>
	);
};
