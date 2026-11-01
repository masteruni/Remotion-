import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Series, staticFile} from 'remotion';
import {Grain} from '../Keynote/components/Grain';
import {SfxTrack} from '../Keynote/Sfx';
import {ContactScene} from './scenes/ContactScene';
import {FormatsScene} from './scenes/FormatsScene';
import {KineticScene, L1, L2} from './scenes/KineticScene';
import {LogoScene} from './scenes/LogoScene';
import {ServicesScene} from './scenes/ServicesScene';
import {SHOTS} from './theme';
import {PROMO_CUES} from './sfx';

export const PROMO_FRAMES = Object.values(SHOTS).reduce((a, b) => a + b, 0);
export {L1, L2};

export const Promo: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Series>
			<Series.Sequence durationInFrames={SHOTS.formats} name="Pick a format">
				<FormatsScene />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SHOTS.services} name="Services">
				<ServicesScene />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SHOTS.contact} name="Contact">
				<ContactScene />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SHOTS.kinetic} name="Kinetic type">
				<KineticScene />
			</Series.Sequence>
			<Series.Sequence durationInFrames={SHOTS.logo} name="Logo">
				<LogoScene />
			</Series.Sequence>
		</Series>
		<Grain opacity={0.06} />
		<Audio src={staticFile('audio/promo-music.wav')} volume={0.6} />
		<SfxTrack cues={PROMO_CUES} />
	</AbsoluteFill>
);
