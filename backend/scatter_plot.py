import matplotlib
matplotlib.use('Agg') # Crucial: Allows plot generation in backend threads without UI crashes
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import pearsonr, spearmanr

def generate_plot(dataset_csv: str, output_png: str, progress_cb):
    progress_cb("Generating Scatter Plot...")
    df = pd.read_csv(dataset_csv)

    human = df["HumanScore"]
    ai = df["AI_total"]

    pearson_r, _ = pearsonr(human, ai)
    spearman_r, _ = spearmanr(human, ai)

    plt.figure()
    plt.scatter(human, ai)
    plt.plot([0, 20], [0, 20], '--')
    
    plt.xlabel("Human Assessment Score (0–20)")
    plt.ylabel("Automated Assessment Score (0–20)")
    plt.title("Human vs Automated Assessment Scores")

    textstr = f"Pearson r = {pearson_r:.3f}\nSpearman ρ = {spearman_r:.3f}"
    plt.text(0.05, 0.95, textstr, transform=plt.gca().transAxes, verticalalignment='top')

    plt.savefig(output_png, dpi=300, bbox_inches="tight")
    plt.close() # Clean up memory
    
    progress_cb(f"✅ Saved plot to {output_png}")