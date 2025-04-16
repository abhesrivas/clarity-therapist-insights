import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import PatientCard from "../components/PatientCard";
import { useTheme } from "../utils/themeContext";
import { getTherapistById } from "../utils/therapistData";
import { patients } from "../utils/patientData";

function Dashboard() {
  const { id: therapistId } = useParams<{ id: string }>();
  const { getColor } = useTheme();
  
  const therapist = therapistId ? getTherapistById(therapistId) : null;
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const accentColor = `text-${getColor('accent')}`;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold ${primaryColor} mb-2`}>
          {therapist ? `Welcome, ${therapist.name}` : 'Welcome to Clarity'}
        </h1>
        <p className="text-gray-600 mb-6">
          Your platform for better patient understanding and care
        </p>
        
        <SearchBar />
        
        <div className="mt-8">
          <h2 className={`text-xl font-semibold ${accentColor} mb-4`}>Recent Patients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map(patient => (
              <PatientCard 
                key={patient.id} 
                patient={patient} 
                therapistId={therapistId || "1"} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;