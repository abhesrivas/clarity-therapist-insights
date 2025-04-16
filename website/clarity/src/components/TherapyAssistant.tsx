import { useState, useEffect } from 'react';
import TopicPredictions from './TopicPredictions';
import TherapeuticNudge from './TherapeuticNudge';
import { TopicPrediction, mlService } from '../utils/mlService';

interface TherapyAssistantProps {
  patientMessage: string;
  approach: string;
  focusArea?: string;
  isCompact?: boolean;
}

function TherapyAssistant({ 
  patientMessage, 
  approach, 
  focusArea,
  isCompact = false
}: TherapyAssistantProps) {
  const [topicPredictions, setTopicPredictions] = useState<TopicPrediction[]>([]);
  const [nudge, setNudge] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Update topics and nudges whenever the patient message changes
  useEffect(() => {
    if (!patientMessage.trim()) return;
    
    const updateAssistant = async () => {
      setIsLoading(true);
      
      try {
        // Get topic predictions for the message
        const predictions = await mlService.getTopicPredictions(patientMessage, 5);
        setTopicPredictions(predictions);
        
        // Generate a therapeutic nudge based on the message, approach, and topics
        const newNudge = await mlService.generateTherapeuticNudge(
          patientMessage, 
          approach, 
          predictions
        );
        setNudge(newNudge);
      } catch (error) {
        console.error('Error updating therapy assistant:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updateAssistant();
  }, [patientMessage, approach]);

  // Ensure we have focus area-specific nudges
  useEffect(() => {
    if (focusArea && nudge && !isLoading) {
      // Check if the nudge should be adjusted based on focus area
      if (!nudge.toLowerCase().includes(focusArea.toLowerCase())) {
        const updateNudgeForFocus = async () => {
          try {
            // Generate a new nudge that considers the focus area
            const focusedMessage = `${patientMessage} [Focus on ${focusArea}]`;
            const newNudge = await mlService.generateTherapeuticNudge(
              focusedMessage,
              approach,
              topicPredictions
            );
            setNudge(newNudge);
          } catch (error) {
            console.error('Error updating focus-specific nudge:', error);
          }
        };
        
        updateNudgeForFocus();
      }
    }
  }, [focusArea, patientMessage, approach, nudge, isLoading]);

  return (
    <div className="space-y-4">
      {topicPredictions.length > 0 && (
        <TopicPredictions 
          predictions={topicPredictions} 
          isCompact={isCompact}
          title={isCompact ? "Detected Topics" : "Topic Analysis"}
        />
      )}
      
      {nudge && (
        <TherapeuticNudge 
          nudge={nudge} 
          isCompact={isCompact}
        />
      )}
    </div>
  );
}

export default TherapyAssistant;