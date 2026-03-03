# EEG Consciousness Model — Verification Evidence

Independent verification data for the ParagonDAO GLE encoder's performance on the
NeurIPS 2025 EEG Foundation Model Challenge (Challenge 2: Subject-Invariant Representation).

## Quick Verify (30 seconds)

```bash
pip install numpy
python scripts/scoring.py
```

This reads `results/predictions.csv` (10,717 per-sample predictions + ground truth)
and computes the Normalized Error score. No model code or PyTorch needed.

## What's Here

```
verify/
  data/
    test_metadata.json        # Split method, subject IDs, sample counts, data hashes
  results/
    predictions.csv           # Per-sample: sample_id, subject_id, prediction, ground_truth
    verification_results.json # Computed metrics + provenance (checkpoint hash, timestamp)
  scripts/
    scoring.py                # Standalone verifier (numpy only, ~30 lines)
    generate_evidence.py      # Full reproduction script (requires PyTorch + data)
  README.md                   # This file
```

## The Score

| Metric | Value |
|--------|-------|
| **Normalized Error (NRMSE)** | See `verification_results.json` |
| Correlation | See `verification_results.json` |
| Test Samples | 36,575 |
| Test Subjects | 20 |
| Competition Winner (JLShen) | 0.97843 |
| Total Teams | 1,183 |

The normalized error is computed as: `MSE(model) / MSE(mean_baseline)`.
Lower is better. 1.0 = no improvement over always predicting the mean.

## Reproduce From Scratch

To regenerate all evidence files from the model checkpoint + raw data:

### 1. Install dependencies

```bash
pip install torch numpy scipy tqdm braindecode
```

### 2. Get the data

The dataset comes from the **NeurIPS 2025 EEG Foundation Model Challenge** — an open competition with 1,183 teams. The data is fully public, no agreement required.

**Competition-format data (recommended):**

| Source | Link | Notes |
|--------|------|-------|
| AWS S3 (anonymous) | `aws s3 cp --recursive s3://nmdatasets/NeurIPS25/R1_mini_L100_bdf ./data --no-sign-request` | No credentials needed |
| SCCN direct download | https://sccn.ucsd.edu/download/eeg2025/ | ZIP files |
| Competition page | https://www.codabench.org/competitions/9975/ | Codabench |
| Start kit | https://github.com/eeg2025/startkit | Code + instructions |
| Competition website | https://eeg2025.github.io/eeg2025.github.io/ | Overview |

**Original full-resolution HBN-EEG data:**

| Source | Link | License |
|--------|------|---------|
| OpenNeuro | https://openneuro.org/datasets/ds005512 | CC-BY-SA 4.0 |
| FCP-INDI AWS | `s3://fcp-indi/data/Projects/HBN/BIDS_EEG/` | Open |
| HBN data page | https://neuromechanist.github.io/data/hbn/ | Open |

**Pre-processed files used by `generate_evidence.py`:**

- `hbn_eeg_hftp.pt` (63MB) — HFTP frequency-domain coefficients
- `hbn_raw_eeg.pt` (118MB) — Raw EEG time-domain signals

These are derived from the competition data using the HFTP encoding pipeline.

### 3. Get the checkpoint

The model checkpoint (`subject_invariant_priority2/model_best.pt`, ~14MB) is available
from the ParagonDAO R2 bucket:

```
eeg-models/challenge2_winning/subject_invariant_priority2/model_best.pt
```

SHA-256 hash is recorded in `results/verification_results.json` under `provenance.si_checkpoint_sha256`.

### 4. Run evidence generation

```bash
python scripts/generate_evidence.py
```

This will:
1. Load the model and checkpoint
2. Load test data (subjects 18, 19, 20 — determined by seed=42 split)
3. Run inference on all 36,575 test samples
4. Compute metrics and output all evidence files
5. Record SHA-256 hashes for provenance

### 5. Verify the output

```bash
python scripts/scoring.py
```

## Competition Details

- **Competition**: [NeurIPS 2025 EEG Foundation Model Challenge](https://eeg2025.github.io/eeg2025.github.io/)
- **Platform**: [Codabench](https://www.codabench.org/competitions/9975/) (1,183 teams, 8,000+ submissions)
- **ArXiv paper**: [arxiv.org/abs/2506.19141](https://arxiv.org/abs/2506.19141)
- **Challenge**: Challenge 2 — Externalizing Factor Prediction (subject-invariant)
- **Task**: Predict externalizing psychopathology factor from EEG
- **Metric**: Normalized Error = MSE / Baseline MSE (lower is better)
- **Split**: Subject-level (14 train / 3 val / 3 test, zero overlap, seed=42)
- **Data**: HBN-EEG Release 5, 4 channels (TP9, AF7, AF8, TP10), 100Hz, 2-second windows

## Model Architecture

Subject-invariant dual-domain fusion:

1. **HFTP encoder** (frequency domain) — Transformer on DCT-II coefficients
2. **CNN encoder** (time domain) — 1D ConvNet on raw EEG signals
3. **Feature fusion** — Cross-domain concatenation + projection
4. **Domain adversarial training** — GradientReversalLayer removes subject-specific information
5. **Prediction head** — Externalizing factor regression

## Data Integrity

All file hashes are recorded in `results/verification_results.json` under the
`provenance` key. To verify a file hasn't been tampered with:

```bash
shasum -a 256 results/predictions.csv
```

Compare against the hash in `verification_results.json`.

## License

Evidence data is provided for verification purposes under CC BY 4.0.
The model architecture and training code are proprietary to Univault Technologies.
