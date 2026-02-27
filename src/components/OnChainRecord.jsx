import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

export default function OnChainRecord({ record, compact = false }) {
  const { isDark } = useTheme()
  const [copied, setCopied] = useState(null)

  if (!record) return null

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const Row = ({ label, value, mono = false, copyable = false }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: compact ? '6px 0' : '8px 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
    }}>
      <span style={{ fontSize: compact ? '11px' : '12px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: compact ? '12px' : '13px',
          color: textPrimary,
          fontFamily: mono ? 'monospace' : 'inherit',
          maxWidth: compact ? '140px' : '240px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={() => copyToClipboard(value, label)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              color: copied === label ? '#10b981' : textSecondary,
              padding: '2px',
            }}
          >
            {copied === label ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        padding: compact ? '12px' : '20px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: compact ? '8px' : '12px',
      }}>
        <span style={{ fontSize: compact ? '14px' : '16px' }}>⛓️</span>
        <span style={{
          fontSize: compact ? '13px' : '14px',
          fontWeight: '700',
          color: textPrimary,
        }}>
          On-Chain Verification Record
        </span>
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '999px',
          background: 'rgba(16,185,129,0.12)',
          color: '#10b981',
          fontWeight: '600',
        }}>
          Immutable
        </span>
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '999px',
          background: 'rgba(16,185,129,0.12)',
          color: '#10b981',
          fontWeight: '600',
        }}>
          🛡️ Weights Private
        </span>
      </div>

      <Row label="Tx Hash" value={record.txHash} mono copyable />
      <Row label="Block" value={`#${record.blockNumber.toLocaleString()}`} />
      <Row label="Network" value={record.network} />
      <Row label="IPFS" value={record.ipfsHash} mono copyable />
      {!compact && (
        <>
          <Row label="Contract" value={record.contract} mono copyable />
          <Row label="Timestamp" value={new Date(record.timestamp).toLocaleString()} />
        </>
      )}

      {!compact && record.validatorSignatures && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Validator Signatures ({record.validatorSignatures.length}/5)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {record.validatorSignatures.map((sig, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '6px',
                background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
              }}>
                <span style={{ fontSize: '12px', color: textPrimary }}>{sig.validator}</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: textSecondary }}>
                  {sig.signature.slice(0, 14)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
