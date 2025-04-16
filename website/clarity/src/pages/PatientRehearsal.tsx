import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../utils/themeContext';
import { getPatientById } from '../utils/patientData';
import apiClient from '../utils/apiClient';
import TherapeuticNudge from '../components/TherapeuticNudge';
import TopicPredictions from '../components/TopicPredictions';
import { mlService, TopicPrediction } from '../utils/mlService';

// Icons
import { RefreshCw, Send, Lightbulb, ThumbsUp, ThumbsDown, Target, BarChart2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'therapist' | 'patient' | 'nudge';
  message: string;
  timestamp: string;
}

interface NudgeData {
  id: string;
  nudge: string;
  context: string;
  helpful: boolean | null;
  timestamp: string;
}

// Polyfill for modern File System Access API
// This allows compatibility with browsers that don't support it
const useFileSystem = () => {
  const showSaveFilePicker = async (options: any) => {
    // Check if the browser supports the File System Access API
    if ('showSaveFilePicker' in window) {
      return (window as any).showSaveFilePicker(options);
    } else {
      // Fallback for browsers without File System Access API
      alert("Your browser doesn't support direct file saving. Feedback will be downloaded as a CSV file instead.");
      return null;
    }
  };

  const createDownloadableFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { showSaveFilePicker, createDownloadableFile };
};

