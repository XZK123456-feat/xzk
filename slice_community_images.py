from pathlib import Path
import shutil

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = Path(r"C:\Users\xiaozikang\Desktop\运营图")
ASSET_DIR = ROOT / "assets" / "community-creatives"
SOURCE_ASSET_DIR = ASSET_DIR / "source"
SLICED_DIR = ASSET_DIR / "sliced"


MANIFEST = [
    {
        "filename": "5图 小恐龙派对.png",
        "folder": "party-feature",
        "prefix": "小恐龙派对5图",
        "regions": [
            [(0, 0, 1514, 852), (1552, 0, 3066, 852), (3104, 0, 4618, 852)],
            [(0, 887, 2285, 2172), (2331, 887, 4618, 2172)],
        ],
    },
    {
        "filename": "套图 小恐龙派对.png",
        "folder": "party-set",
        "prefix": "小恐龙派对套图",
        "regions": [
            [
                (0, 0, 467, 622),
                (480, 0, 946, 622),
                (957, 0, 1422, 622),
                (1435, 0, 1900, 622),
                (1916, 0, 2381, 622),
                (2393, 0, 2860, 622),
                (2872, 0, 3338, 622),
                (3350, 0, 3817, 622),
            ],
            [
                (0, 634, 467, 1255),
                (480, 634, 945, 1255),
                (957, 634, 1423, 1255),
                (1435, 634, 1906, 1255),
                (1916, 634, 2382, 1255),
                (2393, 634, 2858, 1255),
                (2872, 634, 3337, 1255),
                (3351, 634, 3817, 1255),
            ],
            [(0, 1266, 3817, 1993)],
            [(0, 2005, 1257, 2712), (1280, 2005, 2537, 2712), (2560, 2005, 3817, 2712)],
        ],
    },
    {
        "filename": "其他素材 小恐龙 派对.png",
        "folder": "party-misc",
        "prefix": "小恐龙派对其他素材",
        "regions": [
            [(0, 0, 1630, 917), (1672, 0, 3298, 917), (3330, 0, 3988, 917)],
            [
                (0, 934, 653, 1804),
                (667, 934, 1320, 1804),
                (1335, 934, 1986, 1804),
                (2000, 934, 2652, 1804),
                (2666, 934, 3318, 1804),
                (3332, 934, 3988, 1804),
            ],
            [
                (0, 1819, 651, 2691),
                (665, 1819, 1315, 2691),
                (1329, 1819, 1981, 2691),
                (1996, 1819, 2648, 2691),
                (2663, 1819, 3315, 2691),
                (3330, 1819, 3988, 2691),
            ],
        ],
    },
    {
        "filename": "周年庆 不休的乌拉拉.png",
        "folder": "ulala-anniversary",
        "prefix": "不休的乌拉拉周年庆",
        "regions": [[(0, 0, 3386, 847)], [(0, 894, 3386, 2743)]],
    },
    {
        "filename": "套图 乌拉拉.png",
        "folder": "ulala-set",
        "prefix": "乌拉拉套图",
        "regions": [
            [(0, 9, 933, 533), (949, 9, 1880, 533), (1897, 9, 2822, 533), (2847, 9, 3773, 533)],
            [(0, 559, 934, 1084), (948, 559, 1881, 1084), (1894, 559, 2825, 1084), (2844, 559, 3775, 1084)],
            [(0, 1102, 934, 2191), (948, 1102, 1881, 2191), (1894, 1102, 2825, 2191), (2845, 1102, 3775, 2191)],
            [(4, 2204, 931, 2733), (952, 2204, 1876, 2733), (1896, 2204, 2823, 2733), (2834, 2204, 3786, 2733)],
        ],
    },
]


def assert_inside_workspace(path: Path) -> None:
    resolved = path.resolve()
    root = ROOT.resolve()
    if resolved != root and root not in resolved.parents:
        raise RuntimeError(f"Refusing to write outside workspace: {resolved}")


def trim_white_border(image: Image.Image) -> Image.Image:
    background = Image.new(image.mode, image.size, (255, 255, 255))
    diff = ImageChops.difference(image, background)
    bbox = diff.getbbox()
    if not bbox:
        return image
    return image.crop(bbox)


def flatten_regions(regions: list[list[tuple[int, int, int, int]]]) -> list[tuple[int, int, int, int]]:
    return [region for row in regions for region in row]


def reset_output() -> None:
    assert_inside_workspace(ASSET_DIR)
    if SLICED_DIR.exists():
        shutil.rmtree(SLICED_DIR)
    SLICED_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_ASSET_DIR.mkdir(parents=True, exist_ok=True)


def main() -> None:
    if not SOURCE_DIR.exists():
        raise FileNotFoundError(SOURCE_DIR)

    reset_output()
    total = 0

    for item in MANIFEST:
        source = SOURCE_DIR / item["filename"]
        if not source.exists():
            raise FileNotFoundError(source)

        shutil.copy2(source, SOURCE_ASSET_DIR / item["filename"])
        image = Image.open(source).convert("RGB")
        output_dir = SLICED_DIR / item["folder"]
        output_dir.mkdir(parents=True, exist_ok=True)

        for index, box in enumerate(flatten_regions(item["regions"]), start=1):
            crop = trim_white_border(image.crop(box))
            output = output_dir / f"{item['prefix']}-{index:03d}.png"
            crop.save(output, "PNG", optimize=True)
            print(f"{output.relative_to(ROOT)} ({crop.width}x{crop.height})")
            total += 1

        image.close()

    print(f"\nDone. total={total}")


if __name__ == "__main__":
    main()
