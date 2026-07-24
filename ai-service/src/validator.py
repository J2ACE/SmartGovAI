import cv2
import numpy as np
from PIL import Image
import io

def validate_image_quality(image_bytes: bytes) -> tuple[bool, str]:
    """
    Executes Image Integrity & Quality Check (Laplacian Variance test for blur/pitch-black images).
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return False, "Invalid image header or corrupted image file."

        # Check dimensions
        height, width, _ = img.shape
        if height < 400 or width < 400:
            return False, f"Image dimensions ({width}x{height}) are too small. Minimum required is 400x400px."

        # Check Blurriness via Laplacian Variance
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        if laplacian_var < 50.0:
            return False, "Image is too blurry. Please capture a clearer photo of the issue."

        # Check Brightness / Pitch Black
        mean_brightness = np.mean(gray)
        if mean_brightness < 20.0:
            return False, "Image is too dark. Please capture photo under adequate lighting."

        return True, "Image quality passed."
    except Exception as e:
        return False, f"Validation error: {str(e)}"
