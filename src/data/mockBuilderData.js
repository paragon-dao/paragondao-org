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
  { id: 'v1', name: 'ParagonDAO Primary', location: 'Salt Lake City, UT', stake: '50,000 PGON', role: 'Protocol', nodeType: 'Core validator — protocol governance and certification authority' },
  { id: 'v2', name: 'U of U Research Node', location: 'Salt Lake City, UT', stake: '35,000 PGON', role: 'University', nodeType: 'University partner — produces trained builders via curriculum, validates research models' },
  { id: 'v3', name: 'Silicon Slopes Hub', location: 'Lehi, UT', stake: '42,000 PGON', role: 'Ecosystem Hub', nodeType: 'Regional builder network — hosts local builders, connects to verticals' },
  { id: 'v4', name: 'Promise2Live Mission', location: 'National (US)', stake: '28,000 PGON', role: 'Mission', nodeType: 'Mission partner — 988 crisis detection, receives free access funded by mission fund' },
  { id: 'v5', name: 'Materic Hardware Node', location: 'Victoria, BC', stake: '31,000 PGON', role: 'Hardware', nodeType: 'Hardware partner — piezoelectric yarn + GLE, validates device-specific models' },
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

// Impact data factory
function makeImpact({ apiTotal, apiMonth, trend, apps, appNames, peopleTotal, peopleMonth, screenings, countries, topRegions, revTotal, revMonth }) {
  return {
    apiCalls: { total: apiTotal, thisMonth: apiMonth, trend },
    activeApps: apps,
    appNames,
    peopleReached: { total: peopleTotal, thisMonth: peopleMonth, screeningsCompleted: screenings },
    geography: { countries, topRegions },
    revenue: { totalEarned: revTotal, thisMonth: revMonth, currency: 'USD', perCallRate: 0.005 },
    timeline: [
      { month: 'Oct 2026', apiCalls: Math.round(apiMonth * 0.09), people: Math.round(peopleMonth * 0.13), apps: Math.max(1, Math.round(apps * 0.17)) },
      { month: 'Nov 2026', apiCalls: Math.round(apiMonth * 0.24), people: Math.round(peopleMonth * 0.36), apps: Math.max(2, Math.round(apps * 0.33)) },
      { month: 'Dec 2026', apiCalls: Math.round(apiMonth * 0.55), people: Math.round(peopleMonth * 0.65), apps: Math.max(3, Math.round(apps * 0.58)) },
      { month: 'Jan 2027', apiCalls: Math.round(apiMonth * 0.79), people: Math.round(peopleMonth * 0.82), apps: Math.max(4, Math.round(apps * 0.75)) },
      { month: 'Feb 2027', apiCalls: apiMonth, people: peopleMonth, apps },
    ],
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
    },
    impact: makeImpact({
      apiTotal: 847_293, apiMonth: 142_800, trend: 0.23, apps: 12,
      appNames: ['SleepWise', 'NeuroScreen Pro', 'CampusSleep@Utah', 'SleepCheck Mobile'],
      peopleTotal: 89_400, peopleMonth: 14_200, screenings: 71_520, countries: 23,
      topRegions: [
        { name: 'United States', percentage: 41 }, { name: 'United Kingdom', percentage: 18 },
        { name: 'Germany', percentage: 12 }, { name: 'India', percentage: 9 }, { name: 'Brazil', percentage: 7 },
      ],
      revTotal: 4267.50, revMonth: 712.80,
    }),
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
    impact: null, // Not published yet
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
    impact: null, // Still verifying
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
    },
    impact: makeImpact({
      apiTotal: 847_293, apiMonth: 142_800, trend: 0.23, apps: 12,
      appNames: ['SleepWise', 'NeuroScreen Pro', 'CampusSleep@Utah', 'SleepCheck Mobile'],
      peopleTotal: 89_400, peopleMonth: 14_200, screenings: 71_520, countries: 23,
      topRegions: [
        { name: 'United States', percentage: 41 }, { name: 'United Kingdom', percentage: 18 },
        { name: 'Germany', percentage: 12 }, { name: 'India', percentage: 9 }, { name: 'Brazil', percentage: 7 },
      ],
      revTotal: 4267.50, revMonth: 712.80,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 312_400, apiMonth: 67_400, trend: 0.31, apps: 6,
      appNames: ['SeizureGuard', 'EpiAlert Mobile', 'NeuroWatch'],
      peopleTotal: 24_800, peopleMonth: 4_800, screenings: 19_840, countries: 14,
      topRegions: [
        { name: 'United States', percentage: 38 }, { name: 'Canada', percentage: 15 },
        { name: 'United Kingdom', percentage: 14 }, { name: 'Australia', percentage: 11 }, { name: 'Germany', percentage: 8 },
      ],
      revTotal: 1562.00, revMonth: 337.00,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 478_200, apiMonth: 89_200, trend: 0.18, apps: 8,
      appNames: ['MoodLens', 'WellCheck Campus', 'MindScan', 'TherapyPrep'],
      peopleTotal: 52_100, peopleMonth: 11_100, screenings: 41_680, countries: 19,
      topRegions: [
        { name: 'United States', percentage: 35 }, { name: 'India', percentage: 16 },
        { name: 'United Kingdom', percentage: 13 }, { name: 'Brazil', percentage: 10 }, { name: 'Nigeria', percentage: 8 },
      ],
      revTotal: 2391.00, revMonth: 446.00,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 156_400, apiMonth: 34_100, trend: 0.27, apps: 4,
      appNames: ['HeartGuard Wearable', 'CardioCheck', 'PulseMonitor Pro'],
      peopleTotal: 38_200, peopleMonth: 8_200, screenings: 30_560, countries: 11,
      topRegions: [
        { name: 'United States', percentage: 44 }, { name: 'Japan', percentage: 14 },
        { name: 'South Korea', percentage: 11 }, { name: 'Germany', percentage: 9 }, { name: 'United Kingdom', percentage: 7 },
      ],
      revTotal: 782.00, revMonth: 170.50,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 624_400, apiMonth: 112_400, trend: 0.34, apps: 9,
      appNames: ['LungCheck', 'RespiScan', 'BreathEasy', 'CommunityHealth App', 'RuralClinic AI'],
      peopleTotal: 134_600, peopleMonth: 22_600, screenings: 107_680, countries: 27,
      topRegions: [
        { name: 'India', percentage: 28 }, { name: 'Nigeria', percentage: 16 },
        { name: 'Brazil', percentage: 14 }, { name: 'Indonesia', percentage: 11 }, { name: 'United States', percentage: 9 },
      ],
      revTotal: 3122.00, revMonth: 562.00,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 78_700, apiMonth: 18_700, trend: 0.19, apps: 3,
      appNames: ['TremorTrack App', 'PD Monitor', 'NeuroCare'],
      peopleTotal: 9_100, peopleMonth: 2_100, screenings: 7_280, countries: 8,
      topRegions: [
        { name: 'United States', percentage: 42 }, { name: 'United Kingdom', percentage: 19 },
        { name: 'Canada', percentage: 13 }, { name: 'Australia', percentage: 10 }, { name: 'Netherlands', percentage: 6 },
      ],
      revTotal: 393.50, revMonth: 93.50,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 32_400, apiMonth: 8_400, trend: 0.12, apps: 2,
      appNames: ['GlucoTrack Lite', 'DiabetesWatch'],
      peopleTotal: 14_200, peopleMonth: 3_400, screenings: 11_360, countries: 5,
      topRegions: [
        { name: 'India', percentage: 38 }, { name: 'United States', percentage: 24 },
        { name: 'Mexico', percentage: 15 }, { name: 'Brazil', percentage: 12 }, { name: 'Philippines', percentage: 6 },
      ],
      revTotal: 162.00, revMonth: 42.00,
    }),
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
    },
    impact: makeImpact({
      apiTotal: 218_600, apiMonth: 45_600, trend: 0.21, apps: 5,
      appNames: ['CalmSpace', 'WorkWell HR', 'StressLess', 'MindfulMetrics'],
      peopleTotal: 47_800, peopleMonth: 9_800, screenings: 38_240, countries: 15,
      topRegions: [
        { name: 'United States', percentage: 36 }, { name: 'Japan', percentage: 14 },
        { name: 'United Kingdom', percentage: 12 }, { name: 'South Korea', percentage: 10 }, { name: 'Germany', percentage: 8 },
      ],
      revTotal: 1093.00, revMonth: 228.00,
    }),
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

// Projected impact for simulation Step 7 success screen
export const simulationProjectedImpact = [
  { month: 'Month 1', apps: 3, people: 2_400, revenue: 62.40 },
  { month: 'Month 3', apps: 7, people: 12_300, revenue: 312.40 },
  { month: 'Month 6', apps: 12, people: 89_400, revenue: 4_267.50 },
  { month: 'Month 12', apps: 18, people: 312_000, revenue: 15_600.00 },
]

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
