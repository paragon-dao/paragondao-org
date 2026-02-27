// Mock data for the Builder Flow: Forge, Exchange, and Proof Pipeline
// Status state machine: registered → uploading → uploaded → benchmark_queued → verification_in_progress → verified → certification_awarded → published

export const MODEL_STATUSES = {
  registered: { label: 'Registered', color: '#94a3b8', dot: 'gray' },
  uploading: { label: 'Uploading', color: '#f59e0b', dot: 'amber-pulse' },
  uploaded: { label: 'Uploaded', color: '#f59e0b', dot: 'amber' },
  benchmark_queued: { label: 'Queued', color: '#f59e0b', dot: 'amber-pulse' },
  verification_in_progress: { label: 'Verifying', color: '#6366f1', dot: 'indigo-pulse' },
  verified: { label: 'Verified', color: '#10b981', dot: 'green' },
  certification_awarded: { label: 'Certified', color: '#10b981', dot: 'green' },
  published: { label: 'Published', color: '#10b981', dot: 'green' },
  failed: { label: 'Failed', color: '#ef4444', dot: 'red' },
}

export const CERTIFICATION_TIERS = {
  bronze: {
    label: 'Bronze',
    color: '#CD7F32',
    bg: 'rgba(205,127,50,0.12)',
    border: 'rgba(205,127,50,0.3)',
    requirement: 'Baseline accuracy >70%',
    minAccuracy: 0.70,
  },
  silver: {
    label: 'Silver',
    color: '#C0C0C0',
    bg: 'rgba(192,192,192,0.12)',
    border: 'rgba(192,192,192,0.3)',
    requirement: 'Cross-dataset generalization >80%',
    minAccuracy: 0.80,
  },
  gold: {
    label: 'Gold',
    color: '#f0bb33',
    bg: 'rgba(240,187,51,0.12)',
    border: 'rgba(240,187,51,0.3)',
    requirement: 'Subject-invariant performance >90%',
    minAccuracy: 0.90,
  },
  platinum: {
    label: 'Platinum',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    badgeColor: '#f0bb33',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.3)',
    requirement: 'Independent replication >95%',
    minAccuracy: 0.95,
  },
}

export const BENCHMARKS = [
  {
    id: 'neurips-eeg',
    name: 'NeurIPS EEG Benchmark',
    description: 'Standard EEG classification benchmark from NeurIPS 2024 competition',
    subjects: 10,
    metrics: ['accuracy', 'f1_score', 'auc_roc', 'subject_invariance'],
  },
  {
    id: 'mesa-sleep',
    name: 'MESA Sleep Staging',
    description: 'Multi-Ethnic Study of Atherosclerosis polysomnography benchmark',
    subjects: 2056,
    metrics: ['accuracy', 'cohen_kappa', 'per_stage_f1'],
  },
  {
    id: 'stress-test',
    name: 'Subject Invariance Stress Test',
    description: 'Leave-one-subject-out cross-validation across all available datasets',
    subjects: 50,
    metrics: ['worst_subject_accuracy', 'variance', 'generalization_gap'],
  },
]

export const VALIDATORS = [
  { id: 'v1', name: 'ParagonDAO Primary', location: 'Salt Lake City, UT', stake: '50,000 PGON' },
  { id: 'v2', name: 'NeuroVerify Labs', location: 'Boston, MA', stake: '35,000 PGON' },
  { id: 'v3', name: 'BioSignal Collective', location: 'Berlin, DE', stake: '42,000 PGON' },
  { id: 'v4', name: 'Pacific Neural Trust', location: 'Singapore', stake: '28,000 PGON' },
  { id: 'v5', name: 'Alpine Verification', location: 'Zurich, CH', stake: '31,000 PGON' },
]

