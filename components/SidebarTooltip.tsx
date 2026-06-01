'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  label: string
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>
  enabled?: boolean
  delay?: number
}

export function SidebarTooltip({ label, children, enabled = true, delay = 400 }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elRef = useRef<HTMLElement | null>(null)

  const show = useCallback(() => {
    if (!enabled || !elRef.current) return
    const rect = elRef.current.getBoundingClientRect()
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 })
    timer.current = setTimeout(() => setVisible(true), delay)
  }, [enabled, delay])

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (timer.current) clearTimeout(timer.current)
      setVisible(false)
    }
  }, [enabled])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>

  const cloned = {
    ...child,
    props: {
      ...child.props,
      ref: (node: HTMLElement | null) => {
        elRef.current = node
        const originalRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref
        if (typeof originalRef === 'function') originalRef(node)
      },
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        show()
        child.props.onMouseEnter?.(e)
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        hide()
        child.props.onMouseLeave?.(e)
      },
      onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
        hide()
        child.props.onMouseDown?.(e)
      },
    },
  }

  return (
    <>
      {cloned}
      {visible && enabled && typeof window !== 'undefined' && createPortal(
        <div
          style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
          className="fixed z-[9999] pointer-events-none px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap shadow-md animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {label}
        </div>,
        document.body
      )}
    </>
  )
}
