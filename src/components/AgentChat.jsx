import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

const AgentChat = ({ healthMetrics, envData, authStatus }) => {
  const { isDark } = useTheme()
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: 'Hello! I\'m your personal MirrorAI agent. I monitor your breathing patterns and environment to keep you informed about your health. Ask me anything.',
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateResponse = (question) => {
    const q = question.toLowerCase()

    if (q.includes('breathing') || q.includes('breath')) {
      if (healthMetrics) {
        return `Your current breathing is classified as "${healthMetrics.classification}". Breathing depth: ${healthMetrics.breathingDepth}, stress indicator: ${(healthMetrics.stressIndicator * 100).toFixed(0)}%. ${healthMetrics.classification === 'deep' ? 'Great — deep breathing indicates relaxation.' : healthMetrics.classification === 'shallow' ? 'Consider taking some deep breaths to improve oxygenation.' : 'Your breathing pattern looks normal.'}`
      }
      return 'I don\'t have live breathing data yet. Start a monitoring session to see your breathing metrics.'
    }

    if (q.includes('environment') || q.includes('air') || q.includes('weather') || q.includes('aqi')) {
      if (envData) {
        const temp = envData.weather?.temperature
        const aqi = envData.airQuality?.aqi
        return `Current conditions: ${temp != null ? temp + '°C' : 'N/A'}, AQI: ${aqi || 'N/A'}. ${envData.advisory}`
      }
      return 'Environment data is loading. It will appear shortly.'
    }

    if (q.includes('stress') || q.includes('relax')) {
      if (healthMetrics) {
        const stress = healthMetrics.stressIndicator
        if (stress < 0.3) return 'Your stress levels look low. Keep up the good work!'
        if (stress < 0.6) return `Moderate stress detected (${(stress * 100).toFixed(0)}%). Try 4-7-8 breathing: inhale 4 seconds, hold 7, exhale 8.`
        return `Elevated stress detected (${(stress * 100).toFixed(0)}%). I recommend taking a 5-minute breathing break. Box breathing works well: 4 seconds in, 4 hold, 4 out, 4 hold.`
      }
      return 'Start a breathing session so I can measure your stress levels.'
    }

    if (q.includes('help') || q.includes('what can you')) {
      return 'I can tell you about: your breathing patterns, stress levels, air quality, environment conditions, and health recommendations. Try asking "How is my breathing?" or "What\'s the air quality?"'
    }

    if (q.includes('gle') || q.includes('model') || q.includes('how')) {
      return 'Your breathing is encoded using GLE (General Learning Encoder) — a proprietary frequency-domain transform that converts your breathing audio into compact frequency coefficients. These coefficients are used for both authentication and health analysis. The same math that verifies your identity also screens for health conditions.'
    }

    return 'I can help with breathing analysis, environment monitoring, and health insights. Try asking about your current breathing pattern, air quality, or stress levels.'
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', text: input, timestamp: Date.now() }
    const agentResponse = { role: 'agent', text: generateResponse(input), timestamp: Date.now() + 1 }

    setMessages(prev => [...prev, userMsg, agentResponse])
    setInput('')
  }

  return (
    <div style={{
      background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
      display: 'flex',
      flexDirection: 'column',
      height: '400px'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: authStatus?.unlocked ? '#10b981' : '#f87171',
          boxShadow: authStatus?.unlocked ? '0 0 8px rgba(16,185,129,0.5)' : 'none'
        }} />
        <span style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>Agent Chat</span>
        <span style={{ fontSize: '11px', color: textSecondary, marginLeft: 'auto' }}>
          {authStatus?.unlocked ? 'Authenticated' : 'Locked'}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%'
          }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: msg.role === 'user' ? '#fff' : textPrimary,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        gap: '8px'
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your health..."
          style={{
            flex: 1,
            padding: '10px 14px',
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '10px',
            color: textPrimary,
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Send
        </motion.button>
      </div>
    </div>
  )
}

export default AgentChat
