---
name: reel-from-link
description: Turn an Instagram reel link into a repost in the account's format (tweet-card video, thumbnail, caption). Use whenever the user sends an instagram.com/reel/... (or /p/, /tv/) link, or asks to "edit this like the reference", "make the reel / thumbnail / caption" for a link.
---

# Reel from link

The user sends an Instagram link. You deliver three things in `out/reels/<slug>/`:
`reel.mp4` (1080x1920), `thumbnail.jpg` (1080x1920 cover) and `caption.txt`.

The format comes from the reference reel (instagram.com/reel/DfBgrJXTT0b). It's a black 9:16 frame with an account
header (avatar, name, verified badge, handle) and a one-line hook. The clip sits in the middle with
phrase subtitles.

**Format only. Never edit the raw video.** The user asked for this explicitly. The clip plays exactly as it came:
no punch-ins, zooms, flashes, sound effects, meme cut-ins, speed changes or trims. Leave `punchIns` and `flashes`
empty, `reveal` null, `inserts` empty, and `trim` at the full length. Your only job on the video is to place it in
the card. Cropping the clip out of another page's template or letterboxing is part of placing it, so that's fine.
The code is in `src/Reel/` (compositions `Reel` and `ReelThumbnail`). The account header comes from `reel.brand.json`. The account is The AI Edge Daily (@theaiedgedaily).

## Steps

1. **Setup (once per container):** `pip install -q -r scripts/reel/requirements.txt` and `npm install` if
   `node_modules` is missing.
2. **Prepare:** `npm run reel -- "<link>" --prepare-only`
   This downloads the clip, finds the picture inside letterboxing or another page's template,
   transcribes it (faster-whisper `small.en`, add `--model small` for non-English), detects cuts,
   and writes `public/reels/<slug>/job.json` and `sheet.jpg` (a 2 fps contact sheet).
   If the download fails with a login error, ask the user for an Instagram cookies.txt and save it as
   `reel.cookies.txt` in the repo root (gitignored).
3. **Look before formatting.** Read `sheet.jpg` and the `words` and `subtitles` in `job.json`, then edit `job.json`:
   - `crop`: check that it covers exactly the picture. It must not include another page's header or hook text,
     and it must not cut into the picture.
   - `showSubtitles`: set it to `false` if the clip already has burned-in captions, so you don't add a second set.
     If there is no speech, the list is simply empty.
   - `subtitles`: fix transcription mistakes and split awkward pages. Sensitive words are auto-masked (`pr*stitute`).
4. **Write the copy.** Write it fresh; never paste the original caption.
   - `headline` (on the video, under the handle): at most about 50 characters. Use a curiosity hook that doesn't
     spoil the payoff. Plain text, no emoji (the renderer has no emoji font).
   - `thumbnail`: the cover uses the account's house style, which is one frame of the clip full-bleed with a navy fade
     at the top and bottom and the big avatar, name, badge and handle lockup. There is no headline text. Choose
     `time` for a strong face close-up or reaction, and avoid frames with burned-in captions near the top (they show
     behind the lockup). Set `x`/`y` (0..1 of the picture) to centre the crop on the face, and use `zoom` (>1) to
     tighten it. If the face sits high in the picture and the lockup would cover it, set `offsetY` (px, ~300–400)
     to slide the frame down. The navy fade fills the gap. Always render the cover and check the face is clear.
   - `caption`: a hook line, then one line of context, "watch till the end" style retention bait,
     `Follow @theaiedgedaily for daily clips that hit different ⚡`, a credit line `🎥 @<original creator>` when the clip isn't our own (always keep it), `-`, and 5–10 hashtags
     relevant to the clip plus a few broad ones.
5. **Check:** `npx remotion still Reel out/check.png --frame=<n> --browser-executable=/opt/pw-browsers/chromium`
   on a frame with a subtitle, and render the thumbnail. Look at both.
6. **Render:** `npm run reel -- --slug <slug>`. It renders the video, thumbnail and caption, and points
   `public/reels/latest.json` at this job so Studio's `Reels` folder previews it.
7. **Deliver:** send `reel.mp4` and `thumbnail.jpg` with SendUserFile, and paste the caption in chat so the user
   can copy it.

## Notes
- Downloaded clips belong to their creators. Keep the credit line. If the user hasn't said they have permission to
  repost, mention it once and don't nag.
- `public/reels/` and `out/` are gitignored. Don't commit clips.
- Each render takes about 1–2 minutes (no WebGL).
