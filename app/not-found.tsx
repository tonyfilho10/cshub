import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div>
          <p className="text-[#F97316] text-6xl font-bold">404</p>
          <h1 className="text-white text-2xl font-semibold mt-2">Página não encontrada</h1>
          <p className="text-slate-400 text-sm mt-2">
            A rota que você acessou não existe ou foi removida.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
