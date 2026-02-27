import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import { HFTPClient } from '../agent/hftp-client'

const NetworkPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser

  const [networkStats, setNetworkStats] = useState({
    agentsOnline: 0,
    healthChecks: 0,
    countries: 0,
    peersOnline: 0
  })
  const [peers, setPeers] = useState([])
  const [aggregates, setAggregates] = useState(null)
  const [connected, setConnected] = useState(false)

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  useEffect(() => {
    // Try to connect to HFTP hub for live stats
    let client = null
    const connect = async () => {
      try {
        client = new HFTPClient()
        client.onPeersUpdate = (peerList) => {
          setPeers(peerList)
          setNetworkStats(prev => ({ ...prev, agentsOnline: peerList.length, peersOnline: peerList.length }))
        }
        client.onAggregateUpdate = (agg) => {
          setAggregates(agg)
        }
        await client.connect()
        setConnected(true)
      } catch {
        setConnected(false)
        // Show demo stats
        setNetworkStats({ agentsOnline: 0, healthChecks: 0, countries: 0, peersOnline: 0 })
      }
    }
    connect()
    return () => { if (client) client.disconnect() }
  }, [])

  const stats = [
    { label: 'Agents Online', value: networkStats.agentsOnline || '--', icon: '🤖' },
    { label: 'Health Checks Today', value: networkStats.healthChecks || '--', icon: '🫁' },
    { label: 'Countries', value: networkStats.countries || '--', icon: '🌍' },
    { label: 'Network Status', value: connected ? 'Live' : 'Offline', icon: connected ? '🟢' : '🔴' }
  ]

  const proposals = [
    { id: 1, title: 'Health Data Sovereignty Standard', status: 'Active', votes: 156, description: 'Define minimum encryption and consent requirements for health model transactions' },
    { id: 2, title: 'Three Kingdom Council Formation', status: 'Draft', votes: 42, description: 'Establish governance seats for Human, Pet, and Plant health domains' },
    { id: 3, title: 'GLE Model Licensing Framework', status: 'Discussion', votes: 89, description: 'Create open licensing terms for GLE-based health screening models' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease'
    }}>
      <Background />

      <Header
        searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}}
        handleSearch={() => {}} isSearching={false} isSearchExpanded={false}
        setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')}
      />

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 12px 0'
            }}>
              The HFTP Network
            </h1>
            <p style={{ fontSize: '16px', color: textSecondary, margin: 0, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              A decentralized network where AI agents trade health knowledge via frequency coefficients.
              One person, one vote. Health is a right.
            </p>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '48px'
            }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{
                background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '24px',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '28px' }}>{s.icon}</span>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#6366f1', marginTop: '8px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '13px', color: textSecondary, marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Node Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '32px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
              marginBottom: '48px',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 16px 0' }}>
              Connected Agents
            </h3>

            {peers.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {peers.map((peer, i) => (
                  <div key={i} style={{
                    padding: '8px 14px',
                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '100px',
                    fontSize: '12px',
                    color: '#6366f1',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: peer.breathingAttested ? '#10b981' : '#f59e0b'
                    }} />
                    {peer.nodeId.slice(0, 12)}...
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '48px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                {/* Simple node visualization */}
                <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                  {/* Central node */}
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    🐸
                  </div>
                  {/* Orbit rings */}
                  {[80, 100].map((r, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: r * 2, height: r * 2,
                      borderRadius: '50%',
                      border: `1px dashed ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`
                    }} />
                  ))}
                </div>
                <p style={{ color: textSecondary, fontSize: '14px' }}>
                  {connected ? 'Waiting for agents to connect...' : 'HFTP hub is offline — start a local hub to see live nodes'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Aggregate Health */}
          {aggregates && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
                borderRadius: '20px',
                padding: '32px',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
                marginBottom: '48px'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 16px 0' }}>
                Network Health Aggregate
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>
                    {(aggregates.avgStressLevel * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: textSecondary }}>Avg Stress Level</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                    {aggregates.avgBreathingDepth?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: textSecondary }}>Avg Breathing Depth</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#8b5cf6' }}>
                    {aggregates.dominantClassification}
                  </div>
                  <div style={{ fontSize: '12px', color: textSecondary }}>Dominant Pattern</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Governance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: '48px' }}
          >
            <h3 style={{
              fontSize: '24px', fontWeight: '700', color: textPrimary,
              margin: '0 0 8px 0', textAlign: 'center'
            }}>
              Governance
            </h3>
            <p style={{
              fontSize: '16px', color: textSecondary,
              textAlign: 'center', margin: '0 0 32px 0'
            }}>
              One person, one vote. Health is a right, not a product.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {proposals.map((p, i) => (
                <div key={p.id} style={{
                  background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                        {p.title}
                      </h4>
                      <span style={{
                        padding: '2px 8px',
                        background: p.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(156,163,175,0.15)',
                        border: `1px solid ${p.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(156,163,175,0.3)'}`,
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: p.status === 'Active' ? '#10b981' : '#9ca3af'
                      }}>
                        {p.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>{p.description}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>{p.votes}</div>
                    <div style={{ fontSize: '11px', color: textSecondary }}>votes</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/health')}
              style={{
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
              }}
            >
              Join the Network
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default NetworkPage
