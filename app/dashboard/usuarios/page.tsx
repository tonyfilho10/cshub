import UsersClient from './UsersClient'

// Auth já garantida pelo proxy — página só renderiza o client component
export default function UsuariosPage() {
  return <UsersClient />
}
