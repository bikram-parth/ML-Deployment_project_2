
import pandas as pd
import joblib
from pathlib import Path
from typing import Literal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Smart City Traffic Congestion Predictor")

BASE_DIR = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = BASE_DIR / "artifacts"

MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
PREPROCESSOR_PATH = ARTIFACTS_DIR / "preprocessor.pkl"

# LabelEncoder classes are alphabetically ordered.
LABELS = ["High", "Low", "Moderate", "Severe"]

preprocessor = joblib.load(PREPROCESSOR_PATH)
best_model = joblib.load(MODEL_PATH)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Student_Data(BaseModel):
    city_zone: Literal[
        "Financial District",
        "Industrial East",
        "Suburban North",
        "Downtown Core",
        "Tech Park",
        "Residential West",
    ]

    road_type: Literal[
        "Local Street",
        "Arterial",
        "Collector",
        "Highway",
    ]

    lanes: int = Field(ge=2,le=4)
    speed_limit: float = Field(gt=40,le=90)
    vehicle_count: int = Field(ge=54,le=3162)
    average_speed: float = Field(ge=5,le=90)
    traffic_density: float = Field(ge=9,le=378)
    queue_length: float = Field(ge=0,le=10111)
    hour: int = Field(ge=0, le=23)
    is_weekend:int=Field(ge=0,le=1)

    weather_condition: Literal[
        "Clear",
        "Rain",
        "Heavy Rain",
        "Fog",
    ]

@app.get("/")
def welcome():
    return {
        "message": "Welcome to the Smart City Traffic Congestion Predictor"
    }

@app.post("/predict")
def predict(data: Student_Data):

    input_row = pd.DataFrame([{
        "city_zone": data.city_zone,
        "road_type": data.road_type,
        "lanes": data.lanes,
        "speed_limit": data.speed_limit,
        "vehicle_count": data.vehicle_count,
        "average_speed": data.average_speed,
        "traffic_density": data.traffic_density,
        "queue_length": data.queue_length,
        "hour": data.hour,
        "is_weekend": int(data.is_weekend),
        "weather_condition": data.weather_condition,
    }])

    input_preprocessed = preprocessor.transform(input_row)

    prediction = best_model.predict(input_preprocessed)
    predicted_class = LABELS[int(prediction[0])]

    return {
        "congestion_level": predicted_class
    }
