'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Menu, Moon, Sun, X, UserRound, Users, ChevronLeft, LayoutGrid, ShoppingBag, Scale, Receipt, DollarSign, BookOpen, Users2, HeadphonesIcon, Home } from 'lucide-react'
import { SidebarTooltip } from '@/components/SidebarTooltip'
import type { User } from '@supabase/supabase-js'

const DEPARTMENTS = [
  { label: 'Todos',          slug: '',                     icon: Home },
  { label: 'Comercial',      slug: 'comercial',            icon: ShoppingBag },
  { label: 'Contábil',       slug: 'contabil',             icon: BookOpen },
  { label: 'CS',             slug: 'cs',                   icon: HeadphonesIcon },
  { label: 'Depto. Pessoal', slug: 'departamento-pessoal', icon: Users2 },
  { label: 'Financeiro',     slug: 'financeiro',           icon: DollarSign },
  { label: 'Fiscal',         slug: 'fiscal',               icon: Receipt },
  { label: 'Legalização',    slug: 'legalizacao',          icon: Scale },
  { label: 'Onboarding',     slug: 'onboarding',           icon: LayoutGrid },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

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

  const w = collapsed ? 'md:w-[60px]' : 'md:w-56'

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
        ${menuOpen ? 'flex' : 'hidden'} md:flex flex-col
        ${w} bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
        md:min-h-screen shrink-0 transition-all duration-200 overflow-hidden
      `}>

        {/* Logo + toggle */}
        <div className="hidden md:flex items-center justify-between px-3 py-4 min-h-[60px]">
          {!collapsed && (
            <span className="text-2xl font-bold text-foreground pl-2">
              CS<span className="text-[#F97316]">HUB</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`
              flex items-center justify-center w-7 h-7 rounded-md
              text-[var(--sidebar-text)] hover:text-foreground hover:bg-[var(--sidebar-hover-bg)]
              transition-colors shrink-0 ${collapsed ? 'mx-auto' : 'ml-auto'}
            `}
            title={collapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <Separator className="hidden md:block bg-[var(--sidebar-border)]" />

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {!collapsed && (
            <p className="text-xs text-[var(--sidebar-text)] uppercase tracking-wider px-2 mb-2">
              Departamentos
            </p>
          )}
          {DEPARTMENTS.map(dept => {
            const href = dept.slug ? `/dashboard/${dept.slug}` : '/dashboard'
            const active = isActive(dept.slug)
            const Icon = dept.icon
            const linkClass = `
              flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm font-medium transition-colors
              ${collapsed ? 'justify-center' : ''}
              ${active
                ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]'}
            `
            return (
              <SidebarTooltip key={dept.slug} label={dept.label} enabled={collapsed}>
                <Link href={href} onClick={() => setMenuOpen(false)} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{dept.label}</span>}
                </Link>
              </SidebarTooltip>
            )
          })}
        </nav>

        <Separator className="bg-[var(--sidebar-border)]" />

        {/* Usuários (admin) */}
        {isAdmin && (
          <div className="px-2 pt-2">
            <SidebarTooltip label="Usuários" enabled={collapsed}>
              <Link
                href="/dashboard/usuarios"
                onClick={() => setMenuOpen(false)}
                className={`
                  flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm font-medium transition-colors
                  ${collapsed ? 'justify-center' : ''}
                  ${isActive('usuarios')
                    ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]'}
                `}
              >
                <Users className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Usuários</span>}
              </Link>
            </SidebarTooltip>
          </div>
        )}

        {/* Perfil */}
        <div className="px-2 pt-2 pb-1">
          <SidebarTooltip label={user?.email?.split('@')[0] ?? 'Meu perfil'} enabled={collapsed}>
            <Link
              href="/dashboard/perfil"
              onClick={() => setMenuOpen(false)}
              className={`
                flex items-center gap-3 w-full px-2 py-2 rounded-md transition-colors
                ${collapsed ? 'justify-center' : ''}
                ${isActive('perfil')
                  ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                  : 'hover:bg-[var(--sidebar-hover-bg)]'}
              `}
            >
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs bg-[#F97316] text-white">
                  {getInitials(user?.email ?? '')}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="overflow-hidden flex-1">
                  <p className={`text-xs font-medium truncate ${isActive('perfil') ? 'text-white' : 'text-[var(--sidebar-text-hover)]'}`}>
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className={`text-xs truncate ${isActive('perfil') ? 'text-white/80' : 'text-[var(--sidebar-text)]'}`}>
                    Meu perfil
                  </p>
                </div>
              )}
              {!collapsed && (
                <UserRound className={`w-3.5 h-3.5 shrink-0 ${isActive('perfil') ? 'text-white' : 'text-[var(--sidebar-text)]'}`} />
              )}
            </Link>
          </SidebarTooltip>
        </div>

        {/* Tema + Logout */}
        <div className="px-2 pb-4 space-y-1">
          <SidebarTooltip label={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'} enabled={collapsed}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`
                flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm
                text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
              {!collapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </button>
          </SidebarTooltip>

          <SidebarTooltip label="Sair" enabled={collapsed}>
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm
                text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Sair</span>}
            </button>
          </SidebarTooltip>
        </div>
      </aside>
    </>
  )
}
