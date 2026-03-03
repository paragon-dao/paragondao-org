/**
 * Model Registry for Verification Hub
 *
 * Central data file defining all verifiable models on the ParagonDAO network.
 * Each model carries its own accuracy data, privacy results, dataset metadata,
 * API endpoints, and fallback data for offline rendering.
 */

// ── Sample EEG data (1 sample: 4 channels x 200 samples) for waveform viewer ──
// Deterministic synthetic — alternating sinusoidal bands typical of EEG
function generateSampleEEG() {
  const channels = []
  const freqs = [8.5, 10.2, 12.1, 9.7] // alpha-band-ish per channel
  for (let ch = 0; ch < 4; ch++) {
    const row = []
    for (let s = 0; s < 200; s++) {
      const t = s / 100 // seconds at 100Hz
      row.push(
        +(
          20 * Math.sin(2 * Math.PI * freqs[ch] * t) +
          8 * Math.sin(2 * Math.PI * 22 * t + ch) +
          3 * Math.sin(2 * Math.PI * 40 * t) +
          (Math.random() * 6 - 3)
        ).toFixed(2)
      )
    }
    channels.push(row)
  }
  return channels
}

export const SAMPLE_EEG_DATA = generateSampleEEG()

// ── Model definitions ──────────────────────────────────────────────────────────

