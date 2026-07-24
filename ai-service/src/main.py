from fastapi import FastAPI, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from src.validator import validate_image_quality
from src.predictor import predict_civic_issue

app = FastAPI(
    title="SmartGovAI Vision Microservice",
    description="FastAPI AI Computer Vision Inference Microservice for Municipal Civic Defect Classification",
    version="1.0.0"
)

class BoundingBox(BaseModel):
    label: str
    confidence: float
    bbox: List[int]

class PredictionResponse(BaseModel):
    success: bool
    category: str
    confidence: float
    priority: str
    isDuplicate: bool
    boundingBoxes: List[BoundingBox]
    validationMessage: str

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "healthy", "service": "SmartGovAI Vision Microservice", "model": "YOLOv11"}

@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided is not an image."
        )

    contents = await file.read()
    
    # 1. Validate Image Quality
    is_valid, validation_msg = validate_image_quality(contents)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image validation failed: {validation_msg}"
        )

    # 2. Run Inference Pipeline
    prediction = predict_civic_issue(contents)

    return PredictionResponse(
        success=True,
        category=prediction["category"],
        confidence=prediction["confidence"],
        priority=prediction["priority"],
        isDuplicate=prediction["isDuplicate"],
        boundingBoxes=prediction["boundingBoxes"],
        validationMessage=validation_msg
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
