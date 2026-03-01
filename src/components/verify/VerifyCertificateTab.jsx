import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import OnChainRecord from '../OnChainRecord'
import CertificationBadge from '../CertificationBadge'
import { CERTIFICATION_TIERS, VALIDATORS } from '../../data/mockBuilderData'
import { getVerifyColors, cardStyle, sectionAnim } from './verifyStyles'

// Mock on-chain record for verified models
const MOCK_ON_CHAIN = {
  txHash: '0x7f3a...e4b2',
  blockNumber: 19847231,
  network: 'Ethereum Mainnet',
  ipfsHash: 'QmX7k...9pR3',
  contract: '0x1234...5678',
  timestamp: '2025-12-15T14:30:00Z',
  validatorSignatures: VALIDATORS.map(v => ({
    validator: v.name,
    signature: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    timestamp: '2025-12-15T14:30:00Z',
  })),
}

export default function VerifyCertificateTab({ model }) {
  const { isDark } = useTheme()
  const c = getVerifyColors(isDark)

  const tier = model.certificationTier
  const tierInfo = tier ? CERTIFICATION_TIERS[tier] : null

  return (
    <div>
      {/* Certification Tier */}
      <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
        <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Certification</h3>
        <div style={cardStyle(isDark, { padding: '32px', textAlign: 'center' })}>
          {tier ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <CertificationBadge tier={tier} size="xl" animate />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: c.textPrimary, marginBottom: '8px' }}>
                {tierInfo?.label} Certification
              </div>
              <div style={{ fontSize: '13px', color: c.textSecondary, marginBottom: '24px' }}>
                {tierInfo?.requirement}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '14px', color: c.textSecondary, padding: '20px' }}>
              This model has not yet been certified. Certification requires independent verification on the ParagonDAO network.
            </div>
          )}

          {/* Tier explanation table */}
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: c.textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Certification Tiers
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${c.cardBorder}` }}>
                  {['Tier', 'Requirement', 'Min. Accuracy'].map(h => (
                    <th key={h} style={{
                      padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: '600',
                      textTransform: 'uppercase', letterSpacing: '0.05em', color: c.textSecondary,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(CERTIFICATION_TIERS).map(([key, info]) => (
                  <tr key={key} style={{
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                    background: key === tier ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)') : 'transparent',
                  }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: info.color }}>
                      {info.label} {key === tier && '(current)'}
                    </td>
                    <td style={{ padding: '10px', color: c.textSecondary }}>{info.requirement}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: c.textPrimary }}>{(info.minAccuracy * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* On-Chain Record */}
      {model.status === 'verified' && (
        <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
          <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>On-Chain Record</h3>
          <OnChainRecord record={MOCK_ON_CHAIN} />
        </motion.div>
      )}

      {/* Download Certificate */}
      {tier && (
        <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => {
              const w = window.open('', '_blank')
              w.document.write(`
                <html><head><title>Verification Certificate — ${model.name}</title>
                <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:40px;border:3px double #333}
                h1{text-align:center;margin-bottom:8px}h2{text-align:center;font-weight:normal;color:#666;margin-bottom:32px}
                .badge{text-align:center;font-size:48px;margin:24px 0}
                table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}
                .footer{text-align:center;color:#999;font-size:12px;margin-top:40px}</style></head>
                <body>
                <h1>ParagonDAO Verification Certificate</h1>
                <h2>${model.name}</h2>
                <div class="badge">${tier === 'platinum' ? '💎' : tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉'} ${tierInfo?.label}</div>
                <table>
                <tr><td><strong>Model</strong></td><td>${model.name}</td></tr>
                <tr><td><strong>Modality</strong></td><td>${model.modality}</td></tr>
                <tr><td><strong>Disease Target</strong></td><td>${model.disease}</td></tr>
                <tr><td><strong>Key Metric</strong></td><td>${model.accuracy?.value} (${model.accuracy?.metric})</td></tr>
                <tr><td><strong>Privacy Grade</strong></td><td>${model.privacy?.overallGrade || 'N/A'}</td></tr>
                <tr><td><strong>Certification Tier</strong></td><td>${tierInfo?.label}</td></tr>
                <tr><td><strong>Verification URL</strong></td><td>${window.location.origin}/verify/${model.id}</td></tr>
                </table>
                <div class="footer">
                Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | ParagonDAO Verification Network<br/>
                This certificate is for informational purposes. Verify at the URL above.
                </div></body></html>
              `)
              w.document.close()
              w.print()
            }} style={{
              padding: '12px 24px', borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
              border: `1px solid ${c.cardBorder}`, cursor: 'pointer',
              fontSize: '14px', fontWeight: '600', color: c.textPrimary,
            }}>
              Download Certificate (PDF)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
