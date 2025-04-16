import { Patient, PatientHistoryEntry } from './patientData';
import { openaiService } from './openaiService';

/**
 * API Client for handling all backend communication
 */
class ApiClient {
  private baseUrl: string;
  private useLocalStorage: boolean;
  
  constructor(baseUrl: string, useLocalStorage: boolean = true) {
    this.baseUrl = baseUrl;
    this.useLocalStorage = useLocalStorage;
  }
  
  /**
   * Make a request to the backend API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // If using localStorage, simulate API requests
    if (this.useLocalStorage) {
      return this.simulateApiRequest<T>(endpoint, options);
    }
    
    // Otherwise, make a real API request
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Simulate API requests using localStorage (for development)
   */
  private async simulateApiRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    console.log(`Simulating API request: ${endpoint}`, options);
    
    // Extract patient ID from endpoint
    const patientIdMatch = endpoint.match(/\/patients\/([^\/]+)/);
    const patientId = patientIdMatch ? patientIdMatch[1] : null;
    
    // Simulate different API endpoints
    if (endpoint.endsWith('/history') && options.method === 'GET') {
      // Get patient history
      return this.getLocalPatientHistory(patientId!) as unknown as T;
    } else if (endpoint.endsWith('/history') && options.method === 'POST') {
      // Save patient history
      const entry = JSON.parse(options.body as string);
      return this.saveLocalPatientHistory(patientId!, entry) as unknown as T;
    } else if (endpoint.includes('/history/') && options.method === 'PUT') {
      // Update patient history
      const entry = JSON.parse(options.body as string);
      return this.updateLocalPatientHistory(patientId!, entry) as unknown as T;
    } else if (endpoint.includes('/history/') && options.method === 'DELETE') {
      // Delete patient history
      const entryId = endpoint.split('/').pop()!;
      return this.deleteLocalPatientHistory(patientId!, entryId) as unknown as T;
    }
    
    // If no matching endpoint, throw error
    throw new Error(`Unhandled endpoint in simulation: ${endpoint}`);
  }
  
  /**
   * Get patient history from localStorage
   */
  private getLocalPatientHistory(patientId: string): PatientHistoryEntry[] {
    const storageKey = `clarity_patient_${patientId}_history`;
    const storedData = localStorage.getItem(storageKey);
    return storedData ? JSON.parse(storedData) : [];
  }
  
  /**
   * Save patient history to localStorage
   */
  private saveLocalPatientHistory(patientId: string, entry: PatientHistoryEntry): PatientHistoryEntry {
    const storageKey = `clarity_patient_${patientId}_history`;
    const existingData = this.getLocalPatientHistory(patientId);
    
    // Ensure entry has an ID
    if (!entry.id) {
      entry.id = `h${Date.now()}`;
    }
    
    // Add new entry to history
    const updatedData = [entry, ...existingData];
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    return entry;
  }
  
  /**
   * Update patient history in localStorage
   */
  private updateLocalPatientHistory(patientId: string, entry: PatientHistoryEntry): PatientHistoryEntry {
    const storageKey = `clarity_patient_${patientId}_history`;
    const existingData = this.getLocalPatientHistory(patientId);
    
    // Update existing entry
    const updatedData = existingData.map(item => 
      item.id === entry.id ? entry : item
    );
    
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    return entry;
  }
  
  /**
   * Delete patient history from localStorage
   */
  private deleteLocalPatientHistory(patientId: string, entryId: string): boolean {
    const storageKey = `clarity_patient_${patientId}_history`;
    const existingData = this.getLocalPatientHistory(patientId);
    
    // Filter out entry to delete
    const updatedData = existingData.filter(item => item.id !== entryId);
    
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    return true;
  }
  
  // Patient History Methods
  async getPatientHistory(patientId: string): Promise<PatientHistoryEntry[]> {
    if (this.useLocalStorage) {
      return this.getLocalPatientHistory(patientId);
    }
    return this.request<PatientHistoryEntry[]>(`/patients/${patientId}/history`);
  }
  
  async savePatientHistory(patientId: string, entry: PatientHistoryEntry): Promise<PatientHistoryEntry> {
    if (this.useLocalStorage) {
      return this.saveLocalPatientHistory(patientId, entry);
    }
    return this.request<PatientHistoryEntry>(`/patients/${patientId}/history`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }
  
  async updatePatientHistory(patientId: string, entry: PatientHistoryEntry): Promise<PatientHistoryEntry> {
    if (this.useLocalStorage) {
      return this.updateLocalPatientHistory(patientId, entry);
    }
    return this.request<PatientHistoryEntry>(`/patients/${patientId}/history/${entry.id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }
  
  async deletePatientHistory(patientId: string, entryId: string): Promise<boolean> {
    if (this.useLocalStorage) {
      return this.deleteLocalPatientHistory(patientId, entryId);
    }
    await this.request(`/patients/${patientId}/history/${entryId}`, {
      method: 'DELETE',
    });
    return true;
  }
  
  // OpenAI Methods
  async generateSessionInsights(patient: Patient, sessionNotes: string): Promise<string[]> {
    try {
      console.log('Generating insights with OpenAI:', { patient: patient.name, notes: sessionNotes.substring(0, 50) + '...' });
      const insights = await openaiService.generateSessionInsights(patient, sessionNotes);
      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return ['Error generating insights. Please try again later.'];
    }
  }
  
  async simulatePatientResponse(patient: Patient, therapistMessage: string, approach: string): Promise<string> {
    try {
      return await openaiService.simulatePatientResponse(patient, therapistMessage, approach);
    } catch (error) {
      console.error('Error in patient simulation:', error);
      return "I'm having trouble responding right now.";
    }
  }
  
  async generateTherapyNudge(patientMessage: string, approach: string, focusPoints?: string): Promise<string> {
    try {
      return await openaiService.generateTherapyNudge(patientMessage, approach, focusPoints);
    } catch (error) {
      console.error('Error generating therapy nudge:', error);
      return "Consider exploring underlying emotions and validating the patient's experience.";
    }
  }
}

// Create and export the API client instance
const apiClient = new ApiClient(
  import.meta.env.VITE_API_BASE_URL || '',
  import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' || import.meta.env.DEV
);

export default apiClient;