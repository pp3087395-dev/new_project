import io
from fractions import Fraction
from PIL import Image, ImageOps, ExifTags
import numpy as np

from app.services.detector import MediaDetectorService, detector_service
from app.services.classifier import safe_to_rgb

def test_rotated_exif_image():
    """Test 1: Verify ImageOps.exif_transpose correctly corrects rotated smartphone shots."""
    print("[*] Running Test 1: Rotated EXIF image...")
    # Create an image that is 100 wide x 50 high
    orig_img = Image.new("RGB", (100, 50), color=(200, 50, 50))
    exif = orig_img.getexif()
    # 0x0112 is Orientation tag. 6 = Rotate 90 CW (phone portrait shot saved as landscape)
    exif[0x0112] = 6

    buf = io.BytesIO()
    orig_img.save(buf, format="JPEG", exif=exif)
    buf.seek(0)

    loaded_img = Image.open(buf)
    assert loaded_img.size == (100, 50), "Original raw JPEG should report stored size (100, 50)"

    transposed = ImageOps.exif_transpose(loaded_img)
    assert transposed is not None, "Transposed image should not be None"
    # When orientation 6 is transposed, width and height swap: (50, 100)
    assert transposed.size == (50, 100), f"Expected (50, 100) after transpose, got {transposed.size}"
    print(f"[OK] Rotated EXIF image successfully transposed from {loaded_img.size} to {transposed.size} upright.")

def test_rgba_and_color_modes():
    """Test 2: Verify RGBA converts by compositing on white (not black) and handles P, L, CMYK, 16-bit safely."""
    print("[*] Running Test 2: RGBA PNG and multi-mode safe_to_rgb conversion...")
    
    # 2a: Pure transparent pixel
    rgba_transparent = Image.new("RGBA", (10, 10), (0, 0, 0, 0))
    rgb_result = safe_to_rgb(rgba_transparent)
    assert rgb_result.mode == "RGB", f"Expected RGB mode, got {rgb_result.mode}"
    px = rgb_result.getpixel((0, 0))
    assert px == (255, 255, 255), f"Expected transparent pixel to composite to pure white (255, 255, 255), got {px}"

    # 2b: Semi-transparent red pixel: RGBA (255, 0, 0, 128) over White (255, 255, 255)
    # R: 255*0.5 + 255*0.5 = 255, G: 0*0.5 + 255*0.5 = 128, B: 0*0.5 + 255*0.5 = 128
    rgba_semi = Image.new("RGBA", (10, 10), (255, 0, 0, 128))
    rgb_semi = safe_to_rgb(rgba_semi)
    semi_px = rgb_semi.getpixel((0, 0))
    assert semi_px[0] == 255 and 125 <= semi_px[1] <= 130 and 125 <= semi_px[2] <= 130, (
        f"Expected semi-transparent red blended on white (~255, 128, 128), got {semi_px}"
    )

    # 2c: Palette mode (P)
    p_img = Image.new("P", (10, 10))
    p_rgb = safe_to_rgb(p_img)
    assert p_rgb.mode == "RGB", f"Expected P to convert to RGB, got {p_rgb.mode}"

    # 2d: Grayscale mode (L)
    l_img = Image.new("L", (10, 10), color=128)
    l_rgb = safe_to_rgb(l_img)
    assert l_rgb.mode == "RGB" and l_rgb.getpixel((0, 0)) == (128, 128, 128)

    # 2e: CMYK mode
    cmyk_img = Image.new("CMYK", (10, 10), (0, 0, 0, 0))
    cmyk_rgb = safe_to_rgb(cmyk_img)
    assert cmyk_rgb.mode == "RGB"

    # 2f: 16-bit integer mode (I;16)
    arr_16 = np.zeros((10, 10), dtype=np.uint16)
    arr_16[:, :] = 32768
    i16_img = Image.fromarray(arr_16)
    i16_rgb = safe_to_rgb(i16_img)
    assert i16_rgb.mode == "RGB"

    print("[OK] All color modes (RGBA transparent on white, P, L, CMYK, 16-bit) converted safely to RGB.")

