#!/usr/bin/env python3
"""
Standalone Scoring Script — Verify the 0.709 Score

Reads predictions.csv and computes the Normalized Error (NRMSE).
This is the competition metric: MSE(model) / MSE(mean_baseline).
Lower is better. 1.0 = no improvement over always predicting the mean.

Requirements: numpy only (no PyTorch, no model code needed)

Usage:
  python scoring.py
  python scoring.py --predictions ../results/predictions.csv
"""

import argparse
from pathlib import Path
import numpy as np

def main():
    parser = argparse.ArgumentParser(description="Verify NRMSE score from predictions.csv")
    parser.add_argument(
        "--predictions",
        type=str,
        default=str(Path(__file__).parent.parent / "results" / "predictions.csv"),
        help="Path to predictions.csv",
    )
    args = parser.parse_args()

    # Load predictions
    data = np.genfromtxt(args.predictions, delimiter=",", skip_header=1)
    predictions = data[:, 2]
    ground_truth = data[:, 3]

    # Compute NRMSE (competition metric)
    mse = np.mean((predictions - ground_truth) ** 2)
    baseline_mse = np.mean((ground_truth - np.mean(ground_truth)) ** 2)
    normalized_error = mse / baseline_mse

    # Additional metrics
    correlation = np.corrcoef(predictions, ground_truth)[0, 1]
    rmse = np.sqrt(mse)

    print(f"Samples:          {len(predictions)}")
    print(f"MSE:              {mse:.6f}")
    print(f"Baseline MSE:     {baseline_mse:.6f}")
    print(f"Normalized Error: {normalized_error:.5f}  (competition metric, lower is better)")
    print(f"RMSE:             {rmse:.6f}")
    print(f"Correlation:      {correlation:.5f}")

if __name__ == "__main__":
    main()
