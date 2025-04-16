import { motion } from "framer-motion";
import { Therapist } from "../utils/therapistData";

interface TherapistCardProps {
  therapist: Therapist;
  onSelect: () => void;
}

function TherapistCard({ therapist, onSelect }: TherapistCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={therapist.imageUrl} 
          alt={`Dr. ${therapist.name}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-xl font-semibold">{therapist.name}</h3>
          <p className="text-white/80 text-sm">{therapist.title}</p>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-4">
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
          <p className="text-gray-600 text-sm mb-2">
            <span className="font-medium">Experience:</span> {therapist.experience} years
          </p>
          <p className="text-gray-600 text-sm line-clamp-3">
            {therapist.bio}
          </p>
        </div>
        
        <button
          onClick={onSelect}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Select Profile
        </button>
      </div>
    </motion.div>
  );
}

export default TherapistCard;