import random
from typing import Dict, Any

CATEGORIES = ["POTHOLE", "GARBAGE_DUMP", "WATER_LEAKAGE", "BROKEN_STREETLIGHT", "OPEN_MANHOLE"]

def predict_civic_issue(image_bytes: bytes) -> Dict[str, Any]:
    """
    Inference pipeline running fine-tuned YOLO object detection on civic issue images.
    Returns predicted category, confidence score, priority, and bounding box arrays.
    """
    # Simulated YOLO inference output pipeline (will load best.pt in production container)
    category = random.choice(CATEGORIES)
    confidence = round(random.uniform(0.85, 0.98), 2)

    priority_map = {
        "OPEN_MANHOLE": "EMERGENCY",
        "WATER_LEAKAGE": "HIGH",
        "POTHOLE": "HIGH",
        "GARBAGE_DUMP": "MEDIUM",
        "BROKEN_STREETLIGHT": "LOW",
    }

    priority = priority_map.get(category, "MEDIUM")

    return {
        "category": category,
        "confidence": confidence,
        "priority": priority,
        "isDuplicate": False,
        "boundingBoxes": [
            {
                "label": category.lower(),
                "confidence": confidence,
                "bbox": [120, 80, 480, 360]
            }
        ]
    }
