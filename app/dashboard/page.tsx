import { createClient } from '@/lib/supabase/server'
import ToolCard from '@/components/ToolCard'
import { Tool } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('active', true)
    .order('name')

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Todas as Ferramentas</h2>
      {tools && tools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool: Tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">Nenhuma ferramenta cadastrada ainda.</p>
      )}
    </div>
  )
}
