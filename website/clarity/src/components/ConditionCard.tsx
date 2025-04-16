import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { ConditionScreening } from "../utils/patientData";

interface ConditionCardProps {
  condition: ConditionScreening;
}

function ConditionCard({ condition }: ConditionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;
  
  // Determine color based on probability
  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return "bg-red-500";
    if (probability >= 0.4) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const probabilityColor = getProbabilityColor(condition.probability);
  const probabilityPercentage = `${Math.round(condition.probability * 100)}%`;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{condition.condition}</h3>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${probabilityColor} mr-2`}></div>
            <span className="text-sm font-medium">{probabilityPercentage}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${probabilityColor} h-2 rounded-full`} 
              style={{ width: probabilityPercentage }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {condition.description}
        </p>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-sm ${primaryColor} hover:underline flex items-center`}
        >
          {expanded ? "Hide recommendations" : "View recommendations"}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <h4 className="text-sm font-medium text-gray-800 mb-2">Recommended Actions:</h4>
              <ul className="space-y-2">
                {condition.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ${primaryColor} mr-2 flex-shrink-0 mt-0.5`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{action}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 flex space-x-2">
                <button className={`${primaryBg} text-white text-sm px-3 py-1 rounded-md hover:opacity-90 transition-opacity`}>
                  Add to Treatment Plan
                </button>
                <button className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-200 transition-colors">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ConditionCard;