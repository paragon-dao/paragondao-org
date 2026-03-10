import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import { Link } from 'react-router-dom'

const TACTICAL_URL = 'https://gsl-dust-predictor.fly.dev/api/dust/tactical'
const CONSENSUS_URL = 'https://gsl-dust-predictor.fly.dev/api/dust/consensus'

const GSL_LAT = 40.7
const GSL_LON = -112.5

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const TIER_CONFIG = {
  monitoring: { color: '#10b981', label: 'CLEAR', desc: 'No dust threat detected' },
  watch: { color: '#6366f1', label: 'WATCH', desc: 'Conditions developing — monitoring' },
  developing: { color: '#f59e0b', label: 'DEVELOPING', desc: 'Elevated risk — dust event forming' },
  likely: { color: '#f97316', label: 'LIKELY', desc: 'High risk — dust event probable' },
  imminent: { color: '#ef4444', label: 'IMMINENT', desc: 'Dust event in progress or imminent' },
}

const GSLSentinelCard = ({ userLat, userLon }) => {
  const { isDark } = useTheme()
  const [tactical, setTactical] = useState(null)
  const [consensus, setConsensus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isNearby = userLat && userLon
    ? distanceKm(userLat, userLon, GSL_LAT, GSL_LON) < 500
    : false
  const distMiles = userLat && userLon
    ? Math.round(distanceKm(userLat, userLon, GSL_LAT, GSL_LON) * 0.621371)
    : null

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          fetch(TACTICAL_URL).then(r => r.json()),
          fetch(CONSENSUS_URL).then(r => r.json()),
        ])
        if (!cancelled) {
          setTactical(tRes)
          setConsensus(cRes)
        }
      } catch (e) {
        if (!cancelled) setError('Sentinel offline')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#64748b'

  const tier = tactical?.tier || 'monitoring'
  const tc = TIER_CONFIG[tier] || TIER_CONFIG.monitoring
  const agreement = consensus?.agreement || 'nominal'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: '16px', overflow: 'hidden',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.08)'}`,
        background: isDark ? 'rgba(15, 15, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* Tier color bar */}
      <div style={{ height: '3px', background: tc.color }} />

      <div style={{ padding: '16px 20px' }}>
        {/* Top row: title + tier badge */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: tc.color, boxShadow: `0 0 6px ${tc.color}60`,
            }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: textPrimary }}>
                Great Salt Lake Sentinel
              </div>
              <div style={{ fontSize: '11px', color: textMuted }}>
                3 nodes &middot; Hydro + Atmo + Wind &middot; 91% recall
              </div>
            </div>
          </div>

          <div style={{
            padding: '4px 12px', borderRadius: '100px',
            background: `${tc.color}12`, border: `1px solid ${tc.color}30`,
            fontSize: '11px', fontWeight: '800', color: tc.color,
            letterSpacing: '0.05em',
          }}>
            {loading ? '...' : tc.label}
          </div>
        </div>

        {/* Status description */}
        {!loading && !error && (
          <div style={{
            fontSize: '13px', color: textSecondary, lineHeight: '1.5',
            marginBottom: '10px',
          }}>
            {tc.desc}
            {consensus && (
              <span style={{ color: textMuted }}>
                {' '}&middot; Agreement: {agreement} ({consensus.coherence?.toFixed(2)})
              </span>
            )}
          </div>
        )}

        {/* Personal relevance for nearby users */}
        {isNearby && !loading && (
          <div style={{
            padding: '8px 12px', borderRadius: '8px', marginBottom: '10px',
            background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.03)',
            border: `1px solid ${isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)'}`,
            fontSize: '12px', color: textSecondary, lineHeight: '1.5',
          }}>
            You're <strong style={{ color: '#f59e0b' }}>{distMiles} miles</strong> from the lake.
            Dust from exposed lakebed reaches your area during NW wind events.
            This sentinel gives you 4-7 days of advance warning.
          </div>
        )}

        {loading && (
          <div style={{ fontSize: '12px', color: textMuted, marginBottom: '10px' }}>
            Connecting to sentinel nodes...
          </div>
        )}

        {error && (
          <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        {/* Dashboard link */}
        <Link
          to="/great-salt-lake/dust"
          style={{
            display: 'block', textAlign: 'center',
            padding: '8px', borderRadius: '8px',
            background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.03)',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}`,
            color: '#6366f1', fontSize: '12px', fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          View Full Dashboard →
        </Link>
      </div>
    </motion.div>
  )
}

export default GSLSentinelCard
