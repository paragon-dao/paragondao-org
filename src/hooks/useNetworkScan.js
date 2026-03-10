import { useState, useRef, useCallback } from 'react'
import { getEnvironmentData } from '../services/environment'

const BAGLE_API = 'https://bagle-api.fly.dev/api/v1/encode'
const DUST_API = 'https://gsl-dust-predictor.fly.dev/api/dust/tactical?firedrill=true'
const CONSENSUS_API = 'https://gsl-dust-predictor.fly.dev/api/dust/consensus'

// Extract numeric features from environment data for BAGLE encoding
function extractEnvironmentFeatures(envData) {
  const { weather, airQuality, uv } = envData
  return [
    weather?.temperature ?? 0,
    weather?.feelsLike ?? 0,
    weather?.humidity ?? 0,
    weather?.dewPoint ?? 0,
    weather?.wind?.speed ?? 0,
    weather?.wind?.gusts ?? 0,
    weather?.pressure?.msl ?? 0,
    (weather?.visibility?.km ?? 10) * 1000,
    airQuality?.pm25 ?? 0,
    airQuality?.pm10 ?? 0,
    airQuality?.aqi ?? 0,
    airQuality?.ozone ?? 0,
    airQuality?.no2 ?? 0,
    airQuality?.so2 ?? 0,
    airQuality?.co ?? 0,
    uv?.index ?? 0,
    airQuality?.dust ?? 0,
    airQuality?.aerosolOpticalDepth ?? 0,
  ]
}

// Phase timing (ms)
const PHASE_TIMING = {
  acquisition: 2000,
  encoding: 2500,
  network: 2000,
  intelligence: 1500,
}

export function useNetworkScan() {
  const [phase, setPhase] = useState('idle') // idle | acquisition | encoding | network | intelligence | complete
  const [subPhase, setSubPhase] = useState(0)
  const [envData, setEnvData] = useState(null)
  const [encoding, setEncoding] = useState(null)
  const [encodingLatency, setEncodingLatency] = useState(null)
  const [dustResult, setDustResult] = useState(null)
  const [consensusResult, setConsensusResult] = useState(null)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const dataReady = useRef({ env: false, encoding: false, dust: false, consensus: false })

  const startScan = useCallback(async () => {
    setPhase('acquisition')
    setSubPhase(0)
    setError(null)
    dataReady.current = { env: false, encoding: false, dust: false, consensus: false }

    // Fire all API calls in parallel
    const envPromise = getEnvironmentData().then(data => {
      setEnvData(data)
      dataReady.current.env = true
      // Now encode the environment features
      const features = extractEnvironmentFeatures(data)
      return fetch(BAGLE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, modality: 'environment' }),
      }).then(r => r.json()).then(result => {
        setEncoding(result.encoding)
        setEncodingLatency(result.latency_ms)
        dataReady.current.encoding = true
      })
    }).catch(err => {
      console.warn('Env/encode failed:', err)
      setError('Environment data unavailable')
    })

    const dustPromise = fetch(DUST_API)
      .then(r => r.json())
      .then(result => {
        setDustResult(result)
        dataReady.current.dust = true
      })
      .catch(err => console.warn('Dust API failed:', err))

    const consensusPromise = fetch(CONSENSUS_API)
      .then(r => r.json())
      .then(result => {
        setConsensusResult(result)
        dataReady.current.consensus = true
      })
      .catch(err => console.warn('Consensus API failed:', err))

    // Run animation phases in sequence
    const runPhases = async () => {
      // Phase 1: Acquisition
      setPhase('acquisition')
      for (let i = 0; i < 18; i++) {
        await sleep(PHASE_TIMING.acquisition / 18)
        setSubPhase(i + 1)
      }

      // Phase 2: Encoding
      setPhase('encoding')
      setSubPhase(0)
      for (let i = 0; i < 128; i++) {
        await sleep(PHASE_TIMING.encoding / 128)
        setSubPhase(i + 1)
      }

      // Phase 3: Network
      setPhase('network')
      setSubPhase(0)
      for (let i = 0; i < 4; i++) {
        await sleep(PHASE_TIMING.network / 4)
        setSubPhase(i + 1)
      }

      // Phase 4: Intelligence
      setPhase('intelligence')
      setSubPhase(0)
      await sleep(PHASE_TIMING.intelligence)

      // Wait for all data
      await Promise.allSettled([envPromise, dustPromise, consensusPromise])
      setPhase('complete')
    }

    runPhases()
  }, [])

  const resetScan = useCallback(() => {
    setPhase('idle')
    setSubPhase(0)
    setEncoding(null)
    setEncodingLatency(null)
    setDustResult(null)
    setConsensusResult(null)
    setError(null)
  }, [])

  return {
    phase,
    subPhase,
    envData,
    encoding,
    encodingLatency,
    dustResult,
    consensusResult,
    error,
    startScan,
    resetScan,
    isScanning: !['idle', 'complete'].includes(phase),
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
