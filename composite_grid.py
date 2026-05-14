from PIL import Image
import os

base = r"C:\Users\xiaozikang\xzk\assets\ua-creatives\sliced\nine-grid"
groups = [
    ("九图6", [f"九图6-{i:03d}.jpg" for i in range(1, 10)]),
    ("九图7", [f"九图7-{i:03d}.jpg" for i in range(1, 10)]),
]

for prefix, filenames in groups:
    images = []
    for f in filenames:
        path = os.path.join(base, f)
        img = Image.open(path).convert("RGB")
        print(f"{f}: {img.size}")
        images.append(img)

    w, h = images[0].size
    grid = Image.new("RGB", (w * 3, h * 3), (255, 255, 255))

    for idx, img in enumerate(images):
        row = idx // 3
        col = idx % 3
        grid.paste(img, (col * w, row * h))

    out_path = os.path.join(base, f"{prefix}-001.png")
    grid.save(out_path, "PNG", optimize=True)
    print(f"Created: {out_path} ({grid.size})")

    for img in images:
        img.close()

print("Done!")
