'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div>
          <p className="text-[#F97316] text-5xl font-bold">Ops!</p>
          <h1 className="text-white text-2xl font-semibold mt-2">Algo deu errado</h1>
          <p className="text-slate-400 text-sm mt-2">
            Ocorreu um erro ao carregar esta página. Tente novamente.
          </p>
          {error.digest && (
            <p className="text-slate-600 text-xs mt-3 font-mono">
              Código: {error.digest}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  )
}
