  // Patient data with mock information
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string[];
  status: string;
  riskLevel: string;
  lastSession: string;
  metrics: {
    anxiety: number;
    depression: number;
    adherence?: number;
  };
  history: PatientHistoryEntry[];
}

export interface PatientHistoryEntry {
  id: string;
  date: string;
  type: string;
  notes: string;
  homework?: string;
  metrics?: {
    anxiety: number;
    depression: number;
  };
  insights?: string[];
}

export interface ConditionScreening {
  condition: string;
  probability: number;
  description: string;
  recommendedActions: string[];
}

// Mock patient data
export const patients: Patient[] = [
  {
    id: "p1",
    name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    diagnosis: ["Generalized Anxiety Disorder", "Insomnia"],
    status: "Active",
    riskLevel: "Low",
    lastSession: "2023-06-15T10:30:00Z",
    metrics: {
      anxiety: 65,
      depression: 42,
      adherence: 78
    },
    history: [
      {
        id: "h1",
        date: "2023-06-15T10:30:00Z",
        type: "Session",
        notes: "Sarah reported increased anxiety at work due to upcoming project deadlines. She's been using the breathing techniques we discussed but finds them less effective when under extreme stress. Sleep has been disrupted, averaging 5 hours per night.",
        homework: "Practice progressive muscle relaxation before bed. Continue thought journaling with focus on work-related thoughts.",
        metrics: {
          anxiety: 65,
          depression: 42
        },
        insights: [
          "Work stressors remain primary anxiety trigger",
          "Sleep disruption correlates with increased anxiety",
          "Breathing techniques less effective under high stress"
        ]
      },
      {
        id: "h2",
        date: "2023-06-01T11:00:00Z",
        type: "Session",
        notes: "Sarah has been consistent with her thought journaling. She identified several cognitive distortions related to her performance at work. We worked on challenging these thoughts and developing more balanced perspectives.",
        homework: "Continue thought journaling. Practice reframing negative thoughts using the worksheet provided.",
        metrics: {
          anxiety: 70,
          depression: 45
        }
      },
      {
        id: "h3",
        date: "2023-05-15T10:30:00Z",
        type: "Session",
        notes: "Sarah reported some improvement in sleep after implementing the sleep hygiene protocol. She's still experiencing significant anxiety during work meetings and when thinking about deadlines. We discussed the physical symptoms she experiences and began working on mindfulness techniques.",
        homework: "Daily 5-minute mindfulness practice. Continue sleep hygiene protocol.",
        metrics: {
          anxiety: 75,
          depression: 48
        }
      },
      {
        id: "h4",
        date: "2023-05-01T14:00:00Z",
        type: "Assessment",
        notes: "Conducted GAD-7 and PHQ-9 assessments. Sarah scored 16 on GAD-7 (severe anxiety) and 12 on PHQ-9 (moderate depression). She reports that anxiety symptoms have been present for approximately 8 months, coinciding with a promotion at work that increased her responsibilities.",
        metrics: {
          anxiety: 80,
          depression: 60
        }
      },
      {
        id: "h5",
        date: "2023-04-15T09:00:00Z",
        type: "Intake",
        notes: "Initial intake session. Sarah is a 34-year-old marketing executive who reports experiencing persistent worry, difficulty concentrating, and sleep disturbances. She describes herself as a 'lifelong worrier' but states that symptoms have significantly worsened in the past year. No previous mental health treatment.",
        metrics: {
          anxiety: 85,
          depression: 55
        }
      }
    ]
  },
  {
    id: "p2",
    name: "Michael Chen",
    age: 28,
    gender: "Male",
    diagnosis: ["Social Anxiety Disorder", "Depression"],
    status: "Active",
    riskLevel: "Moderate",
    lastSession: "2023-06-14T15:00:00Z",
    metrics: {
      anxiety: 58,
      depression: 62,
      adherence: 65
    },
    history: [
      {
        id: "h6",
        date: "2023-06-14T15:00:00Z",
        type: "Session",
        notes: "Michael reported a challenging week with increased social interactions at work. He used some of the cognitive restructuring techniques we discussed but still experienced significant anxiety. He did manage to speak up in a team meeting, which he identified as progress.",
        homework: "Continue exposure hierarchy. Practice cognitive restructuring before and after social interactions.",
        metrics: {
          anxiety: 58,
          depression: 62
        }
      },
      {
        id: "h7",
        date: "2023-05-31T15:00:00Z",
        type: "Session",
        notes: "Michael has been making progress with his exposure hierarchy. He completed two items from his list and reported less anticipatory anxiety than expected. Depression symptoms remain significant, particularly low motivation and negative self-talk.",
        metrics: {
          anxiety: 65,
          depression: 68
        }
      }
    ]
  },
  {
    id: "p3",
    name: "Emily Rodriguez",
    age: 42,
    gender: "Female",
    diagnosis: ["PTSD", "Major Depressive Disorder"],
    status: "Active",
    riskLevel: "High",
    lastSession: "2023-06-12T13:30:00Z",
    metrics: {
      anxiety: 72,
      depression: 78,
      adherence: 82
    },
    history: [
      {
        id: "h8",
        date: "2023-06-12T13:30:00Z",
        type: "Session",
        notes: "Emily reported increased flashbacks this week following a trigger in her neighborhood. We practiced grounding techniques during the session, which she found helpful. Sleep remains disrupted with nightmares 3-4 times per week.",
        metrics: {
          anxiety: 72,
          depression: 78
        }
      }
    ]
  },
  {
    id: "p4",
    name: "David Wilson",
    age: 56,
    gender: "Male",
    diagnosis: ["Adjustment Disorder", "Insomnia"],
    status: "Inactive",
    riskLevel: "Low",
    lastSession: "2023-05-10T11:00:00Z",
    metrics: {
      anxiety: 45,
      depression: 38
    },
    history: [
      {
        id: "h9",
        date: "2023-05-10T11:00:00Z",
        type: "Session",
        notes: "David has been adjusting well to retirement. Sleep has improved with the implementation of sleep hygiene practices. He reports decreased worry about financial matters after meeting with his financial advisor.",
        metrics: {
          anxiety: 45,
          depression: 38
        }
      }
    ]
  }
];

