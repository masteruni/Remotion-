#!/usr/bin/env python3
"""
Prepare an Instagram (or any yt-dlp supported) clip for the `Reel` composition.

    python3 -I scripts/reel/prepare.py <url> [--slug NAME] [--model base.en] [--fresh]

Writes into public/reels/<slug>/ (gitignored):
  source.mp4   the clip, re-encoded to constant 30fps H.264 for frame-accurate seeking
  info.json    yt-dlp metadata (original caption, uploader, ...)
  job.json     the edit plan the Reel / ReelThumbnail compositions read

job.json is meant to be edited: headline, subtitle text, zooms, flashes,
meme inserts, thumbnail text and the post caption all live there.
Re-running without --fresh keeps every editable field and only refreshes
the measured ones (duration, crop box, words).
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
BRAND_FILE = ROOT / "reel.brand.json"
FPS = 30

# Words masked like the reference ("pr*stitute"). Keeps captions safe for reach.
CENSOR = [
    "fuck", "fucking", "fucked", "shit", "bitch", "ass", "asshole", "damn", "dick",
    "pussy", "cock", "whore", "slut", "prostitute", "prostitutes", "hooker", "sex",
    "kill", "killed", "killing", "murder", "murdered", "dead", "suicide", "drugs",
    "cocaine", "gun", "shot", "shooting", "rape", "nigga", "nigger",
]


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def censor(word: str) -> str:
    core = re.sub(r"[^A-Za-z]", "", word).lower()
    if core in CENSOR and len(core) > 2:
        # replace the first vowel after the first letter with *
        m = re.search(r"(?<=[A-Za-z])[aeiouAEIOU]", word)
        if m:
            return word[: m.start()] + "*" + word[m.end():]
    return word


def download(url: str, out_dir: Path) -> Path:
    raw = out_dir / "download.mp4"
    cmd = [
        sys.executable, "-m", "yt_dlp", url,
        "-f", "bv*[height<=1920]+ba/b", "--merge-output-format", "mp4",
        "-o", str(raw), "--write-info-json", "--no-playlist", "--force-overwrites",
    ]
    cookies = ROOT / "reel.cookies.txt"
    if cookies.exists():
        cmd += ["--cookies", str(cookies)]
    run(cmd)
    info_tmp = out_dir / "download.info.json"
    if info_tmp.exists():
        shutil.move(info_tmp, out_dir / "info.json")
    src = out_dir / "source.mp4"
    run([
        "ffmpeg", "-y", "-v", "error", "-i", str(raw),
        "-vf", f"fps={FPS},scale='trunc(iw/2)*2':'trunc(ih/2)*2'",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-g", str(FPS),
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        str(src),
    ])
    raw.unlink()
    return src


def probe(src: Path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration", "-of", "json", str(src),
    ])
    d = json.loads(out)
    s = d["streams"][0]
    return int(s["width"]), int(s["height"]), float(d["format"]["duration"])


def detect_content_box(src: Path, w: int, h: int, duration: float):
    """Find the moving picture inside letterboxing / repost templates.

    Rows and columns count as picture when they are bright on average or change
    over time; static black bars with a little header text are neither.
    """
    sw = 180
    sh = int(round(h * sw / w))
    n = 16
    frames = []
    for i in range(n):
        t = duration * (i + 0.5) / n
        raw = subprocess.check_output([
            "ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(src), "-frames:v", "1",
            "-vf", f"scale={sw}:{sh}", "-f", "rawvideo", "-pix_fmt", "gray", "-",
        ])
        if len(raw) == sw * sh:
            frames.append(np.frombuffer(raw, np.uint8).reshape(sh, sw).astype(np.float32))
    if len(frames) < 4:
        return None
    stack = np.stack(frames)
    mean = stack.mean(axis=0)
    std = stack.std(axis=0)

    def longest_run(mask, gap=2):
        best, cur_start, last_true = (0, 0), None, -10
        for i, v in enumerate(mask):
            if v:
                if cur_start is None or i - last_true > gap + 1:
                    cur_start = i
                last_true = i
                if last_true - cur_start > best[1] - best[0]:
                    best = (cur_start, last_true)
        return best

    rows = (mean.mean(axis=1) > 45) | (std.mean(axis=1) > 10)
    y0, y1 = longest_run(rows)
    band = slice(y0, y1 + 1)
    cols = (mean[band].mean(axis=0) > 45) | (std[band].mean(axis=0) > 10)
    x0, x1 = longest_run(cols)
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    if bw >= sw * 0.94 and bh >= sh * 0.94:
        return None  # already full frame
    if bw < sw * 0.3 or bh < sh * 0.15:
        return None  # detection failed, do not crop to a sliver
    scale = w / sw
    x, y = int(x0 * scale), int(y0 * scale)
    cw, ch = int(bw * scale), int(bh * scale)
    # shave 1% so compression fringes at the edge never show
    px, py = int(cw * 0.01), int(ch * 0.01)
    return {"x": x + px, "y": y + py, "w": cw - 2 * px, "h": ch - 2 * py}


def transcribe(src: Path, model_name: str):
    from faster_whisper import WhisperModel

    raw = subprocess.check_output(
        ["ffmpeg", "-v", "error", "-i", str(src), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]
    )
    audio = np.frombuffer(raw, np.float32)
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, word_timestamps=True, vad_filter=True)
    words = []
    for seg in segments:
        for wd in seg.words or []:
            text = wd.word.strip()
            if text:
                words.append({
                    "text": text,
                    "startMs": int(wd.start * 1000),
                    "endMs": int(wd.end * 1000),
                })
    return words, info.language


def scene_cuts(src: Path, crop):
    """Hard cuts inside the picture area (black template bars would hide them)."""
    vf = "select='gt(scene,0.2)',showinfo"
    if crop:
        vf = f"crop={crop['w']}:{crop['h']}:{crop['x']}:{crop['y']}," + vf
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src), "-vf", vf, "-an", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    cuts = []
    for t in (float(x) for x in re.findall(r"pts_time:([0-9.]+)", out)):
        if not cuts or t - cuts[-1] > 0.4:  # one cut per transition
            cuts.append(round(t, 2))
    return cuts


def contact_sheet(src: Path, out: Path, duration: float):
    """2 fps grid so the editor can eyeball the clip (burned-in captions, inserts, the payoff)."""
    cols = 6
    rows = max(1, int(np.ceil(duration * 2 / cols)))
    run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf",
         f"fps=2,scale=240:-2,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=16:fontcolor=yellow:box=1:boxcolor=black,"
         f"tile={cols}x{rows}", "-frames:v", "1", str(out)])


def build_pages(words, max_words=6, max_chars=30, gap_ms=350):
    pages, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        text = " ".join(x["text"] for x in cur)
        end_punct = re.search(r"[.?!]$", w["text"])
        if (
            nxt is None
            or end_punct
            or ((len(cur) >= max_words or len(text) >= max_chars)
                # never strand the last word of a sentence on its own page
                and not (nxt and re.search(r"[.?!,]$", nxt["text"]) and len(text) < max_chars + 10))
            or nxt["startMs"] - w["endMs"] > gap_ms
            or (re.search(r",$", w["text"]) and len(cur) >= 3)
        ):
            pages.append({
                "text": " ".join(censor(x["text"]) for x in cur),
                "startMs": cur[0]["startMs"],
                # hold the page until the next one starts (max +600ms) so it never blinks
                "endMs": min(nxt["startMs"], w["endMs"] + 600) if nxt else w["endMs"] + 600,
            })
            cur = []
    return pages


def plan_edit(pages, cuts, duration):
    """Reference-style edit: hard punch-ins per phrase, white flashes, slow push on the reveal."""
    punch = []
    pattern = [1.0, 1.18, 1.0, 1.32]
    for i, p in enumerate(pages):
        scale = pattern[i % len(pattern)]
        if p["text"].endswith(("?", "!")):
            scale = 1.32
        punch.append({"at": round(p["startMs"] / 1000, 2), "scale": scale})

    # The reveal: last scene cut in the final 40%, else the start of the last third.
    late = [c for c in cuts if duration * 0.6 <= c <= duration - 1.5]
    reveal = late[-1] if late else (
        pages[int(len(pages) * 0.75)]["startMs"] / 1000 if len(pages) > 3 else duration * 0.7
    )
    reveal = round(reveal, 2)
    punch = [p for p in punch if p["at"] < reveal]

    mid = [c for c in cuts if duration * 0.2 <= c <= duration * 0.55]
    pre = [c for c in late if c < reveal]  # e.g. a reaction cut-in right before the payoff
    flashes = sorted({round(c, 2) for c in mid[:1] + pre[:1]} | {reveal})

    return {
        "punchIns": punch,
        "flashes": flashes,
        "reveal": {"at": reveal, "scale": 1.55, "x": 0.5, "y": 0.45},
        "thumbnailTime": round(min(reveal + 0.4, duration - 0.2), 2),
    }


def default_headline(info, pages):
    desc = (info.get("description") or "").strip()
    first = desc.splitlines()[0].strip() if desc else ""
    first = re.sub(r"[#@]\S+", "", first).strip()
    first = re.sub(r"[^\w\s'’!?.,-]", "", first).strip()
    if 8 <= len(first) <= 60:
        return first
    return pages[0]["text"] if pages else "Wait for it…"


def default_caption(headline, info, brand):
    credit = info.get("channel") or info.get("uploader_id")
    tags = re.findall(r"#\w+", info.get("description") or "")
    base = ["#reels", "#viral", "#explorepage", "#fyp"]
    seen, out = set(), []
    for t in tags + base:
        if t.lower() not in seen:
            seen.add(t.lower())
            out.append(t)
    return (
        f"{headline}\n\n"
        "Stay till the end. The last few seconds change everything.\n\n"
        f"Follow {brand['handle']} for more clips like this\n"
        + (f"🎥 @{credit}\n" if credit else "")
        + "-\n"
        + " ".join(out[:10])
    )


EDITABLE = [
    "headline", "subtitles", "punchIns", "flashes", "reveal", "inserts", "thumbnail",
    "caption", "showSubtitles", "trim", "brand",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--slug")
    ap.add_argument("--model", default="base.en", help="faster-whisper model; use 'small' for non-English")
    ap.add_argument("--fresh", action="store_true", help="re-download and overwrite every edit")
    args = ap.parse_args()

    m = re.search(r"instagram\.com/(?:reel|reels|p|tv)/([A-Za-z0-9_-]+)", args.url)
    slug = args.slug or (m.group(1) if m else re.sub(r"\W+", "-", args.url)[-24:].strip("-"))
    out_dir = PUBLIC / "reels" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    job_path = out_dir / "job.json"
    old = json.loads(job_path.read_text()) if job_path.exists() and not args.fresh else {}

    src = out_dir / "source.mp4"
    if args.fresh or not src.exists():
        print(f"[reel] downloading {args.url}")
        download(args.url, out_dir)
    info_path = out_dir / "info.json"
    info = json.loads(info_path.read_text()) if info_path.exists() else {}

    w, h, duration = probe(src)
    print(f"[reel] {w}x{h}, {duration:.2f}s")
    crop = detect_content_box(src, w, h, duration)
    print(f"[reel] picture area: {crop or 'full frame'}")

    print(f"[reel] transcribing with {args.model}")
    words, lang = transcribe(src, args.model)
    print(f"[reel] {len(words)} words ({lang})")
    cuts = scene_cuts(src, crop)
    print(f"[reel] cuts: {cuts}")
    try:
        contact_sheet(src, out_dir / "sheet.jpg", duration)
    except subprocess.CalledProcessError:
        print("[reel] contact sheet failed (drawtext missing?), skipping")
    pages = build_pages(words)
    plan = plan_edit(pages, cuts, duration)

    brand = json.loads(BRAND_FILE.read_text())
    headline = default_headline(info, pages)
    job = {
        "slug": slug,
        "url": args.url,
        "src": f"reels/{slug}/source.mp4",
        "width": w,
        "height": h,
        "duration": round(duration, 3),
        "crop": crop,
        "language": lang,
        "original": {
            "uploader": info.get("uploader"),
            "channel": info.get("channel"),
            "description": info.get("description"),
        },
        "cuts": cuts,
        "words": words,
        # ---- editable from here on ----
        "brand": brand,
        "headline": headline,
        "showSubtitles": True,
        "subtitles": pages,
        "trim": {"start": 0, "end": round(duration, 3)},
        **plan,
        "inserts": [],
        "thumbnail": {"time": plan["thumbnailTime"], "text": headline.upper(), "highlight": []},
        "caption": default_caption(headline, info, brand),
    }
    del job["thumbnailTime"]
    for k in EDITABLE:
        if k in old:
            job[k] = old[k]
    job_path.write_text(json.dumps(job, indent=2, ensure_ascii=False))
    print(f"[reel] wrote {job_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
