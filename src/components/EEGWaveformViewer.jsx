import { useState, useRef, useCallback } from 'react'
import { useTheme } from '../providers/ThemeProvider'

const CHANNEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
const DEFAULT_CHANNEL_NAMES = ['TP9', 'AF7', 'AF8', 'TP10']

export default function EEGWaveformViewer({
  data,
  channelNames = DEFAULT_CHANNEL_NAMES,
  samplingRate = 100,
  width = 600,
  height = 280,
}) {
  const { isDark } = useTheme()
  const svgRef = useRef(null)
  const [hover, setHover] = useState(null)

  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : '#64748b'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  if (!data || !data.length) return null

  const numChannels = data.length
  const numSamples = data[0].length
  const durationMs = (numSamples / samplingRate) * 1000

  const padLeft = 48
  const padRight = 12
  const padTop = 8
  const padBottom = 24
  const plotW = width - padLeft - padRight
  const channelH = (height - padTop - padBottom) / numChannels
  const gap = 4

  // Build polyline points per channel
  const polylines = data.map((ch, ci) => {
    const min = Math.min(...ch)
    const max = Math.max(...ch)
    const range = max - min || 1
    const yBase = padTop + ci * channelH
    const usableH = channelH - gap * 2

    return ch.map((v, si) => {
      const x = padLeft + (si / (numSamples - 1)) * plotW
      const y = yBase + gap + usableH - ((v - min) / range) * usableH
      return `${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  })

  const handleMouseMove = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const sampleIdx = Math.round(((mx - padLeft) / plotW) * (numSamples - 1))
    if (sampleIdx < 0 || sampleIdx >= numSamples) { setHover(null); return }
    setHover({
      x: padLeft + (sampleIdx / (numSamples - 1)) * plotW,
      sampleIdx,
      values: data.map(ch => ch[sampleIdx]),
      timeMs: ((sampleIdx / samplingRate) * 1000).toFixed(0),
    })
  }, [data, numSamples, plotW, samplingRate, padLeft])

  // Time axis ticks
  const timeTicks = []
  const tickCount = 5
  for (let i = 0; i <= tickCount; i++) {
    const ms = (durationMs / tickCount) * i
    timeTicks.push({ x: padLeft + (i / tickCount) * plotW, label: `${ms.toFixed(0)}ms` })
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block', maxWidth: `${width}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      {/* Grid lines */}
      {data.map((_, ci) => {
        const y = padTop + ci * channelH + channelH / 2
        return <line key={`grid-${ci}`} x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke={gridColor} strokeDasharray="4 4" />
      })}

      {/* Channel labels */}
      {(channelNames || DEFAULT_CHANNEL_NAMES).slice(0, numChannels).map((name, ci) => (
        <text
          key={`lbl-${ci}`}
          x={padLeft - 6}
          y={padTop + ci * channelH + channelH / 2 + 4}
          textAnchor="end"
          fontSize="10"
          fontFamily="monospace"
          fill={CHANNEL_COLORS[ci % CHANNEL_COLORS.length]}
        >
          {name}
        </text>
      ))}

      {/* Waveforms */}
      {polylines.map((pts, ci) => (
        <polyline
          key={`wave-${ci}`}
          points={pts}
          fill="none"
          stroke={CHANNEL_COLORS[ci % CHANNEL_COLORS.length]}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      ))}

      {/* Time axis */}
      {timeTicks.map((t, i) => (
        <text key={`tick-${i}`} x={t.x} y={height - 4} textAnchor="middle" fontSize="9" fill={textSecondary}>
          {t.label}
        </text>
      ))}

      {/* Hover crosshair */}
      {hover && (
        <>
          <line x1={hover.x} x2={hover.x} y1={padTop} y2={height - padBottom} stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} strokeWidth="1" strokeDasharray="3 3" />
          {/* Tooltip background */}
          <rect
            x={Math.min(hover.x + 8, width - 130)}
            y={padTop}
            width="120"
            height={16 + numChannels * 14}
            rx="6"
            fill={isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)'}
            stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
          />
          <text x={Math.min(hover.x + 14, width - 124)} y={padTop + 12} fontSize="9" fill={textSecondary} fontFamily="monospace">
            #{hover.sampleIdx} ({hover.timeMs}ms)
          </text>
          {hover.values.map((v, i) => (
            <text
              key={`hv-${i}`}
              x={Math.min(hover.x + 14, width - 124)}
              y={padTop + 26 + i * 14}
              fontSize="10"
              fontFamily="monospace"
              fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
            >
              {(channelNames || DEFAULT_CHANNEL_NAMES)[i]}: {v?.toFixed(2)}
            </text>
          ))}
        </>
      )}
    </svg>
  )
}
