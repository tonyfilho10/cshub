'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  label: string
  children: React.ReactNode
  enabled?: boolean
}

export function SidebarTooltip({ label, children, enabled = true }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)

  function show() {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    })
    setVisible(true)
  }

  function hide() { setVisible(false) }

  useEffect(() => { if (!enabled) setVisible(false) }, [enabled])

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="contents">
      {children}
      {visible && typeof window !== 'undefined' && createPortal(
        <div
          style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
          className="fixed z-[9999] pointer-events-none px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap shadow-md"
        >
          {label}
        </div>,
        document.body
      )}
    </div>
  )
}
