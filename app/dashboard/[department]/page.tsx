import { createClient as createAdmin } from '@supabase/supabase-js'
import ToolCard from '@/components/ToolCard'
import { Tool } from '@/lib/types'

export const dynamic = 'force-dynamic'

const DEPARTMENT_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  comercial: 'Comercial',
  legalizacao: 'Legalização',
  fiscal: 'Fiscal',
  financeiro: 'Financeiro',
  contabil: 'Contábil',
  'departamento-pessoal': 'Departamento Pessoal',
  cs: 'CS',
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>
}) {
  const { department } = await params
  const label = DEPARTMENT_LABELS[department] ?? department

  try {
    const sb = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: dept } = await sb
      .from('departments').select('id').eq('slug', department).single()

    const { data: tools } = dept
      ? await sb.from('tools').select('*').eq('department_id', dept.id).eq('active', true).order('name')
      : { data: [] }

    return (
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">{label}</h2>
        {tools && tools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool: Tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma ferramenta disponível neste departamento.</p>
        )}
      </div>
    )
  } catch {
    return (
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">{label}</h2>
        <p className="text-muted-foreground text-sm">Erro ao carregar ferramentas.</p>
      </div>
    )
  }
}
