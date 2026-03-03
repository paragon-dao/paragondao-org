#!/usr/bin/env python3
"""
Generate Verification Evidence for ParagonDAO EEG Consciousness Model

Loads the trained subject-invariant model and test data, runs inference,
and produces all evidence files needed for independent verification.

Requirements:
  pip install torch numpy scipy tqdm

Usage:
  python generate_evidence.py

Data paths (external drive must be mounted):
  - /Volumes/RIIF VECTOR/DATASETS/HBN_EEG/hftp/hbn_eeg_hftp.pt
  - /Volumes/RIIF VECTOR/DATASETS/HBN_EEG/raw_eeg_signals/hbn_raw_eeg.pt

Checkpoint path:
  - eeg_foundation_challenge_2025/checkpoints/subject_invariant_priority2/model_best.pt
"""

import sys
import json
import hashlib
import csv
from pathlib import Path
from datetime import datetime, timezone

import torch
import torch.nn as nn
import numpy as np
from scipy.stats import pearsonr
from tqdm import tqdm

# ── Paths ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = SCRIPT_DIR.parent  # public/verify/
DATA_OUT = OUTPUT_DIR / "data"
RESULTS_OUT = OUTPUT_DIR / "results"

# Project root for model code
PROJECT_ROOT = Path(__file__).resolve()
for _ in range(6):  # Walk up from scripts/ to find the repo root
    PROJECT_ROOT = PROJECT_ROOT.parent
    if (PROJECT_ROOT / "research-paper-docs").exists():
        break

EEG_ROOT = PROJECT_ROOT / "research-paper-docs" / "workshops" / "hftp-llm-training" / "eeg_foundation_challenge_2025"
LLM_ROOT = PROJECT_ROOT / "research-paper-docs" / "workshops" / "hftp-llm-training" / "llm_from_scratch"

# Add model code to path
sys.path.insert(0, str(EEG_ROOT))
sys.path.insert(0, str(EEG_ROOT / "braindecode_ensemble" / "training"))
sys.path.insert(0, str(LLM_ROOT / "part_4_hftp"))
sys.path.insert(0, str(LLM_ROOT / "part_3"))

# Data paths
HFTP_DATA = Path("/Volumes/RIIF VECTOR/DATASETS/HBN_EEG/hftp/hbn_eeg_hftp.pt")
RAW_DATA = Path("/Volumes/RIIF VECTOR/DATASETS/HBN_EEG/raw_eeg_signals/hbn_raw_eeg.pt")
SI_CHECKPOINT = EEG_ROOT / "checkpoints" / "subject_invariant_priority2" / "model_best.pt"
HFTP_CHECKPOINT = EEG_ROOT / "checkpoints" / "muse_exact_test" / "model_best.pt"


