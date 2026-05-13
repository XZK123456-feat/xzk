from PIL import Image
import os

base = r"C:\Users\xiaozikang\xzk\assets\ua-creatives"
out_dir = os.path.join(base, "sliced")
os.makedirs(out_dir, exist_ok=True)

slices = [
    # 横图1 — 3 images stacked vertically
    ("horizontal/横图1.png", "heng", [
        ("横图1-1", 0, 0, 5000, 756),
        ("横图1-2", 0, 756, 5000, 1512),
        ("横图1-3", 0, 1512, 5000, 2270),
    ]),
    # 横图2 — 2 images stacked vertically
    ("horizontal/横图2.png", "heng", [
        ("横图2-1", 0, 0, 5036, 1151),
        ("横图2-2", 0, 1151, 5036, 2302),
    ]),
    # 横图3 — 2 images stacked vertically
    ("horizontal/横图3.png", "heng", [
        ("横图3-1", 0, 0, 5043, 1157),
        ("横图3-2", 0, 1157, 5043, 2314),
    ]),
    # 竖图4 — 2 images side by side
    ("vertical/竖图4.png", "shu", [
        ("竖图4-1", 0, 0, 2579, 2264),
        ("竖图4-2", 2579, 0, 5158, 2264),
    ]),
    # 九图5 — 3x3 grid
    ("nine-grid/九图5.png", "jiu", [
        ("九图5-r1c1", 0, 0, 1769, 879),
        ("九图5-r1c2", 1769, 0, 3538, 879),
        ("九图5-r1c3", 3538, 0, 5307, 879),
        ("九图5-r2c1", 0, 879, 1769, 1758),
        ("九图5-r2c2", 1769, 879, 3538, 1758),
        ("九图5-r2c3", 3538, 879, 5307, 1758),
        ("九图5-r3c1", 0, 1758, 1769, 2636),
        ("九图5-r3c2", 1769, 1758, 3538, 2636),
        ("九图5-r3c3", 3538, 1758, 5307, 2636),
    ]),
]

for src_rel, category, regions in slices:
    src_path = os.path.join(base, src_rel)
    img = Image.open(src_path)
    print(f"Slicing {src_rel} ({img.size}):")
    for name, x1, y1, x2, y2 in regions:
        cropped = img.crop((x1, y1, x2, y2))
        out_path = os.path.join(out_dir, f"{name}.png")
        cropped.save(out_path, "PNG")
        print(f"  -> {name}.png ({cropped.size})")
    img.close()

print("\nDone! All slices saved to:", out_dir)
