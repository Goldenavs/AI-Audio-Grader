import pandas as pd
import json
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

def run_scoring(input_csv: str, output_csv: str, progress_cb):
    df = pd.read_csv(input_csv)
    
    prompt = PromptTemplate(
        template="""
Return ONLY valid JSON. No text before or after.

You are a strict Data Communication and Networking instructor.
Grade using an explicit checklist. Use the FULL score range (0–5 per criterion).
Deduct points for missing or incorrect concepts.

Score anchors:
0–1 = mostly incorrect or missing key ideas
2 = limited understanding
3 = basic correct explanation
4 = good technical explanation
5 = excellent, complete, technically precise

Two possible questions were asked.

========================
QUESTION 1: TCP/IP and OSI Models
Ideal answer includes:
- TCP/IP identified with 4 layers (Application, Transport, Internet, Network Access)
- OSI identified with 7 layers (Application, Presentation, Session, Transport, Network, Data Link, Physical)
- Purpose of models (standardization / abstraction)
- Mapping or comparison between models
- Protocol examples (e.g., HTTP, TCP, IP)

Scoring:

Accuracy (0–5):
+1 TCP/IP correctly identified
+1 TCP/IP has 4 layers
+1 OSI identified with 7 layers
+1 explains purpose of models
+1 protocol examples or correct functions

Depth (0–5):
+1 layer mapping or comparison
+1 encapsulation or abstraction mentioned
+1 technical terms (TCP, IP, HTTP, etc.)
+1 conceptual vs practical model distinction
+1 detailed explanation

Reasoning (0–5):
+1 logical structure
+1 comparison reasoning
+1 cause–effect explanation
+1 coherent flow
+1 complete argument

Clarity (0–5):
+1 organized response
+1 understandable phrasing
+1 minimal repetition
+1 complete sentences
+1 concise explanation

========================
QUESTION 2: Classful vs Classless Routing
Ideal answer includes:
- Class A/B/C
- Default subnet masks
- CIDR or VLSM
- Prefix notation (e.g., /24)
- Example scenario
- Address efficiency explanation

Scoring:

Accuracy (0–5):
+1 identifies Class A/B/C
+1 mentions default subnet masks
+1 defines classless routing
+1 explains CIDR/VLSM
+1 provides example

Depth (0–5):
+1 prefix notation
+1 IP efficiency discussion
+1 routing protocol examples
+1 subnet calculation reference
+1 scenario-based explanation

Reasoning (0–5):
+1 comparison logic
+1 problem–solution structure
+1 justified example
+1 coherent steps
+1 complete explanation

Clarity (0–5):
+1 organized response
+1 understandable phrasing
+1 minimal filler
+1 complete sentences
+1 concise explanation

Apply the checklist relevant to the detected question.
Be strict. Do not compress scores toward the middle.

Return STRICT JSON in EXACT format:

{{"accuracy":0,"depth":0,"reasoning":0,"clarity":0,"feedback":""}}

Student Answer:
{answer}
""",
        input_variables=["answer"]
    )

    GEMINI_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_ACTUAL_API_KEY_HERE")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=GEMINI_KEY)

    results = []
    for i, row in df.iterrows():
        transcript = row["transcript"]
        progress_cb(f"Scoring response {i+1} via LangChain...")

        response = llm.invoke(prompt.format(answer=transcript)).content

        start = response.find("{")
        end = response.rfind("}") + 1
        clean = response[start:end]

        try:
            data = json.loads(clean)
        except:
            retry = llm.invoke(prompt.format(answer=transcript)).content
            clean = retry[retry.find("{"):retry.rfind("}")+1]
            data = json.loads(clean)

        results.append([row["audio_file"], data["accuracy"], data["depth"], data["reasoning"], data["clarity"], data["feedback"]])

    output_df = pd.DataFrame(results, columns=["audio_file", "accuracy", "depth", "reasoning", "clarity", "feedback"])
    output_df.to_csv(output_csv, index=False)
    progress_cb("✅ Done! Saved AI assessment to assessment_results.csv")