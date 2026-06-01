'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <p style={{ color: '#F97316', fontSize: '3rem', fontWeight: 700, margin: 0 }}>Erro crítico</p>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: 600, margin: '0.5rem 0' }}>
            A aplicação não pôde ser carregada
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: '0.5rem 0 1.5rem' }}>
            Por favor, recarregue a página ou tente novamente mais tarde.
          </p>
          <button
            onClick={reset}
            style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  )
}
