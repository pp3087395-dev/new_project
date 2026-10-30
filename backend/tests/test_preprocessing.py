"""
Tests for robust image preprocessing and color-mode handling (Step 10 Part A).
"""

import io
from PIL import Image, ImageOps
import numpy as np

from app.services.classifier import safe_to_rgb


def test_rotated_exif_image():
    """Verify ImageOps.exif_transpose correctly transposes rotated smartphone shots."""
    # 100 wide x 50 high
    orig_img = Image.new("RGB", (100, 50), color=(200, 50, 50))
    exif = orig_img.getexif()
    # 0x0112 is Orientation tag. 6 = Rotate 90 CW (phone portrait shot saved as landscape)
    exif[0x0112] = 6

    buf = io.BytesIO()
    orig_img.save(buf, format="JPEG", exif=exif)
    buf.seek(0)

    loaded_img = Image.open(buf)
    assert loaded_img.size == (100, 50)

    transposed = ImageOps.exif_transpose(loaded_img)
    assert transposed is not None
    # Orientation 6 transposed swaps width and height: (50, 100)
    assert transposed.size == (50, 100)


def test_rgba_png_composited_on_white():
    """Verify RGBA converts by compositing alpha over pure white (not black)."""
    # Pure transparent pixel (alpha = 0)
    rgba_transparent = Image.new("RGBA", (10, 10), (0, 0, 0, 0))
    rgb_result = safe_to_rgb(rgba_transparent)
    assert rgb_result.mode == "RGB"
    assert rgb_result.getpixel((0, 0)) == (255, 255, 255), "Transparent pixel must composite to pure white"

    # Semi-transparent red: (255, 0, 0, 128) over White (255, 255, 255)
    rgba_semi = Image.new("RGBA", (10, 10), (255, 0, 0, 128))
    rgb_semi = safe_to_rgb(rgba_semi)
    px = rgb_semi.getpixel((0, 0))
    assert px[0] == 255 and 125 <= px[1] <= 130 and 125 <= px[2] <= 130


def test_palette_image_conversion():
    """Verify palette mode (P) converts safely to 8-bit RGB."""
    p_img = Image.new("P", (10, 10))
    p_rgb = safe_to_rgb(p_img)
    assert p_rgb.mode == "RGB"


def test_grayscale_image_conversion():
    """Verify grayscale mode (L) converts safely to 8-bit RGB."""
    l_img = Image.new("L", (10, 10), color=128)
    l_rgb = safe_to_rgb(l_img)
    assert l_rgb.mode == "RGB"
    assert l_rgb.getpixel((0, 0)) == (128, 128, 128)


def test_cmyk_image_conversion():
    """Verify CMYK mode converts safely to 8-bit RGB without channel errors."""
    cmyk_img = Image.new("CMYK", (10, 10), (0, 0, 0, 0))
    cmyk_rgb = safe_to_rgb(cmyk_img)
    assert cmyk_rgb.mode == "RGB"


def test_16bit_image_conversion():
    """Verify 16-bit integer mode (I;16) converts safely to 8-bit RGB."""
    arr_16 = np.zeros((10, 10), dtype=np.uint16)
    arr_16[:, :] = 32768
    i16_img = Image.fromarray(arr_16)
    i16_rgb = safe_to_rgb(i16_img)
    assert i16_rgb.mode == "RGB"
