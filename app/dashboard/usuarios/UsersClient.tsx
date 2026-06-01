'use client'

import { useState, useTransition } from 'react'
import { Profile, Role } from '@/lib/generated/prisma/client'
import { createUser, updateUserRole, toggleUserActive } from '@/lib/actions/users'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Loader2, UserPlus, ShieldCheck, User } from 'lucide-react'

type Props = {
  profiles: Profile[]
  currentUserId: string
}

export default function UsersClient({ profiles: initialProfiles, currentUserId }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createUser(formData)
        toast.success('Usuário criado com sucesso!')
        setDialogOpen(false)
        // Refresh profiles
        const res = await fetch('/api/me')
        window.location.reload()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário.')
      }
    })
  }

  async function handleRoleChange(userId: string, role: Role) {
    startTransition(async () => {
      try {
        await updateUserRole(userId, role)
        setProfiles(p => p.map(u => u.id === userId ? { ...u, role } : u))
        toast.success('Permissão atualizada.')
      } catch {
        toast.error('Erro ao atualizar permissão.')
      }
    })
  }

  async function handleToggleActive(userId: string, active: boolean) {
    startTransition(async () => {
      try {
        await toggleUserActive(userId, active)
        setProfiles(p => p.map(u => u.id === userId ? { ...u, active } : u))
        toast.success(active ? 'Usuário reativado.' : 'Usuário desativado.')
      } catch {
        toast.error('Erro ao alterar status.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gestão de Usuários</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {profiles.length} {profiles.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-[#F97316] hover:bg-[#EA580C] text-white gap-2">
              <UserPlus className="w-4 h-4" />
              Novo usuário
            </Button>
          } />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar novo usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Nome completo" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="email@cshub.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha inicial</Label>
                <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Permissão</Label>
                <select
                  name="role"
                  defaultValue="USER"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-[#F97316]"
                >
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="bg-[#F97316] hover:bg-[#EA580C] text-white">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                    <div>
                      <p className="font-medium text-sm text-foreground">{profile.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {profile.id === currentUserId ? (
                      <Badge className="bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20 gap-1">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <Select
                        value={profile.role}
                        onValueChange={(v) => handleRoleChange(profile.id, v as Role)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-36 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3 h-3" /> Usuário
                            </span>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3" /> Administrador
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={profile.active
                      ? 'border-emerald-500/30 text-emerald-500'
                      : 'border-red-500/30 text-red-500'
                    }>
                      {profile.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {profile.id !== currentUserId && (
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            className={profile.active
                              ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10 text-xs'
                              : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 text-xs'
                            }
                          >
                            {profile.active ? 'Desativar' : 'Reativar'}
                          </Button>
                        } />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {profile.active ? 'Desativar usuário?' : 'Reativar usuário?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {profile.active
                                ? `${profile.email} perderá acesso ao CSHUB imediatamente.`
                                : `${profile.email} voltará a ter acesso ao CSHUB.`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleToggleActive(profile.id, !profile.active)}
                              className={profile.active ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                            >
                              {profile.active ? 'Desativar' : 'Reativar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
