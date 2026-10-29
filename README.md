# 🚦 Smart City Traffic Congestion Prediction

### End-to-End Machine Learning Deployment | Docker | GitHub Actions CI/CD | Render

An end-to-end Machine Learning project that predicts traffic congestion using urban mobility data. This project demonstrates the complete ML deployment workflow, including data processing, model integration, REST API development, Docker containerization, and automated deployment using GitHub Actions and Render.

## 🌐 Live Demo

- **Frontend Web Application:** https://ml-deployment-project-2-3.onrender.com
- **Backend Prediction API:** https://ml-deployment-project-2-2.onrender.com
- **Interactive API Documentation:** https://ml-deployment-project-2-2.onrender.com/docs

The frontend allows users to interact with the application, while the backend API handles prediction requests and returns results from the trained machine learning model.

## 📌 Project Overview

Machine learning models are useful only when their predictions can be accessed and used by applications. This project focuses on bridging the gap between model development and real-world deployment.

I developed a Smart City Traffic Congestion Prediction application that uses urban mobility and traffic-related features to predict congestion levels. I integrated the trained model into a FastAPI backend, connected it to a web frontend, containerized the application using Docker, and configured a GitHub Actions workflow to trigger deployments through the Render API.

The project demonstrates practical experience with machine learning deployment, API development, containerization, cloud hosting, and CI/CD automation.

## ✨ Key Features

- **Machine Learning:** Uses a trained model to predict traffic congestion from input features.
- **Data Processing:** Organizes data ingestion and preprocessing into reusable components.
- **Model Serialization:** Uses Joblib to save and load trained models and preprocessing artifacts.
- **REST API:** Exposes prediction functionality through FastAPI.
- **Input Validation:** Uses Pydantic to validate incoming API requests.
- **Frontend Integration:** Connects an HTML, CSS, and JavaScript interface to the backend API.
- **Docker Containerization:** Packages the application and its dependencies into a Docker image.
- **Docker Hub:** Publishes the Docker image for distribution and execution.
- **GitHub Actions CI/CD:** Automates the configured deployment workflow using GitHub Actions.
- **Cloud Deployment:** Hosts the frontend and backend services on Render.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Application development |
| Pandas | Data manipulation and processing |
| NumPy | Numerical operations |
| Scikit-learn | Machine learning and preprocessing |
| Joblib | Model and preprocessing artifact serialization |
| FastAPI | Backend REST API |
| Pydantic | Request validation |
| Uvicorn | ASGI server |
| HTML, CSS, JavaScript | Frontend development |
| Docker | Containerization |
| Docker Hub | Docker image hosting |
| GitHub Actions | CI/CD workflow automation |
| Render | Cloud deployment |
| Git & GitHub | Version control and source code management |

## 🏗️ System Architecture

```text
             Urban Mobility Dataset
                       |
                       v
             Data Ingestion & Processing
                       |
                       v
              ML Model Training
                       |
                       v
           Serialized Model Artifacts
                       |
                       v
                FastAPI Backend
                       |
                       v
              Prediction API Endpoint
                       |
                       v
              Frontend Web Application
                       |
                       v
              Congestion Prediction


                CI/CD Workflow

               Code Changes
                    |
                    v
              GitHub Repository
                    |
                    v
               GitHub Actions
                    |
                    v
              Render API Request
                    |
                    v
             Render Deployment
                    |
                    v
              Updated Web Service
```

## 🔄 CI/CD Pipeline Using GitHub Actions

A major part of this project is the implementation of a Continuous Integration and Continuous Deployment (CI/CD) workflow using GitHub Actions.

Instead of manually initiating every deployment, I configured a GitHub Actions workflow that triggers under specified conditions and sends a deployment request to Render.

### Workflow

1. **Code Management:** Make changes to the application and push them to the GitHub repository.
2. **Workflow Trigger:** GitHub Actions runs the configured workflow when its trigger conditions are satisfied.
3. **Secure Credentials:** Store the Render API key and service ID in GitHub Actions repository secrets.
4. **Deployment Request:** Use an HTTP request to the Render API to trigger deployment of the configured service.
5. **Cloud Deployment:** Render processes the deployment and updates the hosted application.

