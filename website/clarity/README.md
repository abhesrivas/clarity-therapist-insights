# Clarity - Therapist Support Platform

Clarity is a comprehensive platform designed to help therapists better understand and treat their patients through AI-assisted insights, patient history analysis, and therapeutic rehearsal tools.

## Features Overview

- **Patient History Analysis**: Review and analyze patient session history with AI-generated insights
- **Therapeutic Rehearsal**: Practice therapeutic approaches with simulated patient conversations
- **Literature Review**: Find relevant research papers based on patient symptoms and conditions
- **AI Insights**: Get real-time suggestions and pattern recognition from patient data
- **Condition Screening**: AI-powered screening for potential conditions based on patient data

## Backend Integration Guide

This document outlines how to integrate the necessary backend functionality for each feature using OpenAI and other ML models.

---

## 1. Patient History Analysis

### Data Storage
- Store patient history files in `/data/patients/{patient_id}/history/` as JSON files
- Each session should be stored as a separate file with naming convention: `{session_date}_{session_type}.json`

### Required Backend Files
- `/server/services/patientHistory.js` - Service for CRUD operations on patient history
- `/server/ml/historyAnalysis.js` - ML processing for patient history analysis

### OpenAI Integration
```javascript
// Example implementation for historyAnalysis.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzePatientHistory(patientId) {
  // 1. Load patient history files
  const historyPath = path.join(__dirname, '../../data/patients', patientId, 'history');
  const historyFiles = fs.readdirSync(historyPath).filter(file => file.endsWith('.json'));
  
  // 2. Combine history data
  const historyData = historyFiles.map(file => {
    const filePath = path.join(historyPath, file);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });
  
  // 3. Format data for OpenAI
  const formattedHistory = historyData.map(session => 
    `Date: ${session.date}\nType: ${session.type}\nNotes: ${session.notes}\n${session.homework ? `Homework: ${session.homework}\n` : ''}`
  ).join('\n---\n');
  
  // 4. Send to OpenAI for analysis
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert clinical psychologist assistant. Analyze the following patient history and identify patterns, progress, concerns, and treatment recommendations."
      },
      {
        role: "user",
        content: `Please analyze this patient history and provide insights:\n\n${formattedHistory}`
      }
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });
  
  // 5. Process and structure the response
  const insights = response.choices[0].message.content;
  
  // 6. Save insights to file
  const insightsPath = path.join(__dirname, '../../data/patients', patientId, 'insights.json');
  fs.writeFileSync(insightsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    insights: insights,
    source: 'openai',
    model: 'gpt-4'
  }, null, 2));
  
  return {
    patientId,
    insights
  };
}

module.exports = {
  analyzePatientHistory
};
```

### Testing
1. Create test patient history files in `/data/patients/test_patient/history/`
2. Run the analysis function with the test patient ID
3. Verify the insights are generated and saved correctly

---

## 2. Therapeutic Rehearsal

### Required Backend Files
- `/server/services/patientRehearsal.js` - Service for managing rehearsal sessions
- `/server/ml/rehearsalSimulation.js` - ML processing for simulating patient responses

### OpenAI Integration
```javascript
// Example implementation for rehearsalSimulation.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generatePatientResponse(patientId, therapistMessage, approach, patientHistory) {
  // 1. Load patient data
  const patientDataPath = path.join(__dirname, '../../data/patients', patientId, 'profile.json');
  const patientData = JSON.parse(fs.readFileSync(patientDataPath, 'utf8'));
  
  // 2. Format conversation context
  const conversationHistory = patientHistory.map(msg => ({
    role: msg.sender === 'therapist' ? 'user' : 'assistant',
    content: msg.message
  }));
  
  // 3. Create system prompt based on therapeutic approach
  let systemPrompt = `You are simulating a patient named ${patientData.name} with the following conditions: ${patientData.diagnosis.join(', ')}. 
  The patient has these characteristics: ${patientData.age} years old, ${patientData.gender}.
  Respond as this patient would, showing appropriate symptoms and thought patterns.`;
  
  // Add approach-specific instructions
  if (approach === 'cbt') {
    systemPrompt += ` The therapist is using Cognitive Behavioral Therapy. Show thought patterns that could benefit from cognitive restructuring.`;
  } else if (approach === 'psychodynamic') {
    systemPrompt += ` The therapist is using Psychodynamic Therapy. Include references to past experiences and relationships that might be influencing current feelings.`;
  } else if (approach === 'mindfulness') {
    systemPrompt += ` The therapist is using Mindfulness-Based Therapy. Show difficulty staying present and tendency to worry about past or future.`;
  }
  
  // 4. Send to OpenAI for patient response generation
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: therapistMessage }
    ],
    temperature: 0.7,
    max_tokens: 300,
  });
  
  return {
    message: response.choices[0].message.content,
    timestamp: new Date().toISOString()
  };
}

async function generateTherapyNudge(patientMessage, approach, focusPoints) {
  // Create system prompt for generating therapy nudges
  const systemPrompt = `You are an expert clinical supervisor providing real-time guidance to a therapist. 
  Based on the patient's message, suggest a helpful therapeutic intervention or question.
  Keep suggestions concise, practical, and aligned with ${approach} therapy.
  ${focusPoints ? `Focus areas for this session: ${focusPoints}` : ''}`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Patient said: "${patientMessage}". What would be a good therapeutic response or question?` }
    ],
    temperature: 0.4,
    max_tokens: 150,
  });
  
  return response.choices[0].message.content;
}

