import pandas as pd
from scipy.stats import pearsonr, spearmanr
import math

def run_analysis(human_csv: str, ai_csv: str, output_csv: str, progress_cb):
    progress_cb("Starting statistical merge...")
    human = pd.read_csv(human_csv)
    ai = pd.read_csv(ai_csv)

    # Normalize filenames to ensure they match perfectly
    human["audio_file"] = human["audio_file"].astype(str).str.strip().str.lower()
    ai["audio_file"] = ai["audio_file"].astype(str).str.strip().str.lower()
    
    # Calculate total AI score
    ai["AI_total"] = ai["accuracy"] + ai["depth"] + ai["reasoning"] + ai["clarity"]

    # Merge datasets based on matching audio filenames
    merged = pd.merge(human, ai, on="audio_file", how="inner")
    merged.to_csv(output_csv, index=False)

    human_total = merged["HumanScore"]
    ai_total = merged["AI_total"]

    # --- 1. SAFE CORRELATION MATH ---
    if len(merged) > 1:
        # Prevent SciPy ConstantInputWarning if all scores are identical
        if human_total.nunique() == 1 or ai_total.nunique() == 1:
            r, p, sr, sp = 0.0, 0.0, 0.0, 0.0
        else:
            r, p = pearsonr(human_total, ai_total)
            sr, sp = spearmanr(human_total, ai_total)
    else:
        r, p, sr, sp = 0.0, 0.0, 0.0, 0.0

    # --- 2. DEFINE THE DIFF VARIABLE (This was missing!) ---
    diff = abs(human_total - ai_total)
    progress_cb(f"Matched {len(merged)} rows. Analysis complete.")
    
    # --- 3. SAFE MEAN CALCULATION ---
    diff_mean = float(diff.mean())
    if pd.isna(diff_mean):
        diff_mean = 0.0
        
    return {
        "totalRows": int(len(merged)),
        "pearsonR": float(r) if not pd.isna(r) else 0.0,
        "pearsonP": float(p) if not pd.isna(p) else 0.0,
        "spearmanR": float(sr) if not pd.isna(sr) else 0.0,
        "spearmanP": float(sp) if not pd.isna(sp) else 0.0,
        "meanAbsDiff": round(diff_mean, 2)
    }