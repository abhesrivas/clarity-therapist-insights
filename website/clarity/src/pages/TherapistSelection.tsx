import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { therapists } from "../utils/therapistData";
import TherapistCard from "../components/TherapistCard";
import { useTheme } from "../utils/themeContext";

function TherapistSelection() {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const handleSelectTherapist = (therapistId: string, themeId: string) => {
    // Set the theme based on selected therapist
    setTheme(themeId);
    
    // Navigate to the dashboard for this therapist
    navigate(`/therapist/${therapistId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Clarity</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A platform designed to help therapists provide better care through
            data-driven insights and AI assistance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select Your Profile</h2>
          <p className="text-gray-600">
            Choose your therapist profile to access your personalized dashboard
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {therapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <TherapistCard 
                therapist={therapist} 
                onSelect={() => handleSelectTherapist(therapist.id, therapist.themeId)} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TherapistSelection;