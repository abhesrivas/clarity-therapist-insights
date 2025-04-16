import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { PatientHistoryEntry } from "../utils/patientData";

interface PatientTimelineProps {
  history: PatientHistoryEntry[];
  onEdit?: (entry: PatientHistoryEntry) => void;
  onDelete?: (id: string) => void;
  onGenerateInsights?: (id: string) => void;
  isGeneratingInsights?: boolean;
}

function PatientTimeline({ 
  history, 
  onEdit, 
  onDelete,
  onGenerateInsights,
  isGeneratingInsights = false
}: PatientTimelineProps) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;
  const primaryBgLight = `bg-${getColor('primary').replace('600', '50')}`;
  const primaryBorder = `border-${getColor('primary')}`;

  const toggleExpand = (id: string) => {
    if (expandedEntry === id) {
      setExpandedEntry(null);
    } else {
      setExpandedEntry(id);
    }
  };

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedHistory.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          No session notes available. Add a new session note to get started.
        </div>
      ) : (
        sortedHistory.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div 
              onClick={() => toggleExpand(entry.id)}
              className={`p-4 cursor-pointer transition-colors ${
                expandedEntry === entry.id ? primaryBgLight : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${primaryBg} mr-3`}></div>
                  <div>
                    <h3 className="font-medium text-gray-800">{new Date(entry.date).toLocaleDateString()}</h3>
                    <p className="text-sm text-gray-500">{entry.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {entry.metrics && (
                    <div className="hidden sm:flex items-center mr-4 space-x-3">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">Anxiety:</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-1">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${entry.metrics.anxiety}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{entry.metrics.anxiety}%</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">Depression:</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-1">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${entry.metrics.depression}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{entry.metrics.depression}%</span>
                      </div>
                    </div>
                  )}
                  
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedEntry === entry.id ? "rotate-180" : ""
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedEntry === entry.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 px-4 py-3"
                >
                  {entry.metrics && (
                    <div className="sm:hidden mb-4 space-y-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1 w-20">Anxiety:</span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mr-1">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${entry.metrics.anxiety}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 ml-2">{entry.metrics.anxiety}%</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1 w-20">Depression:</span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mr-1">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${entry.metrics.depression}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 ml-2">{entry.metrics.depression}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Session Notes</h4>
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    </div>
                    
                    {entry.homework && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Assigned Homework</h4>
                        <p className="text-sm text-gray-600 mt-1">{entry.homework}</p>
                      </div>
                    )}
                    
                    {entry.insights && entry.insights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">AI Insights</h4>
                        <ul className="mt-1 space-y-1">
                          {entry.insights.map((insight, i) => (
                            <li key={i} className="flex items-start">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-4 w-4 ${primaryColor} mr-1 flex-shrink-0 mt-0.5`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-sm text-gray-600">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      {onEdit && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(entry);
                          }} 
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          Edit Notes
                        </button>
                      )}
                      
                      {!entry.insights || entry.insights.length === 0 ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateInsights && onGenerateInsights(entry.id);
                          }}
                          disabled={isGeneratingInsights}
                          className={`text-xs px-2 py-1 ${primaryBgLight} ${primaryColor} rounded hover:bg-opacity-80 transition-colors flex items-center ${isGeneratingInsights ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isGeneratingInsights && (
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
                        </button>
                      ) : null}
                      
                      {onDelete && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(entry.id);
                          }} 
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  );
}

export default PatientTimeline;