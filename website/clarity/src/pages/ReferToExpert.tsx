import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { getPatientById } from "../utils/patientData";
import { getExpertTherapists } from "../utils/therapistData";
import TherapistMatch from "../components/TherapistMatch";

function ReferToExpert() {
  const { patientId, id: therapistId } = useParams<{ patientId: string; id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralReason, setReferralReason] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;

  useEffect(() => {
    // Fetch patient data and expert therapists
    if (patientId && therapistId) {
      const patientData = getPatientById(patientId);
      if (patientData) {
        setPatient(patientData);
      }
      
      // Get expert therapists (excluding current therapist)
      const expertTherapists = getExpertTherapists(therapistId);
      setExperts(expertTherapists);
      
      setLoading(false);
    }
  }, [patientId, therapistId]);

  const handleExpertSelect = (expertId: string) => {
    setSelectedExpert(expertId);
  };

  const handleSubmitReferral = () => {
    // In a real app, this would submit the referral to the database
    alert("Referral submitted successfully!");
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
        <h1 className={`text-3xl font-bold ${primaryColor} mb-6`}>Refer to Expert</h1>
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
          <h1 className={`text-3xl font-bold ${primaryColor}`}>Refer to Expert</h1>
          <p className="text-gray-600">
            Find the best specialist for {patient.name} based on their needs
          </p>
        </div>
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
              <p className="text-gray-600"><span className="font-medium">Diagnosis:</span> {patient.diagnosis.join(", ")}</p>
              <p className="text-gray-600"><span className="font-medium">Risk Level:</span> {patient.riskLevel}</p>
              <p className="text-gray-600"><span className="font-medium">Last Session:</span> {new Date(patient.lastSession).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Referral
          </label>
          <textarea
            value={referralReason}
            onChange={(e) => setReferralReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe why you're referring this patient and what specific expertise they need..."
          ></textarea>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Experts</h2>
          <p className="text-sm text-gray-600 mb-6">
            Our ML model has analyzed {patient.name}'s needs and found these specialists who may be a good match. The match percentage is based on specialties, experience with similar cases, and treatment approaches.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TherapistMatch 
                  therapist={expert}
                  matchPercentage={Math.round(85 - index * 12)} // Mock match percentages
                  isSelected={selectedExpert === expert.id}
                  onSelect={() => handleExpertSelect(expert.id)}
                />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSubmitReferral}
              disabled={!selectedExpert || !referralReason.trim()}
              className={`${primaryBg} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Submit Referral
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ReferToExpert;