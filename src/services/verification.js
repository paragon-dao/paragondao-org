/**
 * Verification API Service
 *
 * Calls the ParagonDAO verification backend for model performance data.
 * No fallbacks — errors propagate so the UI can show honest error states.
 *
 * Supports per-model endpoints via optional modelId parameter.
 * When modelId is provided, requests go to /api/v1/verify/{modelId}/...
 * When omitted, falls back to the default /api/v1/verify/... paths.
 */

const BASE_URL = import.meta.env.VITE_VERIFY_API_URL || 'https://bagle-api.fly.dev'

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}

function modelPath(modelId, suffix) {
  if (modelId) return `/api/v1/verify/${modelId}${suffix}`
  return `/api/v1/verify${suffix}`
}

export const verificationAPI = {
  getResults: (modelId) => fetchJSON(modelPath(modelId, '/results')),
  getBenchmark: (modelId) => fetchJSON(modelPath(modelId, '/benchmark')),
  predict: (eegRaw, sfreq = 100, modelId) =>
    fetchJSON(modelPath(modelId, '/predict'), {
      method: 'POST',
      body: JSON.stringify({ eeg_raw: eegRaw, sfreq }),
    }),
  runVerification: (modelId) =>
    fetchJSON(modelPath(modelId, '/run'), { method: 'POST' }),
  healthCheck: () => fetchJSON('/health'),

  // New evidence endpoints
  getProvenance: (modelId) => fetchJSON(modelPath(modelId, '/provenance')),
  getPredictions: (modelId, offset = 0, limit = 100) =>
    fetchJSON(modelPath(modelId, `/predictions?offset=${offset}&limit=${limit}`)),

  // Privacy verification endpoints
  getPrivacyResults: (modelId) => fetchJSON(modelPath(modelId, '/privacy/results')),
  runMembershipInference: (modelId) =>
    fetchJSON(modelPath(modelId, '/privacy/membership-inference'), { method: 'POST' }),
  runModelInversion: (modelId) =>
    fetchJSON(modelPath(modelId, '/privacy/model-inversion'), { method: 'POST' }),
  runAttributeInference: (modelId) =>
    fetchJSON(modelPath(modelId, '/privacy/attribute-inference'), { method: 'POST' }),
  runPrivacyAudit: (modelId) =>
    fetchJSON(modelPath(modelId, '/privacy/run'), { method: 'POST' }),
}

export default verificationAPI
