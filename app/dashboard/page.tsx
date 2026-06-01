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

  // Deduplica por URL — exibe cada ferramenta apenas uma vez na visão geral
  const unique = tools
    ? Object.values(
        tools.reduce((acc: Record<string, Tool>, tool: Tool) => {
          if (!acc[tool.url]) acc[tool.url] = tool
          return acc
        }, {})
      )
    : []

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Todas as Ferramentas</h2>
      {unique.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {unique.map((tool: Tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Nenhuma ferramenta cadastrada ainda.</p>
      )}
    </div>
  )
}