// Function to get a patient by ID
export const getPatientById = (id: string): Patient | undefined => {
  return patients.find(patient => patient.id === id);
};

// Function to get similar patients (excluding the current patient)
export const getSimilarPatients = (patientId: string): Patient[] => {
  const patient = getPatientById(patientId);
  if (!patient) return [];
  
  // In a real app, this would use more sophisticated matching
  return patients
    .filter(p => p.id !== patientId && p.diagnosis.some(d => patient.diagnosis.includes(d)))
    .slice(0, 2);
};

// Function to get condition screening results for a patient
export const getPatientConditionScreening = (patientId: string): ConditionScreening[] => {
  // In a real app, this would be based on actual analysis of patient data
  return [
    {
      condition: "Generalized Anxiety Disorder",
      probability: 0.85,
      description: "Patient exhibits persistent and excessive worry about various domains, with physical symptoms including restlessness, fatigue, and sleep disturbance.",
      recommendedActions: [
        "Continue CBT with focus on cognitive restructuring",
        "Consider adding mindfulness-based stress reduction",
        "Assess for potential benefit from medication consultation"
      ]
    },
    {
      condition: "Panic Disorder",
      probability: 0.42,
      description: "Some indicators of panic symptoms, including episodes of intense fear with physical manifestations, though not meeting full diagnostic criteria.",
      recommendedActions: [
        "Monitor for development of panic attacks",
        "Teach panic management techniques as preventative measure",
        "Include questions about unexpected anxiety spikes in sessions"
      ]
    },
    {
      condition: "Major Depressive Disorder",
      probability: 0.38,
      description: "Subclinical depressive symptoms present, including periodic low mood, decreased energy, and negative thinking patterns.",
      recommendedActions: [
        "Continue monitoring depressive symptoms",
        "Incorporate behavioral activation techniques",
        "Assess sleep quality and its impact on mood"
      ]
    },
    {
      condition: "Insomnia Disorder",
      probability: 0.76,
      description: "Significant sleep disturbance with difficulty falling asleep, staying asleep, and resulting daytime impairment.",
      recommendedActions: [
        "Implement comprehensive sleep hygiene protocol",
        "Consider CBT-I (Cognitive Behavioral Therapy for Insomnia)",
        "Evaluate impact of anxiety on sleep patterns"
      ]
    },
    {
      condition: "Social Anxiety Disorder",
      probability: 0.25,
      description: "Mild to moderate anxiety in some social situations, but not meeting full criteria for social anxiety disorder.",
      recommendedActions: [
        "Monitor for avoidance of social situations",
        "Assess impact on work and relationships",
        "Consider adding exposure exercises if symptoms increase"
      ]
    }
  ];
};