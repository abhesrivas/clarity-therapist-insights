import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";

interface PlanOptionProps {
  plan: {
    id: string;
    title: string;
    description: string;
    icon: string;
    details: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
}

function PlanOption({ plan, isSelected, onSelect }: PlanOptionProps) {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = getColor('primary');
  const primaryBgLight = `bg-${primaryColor.replace('600', '50')}`;
  const primaryBorder = `border-${primaryColor}`;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      onClick={onSelect}
      className={`bg-white rounded-lg shadow-md overflow-hidden border-2 cursor-pointer transition-colors h-full ${
        isSelected ? `${primaryBorder}` : "border-transparent"
      }`}
    >
      <div className={`p-5 ${isSelected ? primaryBgLight : ""}`}>
        <div className="flex items-center mb-3">
          <div className="text-3xl mr-3">{plan.icon}</div>
          <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {plan.description}
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
          
          {plan.details.length > 0 && (
            <span className="text-xs text-gray-500">
              {plan.details.length} steps
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default PlanOption;