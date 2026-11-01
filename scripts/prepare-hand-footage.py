"""Key the stock clip of a hand holding a phone and track its screen.

Source: "Chroma on a smartphone with a green screen background" (Mixkit #42636),
https://mixkit.co/free-stock-video/chroma-on-a-smartphone-with-a-green-screen-background-42636/
Mixkit Stock Video Free License (free for commercial and personal use).

Outputs, used by src/Keynote/components/StockHandFootage.tsx:
  public/footage/hand/NNN.webp   hand + phone with the green background and the blue
                                 screen made transparent (30 fps, 1280x720)
  public/footage/hand/track.json per-frame CSS matrix3d that maps a SCREEN_W x SCREEN_H
                                 box onto the phone's screen

Usage: python3 scripts/prepare-hand-footage.py path/to/42636-720.mp4
"""

import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image

SRC = sys.argv[1]
START = 1.15  # seconds into the clip: phone fully in frame, no watch yet
FRAMES = 48  # 45 used + a little slack
W, H = 1280, 720
SCREEN_W, SCREEN_H = 300, 650
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "public", "footage", "hand")
os.makedirs(OUT, exist_ok=True)

raw = subprocess.run(
    [
        "ffmpeg", "-v", "error", "-ss", str(START), "-i", SRC,
        "-vf", "fps=30", "-frames:v", str(FRAMES),
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ],
    check=True,
    capture_output=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)


def homography(src, dst):
    """3x3 projective transform taking 4 src points to 4 dst points."""
    a = []
    for (x, y), (u, v) in zip(src, dst):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y, -u])
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y, -v])
    _, _, vt = np.linalg.svd(np.array(a, float))
    h = vt[-1].reshape(3, 3)
    return h / h[2, 2]


def css_matrix3d(h):
    # CSS matrix3d is column-major 4x4; embed the 2D homography with z passthrough.
    m = [
        h[0, 0], h[1, 0], 0, h[2, 0],
        h[0, 1], h[1, 1], 0, h[2, 1],
        0, 0, 1, 0,
        h[0, 2], h[1, 2], 0, h[2, 2],
    ]
    return [round(float(v), 7) for v in m]


track = []
ys, xs = np.mgrid[0:H, 0:W]
for i, f in enumerate(frames):
    rgb = f.astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    # Green background: soft key on how much green exceeds the other channels.
    green = g - np.maximum(r, b)
    a_green = np.clip(1 - (green - 25) / 35, 0, 1)
    # Blue screen: same idea for blue.
    blue = b - np.maximum(r, g)
    a_blue = np.clip(1 - (blue - 60) / 50, 0, 1)
    alpha = np.minimum(a_green, a_blue)

    # Spill suppression on what remains.
    g2 = np.minimum(g, np.maximum(r, b) + 4)
    b2 = np.minimum(b, np.maximum(r, g2) + 18)
    out = np.dstack([r, g2, b2, alpha * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(os.path.join(OUT, f"{i:03d}.webp"), quality=86, method=4)

    # Screen corners from the hard blue mask, pushed out a little so the
    # content always fills the hole under the bezel.
    m = blue > 90
    px, py = xs[m].astype(float), ys[m].astype(float)
    tl = np.argmin(px + py)
    br = np.argmax(px + py)
    tr = np.argmax(px - py)
    bl = np.argmin(px - py)
    quad = np.array([[px[k], py[k]] for k in (tl, tr, br, bl)])
    c = quad.mean(axis=0)
    quad = c + (quad - c) * 1.08
    h = homography([(0, 0), (SCREEN_W, 0), (SCREEN_W, SCREEN_H), (0, SCREEN_H)], quad)
    track.append(css_matrix3d(h))

with open(os.path.join(OUT, "track.json"), "w") as fh:
    json.dump({"width": W, "height": H, "screenW": SCREEN_W, "screenH": SCREEN_H, "matrices": track}, fh)
print(f"Wrote {len(frames)} frames + track.json to {OUT}")
