export interface Todo {
  id: string
  title: string
  description?: string
  is_complete: boolean
  priority: number
  due_date?: string
  created_at: string
  user_id: string
}

export interface User {
  id: string
  email: string
  user_metadata: {
    avatar_url?: string
    full_name?: string
    user_name?: string
  }
}

export interface AuthCode {
  auth_code: number | null
  is_linked: boolean
  phone_number: string | null
  created_at: string | null
}
