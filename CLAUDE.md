# Remotion video project

Videos are written as React components with Remotion 4.

- `src/index.ts` is the entry point. It registers `src/Root.tsx`.
- `src/Root.tsx` declares each `<Composition>` (id, fps, size, duration, schema, default props).
- `src/HelloWorld/` holds the starter scenes. Put new scenes in their own folders under `src/`.
- `public/` holds static assets (video, audio, images, fonts). Load them with `staticFile("name.ext")`.

## Commands
- `npm run dev`: open Remotion Studio to preview
- `npx remotion compositions`: list compositions
- `npx remotion render <CompId> out/<name>.mp4`: render a video (`out/` is gitignored)
- `npx remotion still <CompId> out/frame.png --frame=60`: render one frame to check it
- `npm run lint`: ESLint plus the TypeScript check

## Cloud sessions
Add `--browser-executable=/opt/pw-browsers/chromium` to render and still commands to use the Chromium that is already installed.

## Conventions
- Drive animation from `useCurrentFrame()` with `interpolate()` or `spring()`. Never use CSS transitions or `setTimeout`, because frames render on their own.
- Use `<Sequence>` or `<Series>` for timing, `<OffthreadVideo>` for video clips, `<Audio>` for sound, and `<Img>` for images.

## Skills
`.claude/skills/remotion-best-practices/` is Remotion's official skill (router plus topic references). It was copied from github.com/remotion-dev/skills at commit 30d4553 (v4.0.539). Load it before writing or editing compositions. To update it, copy that folder again from the upstream repo.

## LeilunaKeynote (10s, 1920x1080, 30fps)
- `src/Keynote/Keynote.tsx` strings six shots together with `<Series>`. Scene lengths are in `src/Keynote/theme.ts` (`SCENES`).
- Each scene in `src/Keynote/scenes/` wraps its content in `<Shot>` (`components/Shot.tsx`), which does the whip-pan cuts with SVG directional motion blur.
- `ObjectsScene` is real 3D (`@remotion/three`). Rendering it needs WebGL. Use `--gl=swangle` in cloud sessions (no GPU, slow: about 8s a frame). Use the default or `--gl=angle` on a Mac.
- The footage card uses a stand-in drawn in code. Pass `footageSrc` (a path inside `public/`, e.g. `footage/hand-scroll.mp4`) to use a real clip.
- The soundtrack is synthesized: `npm run soundtrack` regenerates `public/audio/keynote-soundtrack.wav`. Its cues are timed to the scene frames, so update them if the timing changes.
- 4K: add `--scale=2` to the render command.