module.exports = {
  generatePatientResponse,
  generateTherapyNudge
};
```

### Testing
1. Create a test patient profile in `/data/patients/test_patient/profile.json`
2. Test the response generation with sample therapist messages
3. Verify the responses change based on the therapeutic approach
4. Test the nudge generation with sample patient messages

---

## 3. Literature Review

### Data Storage
- Store research papers in `/data/literature/` as PDF or text files
- Create a metadata index in `/data/literature/index.json` with paper titles, authors, publication dates, and keywords

### Required Backend Files
- `/server/services/literatureReview.js` - Service for searching and retrieving papers
- `/server/ml/paperSimilarity.js` - ML processing for finding relevant papers

### OpenAI Integration with Vector Database
```javascript
// Example implementation for paperSimilarity.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { loadPaperIndex, calculateCosineSimilarity } = require('../utils/vectorUtils');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load paper embeddings from pre-computed index
const paperEmbeddings = loadPaperIndex();

async function findRelevantPapers(query, topK = 5) {
  // 1. Generate embedding for the query
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });
  
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // 2. Calculate similarity with all papers
  const similarities = paperEmbeddings.map(paper => ({
    paper: paper.metadata,
    similarity: calculateCosineSimilarity(queryEmbedding, paper.embedding)
  }));
  
  // 3. Sort by similarity and return top K results
  const topResults = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
  
  return topResults;
}

async function generateLiteratureSummary(patientCondition, relevantPapers) {
  // Create a summary of relevant literature for the patient's condition
  const paperSummaries = relevantPapers.map(paper => 
    `Title: ${paper.paper.title}\nAuthors: ${paper.paper.authors.join(', ')}\nYear: ${paper.paper.year}\nRelevance: ${(paper.similarity * 100).toFixed(1)}%`
  ).join('\n\n');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a research assistant helping a therapist understand the latest research relevant to their patient's condition."
      },
      {
        role: "user",
        content: `Summarize how these research papers relate to treating a patient with ${patientCondition}. Focus on practical clinical applications:\n\n${paperSummaries}`
      }
    ],
    temperature: 0.3,
    max_tokens: 800,
  });
  
  return response.choices[0].message.content;
}

module.exports = {
  findRelevantPapers,
  generateLiteratureSummary
};
```

### Testing
1. Create a test set of research papers with metadata
2. Generate embeddings for the test papers (separate script)
3. Test the similarity search with various queries
4. Verify the summary generation provides clinically relevant information

---

## 4. AI Insights

### Required Backend Files
- `/server/services/aiInsights.js` - Service for generating and managing insights
- `/server/ml/insightGeneration.js` - ML processing for generating insights

### OpenAI Integration
```javascript
// Example implementation for insightGeneration.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSessionInsights(sessionNotes, patientHistory) {
  // Format previous history for context
  const historyContext = patientHistory.slice(-5).map(session => 
    `Date: ${session.date}\nType: ${session.type}\nNotes: ${session.notes}\n`
  ).join('\n---\n');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert clinical psychologist assistant. Generate 3-5 key insights from the latest therapy session notes, considering the patient's history."
      },
      {
        role: "user",
        content: `Previous sessions:\n${historyContext}\n\nLatest session notes:\n${sessionNotes}\n\nGenerate 3-5 key clinical insights from this session.`
      }
    ],
    temperature: 0.3,
    max_tokens: 500,
  });
  
  // Parse the response into an array of insights
  const insightsText = response.choices[0].message.content;
  const insights = insightsText.split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
  
  return insights;
}

