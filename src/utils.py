import sys
from src.logger import logging
from src.exception import CustomException
import os
import joblib
from sklearn.metrics import r2_score

def save_object(object,file_path):
    try:
        dirname=os.path.dirname(file_path)
        os.makedirs(dirname,exist_ok=True)
        joblib.dump(object,file_path)

        logging.info("Succesfully saved the Object")
    except Exception as e:
        raise CustomException(e,sys)

def train(model,X_train_preprocessed,X_test_preprocessed,y_train,y_test):
    model_name=model()
    model_name.fit(X_train_preprocessed,y_train)
    y_pred=model_name.predict(X_test_preprocessed)

    return(
        model_name,
        r2_score(y_true=y_test,y_pred=y_pred)
    )

def get_first(dict):
    key=None
    value=None
    for keys in dict:
        key=keys
        value=dict[key]
        break
    return(key,value)