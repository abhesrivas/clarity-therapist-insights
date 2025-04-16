import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../utils/themeContext';

interface TherapeuticNudgeProps {
  nudge: string;
  isAnimated?: boolean;
  isCompact?: boolean;
}

function TherapeuticNudge({ 
  nudge, 
  isAnimated = true,
  isCompact = false 
}: TherapeuticNudgeProps) {
  const { getColor } = useTheme();
  const [prevNudge, setPrevNudge] = useState<string>(nudge);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;
  const primaryBgLight = `bg-${getColor('primary').replace('600', '50')}`;
  const secondaryBgLight = `bg-${getColor('secondary').replace('500', '50')}`;

  // Handle nudge transitions
  useEffect(() => {
    // Only animate if the nudge has changed significantly
    if (nudge !== prevNudge) {
      if (isAnimated) {
        setIsVisible(false);
        const timer = setTimeout(() => {
          setPrevNudge(nudge);
          setIsVisible(true);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setPrevNudge(nudge);
      }
    }
  }, [nudge, prevNudge, isAnimated]);

  return (
    <div className={`${isCompact ? 'p-3' : 'p-4'} ${secondaryBgLight} rounded-lg shadow-md`}>
      <div className="flex items-center mb-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5'} ${primaryColor} mr-2`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className={`${isCompact ? 'text-sm' : 'text-md'} font-semibold ${primaryColor}`}>
          Therapeutic Nudge
        </h3>
      </div>
      
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={prevNudge.substring(0, 20)}
            initial={isAnimated ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-700`}>
              {prevNudge}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isCompact && (
        <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
          <span className="italic">AI-suggested therapeutic approach</span>
          <button className={`${primaryColor} hover:underline text-xs focus:outline-none`}>
            Get another
          </button>
        </div>
      )}
    </div>
  );
}

export default TherapeuticNudge;