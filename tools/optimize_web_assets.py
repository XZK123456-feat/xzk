from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import quote, unquote

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PRODUCTION_FILES = [
    "index.html",
    "website-design.html",
    "ua-creatives.html",
    "community-creatives.html",
    "video-design.html",
    "styles.css",
    "script.js",
    "website-design.js",
    "ua-creatives.js",
    "community-creatives.js",
]
LEGACY_REFERENCE = re.compile(r"assets/[^\"'`)<>]+\.(?:png|jpe?g)", re.IGNORECASE)
WEBP_REFERENCE = re.compile(r"assets/[^\"'`)<>]+?\.webp", re.IGNORECASE)
IMAGE_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
SRC_ATTRIBUTE = re.compile(r'\bsrc="([^"]+)"', re.IGNORECASE)
MANIFEST_ITEM = re.compile(
    r"(?P<head>\{\s*label:\s*'[^']+',\s*src:\s*'(?P<src>[^']+)',\s*fullSrc:\s*'(?P<full>[^']+)')(?P<meta>[^}\n]*)(?P<tail>\s*\},?)"
)
PREVIEW_BUTTON = re.compile(r"<button\b[^>]*\bdata-full=\"[^\"]+\"[^>]*>", re.IGNORECASE)
FULL_ATTRIBUTE = re.compile(r'\bdata-full="([^"]+)"', re.IGNORECASE)


def is_thumbnail(path: Path) -> bool:
    lowered = "/".join(path.parts).lower()
    return "thumbnail" in lowered or "poster" in lowered or "-thumb" in path.stem.lower()


def delivery_path(source: Path) -> Path:
    sibling_formats = [
        sibling
        for sibling in source.parent.glob(f"{source.stem}.*")
        if sibling.suffix.lower() in {".png", ".jpg", ".jpeg"}
    ]
    if len(sibling_formats) > 1:
        return source.with_name(f"{source.stem}-{source.suffix.lower().lstrip('.')}-delivery.webp")
    return source.with_name(f"{source.stem}-delivery.webp")


def small_path(source: Path) -> Path:
    return source.with_name(f"{source.stem}-480.webp")


def open_image(path: Path) -> Image.Image:
    image = Image.open(path)
    image.load()
    return ImageOps.exif_transpose(image)


def webp_mode(image: Image.Image) -> Image.Image:
    if image.mode in {"RGBA", "LA"} or "transparency" in image.info:
        return image.convert("RGBA")
    return image.convert("RGB")


def resize_to_limit(image: Image.Image, max_dimension: int) -> Image.Image:
    if max(image.size) <= max_dimension:
        return image
    copy = image.copy()
    copy.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    return copy


def save_webp(image: Image.Image, destination: Path, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=quality, method=6)


def optimize_legacy_images() -> dict[str, str]:
    replacements: dict[str, str] = {}
    claimed: dict[Path, Path] = {}
    sources = sorted(
        path
        for path in ASSETS.rglob("*")
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg"}
    )

    for index, source in enumerate(sources, start=1):
        destination = delivery_path(source)
        previous = claimed.get(destination)
        if previous and previous != source:
            raise RuntimeError(f"Delivery name collision: {previous} and {source}")
        claimed[destination] = source

        image = open_image(source)
        limit = 960 if is_thumbnail(source) else 2560
        quality = 84 if is_thumbnail(source) else 90
        optimized = resize_to_limit(webp_mode(image), limit)
        save_webp(optimized, destination, quality)

        relative_source = source.relative_to(ROOT).as_posix()
        relative_destination = destination.relative_to(ROOT).as_posix()
        replacements[relative_source] = relative_destination
        if index % 50 == 0:
            print(f"optimized {index}/{len(sources)} legacy images")

    return replacements


def create_responsive_candidates() -> None:
    references: set[str] = set()
    for filename in PRODUCTION_FILES:
        text = (ROOT / filename).read_text(encoding="utf-8")
        references.update(WEBP_REFERENCE.findall(text))

    for reference in sorted(references):
        source = ROOT / unquote(reference)
        if not source.exists() or source.name.endswith("-480.webp"):
            continue
        with open_image(source) as image:
            if image.width < 600:
                continue
            resized = image.copy()
            resized.thumbnail((480, 4800), Image.Resampling.LANCZOS)
            save_webp(webp_mode(resized), small_path(source), 82)


def format_reference(original: str, replacement: str) -> str:
    if "%" not in original:
        return replacement
    return quote(replacement, safe="/+_-.")


def rewrite_legacy_references(replacements: dict[str, str]) -> None:
    for filename in PRODUCTION_FILES:
        path = ROOT / filename
        text = path.read_text(encoding="utf-8")

        def replace(match: re.Match[str]) -> str:
            original = match.group(0)
            decoded = unquote(original)
            replacement = replacements.get(decoded)
            return format_reference(original, replacement) if replacement else original

        updated = LEGACY_REFERENCE.sub(replace, text)
        path.write_text(updated, encoding="utf-8", newline="\n")


def responsive_data(reference: str) -> tuple[int, int, str | None]:
    source = ROOT / unquote(reference)
    with Image.open(source) as image:
        width, height = image.size
    candidate = small_path(source)
    small = candidate.relative_to(ROOT).as_posix() if candidate.exists() else None
    return width, height, small