async function analyzeLanguagePatterns(patientMessages) {
  // Combine all patient messages
  const combinedText = patientMessages.join('\n');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert in linguistic analysis for clinical psychology. Analyze the patient's language patterns to identify themes, emotional tone, and potential clinical significance."
      },
      {
        role: "user",
        content: `Analyze these patient statements from therapy sessions:\n\n${combinedText}`
      }
    ],
    temperature: 0.3,
    max_tokens: 600,
  });
  
  return {
    analysis: response.choices[0].message.content,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateSessionInsights,
  analyzeLanguagePatterns
};
```

### Testing
1. Create sample session notes and patient history
2. Test the insight generation with the sample data
3. Test the language pattern analysis with sample patient messages
4. Verify the insights are clinically relevant and helpful

---

## 5. Condition Screening

### Required Backend Files
- `/server/services/conditionScreening.js` - Service for screening and managing results
- `/server/ml/screeningModel.js` - ML processing for condition screening

### OpenAI Integration
```javascript
// Example implementation for screeningModel.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function screenForConditions(patientData, sessionNotes) {
  // Combine patient data and session notes
  const patientProfile = `
    Patient: ${patientData.name}
    Age: ${patientData.age}
    Gender: ${patientData.gender}
    Current Diagnosis: ${patientData.diagnosis.join(', ')}
    
    Recent Session Notes:
    ${sessionNotes.join('\n\n')}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert clinical diagnostician. Based on the patient information and session notes, 
        evaluate the probability of various mental health conditions. 
        For each condition, provide a probability score (0.0-1.0), a brief explanation of the evidence, 
        and 2-3 recommended clinical actions. Focus on both the current diagnosis and potential comorbidities.`
      },
      {
        role: "user",
        content: patientProfile
      }
    ],
    temperature: 0.2,
    max_tokens: 1000,
  });
  
  // In a production system, you would parse this into a structured format
  const screeningResults = response.choices[0].message.content;
  
  // For this example, we'll return a structured format manually
  // In production, you would parse the OpenAI response
  return [
    {
      condition: "Generalized Anxiety Disorder",
      probability: 0.85,
      description: "Patient exhibits persistent and excessive worry about various domains, with physical symptoms including restlessness, fatigue, and sleep disturbance.",
      recommendedActions: [
        "Continue CBT with focus on cognitive restructuring",
        "Consider adding mindfulness-based stress reduction",
        "Assess for potential benefit from medication consultation"
      ]
    },
    {
      condition: "Major Depressive Disorder",
      probability: 0.38,
      description: "Subclinical depressive symptoms present, including periodic low mood, decreased energy, and negative thinking patterns.",
      recommendedActions: [
        "Continue monitoring depressive symptoms",
        "Incorporate behavioral activation techniques",
        "Assess sleep quality and its impact on mood"
      ]
    }
    // Additional conditions would be included here
  ];
}

module.exports = {
  screenForConditions
};
```

### Testing
1. Create sample patient data and session notes
2. Test the condition screening with the sample data
3. Verify the screening results include probabilities, descriptions, and recommendations
4. Test with various patient profiles to ensure different conditions are detected

---

## ML Model Boilerplate Files

### 1. Vector Embedding Utility
```javascript
// /server/utils/vectorUtils.js
const fs = require('fs');
const path = require('path');

// Load pre-computed paper embeddings
function loadPaperIndex() {
  const indexPath = path.join(__dirname, '../../data/literature/embeddings.json');
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  }
  return [];
}

// Calculate cosine similarity between two vectors
function calculateCosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }
  
  return dotProduct / (norm1 * norm2);
}

// Generate embeddings for a batch of texts
async function generateEmbeddings(texts, openai) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: texts,
  });
  
  return embeddingResponse.data.map(item => item.embedding);
}