def test_exif_rich_jpeg():
    """Test 3: Verify extract_metadata reads top IFD, Exif sub-IFD (0x8769), and GPS sub-IFD (0x8825)."""
    print("[*] Running Test 3: EXIF-rich JPEG with sub-IFDs (0x8769 & 0x8825)...")
    
    img = Image.new("RGB", (200, 200), (100, 150, 200))
    exif = img.getexif()
    
    # 0th IFD tags
    exif[0x010f] = "TruthLensCameraMaker"  # Make
    exif[0x0110] = "TruthLensModelPro"    # Model
    exif[0x0131] = "TruthLens 1.1.0"      # Software
    
    from PIL.TiffImagePlugin import IFDRational
    # Exif Sub-IFD (0x8769) tags
    exif_sub = exif.get_ifd(0x8769)
    exif_sub[0x9003] = "2026:08:24 18:30:00"  # DateTimeOriginal
    exif_sub[0x829a] = IFDRational(1, 250)    # ExposureTime
    exif_sub[0x920a] = IFDRational(50, 1)     # FocalLength

    # GPS Sub-IFD (0x8825) tags
    gps_sub = exif.get_ifd(0x8825)
    gps_sub[1] = "N"                          # GPSLatitudeRef
    gps_sub[2] = (IFDRational(37, 1), IFDRational(46, 1), IFDRational(30, 1))  # GPSLatitude (37° 46' 30")
    gps_sub[3] = "W"                          # GPSLongitudeRef
    gps_sub[4] = (IFDRational(122, 1), IFDRational(25, 1), IFDRational(10, 1)) # GPSLongitude (122° 25' 10")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif)
    file_bytes = buf.getvalue()

    read_img = Image.open(io.BytesIO(file_bytes))
    meta = detector_service.extract_metadata(read_img, len(file_bytes))

    assert meta.has_exif is True, "Expected has_exif to be True"
    assert "Make" in meta.exif_data and meta.exif_data["Make"] == "TruthLensCameraMaker"
    assert "Model" in meta.exif_data and meta.exif_data["Model"] == "TruthLensModelPro"
    assert "Software" in meta.exif_data and meta.exif_data["Software"] == "TruthLens 1.1.0"
    
    # Check that Sub-IFD 0x8769 was read
    assert "DateTimeOriginal" in meta.exif_data, "DateTimeOriginal should be extracted from Sub-IFD 0x8769"
    assert meta.exif_data["DateTimeOriginal"] == "2026:08:24 18:30:00"
    
    # Check that GPS Sub-IFD 0x8825 was read
    assert "GPSLatitude" in meta.exif_data or "GPSInfo" in meta.exif_data, "GPS tags should be extracted from Sub-IFD 0x8825"
    assert "GPSLatitudeRef" in meta.exif_data and meta.exif_data["GPSLatitudeRef"] == "N"

    # Ensure missing_metadata does not complain about recorded fields
    assert not any("Capture timestamp omitted" in m for m in meta.missing_metadata), "DateTimeOriginal is present"
    assert not any("Camera hardware model" in m for m in meta.missing_metadata), "Make/Model is present"
    assert not any("GPS / Geotagging" in m for m in meta.missing_metadata), "GPS is present"

    print(f"[OK] EXIF metadata extracted successfully: {len(meta.exif_data)} tags captured (including DateTimeOriginal & GPS).")

def test_full_pipeline_with_rgba_and_orientation():
    """Verify detector_service.analyze_image executes cleanly on an RGBA image without warnings."""
    print("[*] Running Test 4: Full analyze_image pipeline with RGBA PNG...")
    png_img = Image.new("RGBA", (100, 100), (0, 120, 200, 0))
    buf = io.BytesIO()
    png_img.save(buf, format="PNG")
    file_bytes = buf.getvalue()

    res = detector_service.analyze_image(file_bytes, "test_alpha.png")
    assert res.status == "success"
    assert res.frequency_analysis.fft_visualization_base64.startswith("data:image/png;base64,")
    # Verify Step 6 Audit ID format: TL- followed by first 10 uppercase hex chars of SHA-256
    raw_hex = res.sha256_hash.replace("sha256:", "")
    expected_id = f"TL-{raw_hex[:10].upper()}"
    assert res.id == expected_id, f"Expected audit ID '{expected_id}', got '{res.id}'"
    assert len(res.id) == 13, f"Expected 13 chars, got {len(res.id)}"
    # Verify that the 10 characters after TL- are valid hexadecimal
    int(res.id[3:], 16)
    print(f"[OK] Audit ID successfully verified: '{res.id}' (10 hex characters from SHA-256).")
    print("[OK] analyze_image pipeline successfully processed RGBA PNG through FFT and AI classifier.")

def run_all_tests():
    print("=" * 60)
    print("        RUNNING STEP 3 & STEP 6 UNIT TESTS")
    print("=" * 60)
    test_rotated_exif_image()
    test_rgba_and_color_modes()
    test_exif_rich_jpeg()
    test_full_pipeline_with_rgba_and_orientation()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
