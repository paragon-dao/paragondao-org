import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

// ─── Stage 1 tier configuration ─────────────────────────────────────
const TIERS = {
  green: {
    color: '#22c55e', glow: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)',
    gradient: 'linear-gradient(135deg, #166534, #22c55e)',
    label: 'GREEN', meaning: 'Safe. No dust event expected.',
    action: 'Normal outdoor activity.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  yellow: {
    color: '#eab308', glow: '#eab308',
    bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.2)',
    gradient: 'linear-gradient(135deg, #854d0e, #eab308)',
    label: 'YELLOW', meaning: 'Conditions shifting. Monitor.',
    action: 'Check back tonight for updates.',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
  },
  orange: {
    color: '#f97316', glow: '#f97316',
    bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.2)',
    gradient: 'linear-gradient(135deg, #9a3412, #f97316)',
    label: 'ORANGE', meaning: 'Dust event possible in 4-7 days.',
    action: 'Plan indoor alternatives. Check air filters.',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
  },
  red: {
    color: '#ef4444', glow: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)',
    gradient: 'linear-gradient(135deg, #991b1b, #ef4444)',
    label: 'RED', meaning: 'High confidence dust event coming.',
    action: 'Keep vulnerable people indoors. Close windows. Run air purifiers.',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

// ─── Stage 2 tactical tier configuration ────────────────────────────
const TACTICAL_TIERS = {
  monitoring: { color: '#64748b', label: 'MONITORING', bg: 'rgba(100,116,139,0.08)' },
  watch:      { color: '#3b82f6', label: 'WATCH',      bg: 'rgba(59,130,246,0.08)' },
  developing: { color: '#eab308', label: 'DEVELOPING', bg: 'rgba(234,179,8,0.08)' },
  likely:     { color: '#f97316', label: 'LIKELY',     bg: 'rgba(249,115,22,0.08)' },
  imminent:   { color: '#ef4444', label: 'IMMINENT',   bg: 'rgba(239,68,68,0.08)' },
}

// ─── API endpoints ──────────────────────────────────────────────────
const API_BASE = 'https://gsl-dust-predictor.fly.dev'
const API_URL = `${API_BASE}/api/dust/status`
const CONSENSUS_URL = `${API_BASE}/api/dust/consensus`
const TACTICAL_URL = `${API_BASE}/api/dust/tactical`

const SPECIALIST_NODES = [
  { id: 'gsl-dust-dfw', url: 'https://gsl-dust-predictor.fly.dev', region: 'DFW', label: 'Dallas',   specialist: 'hydro', desc: 'Lake level, recession, drought' },
  { id: 'gsl-dust-sjc', url: 'https://gsl-dust-sjc.fly.dev',      region: 'SJC', label: 'San Jose', specialist: 'atmo',  desc: 'Dewpoint, humidity, instability' },
  { id: 'gsl-dust-iad', url: 'https://gsl-dust-iad.fly.dev',      region: 'IAD', label: 'Virginia', specialist: 'wind',  desc: 'NW persistence, speed, dryness' },
]

// ─── Firedrill sequence phases ──────────────────────────────────────
const DRILL_PHASES = [
  { id: 'init',     label: 'INITIALIZING',      duration: 800 },
  { id: 'wind',     label: 'WIND STATIONS',     duration: 1200, detail: 'Querying 4 IEM ASOS stations...',       stations: ['SLC', 'OGD', 'HIF', 'TVY'] },
  { id: 'metar',    label: 'AIRPORT VISIBILITY', duration: 1000, detail: 'Parsing METAR reports...',              stations: ['KSLC', 'KOGD', 'KHIF'] },
  { id: 'pm10',     label: 'PM10 MONITORS',      duration: 800,  detail: 'Querying EPA AirNow...',                stations: ['SLC Area'] },
  { id: 'process',  label: 'SIGNAL PROCESSING',  duration: 1500, detail: 'Computing tactical signals...' },
  { id: 'assess',   label: 'ASSESSMENT',          duration: 1000, detail: 'Determining tactical tier...' },
  { id: 'complete', label: 'DRILL COMPLETE',      duration: 0 },
]

// ─── Helpers ────────────────────────────────────────────────────────
function computeTrend(trend) {
  if (!trend || trend.length < 2) return 'Waiting'
  const recent = trend.slice(-3)
  const first = recent[0].score
  const last = recent[recent.length - 1].score
  const delta = last - first
  if (Math.abs(delta) < 0.05) return 'Stable'
  return delta > 0 ? 'Rising' : 'Falling'
}

function trendColor(trend, isDark) {
  if (trend === 'Rising') return '#f97316'
  if (trend === 'Falling') return '#22c55e'
  return isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
}

const formatTime = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true, timeZoneName: 'short'
  })
}

// ─── Fallback data ──────────────────────────────────────────────────
const FALLBACK_DATA = {
  tier: 'green', score: 0.0,
  updated: new Date().toISOString(),
  conditions: { wind_mph: 0, rh_pct: 0, lake_ft: 4193, nw_persistence_pct: 0, temp_f: 0 },
  trend: [], status: 'loading'
}


// ═════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═════════════════════════════════════════════════════════════════════