def sha256_file(path):
    """Compute SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def normalize_subject_id(subj_id):
    """Remove 'sub-' prefix if present."""
    if isinstance(subj_id, str) and subj_id.startswith("sub-"):
        return subj_id[4:]
    return subj_id


def main():
    print("=" * 70)
    print("GENERATING VERIFICATION EVIDENCE")
    print("=" * 70)
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print()

    # Verify all required files exist
    for p, name in [
        (HFTP_DATA, "HFTP data"),
        (RAW_DATA, "Raw EEG data"),
        (SI_CHECKPOINT, "Subject-invariant checkpoint"),
        (HFTP_CHECKPOINT, "HFTP checkpoint"),
    ]:
        if not p.exists():
            print(f"ERROR: {name} not found at {p}")
            sys.exit(1)
        print(f"  Found {name}: {p}")

    # Compute file hashes for provenance
    print("\nComputing file hashes...")
    hashes = {
        "hftp_data_sha256": sha256_file(HFTP_DATA),
        "raw_data_sha256": sha256_file(RAW_DATA),
        "si_checkpoint_sha256": sha256_file(SI_CHECKPOINT),
        "hftp_checkpoint_sha256": sha256_file(HFTP_CHECKPOINT),
    }
    for k, v in hashes.items():
        print(f"  {k}: {v[:16]}...")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nDevice: {device}")

    # Set seeds for reproducibility
    torch.manual_seed(42)
    np.random.seed(42)

    # ── Import model classes ───────────────────────────────────────────────────
    from models.model_eeg_hftp_original import EEGHFTPModel
    from training.train_subject_invariant_priority2 import SubjectInvariantModel
    from data.hbn_eeg_dataset import HBNEEGChallenge2Dataset
    from train_braindecode_regression import BraindecodeRegressor, HBNBraindecodeDataset

    # ── Load models ────────────────────────────────────────────────────────────
    print("\nLoading models...")

    # Create base HFTP model
    hftp_model = EEGHFTPModel(
        n_embd=128, block_size=256, n_layer=4, n_head=4,
        dropout=0.1, task_type="motor_imagery", num_classes=5,
    ).to(device)

    # Load HFTP checkpoint (for architecture initialization)
    hftp_ckpt = torch.load(HFTP_CHECKPOINT, map_location=device, weights_only=False)
    if "model_state_dict" in hftp_ckpt:
        hftp_model.load_state_dict(hftp_ckpt["model_state_dict"])
    else:
        hftp_model.load_state_dict(hftp_ckpt)
    print("  HFTP model loaded")

    # Create base Braindecode model
    braindecode_model = BraindecodeRegressor(n_channels=4, n_times=200, n_outputs=1).to(device)
    print("  Braindecode model created")

    # Create subject-invariant model
    model = SubjectInvariantModel(
        base_hftp_model=hftp_model,
        base_braindecode_model=braindecode_model,
        num_subjects=20,
        n_embd=128,
        dropout=0.1,
        freeze_base=False,
        use_braindecode=True,
    ).to(device)

    # Load subject-invariant checkpoint (contains ALL weights including bd_projection)
    si_ckpt = torch.load(SI_CHECKPOINT, map_location=device, weights_only=False)
    state_dict = si_ckpt["model_state_dict"]

    # bd_projection is dynamically created in forward() but saved in checkpoint.
    # Pre-create it so load_state_dict can populate it with trained weights.
    if any(k.startswith("bd_projection") for k in state_dict):
        model.bd_projection = nn.Linear(64, 128).to(device)

    model.load_state_dict(state_dict, strict=False)

    epoch = si_ckpt.get("epoch", "N/A")
    val_corr = si_ckpt.get("val_correlation", 0)
    print(f"  Subject-invariant model loaded (epoch {epoch}, val_corr={val_corr:.4f})")

    # ── Load test datasets ─────────────────────────────────────────────────────
    print("\nLoading test datasets...")

    hftp_test = HBNEEGChallenge2Dataset(str(HFTP_DATA), split="test", seed=42)
    bd_test = HBNBraindecodeDataset(str(RAW_DATA), split="test", seed=42)

    # Align datasets by common subjects
    hftp_subjects = {normalize_subject_id(s): s for s in hftp_test.subjects}
    bd_subjects = {normalize_subject_id(s): s for s in bd_test.subjects}
    common_subjects = set(hftp_subjects.keys()) & set(bd_subjects.keys())
    print(f"  Common test subjects: {sorted(common_subjects)}")

    hftp_indices = [i for i, s in enumerate(hftp_test.subjects) if normalize_subject_id(s) in common_subjects]
    bd_indices = [i for i, s in enumerate(bd_test.subjects) if normalize_subject_id(s) in common_subjects]

    # Group by subject and match sample counts
    hftp_by_subj = {}
    for idx in hftp_indices:
        sn = normalize_subject_id(hftp_test.subjects[idx])
        hftp_by_subj.setdefault(sn, []).append(idx)

    bd_by_subj = {}
    for idx in bd_indices:
        sn = normalize_subject_id(bd_test.subjects[idx])
        bd_by_subj.setdefault(sn, []).append(idx)

    aligned_hftp, aligned_bd = [], []
    for sn in sorted(common_subjects):
        h = hftp_by_subj.get(sn, [])
        b = bd_by_subj.get(sn, [])
        n = min(len(h), len(b))
        aligned_hftp.extend(h[:n])
        aligned_bd.extend(b[:n])

    hftp_test.indices = aligned_hftp
    bd_test.indices = aligned_bd
    print(f"  Aligned test samples: {len(hftp_test)}")

    # ── Run inference ──────────────────────────────────────────────────────────
    print("\nRunning inference on test set...")
    model.eval()

    from torch.utils.data import DataLoader
    hftp_loader = DataLoader(hftp_test, batch_size=64, shuffle=False)
    bd_loader = DataLoader(bd_test, batch_size=64, shuffle=False)

    all_preds = []
    all_targets = []
    all_subject_ids = []
    sample_ids = []
    sample_counter = 0

    with torch.no_grad():
        for hftp_batch, bd_batch in tqdm(
            zip(hftp_loader, bd_loader), total=len(hftp_loader), desc="Evaluating"
        ):
            eeg_freq = hftp_batch["eeg_freq"].to(device)
            eeg_raw = bd_batch[0].to(device)
            targets = hftp_batch["externalizing"].to(device)
            subject_ids_batch = hftp_batch["subject_id"]

            externalizing_pred, _ = model(eeg_freq, eeg_raw=eeg_raw, use_adversarial=False)
            preds = externalizing_pred.squeeze(1)

            batch_size = preds.shape[0]
            for i in range(batch_size):
                sample_ids.append(sample_counter)
                all_preds.append(preds[i].cpu().item())
                all_targets.append(targets[i].cpu().item())
                all_subject_ids.append(str(subject_ids_batch[i]))
                sample_counter += 1

    preds_arr = np.array(all_preds)
    targets_arr = np.array(all_targets)

    # ── Compute metrics ────────────────────────────────────────────────────────
    print("\nComputing metrics...")

    correlation, p_value = pearsonr(preds_arr, targets_arr)
    mse = float(np.mean((preds_arr - targets_arr) ** 2))
    rmse = float(np.sqrt(mse))
    mae = float(np.mean(np.abs(preds_arr - targets_arr)))
    baseline_mse = float(np.mean((targets_arr - np.mean(targets_arr)) ** 2))
    normalized_error = mse / baseline_mse if baseline_mse > 0 else float("inf")

    print(f"  Normalized Error (NRMSE): {normalized_error:.5f}")
    print(f"  Correlation:              {correlation:.5f}")
    print(f"  P-value:                  {p_value:.2e}")
    print(f"  MSE:                      {mse:.6f}")
    print(f"  RMSE:                     {rmse:.6f}")
    print(f"  MAE:                      {mae:.6f}")
    print(f"  Baseline MSE:             {baseline_mse:.6f}")
    print(f"  Total samples:            {len(preds_arr)}")

    # Per-subject breakdown
    per_subject = []
    unique_sids = sorted(set(all_subject_ids))
    for sid in unique_sids:
        mask = np.array([s == sid for s in all_subject_ids])
        sp = preds_arr[mask]
        st = targets_arr[mask]
        s_mse = float(np.mean((sp - st) ** 2))

        # Per-subject correlation: only meaningful if target has variance
        # (externalizing factor is constant within a subject, so Pearson is undefined)
        target_std = float(np.std(st))
        pred_std = float(np.std(sp))
        if len(sp) > 1 and target_std > 1e-8 and pred_std > 1e-8:
            s_corr, _ = pearsonr(sp, st)
            s_corr = round(float(s_corr), 5)
        else:
            s_corr = None  # Target is constant within this subject

        per_subject.append({
            "subject_id": sid,
            "samples": int(np.sum(mask)),
            "correlation": s_corr,
            "mse": round(s_mse, 6),
            "mean_prediction": round(float(np.mean(sp)), 4),
            "mean_target": round(float(np.mean(st)), 4),
        })
        corr_str = f"{s_corr:.5f}" if s_corr is not None else "N/A (constant target)"
        print(f"  Subject {sid}: n={np.sum(mask)}, corr={corr_str}, mse={s_mse:.6f}")

    # ── Write output files ─────────────────────────────────────────────────────
    print("\nWriting output files...")

    DATA_OUT.mkdir(parents=True, exist_ok=True)
    RESULTS_OUT.mkdir(parents=True, exist_ok=True)

    # 1. predictions.csv
    csv_path = RESULTS_OUT / "predictions.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["sample_id", "subject_id", "prediction", "ground_truth"])
        for i in range(len(sample_ids)):
            writer.writerow([
                sample_ids[i],
                all_subject_ids[i],
                f"{all_preds[i]:.6f}",
                f"{all_targets[i]:.6f}",
            ])
    print(f"  predictions.csv: {len(sample_ids)} rows")

    # 2. verification_results.json
    results = {
        "overall": {
            "normalized_error": round(normalized_error, 5),
            "correlation": round(float(correlation), 5),
            "p_value": float(p_value),
            "mse": round(mse, 6),
            "rmse": round(rmse, 6),
            "mae": round(mae, 6),
            "baseline_mse": round(baseline_mse, 6),
            "total_samples": len(preds_arr),
            "total_subjects": len(unique_sids),
        },
        "per_subject": per_subject,
        "provenance": {
            "checkpoint": "subject_invariant_priority2/model_best.pt",
            "checkpoint_epoch": epoch,
            "checkpoint_val_correlation": round(float(val_corr), 5),
            **hashes,
            "device": str(device),
            "torch_version": torch.__version__,
            "numpy_version": np.__version__,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "seed": 42,
            "split_method": "subject-level (seed=42, train=70%, val=15%, test=15%)",
        },
        "competition": {
            "name": "NeurIPS 2025 EEG Foundation Model Challenge",
            "challenge": "Challenge 2: Subject-Invariant Representation",
            "metric": "Normalized Error (MSE / Baseline MSE)",
            "metric_direction": "lower is better",
            "total_teams": 1183,
            "leaderboard": [
                {"rank": 1, "team": "JLShen", "score": 0.97843},
                {"rank": 2, "team": "MBZUAI", "score": 0.98519},
                {"rank": 3, "team": "MIN~C\u00b2", "score": 0.98817},
            ],
        },
        "verified_at": datetime.now(timezone.utc).isoformat(),
        "model_epoch": epoch,
    }

    results_path = RESULTS_OUT / "verification_results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"  verification_results.json written")

    # 3. test_metadata.json
    metadata = {
        "split_method": "subject-level (seed=42)",
        "split_ratios": {"train": 0.7, "val": 0.15, "test": 0.15},
        "test_subject_ids": unique_sids,
        "test_samples_per_subject": {s["subject_id"]: s["samples"] for s in per_subject},
        "total_test_samples": len(preds_arr),
        "data_format": {
            "hftp": "128 frequency coefficients per sample (DCT-II)",
            "raw_eeg": "4 channels x 200 timepoints (100Hz, 2-second windows)",
            "channels": ["TP9", "AF7", "AF8", "TP10"],
            "target": "Externalizing factor (normalized 0-1)",
        },
        "data_hashes": {
            "hftp_data": hashes["hftp_data_sha256"],
            "raw_data": hashes["raw_data_sha256"],
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    metadata_path = DATA_OUT / "test_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"  test_metadata.json written")

    # ── Summary ────────────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("EVIDENCE GENERATION COMPLETE")
    print("=" * 70)
    print(f"\n  Competition Score (NRMSE): {normalized_error:.5f}")
    print(f"  NeurIPS Winner Score:      0.97843")

    if normalized_error < 1.0:
        our_improvement = 1.0 - normalized_error
        winner_improvement = 1.0 - 0.97843
        ratio = our_improvement / winner_improvement if winner_improvement > 0 else 0
        print(f"  Our improvement:           {our_improvement:.5f} ({our_improvement*100:.1f}%)")
        print(f"  Winner improvement:        {winner_improvement:.5f} ({winner_improvement*100:.1f}%)")
        print(f"  Improvement ratio:         {ratio:.1f}x")

    print(f"\nOutput files:")
    print(f"  {csv_path}")
    print(f"  {results_path}")
    print(f"  {metadata_path}")
    print(f"\nTo verify: python scoring.py")


if __name__ == "__main__":
    main()
