import subprocess
import os

source_logo = "src/assets/images/mosafa_official_logo_1794100514373.jpg"

if not os.path.exists(source_logo):
    print("Source logo not found:", source_logo)
    exit(1)

print("Source logo verified:", source_logo)

# 1. Generate master public/logo.png (1024x1024 PNG)
subprocess.run([
    "convert", source_logo,
    "-resize", "1024x1024",
    "-quality", "95",
    "public/logo.png"
], check=True)
print("Generated public/logo.png")

# 2. Generate favicon-16x16.png
subprocess.run([
    "convert", source_logo,
    "-resize", "16x16",
    "public/favicon-16x16.png"
], check=True)
print("Generated public/favicon-16x16.png")

# 3. Generate favicon-32x32.png
subprocess.run([
    "convert", source_logo,
    "-resize", "32x32",
    "public/favicon-32x32.png"
], check=True)
print("Generated public/favicon-32x32.png")

# 4. Generate multi-resolution favicon.ico (16, 32, 48)
subprocess.run([
    "convert", source_logo,
    "-define", "icon:auto-resize=64,48,32,16",
    "public/favicon.ico"
], check=True)
print("Generated public/favicon.ico")

# 5. Generate apple-touch-icon.png (180x180)
subprocess.run([
    "convert", source_logo,
    "-resize", "180x180",
    "public/apple-touch-icon.png"
], check=True)
print("Generated public/apple-touch-icon.png")

# 6. Generate icon-192.png (192x192)
subprocess.run([
    "convert", source_logo,
    "-resize", "192x192",
    "public/icon-192.png"
], check=True)
print("Generated public/icon-192.png")

# 7. Generate icon-512.png (512x512)
subprocess.run([
    "convert", source_logo,
    "-resize", "512x512",
    "public/icon-512.png"
], check=True)
print("Generated public/icon-512.png")

# 8. Generate maskable icons with 15% safe padding
# For 192x192: logo resized to 154x154 and centered on 192x192 white canvas
subprocess.run([
    "convert", source_logo,
    "-resize", "154x154",
    "-gravity", "center",
    "-background", "#ffffff",
    "-extent", "192x192",
    "public/icon-maskable-192.png"
], check=True)
print("Generated public/icon-maskable-192.png")

# For 512x512: logo resized to 410x410 and centered on 512x512 white canvas
subprocess.run([
    "convert", source_logo,
    "-resize", "410x410",
    "-gravity", "center",
    "-background", "#ffffff",
    "-extent", "512x512",
    "public/icon-maskable-512.png"
], check=True)
print("Generated public/icon-maskable-512.png")

# 9. Generate 1200x630 Social Share OpenGraph Card (og-image.png & og-image.jpg)
# Beautiful branded background with subtle tech gradient / vignette, safe logo centered at 480x480 with ample safe zone
# First, create a 1200x630 canvas with a clean subtle brand gradient background (#0f172a / dark navy or clean bright white/slate)
# The user specified:
# "এর মধ্যে আমার সম্পূর্ণ Original Logo-টি মাঝখানে রাখতে হবে এবং চারপাশে পর্যাপ্ত Safe Padding দিতে হবে, যাতে কোনো প্ল্যাটফর্মে Crop হলেও লোগো কেটে না যায়। লোগোর অনুপাত পরিবর্তন করা যাবে না। প্রয়োজনে লোগোর পেছনে সুন্দর White বা Brand Gradient Background ব্যবহার করতে পারো।"
# Let's create a stunning modern card:
# Clean light gradient (#f8fafc to #eef2ff), logo 480x480 perfectly centered, safe margins 360px on sides and 75px top/bottom.
subprocess.run([
    "convert",
    "-size", "1200x630",
    "gradient:#ffffff-#f1f5f9",
    # subtle radial glow in center
    "(", source_logo, "-resize", "500x500", ")",
    "-gravity", "center",
    "-composite",
    "public/og-image.png"
], check=True)

subprocess.run([
    "convert", "public/og-image.png",
    "-quality", "95",
    "public/og-image.jpg"
], check=True)
print("Generated public/og-image.png and public/og-image.jpg (1200x630)")

