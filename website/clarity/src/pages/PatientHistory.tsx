import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPatientById } from '../utils/patientData';
import PatientStats from '../components/PatientStats';
import PatientTimeline from '../components/PatientTimeline';
import PatientInsights from '../components/PatientInsights';
import SessionNoteModal from '../components/SessionNoteModal';
import TopicPredictions from '../components/TopicPredictions';
import { PatientHistoryEntry } from '../utils/patientData';
import { mlService, TopicPrediction } from '../utils/mlService';
import apiClient from '../utils/apiClient';
import { useTheme } from '../utils/themeContext';

// Icons
import { BarChart2 } from 'lucide-react';

function PatientHistory() {
  const { patientId } = useParams<{ patientId: string }>();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editNote, setEditNote] = useState<PatientHistoryEntry | undefined>();
  const [showInsights, setShowInsights] = useState(false);
  const [topicPredictions, setTopicPredictions] = useState<TopicPrediction[]>([]);
  const [patientHistory, setPatientHistory] = useState<PatientHistoryEntry[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  const { getColor } = useTheme();
  const patient = patientId ? getPatientById(patientId) : null;
  const primaryColor = getColor('primary');
  const primaryBg = `bg-${primaryColor}`;
  const primaryText = `text-${primaryColor}`;

  // Load patient history when component mounts
  useEffect(() => {
    if (patient) {
      // First set from local data (faster initial render)
      setPatientHistory(patient.history);
      
      // Try to load history from localStorage or API
      const loadHistoryFromStorage = async () => {
        try {
          // In a real app, this would call an API
          const storageKey = `clarity_patient_${patientId}_history`;
          const storedHistory = localStorage.getItem(storageKey);
          
          if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory) as PatientHistoryEntry[];
            if (parsedHistory.length > 0) {
              // Sort by date, newest first
              parsedHistory.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              setPatientHistory(parsedHistory);
            }
          }
        } catch (error) {
          console.error('Error loading patient history:', error);
        }
      };
      
      loadHistoryFromStorage();
      
      // Initial topic analysis from recent sessions
      if (patient.history.length > 0) {
        // Combine recent session notes to analyze overall topics
        const recentNotes = patient.history
          .slice(0, 3)
          .map(entry => entry.notes)
          .join(' ');
        
        analyzeTopics(recentNotes);
      }
    }
  }, [patient, patientId]);

  // Analyze topics from text content
  const analyzeTopics = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const predictions = await mlService.getTopicPredictions(text, 5);
      setTopicPredictions(predictions);
      console.log('Topic predictions:', predictions);
    } catch (error) {
      console.error('Error analyzing topics:', error);
    }
  };

  const handleAddNote = () => {
    setEditNote(undefined);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: PatientHistoryEntry) => {
    setEditNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!patient) return;
    
    // Filter out the note to delete
    const updatedHistory = patientHistory.filter(note => note.id !== noteId);
    
    // Update state
    setPatientHistory(updatedHistory);
    
    // Save to localStorage
    const storageKey = `clarity_patient_${patientId}_history`;
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    
    // In a real app, you would call an API to delete the note
    console.log(`Deleted note with ID: ${noteId}`);
  };

  const handleSaveNote = (noteData: {
    id?: string;
    date: string;
    type: string;
    notes: string;
    homework?: string;
  }) => {
    if (!patient) return;
    
    let updatedHistory: PatientHistoryEntry[];
    
    // Create a full note object
    const fullNote: PatientHistoryEntry = {
      id: noteData.id || `h${Date.now()}`,
      date: noteData.date,
      type: noteData.type,
      notes: noteData.notes,
      homework: noteData.homework,
      metrics: {
        anxiety: patient.metrics.anxiety,
        depression: patient.metrics.depression
      }
    };
    
    // If editing an existing note, update it; otherwise add a new one
    if (noteData.id) {
      updatedHistory = patientHistory.map(note => 
        note.id === noteData.id ? fullNote : note
      );
    } else {
      updatedHistory = [fullNote, ...patientHistory];
    }
    
    // Update state
    setPatientHistory(updatedHistory);
    
    // Save to localStorage
    const storageKey = `clarity_patient_${patientId}_history`;
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    
    // Analyze topics from the new note
    analyzeTopics(noteData.notes);
    
    console.log('Saved note:', fullNote);
  };

  const handleGenerateInsights = async (noteId: string) => {
    if (!patient) return;
    
    // Find the note by ID
    const note = patientHistory.find(n => n.id === noteId);
    if (!note) return;
    
    setIsGeneratingInsights(true);
    
    try {
      // Generate insights using the API client
      const insights = await apiClient.generateSessionInsights(patient, note.notes);
      
      // Update the note with insights
      const updatedHistory = patientHistory.map(item => 
        item.id === noteId 
          ? { ...item, insights } 
          : item
      );
      
      // Update state
      setPatientHistory(updatedHistory);
      
      // Save to localStorage
      const storageKey = `clarity_patient_${patientId}_history`;
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
      
      console.log('Generated insights:', insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div>
      {patient ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{patient.name}</h1>
              <p className="text-gray-600">
                Age: {patient.age} | Gender: {patient.gender} | Diagnosis: {patient.diagnosis.join(', ')}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                {showInsights ? 'Hide Insights' : 'Show Insights'}
              </button>
              
              <button
                onClick={handleAddNote}
                className={`px-4 py-2 ${primaryBg} text-white rounded-md hover:opacity-90 transition-opacity`}
              >
                Add Session Note
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {showInsights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <PatientInsights patientId={patient.id} patientName={patient.name} />
                </motion.div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Session History</h2>
              <PatientTimeline 
                history={patientHistory} 
                onEdit={handleEditNote} 
                onDelete={handleDeleteNote}
                onGenerateInsights={handleGenerateInsights}
                isGeneratingInsights={isGeneratingInsights}
              />
            </div>
            
            <div className="space-y-6">
              <PatientStats patient={patient} />
              
              {/* Topic Detection */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-3">
                  <BarChart2 className={`w-5 h-5 ${primaryText} mr-2`} />
                  <h3 className="text-lg font-semibold text-gray-800">Topic Detection</h3>
                </div>
                
                {topicPredictions.length > 0 ? (
                  <TopicPredictions 
                    predictions={topicPredictions}
                    title="Detected Topics"
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No topics detected yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <SessionNoteModal
            isOpen={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
            patientId={patient.id}
            editNote={editNote}
            onSave={handleSaveNote}
          />
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Patient not found. Please select a valid patient.
        </div>
      )}
    </div>
  );
}

export default PatientHistory;