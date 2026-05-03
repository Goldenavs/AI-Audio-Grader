from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import subprocess
import base64
import re
import sys

app = FastAPI()

# Allow React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/batch-analyze")
async def batch_analyze(
    human_scores: UploadFile = File(...),
    audio_files: list[UploadFile] = File(...)
):
    print(f"Received {len(audio_files)} audio files and {human_scores.filename}")

    # 1. Clean and Setup Directories
    if os.path.exists("audio"):
        shutil.rmtree("audio")
    os.makedirs("audio", exist_ok=True)

    # 2. Save the Human Scores CSV
    with open("human_scores.csv", "wb") as f:
        shutil.copyfileobj(human_scores.file, f)

    # 3. Save the Audio Files
    for af in audio_files:
        file_path = os.path.join("audio", af.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(af.file, f)

    # 4. Execute the Professor's Pipeline Sequentially
    try:
        print("Running Audio Analyzer...")
        # Use sys.executable instead of "python"
        subprocess.run([sys.executable, "audioAnalyzer.py"], check=True)
        
        print("Running LangChain Scoring...")
        subprocess.run([sys.executable, "langchain_scoring.py"], check=True)
        
        print("Running Statistical Analysis...")
        analysis_process = subprocess.run([sys.executable, "analysis.py"], capture_output=True, text=True, check=True)
        output_text = analysis_process.stdout
        print(output_text)

        print("Generating Scatter Plot...")
        subprocess.run([sys.executable, "scatter_plot.py"], check=True)

    except subprocess.CalledProcessError as e:
        # Extract the hidden error trace if it exists
        error_message = e.stderr if e.stderr else str(e)
        
        # Print it to your backend terminal so YOU can see it
        print(f"\n❌ PIPELINE CRASHED:\n{error_message}")
        
        # Send it to the React frontend so the user sees it
        return {"error": f"Pipeline failed: {error_message}"}

    # main.py (Inside batch_analyze)
    def extract_val(label):
        # Added [-] to the regex to catch negative numbers
        match = re.search(rf"{label}:\s*([-0-9.]+)", output_text) 
        return float(match.group(1)) if match else 0.0

    # 6. Encode the generated plot to Base64 so React can display it instantly
    img_b64 = ""
    if os.path.exists("Figure2_Scatter.png"):
        with open("Figure2_Scatter.png", "rb") as img:
            img_b64 = base64.b64encode(img.read()).decode("utf-8")

    # 7. Return the payload matching the React interface
    return {
        "totalRows": extract_val("Final rows"),
        "pearsonR": extract_val("Pearson r"),
        "pearsonP": extract_val("Pearson p"),
        "spearmanR": extract_val("Spearman r"),
        "spearmanP": extract_val("Spearman p"),
        "meanAbsDiff": round(extract_val("Mean Absolute Difference"), 2),
        "plotImageUrl": f"data:image/png;base64,{img_b64}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)