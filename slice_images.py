from pathlib import Path
import shutil

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = Path(r"C:\Users\xiaozikang\Desktop\买量图")
ASSET_DIR = ROOT / "assets" / "ua-creatives"
SLICED_DIR = ASSET_DIR / "sliced"

SOURCES = [
    ("横图1.png", "horizontal", "横图1"),
    ("横图2.png", "horizontal", "横图2"),
    ("横图3.png", "horizontal", "横图3"),
    ("竖图4.png", "vertical", "竖图4"),
    ("九图5.png", "nine-grid", "九图5"),
]


def assert_inside_workspace(path: Path) -> None:
    resolved = path.resolve()
    root = ROOT.resolve()
    if resolved != root and root not in resolved.parents:
        raise RuntimeError(f"Refusing to write outside workspace: {resolved}")


def find_separator_bands(image: Image.Image, axis: int) -> list[tuple[int, int]]:
    pixels = np.asarray(image.convert("RGB"))
    dark = (pixels[:, :, 0] < 35) & (pixels[:, :, 1] < 35) & (pixels[:, :, 2] < 35)
    ratios = dark.mean(axis=axis)
    threshold = 0.85
    min_length = 4
    bands: list[tuple[int, int]] = []
    start = None

    for index, value in enumerate(ratios):
        if value >= threshold and start is None:
            start = index
        elif value < threshold and start is not None:
            if index - start >= min_length:
                bands.append((start, index))
            start = None

    if start is not None and len(ratios) - start >= min_length:
        bands.append((start, len(ratios)))

    length = image.height if axis == 1 else image.width
    return [(start, end) for start, end in bands if start > 10 and end < length - 10]


def intervals_from_bands(length: int, bands: list[tuple[int, int]]) -> list[tuple[int, int]]:
    intervals: list[tuple[int, int]] = []
    cursor = 0

    for start, end in bands:
        if start - cursor > 40:
            intervals.append((cursor, start))
        cursor = end

    if length - cursor > 40:
        intervals.append((cursor, length))

    return intervals


def copy_sources() -> None:
    category_dirs = {
        "horizontal": ASSET_DIR / "horizontal",
        "vertical": ASSET_DIR / "vertical",
        "nine-grid": ASSET_DIR / "nine-grid",
    }

    for folder in category_dirs.values():
        folder.mkdir(parents=True, exist_ok=True)

    for filename, category, _prefix in SOURCES:
        source = SOURCE_DIR / filename
        target = category_dirs[category] / filename
        if not source.exists():
            raise FileNotFoundError(source)
        shutil.copy2(source, target)


def slice_source(filename: str, category: str, prefix: str) -> int:
    image = Image.open(SOURCE_DIR / filename).convert("RGB")
    x_bands = find_separator_bands(image, axis=0)
    y_bands = find_separator_bands(image, axis=1)
    x_intervals = intervals_from_bands(image.width, x_bands)
    y_intervals = intervals_from_bands(image.height, y_bands)
    output_dir = SLICED_DIR / category
    output_dir.mkdir(parents=True, exist_ok=True)

    index = 1
    if category == "nine-grid":
        group_size = 3
        if len(x_intervals) % group_size != 0 or len(y_intervals) % group_size != 0:
            raise RuntimeError(f"{filename} cannot be grouped into 3x3 thumbnails")

        for row in range(0, len(y_intervals), group_size):
            for col in range(0, len(x_intervals), group_size):
                left = x_intervals[col][0]
                right = x_intervals[col + group_size - 1][1]
                top = y_intervals[row][0]
                bottom = y_intervals[row + group_size - 1][1]
                crop = image.crop((left, top, right, bottom))
                out_path = output_dir / f"{prefix}-{index:03d}.png"
                crop.save(out_path, "PNG", optimize=True)
                print(f"{out_path.relative_to(ROOT)} ({crop.width}x{crop.height}) group={index}")
                index += 1
    else:
        for row, (top, bottom) in enumerate(y_intervals, start=1):
            for col, (left, right) in enumerate(x_intervals, start=1):
                crop = image.crop((left, top, right, bottom))
                out_path = output_dir / f"{prefix}-{index:03d}.png"
                crop.save(out_path, "PNG", optimize=True)
                print(f"{out_path.relative_to(ROOT)} ({crop.width}x{crop.height}) row={row} col={col}")
                index += 1

    image.close()
    return index - 1


def main() -> None:
    assert_inside_workspace(SLICED_DIR)
    if not SOURCE_DIR.exists():
        raise FileNotFoundError(SOURCE_DIR)

    copy_sources()

    if SLICED_DIR.exists():
        shutil.rmtree(SLICED_DIR)
    SLICED_DIR.mkdir(parents=True, exist_ok=True)

    total = 0
    counts: dict[str, int] = {}
    for filename, category, prefix in SOURCES:
        count = slice_source(filename, category, prefix)
        counts[category] = counts.get(category, 0) + count
        total += count

    print(f"\nDone. horizontal={counts.get('horizontal', 0)} vertical={counts.get('vertical', 0)} nine-grid={counts.get('nine-grid', 0)} total={total}")


if __name__ == "__main__":
    main()
