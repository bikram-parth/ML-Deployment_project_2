import sys
from src.logger import logging
from src.exception import CustomException
import os
import joblib

def save_object(object,file_path):
    try:
        dirname=os.path.dirname(file_path)
        os.makedirs(dirname,exist_ok=True)
        joblib.dump(object,file_path)

    except Exception as e:
        raise CustomException(e,sys)