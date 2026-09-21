from pathlib import Path
import shutil

from PIL import Image, ImageFilter


ROOT = Path("public/slides/m04")
BACKUP = Path(".logs/m04-originals-1672x941-20260612")
TARGET_SIZE = (3840, 2160)
SLIDE_NAMES = [
    f"aula-4-{lesson}-{index:02d}.png"
    for lesson in (1, 2, 3)
    for index in range(1, 6)
]


def cover_resize(image: Image.Image) -> Image.Image:
    scale = max(TARGET_SIZE[0] / image.width, TARGET_SIZE[1] / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - TARGET_SIZE[0]) // 2
    top = (resized.height - TARGET_SIZE[1]) // 2
    cropped = resized.crop((left, top, left + TARGET_SIZE[0], top + TARGET_SIZE[1]))
    return cropped.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))


def main() -> None:
    BACKUP.mkdir(parents=True, exist_ok=True)
    print(f"backup: {BACKUP}")

    for name in SLIDE_NAMES:
        source = ROOT / name
        backup_file = BACKUP / name

        if not source.exists():
            raise FileNotFoundError(source)

        shutil.copy2(source, backup_file)

        with Image.open(source) as image:
            original_size = image.size
            output = cover_resize(image.convert("RGB"))
            output.save(source, "PNG", optimize=True)

        print(f"{name}: {original_size[0]}x{original_size[1]} -> {TARGET_SIZE[0]}x{TARGET_SIZE[1]}")


if __name__ == "__main__":
    main()
