import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import EEGWaveformViewer from '../EEGWaveformViewer'
import { getVerifyColors, cardStyle, sectionAnim } from './verifyStyles'

export default function VerifyPlaygroundTab({ model, onPredict }) {
  const { isDark } = useTheme()
  const c = getVerifyColors(isDark)

  const [playgroundInput, setPlaygroundInput] = useState(null)
  const [showRawInput, setShowRawInput] = useState(false)
  const [playgroundResult, setPlaygroundResult] = useState(null)
  const [playgroundLoading, setPlaygroundLoading] = useState(false)
  const [playgroundError, setPlaygroundError] = useState(null)
  const [activeSnippet, setActiveSnippet] = useState('curl')
  const [copied, setCopied] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_VERIFY_API_URL || 'http://localhost:2051'

  const generateSignal = () => {
    const channels = Array.from({ length: 4 }, () =>
      Array.from({ length: 200 }, () => +(Math.random() * 100 - 50).toFixed(2))
    )
    setPlaygroundInput(channels)
    return channels
  }

  const handlePredict = async () => {
    setPlaygroundLoading(true)
    setPlaygroundError(null)
    setPlaygroundResult(null)
    try {
      const data = playgroundInput || generateSignal()
      const res = await onPredict(data)
      setPlaygroundResult(res)
    } catch (e) {
      setPlaygroundError(e.message)
    } finally {
      setPlaygroundLoading(false)
    }
  }

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeSnippets = {
    curl: `curl -X POST ${apiBaseUrl}/api/v1/verify/predict \\\n  -H "Content-Type: application/json" \\\n  -d '{"eeg_raw": [[0.1, -0.3, ...], [...], [...], [...]], "sfreq": 100}'`,
    python: `import requests\nimport numpy as np\n\n# Raw EEG: 4 channels x 200 samples (2s at 100Hz)\neeg = np.random.randn(4, 200).tolist()\n\nr = requests.post(\n    "${apiBaseUrl}/api/v1/verify/predict",\n    json={"eeg_raw": eeg, "sfreq": 100}\n)\nprint(r.json())  # {"prediction": 0.42, "latency_ms": 7.2}`,
    javascript: `const eeg = Array.from({length: 4}, () =>\n  Array.from({length: 200}, () => Math.random() * 100 - 50)\n);\n\nconst res = await fetch("${apiBaseUrl}/api/v1/verify/predict", {\n  method: "POST",\n  headers: {"Content-Type": "application/json"},\n  body: JSON.stringify({eeg_raw: eeg, sfreq: 100})\n});\nconsole.log(await res.json());`
  }

  if (!model.endpoints) {
    return (
      <div style={cardStyle(isDark, { padding: '48px', textAlign: 'center' })}>
        <div style={{ fontSize: '14px', color: c.textSecondary }}>
          Live playground is not yet available for this model.
        </div>
      </div>
    )
  }

  return (
    <motion.div {...sectionAnim}>
      <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Try It Live</h3>
      <p style={{ color: c.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
        Send raw EEG data — GLE encoding happens server-side. You never touch the frequency transform.
      </p>

      <div style={cardStyle(isDark, { padding: '32px' })}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Input side */}
          <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
            {/* Waveform viewer */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: c.textSecondary, marginBottom: '8px' }}>
                EEG Input (4 channels, 200 samples, 100 Hz)
              </div>
              {playgroundInput ? (
                <EEGWaveformViewer
                  data={playgroundInput}
                  channelNames={model.dataset?.channelNames}
                  samplingRate={model.dataset?.samplingRate || 100}
                  width={500}
                  height={200}
                />
              ) : (
                /* Placeholder bars */
                ['TP9', 'AF7', 'AF8', 'TP10'].map((ch, i) => (
                  <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: c.textSecondary, width: '32px' }}>{ch}</span>
                    <div style={{
                      flex: 1, height: '12px', borderRadius: '3px',
                      background: `linear-gradient(90deg, ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'} ${20 + i * 5}%, ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'} ${50 + i * 3}%, ${isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'} 80%)`,
                      border: `1px solid ${c.cardBorder}`,
                    }} />
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => generateSignal()} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${c.cardBorder}`, color: c.textPrimary, cursor: 'pointer',
              }}>Generate Random Signal</motion.button>
              <button onClick={() => setShowRawInput(!showRawInput)} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                background: 'transparent', border: `1px solid ${c.cardBorder}`, color: c.textSecondary, cursor: 'pointer',
              }}>{showRawInput ? 'Hide JSON' : 'Paste Custom Data'}</button>
            </div>

            {showRawInput && (
              <textarea
                value={playgroundInput ? JSON.stringify(playgroundInput) : ''}
                onChange={e => { try { setPlaygroundInput(JSON.parse(e.target.value)) } catch {} }}
                rows={3}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${c.cardBorder}`, color: c.textPrimary,
                  fontSize: '11px', fontFamily: 'monospace', resize: 'vertical',
                  boxSizing: 'border-box', marginBottom: '12px',
                }}
              />
            )}

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePredict} disabled={playgroundLoading} style={{
              padding: '12px 32px', borderRadius: '10px', width: '100%',
              background: `linear-gradient(135deg, ${c.green}, #059669)`,
              border: 'none', color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: playgroundLoading ? 'not-allowed' : 'pointer',
              opacity: playgroundLoading ? 0.6 : 1,
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
            }}>
              {playgroundLoading ? 'Running inference...' : 'Run Prediction'}
            </motion.button>
          </div>

          {/* Output side */}
          <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
            {playgroundResult ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{
                padding: '28px', borderRadius: '12px', textAlign: 'center',
                background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                border: `1px solid ${c.greenBorder}`, marginBottom: '16px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textSecondary, marginBottom: '8px' }}>Prediction</div>
                <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace", color: c.green }}>
                  {playgroundResult.prediction?.toFixed(6)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
                  <span style={{ fontSize: '13px', color: c.textSecondary }}>{playgroundResult.latency_ms?.toFixed(1)}ms</span>
                  <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', background: c.greenBg, color: c.green }}>
                    {playgroundResult.model_status === 'precomputed' ? 'PRECOMPUTED' : 'LIVE'}
                  </span>
                </div>
              </motion.div>
            ) : playgroundLoading ? (
              <div style={{ padding: '28px', borderRadius: '12px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${c.cardBorder}`, marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.green, animation: 'pulse 1s infinite', margin: '0 auto 8px' }} />
                <span style={{ color: c.textSecondary, fontSize: '13px' }}>Running inference...</span>
              </div>
            ) : (
              <div style={{ padding: '28px', borderRadius: '12px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px dashed ${c.cardBorder}`, marginBottom: '16px' }}>
                <span style={{ color: c.textSecondary, fontSize: '14px' }}>Result will appear here</span>
              </div>
            )}

            {playgroundError && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{playgroundError}</div>
            )}

            {/* Code snippets */}
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['curl', 'python', 'javascript'].map(lang => (
                    <button key={lang} onClick={() => setActiveSnippet(lang)} style={{
                      padding: '4px 10px', borderRadius: '6px', border: 'none',
                      background: activeSnippet === lang ? c.greenBg : 'transparent',
                      color: activeSnippet === lang ? c.green : c.textSecondary,
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase',
                    }}>{lang}</button>
                  ))}
                </div>
                <button onClick={() => copyCode(codeSnippets[activeSnippet])} style={{
                  padding: '4px 10px', borderRadius: '6px', border: `1px solid ${c.cardBorder}`,
                  background: 'transparent', color: copied ? c.green : c.textSecondary,
                  fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                }}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <pre style={{
                background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${c.cardBorder}`, borderRadius: '10px', padding: '14px',
                color: isDark ? '#e2e8f0' : '#334155', fontSize: '12px', fontFamily: 'monospace',
                overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '180px', margin: 0,
              }}>{codeSnippets[activeSnippet]}</pre>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
