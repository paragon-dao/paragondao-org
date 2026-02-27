import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

const LiveSignalPanel = ({ audioContext, stream, compact = false }) => {
  const { isDark } = useTheme()
  const [waveform, setWaveform] = useState(new Array(64).fill(0.5))
  const [audioLevel, setAudioLevel] = useState(0)
  const [freqBands, setFreqBands] = useState({ low: 0, mid: 0, high: 0 })
  const [biosignals, setBiosignals] = useState({
    breathRate: 0,
    regularity: 0,
    ambientNoise: 0,
    signalStrength: 0
  })
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)
  const breathHistoryRef = useRef([])

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  const updateVisualization = useCallback(() => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const timeData = new Uint8Array(analyser.fftSize)
    const freqData = new Uint8Array(analyser.frequencyBinCount)

    analyser.getByteTimeDomainData(timeData)
    analyser.getByteFrequencyData(freqData)

    // Waveform (64 samples)
    const step = Math.floor(timeData.length / 64)
    const newWaveform = []
    for (let i = 0; i < 64; i++) {
      newWaveform.push(timeData[i * step] / 255)
    }
    setWaveform(newWaveform)

    // RMS level
    let rmsSum = 0
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128
      rmsSum += v * v
    }
    const rms = Math.sqrt(rmsSum / timeData.length)
    setAudioLevel(Math.min(1, rms * 5))

    // Frequency bands
    const binCount = freqData.length
    const third = Math.floor(binCount / 3)
    let lowSum = 0, midSum = 0, highSum = 0
    for (let i = 0; i < third; i++) lowSum += freqData[i]
    for (let i = third; i < third * 2; i++) midSum += freqData[i]
    for (let i = third * 2; i < binCount; i++) highSum += freqData[i]
    setFreqBands({
      low: lowSum / (third * 255),
      mid: midSum / (third * 255),
      high: highSum / (third * 255)
    })

    // Biosignal estimates
    breathHistoryRef.current.push(freqBands.low)
    if (breathHistoryRef.current.length > 60) breathHistoryRef.current.shift()

    const breathRate = Math.round(12 + freqBands.low * 8) // 12-20 BPM estimate
    const regularity = Math.round(Math.max(0, Math.min(100, 70 + (1 - freqBands.high) * 30)))
    const ambientNoise = Math.round(rms * 100)
    const signalStrength = Math.round(Math.min(100, rms * 300))

    setBiosignals({ breathRate, regularity, ambientNoise, signalStrength })

    animFrameRef.current = requestAnimationFrame(updateVisualization)
  }, [])

  useEffect(() => {
    if (!audioContext || !stream) return

    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    analyserRef.current = analyser

    animFrameRef.current = requestAnimationFrame(updateVisualization)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      source.disconnect()
    }
  }, [audioContext, stream, updateVisualization])

  const levelColor = audioLevel > 0.6 ? '#ef4444' : audioLevel > 0.3 ? '#f59e0b' : '#10b981'

  return (
    <div style={{
      background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: compact ? '16px' : '24px',
      border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`
    }}>
      <h4 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 12px 0' }}>
        Live Signal
      </h4>

      {/* Waveform */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        height: compact ? '40px' : '60px',
        marginBottom: '12px'
      }}>
        {waveform.map((v, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${Math.abs(v - 0.5) * 200}%`,
            minHeight: '2px',
            background: `linear-gradient(180deg, #10b981, #059669)`,
            borderRadius: '1px',
            opacity: 0.5 + v * 0.5
          }} />
        ))}
      </div>

      {/* Audio Level */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: textSecondary }}>Audio Level</span>
          <span style={{ fontSize: '11px', color: levelColor, fontWeight: '600' }}>
            {Math.round(audioLevel * 100)}%
          </span>
        </div>
        <div style={{
          height: '6px',
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${audioLevel * 100}%`,
            height: '100%',
            background: levelColor,
            borderRadius: '3px',
            transition: 'width 0.1s ease'
          }} />
        </div>
      </div>

      {/* Frequency Bands */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { label: 'Low (Breathing)', value: freqBands.low, color: '#10b981' },
          { label: 'Mid (Voice)', value: freqBands.mid, color: '#3b82f6' },
          { label: 'High (Env)', value: freqBands.high, color: '#f59e0b' }
        ].map((band, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: compact ? '30px' : '40px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end'
            }}>
              <div style={{
                width: '100%',
                height: `${band.value * 100}%`,
                background: band.color,
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.1s ease',
                opacity: 0.7
              }} />
            </div>
            <div style={{ fontSize: '10px', color: textSecondary, marginTop: '4px', textAlign: 'center' }}>
              {band.label}
            </div>
          </div>
        ))}
      </div>

      {/* Biosignal Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
      }}>
        {[
          { label: 'Breath Rate', value: `${biosignals.breathRate} BPM` },
          { label: 'Regularity', value: `${biosignals.regularity}%` },
          { label: 'Ambient Noise', value: `${biosignals.ambientNoise} mV` },
          { label: 'Signal Strength', value: `${biosignals.signalStrength}%` }
        ].map((metric, i) => (
          <div key={i} style={{
            padding: '8px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '10px', color: textSecondary }}>{metric.label}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LiveSignalPanel
