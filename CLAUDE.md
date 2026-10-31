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
