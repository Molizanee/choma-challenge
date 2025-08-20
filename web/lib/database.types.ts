export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          created_at: string
          deleted_at: string | null
          is_deleted: boolean
          title: string | null
          description: string | null
          due_date: string | null
          priority: number
          is_complete: boolean
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          deleted_at?: string | null
          is_deleted?: boolean
          title?: string | null
          description?: string | null
          due_date?: string | null
          priority?: number
          is_complete?: boolean
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          deleted_at?: string | null
          is_deleted?: boolean
          title?: string | null
          description?: string | null
          due_date?: string | null
          priority?: number
          is_complete?: boolean
          user_id?: string | null
        }
      }
      phone_link: {
        Row: {
          id: string
          created_at: string
          is_active: boolean | null
          auth_code: number | null
          phone_number_linked: string | null
          user_id: string | null
          is_deleted: boolean
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          is_active?: boolean | null
          auth_code?: number | null
          phone_number_linked?: string | null
          user_id?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          is_active?: boolean | null
          auth_code?: number | null
          phone_number_linked?: string | null
          user_id?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
        }
      }
    }
  }
}
