'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Calendar, Clock, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 3: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'High'
      case 2: return 'Medium'
      case 3: return 'Low'
      default: return 'Medium'
    }
  }

  return (
    <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700/40 hover:bg-white/40 dark:hover:bg-gray-900/50 transition-colors shadow-lg">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(todo.id)}
            className="p-0 h-auto"
          >
            {todo.is_complete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className={`font-medium ${todo.is_complete ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(todo.priority)}>
                  {getPriorityLabel(todo.priority)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(todo.id)}
                  className="p-1 h-auto text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {todo.description && (
              <div className={`text-sm text-gray-600 dark:text-gray-300 ${todo.is_complete ? 'line-through' : ''} whitespace-pre-wrap`}>
                {todo.description}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {todo.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
