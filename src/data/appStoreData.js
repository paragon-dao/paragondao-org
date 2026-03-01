/**
 * App Store Data
 *
 * Initial seed data for the ParagonDAO App Store.
 * Once the store is live, this will be replaced with API calls to
 * riif-platform-api.riif.com/api/pwa/apps
 *
 * Each app follows the GitHub submission + certification pattern:
 * Builder submits repo -> certification review -> build factory -> R2 -> /apps/{appId}
 */

export const APP_CATEGORIES = [
  'All',
  'Crisis & Mental Health',
  'Respiratory',
  'Neurological',
  'Metabolic',
  'Cardiac',
  'Infectious Disease',
  'Consumer Wellness',
]

export const HARDWARE_FILTERS = [
  'All',
  'Phone Only',
  'EEG Headband',
  'Lab Equipment',
  'Wearable Sensor',
]

export const storeApps = [
  {
    id: 'crisis-screening',
    name: '988 Crisis Screening',
    builder: 'Univault Technologies',
    description: 'AI-powered crisis detection for 988 counseling calls. Analyzes caller breathing patterns passively from phone audio while monitoring counselor EEG via MUSE headband. Two-signal fusion detects what breathing alone cannot: the difference between a panic attack and suicidal intent.',
    category: 'Crisis & Mental Health',
    certificationTier: 'gold',
    models: ['Breathing (89.2%)', 'EEG (97.65%)'],
    hardware: 'Phone + MUSE EEG',
    status: 'live',
    featured: true,
    repo: 'https://github.com/phuongtran/bagle-crisis-screening',
    demoUrl: '/apps/crisis-screening/demo',
    signals: ['Audio (breathing)', 'EEG (counselor)'],
    useCases: [
      '988 Suicide & Crisis Lifeline call centers',
      'Community health worker mental health screening',
      'Sub-Saharan Africa mental health triage (SASH scholars)',
      'EVAH grant intervention deployment',
    ],
    keyFeature: 'Caller needs NO device — just a phone. Only the counselor wears a MUSE headband.',
    accuracy: {
      breathing: 89.2,
      eeg: 97.65,
      combined: 'Projected 99%+ (two independent signal fusion)',
    },
    openSource: true,
    license: 'MIT',
  },
  {
    id: 'breathe-screen',
    name: 'BreatheScreen CHW',
    builder: 'Univault Technologies',
    description: 'Respiratory screening for community health workers. Record 30 seconds of patient breathing via phone mic. BAGLE API encodes audio into 128 GLE coefficients. Compare against trained respiratory model for risk assessment.',
    category: 'Respiratory',
    certificationTier: 'gold',
    models: ['Breathing (89.2%)'],
    hardware: 'Phone Only',
    status: 'coming-soon',
    featured: false,
    signals: ['Audio (breathing)'],
    useCases: [
      'CHW respiratory screening in LMICs',
      'TB cough pattern detection',
      'Asthma monitoring',
    ],
    keyFeature: 'Works on any phone with a microphone. No special hardware. Offline-capable PWA.',
    accuracy: { breathing: 89.2 },
    openSource: true,
    license: 'MIT',
  },
  {
    id: 'neuro-monitor',
    name: 'EEG Consciousness Monitor',
    builder: 'Univault Technologies',
    description: 'Real-time EEG consciousness state classification using MUSE headband. NeurIPS 2025 validated at 97.65% accuracy — 27.5% better than competition. Monitors cognitive states: focused, relaxed, stressed, engaged, distracted.',
    category: 'Neurological',
    certificationTier: 'platinum',
    models: ['EEG (97.65%)'],
    hardware: 'EEG Headband',
    status: 'coming-soon',
    featured: false,
    signals: ['EEG'],
    useCases: [
      'Neurofeedback training',
      'Meditation quality tracking',
      'Attention monitoring for education',
      'Sleep stage classification',
    ],
    keyFeature: 'NeurIPS 2025 validated. 27.5% accuracy improvement over state-of-the-art.',
    accuracy: { eeg: 97.65 },
    openSource: true,
    license: 'MIT',
  },
  {
    id: 'voice-parkinson',
    name: "Parkinson's Voice Monitor",
    builder: 'Partner (seeking)',
    description: "Voice-based Parkinson's disease screening. Detects vocal biomarkers associated with PD including reduced loudness, breathiness, and tremor. Phone-only, no special hardware needed.",
    category: 'Neurological',
    certificationTier: 'bronze',
    models: ['Voice (training needed)'],
    hardware: 'Phone Only',
    status: 'seeking-builder',
    featured: false,
    signals: ['Audio (voice)'],
    useCases: [
      "Early Parkinson's screening",
      'PD progression monitoring',
      'Remote patient monitoring',
    ],
    keyFeature: 'Literature shows 70-75% real-world accuracy for voice-based PD detection.',
    openSource: true,
    license: 'MIT',
  },
  {
    id: 't2d-screening',
    name: 'T2D Risk Assessment',
    builder: 'Partner (seeking)',
    description: 'Type 2 Diabetes risk classification using serum metabolomics. GLE model achieves 95.33% LOOCV accuracy on 300 samples. Requires LC-MS lab analysis of blood serum — NOT saliva.',
    category: 'Metabolic',
    certificationTier: 'platinum',
    models: ['T2D (95.33%)'],
    hardware: 'Lab Equipment',
    status: 'seeking-builder',
    featured: false,
    signals: ['Serum metabolomics (LC-MS)'],
    useCases: [
      'Diabetes clinic screening',
      'Pharmacy network wellness tests',
      'LMIC central lab processing',
    ],
    keyFeature: '95.33% LOOCV accuracy. Requires clinical validation study partner.',
    accuracy: { t2d: 95.33 },
    openSource: false,
    license: 'Proprietary (clinical)',
  },
  {
    id: 'covid-raman',
    name: 'COVID Raman Screening',
    builder: 'Partner (seeking)',
    description: 'COVID-19 detection from saliva Raman spectroscopy. GLE model at 86.35% accuracy on 171 samples. Requires a Raman spectrometer device.',
    category: 'Infectious Disease',
    certificationTier: 'gold',
    models: ['COVID (86.35%)'],
    hardware: 'Raman Spectrometer',
    status: 'seeking-builder',
    featured: false,
    signals: ['Raman spectroscopy'],
    useCases: [
      'Clinic-based pathogen screening',
      'Public health surveillance',
      'Point-of-care diagnostics',
    ],
    keyFeature: 'Saliva-based. Non-invasive. Requires Raman device partnership.',
    accuracy: { covid: 86.35 },
    openSource: false,
    license: 'Proprietary (clinical)',
  },
]

export const FEATURED_APP = storeApps.find(a => a.featured) || storeApps[0]
