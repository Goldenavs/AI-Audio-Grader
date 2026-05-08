from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import shutil
import os
import base64
import json
import csv
import asyncio
import threading

# Import your newly refactored modules
import audioAnalyzer
import langchain_scoring
import analysis
import scatter_plot

app = FastAPI()

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
    
    # 1. Setup the Stream Queue
    q = asyncio.Queue()
    loop = asyncio.get_running_loop()

    def progress_cb(message: str):
        payload = json.dumps({"type": "progress", "message": message}) + "\n"
        asyncio.run_coroutine_threadsafe(q.put(payload), loop)

    # 2. File Prep with Safety Net
    try:
        if os.path.exists("audio"):
            shutil.rmtree("audio")
        os.makedirs("audio", exist_ok=True)

        with open("human_scores.csv", "wb") as f:
            shutil.copyfileobj(human_scores.file, f)

        for af in audio_files:
            with open(os.path.join("audio", af.filename), "wb") as f:
                shutil.copyfileobj(af.file, f)
                
    except Exception as e:
        # If disk/file saving fails, queue the error immediately so the frontend handles it cleanly
        q.put_nowait(json.dumps({"type": "error", "message": f"Server File Error: {str(e)}"}) + "\n")
        
        async def fast_fail():
            yield await q.get()
        return StreamingResponse(fast_fail(), media_type="application/x-ndjson")

    # 3. The Background Task
    def run_pipeline():
        try:
            # Execute imported modules as functions
            audioAnalyzer.run_transcription("audio", "transcripts.csv", progress_cb)
            langchain_scoring.run_scoring("transcripts.csv", "assessment_results.csv", progress_cb)
            stats = analysis.run_analysis("human_scores.csv", "assessment_results.csv", "final_dataset.csv", progress_cb)
            scatter_plot.generate_plot("final_dataset.csv", "Figure2_Scatter.png", progress_cb)

            # Package final data
            img_b64 = ""
            if os.path.exists("Figure2_Scatter.png"):
                with open("Figure2_Scatter.png", "rb") as img:
                    img_b64 = base64.b64encode(img.read()).decode("utf-8")

            transcripts_data = []
            if os.path.exists("transcripts.csv"):
                with open("transcripts.csv", "r", encoding="utf-8") as f:
                    transcripts_data = list(csv.DictReader(f))

            stats["plotImageUrl"] = f"data:image/png;base64,{img_b64}"
            stats["transcripts"] = transcripts_data

            # Send final success payload
            payload = json.dumps({"type": "result", "data": stats}) + "\n"
            asyncio.run_coroutine_threadsafe(q.put(payload), loop)

        except Exception as e:
            payload = json.dumps({"type": "error", "message": str(e)}) + "\n"
            asyncio.run_coroutine_threadsafe(q.put(payload), loop)

    # Start the heavy lifting in a separate thread
    threading.Thread(target=run_pipeline, daemon=True).start()

    # 4. Stream consumer yielding to the frontend
    async def event_generator():
        while True:
            chunk = await q.get()
            yield chunk
            if '"type": "result"' in chunk or '"type": "error"' in chunk:
                break

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)