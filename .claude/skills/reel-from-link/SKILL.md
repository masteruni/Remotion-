---
name: reel-from-link
description: Turn an Instagram reel link into a finished repost edit (tweet-card style video, thumbnail, caption). Use whenever the user sends an instagram.com/reel/... (or /p/, /tv/) link, or asks to "edit this like the reference", "make the reel / thumbnail / caption" for a link.
---

# Reel from link

The user sends an Instagram link. You deliver three things in `out/reels/<slug>/`:
`reel.mp4` (1080x1920), `thumbnail.jpg` (1080x1920 cover) and `caption.txt`.

The look copies the reference reel (instagram.com/reel/DfBgrJXTT0b). It's a black 9:16 frame with an account
header (avatar, name, verified badge, handle) and a one-line hook. The clip sits in the middle with
phrase subtitles, hard punch-in zooms on phrases, white flash cuts, and a slow push-in on the payoff.
The code is in `src/Reel/` (compositions `Reel` and `ReelThumbnail`). The account header comes from `reel.brand.json`.

## Steps

1. **Setup (once per container):** `pip install -q -r scripts/reel/requirements.txt` and `npm install` if
   `node_modules` is missing.
2. **Prepare:** `npm run reel -- "<link>" --prepare-only`
   This downloads the clip, finds the picture inside letterboxing or another page's template,
   transcribes it (faster-whisper `small.en`, add `--model small` for non-English), detects cuts,
   and writes `public/reels/<slug>/job.json` and `sheet.jpg` (a 2 fps contact sheet).
   If the download fails with a login error, ask the user for an Instagram cookies.txt and save it as
   `reel.cookies.txt` in the repo root (gitignored).
3. **Look before editing.** Read `sheet.jpg` and the `words` and `subtitles` in `job.json`, then edit `job.json`:
   - `showSubtitles`: set it to `false` if the clip already has burned-in captions, so you don't add a second set.
     Zooms then anchor to the top edge so those captions stay in frame.
   - `subtitles`: fix transcription mistakes and split awkward pages. Sensitive words are auto-masked (`pr*stitute`).
   - `reveal`: put `at` on the payoff moment (the twist or punchline cut). If the source already zooms there, use a
     smaller `scale` (1.15–1.25). Use `x`/`y` (0..1) to aim the zoom.
   - `flashes`: white flash cuts, usually on hard cuts into a reaction or the payoff. 2–4 is plenty.
   - `inserts`: optional reaction-meme cut-ins `{at, duration, src, audio?}` from files the user supplied in
     `public/`. Never download memes from the internet.
   - `trim`: cut dead air at the start or end.
4. **Write the copy.** Write it fresh; never paste the original caption.
   - `headline` (on the video, under the handle): at most about 50 characters. Use a curiosity hook that doesn't
     spoil the payoff. Plain text, no emoji (the renderer has no emoji font).
   - `thumbnail.text`: 2–5 punchy words. `highlight`: the 1–2 words to colour yellow. Set `thumbnail.time` to
     a frame that sets up the story without giving away the twist.
   - `caption`: a hook line, then one line of context, "watch till the end" style retention bait,
     `Follow <brand handle> ...`, a credit line `🎥 @<original creator>` (always keep it), `-`, and 5–10 hashtags
     relevant to the clip plus a few broad ones.
5. **Check:** `npx remotion still Reel out/check.png --frame=<n> --browser-executable=/opt/pw-browsers/chromium`
   on a punch-in frame and the reveal, and look at them.
6. **Render:** `npm run reel -- --slug <slug>`. It renders the video, thumbnail and caption, and points
   `public/reels/latest.json` at this job so Studio's `Reels` folder previews it.
7. **Deliver:** send `reel.mp4` and `thumbnail.jpg` with SendUserFile, and paste the caption in chat so the user
   can copy it.

## Notes
- Downloaded clips belong to their creators. Keep the credit line. If the user hasn't said they have permission to
  repost, mention it once and don't nag.
- `public/reels/` and `out/` are gitignored. Don't commit clips.
- Each render takes about 1–2 minutes (no WebGL).
