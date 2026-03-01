import { useState, useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

export default function AnimatedNumber({ value, decimals = 5, duration = 1.2, prefix = '', suffix = '', style }) {
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
      onUpdate: v => setDisplay(v.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [inView, value, decimals, duration])

  return <span ref={ref} style={style}>{prefix}{display}{suffix}</span>
}
