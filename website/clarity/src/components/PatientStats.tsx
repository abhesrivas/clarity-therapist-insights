import { useTheme } from "../utils/themeContext";
import { Patient } from "../utils/patientData";

interface PatientStatsProps {
  patient: Patient;
}

function PatientStats({ patient }: PatientStatsProps) {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = getColor('primary');
  const secondaryColor = getColor('secondary');
  const accentColor = getColor('accent');
  
  // Calculate bar widths based on metrics
  const anxietyWidth = `${patient.metrics.anxiety}%`;
  const depressionWidth = `${patient.metrics.depression}%`;
  const wellbeingWidth = `${patient.metrics.wellbeing}%`;
  const sleepWidth = `${patient.metrics.sleep}%`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Metrics</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Anxiety Level</span>
            <span className="text-sm font-medium text-gray-700">{patient.metrics.anxiety}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`bg-${primaryColor} h-2.5 rounded-full`} 
              style={{ width: anxietyWidth }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {patient.metrics.anxiety > 70 
              ? 'High anxiety levels - consider intervention' 
              : patient.metrics.anxiety > 40 
                ? 'Moderate anxiety - monitor closely' 
                : 'Low anxiety levels'}
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Depression Indicators</span>
            <span className="text-sm font-medium text-gray-700">{patient.metrics.depression}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`bg-${secondaryColor} h-2.5 rounded-full`} 
              style={{ width: depressionWidth }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {patient.metrics.depression > 70 
              ? 'High depression indicators - intervention recommended' 
              : patient.metrics.depression > 40 
                ? 'Moderate depression indicators - continue treatment' 
                : 'Low depression indicators'}
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Wellbeing</span>
            <span className="text-sm font-medium text-gray-700">{patient.metrics.wellbeing}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`bg-${accentColor} h-2.5 rounded-full`} 
              style={{ width: wellbeingWidth }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {patient.metrics.wellbeing > 70 
              ? 'Good overall wellbeing' 
              : patient.metrics.wellbeing > 40 
                ? 'Moderate wellbeing - room for improvement' 
                : 'Poor wellbeing - focus on improvement strategies'}
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Sleep Quality</span>
            <span className="text-sm font-medium text-gray-700">{patient.metrics.sleep}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-400 h-2.5 rounded-full" 
              style={{ width: sleepWidth }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {patient.metrics.sleep > 70 
              ? 'Good sleep quality' 
              : patient.metrics.sleep > 40 
                ? 'Moderate sleep issues - monitor' 
                : 'Poor sleep quality - intervention recommended'}
          </p>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Population Comparison</h4>
        <p className="text-sm text-gray-600">
          This patient's anxiety levels are higher than 65% of similar patients.
          Depression indicators are in line with 45% of the patient population.
        </p>
        <p className="text-xs text-gray-500 mt-2 italic">
          Note: Comparison data is based on similar demographic profiles and diagnoses.
          <br />
          <span className="font-medium">ML model confidence: 87%</span>
        </p>
      </div>
    </div>
  );
}

export default PatientStats;