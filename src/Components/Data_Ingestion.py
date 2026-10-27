from src.logger import logging
from src.exception import CustomException
import numpy as np
import pandas as pd
import os
from dataclasses import dataclass
from sklearn.model_selection import train_test_split
import sys
from src.Components.Data_transformation import DataTransformationConfig,DataTransformation
from src.Components.Model_trainer import model_trainer_,model_trainer_ingest
@dataclass
class DataIngestionConfig:
    raw_data_path:str=os.path.join('artifacts/data.csv')
    train_data_path:str=os.path.join('artifacts/train.csv')
    test_data_path:str=os.path.join('artifacts/test.csv')

class DataIngestion:
    def __init__(self):
        self.ingestion_config=DataIngestionConfig()

    def initiate_data_ingestion(self):
        try:
            df=pd.read_csv('src/NoteBook/smart_city_traffic_mobility.csv')
            logging.info("Succesfully loaded the data")

            selected_columns = [
                "city_zone",
                "road_type",
                "lanes",
                "speed_limit",
                "vehicle_count",
                "average_speed",
                "traffic_density",
                "queue_length",
                "hour",
                "is_weekend",
                "weather_condition",
                "congestion_level"
            ]
            df_Cleaned=df[selected_columns]
            train_set,test_set=train_test_split(df_Cleaned,test_size=0.20,random_state=42)
            logging.info("Sucessfully splited the data into training and testing sets")

            os.makedirs('artifacts',exist_ok=True)

            df_Cleaned.to_csv(self.ingestion_config.raw_data_path,index=False,header=True)
            logging.info("Saved the raw data in the artifacts folder")

            train_set.to_csv(self.ingestion_config.train_data_path,index=False,header=True)
            logging.info("Saved the train data in the artifacts folder")

            test_set.to_csv(self.ingestion_config.test_data_path,index=False,header=True)
            logging.info("saved the test data in the artifacts folder ")

            X_train=train_set.drop('congestion_level',axis=1)
            X_test=test_set.drop('congestion_level',axis=1)
            y_train=train_set['congestion_level']
            y_test=test_set['congestion_level']

            return(
                X_train,X_test,y_train,y_test
            )
        except Exception as e:
            raise CustomException(e,sys)

if __name__=='__main__':
    data_ingestion_obj=DataIngestion()
    X_train,X_test,y_train,y_test=data_ingestion_obj.initiate_data_ingestion()

    data_transformation_obj=DataTransformation()
    X_train_prep,X_test_prep,y_train_encoded,y_test_encoded=data_transformation_obj.Initiate_DataTransformation(X_train,X_test,y_train,y_test)

    model_trainer=model_trainer_()
    model_obj,r2_score=model_trainer.initiate_model_trainer(X_train_prep,X_test_prep,y_train_encoded,y_test_encoded)
    print("r2_score of the best model is : ",r2_score)

    
