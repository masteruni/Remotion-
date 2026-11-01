"""Trim and level-match the sound effects used by src/Keynote/Sfx.tsx.

Every source file is from Pixabay (Pixabay Content License: free for commercial
use, no attribution required). They were picked out of the "1000+ UR.FASTEDITOR
SFX" pack; only files whose Pixabay page was checked are used. See
public/sfx/CREDITS.md.

Usage: python3 scripts/prepare-sfx.py path/to/folder/with/the/source/mp3s
"""

import os
import subprocess
import sys

SRC = sys.argv[1]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "public", "sfx")
os.makedirs(OUT, exist_ok=True)

# name: (source file, trim start s, duration s or None, fade-out s)
CUES = {
    "whoosh-fast": ("fast-whoosh-118248.mp3", 0.0, None, 0.1),
    "swoosh": ("swoosh-026-454861.mp3", 0.0, None, 0.1),
    "whoosh-pointer": ("whoosh-pointer-243108.mp3", 0.4, 1.0, 0.3),
    "ui-tick": ("soundreality-ui-tuping-391160.mp3", 0.06, 0.22, 0.05),
    "ui-tick-roll": ("soundreality-ui-tuping-391160.mp3", 0.06, 0.85, 0.2),
    "pop-ui": ("ui-pop-up-14-197900.mp3", 0.0, None, 0.1),
    "pop-ui-2": ("ui-pop-up-15-197897.mp3", 0.0, None, 0.1),
    "pop-multi": ("multi-pop-6-188170.mp3", 0.0, None, 0.05),
    "pop-bubble": ("bubble-pop-293342.mp3", 0.0, None, 0.1),
    "notification": ("notification-ping-372479.mp3", 0.0, 1.4, 0.4),
    "riser-sharp": ("sharp-riser-327342.mp3", 0.0, None, 0.1),
    "riser-impact": ("360-riser-impact-370401.mp3", 0.0, None, 0.6),
    "magic-twinkle": ("universfield-magic-244951.mp3", 0.0, None, 0.5),
}

for name, (src, start, dur, fade) in CUES.items():
    path = os.path.join(SRC, src)
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        check=True, capture_output=True, text=True,
    )
    length = (dur if dur is not None else float(probe.stdout) - start)
    # Peak-normalize to -1 dBFS so cue volumes in Sfx.tsx are comparable.
    vol = subprocess.run(
        ["ffmpeg", "-v", "info", "-ss", str(start), "-t", str(length), "-i", path,
         "-af", "volumedetect", "-f", "null", "-"],
        check=True, capture_output=True, text=True,
    ).stderr
    peak = float(vol.split("max_volume:")[1].split("dB")[0])
    gain = -1.0 - peak
    afilter = f"volume={gain:.2f}dB,afade=t=out:st={max(0, length - fade):.3f}:d={fade}"
    out = os.path.join(OUT, f"{name}.wav")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(length), "-i", path,
         "-af", afilter, "-ar", "44100", "-ac", "2", out],
        check=True,
    )
    print(f"{name:14s} <- {src} ({length:.2f}s, gain {gain:+.1f} dB)")
