/**
 * Verification API Service
 *
 * Calls the private ParagonDAO verification backend for model
 * performance data. No model code lives in this repo.
 */

const BASE_URL = import.meta.env.VITE_VERIFY_API_URL || 'http://localhost:2051'

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

export const verificationAPI = {
  getResults: () => fetchJSON('/api/v1/verify/results'),
  getBenchmark: () => fetchJSON('/api/v1/verify/benchmark'),
  predict: (eegRaw, sfreq = 100) =>
    fetchJSON('/api/v1/verify/predict', {
      method: 'POST',
      body: JSON.stringify({ eeg_raw: eegRaw, sfreq }),
    }),
  runVerification: () =>
    fetchJSON('/api/v1/verify/run', { method: 'POST' }),
  healthCheck: () => fetchJSON('/health'),
}

export default verificationAPI
