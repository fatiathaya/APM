"""Crop head icon from NeuroCare logo and remove background."""
from pathlib import Path

from PIL import Image


def remove_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 10:
                continue

            luminance = 0.299 * r + 0.587 * g + 0.114 * b

            # Light gradient / white noise
            if luminance > 200 or (r > 190 and g > 200 and b > 210):
                pixels[x, y] = (r, g, b, 0)
                continue

            # Black / near-black backdrop
            if luminance < 28:
                pixels[x, y] = (r, g, b, 0)

    return img


def crop_head(img: Image.Image) -> Image.Image:
    width, height = img.size
    head_bottom = int(height * 0.5)
    head = img.crop((0, 0, width, head_bottom))

    bbox = head.getbbox()
    if not bbox:
        return head

    return head.crop(bbox)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    sources = [
        root / "public" / "images" / "neurocare-logo-source.png",
        root / "public" / "images" / "neurocare-logo.png",
    ]

    source = next((path for path in sources if path.exists()), None)
    if source is None:
        raise FileNotFoundError("Logo source not found.")

    img = Image.open(source)
    if source.name == "neurocare-logo.png":
        icon = remove_background(crop_head(img))
    else:
        icon = remove_background(img)
        bbox = icon.getbbox()
        if bbox:
            icon = icon.crop(bbox)

    target = root / "public" / "images" / "neurocare-icon.png"
    icon.save(target, "PNG")
    print(f"Saved {target} ({icon.size[0]}x{icon.size[1]})")


if __name__ == "__main__":
    main()
