'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error('[Dashboard Error]', error) }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-[#F97316] text-4xl font-bold">Ops!</p>
        <h2 className="text-foreground text-lg font-semibold">Algo deu errado nesta seção</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || 'Erro ao carregar o conteúdo.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">digest: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-[#F97316] hover:bg-[#EA580C] text-white">
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
}
