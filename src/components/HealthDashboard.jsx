import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { HeartbeatEngine } from '../agent/heartbeat-engine'
import EnvironmentCard from './EnvironmentCard'
import LiveSignalPanel from './LiveSignalPanel'
import AgentChat from './AgentChat'
import { HFTPClient } from '../agent/hftp-client'
import { getEnvironmentData } from '../services/environment'

const HealthDashboard = () => {
  const { isDark } = useTheme()
  const [authStatus, setAuthStatus] = useState({ unlocked: false, similarity: 0 })
  const [healthMetrics, setHealthMetrics] = useState(null)
  const [breathingTrend, setBreathingTrend] = useState([])
  const [agentLog, setAgentLog] = useState([])
  const [activeTab, setActiveTab] = useState('you')
  const [envData, setEnvData] = useState(null)
  const [nextCycle, setNextCycle] = useState(300)
  const [audioContext, setAudioContext] = useState(null)
  const [stream, setStream] = useState(null)
  const engineRef = useRef(null)
  const timerRef = useRef(null)

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  const addLog = (msg, type = 'info') => {
    setAgentLog(prev => [...prev.slice(-50), { msg, type, time: new Date().toLocaleTimeString() }])
  }

  useEffect(() => {
    const initEngine = async () => {
      try {
        // Get mic for live visualization
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true }
        })
        const ctx = new AudioContext()
        setAudioContext(ctx)
        setStream(micStream)

        addLog('Microphone connected', 'success')

        // Initialize heartbeat engine
        const engine = new HeartbeatEngine({
          onAuthChange: (status) => {
            setAuthStatus(status)
            addLog(`Auth: ${status.unlocked ? '✓ Verified' : '✗ Locked'} (${(status.similarity * 100).toFixed(1)}%)`,
              status.unlocked ? 'success' : 'warning')
          },
          onHealthUpdate: (metrics) => {
            setHealthMetrics(metrics)
            setBreathingTrend(prev => [...prev.slice(-19), metrics])
            addLog(`Health: ${metrics.classification} breathing, stress: ${(metrics.stressIndicator * 100).toFixed(0)}%`, 'info')
          },
          onNetworkSync: (info) => {
            addLog(`Network: HFTP packet sent (cycle ${info.cycle})`, 'network')
          },
          onCycleComplete: (result) => {
            addLog(`Cycle ${result.cycle} complete (${result.duration}ms)`, 'info')
          },
          onError: (err) => {
            addLog(`Error: ${err.error}`, 'error')
          }
        })

        // Init capture (separate from visualization stream)
        await engine.capture.init()
        addLog('Breathing capture initialized', 'success')

        // Try connecting to HFTP hub (won't fail if hub is down)
        try {
          const client = new HFTPClient()
          client.connect().catch(() => addLog('HFTP hub offline — running locally', 'warning'))
          engine.hftp = client
        } catch {
          addLog('HFTP: Running in local mode', 'warning')
        }

        engine.start()
        engineRef.current = engine
        addLog('Heartbeat engine started (5-min cycles)', 'success')
      } catch (err) {
        addLog(`Init error: ${err.message}`, 'error')
      }
    }

    initEngine()

    // Load env data
    getEnvironmentData().then(setEnvData).catch(() => {})

    // Countdown timer
    timerRef.current = setInterval(() => {
      setNextCycle(prev => prev <= 0 ? 300 : prev - 1)
    }, 1000)

    return () => {
      if (engineRef.current) engineRef.current.destroy()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const logColors = {
    info: '#9ca3af', success: '#10b981', warning: '#f59e0b',
    error: '#ef4444', network: '#6366f1'
  }

  const tabs = [
    { key: 'you', label: 'You', icon: '🧑' },
    { key: 'pet', label: 'Pet', icon: '🐾' },
    { key: 'plant', label: 'Plant', icon: '🌱' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 20px',
        background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: authStatus.unlocked ? '#10b981' : '#f87171',
            boxShadow: authStatus.unlocked ? '0 0 10px rgba(16,185,129,0.5)' : 'none'
          }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: textPrimary }}>
            {authStatus.unlocked ? 'Authenticated' : 'Locked'}
          </span>
          {authStatus.similarity > 0 && (
            <span style={{ fontSize: '12px', color: textSecondary }}>
              ({(authStatus.similarity * 100).toFixed(1)}% match)
            </span>
          )}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '13px', color: textSecondary }}>
          Next cycle: {formatTime(nextCycle)}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EnvironmentCard compact />

          {audioContext && stream && (
            <LiveSignalPanel audioContext={audioContext} stream={stream} compact />
          )}

          {/* Health Analysis */}
          {healthMetrics && (
            <div style={{
              background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 12px 0' }}>
                Health Analysis
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div style={{ textAlign: 'center', padding: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#6366f1' }}>
                    {healthMetrics.classification}
                  </div>
                  <div style={{ fontSize: '10px', color: textSecondary, marginTop: '4px' }}>Classification</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: healthMetrics.stressIndicator < 0.3 ? '#10b981' : healthMetrics.stressIndicator < 0.6 ? '#f59e0b' : '#ef4444' }}>
                    {(healthMetrics.stressIndicator * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '10px', color: textSecondary, marginTop: '4px' }}>Stress</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: textPrimary }}>
                    {healthMetrics.breathingDepth}
                  </div>
                  <div style={{ fontSize: '10px', color: textSecondary, marginTop: '4px' }}>Depth</div>
                </div>
              </div>
            </div>
          )}

          {/* Breathing Trend */}
          {breathingTrend.length > 0 && (
            <div style={{
              background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 12px 0' }}>
                Breathing Trend
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
                {breathingTrend.map((m, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${Math.min(100, m.breathingDepth * 40)}%`,
                    minHeight: '4px',
                    background: m.classification === 'deep' ? '#10b981' : m.classification === 'normal' ? '#3b82f6' : '#f59e0b',
                    borderRadius: '2px'
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Three Kingdom Tabs */}
          <div style={{
            background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  flex: 1,
                  padding: '8px',
                  background: activeTab === t.key
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  color: activeTab === t.key ? '#fff' : textSecondary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '14px', color: textSecondary, textAlign: 'center', padding: '20px 0' }}>
              {activeTab === 'you' ? (
                healthMetrics ? `Monitoring active — ${healthMetrics.classification} breathing detected` : 'Waiting for first breathing cycle...'
              ) : activeTab === 'pet' ? (
                'Pet health monitoring coming soon. Place device near your pet during sleep for passive breathing analysis.'
              ) : (
                'Plant health monitoring coming soon. Ambient CO2 and humidity tracking for optimal plant care.'
              )}
            </div>
          </div>

          {/* Agent Chat */}
          <AgentChat
            healthMetrics={healthMetrics}
            envData={envData}
            authStatus={authStatus}
          />

          {/* Agent Log */}
          <div style={{
            background: isDark ? 'rgba(15,15,25,0.9)' : 'rgba(30,41,59,0.95)',
            borderRadius: '12px',
            padding: '12px 16px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '11px'
          }}>
            <div style={{ color: '#6366f1', fontWeight: '700', marginBottom: '8px' }}>Agent Log</div>
            {agentLog.length === 0 ? (
              <div style={{ color: '#4b5563' }}>Waiting for agent activity...</div>
            ) : (
              agentLog.map((log, i) => (
                <div key={i} style={{ color: logColors[log.type] || '#9ca3af', marginBottom: '2px' }}>
                  <span style={{ color: '#4b5563' }}>[{log.time}]</span> {log.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthDashboard
