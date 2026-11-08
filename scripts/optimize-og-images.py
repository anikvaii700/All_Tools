import subprocess
import os

source_logo = "public/logo.png"

# 1. Generate 800x800 WhatsApp & Facebook Square Preview JPEG (Optimal size ~70KB)
subprocess.run([
    "convert", source_logo,
    "-background", "#ffffff",
    "-flatten",
    "-resize", "800x800",
    "-quality", "90",
    "public/og-image-square.jpg"
], check=True)

# 2. Generate 800x800 Square Preview PNG (< 180KB)
subprocess.run([
    "convert", source_logo,
    "-background", "#ffffff",
    "-flatten",
    "-resize", "800x800",
    "-strip",
    "-quality", "90",
    "public/og-image-square.png"
], check=True)

# 3. Generate 1200x630 Banner JPEG (< 120KB) with centered logo
subprocess.run([
    "convert",
    "-size", "1200x630",
    "canvas:#ffffff",
    "(", source_logo, "-resize", "540x540", ")",
    "-gravity", "center",
    "-composite",
    "-quality", "88",
    "public/og-image.jpg"
], check=True)

# 4. Generate 1200x630 Banner PNG (< 200KB)
subprocess.run([
    "convert",
    "-size", "1200x630",
    "canvas:#ffffff",
    "(", source_logo, "-resize", "540x540", ")",
    "-gravity", "center",
    "-composite",
    "-strip",
    "-quality", "88",
    "public/og-image.png"
], check=True)

# 5. Also copy og-image-square.jpg to public/og-preview.jpg
subprocess.run(["cp", "public/og-image-square.jpg", "public/og-preview.jpg"], check=True)

for f in ["public/og-image-square.jpg", "public/og-image-square.png", "public/og-image.jpg", "public/og-image.png", "public/og-preview.jpg"]:
    size = os.path.getsize(f)
    print(f"{f}: {size} bytes ({size/1024:.1f} KB)")
