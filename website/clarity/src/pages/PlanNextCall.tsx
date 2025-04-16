import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { getPatientById, getSimilarPatients } from "../utils/patientData";
import PlanOption from "../components/PlanOption";

function PlanNextCall() {
  const { patientId, id: therapistId } = useParams<{ patientId: string; id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [similarPatients, setSimilarPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customPlan, setCustomPlan] = useState("");
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;
  const secondaryColor = `text-${getColor('secondary')}`;

  useEffect(() => {
    // Fetch patient data
    if (patientId) {
      const patientData = getPatientById(patientId);
      if (patientData) {
        setPatient(patientData);
        
        // Get similar patients
        const similar = getSimilarPatients(patientId);
        setSimilarPatients(similar);
      }
      setLoading(false);
    }
  }, [patientId]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSavePlan = () => {
    // In a real app, this would save the plan to the database
    alert("Plan saved successfully!");
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
        <h1 className={`text-3xl font-bold ${primaryColor} mb-6`}>Plan Next Call</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Patient not found. Please select a patient from the dashboard.</p>
        </div>
      </div>
    );
  }

  // Plan options
  const planOptions = [
    {
      id: "literature",
      title: "Literature-Based Approach",
      description: "Plan based on latest research for patients with similar conditions",
      icon: "📚",
      details: [
        "Review recent studies on CBT effectiveness for anxiety disorders",
        "Implement structured exposure hierarchy based on evidence-based protocols",
        "Incorporate mindfulness techniques shown effective in recent meta-analyses",
        "Follow standardized measurement-based care approach"
      ]
    },
    {
      id: "similar-patients",
      title: "Similar Patient Outcomes",
      description: "Plan based on what worked for similar patients",
      icon: "👥",
      details: [
        "Focus on behavioral activation which showed 78% improvement in similar cases",
        "Implement sleep hygiene protocol that improved sleep metrics by 45% in comparable patients",
        "Use guided imagery techniques that reduced anxiety in 82% of similar cases",
        "Schedule bi-weekly sessions (optimal frequency based on similar patient data)"
      ]
    },
    {
      id: "custom",
      title: "Custom Treatment Plan",
      description: "Create a fully customized plan for this patient",
      icon: "✏️",
      details: []
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${primaryColor}`}>Plan Next Call</h1>
          <p className="text-gray-600">
            Create a data-driven plan for your next session with {patient.name}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Patient Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><span className="font-medium">Name:</span> {patient.name}</p>
              <p className="text-gray-600"><span className="font-medium">Diagnosis:</span> {patient.diagnosis.join(", ")}</p>
              <p className="text-gray-600"><span className="font-medium">Last Session:</span> {new Date(patient.lastSession).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600"><span className="font-medium">Key Metrics:</span></p>
              <div className="flex items-center mt-1">
                <span className="text-sm mr-2">Anxiety:</span>
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${patient.metrics.anxiety}%` }}
                  ></div>
                </div>
                <span className="text-sm">{patient.metrics.anxiety}%</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm mr-2">Depression:</span>
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${patient.metrics.depression}%` }}
                  ></div>
                </div>
                <span className="text-sm">{patient.metrics.depression}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <h3 className="text-md font-medium text-blue-800 mb-2">Last Session Notes</h3>
            <p className="text-sm text-blue-700">
              {patient.history[0].notes}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Planning Approach</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {planOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PlanOption 
                  plan={option}
                  isSelected={selectedPlan === option.id}
                  onSelect={() => handlePlanSelect(option.id)}
                />
              </motion.div>
            ))}
          </div>
          
          {selectedPlan === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Treatment Plan
              </label>
              <textarea
                value={customPlan}
                onChange={(e) => setCustomPlan(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your custom treatment plan for this patient..."
              ></textarea>
            </motion.div>
          )}
          
          {selectedPlan && selectedPlan !== "custom" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md"
            >
              <h3 className="text-md font-medium text-gray-800 mb-2">
                {planOptions.find(p => p.id === selectedPlan)?.title} Details
              </h3>
              <ul className="space-y-2">
                {planOptions.find(p => p.id === selectedPlan)?.details.map((detail, index) => (
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
                    <span className="text-sm text-gray-600">{detail}</span>
                  </li>
                ))}
              </ul>
              
              {selectedPlan === "similar-patients" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Similar Patients</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {similarPatients.map(similarPatient => (
                      <div key={similarPatient.id} className="p-3 bg-white border border-gray-200 rounded-md">
                        <p className="font-medium text-gray-800">{similarPatient.name}</p>
                        <p className="text-xs text-gray-500">
                          {similarPatient.diagnosis.join(", ")}
                        </p>
                        <div className="mt-2 text-xs">
                          <span className={`${secondaryColor} font-medium`}>Outcome:</span> 
                          <span className="text-gray-600"> 72% symptom reduction after 8 sessions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSavePlan}
              disabled={!selectedPlan || (selectedPlan === "custom" && !customPlan.trim())}
              className={`${primaryBg} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Save Plan
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PlanNextCall;