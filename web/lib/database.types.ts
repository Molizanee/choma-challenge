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
    }
  }
}