module.exports = {
  loadPaperIndex,
  calculateCosineSimilarity,
  generateEmbeddings
};
```

### 2. Paper Indexing Script
```javascript
// /scripts/indexPapers.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { generateEmbeddings } = require('../server/utils/vectorUtils');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function indexPapers() {
  // 1. Load paper metadata
  const metadataPath = path.join(__dirname, '../data/literature/index.json');
  const papers = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  // 2. Prepare texts for embedding
  const textsToEmbed = papers.map(paper => {
    return `Title: ${paper.title}. Authors: ${paper.authors.join(', ')}. Abstract: ${paper.abstract}. Keywords: ${paper.keywords.join(', ')}.`;
  });
  
  // 3. Generate embeddings in batches
  const batchSize = 20;
  let allEmbeddings = [];
  
  for (let i = 0; i < textsToEmbed.length; i += batchSize) {
    const batch = textsToEmbed.slice(i, i + batchSize);
    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(textsToEmbed.length/batchSize)}`);
    
    const embeddings = await generateEmbeddings(batch, openai);
    
    for (let j = 0; j < embeddings.length; j++) {
      allEmbeddings.push({
        metadata: papers[i + j],
        embedding: embeddings[j]
      });
    }
  }
  
  // 4. Save embeddings
  const outputPath = path.join(__dirname, '../data/literature/embeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(allEmbeddings, null, 2));
  
  console.log(`Indexed ${allEmbeddings.length} papers. Embeddings saved to ${outputPath}`);
}

indexPapers().catch(console.error);
```

### 3. Sentiment Analysis Model
```javascript
// /server/ml/sentimentAnalysis.js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeSentiment(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a sentiment analysis model for therapy sessions. 
        Analyze the emotional content of the text and return a JSON object with the following structure:
        {
          "primaryEmotion": "string", // The dominant emotion (anxiety, depression, anger, etc.)
          "intensity": float, // 0.0 to 1.0 indicating intensity
          "secondaryEmotions": ["string"], // Array of secondary emotions
          "valence": float, // -1.0 (very negative) to 1.0 (very positive)
          "arousal": float // 0.0 (calm) to 1.0 (highly aroused)
        }`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.2,
    max_tokens: 150,
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

module.exports = {
  analyzeSentiment
};
```

### 4. Treatment Recommendation Model
```javascript
// /server/ml/treatmentRecommendation.js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateTreatmentRecommendations(patientData, screeningResults) {
  const context = `
    Patient Information:
    - Name: ${patientData.name}
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    - Current Diagnosis: ${patientData.diagnosis.join(', ')}
    
    Screening Results:
    ${screeningResults.map(result => 
      `- ${result.condition} (${(result.probability * 100).toFixed(0)}%): ${result.description}`
    ).join('\n')}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert clinical treatment planner. Based on the patient information and screening results, 
        generate evidence-based treatment recommendations. Include therapeutic approaches, potential interventions, 
        and treatment goals. Format your response as a structured treatment plan.`
      },
      {
        role: "user",
        content: context
      }
    ],
    temperature: 0.3,
    max_tokens: 800,
  });
  
  return {
    recommendations: response.choices[0].message.content,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateTreatmentRecommendations
};
```

## API Endpoints

Here's a list of API endpoints you'll need to implement to connect the frontend to your backend services:

### Patient History
- `GET /api/patients/:patientId/history` - Get patient history
- `POST /api/patients/:patientId/history` - Add new history entry
- `GET /api/patients/:patientId/insights` - Get AI-generated insights

### Therapeutic Rehearsal
- `POST /api/rehearsal/response` - Generate patient response
- `POST /api/rehearsal/nudge` - Generate therapeutic nudge

### Literature Review
- `GET /api/literature/search?query=:query` - Search for relevant papers
- `GET /api/literature/summary?condition=:condition` - Get literature summary for condition

### AI Insights
- `POST /api/insights/session` - Generate insights from session notes
- `POST /api/insights/language` - Analyze language patterns

### Condition Screening
- `POST /api/screening/conditions` - Screen for potential conditions
- `POST /api/treatment/recommendations` - Generate treatment recommendations

## Testing Your Integration

1. Set up a test environment with sample data
2. Create unit tests for each ML function
3. Create integration tests for the API endpoints
4. Test with realistic patient data scenarios
5. Monitor OpenAI API usage and costs during testing

## Security Considerations

1. Store your OpenAI API key in environment variables, never in code
2. Implement proper authentication and authorization for all API endpoints
3. Encrypt sensitive patient data both in transit and at rest
4. Implement rate limiting to prevent abuse
5. Log all API calls for audit purposes
6. Consider HIPAA compliance requirements for patient data

## Next Steps

1. Set up the folder structure for patient data and literature
2. Implement the backend services and ML functions
3. Create API endpoints to connect frontend and backend
4. Test the integration with sample data
5. Refine the ML models based on testing results

---

This README provides a comprehensive guide to implementing the backend functionality for the Clarity platform. The boilerplate files give you a starting point for each ML feature, which you can customize and extend based on your specific requirements.