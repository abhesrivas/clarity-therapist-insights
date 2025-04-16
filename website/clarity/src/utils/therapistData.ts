export interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: number;
  imageUrl: string;
  bio?: string;
}

// Mock therapist data
export const therapists: Therapist[] = [
  {
    id: "t1",
    name: "Dr. Jennifer Martinez",
    title: "Clinical Psychologist",
    specialties: ["Anxiety Disorders", "CBT", "Trauma"],
    experience: 12,
    imageUrl: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Dr. Martinez specializes in evidence-based treatments for anxiety and trauma-related disorders. She has extensive training in Cognitive Behavioral Therapy (CBT) and EMDR."
  },
  {
    id: "t2",
    name: "Dr. Michael Thompson",
    title: "Psychiatrist",
    specialties: ["Medication Management", "Depression", "Anxiety"],
    experience: 15,
    imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Dr. Thompson combines medication management with therapeutic approaches to provide comprehensive care for patients with mood and anxiety disorders."
  },
  {
    id: "t3",
    name: "Sarah Williams, LMFT",
    title: "Marriage & Family Therapist",
    specialties: ["Family Therapy", "Couples Counseling", "Relationship Issues"],
    experience: 8,
    imageUrl: "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Sarah specializes in helping couples and families improve communication, resolve conflicts, and build stronger relationships."
  },
  {
    id: "t4",
    name: "Dr. James Wilson",
    title: "Clinical Psychologist",
    specialties: ["Depression", "Mindfulness", "Existential Therapy"],
    experience: 10,
    imageUrl: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Dr. Wilson integrates mindfulness-based approaches with existential therapy to help clients find meaning and purpose while managing depression and life transitions."
  },
  {
    id: "t5",
    name: "Dr. Emily Chen",
    title: "Neuropsychologist",
    specialties: ["Cognitive Assessment", "ADHD", "Memory Disorders"],
    experience: 14,
    imageUrl: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    bio: "Dr. Chen specializes in comprehensive neuropsychological assessments and evidence-based interventions for ADHD, learning disorders, and memory concerns."
  }
];

// Function to get a therapist by ID
export const getTherapistById = (id: string): Therapist | undefined => {
  return therapists.find(therapist => therapist.id === id);
};

// Function to get expert therapists (excluding the current therapist)
export const getExpertTherapists = (currentTherapistId: string): Therapist[] => {
  return therapists.filter(therapist => therapist.id !== currentTherapistId);
};

// Function to get therapists by specialty
export const getTherapistsBySpecialty = (specialty: string): Therapist[] => {
  return therapists.filter(therapist => 
    therapist.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
};

// Function to get recommended therapists for a patient based on their diagnosis
export const getRecommendedTherapistsForPatient = (patientDiagnosis: string[], currentTherapistId: string): Therapist[] => {
  // In a real app, this would use more sophisticated matching
  const matchedTherapists = therapists.filter(therapist => 
    therapist.id !== currentTherapistId &&
    therapist.specialties.some(specialty => 
      patientDiagnosis.some(diagnosis => 
        specialty.toLowerCase().includes(diagnosis.toLowerCase().split(' ')[0])
      )
    )
  );
  
  return matchedTherapists.length > 0 ? matchedTherapists : getExpertTherapists(currentTherapistId);
};