def enrich_manifest(filename: str) -> None:
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")

    def replace(match: re.Match[str]) -> str:
        src = match.group("src")
        width, height, small = responsive_data(src)
        full = match.group("full")
        full_width, full_height, full_small = responsive_data(full)
        small_field = f", smallSrc: '{small}'" if small else ""
        full_small_field = f", fullSmallSrc: '{full_small}'" if full_small else ""
        return (
            f"{match.group('head')}, width: {width}, height: {height}{small_field}, "
            f"fullWidth: {full_width}, fullHeight: {full_height}{full_small_field}{match.group('tail')}"
        )

    path.write_text(MANIFEST_ITEM.sub(replace, text), encoding="utf-8", newline="\n")


def enrich_static_previews(filename: str) -> None:
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")

    def replace(match: re.Match[str]) -> str:
        tag = match.group(0)
        full_match = FULL_ATTRIBUTE.search(tag)
        if not full_match:
            return tag
        cleaned = re.sub(r'\s+data-full-(?:small|width|height)="[^"]*"', "", tag)
        full = full_match.group(1)
        width, height, small = responsive_data(full)
        attributes = f' data-full-width="{width}" data-full-height="{height}"'
        if small:
            attributes += f' data-full-small="{format_reference(full, small)}"'
        return cleaned[:-1] + attributes + ">"

    path.write_text(PREVIEW_BUTTON.sub(replace, text), encoding="utf-8", newline="\n")


def enrich_static_images(filename: str) -> None:
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")

    def replace(match: re.Match[str]) -> str:
        tag = match.group(0)
        src_match = SRC_ATTRIBUTE.search(tag)
        if not src_match or not src_match.group(1).lower().endswith(".webp"):
            return tag
        if re.search(r"\b(?:width|height|srcset|sizes)=", tag, re.IGNORECASE):
            return tag

        src = src_match.group(1)
        width, height, small = responsive_data(src)
        small_reference = format_reference(src, small) if small else None
        srcset = f"{small_reference} 480w, {src} {width}w" if small_reference else f"{src} {width}w"
        sizes = "(max-width: 700px) 92vw, 320px" if "community-video-poster" in tag else "(max-width: 700px) 44vw, 260px"
        attributes = f' width="{width}" height="{height}" srcset="{srcset}" sizes="{sizes}"'
        return tag[:-2] + attributes + " />" if tag.endswith("/>") else tag[:-1] + attributes + ">"

    path.write_text(IMAGE_TAG.sub(replace, text), encoding="utf-8", newline="\n")


def dynamic_nine_grid_references() -> set[str]:
    references: set[str] = set()
    groups = [("九图5", 18, "-delivery.webp"), ("九图6", 1, "-png-delivery.webp"), ("九图7", 1, "-png-delivery.webp")]
    for prefix, count, suffix in groups:
        for index in range(1, count + 1):
            padded = f"{index:03d}"
            base = f"assets/ua-creatives/sliced/nine-grid/{prefix}-{padded}"
            references.add(f"{base}{suffix}")
            references.add(f"{base}{suffix.removesuffix('.webp')}-480.webp")
            references.add(f"assets/ua-creatives/sliced/nine-grid/thumbnails/{prefix}-{padded}-thumb-delivery.webp")
    return references


def create_dynamic_nine_grid_candidates() -> None:
    groups = [("九图5", 18, "-delivery.webp"), ("九图6", 1, "-png-delivery.webp"), ("九图7", 1, "-png-delivery.webp")]
    directory = ASSETS / "ua-creatives" / "sliced" / "nine-grid"
    for prefix, count, suffix in groups:
        for index in range(1, count + 1):
            source = directory / f"{prefix}-{index:03d}{suffix}"
            candidate = small_path(source)
            if candidate.exists():
                continue
            with open_image(source) as image:
                resized = image.copy()
                resized.thumbnail((480, 4800), Image.Resampling.LANCZOS)
                save_webp(webp_mode(resized), candidate, 82)


def prune_unused_delivery_assets() -> int:
    references = dynamic_nine_grid_references()
    for filename in PRODUCTION_FILES:
        text = (ROOT / filename).read_text(encoding="utf-8")
        references.update(
            unquote(reference)
            for reference in WEBP_REFERENCE.findall(text)
            if "${" not in reference
        )

    removed = 0
    for path in ASSETS.rglob("*-delivery*.webp"):
        relative = path.relative_to(ROOT).as_posix()
        if relative in references:
            continue
        path.unlink()
        removed += 1
    return removed


def main() -> None:
    replacements = optimize_legacy_images()
    rewrite_legacy_references(replacements)
    create_responsive_candidates()
    create_dynamic_nine_grid_candidates()
    enrich_manifest("ua-creatives.js")
    enrich_manifest("community-creatives.js")
    for filename in PRODUCTION_FILES:
        if filename.endswith(".html"):
            enrich_static_images(filename)
            enrich_static_previews(filename)
    removed = prune_unused_delivery_assets()
    print(f"removed {removed} unused WebP delivery images")
    print(f"created {len(replacements)} WebP delivery images")


if __name__ == "__main__":
    main()
