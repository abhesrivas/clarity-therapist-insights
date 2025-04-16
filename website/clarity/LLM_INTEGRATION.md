# Clarity Platform - LLM Backend Integration

This guide explains how the Clarity platform integrates with OpenAI's API to provide AI-powered features for therapists.

## Features Implemented

1. **Session Notes Management**
   - Create, edit, and delete session notes
   - Notes are stored in localStorage (development) or can be connected to a backend API

2. **AI-Powered Insights**
   - Generate insights from session notes
   - Analyze patient history for patterns and trends

3. **Simulated Patient Conversations**
   - Practice therapeutic approaches with AI-simulated patient responses
   - Receive real-time suggestions (nudges) during rehearsal sessions

4. **Patient Analysis Chat**
   - Ask questions about patient history and treatment options
   - Get AI-generated analysis based on patient data

## Setup Instructions

### 1. API Keys and Configuration

Create a `.env.local` file in the project root with the following variables:

```
# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_LOCAL_STORAGE=true

# Feature Flags
VITE_ENABLE_LLM_INSIGHTS=true
```

### 2. Installing Dependencies

Make sure you have all required dependencies:

```bash
npm install
# or
yarn
```

### 3. Folder Structure for Patient Data

For a production setup with a real backend, we recommend organizing your data as follows:

```
/data
  /patients
    /{patient_id}
      /history
        /{session_date}_{session_type}.json
      profile.json
      insights.json
  /literature
    index.json
    embeddings.json
```

### 4. Development Mode

During development, the app uses localStorage to persist patient data. This allows you to develop and test without setting up a backend.

### 5. Production Setup

For production, you can:
1. Implement the backend API endpoints described in the README.md
2. Set `VITE_USE_LOCAL_STORAGE=false` in your environment variables
3. Set `VITE_API_BASE_URL` to your backend API URL

## API Client Usage

We've implemented an `apiClient` that handles all communication with both your backend and the OpenAI API. Here's how to use it:

```typescript
import apiClient from './utils/apiClient';

// Get patient history
const history = await apiClient.getPatientHistory('p1');

// Save a new session note
const newNote = await apiClient.savePatientHistory('p1', {
  id: `h${Date.now()}`,
  date: new Date().toISOString(),
  type: 'Session',
  notes: 'Patient reported feeling less anxious this week...',
  homework: 'Continue mindfulness practice daily'
});

// Generate insights from session notes
const insights = await apiClient.generateSessionInsights(patient, sessionNotes);

// Simulate patient response in rehearsal
const response = await apiClient.simulatePatientResponse(
  patient,
  "How have you been feeling since our last session?",
  "cbt"
);
```

## OpenAI API Integration

### Models Used

- GPT-4 (default): Used for most clinical analysis and patient simulation
- You can modify the model in the apiClient.ts file

### Prompt Engineering

We've carefully crafted system prompts for different clinical scenarios:

1. **Session Insights**: Structured prompts that include patient information and history context
2. **Patient Simulation**: Adapts to different therapeutic approaches (CBT, Psychodynamic, Mindfulness)
3. **Therapy Nudges**: Provides real-time guidance aligned with the selected therapeutic approach
4. **Patient Analysis**: Comprehensive system prompt with patient history and metrics

### Fallback Mechanisms

All OpenAI API calls include error handling and fallback responses in case the API is unavailable.

## Future Enhancements

1. **Vector Database for Literature**: Implement embeddings for research papers
2. **Fine-tuned Models**: Train models on therapy-specific datasets
3. **Streaming Responses**: Implement streaming for more responsive UI
4. **Enhanced Security**: Add encryption for patient data
5. **Multi-modal Support**: Add support for audio/visual analysis

## Security Considerations

1. Store your OpenAI API key securely in environment variables
2. Implement proper authentication and authorization for all API endpoints
3. Encrypt sensitive patient data both in transit and at rest
4. Implement rate limiting to prevent abuse
5. Follow HIPAA compliance requirements for patient data