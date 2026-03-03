#!/usr/bin/env python3
"""
Standalone Scoring Script — Verify NRMSE 0.7126

Reads predictions.csv and computes the Normalized Error (NRMSE).
This is the competition metric: MSE(model) / MSE(mean_baseline).
Lower is better. 1.0 = no improvement over always predicting the mean.

Requirements: numpy only (no PyTorch, no model code needed)

Usage:
  python scoring.py
  python scoring.py --predictions ../results/predictions.csv
  python scoring.py --verify          # Also checks file integrity via SHA-256
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path
import numpy as np

# Expected values — pinned for integrity verification
EXPECTED_NRMSE = 0.7126
EXPECTED_SAMPLES = 36575
NRMSE_TOLERANCE = 0.0001  # Floating-point tolerance

# SHA-256 hashes of evidence files (pinned at generation time)
INTEGRITY_HASHES = {
    "predictions.csv": "34c11deb01234594760bbeaeb17190593839b1d04d750a8587adbb05ca51edb6",
}

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    parser = argparse.ArgumentParser(description="Verify NRMSE score from predictions.csv")
    parser.add_argument(
        "--predictions",
        type=str,
        default=str(Path(__file__).parent.parent / "results" / "predictions.csv"),
        help="Path to predictions.csv",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Also verify file integrity via SHA-256 hashes",
    )
    args = parser.parse_args()

    predictions_path = Path(args.predictions)
    if not predictions_path.exists():
        print(f"ERROR: {predictions_path} not found")
        sys.exit(1)

    passed = True

    # --- File integrity check ---
    if args.verify:
        print("=== File Integrity Check ===")
        actual_hash = sha256_file(predictions_path)
        expected_hash = INTEGRITY_HASHES["predictions.csv"]
        if actual_hash == expected_hash:
            print(f"  predictions.csv: PASS (SHA-256 matches)")
        else:
            print(f"  predictions.csv: FAIL")
            print(f"    Expected: {expected_hash}")
            print(f"    Got:      {actual_hash}")
            passed = False

        # Check verification_results.json provenance hashes if available
        results_path = predictions_path.parent / "verification_results.json"
        if results_path.exists():
            with open(results_path) as f:
                results = json.load(f)
            provenance = results.get("provenance", {})
            print(f"  Data hashes (from provenance):")
            print(f"    HFTP data:       {provenance.get('hftp_data_sha256', 'N/A')[:16]}...")
            print(f"    Raw EEG data:    {provenance.get('raw_data_sha256', 'N/A')[:16]}...")
            print(f"    SI checkpoint:   {provenance.get('si_checkpoint_sha256', 'N/A')[:16]}...")
            print(f"    HFTP checkpoint: {provenance.get('hftp_checkpoint_sha256', 'N/A')[:16]}...")
            print(f"  Generated at: {provenance.get('generated_at', 'N/A')}")
            print(f"  Torch version: {provenance.get('torch_version', 'N/A')}")
            print(f"  Seed: {provenance.get('seed', 'N/A')}")
        print()

    # --- Load predictions ---
    data = np.genfromtxt(args.predictions, delimiter=",", skip_header=1)
    predictions = data[:, 2]
    ground_truth = data[:, 3]

    # --- Compute NRMSE (competition metric) ---
    mse = np.mean((predictions - ground_truth) ** 2)
    baseline_mse = np.mean((ground_truth - np.mean(ground_truth)) ** 2)
    normalized_error = mse / baseline_mse

    # Additional metrics
    correlation = np.corrcoef(predictions, ground_truth)[0, 1]
    rmse = np.sqrt(mse)

    print("=== Verification Results ===")
    print(f"  Samples:          {len(predictions)}")
    print(f"  MSE:              {mse:.6f}")
    print(f"  Baseline MSE:     {baseline_mse:.6f}")
    print(f"  Normalized Error: {normalized_error:.5f}  (competition metric, lower is better)")
    print(f"  RMSE:             {rmse:.6f}")
    print(f"  Correlation:      {correlation:.5f}")
    print()

    # --- Assertions ---
    print("=== Assertions ===")

    if len(predictions) == EXPECTED_SAMPLES:
        print(f"  Sample count:     PASS ({EXPECTED_SAMPLES})")
    else:
        print(f"  Sample count:     FAIL (expected {EXPECTED_SAMPLES}, got {len(predictions)})")
        passed = False

    if abs(normalized_error - EXPECTED_NRMSE) < NRMSE_TOLERANCE:
        print(f"  NRMSE:            PASS ({normalized_error:.5f} ≈ {EXPECTED_NRMSE})")
    else:
        print(f"  NRMSE:            FAIL (expected {EXPECTED_NRMSE}, got {normalized_error:.5f})")
        passed = False

    if normalized_error < 1.0:
        improvement = (1 - normalized_error) / (1 - 0.97843)
        print(f"  vs NeurIPS winner: {improvement:.1f}x more improvement (winner: 0.97843)")
    print()

    if passed:
        print("VERIFICATION PASSED")
        sys.exit(0)
    else:
        print("VERIFICATION FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
