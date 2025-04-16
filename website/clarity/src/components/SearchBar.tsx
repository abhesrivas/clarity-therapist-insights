import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { patients } from "../utils/patientData";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { id: therapistId } = useParams<{ id: string }>();
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;
  const primaryBgLight = `bg-${getColor('primary').replace('600', '50')}`;

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePatientSelect = (patientId: string) => {
    navigate(`/therapist/${therapistId}/patient-history/${patientId}`);
    setShowResults(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className={`${primaryBgLight} rounded-l-lg p-3`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${primaryColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search patients by name or condition..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length > 0) {
              setShowResults(true);
            } else {
              setShowResults(false);
            }
          }}
          onFocus={() => {
            if (searchTerm.length > 0) {
              setShowResults(true);
            }
          }}
          className="flex-grow py-3 px-4 border-y border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <AnimatePresence>
        {showResults && searchTerm.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
          >
            {filteredPatients.length > 0 ? (
              <ul>
                {filteredPatients.map(patient => (
                  <li 
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient.id)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{patient.name}</p>
                        <p className="text-sm text-gray-500">
                          {patient.diagnosis.join(", ")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        patient.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                No patients found matching "{searchTerm}"
              </div>
            )}
            
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              Press Enter to search or click on a patient to view their history
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;