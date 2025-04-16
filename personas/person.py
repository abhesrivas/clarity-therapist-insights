class Person:
    def __init__(self, name=None, age=None, gender=None, occupation=None, location=None):
        self.name = name
        self.age = age
        self.gender = gender
        self.occupation = occupation
        self.location = location
        self.notes = []
    
    def add_note(self, text):
        self.notes.append(text)

    def summary(self):
        return {
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "occupation": self.occupation,
            "location": self.location,
            "notes": self.notes
        }
