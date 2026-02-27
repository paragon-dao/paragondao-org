import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

const STEPS = [
  { num: 1, label: 'Register', icon: '📋' },
  { num: 2, label: 'Upload', icon: '📤' },
  { num: 3, label: 'Benchmark', icon: '🎯' },
  { num: 4, label: 'Verify', icon: '🔍' },
  { num: 5, label: 'Results', icon: '📊' },
  { num: 6, label: 'Publish', icon: '🚀' },
  { num: 7, label: 'Complete', icon: '✅' },
]

export default function PipelineStepIndicator({ currentStep, onStepClick, compact = false }) {
  const { isDark } = useTheme()

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
  const lineBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '0' : '4px' }}>
      {STEPS.map((step, i) => {
        const isActive = step.num === currentStep
        const isComplete = step.num < currentStep
        const isFuture = step.num > currentStep

        return (
          <div key={step.num}>
            <motion.div
              onClick={() => onStepClick && isComplete && onStepClick(step.num)}
              whileHover={isComplete ? { x: 2 } : {}}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: compact ? '8px 12px' : '10px 16px',
                borderRadius: '10px',
                cursor: isComplete && onStepClick ? 'pointer' : 'default',
                background: isActive
                  ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)')
                  : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Step circle */}
              <div
                style={{
                  width: compact ? '28px' : '32px',
                  height: compact ? '28px' : '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: compact ? '13px' : '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                  background: isComplete
                    ? '#10b981'
                    : isActive
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                  color: (isComplete || isActive) ? '#fff' : textMuted,
                  transition: 'all 0.3s ease',
                }}
              >
                {isComplete ? '✓' : step.num}
              </div>

              {/* Label */}
              <div>
                <div style={{
                  fontSize: compact ? '12px' : '13px',
                  fontWeight: isActive ? '700' : '500',
                  color: isFuture ? textMuted : textPrimary,
                  transition: 'color 0.2s ease',
                }}>
                  {step.label}
                </div>
              </div>
            </motion.div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                marginLeft: compact ? '25px' : '31px',
                width: '2px',
                height: compact ? '8px' : '12px',
                background: step.num < currentStep ? '#10b981' : lineBg,
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
