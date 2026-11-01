import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, staticFile, useVideoConfig} from 'remotion';

/**
 * Sample-based sound effects (Pixabay, see public/sfx/CREDITS.md), each placed
 * so its loudest moment lands on the visual event.
 *
 * at:   the event, in frames from the start of the video
 * peak: seconds into the file where the sound peaks (prepared by scripts/prepare-sfx.py)
 */
type Cue = {file: string; at: number; peak: number; volume: number};

const CUT_1 = 45; // title -> objects
const CUT_2 = 90; // objects -> wall
const CUT_3 = 150; // wall -> card
const CUT_4 = 195; // card -> profile
const LOGO = 240; // profile -> logo (bass hit)

const CUES: Cue[] = [
	// Title: words focus in, "performs" snaps
	{file: 'ui-tick', at: 1, peak: 0.08, volume: 0.35},
	{file: 'ui-tick', at: 6, peak: 0.08, volume: 0.35},
	{file: 'whoosh-pointer', at: 14, peak: 0.31, volume: 0.45},
	{file: 'pop-bubble', at: 15, peak: 0.12, volume: 0.4},
	// Cuts
	{file: 'whoosh-fast', at: CUT_1, peak: 0.56, volume: 0.55},
	{file: 'swoosh', at: CUT_2, peak: 0.29, volume: 0.5},
	{file: 'whoosh-fast', at: CUT_3, peak: 0.56, volume: 0.5},
	{file: 'swoosh', at: CUT_4, peak: 0.29, volume: 0.5},
	// Wall: hero thumbnail lifts, badge pops
	{file: 'riser-sharp', at: CUT_2 + 30, peak: 1.78, volume: 0.4},
	{file: 'notification', at: CUT_2 + 38, peak: 0.07, volume: 0.45},
	// Card: thumb scroll
	{file: 'whoosh-pointer', at: CUT_3 + 18, peak: 0.31, volume: 0.25},
	// Profile: icon pops, card opens, counter rolls, tiles fill
	{file: 'pop-ui', at: CUT_4 + 1, peak: 0.02, volume: 0.4},
	{file: 'ui-tick-roll', at: CUT_4 + 13, peak: 0, volume: 0.3},
	...[0, 1, 2, 3, 4, 5].map((i) => ({
		file: i % 2 === 0 ? 'pop-multi' : 'pop-ui-2',
		at: CUT_4 + 18 + i * 3,
		peak: 0.03,
		volume: 0.28,
	})),
	// Logo: riser into the hit, moons lock with a twinkle, wordmark wipe
	{file: 'riser-impact', at: LOGO, peak: 2.66, volume: 0.5},
	{file: 'magic-twinkle', at: LOGO + 11, peak: 0.16, volume: 0.55},
	{file: 'swoosh', at: LOGO + 22, peak: 0.29, volume: 0.25},
];

export const Sfx: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			{CUES.map((cue, i) => {
				const from = cue.at - Math.round(cue.peak * fps);
				// A cue that would start before frame 0 is trimmed instead.
				const trimBefore = from < 0 ? -from : 0;
				return (
					<Sequence key={i} from={Math.max(0, from)} layout="none" name={`sfx ${cue.file}`}>
						<Audio src={staticFile(`sfx/${cue.file}.wav`)} volume={cue.volume} trimBefore={trimBefore} />
					</Sequence>
				);
			})}
		</>
	);
};
