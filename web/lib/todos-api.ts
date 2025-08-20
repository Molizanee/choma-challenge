import { Database } from './database.types';

type TodoRow = Database['public']['Tables']['todos']['Row'];
type TodoInsert = Database['public']['Tables']['todos']['Insert'];
type TodoUpdate = Database['public']['Tables']['todos']['Update'];

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

class TodosAPI {
  private baseUrl = '/api/todos';

  async getAllTodos(userId?: string): Promise<ApiResponse<TodoRow[]>> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);
      if (userId) {
        url.searchParams.set('user_id', userId);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) {
        return { error: result.error, details: result.details };
      }

      return { data: result.todos };
    } catch (error) {
      return { error: 'Failed to fetch todos' };
    }
  }

  async createTodo(todoData: Omit<TodoInsert, 'id' | 'created_at' | 'is_deleted'>): Promise<ApiResponse<TodoRow>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error, details: result.details };
      }

      return { data: result.todo };
    } catch (error) {
      return { error: 'Failed to create todo' };
    }
  }

  async getTodo(id: string): Promise<ApiResponse<TodoRow>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const result = await response.json();

      if (!response.ok) {
        return { error: result.error, details: result.details };
      }

      return { data: result.todo };
    } catch (error) {
      return { error: 'Failed to fetch todo' };
    }
  }

  async updateTodo(id: string, updates: Partial<TodoUpdate>): Promise<ApiResponse<TodoRow>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error, details: result.details };
      }

      return { data: result.todo };
    } catch (error) {
      return { error: 'Failed to update todo' };
    }
  }

  async deleteTodo(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error, details: result.details };
      }

      return { data: { message: result.message } };
    } catch (error) {
      return { error: 'Failed to delete todo' };
    }
  }
}

export const todosAPI = new TodosAPI();
