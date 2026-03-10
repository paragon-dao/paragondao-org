import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import CoefficientVisualizer from './CoefficientVisualizer'

const PHASE_LABELS = {
  acquisition: 'DATA ACQUISITION',
  encoding: 'FREQUENCY ENCODING',
  network: 'NETWORK CONSENSUS',
  intelligence: 'HEALTH INTELLIGENCE',
}

const SPECIALIST_NODES = [
  { id: 'hydro', label: 'Hydro', region: 'Dallas, TX', desc: 'Lake level + recession + drought', color: '#3b82f6' },
  { id: 'atmo', label: 'Atmo', region: 'San Jose, CA', desc: 'Dewpoint + humidity + instability', color: '#8b5cf6' },
  { id: 'wind', label: 'Wind', region: 'Virginia', desc: 'NW persistence + speed + dryness', color: '#10b981' },
]

const FiredrillSequence = ({
  phase, subPhase, envData, encoding, encodingLatency,
  dustResult, consensusResult, onReset
}) => {
  const { isDark } = useTheme()

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#64748b'
  const panelBg = isDark ? 'rgba(15, 15, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)'
  const borderColor = isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'

  const PhaseRow = ({ id, label, isActive, isComplete, detail }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: '10px',
      background: isActive
        ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)')
        : 'transparent',
      transition: 'background 0.3s',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isComplete ? '#10b981' : isActive ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
        transition: 'background 0.3s',
        flexShrink: 0,
      }}>
        {isComplete ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
        ) : isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
          />
        ) : (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
          color: isActive ? '#6366f1' : isComplete ? '#10b981' : textMuted,
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
        {detail && (
          <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
            {detail}
          </div>
        )}
      </div>
    </div>
  )

  const phaseOrder = ['acquisition', 'encoding', 'network', 'intelligence']
  const currentIdx = phaseOrder.indexOf(phase)

  // Derive phase details
  const getDetail = (p) => {
    const idx = phaseOrder.indexOf(p)
    if (idx > currentIdx) return null
    if (p === 'acquisition') {
      if (phase === 'acquisition') return `${subPhase}/18 signals acquired`
      return envData ? `${envData.location?.city || 'Located'} — ${Object.keys(envData.weather || {}).length + Object.keys(envData.airQuality || {}).length} channels` : '18 signals'
    }
    if (p === 'encoding') {
      if (phase === 'encoding') return `${subPhase}/128 values`
      return encodingLatency ? `128-value fingerprint in ${encodingLatency}ms` : 'Fingerprint encoded'
    }
    if (p === 'network') {
      if (phase === 'network') return `${subPhase}/3 specialist nodes queried`
      return consensusResult ? `Agreement: ${consensusResult.agreement || '—'} (${consensusResult.coherence?.toFixed(2) || '—'})` : '3 nodes responded'
    }
    if (p === 'intelligence') {
      return 'Computing health assessment...'
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: panelBg,
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        boxShadow: isDark ? '0 12px 48px rgba(0,0,0,0.5)' : '0 12px 48px rgba(99,102,241,0.12)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div
            animate={phase !== 'complete' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: phase === 'complete' ? '#10b981' : '#6366f1',
              boxShadow: phase === 'complete' ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(99,102,241,0.5)',
            }}
          />
          <span style={{
            fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em',
            color: phase === 'complete' ? '#10b981' : '#6366f1',
            textTransform: 'uppercase',
          }}>
            {phase === 'complete' ? 'SCAN COMPLETE' : 'NETWORK SCAN'}
          </span>
        </div>
        {phase === 'complete' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            style={{
              padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              color: textSecondary, cursor: 'pointer',
            }}
          >
            Run Again
          </motion.button>
        )}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Phase indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
          {phaseOrder.map(p => (
            <PhaseRow
              key={p}
              id={p}
              label={PHASE_LABELS[p]}
              isActive={phase === p}
              isComplete={currentIdx > phaseOrder.indexOf(p) || phase === 'complete'}
              detail={getDetail(p)}
            />
          ))}
        </div>

        {/* Coefficient Visualizer — shows during encoding and after */}
        <AnimatePresence>
          {(phase === 'encoding' || currentIdx > 1 || phase === 'complete') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: '16px', overflow: 'hidden' }}
            >
              <CoefficientVisualizer
                coefficients={encoding}
                revealCount={phase === 'encoding' ? subPhase : 128}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Network nodes — shows during network phase and after */}
        <AnimatePresence>
          {(phase === 'network' || phase === 'intelligence' || phase === 'complete') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '16px' }}
            >
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px',
              }}>
                {SPECIALIST_NODES.map((node, i) => {
                  const revealed = (phase === 'network' && subPhase > i) || phase === 'intelligence' || phase === 'complete'
                  const specData = consensusResult?.specialists?.[node.id]
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: revealed ? 1 : 0.3, scale: revealed ? 1 : 0.95 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        padding: '12px', borderRadius: '12px',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${revealed ? node.color + '40' : 'transparent'}`,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 8px',
                        background: `${node.color}20`, border: `2px solid ${node.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {revealed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={node.color} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                        ) : (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: node.color, opacity: 0.5 }} />
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: textPrimary }}>{node.label}</div>
                      <div style={{ fontSize: '10px', color: textMuted }}>{node.region}</div>
                      {revealed && specData && (
                        <div style={{
                          marginTop: '6px', fontSize: '11px', fontWeight: '600',
                          color: specData.tier === 'green' ? '#10b981' : specData.tier === 'yellow' ? '#f59e0b' : '#ef4444',
                        }}>
                          {specData.tier?.toUpperCase()} {specData.score?.toFixed(2)}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results — shows when complete */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ResultPanel
                envData={envData}
                encoding={encoding}
                dustResult={dustResult}
                consensusResult={consensusResult}
                isDark={isDark}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const ResultPanel = ({ envData, encoding, dustResult, consensusResult, isDark, textPrimary, textSecondary }) => {
  const tierColors = {
    green: '#10b981', yellow: '#f59e0b', orange: '#f97316', red: '#ef4444',
    monitoring: '#10b981', watch: '#6366f1', developing: '#f59e0b', likely: '#f97316', imminent: '#ef4444',
  }

  const consensusTier = consensusResult?.tier || 'green'
  const tacticalTier = dustResult?.tier || 'monitoring'
  const location = envData?.location

  return (
    <div style={{
      padding: '20px', borderRadius: '14px',
      background: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.04)',
      border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}`,
    }}>
      <div style={{
        fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
        color: '#10b981', textTransform: 'uppercase', marginBottom: '12px',
      }}>
        NETWORK ASSESSMENT
      </div>

      {/* User location */}
      <div style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, marginBottom: '12px' }}>
        {location?.city || 'Your Location'}{location?.region ? `, ${location.region}` : ''}
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <MetricCard
          label="Your AQI"
          value={envData?.airQuality?.aqi ?? '--'}
          color={envData?.airQuality?.aqiCategory?.color || '#10b981'}
          sub={envData?.airQuality?.aqiCategory?.level}
          isDark={isDark}
        />
        <MetricCard
          label="Network Status"
          value={consensusTier.toUpperCase()}
          color={tierColors[consensusTier]}
          sub={`Coherence ${consensusResult?.coherence?.toFixed(2) || '--'}`}
          isDark={isDark}
        />
        <MetricCard
          label="GSL Tactical"
          value={tacticalTier.toUpperCase()}
          color={tierColors[tacticalTier]}
          sub={dustResult?.firedrill ? 'Firedrill' : 'Live'}
          isDark={isDark}
        />
      </div>

      {/* Encoding fingerprint */}
      {encoding && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
          wordBreak: 'break-all',
        }}>
          <span style={{ color: '#6366f1', fontWeight: '600' }}>ENV_ENCODING</span>{' '}
          [{encoding.slice(0, 8).map(v => v.toFixed(2)).join(', ')}, ...]
        </div>
      )}

      {/* What this means */}
      <div style={{ marginTop: '14px', fontSize: '13px', color: textSecondary, lineHeight: '1.6' }}>
        {consensusTier === 'green'
          ? 'The network sees no environmental health threats at the Great Salt Lake or your location. Three specialist nodes independently confirm safe conditions.'
          : `The network detected elevated conditions. ${consensusResult?.agreement === 'strong' ? 'All three specialists agree' : 'Multiple specialists converging'} — the ensemble catches patterns no single model can see.`
        }
      </div>
    </div>
  )
}

const MetricCard = ({ label, value, color, sub, isDark }) => (
  <div style={{
    padding: '10px', borderRadius: '10px', textAlign: 'center',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  }}>
    <div style={{ fontSize: '18px', fontWeight: '800', color }}>{value}</div>
    <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', marginTop: '2px' }}>{label}</div>
    {sub && <div style={{ fontSize: '10px', color, marginTop: '2px', fontWeight: '600' }}>{sub}</div>}
  </div>
)

export default FiredrillSequence
