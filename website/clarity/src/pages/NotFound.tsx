import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";

function NotFound() {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <div className="-mt-16 mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-16 w-16 ${primaryColor}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/"
          className={`${primaryBg} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-block font-medium`}
        >
          Go to Home
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;