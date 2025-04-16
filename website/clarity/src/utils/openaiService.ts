import { Patient, PatientHistoryEntry } from './patientData';

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private apiEndpoint: string = 'https://api.openai.com/v1/chat/completions';
  private model: string = 'gpt-4o-mini';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateSessionInsights(patientData: Patient, sessionNotes: string): Promise<string[]> {
    try {
      // Prepare recent history context (last 3 sessions)
      const recentSessionsContext = patientData.history
        .slice(0, 3)
        .map(session => 
          `Date: ${new Date(session.date).toLocaleDateString()}\nType: ${session.type}\nNotes: ${session.notes}\n${session.homework ? `Homework: ${session.homework}\n` : ''}`
        )
        .join('\n---\n');
      
      console.log('Generating insights for:', { patientData: patientData.name, sessionNotes: sessionNotes.substring(0, 50) + '...' });
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are an expert clinical psychologist assistant. Generate 3-5 key insights from the latest therapy session notes, considering the patient's history and diagnosis."
            },
            {
              role: "user",
              content: `Patient Information:
Name: ${patientData.name}
Age: ${patientData.age}
Gender: ${patientData.gender}
Diagnosis: ${patientData.diagnosis.join(", ")}

Previous sessions:
${recentSessionsContext}

Latest session notes:
${sessionNotes}

Generate 3-5 key clinical insights from this session. Format each insight as a separate bullet point, focusing on patterns, progress, concerns, and treatment recommendations.`
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json() as OpenAIResponse;
      console.log('OpenAI response:', data);
      
      // Parse the response into insights
      const insightsText = data.choices[0].message.content;
      
      // Transform the text into an array of insights
      // This handles various formats: bullet points, numbered lists, etc.
      const insights = insightsText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 10); // Filter out headers or very short lines
      
      // If we didn't get clear insight items, try a different parsing approach
      if (insights.length < 1) {
        // Just split by periods, assuming each sentence is an insight
        return insightsText
          .split('.')
          .map(s => s.trim())
          .filter(s => s.length > 10)
          .slice(0, 5); // Take max 5 insights
      }
      
      return insights.slice(0, 5); // Limit to 5 insights
    } catch (error) {
      console.error("Error generating insights with OpenAI:", error);
      return ["Error generating insights. Please try again later."];
    }
  }
  
  async analyzePatientHistory(patientData: Patient): Promise<{ insights: string[], recommendations: string[] }> {
    try {
      // Format the entire patient history
      const patientHistory = patientData.history
        .slice(0, 5) // Only include the 5 most recent sessions to avoid token limits
        .map(session => 
          `Date: ${new Date(session.date).toLocaleDateString()}\nType: ${session.type}\nNotes: ${session.notes}\n${session.homework ? `Homework: ${session.homework}\n` : ''}`
        )
        .join('\n---\n');
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are an expert clinical psychologist assistant. Analyze the following patient history and identify patterns, progress, insights, and treatment recommendations."
            },
            {
              role: "user",
              content: `Patient Information:
Name: ${patientData.name}
Age: ${patientData.age}
Gender: ${patientData.gender}
Diagnosis: ${patientData.diagnosis.join(", ")}

Patient History:
${patientHistory}

Please provide:
1. 3-5 key clinical insights based on the patient's history (patterns, progress, concerns)
2. 3-4 treatment recommendations for future sessions

Format your response with two sections: "INSIGHTS:" followed by bullet points, and "RECOMMENDATIONS:" followed by bullet points.`
            }
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json() as OpenAIResponse;
      const analysisText = data.choices[0].message.content;
      
      // Parse the response into insights and recommendations
      const sections = analysisText.split(/RECOMMENDATIONS:|\n\nRECOMMENDATIONS:/i);
      
      let insights: string[] = [];
      let recommendations: string[] = [];
      
      if (sections.length >= 1) {
        const insightsSection = sections[0].replace(/INSIGHTS:|\n\nINSIGHTS:/i, '').trim();
        insights = insightsSection
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 10);
      }
      
      if (sections.length >= 2) {
        const recommendationsSection = sections[1].trim();
        recommendations = recommendationsSection
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter(line => line.length > 10);
      }
      
      return { insights, recommendations };
    } catch (error) {
      console.error("Error analyzing patient history with OpenAI:", error);
      return { 
        insights: ["Error analyzing patient history. Please try again later."],
        recommendations: []
      };
    }
  }
  
  async simulatePatientResponse(patientData: Patient, therapistMessage: string, approach: string): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },

        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are simulating a patient named ${patientData.name} with the following conditions: ${patientData.diagnosis.join(', ')}. 
The patient has these characteristics: ${patientData.age} years old, ${patientData.gender}.
Respond as this patient would, showing appropriate symptoms and thought patterns.
${approach === 'cbt' 
  ? 'The therapist is using Cognitive Behavioral Therapy. Show thought patterns that could benefit from cognitive restructuring.'
  : approach === 'psychodynamic'
  ? 'The therapist is using Psychodynamic Therapy. Include references to past experiences and relationships that might be influencing current feelings.'
  : 'The therapist is using Mindfulness-Based Therapy. Show difficulty staying present and tendency to worry about past or future.'
}`
            },
            {
              role: "user",
              content: therapistMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json() as OpenAIResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error simulating patient response with OpenAI:", error);
      return "I'm not feeling well today. Can we talk about this later?";
    }
  }
  
  async generateTherapyNudge(patientMessage: string, approach: string, focusPoints?: string): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are an expert clinical supervisor providing real-time guidance to a therapist. 
Based on the patient's message, suggest a helpful therapeutic intervention or question.
Keep suggestions concise, practical, and aligned with ${approach} therapy.
${focusPoints ? `Focus areas for this session: ${focusPoints}` : ''}`
            },
            {
              role: "user",
              content: `Patient said: "${patientMessage}". What would be a good therapeutic response or question?`
            }
          ],
          temperature: 0.4,
          max_tokens: 150,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json() as OpenAIResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating therapy nudge with OpenAI:", error);
      return "Consider exploring underlying emotions and validating the patient's experience.";
    }
  }
}

// Create and export the OpenAI service instance
export const openaiService = new OpenAIService(
  import.meta.env.VITE_OPENAI_API_KEY || ''
);