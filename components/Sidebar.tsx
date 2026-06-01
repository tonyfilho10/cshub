'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Menu, Moon, Sun, X, UserRound, Users } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const DEPARTMENTS = [
  { label: 'Todos',          slug: '' },
  { label: 'Comercial',      slug: 'comercial' },
  { label: 'Contábil',       slug: 'contabil' },
  { label: 'CS',             slug: 'cs' },
  { label: 'Depto. Pessoal', slug: 'departamento-pessoal' },
  { label: 'Financeiro',     slug: 'financeiro' },
  { label: 'Fiscal',         slug: 'fiscal' },
  { label: 'Legalização',    slug: 'legalizacao' },
  { label: 'Onboarding',     slug: 'onboarding' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        fetch('/api/me').then(r => r.json()).then(d => setIsAdmin(d.role === 'ADMIN'))
      }
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(slug: string) {
    if (!slug) return pathname === '/dashboard'
    return pathname === `/dashboard/${slug}`
  }

  function getInitials(email: string) {
    return email?.slice(0, 2).toUpperCase() ?? 'U'
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)]">
        <span className="text-xl font-bold text-foreground">
          CS<span className="text-[#F97316]">HUB</span>
        </span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[var(--sidebar-text)] hover:text-foreground transition-colors p-1"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${menuOpen ? 'flex' : 'hidden'} md:flex
        flex-col w-full md:w-56 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] md:min-h-screen shrink-0
      `}>
        {/* Logo */}
        <div className="hidden md:flex items-center px-5 py-5">
          <span className="text-2xl font-bold text-foreground">
            CS<span className="text-[#F97316]">HUB</span>
          </span>
        </div>

        <Separator className="hidden md:block bg-[var(--sidebar-border)]" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs text-[var(--sidebar-text)] uppercase tracking-wider px-2 mb-2">
            Departamentos
          </p>
          {DEPARTMENTS.map(dept => {
            const href = dept.slug ? `/dashboard/${dept.slug}` : '/dashboard'
            const active = isActive(dept.slug)
            return (
              <Link
                key={dept.slug}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`
                  flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${active
                    ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]'}
                `}
              >
                {dept.label}
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-[var(--sidebar-border)]" />

        {/* Gestão de usuários — só admins */}
        {isAdmin && (
          <Link
            href="/dashboard/usuarios"
            onClick={() => setMenuOpen(false)}
            className={`
              flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive('usuarios')
                ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]'}
            `}
          >
            <Users className="w-4 h-4" />
            Usuários
          </Link>
        )}

        {/* Perfil do usuário */}
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/dashboard/perfil"
            onClick={() => setMenuOpen(false)}
            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors
              ${isActive('perfil')
                ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                : 'hover:bg-[var(--sidebar-hover-bg)]'}
            `}
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs bg-[#F97316] text-white">
                {getInitials(user?.email ?? '')}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className={`text-xs font-medium truncate ${isActive('perfil') ? 'text-white' : 'text-[var(--sidebar-text-hover)]'}`}>
                {user?.email?.split('@')[0]}
              </p>
              <p className={`text-xs truncate ${isActive('perfil') ? 'text-white/80' : 'text-[var(--sidebar-text)]'}`}>
                Meu perfil
              </p>
            </div>
            <UserRound className={`w-3.5 h-3.5 ml-auto shrink-0 ${isActive('perfil') ? 'text-white' : 'text-[var(--sidebar-text)]'}`} />
          </Link>
        </div>

        {/* Theme toggle + Logout */}
        <div className="px-3 pb-4 space-y-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
          >
            {theme === 'dark'
              ? <><Sun className="w-4 h-4 mr-2" /> Modo Claro</>
              : <><Moon className="w-4 h-4 mr-2" /> Modo Escuro</>
            }
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
