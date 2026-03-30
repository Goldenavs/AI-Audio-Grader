from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

# VERY IMPORTANT: CORS tells the browser it is safe for React (port 5173) 
# to talk to this Python server (port 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_audio(
    # We expect an audio file and a human score from the React frontend
    audio: UploadFile = File(...),
    human_score: float = Form(...)
):
    print(f"Received file: {audio.filename}")
    print(f"Received human score: {human_score}")

    # --- PROFESSOR's CODE GOES HERE EVENTUALLY ---
    # 1. Save audio to disk temporarily
    # 2. Transcribe audio to text (ASR)
    # 3. Pass text to LangChain for grading
    # ---------------------------------------------
    
    # Simulating processing time so you can see your React loading state
    time.sleep(2.5) 

    # MOCKING THE AI LOGIC FOR NOW
    mock_ai_score = 85.0
    variance = abs(human_score - mock_ai_score)

    # Return the exact JSON structure our React interface expects
    return {
        "humanScore": human_score,
        "aiScore": mock_ai_score,
        "transcriptionSnippet": f"Successfully received {audio.filename}... Awaiting real LangChain integration.",
        "variance": round(variance, 2)
    }