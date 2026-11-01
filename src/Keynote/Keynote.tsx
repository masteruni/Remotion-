import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Series, staticFile, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Grain} from './components/Grain';
import {Sfx} from './Sfx';
import {CardScene} from './scenes/CardScene';
import {LogoScene} from './scenes/LogoScene';
import {ObjectsScene} from './scenes/ObjectsScene';
import {ProfileScene} from './scenes/ProfileScene';
import {TitleScene} from './scenes/TitleScene';
import {WallScene} from './scenes/WallScene';
import {SCENES} from './theme';

export const keynoteSchema = z.object({
	/** Optional clip in public/ (e.g. "footage/hand-scroll.mp4") for the 5–6.5s card. Empty = built-in stand-in. */
	footageSrc: z.string(),
	soundtrack: z.boolean(),
});

export const Keynote: React.FC<z.infer<typeof keynoteSchema>> = ({footageSrc, soundtrack}) => {
	const {fps} = useVideoConfig();
	const d = (s: number) => Math.round(s * fps);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Series>
				<Series.Sequence durationInFrames={d(SCENES.title)} name="Content that performs">
					<TitleScene durationInFrames={d(SCENES.title)} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={d(SCENES.objects)} name="3D objects">
					<ObjectsScene durationInFrames={d(SCENES.objects)} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={d(SCENES.wall)} name="Thumbnail wall">
					<WallScene durationInFrames={d(SCENES.wall)} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={d(SCENES.card)} name="Footage card">
					<CardScene durationInFrames={d(SCENES.card)} footageSrc={footageSrc} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={d(SCENES.profile)} name="Profile card">
					<ProfileScene durationInFrames={d(SCENES.profile)} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={d(SCENES.logo)} name="Leiluna Studio">
					<LogoScene durationInFrames={d(SCENES.logo)} />
				</Series.Sequence>
			</Series>
			<Grain />
			{soundtrack ? (
				<>
					<Audio src={staticFile('audio/keynote-music.wav')} volume={0.62} />
					<Sfx />
				</>
			) : null}
		</AbsoluteFill>
	);
};
