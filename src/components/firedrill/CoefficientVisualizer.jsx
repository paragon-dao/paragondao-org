import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'

const CoefficientVisualizer = ({ coefficients, revealCount = 0, compact = false }) => {
  const { isDark } = useTheme()

  // Use actual coefficients if available, otherwise generate placeholder heights
  const bars = useMemo(() => {
    if (coefficients && coefficients.length > 0) {
      const maxAbs = Math.max(...coefficients.map(Math.abs), 1)
      return coefficients.map(v => Math.abs(v) / maxAbs)
    }
    // Procedural wave pattern for animation
    return Array.from({ length: 128 }, (_, i) => {
      const x = i / 128
      return 0.3 + 0.4 * Math.sin(x * Math.PI * 3) + 0.2 * Math.cos(x * Math.PI * 7 + 1)
    })
  }, [coefficients])

  const barCount = compact ? 64 : 128
  const displayBars = compact ? bars.filter((_, i) => i % 2 === 0) : bars
  const height = compact ? 80 : 120
  const barWidth = compact ? 3 : 4
  const gap = compact ? 1 : 0.5

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      borderRadius: '12px',
      background: isDark ? 'rgba(10, 10, 30, 0.6)' : 'rgba(0, 0, 0, 0.03)',
      padding: compact ? '12px 8px' : '20px 16px',
    }}>
      {/* Scan line */}
      {revealCount > 0 && revealCount < barCount && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'linear-gradient(180deg, transparent, #6366f1, #8b5cf6, transparent)',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
            zIndex: 2,
          }}
          animate={{
            left: `${(revealCount / barCount) * 100}%`,
          }}
          transition={{ duration: 0.02, ease: 'linear' }}
        />
      )}

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${barCount * (barWidth + gap)} ${height}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {displayBars.map((value, i) => {
          const revealed = i < revealCount
          const barHeight = Math.max(0, Math.min(value, 1) * (height - 8))
          const x = i * (barWidth + gap)
          const y = height - barHeight - 4

          return (
            <rect
              key={i}
              x={x}
              y={revealed ? y : height - 4}
              width={barWidth}
              height={revealed ? barHeight : 2}
              rx={1}
              fill={revealed
                ? `hsl(${235 + (i / barCount) * 30}, 70%, ${55 + (i / barCount) * 15}%)`
                : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
              }
              style={{
                transition: `height 0.15s ease-out, y 0.15s ease-out, fill 0.15s ease-out`,
                filter: revealed ? 'drop-shadow(0 0 2px rgba(99, 102, 241, 0.3))' : 'none',
              }}
            />
          )
        })}
      </svg>

      {/* Label */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
      }}>
        <span style={{
          fontSize: '11px',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
        }}>
          {revealCount >= barCount
            ? `128 values / 512 bytes — fingerprint complete`
            : `${Math.min(revealCount, 128)} / 128 values`
          }
        </span>
        {revealCount >= barCount && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: '11px',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              color: '#10b981',
            }}
          >
            Encoded
          </motion.span>
        )}
      </div>
    </div>
  )
}

export default CoefficientVisualizer
