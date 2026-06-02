import { createClient as createAdmin } from '@supabase/supabase-js'
import ToolCard from '@/components/ToolCard'
import { Tool } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    const sb = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: tools } = await sb
      .from('tools').select('*').eq('active', true).order('name')

    const unique: Tool[] = tools
      ? Array.from(new Map((tools as Tool[]).map(t => [t.url, t])).values())
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
  } catch {
    return (
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Todas as Ferramentas</h2>
        <p className="text-muted-foreground text-sm">Nenhuma ferramenta disponível no momento.</p>
      </div>
    )
  }
}
