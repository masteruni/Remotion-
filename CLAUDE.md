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
- The footage card uses a royalty-free stock clip (see `public/footage/CREDITS.md`). The hand is keyed and its screen tracked by `scripts/prepare-hand-footage.py`, and `components/StockHandFootage.tsx` puts a vertical video into the screen. Pass `footageSrc` (a path inside `public/`) to use a different, ready-made clip instead.
- The ending animates the client's logo, split into layers in `public/brand/` (`leiluna-logo.png` is the original lockup).
- Audio has two layers:
  - Music: synthesized beat, bass, pads and sub hit. `npm run soundtrack` regenerates `public/audio/keynote-music.wav`.
  - Sound effects: Pixabay samples in `public/sfx/` (sources and licenses in `public/sfx/CREDITS.md`), placed by `src/Keynote/Sfx.tsx`. Each cue says which frame its peak should land on.
  - Update both if the scene timing changes. `scripts/prepare-sfx.py` re-trims and normalizes the samples.
- Only use sound effects and footage with a verified commercial-use license (Pixabay Content License, Mixkit Free License). The FASTEDITOR pack has no license and contains copyrighted game audio.
- Rendering in a cloud session: add `--concurrency=1 --timeout=120000`. Software WebGL in parallel tabs sometimes freezes on the 3D shot.
- 4K: add `--scale=2` to the render command.

## LeilunaSitePromo (12s, 1080x1920 vertical, 30fps)
- Promo for leilunastudio.com, in the style of a dark product-UI fly-through. All copy and numbers come from the live site.
- `src/Promo/Promo.tsx` runs five shots (lengths in `src/Promo/theme.ts`): format picker, services list expanding into results, contact input, kinetic headline lines, logo lockup with the URL.
- Reuses the keynote's thumbnails, brand layers and sound-effect files. Cues are in `src/Promo/sfx.ts`. Music: `node scripts/generate-soundtrack.mjs --music-only --plain --length=12 --drop=9.5 --out=promo-music.wav`.
- No WebGL, so it renders fast: `npx remotion render LeilunaSitePromo out/leiluna-site-promo.mp4 --concurrency=3`.

## Reels from Instagram links (Reel, ReelThumbnail: 1080x1920, 30fps)
- When the user sends an Instagram reel link, follow `.claude/skills/reel-from-link/SKILL.md`. It produces the edited reel, a thumbnail and a caption in `out/reels/<slug>/`.
- `npm run reel -- <link> --prepare-only` downloads, transcribes and writes the edit plan `public/reels/<slug>/job.json`. Edit that file, then run `npm run reel -- --slug <slug>` to render.
- Format only: never edit the raw clip (no zooms, flashes, sound effects, cut-ins or trims). It plays untouched inside the card. Code is in `src/Reel/` (tweet-card repost style: account header and hook, clip with phrase subtitles). The account (The AI Edge Daily) comes from `reel.brand.json`. Thumbnails use its house style: a full-bleed frame, a navy fade, and the avatar/name/handle lockup.
- Python deps: `pip install -r scripts/reel/requirements.txt`. Downloaded clips stay out of git (`public/reels/` is ignored).
