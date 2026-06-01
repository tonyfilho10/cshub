'use client'

import { useState, useTransition } from 'react'
import { Profile, Role } from '@/lib/generated/prisma/client'
import { createUser, updateUser, updateUserRole, toggleUserActive, deleteUser } from '@/lib/actions/users'
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
import { Loader2, UserPlus, ShieldCheck, User, Pencil, Trash2, PowerOff, Power } from 'lucide-react'

type Props = { profiles: Profile[]; currentUserId: string }

export default function UsersClient({ profiles: initial, currentUserId }: Props) {
  const [profiles, setProfiles] = useState(initial)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [isPending, startTransition] = useTransition()

  /* ── Create ─────────────────────────────────────────────── */
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createUser(fd)
        toast.success('Usuário criado!')
        setCreateOpen(false)
        window.location.reload()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário.')
      }
    })
  }

  /* ── Edit ────────────────────────────────────────────────── */
  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editUser) return
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const email = fd.get('email') as string

    startTransition(async () => {
      try {
        await updateUser(editUser.id, { name, email })
        setProfiles(p => p.map(u => u.id === editUser.id ? { ...u, name, email } : u))
        toast.success('Usuário atualizado!')
        setEditUser(null)
      } catch {
        toast.error('Erro ao atualizar usuário.')
      }
    })
  }

  /* ── Role ────────────────────────────────────────────────── */
  async function handleRole(userId: string, role: Role) {
    startTransition(async () => {
      try {
        await updateUserRole(userId, role)
        setProfiles(p => p.map(u => u.id === userId ? { ...u, role } : u))
        toast.success('Permissão atualizada.')
      } catch { toast.error('Erro ao atualizar permissão.') }
    })
  }

  /* ── Toggle active ───────────────────────────────────────── */
  async function handleToggle(userId: string, active: boolean) {
    startTransition(async () => {
      try {
        await toggleUserActive(userId, active)
        setProfiles(p => p.map(u => u.id === userId ? { ...u, active } : u))
        toast.success(active ? 'Usuário reativado.' : 'Usuário desativado.')
      } catch { toast.error('Erro ao alterar status.') }
    })
  }

  /* ── Delete ──────────────────────────────────────────────── */
  async function handleDelete(userId: string) {
    startTransition(async () => {
      try {
        await deleteUser(userId)
        setProfiles(p => p.filter(u => u.id !== userId))
        toast.success('Usuário excluído.')
      } catch { toast.error('Erro ao excluir usuário.') }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gestão de Usuários</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {profiles.length} {profiles.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#F97316] hover:bg-[#EA580C] text-white gap-2">
          <UserPlus className="w-4 h-4" /> Novo usuário
        </Button>
      </div>

      {/* Tabela */}
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
                    <Badge variant="outline" className={profile.active
                      ? 'border-emerald-500/30 text-emerald-500'
                      : 'border-red-500/30 text-red-500'}>
                      {profile.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>

                  <TableCell className="text-right">
                    {profile.id !== currentUserId && (
                      <div className="flex items-center justify-end gap-1">
                        {/* Editar */}
                        <Button variant="ghost" size="sm" disabled={isPending}
                          onClick={() => setEditUser(profile)}
                          className="text-muted-foreground hover:text-foreground h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        {/* Desativar / Reativar */}
                        <AlertDialog>
                          <AlertDialogTrigger render={
                            <Button variant="ghost" size="sm" disabled={isPending}
                              className={`h-7 w-7 p-0 ${profile.active
                                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                                : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'}`}>
                              {profile.active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                            </Button>
                          } />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{profile.active ? 'Desativar usuário?' : 'Reativar usuário?'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {profile.active
                                  ? `${profile.email} perderá acesso ao CSHUB imediatamente.`
                                  : `${profile.email} voltará a ter acesso ao CSHUB.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggle(profile.id, !profile.active)}
                                className={profile.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}>
                                {profile.active ? 'Desativar' : 'Reativar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Excluir */}
                        <AlertDialog>
                          <AlertDialogTrigger render={
                            <Button variant="ghost" size="sm" disabled={isPending}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          } />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é irreversível. <strong>{profile.email}</strong> será removido permanentemente do CSHUB.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(profile.id)}
                                className="bg-red-500 hover:bg-red-600">
                                Excluir permanentemente
                              </AlertDialogAction>
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

      {/* Dialog — Criar usuário */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Criar novo usuário</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Nome</Label>
              <Input id="c-name" name="name" placeholder="Nome completo" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">E-mail</Label>
              <Input id="c-email" name="email" type="email" placeholder="email@cshub.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-password">Senha inicial</Label>
              <Input id="c-password" name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-role">Permissão</Label>
              <select name="role" defaultValue="USER"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-[#F97316]">
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

      {/* Dialog — Editar usuário */}
      <Dialog open={!!editUser} onOpenChange={open => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
          {editUser && (
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="e-name">Nome</Label>
                <Input id="e-name" name="name" defaultValue={editUser.name ?? ''} placeholder="Nome completo" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-email">E-mail</Label>
                <Input id="e-email" name="email" type="email" defaultValue={editUser.email} required />
              </div>
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
