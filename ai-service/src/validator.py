import cv2
import numpy as np
from PIL import Image
import io

def validate_image_quality(image_bytes: bytes) -> tuple[bool, str]:
    """
    Executes Image Quality Validation for municipal issue photos.
    Relaxes thresholds for JPEG compressed camera uploads.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return False, "Invalid image header or corrupted file."

        height, width, _ = img.shape
        if height < 150 or width < 150:
            return False, f"Image dimensions ({width}x{height}) are too small."

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Blur threshold relaxed for mobile camera JPEG compression
        if laplacian_var < 5.0:
            return False, "Image is extremely blurry. Please capture a clearer photo."

        # Pitch black check
        mean_brightness = np.mean(gray)
        if mean_brightness < 12.0:
            return False, "Image is too dark. Please capture photo under adequate lighting."

        return True, "Image quality passed."
    except Exception as e:
        return True, "Quality check bypassed."
