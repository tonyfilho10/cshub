'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  label: string
  children: React.ReactNode
  enabled?: boolean
  delay?: number
}

export function SidebarTooltip({ label, children, enabled = true, delay = 400 }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 })
    timer.current = setTimeout(() => setVisible(true), delay)
  }

  function hide() {
    if (timer.current) clearTimeout(timer.current)
    setVisible(false)
  }

  useEffect(() => {
    if (!enabled) {
      if (timer.current) clearTimeout(timer.current)
      setVisible(false)
    }
  }, [enabled])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <div
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseDown={hide}
      className="contents"
    >
      {children}
      {visible && enabled && typeof window !== 'undefined' && createPortal(
        <div
          style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
          className="fixed z-[9999] pointer-events-none px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap shadow-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {label}
        </div>,
        document.body
      )}
    </div>
  )
}
