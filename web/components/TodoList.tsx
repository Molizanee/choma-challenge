'use client'

import { Card, CardContent } from '@/components/ui/card'
import TodoItem from './TodoItem'
import type { Todo } from '@/types'

interface TodoListProps {
  todos: Todo[]
  searchTerm: string
  filterStatus: 'all' | 'completed' | 'pending'
  sortBy: 'dueDate' | 'priority' | 'created'
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}

export default function TodoList({
  todos,
  searchTerm,
  filterStatus,
  sortBy,
  onToggleTodo,
  onDeleteTodo
}: TodoListProps) {
  const filteredAndSortedTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'completed' && todo.is_complete) ||
                           (filterStatus === 'pending' && !todo.is_complete)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case 'priority':
          return a.priority - b.priority
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

  if (filteredAndSortedTodos.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700/40 shadow-lg">
        <CardContent className="py-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' ? 'No todos match your filters' : 'No todos yet. Create your first one!'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggleTodo}
          onDelete={onDeleteTodo}
        />
      ))}
    </div>
  )
}
