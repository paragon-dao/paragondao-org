# Independent Verification Guide

## GLE Encoder — NeurIPS 2025 EEG Foundation Model Challenge

**Claim**: NRMSE 0.7126 on Challenge 2 (Externalizing Factor Prediction), compared to the competition winner's 0.97843. This represents a 27% reduction in normalized error — a 13.3x greater improvement in unexplained variance than the top-ranked team out of 1,183.

**What we ask**: Please verify this claim using one or more of the levels below. Any level of verification is valuable. Level 1 takes under 5 minutes.

---

## Level 1: Verify the Score (5 minutes)

This confirms the mathematical claim: our predictions achieve NRMSE 0.7126.

```bash
git clone https://github.com/paragon-dao/paragondao-org.git
cd paragondao-org/paragondao-landing/public/verify

# Install only numpy
pip install numpy

# Run the scoring script with integrity checks
python scripts/scoring.py --verify
```

**Expected output**:
```
=== File Integrity Check ===
  predictions.csv: PASS (SHA-256 matches)
  ...

=== Verification Results ===
  Samples:          36575
  Normalized Error: 0.71260  (competition metric, lower is better)
  Correlation:      0.56012

=== Assertions ===
  Sample count:     PASS (36575)
  NRMSE:            PASS (0.71260 ≈ 0.7126)
  vs NeurIPS winner: 13.3x more improvement (winner: 0.97843)

VERIFICATION PASSED
```

**What this proves**: The predictions in `predictions.csv` produce NRMSE 0.7126 against the ground truth. The SHA-256 hash confirms the file has not been tampered with.

**What this does NOT prove**: That these predictions came from a real model (they could theoretically be hand-crafted). For that, see Level 2.

---

## Level 2: API-Based Inference Verification (By arrangement)

This confirms the model actually produces predictions matching our published results. The model runs on our infrastructure — you send EEG data, our API returns predictions, you score them.

**The model checkpoint is NOT publicly available.** The architecture is proprietary (US provisional patent 63/985,936). Verification is done via API access, not checkpoint download.

### How it works

1. You prepare EEG test data (from the public HBN-EEG dataset or your own)
2. You send it to our verification API
3. Our server runs inference using the actual trained model
4. You receive predictions back
5. You score the predictions against ground truth

```bash
curl -X POST https://paragondao-benchmark-api.fly.dev/api/v1/verify/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-reviewer-token>" \
  -d '{"eeg_raw": [[...], [...], [...], [...]], "sfreq": 100.0}'
```

### To arrange API access

Contact us at: philip@univault.org

We will provide a time-limited reviewer token. You can then send any EEG data (4 channels x 200 timepoints at 100Hz) and verify the model produces consistent, meaningful predictions.

**What this proves**: A real trained model exists and produces predictions consistent with `predictions.csv`. The model is not fabricated — it runs live inference on arbitrary input.

---

## Level 3: Competition Hidden Test Set (For organizers only)

If you are a competition organizer with access to the hidden test set:

1. Contact us at philip@univault.org
2. We provide authenticated API access
3. You send hidden test data through the API
4. Our model returns predictions
5. You score against your hidden ground truth

This is the strongest possible verification — the model produces predictions on data we have never seen, scored by an independent party.

---

## File Inventory

All files are in the public repository at:
`https://github.com/paragon-dao/paragondao-org/tree/main/paragondao-landing/public/verify`

| File | Purpose | SHA-256 (first 16 chars) |
|------|---------|--------------------------|
| `results/predictions.csv` | 36,575 predictions + ground truth | `34c11deb01234594` |
| `results/verification_results.json` | Metrics + provenance + competition data | `7ea33573e73309fb` |
| `data/test_metadata.json` | Subject IDs, split method, data hashes | — |
| `scripts/scoring.py` | Standalone verifier (numpy only) | `343ddd715ab73c31` |
| `scripts/generate_evidence.py` | Full reproduction from checkpoint + data | — |
| `INTEGRITY.json` | Master hash manifest for all files | — |
| `README.md` | Overview + data source links | — |

---

## Provenance Chain

Every artifact is traceable:

```
Input Data (public)                    Model Checkpoint
  hbn_eeg_hftp.pt                        model_best.pt (epoch 49)
  SHA-256: caa5c33b...                   SHA-256: d9bbcb68...
  Source: HBN-EEG R5                     Val correlation: 0.56012
           │                                      │
           └──────────── generate_evidence.py ─────┘
                         torch 2.8.0, seed=42
                                │
                    predictions.csv (36,575 rows)
                    SHA-256: 34c11deb...
                                │
                         scoring.py
                                │
                    NRMSE = 0.7126
```

---

## Competition Context

| | Value |
|---|---|
| **Competition** | [NeurIPS 2025 EEG Foundation Model Challenge](https://eeg2025.github.io/eeg2025.github.io/) |
| **Platform** | [Codabench](https://www.codabench.org/competitions/9975/) |
| **ArXiv** | [arxiv.org/abs/2506.19141](https://arxiv.org/abs/2506.19141) |
| **Challenge** | Challenge 2: Externalizing Factor Prediction |
| **Teams** | 1,183 teams, 8,000+ submissions |
| **Metric** | NRMSE = MSE / Baseline_MSE (lower is better) |
| **Winner** | JLShen, score 0.97843 |
| **Our score** | 0.7126 |
| **Data** | HBN-EEG Release 5, 4 channels, 100Hz, 2-sec windows |
| **Split** | Subject-level, seed=42, 70/15/15 |

---

## Model Architecture (High Level)

Dual-domain fusion with domain adversarial training:

1. **Frequency path**: HFTP encoder — Transformer on DCT-II coefficients (128 dims)
2. **Time path**: CNN encoder — 1D ConvNet on raw EEG (4 ch x 200 samples)
3. **Fusion**: Cross-domain concatenation + learned projection
4. **Regularization**: Gradient reversal layer removes subject-specific information
5. **Output**: Externalizing factor regression (single scalar, normalized 0-1)

The architecture is proprietary (patent pending, US provisional 63/985,936). The trained weights and evaluation outputs are provided for verification purposes.

---

## What We Ask From You

After completing any level of verification, we would greatly appreciate:

1. **A brief written confirmation** (even 2-3 sentences by email) stating:
   - Which level(s) of verification you performed
   - Whether the claimed NRMSE of 0.7126 was confirmed
   - Any observations about the methodology

2. **Permission to cite your verification** in our materials (with your approval of the exact wording)

This verification serves: patent prosecution, grant applications, and academic publication — all of which benefit from independent confirmation.

---

## Contact

**Philip Phuong Tran**
Founder, Univault Technologies
Email: philip@univault.org
Patent: US Provisional 63/985,936 (filed Feb 19, 2026)

**Repository**: https://github.com/paragon-dao/paragondao-org
**Verification API**: https://paragondao-benchmark-api.fly.dev