function SectionCard({ children, isDark, delay = 0, style = {}, glowColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: '20px',
        padding: '28px',
        backdropFilter: 'blur(20px)',
        boxShadow: glowColor ? `0 0 40px ${glowColor}15, 0 0 80px ${glowColor}08` : 'none',
        transition: 'box-shadow 0.6s ease',
        ...style
      }}
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({ children, isDark, sub }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{
        fontSize: '13px', fontWeight: '700',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        margin: '0 0 4px'
      }}>
        {children}
      </h3>
      {sub && (
        <p style={{
          fontSize: '13px',
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
          margin: 0, lineHeight: 1.5
        }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function ConditionGauge({ label, value, unit, icon, normal, isDark, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        padding: '20px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
          : 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.005))',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
        borderRadius: '14px', position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
        background: isDark
          ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)'
      }} />
      <div style={{
        fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
        textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px'
      }}>
        {icon} {label}
      </div>
      <div style={{
        fontSize: '28px', fontWeight: '700', color: isDark ? '#fff' : '#0f172a',
        fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '-0.02em', lineHeight: 1
      }}>
        {value}
        <span style={{
          fontSize: '14px', fontWeight: '500',
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', marginLeft: '4px'
        }}>
          {unit}
        </span>
      </div>
      {normal && (
        <div style={{
          fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
          marginTop: '6px', fontFamily: "'SF Mono', monospace"
        }}>
          avg: {normal}
        </div>
      )}
    </motion.div>
  )
}


// ═════════════════════════════════════════════════════════════════════
// TREND CHART
// ═════════════════════════════════════════════════════════════════════

