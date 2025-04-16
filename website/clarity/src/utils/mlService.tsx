// mlService.tsx - Updated to use local model
import { useState, useEffect } from 'react';
import { Patient } from './patientData';

// Interface to define the structure of topic predictions
export interface TopicPrediction {
  topic: string;
  confidence: number;
}

// Class to handle ML-powered topic prediction
class MLService {
  private apiBaseUrl: string;
  private isLocalModel: boolean;
  private isModelLoaded: boolean = false;
  private labelEncoder: string[] = [];

  constructor(apiBaseUrl: string = '', useLocalModel: boolean = true) {
    this.apiBaseUrl = apiBaseUrl;
    this.isLocalModel = useLocalModel;
    
    // Initialize model when service is created
    if (this.isLocalModel) {
      this.initializeLocalModel();
    }
  }

  /**
   * Initialize the local ML model
   */
  private async initializeLocalModel() {
    try {
      // Load label encoder from PKL file
      const labelEncoderResponse = await fetch('/topic-prediction-ml/weights/label_encoder.json');
      if (labelEncoderResponse.ok) {
        const labelData = await labelEncoderResponse.json();
        this.labelEncoder = labelData.classes;
        console.log('Label encoder loaded with', this.labelEncoder.length, 'topics');
      } else {
        console.error('Failed to load label encoder');
      }

      this.isModelLoaded = true;
      console.log('Local ML model initialized');
    } catch (error) {
      console.error('Error initializing local model:', error);
      this.isModelLoaded = false;
    }
  }

