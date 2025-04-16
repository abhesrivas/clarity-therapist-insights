# python predictor.py --text "I hate myself"

"""
Topic prediction model server for the Clarity app
"""
import os
import sys
import json
import joblib
import numpy as np
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Paths to model files
MODEL_DIR = '/Users/abhi/Desktop/legacy/features/topic-prediction–ml/'
WEIGHTS_DIR = os.path.join(MODEL_DIR, "weights")

# Global variables to store loaded models
model = None
classifier = None
label_encoder = None

def load_models():
    """Load all necessary ML models"""
    global model, classifier, label_encoder
    
    try:
        print(f"Loading models from {WEIGHTS_DIR}")
        
        # Load SentenceBERT model
        print("Loading SentenceBERT model...")
        model = SentenceTransformer('mental/mental-bert-base-uncased')
        
        # Load classifier
        classifier_path = os.path.join(WEIGHTS_DIR, 'mental_bert_model.joblib')
        print(f"Loading classifier from {classifier_path}")
        classifier = joblib.load(classifier_path)
        
        # Load label encoder
        encoder_path = os.path.join(WEIGHTS_DIR, 'label_encoder.pkl')
        print(f"Loading label encoder from {encoder_path}")
        with open(encoder_path, 'rb') as f:
            label_encoder = pickle.load(f)
            
        # Save labels as JSON for frontend use
        labels_json_path = os.path.join(WEIGHTS_DIR, 'label_encoder.json')
        with open(labels_json_path, 'w') as f:
            json.dump({"classes": label_encoder.classes_.tolist()}, f)

        print("Models loaded successfully")
        return True
    except Exception as e:
        print(f"Error loading models: {e}")
        return False

@app.route('/api/predict-topics', methods=['POST'])
def predict_topics():
    """Endpoint to predict topics from text"""
    if not model or not classifier or not label_encoder:
        return jsonify({"error": "Models not loaded"}), 500
    
    # Get text from request
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text']
    top_k = data.get('top_k', 5)
    
    try:
        # Create embedding
        embedding = model.encode([text], show_progress_bar=False)
        
        # Get prediction probabilities
        probas = classifier.predict_proba(embedding)[0]
        
        # Get top-k predictions
        top_indices = probas.argsort()[-top_k:][::-1]
        
        # Format response
        predictions = [
            {
                "topic": label_encoder.inverse_transform([idx])[0],
                "confidence": float(probas[idx])
            }
            for idx in top_indices
        ]
        
        return jsonify({"predictions": predictions})
    
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": model is not None and classifier is not None and label_encoder is not None
    })

if __name__ == '__main__':
    # Load models on startup
    if load_models():
        # Run the server
        app.run(host='0.0.0.0', port=6000, debug=True)
    else:
        print("Failed to load models. Exiting.")
        sys.exit(1)

    # Testing
    """
    curl -X POST http://localhost:6000/api/predict-topics \
        -H "Content-Type: application/json" \
        -d '{"text": "I feel anxious about my upcoming presentation at work"}'
    """
