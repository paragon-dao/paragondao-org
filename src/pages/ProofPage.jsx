import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { HFTPClient } from '../agent/hftp-client'

// ─── Animated number counter ────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0, duration = 1.2, prefix = '', suffix = '', style }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView || value == null) return
    const num = parseFloat(value)
    if (isNaN(num)) { setDisplay(String(value)); return }
    const controls = animate(0, num, {
      duration,
      ease: 'easeOut',
      onUpdate: v => setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()),
    })
    return () => controls.stop()
  }, [inView, value, decimals, duration])

  return <span ref={ref} style={style}>{prefix}{display}{suffix}</span>
}

// ─── Pulsing dot ────────────────────────────────────────────────────────────
function PulsingDot({ color = '#10b981', size = 10 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <span style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%', background: color,
        animation: 'pulse-ring 1.5s ease-out infinite',
      }} />
      <span style={{
        position: 'relative', display: 'block',
        width: size, height: size,
        borderRadius: '50%', background: color,
      }} />
    </span>
  )
}

// ─── Copy button ────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        position: 'absolute', top: 12, right: 12,
        padding: '6px 12px', borderRadius: '6px',
        background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}`,
        color: copied ? '#10b981' : 'rgba(255,255,255,0.7)',
        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ children, style = {} }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px', ...style }}
    >
      {children}
    </motion.section>
  )
}

// ─── Uptime formatter ────────────────────────────────────────────────────────
function formatUptime(seconds) {
  if (!seconds) return '--'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// ═════════════════════════════════════════════════════════════════════════════
// PROOF PAGE
// ═════════════════════════════════════════════════════════════════════════════
const ProofPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser

  const [nodeHealth, setNodeHealth] = useState(null)
  const [nodeError, setNodeError] = useState(false)
  const [proofResults, setProofResults] = useState(null)
  const [hftpPeers, setHftpPeers] = useState([])
  const [hftpConnected, setHftpConnected] = useState(false)
  const [hftpAggregate, setHftpAggregate] = useState(null)

  // Theme colors
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  const green = '#10b981'
  const termBg = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(15,23,42,0.95)'

  // Fetch live node health
  useEffect(() => {
    fetch('https://bagle-api.fly.dev/health')
      .then(r => r.json())
      .then(data => setNodeHealth(data))
      .catch(() => setNodeError(true))
  }, [])

  // Load proof results
  useEffect(() => {
    fetch('/proofs/1-fixed-payload/proof-1-fixed-payload-results.json')
      .then(r => r.json())
      .then(data => setProofResults(data))
      .catch(() => {})
  }, [])

  // Connect to HFTP registry for live node list
  useEffect(() => {
    let client = null
    const connect = async () => {
      try {
        client = new HFTPClient()
        client.onPeersUpdate = (peerList) => {
          // Filter out browser nodes — only show server/haven nodes
          setHftpPeers(peerList.filter(p => p.type === 'server' || p.type === 'haven' || p.type === 'relay'))
        }
        client.onAggregateUpdate = (agg) => setHftpAggregate(agg)
        client.onConnectionChange = (c) => setHftpConnected(c)
        await client.connect()
        setHftpConnected(true)
      } catch {
        setHftpConnected(false)
      }
    }
    connect()
    return () => { if (client) client.disconnect() }
  }, [])

  const curlCommand = `curl https://bagle-api.fly.dev/health | python3 -m json.tool`

  // Scaling data
  const scalingData = [
    { participants: '1M', perPerson: '512 B', total: '512 MB', perNode: '512 KB', hardware: 'Any device' },
    { participants: '100M', perPerson: '512 B', total: '51 GB', perNode: '51 MB', hardware: 'Old phone' },
    { participants: '1B', perPerson: '512 B', total: '512 GB', perNode: '512 MB', hardware: 'Raspberry Pi' },
    { participants: '8B', perPerson: '512 B', total: '3.73 TB', perNode: '3.73 GB', hardware: 'Laptop' },
  ]

  const comparisonData = [
    { name: 'Bitcoin', size: '600 GB+', pct: 95, color: '#f59e0b', note: 'per node (growing)' },
    { name: 'Ethereum', size: '1 TB+', pct: 100, color: '#6366f1', note: 'per node (growing)' },
    { name: 'Health Chain', size: '80 PB', pct: 80, color: '#ef4444', note: 'for 8B people (naive)' },
    { name: 'PRN (ours)', size: '3.73 TB', pct: 4, color: '#10b981', note: 'for 8B people (sharded)' },
  ]

  const incentiveSteps = [
    'Low hardware barrier',
    'More nodes join',
    'More shards available',
    'Smaller per-node storage',
    'Even older hardware can participate',
    'More geographic distribution',
    'Network more resilient',
    'More valuable to participants',
    'More people want to run nodes',
  ]

  const stakeholders = [
    {
      title: 'For You',
      desc: 'Your health data never leaves your device. A 512-byte snapshot is all the network sees.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      title: 'For Your Family',
      desc: "Dad's old iPhone becomes a family health node. Earn from running it.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      title: 'For Hospitals',
      desc: 'Instant baseline comparison. No redundant tests. Works across any system.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
    },
    {
      title: 'For the World',
      desc: '3.73 TB for all of humanity. A $35 Raspberry Pi can participate.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease',
    }}>
      <SEO
        title="The Network — ParagonDAO"
        description="The first health network where adding people makes it cheaper to run. 512 bytes per health snapshot. See it. Verify it. Run it."
        path="/network"
      />
      <Background />
      <Header
        isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')}
      />

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>

        {/* ═══ SECTION 1: HERO ═══ */}
        <section style={{
          minHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '120px 24px 80px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p style={{
              fontSize: '13px', fontWeight: '600',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: green, marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <PulsingDot color={nodeError ? '#ef4444' : green} />
              {nodeHealth
                ? `${hftpPeers.length + 1} node${hftpPeers.length + 1 !== 1 ? 's' : ''} online${hftpConnected ? ' — registry live' : ''}`
                : nodeError ? 'Checking network...' : 'Connecting...'}
            </p>

            <h1 style={{
              fontSize: 'clamp(40px, 7vw, 72px)',
              fontWeight: '800', letterSpacing: '-0.03em',
              color: textPrimary, lineHeight: 1.05,
              marginBottom: '24px',
            }}>
              THE NETWORK IS LIVE
            </h1>

            <p style={{
              fontSize: 'clamp(17px, 2.5vw, 22px)',
              color: textPrimary, maxWidth: '700px', margin: '0 auto 16px',
              lineHeight: 1.5, fontWeight: '500',
            }}>
              3.6 billion people have no access to continuous health monitoring.
              Not because the technology doesn&rsquo;t exist &mdash; because the infrastructure was never built for them.
            </p>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: textSecondary, maxWidth: '640px', margin: '0 auto 48px',
              lineHeight: 1.6,
            }}>
              This is the first health network where adding people makes it cheaper to run, not more expensive.
              A phone. 30 seconds. 512 bytes. That&rsquo;s all it takes.
            </p>

            <motion.a
              href="#live-nodes"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: '600', fontSize: '16px',
                textDecoration: 'none', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(16,185,129,0.3)',
              }}
            >
              See the proof
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </motion.a>
          </motion.div>
        </section>

        {/* ═══ SECTION 2: LIVE NODE DASHBOARD ═══ */}
        <Section style={{ paddingTop: '40px' }}>
          <div id="live-nodes" style={{ position: 'relative', top: '-100px' }} />
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: green, marginBottom: '12px',
          }}>
            Live Nodes
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '48px', letterSpacing: '-0.02em',
          }}>
            See it. Verify it. Run it.
          </h3>

          {/* Node cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px', marginBottom: '40px',
          }}>
            {/* Node 1: bagle-api */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: '16px', padding: '28px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <PulsingDot color={nodeHealth ? green : '#ef4444'} size={12} />
                <span style={{ fontSize: '18px', fontWeight: '700', color: textPrimary }}>
                  bagle-api
                </span>
                <span style={{
                  marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px',
                  background: nodeHealth ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: nodeHealth ? green : '#ef4444',
                  fontSize: '12px', fontWeight: '600',
                }}>
                  {nodeHealth ? 'ONLINE' : 'CHECKING'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</p>
                  <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                    {nodeHealth?.region || 'sjc'} (San Jose)
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uptime</p>
                  <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                    {nodeHealth?.uptime_seconds ? formatUptime(nodeHealth.uptime_seconds) : '--'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Encodes</p>
                  <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                    {nodeHealth?.total_encodes != null ? nodeHealth.total_encodes.toLocaleString() : '--'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</p>
                  <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                    {nodeHealth?.version || '--'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* HFTP live nodes */}
            {hftpPeers.map((peer, i) => {
              const typeColors = {
                server: { dot: '#3b82f6', label: 'SERVER', labelBg: 'rgba(59,130,246,0.15)', labelColor: '#3b82f6' },
                haven: { dot: '#10b981', label: 'HAVEN', labelBg: 'rgba(16,185,129,0.15)', labelColor: '#10b981' },
                builder: { dot: '#8b5cf6', label: 'BUILDER', labelBg: 'rgba(139,92,246,0.15)', labelColor: '#8b5cf6' },
                relay: { dot: '#f59e0b', label: 'RELAY', labelBg: 'rgba(245,158,11,0.15)', labelColor: '#f59e0b' },
              }
              const tc = typeColors[peer.type] || typeColors.server
              const timeSince = peer.lastSeen ? Math.floor((Date.now() - peer.lastSeen) / 1000) : null
              return (
                <motion.div
                  key={peer.nodeId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * (i + 1) }}
                  style={{
                    background: cardBg, border: `1px solid ${cardBorder}`,
                    borderRadius: '16px', padding: '28px',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <PulsingDot color={tc.dot} size={12} />
                    <span style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, fontFamily: 'monospace' }}>
                      {peer.nodeId.length > 16 ? peer.nodeId.slice(0, 16) + '...' : peer.nodeId}
                    </span>
                    <span style={{
                      marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px',
                      background: tc.labelBg, color: tc.labelColor,
                      fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em',
                    }}>
                      {tc.label}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</p>
                      <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>{peer.region || 'unknown'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Seen</p>
                      <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                        {timeSince != null && timeSince < 60 ? 'just now' : timeSince != null ? formatUptime(timeSince) + ' ago' : '--'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breathing</p>
                      <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                        {peer.breathingAttested ? 'Attested' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {peer.type === 'relay' ? 'Local Peers' : 'Pattern'}
                      </p>
                      <p style={{ fontSize: '15px', color: textPrimary, fontWeight: '600' }}>
                        {peer.type === 'relay'
                          ? (peer.relayPeerCount != null ? peer.relayPeerCount : '0')
                          : (peer.healthSummary?.classification || '--')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Deploy CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                background: cardBg, border: `1px dashed ${cardBorder}`,
                borderRadius: '16px', padding: '28px',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', minHeight: '200px',
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: textPrimary, marginBottom: '8px' }}>
                Run a node
              </p>
              <p style={{ fontSize: '13px', color: textSecondary, marginBottom: '20px' }}>
                Early access &mdash; node software launching soon
              </p>
              <a
                href="https://github.com/paragon-dao/hftp-spec"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px', borderRadius: '8px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${cardBorder}`,
                  color: green, fontWeight: '600', fontSize: '14px',
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}
              >
                Read the Protocol Spec
              </a>
            </motion.div>
          </div>

          {/* Curl command */}
          <div style={{
            position: 'relative',
            background: termBg, borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>
                Try it yourself
              </span>
            </div>
            <CopyButton text={curlCommand} />
            <pre style={{
              margin: 0, padding: '20px',
              fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: '14px', color: '#10b981',
              overflowX: 'auto', lineHeight: 1.6,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>$</span> {curlCommand}
            </pre>
          </div>
        </Section>

        {/* ═══ PROTOCOL STATUS ═══ */}
        <Section style={{ paddingTop: '40px' }}>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#f59e0b', marginBottom: '12px',
          }}>
            Protocol Status
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            What&rsquo;s Built. What&rsquo;s Not. No Hand-Waving.
          </h3>
          <p style={{ fontSize: '16px', color: textSecondary, marginBottom: '40px', maxWidth: '700px', lineHeight: 1.7 }}>
            An honest accounting of every protocol layer, its status, and the math that defends scalability.
          </p>

          {/* Protocol layers table */}
          <div style={{
            background: cardBg, border: `1px solid ${cardBorder}`,
            borderRadius: '16px', overflow: 'hidden',
            backdropFilter: 'blur(12px)', marginBottom: '32px',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                    {['Layer', 'Purpose', 'Status', 'Tests'].map(h => (
                      <th key={h} style={{
                        padding: '14px 20px', textAlign: 'left',
                        color: textSecondary, fontWeight: '600',
                        fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { layer: 'L0: Registry', purpose: 'Node discovery + peer tracking', status: 'Production', tests: '73 passing', color: green },
                    { layer: 'L0: HFTP Protocol', purpose: 'Wire format: register / health / heartbeat / relay-status', status: 'Production', tests: 'Typed + validated', color: green },
                    { layer: 'L1: Relay Topology', purpose: 'Regional relay nodes — phones connect to nearest relay, not registry', status: 'Production', tests: '7 integration tests', color: green },
                    { layer: 'L1: GLE Encoder', purpose: 'Biosignal → 128 coefficients (512 bytes)', status: 'Production', tests: '88.97% breathing, 97.65% EEG', color: green },
                    { layer: 'L1: BAGLE API', purpose: 'Remote encode endpoint', status: 'Production (Fly.io)', tests: '36ms encode', color: green },
                    { layer: 'L2: P2P Transport', purpose: 'Shard-aware message routing + TTL forwarding', status: 'Implemented', tests: '20 passing', color: green },
                    { layer: 'L3: Sharding', purpose: '1000-shard DJB2 routing + replication', status: 'Implemented', tests: '12 passing', color: green },
                    { layer: 'L4: PCR Consensus', purpose: 'Kuramoto coherence → BFT vote → fee accounting', status: 'Implemented', tests: '33 passing', color: green },
                    { layer: 'L5: Token Economics', purpose: 'Fee distribution, health rewards, validator staking', status: 'Implemented', tests: '49 passing', color: green },
                  ].map((row, i) => (
                    <tr key={row.layer} style={{ borderBottom: i < 7 ? `1px solid ${cardBorder}` : 'none' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: textPrimary, fontSize: '14px', whiteSpace: 'nowrap' }}>{row.layer}</td>
                      <td style={{ padding: '14px 20px', color: textSecondary, fontSize: '14px' }}>{row.purpose}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                          background: row.color === green ? 'rgba(16,185,129,0.15)' : row.color === '#f59e0b' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                          color: row.color,
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: textSecondary, fontSize: '13px', fontFamily: 'monospace' }}>{row.tests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bandwidth defense */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: '16px', padding: '28px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginBottom: '16px' }}>
              Bandwidth Defense: Why 1 Billion Nodes Works
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '13px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Per health check</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: green, fontFamily: 'monospace' }}>512 B</p>
                <p style={{ fontSize: '13px', color: textSecondary }}>128 GLE coefficients &times; 4 bytes each. A text message is heavier.</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Heartbeat overhead</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: green, fontFamily: 'monospace' }}>~80 B</p>
                <p style={{ fontSize: '13px', color: textSecondary }}>Every 15s. nodeId + timestamp. Registry handles 100K concurrent on a single core.</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>1B nodes, 1 check/day</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: green, fontFamily: 'monospace' }}>5.8 MB/s</p>
                <p style={{ fontSize: '13px', color: textSecondary }}>1B &times; 512B &divide; 86,400s. A home internet connection handles this.</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>vs. Bitcoin</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', fontFamily: 'monospace' }}>~2 MB/s</p>
                <p style={{ fontSize: '13px', color: textSecondary }}>Bitcoin&rsquo;s block propagation bandwidth. We carry 8B people&rsquo;s health data at 3&times; Bitcoin&rsquo;s bandwidth.</p>
              </div>
            </div>

            <div style={{
              marginTop: '24px', padding: '16px 20px',
              background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
              borderRadius: '8px', borderLeft: `3px solid ${green}`,
            }}>
              <p style={{ fontSize: '14px', color: textPrimary, margin: 0, lineHeight: 1.7 }}>
                <strong>The key insight:</strong> Bitcoin spends 600GB+ per node to store financial transactions.
                We store every person on Earth&rsquo;s health snapshot in 3.73 TB total &mdash; sharded across 1,000 nodes at 3.73 GB each.
                A 2015 smartphone has more storage than that.
                The 512-byte compression ratio is the architectural moat &mdash; it&rsquo;s why phones can be nodes, and why the network
                gets <em>cheaper</em> as it grows instead of more expensive.
              </p>
            </div>
          </motion.div>
        </Section>

        {/* ═══ PCR CONSENSUS ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#8b5cf6', marginBottom: '12px',
          }}>
            Consensus Mechanism
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Proof of Coherent Resonance
          </h3>
          <p style={{
            fontSize: '17px', color: textSecondary, marginBottom: '48px', maxWidth: '700px',
            lineHeight: 1.7,
          }}>
            Most blockchains prove you did math. This one proves you&rsquo;re alive.
            PCR combines Kuramoto oscillator synchronization with Byzantine fault tolerance &mdash;
            the first consensus mechanism designed for biological data.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px', marginBottom: '32px',
          }}>
            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: '16px', padding: '28px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(139,92,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="12" cy="12" r="8" strokeDasharray="4 4"/>
                  <circle cx="12" cy="12" r="11" strokeDasharray="2 3" opacity="0.5"/>
                </svg>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
                Kuramoto Synchronization
              </h4>
              <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.65, margin: 0 }}>
                Nodes synchronize like fireflies &mdash; each adjusting its phase based on neighbors.
                When a health snapshot arrives, validators independently assess coherence.
                If their oscillators converge (coupling strength K &ge; 2.0), the data is coherent.
                Fake or corrupted data breaks synchronization. The network detects it in milliseconds.
              </p>
            </motion.div>

            {/* BFT layer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: '16px', padding: '28px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
                Byzantine Fault Tolerance
              </h4>
              <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.65, margin: 0 }}>
                Kuramoto catches bad data. BFT catches bad actors.
                The network tolerates up to 1/3 malicious validators &mdash; the mathematical maximum for any consensus protocol.
                A 66% supermajority must agree before any health snapshot is committed.
                Your data doesn&rsquo;t just get stored &mdash; it gets validated.
              </p>
            </motion.div>

            {/* Why it matters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: '16px', padding: '28px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(245,158,11,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
                Why This Is New
              </h4>
              <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.65, margin: 0 }}>
                Bitcoin proves computation. Ethereum proves state transitions. PCR proves biological coherence.
                No existing consensus mechanism was designed for health data.
                We built one from the physics of coupled oscillators &mdash;
                the same math that describes neurons firing in sync, heartbeats synchronizing, and circadian rhythms aligning.
              </p>
            </motion.div>
          </div>

          {/* PCR callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: '24px 28px',
              borderLeft: '3px solid #8b5cf6',
              background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
              borderRadius: '0 12px 12px 0',
            }}
          >
            <p style={{
              fontSize: '15px', lineHeight: 1.7,
              color: textPrimary, margin: 0,
            }}>
              <strong>The technical detail:</strong> PCR uses a Kuramoto coupling function to measure phase coherence
              across validator nodes. When the order parameter r &ge; 0.8, the committee has converged &mdash;
              the biosignal is coherent. This is combined with a standard BFT voting round (66% threshold)
              to produce a finalized health proof. The full algorithm is published in our{' '}
              <a href="/docs/PRN_IMPLEMENTATION_SPECIFICATION.html" target="_blank" rel="noopener noreferrer"
                style={{ color: '#8b5cf6', textDecoration: 'underline' }}>
                Implementation Specification
              </a>.
            </p>
          </motion.div>
        </Section>

        {/* ═══ SECTION 3: 512-BYTE PROOF ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#6366f1', marginBottom: '12px',
          }}>
            The Breakthrough
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Every health snapshot. Same size. Always.
          </h3>
          <p style={{
            fontSize: '17px', color: textSecondary, marginBottom: '48px', maxWidth: '600px',
            lineHeight: 1.6,
          }}>
            GLE encodes any biosignal — breathing, voice, cardiac, EEG — into exactly 128 coefficients. 512 bytes. No matter the input length.
          </p>

          {/* Encoder visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '24px', marginBottom: '48px',
              flexWrap: 'wrap',
            }}
          >
            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
              {[
                { label: '5s breath', size: '312 KB' },
                { label: '30s breath', size: '1.8 MB' },
                { label: '60s breath', size: '3.7 MB' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    padding: '10px 16px', borderRadius: '8px',
                    background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', color: textPrimary, fontWeight: '500' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: textSecondary, fontFamily: 'monospace' }}>{item.size}</span>
                </motion.div>
              ))}
            </div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              style={{
                padding: '12px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: '700', fontSize: '13px',
                textAlign: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              GLE<br />Encoder
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              style={{
                padding: '16px 24px', borderRadius: '10px',
                background: 'rgba(16,185,129,0.1)',
                border: '2px solid rgba(16,185,129,0.3)',
                textAlign: 'center', minWidth: '160px',
              }}
            >
              <p style={{ fontSize: '28px', fontWeight: '800', color: green, marginBottom: '4px' }}>512 bytes</p>
              <p style={{ fontSize: '12px', color: textSecondary }}>128 coefficients &mdash; always</p>
            </motion.div>
          </motion.div>

          {/* Results table */}
          {proofResults && (
            <div style={{
              background: termBg, borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
                  Proof Run &mdash; {new Date(proofResults.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span style={{
                  padding: '4px 10px', borderRadius: '6px',
                  background: 'rgba(16,185,129,0.15)', color: green,
                  fontSize: '11px', fontWeight: '700',
                }}>
                  {proofResults.results.filter(r => r.pass).length}/{proofResults.results.length} PASS
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse',
                  fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '13px',
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Signal', 'Modality', 'Input Size', 'Output', 'Latency', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left',
                          color: 'rgba(255,255,255,0.4)', fontWeight: '500',
                          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proofResults.results.map((r, i) => (
                      <motion.tr
                        key={r.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: '500' }}>{r.label}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{r.modality}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{formatBytes(r.input_bytes)}</td>
                        <td style={{ padding: '12px 16px', color: green, fontWeight: '700' }}>{r.output_bytes} B</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{r.latency_ms.toFixed(1)} ms</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            color: r.pass ? green : '#ef4444',
                            fontWeight: '700',
                          }}>
                            {r.pass ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>

        {/* ═══ SECTION 4: WHAT YOU GET ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#f59e0b', marginBottom: '12px',
          }}>
            What You Get
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Your week on the network
          </h3>
          <p style={{
            fontSize: '17px', color: textSecondary, marginBottom: '48px', maxWidth: '640px',
            lineHeight: 1.6,
          }}>
            30 seconds on your phone. A breathing check-in. That's it. Here's what happens next.
          </p>

          {/* Timeline steps */}
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {[
              {
                time: 'Monday 8:03 AM',
                title: 'You breathe into your phone for 30 seconds',
                desc: 'The GLE encoder on your device turns your breathing pattern into 128 numbers — a 512-byte snapshot. The raw audio never leaves your phone.',
                color: '#10b981',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/>
                    <path d="M12 2v2"/>
                    <path d="M12 20v2"/>
                  </svg>
                ),
              },
              {
                time: 'Monday 8:03 AM + 3ms',
                title: 'Your snapshot joins the network',
                desc: 'Only the 512 bytes travel. Distributed across nodes via sharding — no single node has your full history. Your phone can be a node too.',
                color: '#6366f1',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                ),
              },
              {
                time: 'Monday 8:04 AM',
                title: 'Your personal AI compares this week to last',
                desc: 'Your on-device AI agent reads the coefficients — not the raw data — and compares them to your history. "Your respiratory variability dropped 8% from last Monday." It knows YOUR baseline.',
                color: '#8b5cf6',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ),
              },
              {
                time: 'Over weeks',
                title: 'Trends emerge that no single visit catches',
                desc: 'A doctor sees you for 15 minutes twice a year. Your AI sees 52 weekly snapshots. It spots the slow drift a checkup would miss: "Your pattern has shifted gradually over 6 weeks — similar to early-stage respiratory changes. Consider seeing your doctor."',
                color: '#f59e0b',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
              },
              {
                time: 'Ongoing',
                title: 'Population baselines — without exposing anyone',
                desc: 'Because every snapshot is the same 512 bytes, the network can compute anonymous baselines. "Your cardiac rhythm is in the 85th percentile for your age group." You get the benefit of population data without anyone seeing your data.',
                color: '#10b981',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', gap: '20px',
                  marginBottom: i < 4 ? '0' : '0',
                  position: 'relative',
                }}
              >
                {/* Timeline line + dot */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  flexShrink: 0, width: '40px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.color, flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  {i < 4 && (
                    <div style={{
                      width: '2px', flex: 1, minHeight: '24px',
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: '32px', flex: 1 }}>
                  <p style={{
                    fontSize: '12px', fontWeight: '600', color: step.color,
                    marginBottom: '6px', fontFamily: 'monospace',
                  }}>
                    {step.time}
                  </p>
                  <h4 style={{
                    fontSize: '17px', fontWeight: '700', color: textPrimary,
                    marginBottom: '8px', lineHeight: 1.3,
                  }}>
                    {step.title}
                  </h4>
                  <p style={{
                    fontSize: '14px', color: textSecondary, lineHeight: 1.65, margin: 0,
                  }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* The "never possible before" callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              marginTop: '32px', padding: '28px',
              borderRadius: '16px',
              background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.15)',
              maxWidth: '700px', margin: '32px auto 0',
            }}
          >
            <h4 style={{
              fontSize: '16px', fontWeight: '700', color: textPrimary,
              marginBottom: '12px',
            }}>
              Why this was never possible before
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { before: 'Health monitoring required expensive devices and hospital visits', after: 'A phone and 30 seconds' },
                { before: 'Sharing health data meant exposing raw recordings', after: '512 bytes — no one can reconstruct your signal' },
                { before: 'Population health insights required centralized databases', after: 'Distributed nodes, anonymous coefficients, same math' },
                { before: 'Continuous monitoring was only for the critically ill', after: 'Weekly snapshots for everyone, trends visible over months' },
                { before: 'Running health infrastructure cost millions', after: 'A Raspberry Pi can be a network node' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', color: '#ef4444',
                    minWidth: '50px', paddingTop: '2px',
                  }}>Before</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: textSecondary, margin: '0 0 4px', textDecoration: 'line-through', opacity: 0.6 }}>
                      {item.before}
                    </p>
                    <p style={{ fontSize: '13px', color: green, fontWeight: '600', margin: 0 }}>
                      {item.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Where we are today */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              marginTop: '32px', padding: '28px',
              borderRadius: '16px',
              background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
              border: `1px solid rgba(16,185,129,0.15)`,
              maxWidth: '700px', margin: '32px auto 0',
            }}
          >
            <h4 style={{
              fontSize: '16px', fontWeight: '700', color: textPrimary,
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <PulsingDot color={green} size={8} />
              Where we are today
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { status: 'LIVE', label: 'GLE encoder API', desc: 'Encode biosignals via the live BAGLE endpoint — verify with curl right now', color: green },
                { status: 'LIVE', label: 'HFTP registry', desc: 'Node discovery and peer tracking — connected nodes appear on this page in real time', color: green },
                { status: 'LIVE', label: 'Protocol specifications', desc: 'Full algorithm specs, wire protocol, and SDK published on GitHub', color: green },
                { status: 'LIVE', label: 'PCR consensus engine', desc: 'Kuramoto oscillator + BFT voting — 33 tests passing, integrated fee accounting', color: green },
                { status: 'LIVE', label: 'Shard routing + P2P transport', desc: 'DJB2 shard assignment, shard-aware message routing, TTL forwarding — 32 tests passing', color: green },
                { status: 'LIVE', label: 'Token economics', desc: 'Fee distribution (40/40/20 split), health rewards with frequency ramp, validator staking with slashing — 49 tests passing', color: green },
                { status: 'BUILDING', label: 'Breathing check-in app', desc: 'The 30-second phone experience described above — in active development', color: '#f59e0b' },
                { status: 'BUILDING', label: 'Public node deployment', desc: 'Node software currently in early access — open deployment coming soon', color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em',
                    padding: '3px 8px', borderRadius: '4px',
                    background: item.color === green ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: item.color, minWidth: '68px', textAlign: 'center',
                    marginTop: '2px',
                  }}>
                    {item.status}
                  </span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, margin: '0 0 2px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '13px', color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ═══ SECTION 5: SCALING BREAKTHROUGH ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#f59e0b', marginBottom: '12px',
          }}>
            The Scaling Claim
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '48px', letterSpacing: '-0.02em',
          }}>
            More people. Less storage per node.
          </h3>

          {/* Comparison bars */}
          <div style={{ marginBottom: '60px' }}>
            {comparisonData.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ marginBottom: '16px' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '6px',
                }}>
                  <span style={{
                    fontSize: '14px', fontWeight: '600', color: textPrimary,
                    minWidth: '120px',
                  }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '13px', color: textSecondary }}>
                    {item.size} <span style={{ fontSize: '11px' }}>{item.note}</span>
                  </span>
                </div>
                <div style={{
                  height: '28px', borderRadius: '6px',
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.12 + 0.2, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: '6px',
                      background: item.color,
                      opacity: item.name === 'PRN (ours)' ? 1 : 0.5,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sharding table */}
          <div style={{
            background: cardBg, border: `1px solid ${cardBorder}`,
            borderRadius: '16px', overflow: 'hidden',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${cardBorder}`,
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                PRN Sharding at Scale
              </h4>
              <p style={{ fontSize: '13px', color: textSecondary, marginTop: '4px' }}>
                1,000 shards &mdash; every node stores 1/1000th of the network
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                    {['Participants', 'Per Person', 'Total Network', 'Per Node', 'Hardware'].map(h => (
                      <th key={h} style={{
                        padding: '14px 20px', textAlign: 'left',
                        color: textSecondary, fontWeight: '600',
                        fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scalingData.map((row, i) => (
                    <motion.tr
                      key={row.participants}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        borderBottom: i < scalingData.length - 1 ? `1px solid ${cardBorder}` : 'none',
                        background: i === scalingData.length - 1
                          ? (isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)')
                          : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: textPrimary, fontSize: '15px' }}>{row.participants}</td>
                      <td style={{ padding: '14px 20px', color: green, fontWeight: '600', fontFamily: 'monospace', fontSize: '14px' }}>{row.perPerson}</td>
                      <td style={{ padding: '14px 20px', color: textPrimary, fontFamily: 'monospace', fontSize: '14px' }}>{row.total}</td>
                      <td style={{ padding: '14px 20px', color: textPrimary, fontWeight: '600', fontFamily: 'monospace', fontSize: '14px' }}>{row.perNode}</td>
                      <td style={{ padding: '14px 20px', color: textSecondary, fontSize: '14px' }}>{row.hardware}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key insight */}
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              marginTop: '48px',
              padding: '24px 28px',
              borderLeft: `3px solid ${green}`,
              background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
              borderRadius: '0 12px 12px 0',
            }}
          >
            <p style={{
              fontSize: '16px', lineHeight: 1.7,
              color: textPrimary, fontStyle: 'italic', margin: 0,
            }}>
              Every other distributed network: more users &rarr; more data &rarr; more expensive nodes &rarr; centralization.
            </p>
            <p style={{
              fontSize: '16px', lineHeight: 1.7,
              color: green, fontWeight: '600', fontStyle: 'italic', margin: '8px 0 0',
            }}>
              This network: more users &rarr; more shards &rarr; cheaper nodes &rarr; more accessible &rarr; more users.
            </p>
          </motion.blockquote>
        </Section>

        {/* ═══ SECTION 5: INCENTIVE LOOP ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#8b5cf6', marginBottom: '12px',
          }}>
            The Virtuous Cycle
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '48px', letterSpacing: '-0.02em',
          }}>
            A network that strengthens itself
          </h3>

          <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: '0',
            maxWidth: '800px', margin: '0 auto',
          }}>
            {incentiveSteps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0',
                }}
              >
                <div style={{
                  padding: '10px 18px', borderRadius: '24px',
                  background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  fontSize: '13px', fontWeight: '600',
                  color: textPrimary, whiteSpace: 'nowrap',
                }}>
                  {step}
                </div>
                {i < incentiveSteps.length - 1 && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.5)'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </motion.div>
            ))}
            {/* Loop arrow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              style={{
                width: '100%', textAlign: 'center', marginTop: '16px',
                fontSize: '13px', color: '#8b5cf6', fontWeight: '600',
              }}
            >
              &larr; repeat &mdash; the cycle accelerates &rarr;
            </motion.div>
          </div>
        </Section>

        {/* ═══ SECTION 6: FOR EVERYONE ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: textSecondary, marginBottom: '12px',
          }}>
            Who This Is For
          </h2>
          <h3 style={{
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700',
            color: textPrimary, marginBottom: '48px', letterSpacing: '-0.02em',
          }}>
            For everyone
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {stakeholders.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: cardBg, border: `1px solid ${cardBorder}`,
                  borderRadius: '16px', padding: '28px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  {s.icon}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginBottom: '8px' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══ PROOF ARTIFACTS ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: textSecondary, marginBottom: '12px',
          }}>
            Raw Evidence
          </h2>
          <h3 style={{
            fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: '700',
            color: textPrimary, marginBottom: '32px', letterSpacing: '-0.02em',
          }}>
            Proof artifacts
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {[
              {
                title: 'Terminal Recording',
                desc: 'Watch the full proof run in your terminal',
                href: '/proofs/1-fixed-payload/proof-1-fixed-payload.cast',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="4 17 10 11 4 5"/>
                    <line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                ),
              },
              {
                title: 'Raw JSON Results',
                desc: 'Download the complete proof data',
                href: '/proofs/1-fixed-payload/proof-1-fixed-payload-results.json',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                ),
              },
              {
                title: 'Implementation Spec',
                desc: 'Full algorithms, formulas, and wire protocol',
                href: '/docs/PRN_IMPLEMENTATION_SPECIFICATION.html',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M16 18l6-6-6-6"/>
                    <path d="M8 6l-6 6 6 6"/>
                  </svg>
                ),
              },
            ].map((item, i) => (
              <motion.a
                key={item.title}
                href={item.href}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px', borderRadius: '12px',
                  background: cardBg, border: `1px solid ${cardBorder}`,
                  backdropFilter: 'blur(12px)',
                  textDecoration: 'none', transition: 'border-color 0.2s ease',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: textSecondary,
                }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: textPrimary, marginBottom: '2px' }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '13px', color: textSecondary, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </Section>

        {/* ═══ TECHNICAL DOCUMENTATION ═══ */}
        <Section>
          <h2 style={{
            fontSize: '14px', fontWeight: '600',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: textSecondary, marginBottom: '12px',
          }}>
            Technical Documentation
          </h2>
          <h3 style={{
            fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: '700',
            color: textPrimary, marginBottom: '32px', letterSpacing: '-0.02em',
          }}>
            Read the specifications
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {[
              { title: 'PRN Whitepaper', desc: 'Architecture and consensus design', href: '/docs/PRN_INFRASTRUCTURE_WHITEPAPER.html' },
              { title: 'Implementation Spec', desc: 'Full algorithms, formulas, and wire protocol — public technical disclosure', href: '/docs/PRN_IMPLEMENTATION_SPECIFICATION.html' },
              { title: 'HFTP Protocol', desc: 'Harmonic Frequency Transfer Protocol whitepaper', href: '/docs/HFTP_PROTOCOL_WHITEPAPER.html' },
            ].map((doc, i) => (
              <motion.a
                key={doc.title}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px', borderRadius: '12px',
                  background: cardBg, border: `1px solid ${cardBorder}`,
                  backdropFilter: 'blur(12px)',
                  textDecoration: 'none', transition: 'border-color 0.2s ease',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: textSecondary,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: textPrimary, marginBottom: '2px' }}>
                    {doc.title}
                  </p>
                  <p style={{ fontSize: '13px', color: textSecondary, margin: 0 }}>
                    {doc.desc}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </Section>

        {/* ═══ JOIN THE NETWORK (final section — page ends on energy) ═══ */}
        <Section style={{ paddingBottom: '120px' }}>
          <div style={{
            background: termBg, borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '48px 32px', textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: '700',
              color: '#fff', marginBottom: '12px',
            }}>
              Join the network
            </h2>
            <p style={{
              fontSize: '16px', color: 'rgba(255,255,255,0.6)',
              maxWidth: '560px', margin: '0 auto 12px',
              lineHeight: 1.6,
            }}>
              Health infrastructure that runs on phones, costs nothing to join,
              and gets stronger with every person.
            </p>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.4)',
              maxWidth: '520px', margin: '0 auto 36px',
              lineHeight: 1.6,
            }}>
              Builders: read the protocol specs and verify the live API.
              Everyone else: the app is coming &mdash; follow us to get early access.
            </p>

            <pre style={{
              textAlign: 'left', margin: '0 auto 36px',
              maxWidth: '560px',
              fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: '14px', lineHeight: 2,
              color: '#10b981',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}># Verify the live node</span>{'\n'}
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>$</span> curl https://bagle-api.fly.dev/health | python3 -m json.tool{'\n'}
              {'\n'}
              <span style={{ color: 'rgba(255,255,255,0.3)' }}># Explore the protocol spec</span>{'\n'}
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>$</span> git clone https://github.com/paragon-dao/hftp-spec.git
            </pre>

            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '16px', flexWrap: 'wrap', marginBottom: '32px',
            }}>
              <motion.a
                href="https://github.com/paragon-dao/hftp-spec"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontWeight: '600', fontSize: '15px',
                  textDecoration: 'none', border: 'none',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Protocol Spec
              </motion.a>
              <motion.a
                href="/docs/PRN_IMPLEMENTATION_SPECIFICATION.html"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontWeight: '600', fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                Implementation Spec
              </motion.a>
              <motion.a
                href="/docs"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontWeight: '600', fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                API Docs
              </motion.a>
            </div>

            {/* Non-technical CTA */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '28px',
              maxWidth: '480px', margin: '0 auto',
            }}>
              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.5)',
                marginBottom: '16px',
              }}>
                Not a developer? Follow us on GitHub to get notified when the app launches.
              </p>
              <motion.a
                href="https://github.com/paragon-dao"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)', fontWeight: '500', fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Follow ParagonDAO on GitHub
              </motion.a>
            </div>
          </div>
        </Section>

      </main>

      <Footer />
    </div>
  )
}

export default ProofPage
