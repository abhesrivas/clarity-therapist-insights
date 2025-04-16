import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";

interface PatientInsightsProps {
  patientId: string;
  patientName: string;
}

function PatientInsights({ patientId, patientName }: PatientInsightsProps) {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;

  // In a real app, these insights would be fetched from an API
  const insights = {
    sentimentTrend: [
      { date: "Jan", value: 42 },
      { date: "Feb", value: 38 },
      { date: "Mar", value: 45 },
      { date: "Apr", value: 53 },
      { date: "May", value: 58 },
      { date: "Jun", value: 62 },
    ],
    topicAnalysis: [
      { topic: "Work stress", percentage: 32 },
      { topic: "Family relationships", percentage: 24 },
      { topic: "Sleep issues", percentage: 18 },
      { topic: "Social anxiety", percentage: 14 },
      { topic: "Health concerns", percentage: 12 },
    ],
    keyInsights: [
      "Patient shows significant improvement when discussing work-related stressors directly",
      "Consistent correlation between sleep quality and anxiety levels",
      "Cognitive restructuring techniques have shown the most consistent positive impact",
      "Family dynamics appear to be a growing source of stress in recent sessions"
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI-Generated Insights</h2>
        <p className="text-gray-600 mb-6">
          Our AI has analyzed {patientName}'s session history to identify patterns, trends, and potential focus areas for treatment.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-3">Emotional Sentiment Trend</h3>
            <div className="h-48 flex items-end space-x-2">
              {insights.sentimentTrend.map((month, index) => (
                <div key={month.date} className="flex flex-col items-center flex-grow">
                  <div 
                    className={`${primaryBg} w-full rounded-t-sm`} 
                    style={{ height: `${month.value}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">{month.date}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Overall positive sentiment has increased by 20% over the last 6 months, indicating treatment progress.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-3">Topic Analysis</h3>
            <div className="space-y-3">
              {insights.topicAnalysis.map((topic) => (
                <div key={topic.topic}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{topic.topic}</span>
                    <span className="text-gray-500">{topic.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${primaryBg} h-2 rounded-full`} 
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Work-related stress remains the dominant topic, but has decreased from 45% to 32% over the treatment period.
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100"
        >
          <h3 className="text-lg font-medium text-blue-800 mb-3">Key Insights & Recommendations</h3>
          <ul className="space-y-2">
            {insights.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${primaryColor} mr-2 flex-shrink-0 mt-0.5`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-blue-700">{insight}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Treatment Suggestions</h4>
            <p className="text-sm text-blue-700">
              Based on the analysis, consider focusing on sleep hygiene protocols and continuing cognitive restructuring techniques, which have shown the most positive impact. Also, exploring family dynamics in upcoming sessions may help address a growing source of stress.
            </p>
          </div>
        </motion.div>
        
        <div className="mt-6 flex justify-end">
          <button className={`px-4 py-2 ${primaryBg} text-white rounded-md hover:opacity-90 transition-opacity text-sm`}>
            Generate New Insights
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comparative Analysis</h2>
        <p className="text-gray-600 mb-6">
          Comparing {patientName}'s progress with anonymized data from similar patients.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-2">Treatment Response</h3>
            <div className="flex items-center justify-center h-32">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={`#${getColor('primary').replace('text-', '').replace('-600', '')}`}
                    strokeWidth="3"
                    strokeDasharray="68, 100"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-2xl font-bold text-gray-800">68%</div>
                  <div className="text-xs text-gray-500">Response</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              12% higher than average for similar patients
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-2">Recovery Timeline</h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">4.2</div>
                <div className="text-sm text-gray-600">months</div>
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full inline-block">
                  Faster than average
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Average is 6.5 months for similar conditions
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-2">Technique Efficacy</h3>
            <div className="space-y-2 mt-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">CBT</span>
                  <span className="text-gray-500">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Mindfulness</span>
                  <span className="text-gray-500">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "72%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Exposure</span>
                  <span className="text-gray-500">58%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "58%" }}></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              CBT shows highest efficacy for this patient
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
              <p className="text-xs text-yellow-700 mt-1">
                This comparative analysis uses anonymized data from patients with similar diagnoses, demographics, and treatment approaches. Individual results may vary, and this information should be used as a supplementary guide to clinical judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientInsights;