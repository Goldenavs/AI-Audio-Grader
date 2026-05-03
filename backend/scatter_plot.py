import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import pearsonr, spearmanr

# Load dataset
df = pd.read_csv("final_dataset.csv")

human = df["HumanScore"]
ai = df["AI_total"]

# Compute correlations
pearson_r, _ = pearsonr(human, ai)
spearman_r, _ = spearmanr(human, ai)

# Create scatter plot
plt.figure()
plt.scatter(human, ai)

# Reference line y = x (perfect agreement)
plt.plot([0, 20], [0, 20], '--')

# Axis labels
plt.xlabel("Human Assessment Score (0–20)")
plt.ylabel("Automated Assessment Score (0–20)")

# Optional title
plt.title("Human vs Automated Assessment Scores")

# Add correlation text inside plot (top-left)
textstr = f"Pearson r = {pearson_r:.3f}\nSpearman ρ = {spearman_r:.3f}"
plt.text(0.05, 0.95, textstr, transform=plt.gca().transAxes,
         verticalalignment='top')

# Save high-resolution figure
plt.savefig("Figure2_Scatter.png", dpi=300, bbox_inches="tight")

# Show plot
# plt.show()