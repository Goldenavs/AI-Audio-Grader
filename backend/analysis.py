import pandas as pd
from scipy.stats import pearsonr, spearmanr

human = pd.read_csv("human_scores.csv")
ai = pd.read_csv("assessment_results.csv")

# Normalize filenames
human["audio_file"] = human["audio_file"].astype(str).str.strip().str.lower()
ai["audio_file"] = ai["audio_file"].astype(str).str.strip().str.lower()

# Compute AI total
ai["AI_total"] = ai["accuracy"] + ai["depth"] + ai["reasoning"] + ai["clarity"]

# Use INNER merge (matched only)
merged = pd.merge(human, ai, on="audio_file", how="inner")

merged.to_csv("final_dataset.csv", index=False)

human_total = merged["HumanScore"]
ai_total = merged["AI_total"]

r, p = pearsonr(human_total, ai_total)
sr, sp = spearmanr(human_total, ai_total)

diff = abs(human_total - ai_total)

print("Final rows:", len(merged))
print("Pearson r:", r)
print("Pearson p:", p)
print("Spearman r:", sr)
print("Spearman p:", sp)
print("Mean Absolute Difference:", diff.mean())

print("✅ Saved final_dataset.csv")