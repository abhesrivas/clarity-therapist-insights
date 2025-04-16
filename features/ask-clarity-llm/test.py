import json
from pathlib import Path
from jinja2 import Template
from openai import OpenAI

client = OpenAI(api_key='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')

def build_therapist_prompt(therapist_query: str, patient_persona: dict, patient_history: str,
                            prompt_template_path="ask_clarity_prompt.md") -> str:
    template_text = Path(prompt_template_path).read_text()
    template = Template(template_text)
    return template.render(
        therapist_query=therapist_query,
        patient_persona=patient_persona,
        patient_history=patient_history
    )

# Sample input (replace these with actual files in production)
# therapist_query = "What strategies could help this patient manage daily anxiety?"
therapist_query = "Why should I tell Taylor to listen to Taylor Swift?"

patient_persona = {
    "name": "Taylor",
    "age": 28,
    "gender": "Female",
    "occupation": "Marketing Manager",
    "location": "New York"
}
patient_history = """
Taylor reports experiencing chronic anxiety, especially in work environments.
Symptoms include restlessness, overthinking, and occasional panic attacks.
She has tried meditation inconsistently and is considering therapy options.
"""

# Build prompt
prompt = build_therapist_prompt(therapist_query, patient_persona, patient_history)

# Call OpenAI (gpt-3.5 or gpt-4)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a licensed therapist providing clinical recommendations."},
        {"role": "user", "content": prompt}
    ]
)

# Output result
print("=== LLM Response ===\\n")
print(response.choices[0].message.content)

import pdb; pdb.set_trace()