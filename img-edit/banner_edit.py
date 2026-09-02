#!/usr/bin/env python3
"""Edit banner: replace 'חברי עמיט מקבלים' text with 'משתתפי הוובינר מקבלים'."""
from PIL import Image, ImageDraw, ImageFont
from bidi.algorithm import get_display

SRC = "/Users/meirlb/Desktop/ai-lab/img-edit/banner.jpg"
DST = "/Users/meirlb/Desktop/ai-lab/img-edit/banner-output.jpg"
FONT_PATH = "/System/Library/Fonts/ArialHB.ttc"

img = Image.open(SRC).convert("RGB")
W, H = img.size
print(f"Image: {W}x{H}")

draw = ImageDraw.Draw(img)

# Cover text area (to the right of BENEFIT badge, containing 2 Hebrew lines)
# In image coords: right side where the 2 lines of Hebrew text sit
# Approximate coordinates based on visual inspection of 1422x752 image
cover_x = 1028
cover_y = 522
cover_w = 352
cover_h = 113

# Dark fill matching the ticket background (sampled: ~rgb(8,12,40))
draw.rectangle(
    [cover_x, cover_y, cover_x + cover_w, cover_y + cover_h],
    fill=(8, 12, 40)
)

# Draw the two new lines of Hebrew text, centered in the cover area
# Use bidi to flip text for RTL rendering
line1 = get_display("משתתפי הוובינר מקבלים")
line2 = get_display("הטבה של 100 ש״ח")

font_size_1 = 26
font_size_2 = 24
font_1 = ImageFont.truetype(FONT_PATH, font_size_1, index=1)  # bold from .ttc
font_2 = ImageFont.truetype(FONT_PATH, font_size_2, index=1)

# Measure
bbox_1 = draw.textbbox((0, 0), line1, font=font_1)
bbox_2 = draw.textbbox((0, 0), line2, font=font_2)
w1 = bbox_1[2] - bbox_1[0]
h1 = bbox_1[3] - bbox_1[1]
w2 = bbox_2[2] - bbox_2[0]
h2 = bbox_2[3] - bbox_2[1]

# Position (centered in cover area)
total_h = h1 + h2 + 8
start_y = cover_y + (cover_h - total_h) // 2 - 4
x1 = cover_x + (cover_w - w1) // 2
x2 = cover_x + (cover_w - w2) // 2

# Text color matches the original cyan text style
TEXT_COLOR = (165, 230, 225)  # cyan/teal to match original
draw.text((x1, start_y), line1, font=font_1, fill=TEXT_COLOR)
draw.text((x2, start_y + h1 + 8), line2, font=font_2, fill=TEXT_COLOR)

img.save(DST, "JPEG", quality=92)
print(f"Saved: {DST}")
