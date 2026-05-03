import whisper
import os
import csv

AUDIO_FOLDER = "audio"
OUTPUT_CSV = "transcripts.csv"

# audioAnalyzer.py

print("Loading Whisper AI model into memory (this may take 1-2 minutes on CPU)...")

# Load model (choose: tiny, base, small, medium, large)
model = whisper.load_model("small")  # good balance of speed + accuracy

print("✅ Model loaded successfully! Starting transcription...")

results = []

for filename in sorted(os.listdir(AUDIO_FOLDER)):
    if filename.lower().endswith((".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg")):
        filepath = os.path.join(AUDIO_FOLDER, filename)

        print(f"Transcribing: {filename}...")
        result = model.transcribe(filepath, language="en")  # "tl" if Filipino/Tagalog
        text = result["text"].strip()

        results.append([filename, text])

# Save output to CSV
with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["audio_file", "transcript"])
    writer.writerows(results)

print(f"\n✅ Done! Saved transcripts to {OUTPUT_CSV}")
