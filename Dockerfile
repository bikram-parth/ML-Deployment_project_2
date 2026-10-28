FROM python:3.12
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE $PORT
CMD uvicorn src.templates.app:app --host 0.0.0.0 --port $PORT
