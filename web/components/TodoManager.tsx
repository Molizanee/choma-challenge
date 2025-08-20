'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Plus } from 'lucide-react'
import CreateTodoDialog from './CreateTodoDialog'

interface TodoManagerProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: 'all' | 'completed' | 'pending'
  onFilterChange: (value: 'all' | 'completed' | 'pending') => void
  sortBy: 'dueDate' | 'priority' | 'created'
  onSortChange: (value: 'dueDate' | 'priority' | 'created') => void
  isDialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
  onCreateTodo: (todo: { title: string; description: string; priority: number; due_date: string }) => void
  loading: boolean
}

export default function TodoManager({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  isDialogOpen,
  onDialogOpenChange,
  onCreateTodo,
  loading
}: TodoManagerProps) {
  return (
    <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700/40 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Manage Your Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search todos..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-900/50"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={onFilterChange}>
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-gray-900/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[140px] bg-white/50 dark:bg-gray-900/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CreateTodoDialog
            isOpen={isDialogOpen}
            onOpenChange={onDialogOpenChange}
            onCreateTodo={onCreateTodo}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
