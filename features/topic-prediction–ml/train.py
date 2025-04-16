"""
Written with Claude Sonnet 3.7 – verified and tested.
"""


import os
import pdb
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import pickle
import joblib
from datasets import load_dataset

def main():
    # Load dataset
    data = load_dataset("nbertagnolli/counsel-chat")
    df = data['train'].to_pandas()

    # drop rows where questionText is None
    df = df.dropna(subset=['questionText'])
    
    # create unique examples as their are multiple rows per question
    # df = df.drop_duplicates(subset=['questionID'])
    print(f'Total rows in df: {df.shape}')

    # Set random seed for reproducibility
    RANDOM_SEED = 42
    
    # Split data into train and validation
    train_df, val_df = train_test_split(
        df, 
        test_size=0.2, 
        random_state=RANDOM_SEED
    )
    
    print(f"Training on {len(train_df)} samples, validating on {len(val_df)} samples")
    
    # Initialize Sentence-BERT model
    # TODO: We will compare this strong baseline with perhaps another model pretrained on mental health datas
    print("Loading Sentence-BERT model...")

    # baseline
    # model = SentenceTransformer('all-MiniLM-L6-v2')

    # mental-bert
    model = SentenceTransformer('mental/mental-bert-base-uncased')

    all_topics = df['topic'].unique()

    # Encode labels
    label_encoder = LabelEncoder()
    label_encoder.fit(all_topics)
    train_labels = label_encoder.transform(train_df['topic'])
    val_labels = label_encoder.transform(val_df['topic'])
    
    # Create embeddings for train and validation texts
    print("Creating embeddings for training data...")
    train_embeddings = model.encode(train_df['questionText'].tolist(), show_progress_bar=True, batch_size=32)
    
    print("Creating embeddings for validation data...")
    val_embeddings = model.encode(val_df['questionText'].tolist(), show_progress_bar=True, batch_size=32)
    
    # Train a classifier on top of embeddings
    print("Training classifier...")
    classifier = LogisticRegression(
        C=1.0,
        max_iter=1000,
        class_weight='balanced',
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    classifier.fit(train_embeddings, train_labels)
    
    # Evaluate on validation set
    val_pred_probabilities = classifier.predict_proba(val_embeddings)
    val_predictions = val_pred_probabilities.argmax(-1)

    accuracy = accuracy_score(val_labels, val_predictions)
    print(f"Validation accuracy: {accuracy:.4f}")
    
    # Print detailed classification report
    class_report = classification_report(
        val_labels, 
        val_predictions, 
        labels=range(len(label_encoder.classes_)),  # Use all possible label indices
        target_names=label_encoder.classes_,
        zero_division=0
    )
    print("Classification Report:")
    print(class_report)
    
    # Save the final model and label encoder
    os.makedirs('weights', exist_ok=True)
    
    # Save classifier
    joblib.dump(classifier, 'weights/mental_bert_model.joblib')
    
    # Save label encoder
    with open('weights/label_encoder.pkl', 'wb') as f:
        pickle.dump(label_encoder, f)
    
    print("Model and label encoder saved to 'weights/' directory")
    
    # Test the inference function with sample data
    sample_text = val_df['questionText'].iloc[0]
    predicted_topic = predict_topic(sample_text, model, classifier, label_encoder)
    actual_topic = val_df['topic'].iloc[0]
    print(f"\nSample Text: {sample_text[:100]}...")
    print(f"Predicted Topic: {predicted_topic}")
    print(f"Actual Topic: {actual_topic}")


def evaluate_model(model_path, data_path=None):
    """
    Evaluate the trained model on a dataset
    
    Args:
        model_path: Path to the saved model directory
        data_path: Path to evaluation data or None to use default dataset
    
    Returns:
        accuracy: Accuracy score
        report: Classification report
    """
    # Load the saved model components
    classifier = joblib.load(os.path.join(model_path, 'topic_classifier.joblib'))
    
    with open(os.path.join(model_path, 'label_encoder.pkl'), 'rb') as f:
        label_encoder = pickle.load(f)
    
    # Load Sentence-BERT model
    sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Load evaluation data
    if data_path:
        eval_df = pd.read_csv(data_path)
    else:
        # Use default dataset
        eval_data = load_dataset("nbertagnolli/counsel-chat")
        full_df = eval_data['train'].to_pandas()
        _, eval_df = train_test_split(
            full_df, 
            test_size=0.2, 
            random_state=42, 
            stratify=full_df['topic']
        )
    
    # Create embeddings
    eval_embeddings = sbert_model.encode(
        eval_df['questionText'].tolist(),
        show_progress_bar=True,
        batch_size=32
    )
    
    # Encode labels
    eval_labels = label_encoder.transform(eval_df['topic'])
    
    # Make predictions
    predictions = classifier.predict(eval_embeddings)
    
    # Calculate metrics
    accuracy = accuracy_score(eval_labels, predictions)
    report = classification_report(
        eval_labels,
        predictions,
        target_names=label_encoder.classes_,
        zero_division=0
    )
    
    return accuracy, report


def predict_topic(text, sbert_model=None, classifier=None, label_encoder=None):
    """
    Predict the topic for a given text
    
    Args:
        text: Input text string
        sbert_model: Optional pre-loaded SentenceTransformer model
        classifier: Optional pre-loaded classifier model
        label_encoder: Optional pre-loaded label encoder
    
    Returns:
        predicted_topic: String with predicted topic
    """
    # Load models if not provided
    if sbert_model is None:
        sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    if classifier is None or label_encoder is None:
        model_path = 'model'
        classifier = joblib.load(os.path.join(model_path, 'topic_classifier.joblib'))
        with open(os.path.join(model_path, 'label_encoder.pkl'), 'rb') as f:
            label_encoder = pickle.load(f)
    
    # Create embedding for the input text
    embedding = sbert_model.encode([text], show_progress_bar=False)
    
    # Predict topic
    prediction = classifier.predict(embedding)[0]
    predicted_topic = label_encoder.inverse_transform([prediction])[0]
    
    return predicted_topic


if __name__ == "__main__":
    main()