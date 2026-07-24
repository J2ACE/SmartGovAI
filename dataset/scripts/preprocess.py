import os
import shutil
import random

def split_dataset(image_dir: str, train_ratio: float = 0.7, val_ratio: float = 0.2):
    """
    Executes automated 70/20/10 Train/Validation/Test split for YOLO civic image datasets.
    """
    images = [f for f in os.listdir(image_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
    random.shuffle(images)

    total = len(images)
    train_end = int(total * train_ratio)
    val_end = train_end + int(total * val_ratio)

    train_files = images[:train_end]
    val_files = images[train_end:val_end]
    test_files = images[val_end:]

    print(f"Dataset split complete: Total={total}, Train={len(train_files)}, Val={len(val_files)}, Test={len(test_files)}")

if __name__ == "__main__":
    print("SmartGovAI Dataset Preprocessing Engine Initialized.")
