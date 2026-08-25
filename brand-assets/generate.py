#!/usr/bin/env python3
"""ForgeDM 占位图标生成器（WP-D Task 1）。

正式 VI 到位后：用官方资产替换 app/static/logos/{prod,dev}/ 下的
icon-logo.ico 与 icon-logo-legacy.icns，本脚本即可退役。

用法：python3 generate.py <输出目录>
依赖：pip install pillow
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

BLUE = (36, 86, 166, 255)          # 与 custom/public/assets/logo.svg 同色
SS = 8                              # 超采样倍率
SIZES_PNG = [1024, 512, 256, 128, 64, 48, 32, 16]
ICO_SIZES = [256, 128, 64, 48, 32, 24, 16]

# 六角螺母轮廓（点对点比例，源自 WP-A logo.svg 的 240 视窗）
HEX = [(120, 30), (189, 70), (189, 150), (120, 190), (51, 150), (51, 70)]
RING_W = 14
# 几何 F（三块矩形，坐标同为 240 视窗）
F_BARS = [
    (96, 74, 150, 100),   # 上横
    (96, 108, 138, 132),  # 中横
    (96, 74, 122, 166),   # 竖干
]


def scaled(points_or_box, s):
    return [round(v * s / 240) for v in points_or_box]


def render_mark(size: int) -> Image.Image:
    s = size * SS
    img = Image.new('RGBA', (s, s), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    k = s / 240

    hex_pts = [(round(x * k), round(y * k)) for x, y in HEX]
    d.polygon(hex_pts, outline=BLUE, width=max(1, round(RING_W * k)))

    for box in F_BARS:
        x0, y0, x1, y1 = (round(v * k) for v in box)
        d.rectangle([x0, y0, x1, y1], fill=BLUE)

    return img.resize((size, size), Image.LANCZOS)


def main(out_dir: str) -> None:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    for size in SIZES_PNG:
        render_mark(size).save(out / f'forgedm-mark-{size}.png')

    # Windows ICO：逐尺寸独立渲染后合成多分辨率帧
    frames = [render_mark(sz) for sz in sorted(ICO_SIZES, reverse=True)]
    frames[0].save(
        out / 'icon-logo.ico',
        format='ICO',
        append_images=frames[1:],
        sizes=[(sz, sz) for sz in ICO_SIZES],
    )

    # macOS ICNS：Pillow 内部按 ic09/ic10 等档位缩放
    render_mark(1024).save(out / 'icon-logo-legacy.icns', format='ICNS')

    print(f'generated -> {out}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
