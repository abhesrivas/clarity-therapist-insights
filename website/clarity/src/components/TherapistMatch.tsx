import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";
import { Therapist } from "../utils/therapistData";

interface TherapistMatchProps {
  therapist: Therapist;
  matchPercentage: number;
  isSelected: boolean;
  onSelect: () => void;
}

function TherapistMatch({ therapist, matchPercentage, isSelected, onSelect }: TherapistMatchProps) {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = getColor('primary');
  const primaryBgLight = `bg-${primaryColor.replace('600', '50')}`;
  const primaryBorder = `border-${primaryColor}`;

  // Determine match color based on percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-orange-600";
  };
  
  const matchColor = getMatchColor(matchPercentage);

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      onClick={onSelect}
      className={`bg-white rounded-xl shadow-md overflow-hidden border-2 cursor-pointer transition-colors ${
        isSelected ? `${primaryBorder}` : "border-transparent"
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={therapist.imageUrl} 
          alt={`Dr. ${therapist.name}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-xl font-semibold">{therapist.name}</h3>
          <p className="text-white/80 text-sm">{therapist.title}</p>
        </div>
        
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center shadow-md">
          <span className={`text-sm font-bold ${matchColor}`}>{matchPercentage}%</span>
          <span className="text-xs text-gray-500 ml-1">match</span>
        </div>
      </div>
      
      <div className={`p-4 ${isSelected ? primaryBgLight : ""}`}>
        <div className="flex flex-wrap gap-2 mb-3">
          {therapist.specialties.map((specialty, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
        
        <p className="text-gray-600 text-sm mb-3">
          <span className="font-medium">Experience:</span> {therapist.experience} years
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 ${
              isSelected 
                ? `border-${primaryColor} bg-${primaryColor}` 
                : "border-gray-300"
            } mr-2 flex items-center justify-center`}>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {isSelected ? "Selected" : "Select"}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            {matchPercentage >= 80 ? "Excellent match" : 
             matchPercentage >= 60 ? "Good match" : "Potential match"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TherapistMatch;