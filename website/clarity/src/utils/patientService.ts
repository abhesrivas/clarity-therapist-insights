import { Patient, PatientHistoryEntry } from './patientData';

// Interface for patient data storage
interface PatientDataStorage {
  savePatientHistory: (patientId: string, historyEntry: PatientHistoryEntry) => Promise<PatientHistoryEntry>;
  updatePatientHistory: (patientId: string, historyEntry: PatientHistoryEntry) => Promise<PatientHistoryEntry>;
  deletePatientHistory: (patientId: string, historyId: string) => Promise<boolean>;
  getPatientHistory: (patientId: string) => Promise<PatientHistoryEntry[]>;
  generateInsights: (patientId: string, sessionNotes: string) => Promise<string[]>;
}

// Local storage implementation (for development without backend)
class LocalStoragePatientData implements PatientDataStorage {
  private getStorageKey(patientId: string): string {
    return `clarity_patient_${patientId}_history`;
  }

  async savePatientHistory(patientId: string, historyEntry: PatientHistoryEntry): Promise<PatientHistoryEntry> {
    const storageKey = this.getStorageKey(patientId);
    const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]') as PatientHistoryEntry[];
    
    // Generate a new ID if not provided
    if (!historyEntry.id) {
      historyEntry.id = `h${Date.now()}`;
    }
    
    // Add the new entry
    const updatedHistory = [historyEntry, ...existingHistory];
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    
    return historyEntry;
  }

  async updatePatientHistory(patientId: string, historyEntry: PatientHistoryEntry): Promise<PatientHistoryEntry> {
    const storageKey = this.getStorageKey(patientId);
    const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]') as PatientHistoryEntry[];
    
    // Find and update the entry
    const updatedHistory = existingHistory.map(entry => 
      entry.id === historyEntry.id ? historyEntry : entry
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    
    return historyEntry;
  }

  async deletePatientHistory(patientId: string, historyId: string): Promise<boolean> {
    const storageKey = this.getStorageKey(patientId);
    const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]') as PatientHistoryEntry[];
    
    // Filter out the entry to delete
    const updatedHistory = existingHistory.filter(entry => entry.id !== historyId);
    
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    
    return true;
  }

  async getPatientHistory(patientId: string): Promise<PatientHistoryEntry[]> {
    const storageKey = this.getStorageKey(patientId);
    return JSON.parse(localStorage.getItem(storageKey) || '[]') as PatientHistoryEntry[];
  }

  async generateInsights(patientId: string, sessionNotes: string): Promise<string[]> {
    // This is a placeholder. In a real implementation, this would call the LLM API
    // For now, return some mock insights
    return [
      "Patient shows signs of anxiety related to work environment",
      "Sleep disturbances appear to be correlated with increased stress levels",
      "Consider exploring relaxation techniques focused on work-related triggers"
    ];
  }
}

// Server implementation (for production with backend)
class ServerPatientData implements PatientDataStorage {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    // In a real app, you would add authentication headers here
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async savePatientHistory(patientId: string, historyEntry: PatientHistoryEntry): Promise<PatientHistoryEntry> {
    return this.fetchWithAuth(`/patients/${patientId}/history`, {
      method: 'POST',
      body: JSON.stringify(historyEntry),
    });
  }

  async updatePatientHistory(patientId: string, historyEntry: PatientHistoryEntry): Promise<PatientHistoryEntry> {
    return this.fetchWithAuth(`/patients/${patientId}/history/${historyEntry.id}`, {
      method: 'PUT',
      body: JSON.stringify(historyEntry),
    });
  }

  async deletePatientHistory(patientId: string, historyId: string): Promise<boolean> {
    await this.fetchWithAuth(`/patients/${patientId}/history/${historyId}`, {
      method: 'DELETE',
    });
    return true;
  }

  async getPatientHistory(patientId: string): Promise<PatientHistoryEntry[]> {
    return this.fetchWithAuth(`/patients/${patientId}/history`);
  }

  async generateInsights(patientId: string, sessionNotes: string): Promise<string[]> {
    const response = await this.fetchWithAuth(`/ai/insights`, {
      method: 'POST',
      body: JSON.stringify({ patientId, sessionNotes }),
    });
    
    return response.insights;
  }
}

// LLM service for generating insights
class LLMService {
  private apiKey: string;
  private apiEndpoint: string;
  
  constructor(apiKey: string, apiEndpoint: string = 'https://api.openai.com/v1/chat/completions') {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
  }
  
  async generateInsights(patientData: Patient, sessionNotes: string): Promise<string[]> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // or whichever model you prefer
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

Latest session notes:
${sessionNotes}

Generate 3-5 key clinical insights from this session.`
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
      }
      
      // Parse the response into insights
      const insightsText = data.choices[0].message.content;
      const insights = insightsText
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
      
      return insights;
    } catch (error) {
      console.error("Error generating insights:", error);
      return ["Error generating insights. Please try again later."];
    }
  }
}

// Factory function to create the appropriate implementation
export function createPatientDataService(config: { useLocalStorage?: boolean, apiBaseUrl?: string } = {}): PatientDataStorage {
  if (config.useLocalStorage || !config.apiBaseUrl) {
    return new LocalStoragePatientData();
  } else {
    return new ServerPatientData(config.apiBaseUrl);
  }
}

// Export LLM service
export const llmService = new LLMService(
  import.meta.env.VITE_OPENAI_API_KEY || ''
);

// Create and export the default instance
export const patientService = createPatientDataService({
  useLocalStorage: import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});