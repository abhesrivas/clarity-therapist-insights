# ML Model Backend Integration Guide

This guide explains how to host and integrate your sentence-transformers ML model with the Clarity platform.

## Overview

The Clarity platform now includes ML-powered topic prediction capabilities. There are several options for hosting and deploying the ML model:

1. **API Backend Service**: Create a dedicated microservice for ML predictions
2. **Serverless Functions**: Use serverless functions for on-demand predictions
3. **Client-side Integration**: For development or small-scale deployment

## 1. API Backend Service

This approach involves creating a dedicated service to host the ML model.

### Setup Instructions

#### 1.1 Create a Python FastAPI Service

```python
# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import joblib
import pickle
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Clarity ML API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request/response models
class PredictionRequest(BaseModel):
    text: str
    top_k: int = 5

class TopicPrediction(BaseModel):
    topic: str
    confidence: float

class PredictionResponse(BaseModel):
    predictions: list[TopicPrediction]

# Load models on startup
@app.on_event("startup")
async def startup_event():
    global model, classifier, label_encoder
    
    # Load SentenceBERT model
    model = SentenceTransformer('mental/mental-bert-base-uncased')
    
    # Load classifier
    classifier = joblib.load('weights/mental_bert_model.joblib')
    
    # Load label encoder
    with open('weights/label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)

# Create prediction endpoint
@app.post("/api/topics/predict", response_model=PredictionResponse)
async def predict_topics(request: PredictionRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Empty text provided")
    
    try:
        # Create embedding
        embedding = model.encode([request.text], show_progress_bar=False)
        
        # Get prediction probabilities
        probas = classifier.predict_proba(embedding)[0]
        
        # Get top-k predictions
        top_indices = probas.argsort()[-request.top_k:][::-1]
        
        # Format response
        predictions = [
            TopicPrediction(
                topic=label_encoder.inverse_transform([idx])[0],
                confidence=float(probas[idx])
            )
            for idx in top_indices
        ]
        
        return PredictionResponse(predictions=predictions)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
```

#### 1.2 Dockerfile for Deployment

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files and application code
COPY weights/ /app/weights/
COPY app.py .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 1.3 Requirements.txt

```
fastapi==0.103.1
uvicorn==0.23.2
sentence-transformers==2.2.2
scikit-learn==1.3.0
joblib==1.3.2
pydantic==2.4.2
```

#### 1.4 Deploy Options

- **Docker**: Build and deploy as a container
- **Kubernetes**: For scalable deployment
- **Cloud Services**: AWS ECS, Google Cloud Run, or Azure Container Instances

### 1.5 Update Frontend Configuration

Update the `mlService.ts` file to connect to your API endpoint:

```typescript
const mlService = new MLService(
  'https://your-ml-api-endpoint.com',
  false // Set to false to use the actual API instead of mock data
);
```

## 2. Serverless Functions

This approach uses serverless functions for on-demand predictions.

### 2.1 AWS Lambda Function

```python
# lambda_function.py
import json
import pickle
import joblib
from sentence_transformers import SentenceTransformer

# Load models during cold start
model = SentenceTransformer('mental/mental-bert-base-uncased')
classifier = joblib.load('weights/mental_bert_model.joblib')

with open('weights/label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

def lambda_handler(event, context):
    try:
        # Get input text from request
        body = json.loads(event['body'])
        text = body.get('text', '')
        top_k = body.get('top_k', 5)
        
        if not text:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Empty text provided'})
            }
        
        # Create embedding
        embedding = model.encode([text], show_progress_bar=False)
        
        # Get prediction probabilities
        probas = classifier.predict_proba(embedding)[0]
        
        # Get top-k predictions
        top_indices = probas.argsort()[-top_k:][::-1]
        
        # Format response
        predictions = [
            {
                'topic': label_encoder.inverse_transform([idx])[0],
                'confidence': float(probas[idx])
            }
            for idx in top_indices
        ]
        
        return {
            'statusCode': 200,
            'body': json.dumps({'predictions': predictions})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### 2.2 Deployment Notes

- **Model Size**: The model may be too large for standard Lambda limits. Consider using Lambda containers or another serverless option.
- **Cold Start**: Be aware of cold start times when the function is inactive.
- **API Gateway**: Set up API Gateway to expose your Lambda function.

## 3. Client-side Integration (Development Only)

For development or very small-scale deployments, you can use a lightweight model directly in the browser.

### 3.1 Create a WebAssembly-based Solution

Using ONNX Runtime Web:

```javascript
import * as ort from 'onnxruntime-web';

// Load ONNX model and tokenizer
const loadModel = async () => {
  const model = await ort.InferenceSession.create('model.onnx');
  // Load vocabulary and other necessary files
  
  return model;
};

// Prediction function
const predictTopics = async (text, model, topK = 5) => {
  // Preprocess text
  // Run inference with ONNX Runtime
  // Post-process results
  
  return predictions;
};
```

### 3.2 Notes on Client-side Integration

- **Model Size**: Convert your model to a smaller format (ONNX, TensorFlow.js)
- **Performance**: Client-side prediction may be slower
- **Privacy**: Data stays on the client (potential advantage)
- **Recommended Only For**: Development, testing, or very small deployments

## 4. Additional Considerations

### 4.1 Model Retraining

Set up a pipeline to periodically retrain your model:

1. Store patient conversations and therapist annotations
2. Retrain model with new data periodically
3. Version and deploy updated models

###