function TrendChart({ data, tier, isDark }) {
  if (!data || data.length < 2) {
    return (
      <div style={{
        height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', fontSize: '13px'
      }}>
        Collecting trend data...
      </div>
    )
  }

  const width = 480, height = 160
  const pad = { top: 20, right: 20, bottom: 30, left: 44 }
  const cW = width - pad.left - pad.right
  const cH = height - pad.top - pad.bottom
  const scores = data.map(d => d.score)
  const maxS = Math.max(...scores, 0.25)
  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * cW,
    y: pad.top + cH - (d.score / maxS) * cH
  }))

  const smoothPath = (points) => {
    if (points.length < 2) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  const lineD = smoothPath(pts)
  const areaD = lineD + ` L ${pts[pts.length - 1].x} ${pad.top + cH} L ${pts[0].x} ${pad.top + cH} Z`
  const tc = TIERS[tier]
  const gridLines = [0, 0.05, 0.1, 0.15, 0.2, 0.25].filter(v => v <= maxS)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tc.color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={tc.color} stopOpacity="0.02" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {gridLines.map(v => {
        const y = pad.top + cH - (v / maxS) * cH
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y}
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} strokeDasharray="3,6" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end"
              fill={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
              fontSize="10" fontFamily="'SF Mono', 'Fira Code', monospace">{v.toFixed(2)}</text>
          </g>
        )
      })}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={lineD} fill="none" stroke={tc.color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={isDark ? '#111827' : '#fff'}
            stroke={tc.color} strokeWidth="2.5" />
          {i === pts.length - 1 && (
            <circle cx={p.x} cy={p.y} r="8" fill="none" stroke={tc.color} strokeWidth="1" opacity="0.4">
              <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
      {data.map((d, i) => {
        const x = pad.left + (i / (data.length - 1)) * cW
        return (
          <text key={i} x={x} y={height - 6} textAnchor="middle"
            fill={i === data.length - 1
              ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
              : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)')}
            fontSize="10" fontWeight={i === data.length - 1 ? '600' : '400'}
            fontFamily="'SF Mono', 'Fira Code', monospace">{d.time}</text>
        )
      })}
    </svg>
  )
}


// ═════════════════════════════════════════════════════════════════════
// LEAD TIME COMPARISON
// ═════════════════════════════════════════════════════════════════════

function LeadTimeComparison({ isDark }) {
  const systems = [
    { name: 'EPA AirNow', hours: 0, desc: 'Reactive -- current readings only', color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
    { name: 'NWS Advisory', hours: 9, desc: 'Dust already forming on radar', color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
    { name: 'DEQ Forecast', hours: 24, desc: 'Next-day, general AQI', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' },
    { name: 'GSL Predictor', hours: 136, desc: '3-specialist ensemble, avg 5.7 days', color: '#6366f1', highlight: true }
  ]
  const maxHours = 168

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {systems.map((sys, i) => (
        <motion.div key={sys.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={{
              fontSize: '13px', fontWeight: sys.highlight ? '700' : '500',
              color: sys.highlight ? '#a5b4fc' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
            }}>{sys.name}</span>
            <span style={{
              fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
              fontFamily: "'SF Mono', monospace"
            }}>{sys.hours === 0 ? 'Real-time only' : `${sys.hours}h`}</span>
          </div>
          <div style={{
            height: '8px', borderRadius: '4px', overflow: 'hidden', position: 'relative',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max((sys.hours / maxHours) * 100, 1.5)}%` }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: '4px',
                background: sys.highlight ? 'linear-gradient(90deg, #6366f1, #a78bfa)' : sys.color,
                boxShadow: sys.highlight ? '0 0 12px rgba(99,102,241,0.4)' : 'none'
              }}
            />
          </div>
          <p style={{
            fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
            margin: '4px 0 0', lineHeight: 1.3
          }}>{sys.desc}</p>
        </motion.div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '0 2px' }}>
        {['0h', '1 day', '3 days', '5 days', '7 days'].map((label) => (
          <span key={label} style={{
            fontSize: '9px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
            fontFamily: "'SF Mono', monospace"
          }}>{label}</span>
        ))}
      </div>
    </div>
  )
}


// ═════════════════════════════════════════════════════════════════════
// SPECIALIST ENSEMBLE PANEL
// ═════════════════════════════════════════════════════════════════════

function SpecialistPanel({ consensus, isDark }) {
  if (!consensus) return null

  const specialists = consensus.specialists || {}
  const coherence = consensus.coherence || 0
  const activeCount = consensus.active_specialists || 0
  const totalCount = consensus.total_specialists || 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Specialist cards */}
      {SPECIALIST_NODES.map((node) => {
        const spec = specialists[node.specialist] || {}
        const isActive = spec.score > 0
        const specTier = TIERS[spec.tier] || TIERS.green

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderRadius: '12px',
              background: isActive
                ? (isDark ? `${specTier.color}08` : `${specTier.color}06`)
                : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'),
              border: isActive
                ? `1px solid ${specTier.color}25`
                : (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)'),
              transition: 'all 0.4s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: isActive ? specTier.color : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
                boxShadow: isActive ? `0 0 8px ${specTier.color}60` : 'none',
                transition: 'all 0.4s ease',
              }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: '700',
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                    fontFamily: "'SF Mono', monospace", textTransform: 'uppercase',
                  }}>
                    {node.specialist}
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '4px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
                  }}>
                    {node.region}
                  </span>
                </div>
                <span style={{
                  fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                }}>
                  {node.desc}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '18px', fontWeight: '700',
                fontFamily: "'SF Mono', monospace",
                color: isActive ? specTier.color : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
              }}>
                {(spec.score || 0).toFixed(2)}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                background: isActive ? `${specTier.color}15` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                color: isActive ? specTier.color : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'),
                letterSpacing: '0.04em',
              }}>
                {isActive ? 'ACTIVE' : 'QUIET'}
              </span>
            </div>
          </motion.div>
        )
      })}

      {/* Ensemble summary bar */}
      <div style={{
        marginTop: '4px', padding: '14px 18px', borderRadius: '12px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02))'
          : 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(99,102,241,0.02))',
        border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: '11px', fontWeight: '700', color: '#818cf8',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px',
          }}>
            Ensemble Consensus
          </div>
          <div style={{
            fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          }}>
            {activeCount}/{totalCount} specialists active
            {consensus.agreement && ` \u00B7 ${consensus.agreement}`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', marginBottom: '1px' }}>
              coherence
            </div>
            <div style={{
              fontSize: '16px', fontWeight: '700', fontFamily: "'SF Mono', monospace", color: '#818cf8',
            }}>
              {coherence.toFixed(3)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', marginBottom: '1px' }}>
              score
            </div>
            <div style={{
              fontSize: '16px', fontWeight: '700', fontFamily: "'SF Mono', monospace",
              color: isDark ? '#fff' : '#0f172a',
            }}>
              {(consensus.score || 0).toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// ═════════════════════════════════════════════════════════════════════
// FIREDRILL — THE STAR
// ═════════════════════════════════════════════════════════════════════

function SignalBar({ label, value, weight, description, color, isDark, animate, delay }) {
  const pct = Math.min(value * 100, 100)
  const weightPct = (weight * 100).toFixed(0)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ marginBottom: '16px' }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '13px', fontWeight: '700',
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          }}>
            {label}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '3px',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            fontFamily: "'SF Mono', monospace",
          }}>
            {weightPct}% weight
          </span>
        </div>
        <span style={{
          fontSize: '18px', fontWeight: '800', fontFamily: "'SF Mono', monospace",
          color: value > 0.5 ? color : (value > 0 ? (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')),
        }}>
          {value.toFixed(4)}
        </span>
      </div>

      {/* Gauge bar */}
      <div style={{
        height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animate ? `${Math.max(pct, 0.5)}%` : 0 }}
          transition={{ delay: delay + 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%', borderRadius: '6px',
            background: value > 0.5
              ? `linear-gradient(90deg, ${color}cc, ${color})`
              : value > 0
                ? `linear-gradient(90deg, ${color}66, ${color}99)`
                : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
            boxShadow: value > 0.5 ? `0 0 16px ${color}40` : 'none',
          }}
        />
        {/* Animated scan line during processing */}
        {animate && value === 0 && (
          <motion.div
            initial={{ left: '-10%' }}
            animate={{ left: '110%' }}
            transition={{ delay: delay + 0.1, duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, width: '20%', height: '100%',
              background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}, transparent)`,
            }}
          />
        )}
      </div>

      <div style={{
        fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        marginTop: '4px',
      }}>
        {description}
      </div>
    </motion.div>
  )
}

function DataAcquisitionRow({ label, stations, count, phase, isActive, isDone, isDark, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
        background: isDone
          ? (isDark ? 'rgba(34,197,94,0.04)' : 'rgba(34,197,94,0.03)')
          : isActive
            ? (isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)')
            : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'),
        border: isDone
          ? '1px solid rgba(34,197,94,0.15)'
          : isActive
            ? '1px solid rgba(59,130,246,0.2)'
            : (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)'),
        transition: 'all 0.4s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status indicator */}
          <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
            {isDone ? (
              <motion.svg
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : isActive ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  border: '2px solid rgba(59,130,246,0.2)',
                  borderTop: '2px solid #3b82f6',
                }}
              />
            ) : (
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              }} />
            )}
          </div>

          <div>
            <span style={{
              fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em',
              color: isDone ? '#22c55e' : isActive ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'),
              textTransform: 'uppercase',
            }}>
              {label}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Station dots */}
          {stations && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {stations.map((st, i) => (
                <motion.span
                  key={st}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isDone || isActive ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: isActive ? 0.1 + i * 0.15 : 0, type: 'spring', damping: 15 }}
                  style={{
                    fontSize: '9px', fontWeight: '600', padding: '2px 5px', borderRadius: '3px',
                    fontFamily: "'SF Mono', monospace",
                    background: isDone ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                    color: isDone ? '#22c55e' : '#3b82f6',
                  }}
                >
                  {st}
                </motion.span>
              ))}
            </div>
          )}

          {/* Count badge */}
          {isDone && count !== undefined && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                fontFamily: "'SF Mono', monospace",
                background: count > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                color: count > 0 ? '#22c55e' : '#f59e0b',
              }}
            >
              {count} obs
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function FiredrillPanel({ isDark }) {
  const [drillState, setDrillState] = useState('idle') // idle | running | complete
  const [currentPhase, setCurrentPhase] = useState(0)
  const [tacticalData, setTacticalData] = useState(null)
  const [completedPhases, setCompletedPhases] = useState(new Set())
  const phaseTimers = useRef([])

  const startDrill = useCallback(async () => {
    setDrillState('running')
    setCurrentPhase(0)
    setCompletedPhases(new Set())
    setTacticalData(null)

    // Clear any existing timers
    phaseTimers.current.forEach(t => clearTimeout(t))
    phaseTimers.current = []

    // Start the real API fetch immediately (runs in background)
    const fetchPromise = fetch(`${TACTICAL_URL}?firedrill=true`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)

    // Animate through phases
    let elapsed = 0
    for (let i = 0; i < DRILL_PHASES.length - 1; i++) {
      const phase = DRILL_PHASES[i]
      const timer = setTimeout(() => {
        setCurrentPhase(i)
        // Mark previous phase as done
        if (i > 0) {
          setCompletedPhases(prev => new Set([...prev, DRILL_PHASES[i - 1].id]))
        }
      }, elapsed)
      phaseTimers.current.push(timer)
      elapsed += phase.duration
    }

    // Wait for both the animation sequence and the real data
    const [data] = await Promise.all([
      fetchPromise,
      new Promise(resolve => setTimeout(resolve, elapsed))
    ])

    // Mark all phases complete
    setCompletedPhases(new Set(DRILL_PHASES.map(p => p.id)))
    setCurrentPhase(DRILL_PHASES.length - 1)
    setTacticalData(data)
    setDrillState('complete')
  }, [])

  const resetDrill = useCallback(() => {
    phaseTimers.current.forEach(t => clearTimeout(t))
    phaseTimers.current = []
    setDrillState('idle')
    setCurrentPhase(0)
    setCompletedPhases(new Set())
    setTacticalData(null)
  }, [])

  const signals = tacticalData?.signals || {}
  const dq = tacticalData?.data_quality || {}
  const tTier = TACTICAL_TIERS[tacticalData?.tier] || TACTICAL_TIERS.monitoring

  const currentPhaseData = DRILL_PHASES[currentPhase] || DRILL_PHASES[0]
  const isPhaseActive = (id) => drillState === 'running' && currentPhaseData.id === id
  const isPhaseComplete = (id) => completedPhases.has(id)

  return (
    <div>
      {/* ── IDLE STATE: The big launch button ── */}
      <AnimatePresence mode="wait">
        {drillState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
          >
            <p style={{
              fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
              margin: '0 0 8px', lineHeight: 1.6, maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto',
            }}>
              Activate Stage 2 with real live data. Wind, visibility, and air quality
              sensors report their current readings through the tactical pipeline.
            </p>
            <p style={{
              fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
              margin: '0 0 28px', fontFamily: "'SF Mono', monospace",
            }}>
              Real data. Real scores. Flagged as drill.
            </p>

            <motion.button
              onClick={startDrill}
              whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(59,130,246,0.3), 0 0 80px rgba(59,130,246,0.1)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                padding: '18px 44px', fontSize: '15px', fontWeight: '700',
                color: '#fff', letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                border: '1px solid rgba(59,130,246,0.4)',
                borderRadius: '16px', cursor: 'pointer',
                boxShadow: '0 0 24px rgba(59,130,246,0.2), 0 0 60px rgba(59,130,246,0.08)',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              ACTIVATE STAGE 2 DRILL
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RUNNING + COMPLETE STATE ── */}
      <AnimatePresence>
        {(drillState === 'running' || drillState === 'complete') && (
          <motion.div
            key="drill-active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Firedrill banner */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                padding: '10px 18px', borderRadius: '10px', marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.04))',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <motion.div
                  animate={drillState === 'running' ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: drillState === 'running' ? '#3b82f6' : '#22c55e',
                  }}
                />
                <span style={{
                  fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em',
                  color: drillState === 'running' ? '#3b82f6' : '#22c55e',
                  fontFamily: "'SF Mono', monospace",
                }}>
                  {drillState === 'running' ? 'FIREDRILL IN PROGRESS' : 'FIREDRILL COMPLETE'}
                </span>
              </div>
              {drillState === 'complete' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={resetDrill}
                  style={{
                    fontSize: '11px', fontWeight: '600', padding: '4px 12px',
                    borderRadius: '6px', cursor: 'pointer',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  RUN AGAIN
                </motion.button>
              )}
            </motion.div>

            {/* ── PHASE 1: DATA ACQUISITION ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ marginBottom: '24px' }}
            >
              <div style={{
                fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
                color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                textTransform: 'uppercase', marginBottom: '10px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <div style={{
                  width: '16px', height: '1px',
                  background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                }} />
                DATA ACQUISITION
              </div>

              <DataAcquisitionRow
                label="IEM ASOS Wind Data"
                stations={['SLC', 'OGD', 'HIF', 'TVY']}
                count={dq.wind_observations}
                isActive={isPhaseActive('wind')}
                isDone={isPhaseComplete('wind')}
                isDark={isDark}
                delay={0.3}
              />
              <DataAcquisitionRow
                label="METAR Airport Visibility"
                stations={['KSLC', 'KOGD', 'KHIF']}
                count={dq.metar_observations}
                isActive={isPhaseActive('metar')}
                isDone={isPhaseComplete('metar')}
                isDark={isDark}
                delay={0.4}
              />
              <DataAcquisitionRow
                label="EPA PM10 Monitors"
                stations={['SLC Area']}
                count={dq.pm10_observations}
                isActive={isPhaseActive('pm10')}
                isDone={isPhaseComplete('pm10')}
                isDark={isDark}
                delay={0.5}
              />
            </motion.div>

            {/* ── PHASE 2: SIGNAL PROCESSING ── */}
            <AnimatePresence>
              {(isPhaseComplete('pm10') || isPhaseActive('process') || drillState === 'complete') && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  style={{ marginBottom: '24px' }}
                >
                  <div style={{
                    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
                    color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                    textTransform: 'uppercase', marginBottom: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <div style={{
                      width: '16px', height: '1px',
                      background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                    }} />
                    SIGNAL ANALYSIS
                  </div>

                  <SignalBar
                    label="Wind Sustained"
                    value={signals.wind_sustained?.value || 0}
                    weight={0.40}
                    description="NW wind > 25 mph sustained 3+ hours from lake direction"
                    color="#3b82f6"
                    isDark={isDark}
                    animate={drillState === 'complete'}
                    delay={0}
                  />
                  <SignalBar
                    label="Visibility Drop"
                    value={signals.visibility_drop?.value || 0}
                    weight={0.35}
                    description="Airport visibility dropping below 5 miles -- ground truth"
                    color="#8b5cf6"
                    isDark={isDark}
                    animate={drillState === 'complete'}
                    delay={0.15}
                  />
                  <SignalBar
                    label="PM10 Rising"
                    value={signals.pm10_rising?.value || 0}
                    weight={0.25}
                    description="Particulate monitors showing rising dust levels"
                    color="#f59e0b"
                    isDark={isDark}
                    animate={drillState === 'complete'}
                    delay={0.3}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── PHASE 3: TACTICAL ASSESSMENT REVEAL ── */}
            <AnimatePresence>
              {drillState === 'complete' && tacticalData && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, type: 'spring', damping: 20 }}
                >
                  <div style={{
                    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
                    color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                    textTransform: 'uppercase', marginBottom: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <div style={{
                      width: '16px', height: '1px',
                      background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                    }} />
                    TACTICAL ASSESSMENT
                  </div>

                  <motion.div
                    initial={{ boxShadow: 'none' }}
                    animate={{ boxShadow: `0 0 30px ${tTier.color}20, 0 0 60px ${tTier.color}08` }}
                    transition={{ delay: 0.8, duration: 1 }}
                    style={{
                      padding: '24px', borderRadius: '16px',
                      background: isDark
                        ? `linear-gradient(135deg, ${tTier.color}0a, ${tTier.color}03)`
                        : `linear-gradient(135deg, ${tTier.color}08, ${tTier.color}02)`,
                      border: `1px solid ${tTier.color}30`,
                      textAlign: 'center',
                    }}
                  >
                    {/* Tier orb */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring', damping: 15, stiffness: 150 }}
                      style={{
                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                        background: `radial-gradient(circle at 35% 30%, ${tTier.color}dd, ${tTier.color}88 60%, ${tTier.color}44)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 24px ${tTier.color}30, 0 0 48px ${tTier.color}15`,
                      }}
                    >
                      <span style={{
                        fontSize: '14px', fontWeight: '800', color: '#fff',
                        letterSpacing: '0.08em', textShadow: '0 1px 8px rgba(0,0,0,0.3)',
                      }}>
                        {tTier.label}
                      </span>
                    </motion.div>

                    {/* Score */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div style={{
                        fontSize: '32px', fontWeight: '800', fontFamily: "'SF Mono', monospace",
                        color: tTier.color, letterSpacing: '-0.02em',
                      }}>
                        {tacticalData.tactical_score.toFixed(4)}
                      </div>
                      <div style={{
                        fontSize: '13px', fontWeight: '500', marginTop: '6px',
                        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        lineHeight: 1.5,
                      }}>
                        {tacticalData.message}
                      </div>
                    </motion.div>

                    {/* Stage 1 context */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      style={{
                        marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
                        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        display: 'flex', justifyContent: 'center', gap: '20px',
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em',
                          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                          textTransform: 'uppercase', marginBottom: '2px',
                        }}>Stage 1 Score</div>
                        <div style={{
                          fontSize: '14px', fontWeight: '700', fontFamily: "'SF Mono', monospace",
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        }}>
                          {tacticalData.stage1_score.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em',
                          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                          textTransform: 'uppercase', marginBottom: '2px',
                        }}>Stage 1 Watch</div>
                        <div style={{
                          fontSize: '14px', fontWeight: '700', fontFamily: "'SF Mono', monospace",
                          color: tacticalData.stage1_watch_active ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'),
                        }}>
                          {tacticalData.stage1_watch_active ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '9px', fontWeight: '700', letterSpacing: '0.06em',
                          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                          textTransform: 'uppercase', marginBottom: '2px',
                        }}>Mode</div>
                        <div style={{
                          fontSize: '14px', fontWeight: '700', fontFamily: "'SF Mono', monospace",
                          color: '#f59e0b',
                        }}>
                          FIREDRILL
                        </div>
                      </div>
                    </motion.div>

                    {/* Timestamp */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3 }}
                      style={{
                        marginTop: '12px', fontSize: '11px',
                        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {formatTime(tacticalData.updated)}
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ═════════════════════════════════════════════════════════════════════
// PASSWORD GATE
// ═════════════════════════════════════════════════════════════════════

const ACCESS_CODE = 'gift4utah-1'

function PasswordGate({ onUnlock, isDark }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.toLowerCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem('dust-access', 'granted')
      onUnlock()
    } else {
      setError(true)
      setCode('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <>
      <Header />
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDark ? '#060610' : '#f0f4f8', paddingTop: '64px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center', maxWidth: '400px', padding: '48px 32px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '24px', backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: isDark
              ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))'
              : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700', color: isDark ? '#fff' : '#0f172a',
            margin: '0 0 8px', letterSpacing: '-0.02em'
          }}>
            Research Preview
          </h2>
          <p style={{
            fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
            margin: '0 0 28px', lineHeight: 1.5
          }}>
            This dashboard is in validation. Enter access code to continue.
          </p>
          <form onSubmit={handleSubmit}>
            <input ref={inputRef} type="text" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Access code" autoComplete="off"
              style={{
                width: '100%', padding: '14px 18px', fontSize: '16px',
                fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '0.1em', textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: error ? '2px solid #ef4444' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'),
                borderRadius: '12px', color: isDark ? '#fff' : '#0f172a',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease'
              }}
            />
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', marginTop: '14px', padding: '14px', fontSize: '14px', fontWeight: '600',
                color: '#fff', background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                border: 'none', borderRadius: '12px', cursor: 'pointer', letterSpacing: '0.02em'
              }}
            >
              Access Dashboard
            </motion.button>
          </form>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: '13px', color: '#ef4444', margin: '14px 0 0', fontWeight: '500' }}>
              Invalid code
            </motion.p>
          )}
          <p style={{
            fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
            margin: '24px 0 0', lineHeight: 1.5
          }}>
            Univault Technologies LLC
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}


// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export default function DustDashboardPage() {
  const { isDark } = useTheme()
  const [data, setData] = useState(FALLBACK_DATA)
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(true)
  const [consensus, setConsensus] = useState(null)

  // Fetch Stage 1 status
  useEffect(() => {
    if (!unlocked) return
    const fetchStatus = async () => {
      try {
        const res = await fetch(API_URL)
        if (res.ok) {
          const json = await res.json()
          if (json.conditions && Object.keys(json.conditions).length > 0) {
            setData(json)
          }
        }
      } catch (err) {
        console.warn('Dust API fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [unlocked])

  // Fetch ensemble consensus
  useEffect(() => {
    if (!unlocked) return
    const fetchConsensus = async () => {
      try {
        const res = await fetch(CONSENSUS_URL)
        if (res.ok) {
          const json = await res.json()
          setConsensus(json)
        }
      } catch (err) {
        console.warn('Consensus fetch failed:', err)
      }
    }
    fetchConsensus()
    const interval = setInterval(fetchConsensus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [unlocked])

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} isDark={isDark} />
  }

  const tierConfig = TIERS[data.tier] || TIERS.green

  const dynamicStyles = `
    @keyframes stoplight-breathe {
      0%, 100% {
        box-shadow:
          0 0 30px ${tierConfig.color}30, 0 0 60px ${tierConfig.color}15,
          0 0 100px ${tierConfig.color}08, inset 0 0 30px ${tierConfig.color}10;
      }
      50% {
        box-shadow:
          0 0 40px ${tierConfig.color}45, 0 0 80px ${tierConfig.color}20,
          0 0 120px ${tierConfig.color}10, inset 0 0 40px ${tierConfig.color}15;
      }
    }
    @keyframes ring-expand {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes status-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `

  return (
    <>
      <SEO
        title="Great Salt Lake Dust Predictor -- ParagonDAO"
        description="Two-stage early warning for Great Salt Lake dust storms. 91% detection, 5.7-day lead time. Three specialist ensemble + tactical realtime monitoring."
      />
      <style>{dynamicStyles}</style>
      <Header />

      <div style={{
        minHeight: '100vh',
        background: isDark
          ? '#060610'
          : 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 30%, #f8fafc 100%)',
        paddingTop: '64px', transition: 'background 0.3s ease'
      }}>

        {/* ─── HERO SECTION ──────────────────────────────────────────── */}
        <div style={{
          position: 'relative', overflow: 'hidden', padding: '60px 16px 50px',
          background: isDark
            ? `radial-gradient(ellipse 80% 50% at 50% 30%, ${tierConfig.color}08, transparent 70%)`
            : 'transparent'
        }}>
          {isDark && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)'
            }} />
          )}

          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* Status badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '100px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                fontSize: '12px', fontWeight: '600',
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                letterSpacing: '0.02em'
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#22c55e', animation: 'status-dot 2s ease-in-out infinite'
                }} />
                STAGE 1 STRATEGIC -- Updated hourly
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              style={{
                textAlign: 'center', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '800',
                color: isDark ? '#fff' : '#0f172a', margin: '0 0 12px',
                letterSpacing: '-0.03em', lineHeight: 1.1
              }}
            >
              Great Salt Lake
              <br />
              <span style={{
                background: isDark
                  ? 'linear-gradient(135deg, #a5b4fc, #6366f1)'
                  : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Dust Predictor
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              style={{
                textAlign: 'center', fontSize: '16px',
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
                margin: '0 auto 40px', maxWidth: '520px', lineHeight: 1.6
              }}
            >
              Two-stage early warning. 3 specialists detect conditions 4-7 days out.
              <br />
              Tactical monitoring narrows to the hour when a watch is active.
            </motion.p>

            {/* THE STOPLIGHT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 20 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <div style={{
                  position: 'absolute', inset: '-15px', borderRadius: '50%',
                  border: `2px solid ${tierConfig.color}20`, animation: 'ring-expand 3s ease-out infinite'
                }} />
                <div style={{
                  position: 'absolute', inset: '-15px', borderRadius: '50%',
                  border: `2px solid ${tierConfig.color}15`, animation: 'ring-expand 3s ease-out infinite 1s'
                }} />
                <div style={{
                  width: '200px', height: '200px', borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%, ${tierConfig.color}ee, ${tierConfig.color}99 50%, ${tierConfig.color}55 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'stoplight-breathe 4s ease-in-out infinite', position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', top: '15%', left: '25%', width: '35%', height: '25%',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(10px)'
                  }} />
                  <span style={{
                    fontSize: '36px', fontWeight: '800', color: '#fff',
                    textShadow: '0 2px 12px rgba(0,0,0,0.3)', letterSpacing: '0.08em',
                    position: 'relative', zIndex: 1
                  }}>
                    {tierConfig.label}
                  </span>
                </div>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{
                  fontSize: '20px', fontWeight: '600', color: tierConfig.color,
                  margin: '0 0 6px', textAlign: 'center',
                  textShadow: isDark ? `0 0 20px ${tierConfig.color}30` : 'none'
                }}>
                {tierConfig.meaning}
              </motion.p>
              <p style={{
                fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                margin: '0 0 16px', textAlign: 'center'
              }}>
                {tierConfig.action}
              </p>
              <p style={{
                fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                margin: 0, fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '0.02em'
              }}>
                {formatTime(data.updated)}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ─── CONTENT SECTIONS ──────────────────────────────────────── */}
        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '0 16px 80px',
          display: 'flex', flexDirection: 'column', gap: '24px'
        }}>

          {/* Conditions + Trend row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px'
          }}>
            <SectionCard isDark={isDark} delay={0.3}>
              <SectionTitle isDark={isDark}>Current Conditions</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <ConditionGauge label="Wind" value={data.conditions.wind_mph} unit="mph"
                  icon="Wind" normal="12 mph" isDark={isDark} delay={0.35} />
                <ConditionGauge label="Humidity" value={data.conditions.rh_pct} unit="%"
                  icon="RH" normal="38%" isDark={isDark} delay={0.4} />
                <ConditionGauge label="Lake Level" value={data.conditions.lake_ft.toFixed(1)} unit="ft"
                  icon="Level" normal="4,193 ft" isDark={isDark} delay={0.45} />
                <ConditionGauge label="NW Persist" value={data.conditions.nw_persistence_pct} unit="%"
                  icon="NW" normal="10%" isDark={isDark} delay={0.5} />
              </div>
            </SectionCard>

            <SectionCard isDark={isDark} delay={0.35}>
              <SectionTitle isDark={isDark} sub="Risk score over the last 3 days">72-Hour Trend</SectionTitle>
              <TrendChart data={data.trend} tier={data.tier} isDark={isDark} />
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: '12px',
                padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: tierConfig.color, fontFamily: "'SF Mono', monospace" }}>
                    {data.score.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Trend
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: trendColor(computeTrend(data.trend), isDark), fontFamily: "'SF Mono', monospace" }}>
                    {computeTrend(data.trend)}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ─── SPECIALIST ENSEMBLE ─────────────────────────────────── */}
          <SectionCard isDark={isDark} delay={0.42}>
            <SectionTitle isDark={isDark}
              sub="3 specialists see different evidence. Consensus requires agreement across independent lines.">
              Specialist Ensemble
            </SectionTitle>
            <SpecialistPanel consensus={consensus} isDark={isDark} />
          </SectionCard>

          {/* ─── FIREDRILL: STAGE 2 TACTICAL MONITORING ──────────────── */}
          <SectionCard isDark={isDark} delay={0.48} glowColor="#3b82f6">
            <SectionTitle isDark={isDark}
              sub="When Stage 1 fires a Dust Watch, Stage 2 activates. Run a live drill to see the tactical pipeline in action with real sensor data.">
              Stage 2: Tactical Monitoring
            </SectionTitle>
            <FiredrillPanel isDark={isDark} />
          </SectionCard>

          {/* Alert Tiers — Stage 1 */}
          <SectionCard isDark={isDark} delay={0.52}>
            <SectionTitle isDark={isDark}>Stage 1 Alert Levels</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {Object.entries(TIERS).map(([key, t]) => (
                <div key={key} style={{
                  padding: '16px 12px', borderRadius: '14px',
                  background: data.tier === key ? t.bg : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                  border: data.tier === key
                    ? `2px solid ${t.border}`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  textAlign: 'center', transition: 'all 0.3s ease', position: 'relative'
                }}>
                  {data.tier === key && (
                    <div style={{
                      position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '9px', fontWeight: '700', color: isDark ? '#111' : '#fff',
                      background: t.color, padding: '2px 10px',
                      borderRadius: '0 0 6px 6px', letterSpacing: '0.05em'
                    }}>
                      NOW
                    </div>
                  )}
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: t.color, margin: '0 auto 10px',
                    boxShadow: data.tier === key ? `0 0 12px ${t.color}60` : 'none',
                    opacity: data.tier === key ? 1 : 0.5
                  }} />
                  <div style={{
                    fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px',
                    color: data.tier === key ? t.color : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
                  }}>{t.label}</div>
                  <div style={{
                    fontSize: '10px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', lineHeight: 1.4
                  }}>{t.meaning}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Lead Time Comparison */}
          <SectionCard isDark={isDark} delay={0.58}>
            <SectionTitle isDark={isDark}
              sub="No existing Utah system predicts GSL dust events more than 24 hours out.">
              Early Warning Comparison
            </SectionTitle>
            <LeadTimeComparison isDark={isDark} />
          </SectionCard>

          {/* How It Works — Two-Stage Architecture */}
          <SectionCard isDark={isDark} delay={0.62}>
            <SectionTitle isDark={isDark}>How It Works</SectionTitle>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px', position: 'relative'
            }}>
              {[
                { num: '01', title: '4 ASOS Stations', desc: 'Hourly weather from stations surrounding the Great Salt Lake + USGS lake level', accent: '#6366f1' },
                { num: '02', title: '3 Specialist Models', desc: 'Hydro (lake recession + drought), Atmo (dewpoint + humidity instability), Wind (NW transport + dryness)', accent: '#8b5cf6' },
                { num: '03', title: 'Ensemble Consensus', desc: 'Kuramoto coherence measures agreement. Watch fires when 2+ specialists converge above threshold.', accent: '#a78bfa' },
                { num: '04', title: 'Tactical Monitoring', desc: 'Stage 2 activates: hourly wind, airport visibility (METAR), PM10 monitors narrow to specific hours.', accent: '#3b82f6' }
              ].map((step, i) => (
                <motion.div key={step.num}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  style={{
                    padding: '20px 16px', borderRadius: '14px',
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    fontSize: '32px', fontWeight: '800', color: step.accent, opacity: 0.15,
                    position: 'absolute', top: '10px', right: '14px',
                    fontFamily: "'SF Mono', monospace", lineHeight: 1
                  }}>{step.num}</div>
                  <div style={{
                    width: '3px', height: '20px', borderRadius: '2px',
                    background: step.accent, marginBottom: '12px', opacity: 0.6
                  }} />
                  <div style={{
                    fontSize: '15px', fontWeight: '700', color: isDark ? '#fff' : '#0f172a', marginBottom: '6px'
                  }}>{step.title}</div>
                  <div style={{
                    fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', lineHeight: 1.5
                  }}>{step.desc}</div>
                </motion.div>
              ))}
            </div>
          </SectionCard>

          {/* Performance */}
          <SectionCard isDark={isDark} delay={0.7}>
            <SectionTitle isDark={isDark} sub="Cross-validated on 40 EPA-confirmed dust events (2022-2025)">
              Performance
            </SectionTitle>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '2px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              borderRadius: '14px', overflow: 'hidden'
            }}>
              {[
                { value: '91%', label: 'Ensemble Recall', sub: 'Stage 1 detection' },
                { value: '5.7d', label: 'Avg Lead Time', sub: '~136 hours' },
                { value: '3', label: 'Specialists', sub: 'hydro + atmo + wind' },
                { value: '2', label: 'Stages', sub: 'strategic + tactical' },
                { value: '4', label: 'Weather Stations', sub: 'ASOS network' },
                { value: '$5', label: 'Monthly Cost', sub: 'All data free' }
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  style={{ padding: '20px 16px', background: isDark ? '#0a0a14' : '#fff', textAlign: 'center' }}
                >
                  <div style={{
                    fontSize: '26px', fontWeight: '800', color: isDark ? '#fff' : '#0f172a',
                    fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '-0.02em', lineHeight: 1
                  }}>{stat.value}</div>
                  <div style={{
                    fontSize: '11px', fontWeight: '600', marginTop: '6px', textTransform: 'uppercase',
                    color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', letterSpacing: '0.04em'
                  }}>{stat.label}</div>
                  <div style={{
                    fontSize: '10px', marginTop: '2px',
                    color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
                  }}>{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </SectionCard>

          {/* Data Sources */}
          <SectionCard isDark={isDark} delay={0.8}>
            <SectionTitle isDark={isDark}>Data Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'IEM (Iowa Environmental Mesonet)', data: '4 ASOS stations -- Stage 1 daily + Stage 2 hourly', status: 'Live', free: true },
                { name: 'USGS Water Services', data: 'Great Salt Lake level + 30-day recession', status: 'Live', free: true },
                { name: 'aviationweather.gov', data: 'METAR airport visibility -- KSLC, KOGD, KHIF', status: 'Live', free: true },
                { name: 'EPA AirNow', data: 'Real-time PM10 hourly readings', status: 'Live', free: true },
                { name: 'EPA AQS', data: '40 dust events -- cross-validation ground truth', status: 'Archive', free: true }
              ].map((src) => (
                <div key={src.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: '10px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                  border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: src.status === 'Live' ? '#22c55e' : '#6366f1',
                      boxShadow: src.status === 'Live' ? '0 0 6px rgba(34,197,94,0.4)' : 'none'
                    }} />
                    <div>
                      <span style={{
                        fontSize: '13px', fontWeight: '600',
                        color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                      }}>{src.name}</span>
                      <span style={{
                        fontSize: '12px', marginLeft: '8px',
                        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                      }}> -- {src.data}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {src.free && (
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                        background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)',
                        color: '#22c55e', letterSpacing: '0.03em'
                      }}>FREE</span>
                    )}
                    <span style={{
                      fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                      background: src.status === 'Live'
                        ? (isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)')
                        : (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'),
                      color: src.status === 'Live' ? '#22c55e' : '#6366f1', letterSpacing: '0.03em'
                    }}>{src.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '32px 0 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <img src="/favicon.svg" alt="" style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.5 }} />
              <span style={{
                fontSize: '12px', fontWeight: '600', letterSpacing: '0.03em',
                color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
              }}>ParagonDAO</span>
            </div>
            <p style={{
              fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
              lineHeight: 1.7, margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto'
            }}>
              Experimental deployment. Not a substitute for official weather warnings.
              <br />
              Two-stage architecture: Specialist Ensemble (v4.0) + Tactical Monitoring.
              <br />
              Univault Technologies LLC
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}
