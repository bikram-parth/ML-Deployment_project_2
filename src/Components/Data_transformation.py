import numpy as np
import pandas as pd
from src.logger import logging
from src.exception import CustomException
from dataclasses import dataclass
import os
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import OneHotEncoder,OrdinalEncoder,LabelEncoder
from sklearn.compose import ColumnTransformer
import sys

@dataclass
class DataTransformationConfig:
    preprocessor_path:str=os.path.join('artifacts/preprocessor.pkl')

class DataTransformation:
    def __init__(self):
        self.data_config=DataTransformationConfig()

    def get_DataTransformationObject(self):
        try:
            all_cat_col=['city_zone', 'road_type','weather_condition']
            numerical_col=['lanes', 'speed_limit', 'vehicle_count',
                'average_speed', 'traffic_density', 'queue_length', 'hour']
            boolean_col=['is_weekend']
            target_col=['congestion_level']

            normal_pipeline=Pipeline(steps=[
                ('scaling',StandardScaler())
            ])
            cat_pipeline=Pipeline(steps=[
                ('one_hot',OneHotEncoder(handle_unknown='ignore'))
            ])

            preprocessor=ColumnTransformer(transformers=[
                ('numerical',normal_pipeline,numerical_col),
                ('categorical',cat_pipeline,all_cat_col)
            ])

            return preprocessor
        except Exception as e:
            raise CustomException(e,sys)

    def Initiate_DataTransformation(self,X_train,X_test,y_train,y_test):
        try:
            logging.info("Preparing Preprocessed Data..")
            preprocessor=self.get_DataTransformationObject()
            X_train_preprocessed=preprocessor.fit_transform(X_train)
            X_test_preprocessed=preprocessor.transform(X_test)

            le=LabelEncoder()
            y_train_encoded=le.fit_transform(y_train)
            y_test_encoded=le.transform(y_test)

            return (X_train_preprocessed,X_test_preprocessed,y_train_encoded,y_test_encoded)
        
        except Exception as e:
            raise CustomException(e,sys)
           