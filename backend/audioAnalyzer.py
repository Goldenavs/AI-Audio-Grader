import whisper
import os
import csv

print("Loading Whisper AI model into RAM... (This will only happen once)")
# Load model globally so it stays in memory between API calls
model = whisper.load_model("small")
print("✅ Whisper Model cached in memory!")

def run_transcription(audio_folder: str, output_csv: str, progress_cb):
    progress_cb("✅ Model is loaded! Starting transcription...")
    results = []
    
    for filename in sorted(os.listdir(audio_folder)):
        if filename.lower().endswith((".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg")):
            filepath = os.path.join(audio_folder, filename)
            
            progress_cb(f"Transcribing: {filename}...")
            result = model.transcribe(filepath, language="en")
            text = result["text"].strip()
            results.append([filename, text])

    with open(output_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["audio_file", "transcript"])
        writer.writerows(results)
        
    progress_cb(f"✅ Done! Saved transcripts to {output_csv}")