function PatientRehearsal() {
  const { id: therapistId, patientId } = useParams<{ id: string; patientId: string }>();
  const patient = getPatientById(patientId || '');
  
  const [approach, setApproach] = useState<'cbt' | 'psychodynamic' | 'mindfulness'>('cbt');
  const [focusArea, setFocusArea] = useState('');
  const [message, setMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const [nudgeHistory, setNudgeHistory] = useState<NudgeData[]>([]);
  const [currentNudgeId, setCurrentNudgeId] = useState<string | null>(null);
  const [savedFilePath, setSavedFilePath] = useState<any>(null);
  const [ratedNudges, setRatedNudges] = useState<Set<string>>(new Set());
  const [sessionFeedback, setSessionFeedback] = useState<any[]>([]);
  const [topicPredictions, setTopicPredictions] = useState<TopicPrediction[]>([]);
  // New state for expandable nudge box
  const [nudgeExpanded, setNudgeExpanded] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { getColor } = useTheme();
  const primaryColor = getColor('primary');
  const primaryBg = `bg-${primaryColor}`;
  const primaryText = `text-${primaryColor}`;
  const secondaryBg = `bg-${getColor('secondary').replace('500', '50')}`;

  const { showSaveFilePicker, createDownloadableFile } = useFileSystem();

  // Validate patient exists
  if (!patient) {
    return <div className="text-center text-red-600">Patient not found</div>;
  }

  // Analyze topics whenever patient message is received
  const analyzeTopics = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    try {
      const predictions = await mlService.getTopicPredictions(text, 5);
      setTopicPredictions(predictions);
      console.log('Topic predictions:', predictions);
    } catch (error) {
      console.error('Error analyzing topics:', error);
    }
  }, []);

  // Request file save location and create initial file
  const requestFileSaveLocation = async () => {
    try {
      // Try to use the File System Access API
      const fileHandle = await showSaveFilePicker({
        suggestedName: `${patient.name.replace(/\s+/g, '_')}_${approach}_feedback.csv`,
        types: [{
          description: 'CSV Files',
          accept: {'text/csv': ['.csv']},
        }],
      });
      
      if (fileHandle) {
        // Define CSV columns for header
        const columns = [
          'id', 'timestamp', 'nudge', 'context', 'helpful', 
          'patientId', 'patientName', 'diagnosis',
          'therapistId', 'approach', 'focusArea'
        ];
        
        // Create initial file with just headers
        const csvContent = columns.join(',') + '\n';
        
        try {
          const writable = await fileHandle.createWritable();
          await writable.write(csvContent);
          await writable.close();
        } catch (error) {
          console.error('Error writing to file:', error);
        }
        
        setSavedFilePath(fileHandle);
        return fileHandle;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating file:', error);
      return null;
    }
  };
  
  // Append feedback to the existing CSV file or update local data for eventual download
  const appendToCSV = async (fileHandle: any, data: any) => {
    // Add to session feedback for browsers without File System Access API
    setSessionFeedback(prev => [...prev, data]);
    
    if (!fileHandle) return;
    
    try {
      // Define CSV columns
      const columns = [
        'id', 'timestamp', 'nudge', 'context', 'helpful', 
        'patientId', 'patientName', 'diagnosis',
        'therapistId', 'approach', 'focusArea'
      ];
      
      // Create CSV row
      const row = columns.map(column => {
        // Get the value and handle special cases
        let value = data[column]?.toString() || '';
        
        // Escape quotes and wrap in quotes if contains commas or quotes
        if (value.includes('"') || value.includes(',') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
      });
      
      const csvRow = row.join(',') + '\n';
      
      try {
        // Open the file in append mode
        const writable = await fileHandle.createWritable({ keepExistingData: true });
        
        // Get file size to append at the end
        const file = await fileHandle.getFile();
        await writable.seek(file.size);
        
        // Write the new row
        await writable.write(csvRow);
        await writable.close();
      } catch (error) {
        console.error('Error writing to file:', error);
        
        // If file writing fails, download the file as a fallback
        if (sessionFeedback.length > 0) {
          downloadFeedbackCSV();
        }
      }
    } catch (error) {
      console.error('Error appending to file:', error);
    }
  };
  
  // Download feedback as CSV (fallback)
  const downloadFeedbackCSV = () => {
    if (sessionFeedback.length === 0) {
      alert('No feedback data available to export.');
      return;
    }
    
    // Define CSV columns
    const columns = [
      'id', 'timestamp', 'nudge', 'context', 'helpful', 
      'patientId', 'patientName', 'diagnosis',
      'therapistId', 'approach', 'focusArea'
    ];
    
    // Create CSV content with headers
    let csvContent = columns.join(',') + '\n';
    
    // Add rows for all session feedback
    sessionFeedback.forEach(item => {
      const row = columns.map(column => {
        // Get the value and handle special cases
        let value = item[column]?.toString() || '';
        
        // Escape quotes and wrap in quotes if contains commas or quotes
        if (value.includes('"') || value.includes(',') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create filename with session info
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${patient.name.replace(/\s+/g, '_')}_${approach}_feedback_${timestamp}.csv`;
    
    // Download the file
    createDownloadableFile(csvContent, filename);
  };
  
  // Save nudge feedback
  const saveNudgeFeedback = async (nudgeId: string, helpful: boolean) => {
    // Mark this nudge as rated
    setRatedNudges(prev => new Set(prev).add(nudgeId));
    
    // Update the nudge history
    setNudgeHistory(prev => 
      prev.map(item => 
        item.id === nudgeId 
          ? { ...item, helpful } 
          : item
      )
    );
    
    // Save to localStorage as backup
    const storageKey = 'clarity_nudge_feedback';
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedNudge = nudgeHistory.find(n => n.id === nudgeId);
    
    if (updatedNudge) {
      // Prepare the data with all context
      const feedbackData = {
        ...updatedNudge,
        helpful,
        patientId,
        patientName: patient.name,
        diagnosis: patient.diagnosis.join('; '),
        therapistId,
        approach,
        focusArea: focusArea || 'None specified'
      };
      
      // Update localStorage
      const updatedData = existingData.filter((item: any) => item.id !== nudgeId);
      updatedData.push(feedbackData);
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      
      // Save to file if we have a file path
      let fileHandle = savedFilePath;
      if (!fileHandle) {
        // If we don't have a file path yet, request one
        fileHandle = await requestFileSaveLocation();
        if (fileHandle) {
          setSavedFilePath(fileHandle);
        }
      }
      
      // Append to CSV file
      await appendToCSV(fileHandle, feedbackData);
    }
  };

  // Scroll to bottom of chat when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // When the component unmounts, download any feedback as CSV if not saved to file
  useEffect(() => {
    return () => {
      if (sessionFeedback.length > 0 && !savedFilePath) {
        downloadFeedbackCSV();
      }
    };
  }, [sessionFeedback, savedFilePath]);

  const generatePatientResponse = useCallback(async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setNudge(null);

    try {
      // Include focus area in the context if specified
      const contextWithFocus = focusArea 
        ? `${message} [Focus on: ${focusArea}]` 
        : message;
      
      // Simulate patient response
      const patientResponse = await apiClient.simulatePatientResponse(
        patient, 
        contextWithFocus, 
        approach
      );

      // Generate therapy nudge
      const therapyNudge = await apiClient.generateTherapyNudge(
        patientResponse, 
        approach,
        focusArea
      );

      // Create a nudge ID
      const nudgeId = `nudge_${Date.now()}`;
      setCurrentNudgeId(nudgeId);

      // Save nudge to history
      const newNudgeData: NudgeData = {
        id: nudgeId,
        nudge: therapyNudge,
        context: patientResponse,
        helpful: null,
        timestamp: new Date().toISOString()
      };
      setNudgeHistory(prev => [...prev, newNudgeData]);

      // Update conversation history
      const newConversation: ChatMessage[] = [
        ...conversationHistory,
        { 
          id: `therapist_${Date.now()}`, 
          sender: 'therapist', 
          message, 
          timestamp: new Date().toISOString() 
        },
        { 
          id: `patient_${Date.now()}`, 
          sender: 'patient', 
          message: patientResponse, 
          timestamp: new Date().toISOString() 
        }
      ];

      setConversationHistory(newConversation);
      setMessage('');
      setNudge(therapyNudge);
      
      // Analyze topics from patient response
      analyzeTopics(patientResponse);
    } catch (error) {
      console.error('Error in patient simulation:', error);
      // Fallback error message
      setConversationHistory(prev => [
        ...prev,
        { 
          id: `error_${Date.now()}`, 
          sender: 'patient', 
          message: "I'm having trouble responding right now.", 
          timestamp: new Date().toISOString() 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [message, patient, approach, focusArea, conversationHistory, analyzeTopics]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    generatePatientResponse();
  };

  const resetConversation = () => {
    setConversationHistory([]);
    setNudge(null);
    setNudgeHistory([]);
    setCurrentNudgeId(null);
    setRatedNudges(new Set());
    setTopicPredictions([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
      {/* Main conversation area - takes 2/3 of the space */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Patient Rehearsal: {patient.name}
          </h2>
          <button 
            onClick={resetConversation}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Conversation
          </button>
        </div>

        {/* Therapy Approach Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Therapy Approach
          </label>
          <div className="flex space-x-2">
            {(['cbt', 'psychodynamic', 'mindfulness'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setApproach(type)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors 
                  ${approach === type 
                    ? `${primaryBg} text-white` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {type === 'cbt' ? 'Cognitive Behavioral' : 
                 type === 'psychodynamic' ? 'Psychodynamic' : 
                 'Mindfulness'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation History */}
        <div 
          ref={chatContainerRef}
          className="mb-6 h-96 overflow-y-auto border border-gray-200 rounded-lg p-4"
        >
          {conversationHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              Start the conversation by sending a message
            </div>
          ) : (
            conversationHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${
                  msg.sender === 'therapist' ? 'justify-end' : 
                  msg.sender === 'nudge' ? 'justify-center' : 'justify-start'
                }`}
              >
                <div 
                  className={`
                    max-w-[70%] p-3 rounded-lg 
                    ${msg.sender === 'therapist' 
                      ? 'bg-blue-100 text-blue-800' : 
                      msg.sender === 'nudge' 
                      ? 'bg-green-50 text-green-800 border border-green-200 italic' : 
                      'bg-gray-100 text-gray-800'}
                  `}
                >
                  {msg.sender === 'nudge' && (
                    <div className="flex items-center mb-1">
                      <Lightbulb className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Therapy Suggestion
                      </span>
                    </div>
                  )}
                  {msg.message}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your therapeutic message..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`px-4 py-2 rounded-md flex items-center ${
              isLoading || !message.trim() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : `${primaryBg} text-white hover:opacity-90`
            }`}
          >
            <Send className="w-5 h-5 mr-2" />
            Send
          </button>
        </form>
      </div>

      {/* Clarity Nudges panel - takes 1/3 of the space */}
      <div className="md:col-span-1 space-y-4">
        {/* Focus Area Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center mb-3">
            <Target className={`w-5 h-5 ${primaryText} mr-2`} />
            <h3 className="text-lg font-semibold text-gray-800">Set Focus Area</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Define a specific focus area for this rehearsal session to guide the AI suggestions.
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g., Work stress, Family relationships, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 italic">
              The focus area will help generate more relevant therapeutic nudges.
            </p>
          </div>
        </div>
        
        {/* Nudges Box */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Lightbulb className={`w-4 h-4 ${primaryText} mr-1`} />
              <h3 className="text-base font-semibold text-gray-800">Clarity Nudges</h3>
            </div>
            {savedFilePath && (
              <span className="text-xs text-green-600">
                ✓ Saving to file
              </span>
            )}
          </div>
          
          {nudge ? (
            <div className={`p-3 ${secondaryBg} rounded-lg mb-2`}>
              <p className={`text-sm text-gray-700 mb-2 ${nudgeExpanded ? '' : 'line-clamp-3'}`}>
                {nudge}
              </p>
              <button 
                onClick={() => setNudgeExpanded(!nudgeExpanded)}
                className="text-xs text-blue-500 mb-2"
              >
                {nudgeExpanded ? 'Show less' : 'Show more'}
              </button>
              
              {!ratedNudges.has(currentNudgeId || '') ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Helpful?</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => currentNudgeId && saveNudgeFeedback(currentNudgeId, true)}
                      className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs hover:bg-green-200"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Yes
                    </button>
                    <button 
                      onClick={() => currentNudgeId && saveNudgeFeedback(currentNudgeId, false)}
                      className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs hover:bg-red-200"
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-green-700">
                  Thank you for your feedback!
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              {conversationHistory.length === 0 
                ? "Start a conversation to receive nudges" 
                : "Waiting for patient response..."}
            </div>
          )}
        </div>

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
              {conversationHistory.length === 0 
                ? "Start a conversation to detect topics" 
                : "Analyzing conversation topics..."}
            </div>
          )}
        </div>

        {/* Previous Nudges */}
        {nudgeHistory.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Previous Nudges</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {nudgeHistory.slice(0, -1).reverse().map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 text-xs">
                  <p className="text-gray-700 mb-1">{item.nudge}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    {item.helpful !== null && (
                      <span className={`text-xs ${
                        item.helpful ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.helpful ? 'Helpful' : 'Not helpful'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientRehearsal;
