import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { getTherapistById } from "../utils/therapistData";

function Header() {
  const { id: therapistId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getColor } = useTheme();
  
  const therapist = therapistId ? getTherapistById(therapistId) : null;
  
  // Get primary color from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBgColor = `bg-${getColor('primary')}`;
  const hoverColor = `hover:text-${getColor('accent')}`;

  const handleLogout = () => {
    // In a real app, this would clear authentication
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link to={therapistId ? `/therapist/${therapistId}` : '/'} className={`text-2xl font-bold ${primaryColor}`}>
              Clarity
            </Link>
            <span className="ml-2 text-sm text-gray-500">for Therapists</span>
          </motion.div>
          
          {therapist && (
            <div className="flex items-center">
              <div className="mr-6">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-medium">{therapist.name}</p>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                <Link to={`/therapist/${therapistId}`} className={`text-gray-600 ${hoverColor} transition-colors`}>
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`${primaryBgColor} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity`}
                >
                  Switch User
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;