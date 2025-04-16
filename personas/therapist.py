from person import Person

class Therapist(Person):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.specialties = []
        self.therapeutic_approach = None
        self.license = None
        self.experience_years = None
        self.patients = []

    def add_specialty(self, specialty):
        self.specialties.append(specialty)

    def set_approach(self, approach):
        self.therapeutic_approach = approach

    def add_patient(self, patient_name):
        self.patients.append(patient_name)
