import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { getPatientById, getPatientConditionScreening, ConditionScreening } from "../utils/patientData";
import ConditionCard from "../components/ConditionCard";

function ScreenConditions() {
  const { patientId, id: therapistId } = useParams<{ patientId: string; id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [screeningResults, setScreeningResults] = useState<ConditionScreening[]>([]);
  const [loading, setLoading] = useState(true);
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;

  useEffect(() => {
    // Fetch patient data and screening results
    if (patientId) {
      const patientData = getPatientById(patientId);
      if (patientData) {
        setPatient(patientData);
        
        // Get condition screening results
        const results = getPatientConditionScreening(patientId);
        setScreeningResults(results);
      }
      setLoading(false);
    }
  }, [patientId]);

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
        <h1 className={`text-3xl font-bold ${primaryColor} mb-6`}>Condition Screening</h1>
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
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${primaryColor}`}>Condition Screening</h1>
          <p className="text-gray-600">
            ML-powered screening for {patient.name} based on their history and symptoms
          </p>
        </div>
        <button className={`${primaryBg} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity`}>
          Run New Screening
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><span className="font-medium">Name:</span> {patient.name}</p>
              <p className="text-gray-600"><span className="font-medium">Age:</span> {patient.age}</p>
              <p className="text-gray-600"><span className="font-medium">Gender:</span> {patient.gender}</p>
            </div>
            <div>
              <p className="text-gray-600"><span className="font-medium">Current Diagnosis:</span> {patient.diagnosis.join(", ")}</p>
              <p className="text-gray-600"><span className="font-medium">Risk Level:</span> {patient.riskLevel}</p>
              <p className="text-gray-600"><span className="font-medium">Last Session:</span> {new Date(patient.lastSession).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Screening Results</h2>
          <p className="text-sm text-gray-600 mb-6">
            Our ML model has analyzed {patient.name}'s history, session notes, and symptom patterns to identify potential conditions. Results are shown with probability scores and recommended actions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screeningResults.map((condition, index) => (
              <motion.div
                key={condition.condition}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ConditionCard condition={condition} />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Screening Methodology</h3>
            <p className="text-sm text-gray-600">
              This screening uses a machine learning model trained on thousands of clinical cases to identify patterns consistent with various mental health conditions. The model analyzes:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>Patient's reported symptoms and their severity</li>
              <li>Temporal patterns in symptom presentation</li>
              <li>Response to previous interventions</li>
              <li>Linguistic patterns in session notes</li>
              <li>Demographic and historical risk factors</li>
            </ul>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Important Note:</span> These screening results are meant to assist clinical judgment, not replace it. All suggested conditions should be verified through proper clinical assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ScreenConditions;