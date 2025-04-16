import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../utils/themeContext';
import { TopicPrediction } from '../utils/mlService';

interface TopicPredictionsProps {
  predictions: TopicPrediction[];
  title?: string;
  isAnimated?: boolean;
  isCompact?: boolean;
}

function TopicPredictions({ 
  predictions, 
  title = "Topic Analysis", 
  isAnimated = true,
  isCompact = false
}: TopicPredictionsProps) {
  const { getColor } = useTheme();
  const [prevPredictions, setPrevPredictions] = useState<TopicPrediction[]>(predictions);
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;
  const primaryBgLight = `bg-${getColor('primary').replace('600', '50')}`;

  // Update previous predictions for animation purposes
  useEffect(() => {
    // Only update if the predictions have changed significantly
    const hasSignificantChange = predictions.some((pred, index) => {
      if (index >= prevPredictions.length) return true;
      return pred.topic !== prevPredictions[index].topic;
    });
    
    if (hasSignificantChange) {
      setPrevPredictions(predictions);
    }
  }, [predictions]);

  // Format confidence as percentage
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  // Determine bar color based on confidence
  const getBarColor = (confidence: number): string => {
    if (confidence >= 0.7) return 'bg-green-500';
    if (confidence >= 0.4) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // For compact view, only show the top 3 predictions
  const displayPredictions = isCompact ? predictions.slice(0, 3) : predictions;

  return (
    <div className={`${isCompact ? 'p-3' : 'p-4'} bg-white rounded-lg shadow-md`}>
      <h3 className={`${isCompact ? 'text-sm' : 'text-md'} font-semibold text-gray-800 mb-2`}>
        {title}
      </h3>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayPredictions.map((prediction, index) => (
            <motion.div
              key={`${prediction.topic}-${index}`}
              initial={isAnimated ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="mb-1"
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
                  {prediction.topic.replace(/-/g, ' ')}
                </span>
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                  {formatConfidence(prediction.confidence)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  className={`${getBarColor(prediction.confidence)} h-1.5 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {!isCompact && (
        <div className="mt-3 text-xs text-gray-500">
          <p className="italic">ML-powered topic analysis based on current conversation.</p>
        </div>
      )}
    </div>
  );
}

export default TopicPredictions;