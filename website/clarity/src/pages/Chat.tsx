import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { getPatientById } from "../utils/patientData";
import { patientService } from "../utils/patientService";
import { openaiService } from "../utils/openaiService";

function Chat() {
  const { patientId, id: therapistId } = useParams<{ patientId: string; id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;

  useEffect(() => {
    // Fetch patient data
    async function loadPatientData() {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const patientData = getPatientById(patientId);
        
        if (patientData) {
          setPatient(patientData);
          
          // Fetch patient history from our service
          const history = await patientService.getPatientHistory(patientId);
          
          // If we have local storage data, use it; otherwise use the mock data
          if (history && history.length > 0) {
            setPatientHistory(history);
          } else {
            setPatientHistory(patientData.history);
          }
          
          // Initialize chat with context
          setChatHistory([
            { 
              id: Date.now(),
              sender: "system", 
              message: `Chat started about patient ${patientData.name}`, 
              timestamp: new Date().toISOString() 
            },
            { 
              id: Date.now() + 1,
              sender: "assistant", 
              message: `I have loaded ${patientData.name}'s history. Their last session was on ${new Date(patientData.lastSession).toLocaleDateString()}. How can I help you analyze this patient's case?`, 
              timestamp: new Date().toISOString() 
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPatientData();
  }, [patientId]);

  useEffect(() => {
    // Scroll to bottom when chat history updates
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const analyzePatientQuery = async (userMessage: string) => {
    if (!patient) return "I don't have information about this patient.";
    
    // Format recent patient history for context
    const recentHistory = patientHistory.slice(0, 3).map(entry => 
      `Date: ${new Date(entry.date).toLocaleDateString()}, Type: ${entry.type}, Notes: ${entry.notes.substring(0, 200)}...`
    ).join('\n\n');
    
    try {
      // Prepare chat history for context
      const conversationContext = chatHistory
        .filter(msg => msg.sender !== "system")
        .slice(-6)
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.message
        }));
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant for therapists. You help analyze patient cases based on their history and the therapist's questions.
              
Patient Information:
Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender}
Diagnosis: ${patient.diagnosis.join(", ")}
Current metrics: Anxiety (${patient.metrics.anxiety}%), Depression (${patient.metrics.depression}%)

Recent History:
${recentHistory}

Your task is to provide thoughtful, clinically relevant responses to the therapist's questions about this patient. Base your analysis on the patient's history, diagnosis, and session notes. Be concise but informative.`
            },
            ...conversationContext,
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error analyzing patient query:", error);
      return "I'm having trouble analyzing this patient right now. Please try again.";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;
    
    // Add user message to chat history
    const userMessage = {
      id: Date.now(),
      sender: "user",
      message,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    setIsGenerating(true);
    
    try {
      console.log("API Key available:", !!import.meta.env.VITE_OPENAI_API_KEY);
      console.log("Starting OpenAI request...");
      
      // Get AI response
      const aiResponse = await analyzePatientQuery(message);
      
      console.log("Response received:", aiResponse);
      
      // Add AI response to chat history
      const assistantMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        message: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Detailed error:", error);
      console.error("Error stack:", error.stack);
      
      // Add error response
      const errorMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        message: `Error: ${error.message || "Unknown error occurred"}`,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-${getColor('primary')}`}></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <h1 className={`text-3xl font-bold ${primaryColor} mb-6`}>Chat about Patient</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Patient not found. Please select a patient from the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-200px)] flex flex-col"
    >
      <div className="bg-white rounded-t-lg shadow-md p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Chat about {patient.name}
        </h2>
        <p className="text-sm text-gray-500">
          Ask questions about patient history, treatment options, or analysis
        </p>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-grow bg-white overflow-y-auto p-4"
      >
        {chatHistory.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-4 ${
              chat.sender === "user" 
                ? "ml-auto max-w-3/4" 
                : chat.sender === "system" 
                  ? "mx-auto text-center" 
                  : "mr-auto max-w-3/4"
            }`}
          >
            {chat.sender === "system" ? (
              <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                {chat.message}
              </div>
            ) : (
              <div className={`p-3 rounded-lg ${
                chat.sender === "user" 
                  ? `${primaryBg} text-white` 
                  : "bg-gray-100 text-gray-800"
              }`}>
                <p>{chat.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(chat.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </motion.div>
        ))}
        
        {isGenerating && (
          <div className="mr-auto max-w-3/4 mb-4">
            <div className="p-3 rounded-lg bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "600ms" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-b-lg shadow-md p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about this patient's history, treatment options, or analysis..."
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !message.trim()}
            className={`${primaryBg} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? "Analyzing..." : "Send"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default Chat;