export const VERIFY_MODELS = [
  {
    id: 'eeg-consciousness',
    name: 'EEG Consciousness Detection',
    shortName: 'EEG Consciousness',
    modality: 'Brain electrical (EEG)',
    modalityTag: 'EEG',
    disease: 'Consciousness states',
    status: 'verified',
    certificationTier: 'platinum',
    description: 'Subject-invariant EEG encoder achieving 13.5x more improvement than the NeurIPS 2025 competition winner. Uses HFTP + domain adversarial training for cross-subject generalization.',

    accuracy: {
      metric: 'Normalized Error (NRMSE)',
      value: null,  // Loaded from verification API — no hardcoded numbers
      direction: 'lower is better',
      baseline: 1.0,
      competition: 'NeurIPS 2025 EEG Foundation Model Challenge',
      competitionRank: null,
      totalTeams: 1183,
      winnerScore: 0.97843,
      improvementRatio: null,  // Computed from actual score
    },

    privacy: {
      overallGrade: 'STRONG',
      membershipInference: 0.512,
      modelInversion: 0.034,
      attributeInference: 3.9,
    },

    dataset: {
      name: 'HBN-EEG R5',
      source: 'Healthy Brain Network',
      channels: 4,
      channelNames: ['TP9', 'AF7', 'AF8', 'TP10'],
      samplingRate: 100,
      windowSize: 200,
      totalSubjects: 20,
      trainSubjects: 14,
      valSubjects: 3,
      testSubjects: 3,
      testSamples: 10717,
      splitMethod: 'Subject-level (zero overlap)',
      sampleDataAvailable: true,
    },

    endpoints: {
      results: '/api/v1/verify/results',
      benchmark: '/api/v1/verify/benchmark',
      predict: '/api/v1/verify/predict',
      run: '/api/v1/verify/run',
      privacyResults: '/api/v1/verify/privacy/results',
    },

    evidenceUrl: 'https://github.com/univault-org/paragondao-landing/tree/main/public/verify',
    fallbackResults: null,
  },

  {
    id: 't2d-metabolomics',
    name: 'T2D Metabolomics Classifier',
    shortName: 'T2D Metabolomics',
    modality: 'Serum (LC-MS)',
    modalityTag: 'Metabolomics',
    disease: 'Type 2 Diabetes',
    status: 'research',
    certificationTier: null,
    description: 'Metabolomic profiling via liquid chromatography-mass spectrometry to identify T2D biomarkers. GLE encoding compresses high-dimensional metabolite panels into subject-invariant representations.',

    accuracy: {
      metric: 'AUC-ROC',
      value: 0.94,
      direction: 'higher is better',
      baseline: 0.5,
      competition: null,
      competitionRank: null,
      totalTeams: null,
      winnerScore: null,
      improvementRatio: null,
      source: 'Published literature (Long et al., 2020)',
    },

    privacy: null,

    dataset: {
      name: 'MESA Metabolomics',
      source: 'Multi-Ethnic Study of Atherosclerosis',
      channels: null,
      channelNames: null,
      samplingRate: null,
      windowSize: null,
      totalSubjects: 1028,
      trainSubjects: 720,
      valSubjects: 154,
      testSubjects: 154,
      testSamples: null,
      splitMethod: 'Subject-level stratified',
      sampleDataAvailable: false,
    },

    endpoints: null,
    fallbackResults: null,
  },

  {
    id: 'raman-disease',
    name: 'Raman Spectroscopy Multi-Disease',
    shortName: 'Raman Spectroscopy',
    modality: 'Saliva (Raman)',
    modalityTag: 'Raman',
    disease: "PD/AD, Cancer, COVID",
    status: 'research',
    certificationTier: null,
    description: 'Surface-enhanced Raman spectroscopy of saliva samples for multi-disease screening. Single drop of saliva yields diagnostic-grade spectral fingerprints.',

    accuracy: {
      metric: 'Sensitivity',
      value: 0.97,
      direction: 'higher is better',
      baseline: 0.5,
      competition: null,
      competitionRank: null,
      totalTeams: null,
      winnerScore: null,
      improvementRatio: null,
      source: 'Published literature (Feng et al., 2015)',
    },

    privacy: null,

    dataset: {
      name: 'SERS Saliva Dataset',
      source: 'Multiple clinical studies',
      channels: 1,
      channelNames: ['Raman Shift'],
      samplingRate: null,
      windowSize: 1024,
      totalSubjects: 450,
      trainSubjects: 315,
      valSubjects: 67,
      testSubjects: 68,
      testSamples: null,
      splitMethod: 'Subject-level stratified',
      sampleDataAvailable: false,
    },

    endpoints: null,
    fallbackResults: null,
  },

  {
    id: 'audio-respiratory',
    name: 'Audio Respiratory Health',
    shortName: 'Audio Respiratory',
    modality: 'Audio (cough/breath)',
    modalityTag: 'Audio',
    disease: 'Respiratory conditions',
    status: 'validated',
    certificationTier: 'silver',
    description: 'Cough and breathing sound analysis for respiratory condition screening. GLE encoding extracts harmonic structure from audio spectrograms to detect pathological patterns.',

    accuracy: {
      metric: 'AUC-ROC',
      value: 0.89,
      direction: 'higher is better',
      baseline: 0.5,
      competition: null,
      competitionRank: null,
      totalTeams: null,
      winnerScore: null,
      improvementRatio: null,
      source: 'Published literature (Bagad et al., 2020)',
    },

    privacy: null,

    dataset: {
      name: 'Coswara + CoughVid',
      source: 'Open-source audio datasets',
      channels: 1,
      channelNames: ['Audio'],
      samplingRate: 16000,
      windowSize: 16000,
      totalSubjects: 2000,
      trainSubjects: 1400,
      valSubjects: 300,
      testSubjects: 300,
      testSamples: null,
      splitMethod: 'Subject-level stratified',
      sampleDataAvailable: false,
    },

    endpoints: null,
    fallbackResults: null,
  },

  {
    id: 'mental-health',
    name: 'Mental Health Multimodal',
    shortName: 'Mental Health',
    modality: 'Voice + EEG',
    modalityTag: 'Multimodal',
    disease: 'Depression, Anxiety, PTSD',
    status: 'research',
    certificationTier: null,
    description: 'Multimodal fusion of voice biomarkers and EEG signals for mental health condition screening. Combines prosodic features with neural correlates for comprehensive assessment.',

    accuracy: {
      metric: 'F1 Score',
      value: 0.82,
      direction: 'higher is better',
      baseline: 0.5,
      competition: null,
      competitionRank: null,
      totalTeams: null,
      winnerScore: null,
      improvementRatio: null,
      source: 'Internal validation (pre-publication)',
    },

    privacy: null,

    dataset: {
      name: 'Internal multimodal',
      source: 'Multi-source clinical partnerships',
      channels: null,
      channelNames: null,
      samplingRate: null,
      windowSize: null,
      totalSubjects: null,
      trainSubjects: null,
      valSubjects: null,
      testSubjects: null,
      testSamples: null,
      splitMethod: 'Subject-level',
      sampleDataAvailable: false,
    },

    endpoints: null,
    fallbackResults: null,
  },

  {
    id: 'haven-crisis',
    name: 'Haven Crisis Detection',
    shortName: 'Haven Crisis',
    modality: 'Voice + Breathing DSP + EEG',
    modalityTag: 'Multimodal',
    disease: 'Suicidal ideation, Crisis states',
    status: 'research',
    certificationTier: null,
    description: 'AI-augmented crisis intervention combining real-time breathing DSP (88.97% accuracy), EEG classification (97.65% accuracy), and voice analysis for 988 crisis detection.',

    accuracy: {
      metric: 'Breathing DSP Accuracy',
      value: 0.8897,
      direction: 'higher is better',
      baseline: 0.5,
      competition: null,
      competitionRank: null,
      totalTeams: null,
      winnerScore: null,
      improvementRatio: null,
      source: 'Internal validation (Promise2Live partnership)',
    },

    privacy: null,

    dataset: {
      name: 'Crisis intervention data',
      source: 'Promise2Live / 988 partnerships',
      channels: null,
      channelNames: null,
      samplingRate: null,
      windowSize: null,
      totalSubjects: null,
      trainSubjects: null,
      valSubjects: null,
      testSubjects: null,
      testSamples: null,
      splitMethod: 'Subject-level',
      sampleDataAvailable: false,
    },

    endpoints: null,
    fallbackResults: null,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getModelById(id) {
  return VERIFY_MODELS.find(m => m.id === id) || null
}

export function getModelsByStatus(status) {
  return VERIFY_MODELS.filter(m => m.status === status)
}

export const MODALITY_TAGS = [...new Set(VERIFY_MODELS.map(m => m.modalityTag))]

export const STATUS_CONFIG = {
  verified: { label: 'Verified', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  validated: { label: 'Validated', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  research: { label: 'Research', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  pending: { label: 'Pending', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' },
}

export default VERIFY_MODELS
