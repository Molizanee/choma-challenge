'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

interface CreateTodoDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateTodo: (todo: { title: string; description: string; priority: number; due_date: string }) => void
  loading: boolean
}

export default function CreateTodoDialog({ isOpen, onOpenChange, onCreateTodo, loading }: CreateTodoDialogProps) {
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 2,
    due_date: ''
  })

  const handleSubmit = () => {
    if (!newTodo.title.trim()) return
    
    onCreateTodo(newTodo)
    setNewTodo({ title: '', description: '', priority: 2, due_date: '' })
  }

  const handleCancel = () => {
    setNewTodo({ title: '', description: '', priority: 2, due_date: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/50 dark:border-gray-700/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Todo
          </DialogTitle>
          <DialogDescription>
            Add a new task to your todo list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='flex flex-col gap-2'>
              <Label htmlFor="dialog-title">Title</Label>
              <Input
                id="dialog-title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                placeholder="Enter todo title..."
                className="bg-white/50 dark:bg-gray-900/50"
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor="dialog-priority">Priority</Label>
              <Select value={newTodo.priority.toString()} onValueChange={(value) => setNewTodo({ ...newTodo, priority: parseInt(value) })}>
                <SelectTrigger className="bg-white/50 dark:bg-gray-900/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Low</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="1">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="dialog-description">Description</Label>
            <Textarea
              id="dialog-description"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              placeholder="Enter description (optional)..."
              className="bg-white/50 dark:bg-gray-900/50 min-h-[150px]"
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="dialog-dueDate">Due Date</Label>
            <Input
              id="dialog-dueDate"
              type="date"
              value={newTodo.due_date}
              onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
              className="bg-white/50 dark:bg-gray-900/50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-green-500 hover:bg-green-600">
            {loading ? 'Creating...' : 'Create Todo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
