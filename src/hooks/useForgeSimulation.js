import { useState, useCallback, useRef, useEffect } from 'react'
import {
  simulationDraftModel,
  simulationResults,
  VALIDATORS,
  getCertificationTier,
} from '../data/mockBuilderData'

const TOTAL_STEPS = 7
const VERIFICATION_DURATION = 8000 // 8 seconds at normal speed
const TICK_INTERVAL = 100

export default function useForgeSimulation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [modelDraft, setModelDraft] = useState({ ...simulationDraftModel })
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(['neurips-eeg', 'mesa-sleep', 'stress-test'])
  const [verificationProgress, setVerificationProgress] = useState(
    VALIDATORS.map(v => ({ ...v, progress: 0, status: 'waiting' }))
  )
  const [overallProgress, setOverallProgress] = useState(0)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1) // 1x or 10x
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [certificationTier, setCertificationTier] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadHash, setUploadHash] = useState(null)

  const timerRef = useRef(null)
  const uploadTimerRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current)
    }
  }, [])

  const advanceStep = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS))
  }, [])

  const goToStep = useCallback((n) => {
    if (n >= 1 && n <= TOTAL_STEPS) setCurrentStep(n)
  }, [])

  const updateDraft = useCallback((field, value) => {
    setModelDraft(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleBenchmark = useCallback((benchmarkId) => {
    setSelectedBenchmarks(prev =>
      prev.includes(benchmarkId)
        ? prev.filter(b => b !== benchmarkId)
        : [...prev, benchmarkId]
    )
  }, [])

  const simulateUpload = useCallback(() => {
    setUploadProgress(0)
    setUploadHash(null)
    let progress = 0
    uploadTimerRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2
      if (progress >= 100) {
        progress = 100
        clearInterval(uploadTimerRef.current)
        setUploadHash(`0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`)
      }
      setUploadProgress(Math.min(progress, 100))
    }, 150)
  }, [])

  const startVerification = useCallback(() => {
    setIsRunning(true)
    setVerificationComplete(false)
    setOverallProgress(0)
    setResults(null)
    setCertificationTier(null)

    // Each validator progresses at a different rate
    const validatorSpeeds = VALIDATORS.map(() => 0.3 + Math.random() * 0.7)
    const elapsed = { current: 0 }

    const tick = () => {
      const speed = simulationSpeed
      elapsed.current += TICK_INTERVAL * speed

      const fraction = Math.min(elapsed.current / VERIFICATION_DURATION, 1)

      setVerificationProgress(
        VALIDATORS.map((v, i) => {
          const vProgress = Math.min(fraction * validatorSpeeds[i] * 1.4, 1)
          return {
            ...v,
            progress: Math.round(vProgress * 100),
            status: vProgress >= 1 ? 'complete' : vProgress > 0 ? 'running' : 'waiting',
          }
        })
      )

      setOverallProgress(Math.round(fraction * 100))

      if (fraction >= 1) {
        clearInterval(timerRef.current)
        timerRef.current = null
        setIsRunning(false)
        setVerificationComplete(true)
        setResults(simulationResults)
        const tier = getCertificationTier(simulationResults['neurips-eeg'].accuracy)
        setCertificationTier(tier)
        // Auto-advance to results step after brief delay
        setTimeout(() => setCurrentStep(5), 600)
      }
    }

    timerRef.current = setInterval(tick, TICK_INTERVAL)
  }, [simulationSpeed])

  const fastForward = useCallback(() => {
    setSimulationSpeed(10)
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current)
    setCurrentStep(1)
    setModelDraft({ ...simulationDraftModel })
    setSelectedBenchmarks(['neurips-eeg', 'mesa-sleep', 'stress-test'])
    setVerificationProgress(VALIDATORS.map(v => ({ ...v, progress: 0, status: 'waiting' })))
    setOverallProgress(0)
    setVerificationComplete(false)
    setSimulationSpeed(1)
    setIsRunning(false)
    setResults(null)
    setCertificationTier(null)
    setUploadProgress(0)
    setUploadHash(null)
  }, [])

  return {
    // State
    currentStep,
    modelDraft,
    selectedBenchmarks,
    verificationProgress,
    overallProgress,
    verificationComplete,
    simulationSpeed,
    isRunning,
    results,
    certificationTier,
    uploadProgress,
    uploadHash,
    // Actions
    advanceStep,
    goToStep,
    updateDraft,
    toggleBenchmark,
    simulateUpload,
    startVerification,
    fastForward,
    reset,
    setSimulationSpeed,
  }
}
