import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../utils/themeContext";

interface SessionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  editNote?: {
    id: string;
    date: string;
    type: string;
    notes: string;
    homework?: string;
  };
  onSave: (noteData: {
    id?: string;
    date: string;
    type: string;
    notes: string;
    homework?: string;
  }) => void;
}

function SessionNoteModal({ isOpen, onClose, patientId, editNote, onSave }: SessionNoteModalProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<string>("Session");
  const [notes, setNotes] = useState<string>("");
  const [homework, setHomework] = useState<string>("");
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;
  const primaryBg = `bg-${getColor('primary')}`;

  // Load data if editing
  useEffect(() => {
    if (editNote) {
      setDate(new Date(editNote.date).toISOString().split('T')[0]);
      setSessionType(editNote.type);
      setNotes(editNote.notes);
      setHomework(editNote.homework || "");
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setSessionType("Session");
      setNotes("");
      setHomework("");
    }
  }, [editNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData = {
      id: editNote?.id,
      date: new Date(date).toISOString(),
      type: sessionType,
      notes,
      homework: homework.trim() !== "" ? homework : undefined
    };
    
    onSave(noteData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {editNote ? "Edit Session Note" : "Add New Session Note"}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Session">Regular Session</option>
                <option value="Intake">Intake</option>
                <option value="Assessment">Assessment</option>
                <option value="Crisis">Crisis Intervention</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed notes about the session..."
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Homework (optional)
            </label>
            <textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any homework or exercises assigned to the patient..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`px-4 py-2 ${primaryBg} text-white rounded-md hover:opacity-90 transition-opacity`}
            >
              {editNote ? "Update Note" : "Save Note"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default SessionNoteModal;