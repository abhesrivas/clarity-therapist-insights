from person import Person

class Patient(Person):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.symptoms = []
        self.diagnosis = None
        self.medications = []
        self.history = []
        self.goals = []
        self.therapist = None
    
    def add_symptom(self, symptom):
        self.symptoms.append(symptom)

    def set_diagnosis(self, diagnosis):
        self.diagnosis = diagnosis

    def add_medication(self, med):
        self.medications.append(med)

    def add_history(self, event):
        self.history.append(event)

    def set_therapist(self, therapist_name):
        self.therapist = therapist_name