function makeOnChainRecord(modelId, certTier, timestamp) {
  const hash = `0x${modelId.replace(/[^a-f0-9]/gi, '').padEnd(40, 'a').slice(0, 40)}`
  return {
    txHash: hash,
    blockNumber: 18_000_000 + Math.floor(Math.random() * 100_000),
    timestamp,
    network: 'Ethereum Mainnet (Simulated)',
    contract: '0x7a3B...ParagonVerify',
    certificationTier: certTier,
    validatorSignatures: VALIDATORS.slice(0, 5).map(v => ({
      validator: v.name,
      signature: `0x${v.id}sig...${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date(timestamp.getTime() + Math.random() * 60000).toISOString(),
    })),
    ipfsHash: `Qm${modelId.replace(/[^a-zA-Z0-9]/g, '').padEnd(44, 'X').slice(0, 44)}`,
  }
}

// 3 models for the Forge (builder's own dashboard)
export const forgeModels = [
  {
    id: 'forge-001',
    name: 'Sleep-Stage Classifier v3',
    modality: 'EEG',
    disease: 'Sleep Disorders',
    architecture: 'Transformer + GLE',
    dataset: 'MESA + SHHS combined (n=4,112)',
    claimedAccuracy: 0.967,
    status: 'published',
    certificationTier: 'platinum',
    submittedAt: new Date('2026-02-10T09:00:00Z'),
    verifiedAt: new Date('2026-02-10T09:12:00Z'),
    publishedAt: new Date('2026-02-11T14:00:00Z'),
    benchmarkResults: {
      'neurips-eeg': { accuracy: 0.967, f1_score: 0.961, auc_roc: 0.993, subject_invariance: 0.952 },
      'mesa-sleep': { accuracy: 0.943, cohen_kappa: 0.921, per_stage_f1: [0.96, 0.94, 0.91, 0.95, 0.93] },
      'stress-test': { worst_subject_accuracy: 0.912, variance: 0.0018, generalization_gap: 0.023 },
    },
    onChain: makeOnChainRecord('forge001sleepstage', 'platinum', new Date('2026-02-10T09:12:00Z')),
    listing: {
      description: 'State-of-the-art sleep staging with subject-invariant GLE encoding. Achieves Platinum certification with 96.7% accuracy across 4,112 subjects.',
      license: 'ParagonDAO Open Research License',
      tags: ['sleep', 'eeg', 'polysomnography', 'clinical-grade'],
      downloads: 1847,
      citations: 12,
    },
  },
  {
    id: 'forge-002',
    name: 'Epilepsy Spike Detector',
    modality: 'EEG',
    disease: 'Epilepsy',
    architecture: 'CNN-LSTM Hybrid',
    dataset: 'TUH Epilepsy Corpus (n=580)',
    claimedAccuracy: 0.841,
    status: 'verified',
    certificationTier: 'silver',
    submittedAt: new Date('2026-02-20T11:00:00Z'),
    verifiedAt: new Date('2026-02-20T11:08:00Z'),
    benchmarkResults: {
      'neurips-eeg': { accuracy: 0.841, f1_score: 0.823, auc_roc: 0.912, subject_invariance: 0.801 },
    },
    onChain: makeOnChainRecord('forge002epilepsy', 'silver', new Date('2026-02-20T11:08:00Z')),
  },
  {
    id: 'forge-003',
    name: 'Breathing Anomaly Detector v1',
    modality: 'Audio',
    disease: 'Respiratory',
    architecture: 'GLE Encoder + Attention',
    dataset: 'Internal breathing dataset (n=320)',
    claimedAccuracy: 0.78,
    status: 'verification_in_progress',
    certificationTier: null,
    submittedAt: new Date('2026-02-26T16:00:00Z'),
    verificationProgress: 0.62,
    benchmarkResults: null,
    onChain: null,
  },
]

// 8 models for the Exchange (public marketplace)
export const exchangeModels = [
  {
    id: 'ex-001',
    name: 'GLE Sleep Classifier',
    builder: 'ParagonDAO',
    builderVerified: true,
    modality: 'EEG',
    disease: 'Sleep Disorders',
    architecture: 'GLE + Transformer',
    certificationTier: 'platinum',
    accuracy: 0.967,
    subjectInvariance: 0.952,
    publishedAt: new Date('2026-02-11T14:00:00Z'),
    onChain: makeOnChainRecord('ex001glesleep', 'platinum', new Date('2026-02-11T14:00:00Z')),
    listing: {
      description: 'The reference implementation. ParagonDAO\'s own sleep staging model achieving 13.5x improvement over NeurIPS 2024 competition baseline.',
      license: 'ParagonDAO Open Research License',
      tags: ['sleep', 'eeg', 'reference-implementation', 'gle'],
      downloads: 3241,
      citations: 28,
    },
  },
  {
    id: 'ex-002',
    name: 'NeuroVault Seizure Predictor',
    builder: 'NeuroVault Labs',
    builderVerified: true,
    modality: 'EEG',
    disease: 'Epilepsy',
    architecture: 'Graph Neural Network',
    certificationTier: 'gold',
    accuracy: 0.923,
    subjectInvariance: 0.908,
    publishedAt: new Date('2026-02-18T10:00:00Z'),
    onChain: makeOnChainRecord('ex002neurovault', 'gold', new Date('2026-02-18T10:00:00Z')),
    listing: {
      description: 'Pre-seizure detection with 12-minute warning window. Graph neural network captures inter-channel dependencies for robust prediction.',
      license: 'Commercial License',
      tags: ['epilepsy', 'seizure-prediction', 'eeg', 'clinical'],
      downloads: 892,
      citations: 7,
    },
  },
  {
    id: 'ex-003',
    name: 'BioRhythm Depression Screener',
    builder: 'MindWave Research',
    builderVerified: true,
    modality: 'EEG + Audio',
    disease: 'Depression',
    architecture: 'Multimodal Fusion',
    certificationTier: 'gold',
    accuracy: 0.912,
    subjectInvariance: 0.891,
    publishedAt: new Date('2026-02-15T08:00:00Z'),
    onChain: makeOnChainRecord('ex003biorhythm', 'gold', new Date('2026-02-15T08:00:00Z')),
    listing: {
      description: 'Combines EEG alpha asymmetry with vocal biomarkers for depression screening. Multimodal fusion achieves Gold certification.',
      license: 'Research Only',
      tags: ['depression', 'mental-health', 'multimodal', 'screening'],
      downloads: 1456,
      citations: 15,
    },
  },
  {
    id: 'ex-004',
    name: 'CardioSense Arrhythmia',
    builder: 'HeartBeat AI',
    builderVerified: false,
    modality: 'ECG',
    disease: 'Cardiac',
    architecture: 'ResNet-1D',
    certificationTier: 'silver',
    accuracy: 0.856,
    subjectInvariance: 0.821,
    publishedAt: new Date('2026-02-22T12:00:00Z'),
    onChain: makeOnChainRecord('ex004cardiosense', 'silver', new Date('2026-02-22T12:00:00Z')),
    listing: {
      description: 'Real-time arrhythmia classification from single-lead ECG. Optimized for wearable device deployment.',
      license: 'ParagonDAO Open Research License',
      tags: ['cardiac', 'ecg', 'arrhythmia', 'wearable'],
      downloads: 634,
      citations: 3,
    },
  },
  {
    id: 'ex-005',
    name: 'RespiNet Lung Sound',
    builder: 'PulmoTech',
    builderVerified: true,
    modality: 'Audio',
    disease: 'Respiratory',
    architecture: 'WaveNet + GLE',
    certificationTier: 'gold',
    accuracy: 0.934,
    subjectInvariance: 0.917,
    publishedAt: new Date('2026-02-19T16:00:00Z'),
    onChain: makeOnChainRecord('ex005respinet', 'gold', new Date('2026-02-19T16:00:00Z')),
    listing: {
      description: 'Lung auscultation analysis detecting crackles, wheezes, and stridor. Trained on 10,000+ clinical recordings.',
      license: 'Commercial License',
      tags: ['respiratory', 'lung-sounds', 'audio', 'auscultation'],
      downloads: 2103,
      citations: 19,
    },
  },
  {
    id: 'ex-006',
    name: 'TremorTrack PD Detector',
    builder: 'NeuroDynamics',
    builderVerified: true,
    modality: 'IMU + EMG',
    disease: "Parkinson's",
    architecture: 'Temporal CNN',
    certificationTier: 'silver',
    accuracy: 0.878,
    subjectInvariance: 0.843,
    publishedAt: new Date('2026-02-21T09:00:00Z'),
    onChain: makeOnChainRecord('ex006tremortrack', 'silver', new Date('2026-02-21T09:00:00Z')),
    listing: {
      description: "Early Parkinson's tremor detection using wrist-worn IMU and surface EMG. Silver certified for cross-population generalization.",
      license: 'Research Only',
      tags: ['parkinsons', 'tremor', 'imu', 'wearable'],
      downloads: 478,
      citations: 5,
    },
  },
  {
    id: 'ex-007',
    name: 'GlucoSense Predictor',
    builder: 'MetaboHealth',
    builderVerified: false,
    modality: 'PPG + Accel',
    disease: 'Diabetes',
    architecture: 'LSTM Ensemble',
    certificationTier: 'bronze',
    accuracy: 0.743,
    subjectInvariance: 0.712,
    publishedAt: new Date('2026-02-24T14:00:00Z'),
    onChain: makeOnChainRecord('ex007glucosense', 'bronze', new Date('2026-02-24T14:00:00Z')),
    listing: {
      description: 'Non-invasive glucose trend prediction from photoplethysmography. Bronze certified — suitable for wellness tracking only.',
      license: 'ParagonDAO Open Research License',
      tags: ['diabetes', 'glucose', 'ppg', 'non-invasive'],
      downloads: 312,
      citations: 1,
    },
  },
  {
    id: 'ex-008',
    name: 'StressMap Cortisol Proxy',
    builder: 'WellTech Labs',
    builderVerified: true,
    modality: 'HRV + EDA',
    disease: 'Stress/Mental Health',
    architecture: 'Attention Network',
    certificationTier: 'silver',
    accuracy: 0.867,
    subjectInvariance: 0.834,
    publishedAt: new Date('2026-02-23T11:00:00Z'),
    onChain: makeOnChainRecord('ex008stressmap', 'silver', new Date('2026-02-23T11:00:00Z')),
    listing: {
      description: 'Continuous stress level estimation using heart rate variability and electrodermal activity. Validated against salivary cortisol.',
      license: 'Commercial License',
      tags: ['stress', 'mental-health', 'hrv', 'eda'],
      downloads: 891,
      citations: 8,
    },
  },
]

// Simulation pre-filled model for the Forge wizard
export const simulationDraftModel = {
  name: 'My Sleep Staging Model',
  modality: 'EEG',
  disease: 'Sleep Disorders',
  architecture: 'Transformer + GLE Encoder',
  dataset: 'MESA Polysomnography (n=2,056)',
  claimedAccuracy: 0.952,
  description: 'Novel sleep staging architecture combining GLE temporal encoding with multi-head attention. Achieves state-of-the-art performance on MESA benchmark.',
  license: 'ParagonDAO Open Research License',
  tags: ['sleep', 'eeg', 'gle', 'transformer'],
}

// Final results for simulation wizard
export const simulationResults = {
  'neurips-eeg': { accuracy: 0.958, f1_score: 0.951, auc_roc: 0.991, subject_invariance: 0.943 },
  'mesa-sleep': { accuracy: 0.952, cohen_kappa: 0.934, per_stage_f1: [0.97, 0.95, 0.92, 0.96, 0.94] },
  'stress-test': { worst_subject_accuracy: 0.921, variance: 0.0021, generalization_gap: 0.019 },
}

export function getCertificationTier(accuracy) {
  if (accuracy >= 0.95) return 'platinum'
  if (accuracy >= 0.90) return 'gold'
  if (accuracy >= 0.80) return 'silver'
  if (accuracy >= 0.70) return 'bronze'
  return null
}

export function getStatusInfo(status) {
  return MODEL_STATUSES[status] || MODEL_STATUSES.registered
}

export function getTierInfo(tier) {
  return CERTIFICATION_TIERS[tier] || null
}
