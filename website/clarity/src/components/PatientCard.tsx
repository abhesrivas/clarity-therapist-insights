import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { Patient } from "../utils/patientData";

interface PatientCardProps {
  patient: Patient;
  therapistId: string;
}

function PatientCard({ patient, therapistId }: PatientCardProps) {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBgLight = `bg-${getColor('primary').replace('600', '100')}`;
  const primaryTextLight = `text-${getColor('primary').replace('600', '800')}`;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            patient.status === "Active" 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {patient.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Age: {patient.age}</p>
          <p>Last Session: {new Date(patient.lastSession).toLocaleDateString()}</p>
          <p className={`mt-1 ${primaryBgLight} ${primaryTextLight} inline-block px-2 py-1 rounded text-xs`}>
            Risk Level: {patient.riskLevel}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Link 
            to={`/therapist/${therapistId}/patient-history/${patient.id}`}
            className={`text-sm ${primaryColor} hover:underline text-center py-1 border rounded-md`}
          >
            View History
          </Link>
          <Link 
            to={`/therapist/${therapistId}/chat/${patient.id}`}
            className={`text-sm ${primaryColor} hover:underline text-center py-1 border rounded-md`}
          >
            Chat
          </Link>
          <Link 
            to={`/therapist/${therapistId}/rehearse/${patient.id}`}
            className={`text-sm ${primaryColor} hover:underline text-center py-1 border rounded-md`}
          >
            Rehearse
          </Link>
          <Link 
            to={`/therapist/${therapistId}/plan/${patient.id}`}
            className={`text-sm ${primaryColor} hover:underline text-center py-1 border rounded-md`}
          >
            Plan Call
          </Link>
          <Link 
            to={`/therapist/${therapistId}/screen/${patient.id}`}
            className={`text-sm ${primaryColor} hover:underline text-center py-1 border rounded-md`}
          >
            Screen
          </Link>
          <Link 
            to={`/therapist/${therapistId}/refer/${patient.id}`}
            className={`text-sm ${primaryColor} hover:underline text-center py-1 border rounded-md`}
          >
            Refer
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default PatientCard;