export type Department = {
  id: string
  name: string
  slug: string
  order: number
}

export type Tool = {
  id: string
  department_id: string
  name: string
  description: string
  url: string
  icon: string | null
  active: boolean
  user_count: number
}
