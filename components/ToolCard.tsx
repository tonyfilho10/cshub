import { Tool } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="h-full border-border hover:border-[#F97316] transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-lg">
              {tool.icon ?? '🔧'}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#F97316] transition-colors mt-1" />
          </div>
          <h3 className="text-foreground font-semibold text-sm group-hover:text-[#F97316] transition-colors pt-2">
            {tool.name}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {tool.description && (
            <p className="text-muted-foreground text-xs leading-relaxed mb-3">
              {tool.description}
            </p>
          )}
          <Badge variant="outline" className="text-xs gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {tool.user_count} {tool.user_count === 1 ? 'usuário' : 'usuários'}
          </Badge>
        </CardContent>
      </Card>
    </a>
  )
}