### Technologies Used in CI/CD

- **GitHub Actions:** Automates the deployment workflow.
- **YAML:** Defines the workflow configuration.
- **GitHub Secrets:** Stores deployment credentials securely.
- **Render API:** Allows the workflow to request a deployment.
- **Docker:** Packages the application into a portable container.

This implementation demonstrates how version control and cloud deployment can be connected through an automated workflow, reducing the need for manual deployment initiation.

## 🐳 Docker Containerization

I created a Dockerfile using Python 3.12 to package the application and install the required dependencies.

The container runs the FastAPI application using Uvicorn and exposes the configured application port.

### Build the Docker image

Run the following command from the project root:

```bash
docker build -t ml_deployment_project2 .
```

### Run the container locally

```bash
docker run -p 8000:8000 ml_deployment_project2
```

### Run the published Docker Hub image

```bash
docker run -p 8000:8000 bikramdebnath2006/ml_deployment_project2:latest
```

### Access the application

Once the container is running, visit:

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

Docker makes the application easier to package, distribute, and run in a consistent environment.

## ☁️ Cloud Deployment on Render

The application is deployed on Render, with separate URLs for the frontend and backend.

### Frontend

https://ml-deployment-project-2-3.onrender.com

The frontend provides the user interface for submitting inputs and viewing prediction results.

### Backend API

https://ml-deployment-project-2-2.onrender.com

The backend receives prediction requests, processes the input data, and returns predictions.

### API Documentation

https://ml-deployment-project-2-2.onrender.com/docs

The Swagger UI provides an interactive way to inspect and test the available API endpoints.

The GitHub Actions workflow triggers the configured Render deployment through its API, while Docker provides a consistent application packaging environment.

## 📁 Project Structure

The repository is organized into source code, model artifacts, logs, and deployment configuration.

```text
ML-Deployment_project_2/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
│
├── artifacts/                  # Saved ML model and preprocessing artifacts
│
├── logs/                       # Application and pipeline logs
│
├── src/                        # Application and ML source code
│
├── .gitignore                  # Git exclusion rules
├── Dockerfile                  # Docker image configuration
├── requirements.txt            # Python dependencies
├── setup.py                    # Python package configuration
└── README.md                   # Project documentation
```

*Note: The structure above summarizes the repository's main components. The exact workflow filename and files inside `src/` and `artifacts/` may differ.*

## ▶️ Run the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/bikram-parth/ML-Deployment_project_2.git
cd ML-Deployment_project_2
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI application

Run the command from the project root:

```bash
uvicorn src.Components.app:app --reload --host 0.0.0.0 --port 8000
```

### 5. Open the API documentation

Visit:

http://localhost:8000/docs

You can inspect the API endpoints and submit test requests through Swagger UI.

## 🎯 Key Learning Outcomes

Through this project, I gained practical experience in:

- Developing an end-to-end machine learning application.
- Organizing ML code into reusable components.
- Integrating trained models and preprocessing artifacts into an API.
- Developing REST APIs using FastAPI and Pydantic.
- Containerizing Python applications using Docker.
- Building and running Docker images locally.
- Publishing container images to Docker Hub.
- Configuring GitHub Actions for deployment automation.
- Managing deployment credentials using GitHub Secrets.
- Triggering cloud deployments through the Render API.
- Integrating a frontend with a cloud-hosted backend.
- Understanding the practical relationship between machine learning, Docker, cloud deployment, and CI/CD.

## 🔮 Future Improvements

- Add automated testing for API endpoints and preprocessing.
- Introduce automated model retraining and evaluation.
- Add model performance monitoring and prediction logging.
- Improve API error handling and observability.
- Enhance the frontend with interactive traffic visualizations.
- Extend the CI/CD workflow with additional validation and testing stages.

## 👨‍💻 Author

**Bikram Debnath**

B.Tech in Computer Science and Engineering — Artificial Intelligence and Machine Learning

- **GitHub:** https://github.com/bikram-parth
- **Project Repository:** https://github.com/bikram-parth/ML-Deployment_project_2

---

*This project demonstrates the integration of machine learning deployment, REST API development, Docker containerization, and GitHub Actions-based CI/CD automation for a smart-city application.*