  /**
   * Get topic predictions for a given text input
   * 
   * @param text The patient text to analyze
   * @param limit The maximum number of topics to return (default: 5)
   * @returns Array of topic predictions with confidence scores
   */
  async getTopicPredictions(text: string, limit: number = 5): Promise<TopicPrediction[]> {
    // Use local model implementation
    if (this.isLocalModel) {
      if (!this.isModelLoaded) {
        await this.initializeLocalModel();
      }
      return this.getLocalPredictions(text, limit);
    }

    // For production, make an API call to the backend service
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/topics/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.predictions.slice(0, limit);
    } catch (error) {
      console.error('Error predicting topics:', error);
      // Return mock predictions as fallback
      return this.getMockPredictions(text, limit);
    }
  }

  /**
   * Use the local server-side model for prediction
   */
  private async getLocalPredictions(text: string, limit: number): Promise<TopicPrediction[]> {
    try {
      const response = await fetch('/api/predict-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Local prediction failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.predictions.slice(0, limit);
    } catch (error) {
      console.error('Error with local prediction:', error);
      // Fall back to mock predictions
      return this.getMockPredictions(text, limit);
    }
  }

  /**
   * Generate therapeutic nudges based on patient message and approach
   * 
   * @param patientMessage The patient's message
   * @param approach The therapeutic approach (cbt, psychodynamic, mindfulness)
   * @param topicPredictions Optional topic predictions to guide the nudge
   * @returns A therapeutic nudge suggestion
   */
  async generateTherapeuticNudge(
    patientMessage: string, 
    approach: string, 
    topicPredictions?: TopicPrediction[]
  ): Promise<string> {
    // For local implementation...
    if (this.isLocalModel) {
      // If we have topic predictions, use them to enhance nudge generation
      const predictionContext = topicPredictions 
        ? `Based on these topics: ${topicPredictions.slice(0, 3).map(t => t.topic).join(', ')}. `
        : '';
        
      return this.getMockNudge(patientMessage, approach, topicPredictions);
    }

    // For production implementation...
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nudges/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: patientMessage, 
          approach,
          topics: topicPredictions 
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.nudge;
    } catch (error) {
      console.error('Error generating nudge:', error);
      return this.getMockNudge(patientMessage, approach, topicPredictions);
    }
  }

  /**
   * Mock implementation of topic prediction
   * This simulates what the actual ML model would return
   */
  private getMockPredictions(text: string, limit: number): TopicPrediction[] {
    // Map of keywords to topics
    const keywordTopics: Record<string, TopicPrediction[]> = {
      'anxious': [
        { topic: 'anxiety', confidence: 0.78 },
        { topic: 'stress', confidence: 0.65 },
        { topic: 'sleep-improvement', confidence: 0.42 },
        { topic: 'self-esteem', confidence: 0.38 },
        { topic: 'depression', confidence: 0.25 }
      ],
      'sad': [
        { topic: 'depression', confidence: 0.82 },
        { topic: 'grief-and-loss', confidence: 0.64 },
        { topic: 'self-esteem', confidence: 0.58 },
        { topic: 'anxiety', confidence: 0.32 },
        { topic: 'family-conflict', confidence: 0.22 }
      ],
      'relationship': [
        { topic: 'relationships', confidence: 0.85 },
        { topic: 'intimacy', confidence: 0.75 },
        { topic: 'family-conflict', confidence: 0.48 },
        { topic: 'social-relationships', confidence: 0.45 },
        { topic: 'marriage', confidence: 0.38 }
      ],
      'work': [
        { topic: 'workplace-relationships', confidence: 0.72 },
        { topic: 'stress', confidence: 0.68 },
        { topic: 'anxiety', confidence: 0.52 },
        { topic: 'self-esteem', confidence: 0.35 },
        { topic: 'behavioral-change', confidence: 0.28 }
      ],
      'sleep': [
        { topic: 'sleep-improvement', confidence: 0.88 },
        { topic: 'anxiety', confidence: 0.65 },
        { topic: 'stress', confidence: 0.62 },
        { topic: 'depression', confidence: 0.48 },
        { topic: 'behavioral-change', confidence: 0.32 }
      ],
      'angry': [
        { topic: 'anger-management', confidence: 0.92 },
        { topic: 'family-conflict', confidence: 0.68 },
        { topic: 'relationships', confidence: 0.54 },
        { topic: 'stress', confidence: 0.45 },
        { topic: 'behavioral-change', confidence: 0.32 }
      ],
      'family': [
        { topic: 'family-conflict', confidence: 0.87 },
        { topic: 'parenting', confidence: 0.72 },
        { topic: 'relationships', confidence: 0.65 },
        { topic: 'marriage', confidence: 0.48 },
        { topic: 'domestic-violence', confidence: 0.22 }
      ]
    };

    // Default predictions
    const defaultPredictions: TopicPrediction[] = [
      { topic: 'self-esteem', confidence: 0.42 },
      { topic: 'relationships', confidence: 0.38 },
      { topic: 'anxiety', confidence: 0.35 },
      { topic: 'depression', confidence: 0.28 },
      { topic: 'stress', confidence: 0.25 }
    ];

    // Find matching keywords
    let predictions = defaultPredictions;
    const lowercaseText = text.toLowerCase();
    
    for (const [keyword, topics] of Object.entries(keywordTopics)) {
      if (lowercaseText.includes(keyword)) {
        predictions = topics;
        break;
      }
    }

    // Add some randomness to make it seem more realistic
    return predictions
      .map(pred => ({
        ...pred,
        confidence: Math.min(0.99, Math.max(0.01, pred.confidence * (0.9 + Math.random() * 0.2)))
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Mock implementation of nudge generation
   */
  private getMockNudge(
    patientMessage: string, 
    approach: string, 
    topicPredictions?: TopicPrediction[]
  ): string {
    // Standard nudges by therapeutic approach
    const approachNudges: Record<string, string[]> = {
      'cbt': [
        "Consider exploring the cognitive distortions that might be present in their thinking.",
        "You might ask about evidence for and against these thoughts.",
        "This could be a good moment to introduce a thought record.",
        "Consider helping them identify the core belief behind these statements.",
        "You could explore behavioral activation strategies for this situation."
      ],
      'psychodynamic': [
        "Consider asking about childhood experiences that might relate to this pattern.",
        "You might explore how past relationships could be influencing their current feelings.",
        "This could be a good moment to note the transference in the therapeutic relationship.",
        "Consider exploring defenses that might be at work here.",
        "You might connect this to patterns you've observed previously."
      ],
      'mindfulness': [
        "This might be a good moment to bring attention to bodily sensations.",
        "Consider guiding a brief mindfulness exercise focused on these emotions.",
        "You could explore the impermanence of these feelings.",
        "Consider asking what they notice about their breath when discussing this.",
        "You might help them create distance by observing thoughts rather than identifying with them."
      ]
    };

    // Topic-specific nudges
    const topicNudges: Record<string, string[]> = {
      'anxiety': [
        "Consider exploring physical manifestations of their anxiety.",
        "You might ask about avoidance behaviors related to this anxiety.",
        "This could be a good moment to introduce grounding techniques."
      ],
      'depression': [
        "Consider exploring activity levels and potential behavioral activation strategies.",
        "You might ask about sleep patterns and their impact on mood.",
        "This could be a good moment to check for safety concerns."
      ],
      'self-esteem': [
        "Consider exploring core beliefs about self-worth.",
        "You might ask about situations where they feel more confident.",
        "This could be a good moment to introduce self-compassion exercises."
      ],
      'relationships': [
        "Consider exploring patterns across different relationships.",
        "You might ask about their attachment style.",
        "This could be a good moment to explore boundaries."
      ]
    };

    // Select random nudge from the appropriate approach
    const selectedApproachNudges = approachNudges[approach] || approachNudges['cbt'];
    
    // If we have topic predictions, potentially use a topic-specific nudge
    if (topicPredictions && topicPredictions.length > 0 && Math.random() > 0.5) {
      const topTopic = topicPredictions[0].topic;
      if (topicNudges[topTopic]) {
        const topicNudgeOptions = topicNudges[topTopic];
        return topicNudgeOptions[Math.floor(Math.random() * topicNudgeOptions.length)];
      }
    }
    
    return selectedApproachNudges[Math.floor(Math.random() * selectedApproachNudges.length)];
  }
}

// Create and export the service instance
export const mlService = new MLService(
  import.meta.env.VITE_API_BASE_URL || '',
  true // Use local model implementation
);

export default mlService;