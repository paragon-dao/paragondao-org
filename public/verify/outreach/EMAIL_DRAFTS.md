# Outreach Email Drafts — EEG Verification

## Email 1: To Competition Organizers

**To**: Pierre Guetschel <pierre.guetschel@donders.ru.nl>, Bruno Aristimunha <b.aristimunha@gmail.com>
**CC**: Sylvain Chevallier <sylvain.a.chevallier@inria.fr>, Arnaud Delorme <arno@sccn.ucsd.edu>
**Subject**: Post-competition result on Challenge 2 — NRMSE 0.7126 (request for verification)

---

Dear Dr. Guetschel and Dr. Aristimunha,

I am writing regarding the NeurIPS 2025 EEG Foundation Model Challenge (Challenge 2: Externalizing Factor Prediction).

We developed a dual-domain encoder that achieves a reproducible NRMSE of 0.7126 on the HBN-EEG dataset, compared to the winning score of 0.97843. The result is deterministic (seed=42), and we have published the full evidence package — including 36,575 per-sample predictions, a standalone scoring script, and SHA-256 provenance hashes — in our public repository:

https://github.com/paragon-dao/paragondao-org/tree/main/paragondao-landing/public/verify

The scoring can be verified in under 5 minutes with only numpy:

```
git clone https://github.com/paragon-dao/paragondao-org.git
cd paragondao-org/paragondao-landing/public/verify
pip install numpy
python scripts/scoring.py --verify
```

We understand the competition submission window is closed, and we respect that the official rankings stand. We are not seeking to retroactively claim a competition placement. Rather, we would welcome any of the following:

1. **Independent verification** — If an organizer could run our scoring script and confirm the result, that would be extremely valuable for our ongoing work (patent prosecution, grant applications).

2. **API-based evaluation** — If you retain access to the hidden test set, we can provide API access to our model. You send EEG data, our server returns predictions, you score them. The model stays on our infrastructure.

3. **Collaboration** — If the result is of scientific interest to your group, we would be open to discussing a joint publication or follow-up study.

Our approach uses a novel frequency-time domain fusion architecture with domain adversarial training for subject invariance. The full verification guide for independent reviewers is here:

https://github.com/paragon-dao/paragondao-org/blob/main/paragondao-landing/public/verify/VERIFICATION_GUIDE.md

Thank you for organizing an excellent challenge. The HBN-EEG benchmark and your evaluation framework were instrumental in validating our encoder.

Best regards,
Philip Phuong Tran
Founder, Univault Technologies
US Provisional Patent 63/985,936

---

## Email 2: To Independent Reviewers

**To**: [reviewer email]
**Subject**: Request for independent verification — EEG cross-subject encoding result (NeurIPS 2025 benchmark)

---

Dear [Prof./Dr. Name],

Your work on [specific work — e.g., "Euclidean Alignment for cross-subject BCI transfer" / "EEGNet" / "variability-robust EEG decoding"] is directly relevant to a result I would like to bring to your attention.

We developed a biosignal encoder called GLE (General Learning Encoder) that achieves NRMSE 0.7126 on the NeurIPS 2025 EEG Foundation Model Challenge (Challenge 2), compared to the winning score of 0.97843 out of 1,183 teams. This represents a 27% reduction in normalized error.

The full evidence — 36,575 per-sample predictions, provenance hashes, and a standalone scoring script — is publicly available:

https://github.com/paragon-dao/paragondao-org/tree/main/paragondao-landing/public/verify

Verification takes under 5 minutes (numpy only):
```
git clone https://github.com/paragon-dao/paragondao-org.git
cd paragondao-org/paragondao-landing/public/verify
pip install numpy
python scripts/scoring.py --verify
```

As an independent authority in EEG/BCI research, your assessment would carry significant weight. Would you be willing to run the verification and provide a brief written confirmation of the result? Even 2-3 sentences would be valuable for our patent prosecution and grant applications.

A detailed verification guide is available here:
https://github.com/paragon-dao/paragondao-org/blob/main/paragondao-landing/public/verify/VERIFICATION_GUIDE.md

I am happy to provide additional technical details, arrange a call, or give API access to the model for deeper evaluation.

Best regards,
Philip Phuong Tran
Founder, Univault Technologies
US Provisional Patent 63/985,936

---

## Personalization Notes

### For Fabien Lotte (fabien.lotte@inria.fr)
- Reference: "Your ERC-funded work on robust BCI decoding"
- Angle: He's at INRIA Bordeaux (separate from Saclay organizers), adds independent French institutional weight

### For Vernon Lawhern (vernon.j.lawhern.civ@mail.mil)
- Reference: "EEGNet, the most widely used compact CNN for EEG-based BCIs"
- Angle: Government/defense credibility, ARL stamp is unique and valuable for Apres-Cyber angle

### For Moritz Grosse-Wentrup (moritz.grosse-wentrup@univie.ac.at)
- Reference: "Your pioneering work on transfer learning in BCIs"
- Angle: University of Vienna, European institutional diversity

---

## Outreach Sequence

| Week | Who | Type | Purpose |
|------|-----|------|---------|
| Week 1 | Pierre Guetschel + Bruno Aristimunha | Organizer | Official challenge team confirmation |
| Week 1 | Fabien Lotte | Independent | Highest-credibility independent BCI expert |
| Week 2 | Vernon Lawhern | Independent | Government/defense credibility |
| Week 2 | Moritz Grosse-Wentrup | Independent | European institutional diversity |
| If needed | Arnaud Delorme (direct) | Organizer | EEGLAB creator, UCSD weight |
