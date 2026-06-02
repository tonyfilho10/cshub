'use client'

import { useState, useTransition, useEffect } from 'react'
import { createUser, updateUser, updateUserRole, toggleUserActive, deleteUser } from '@/lib/actions/users'
import type { ActionResult } from '@/lib/actions/users'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, UserPlus, ShieldCheck, User, Pencil, Trash2, PowerOff, Power, RefreshCw } from 'lucide-react'

type Role = 'ADMIN' | 'USER'
type Profile = {
  id: string
  email: string
  name: string | null
  role: Role
  active: boolean
  created_at: string
}

export default function UsersClient() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [isPending, startTransition] = useTransition()

  async function loadUsers() {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (!res.ok) { setFetchError(data.error ?? 'Erro desconhecido.'); return }
      setProfiles(data.profiles)
      setCurrentUserId(data.currentUserId)
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Falha na requisição.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  function handle(result: ActionResult, onSuccess: () => void) {
    if (!result.ok) { toast.error(result.error ?? 'Erro.'); return }
    onSuccess()
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createUser(fd)
      handle(result, () => {
        toast.success('Usuário criado!')
        setCreateOpen(false)
        loadUsers()
      })
    })
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editUser) return
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateUser(editUser.id, {
        name: fd.get('name') as string,
        email: fd.get('email') as string,
      })
      handle(result, () => {
        toast.success('Usuário atualizado!')
        setEditUser(null)
        loadUsers()
      })
    })
  }

  async function handleRole(userId: string, role: Role) {
    startTransition(async () => {
      const result = await updateUserRole(userId, role)
      handle(result, () => {
        setProfiles(p => p.map(u => u.id === userId ? { ...u, role } : u))
        toast.success('Permissão atualizada.')
      })
    })
  }

  async function handleToggle(userId: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleUserActive(userId, active)
      handle(result, () => {
        setProfiles(p => p.map(u => u.id === userId ? { ...u, active } : u))
        toast.success(active ? 'Usuário reativado.' : 'Usuário desativado.')
      })
    })
  }

  async function handleDelete(userId: string) {
    startTransition(async () => {
      const result = await deleteUser(userId)
      handle(result, () => {
        setProfiles(p => p.filter(u => u.id !== userId))
        toast.success('Usuário excluído.')
      })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gestão de Usuários</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Carregando...' : `${profiles.length} ${profiles.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#F97316] hover:bg-[#EA580C] text-white gap-2">
            <UserPlus className="w-4 h-4" /> Novo usuário
          </Button>
        </div>
      </div>

      {/* Estado de erro */}
      {fetchError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-1">
          <p className="text-sm font-medium text-red-500">Erro ao carregar usuários</p>
          <p className="text-xs text-red-400 font-mono">{fetchError}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      {!loading && !fetchError && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuários</CardTitle>
            <CardDescription>Gerencie acessos e permissões da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map(profile => (
                  <TableRow key={profile.id} className={!profile.active ? 'opacity-50' : ''}>
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{profile.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </TableCell>
                    <TableCell>
                      {profile.id === currentUserId ? (
                        <Badge className="bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20 gap-1">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </Badge>
                      ) : (
                        <Select value={profile.role} onValueChange={v => handleRole(profile.id, v as Role)} disabled={isPending}>
                          <SelectTrigger className="w-36 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER"><span className="flex items-center gap-1.5"><User className="w-3 h-3" /> Usuário</span></SelectItem>
                            <SelectItem value="ADMIN"><span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Administrador</span></SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={profile.active ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'}>
                        {profile.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {profile.id !== currentUserId && (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" disabled={isPending} onClick={() => setEditUser(profile)} className="text-muted-foreground hover:text-foreground h-7 w-7 p-0">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger render={
                              <Button variant="ghost" size="sm" disabled={isPending} className={`h-7 w-7 p-0 ${profile.active ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
                                {profile.active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                              </Button>
                            } />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{profile.active ? 'Desativar usuário?' : 'Reativar usuário?'}</AlertDialogTitle>
                                <AlertDialogDescription>{profile.active ? `${profile.email} perderá acesso imediatamente.` : `${profile.email} voltará a ter acesso.`}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleToggle(profile.id, !profile.active)} className={profile.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}>
                                  {profile.active ? 'Desativar' : 'Reativar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger render={
                              <Button variant="ghost" size="sm" disabled={isPending} className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            } />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação é irreversível. <strong>{profile.email}</strong> será removido permanentemente.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(profile.id)} className="bg-red-500 hover:bg-red-600">Excluir permanentemente</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog Criar */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Criar novo usuário</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label htmlFor="c-name">Nome</Label><Input id="c-name" name="name" placeholder="Nome completo" required /></div>
            <div className="space-y-1.5"><Label htmlFor="c-email">E-mail</Label><Input id="c-email" name="email" type="email" placeholder="email@cshub.com" required /></div>
            <div className="space-y-1.5"><Label htmlFor="c-password">Senha inicial</Label><Input id="c-password" name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required /></div>
            <div className="space-y-1.5">
              <Label>Permissão</Label>
              <select name="role" defaultValue="USER" className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-[#F97316]">
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending} className="bg-[#F97316] hover:bg-[#EA580C] text-white">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={!!editUser} onOpenChange={o => !o && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
          {editUser && (
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-1.5"><Label htmlFor="e-name">Nome</Label><Input id="e-name" name="name" defaultValue={editUser.name ?? ''} required /></div>
              <div className="space-y-1.5"><Label htmlFor="e-email">E-mail</Label><Input id="e-email" name="email" type="email" defaultValue={editUser.email} required /></div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
                <Button type="submit" disabled={isPending} className="bg-[#F97316] hover:bg-[#EA580C] text-white">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
