'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Filter, Calendar, Clock, User, LogOut, CheckCircle, Circle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Todo {
  id: string
  title: string
  description?: string
  is_complete: boolean
  priority: number // 1 = high, 2 = medium, 3 = low (matches DB schema)
  due_date?: string
  created_at: string
  user_id: string
}

interface User {
  id: string
  email: string
  user_metadata: {
    avatar_url?: string
    full_name?: string
    user_name?: string
  }
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 2, // medium priority (2)
    due_date: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadTodos()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth'
      return
    }
    setUser(user as User)
  }

  const loadTodos = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load todos')
        console.error('Error loading todos:', error)
        return
      }

      setTodos(todos || [])
    } catch (error) {
      setError('Failed to load todos')
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async () => {
    if (!newTodo.title.trim() || !user) return

    setLoading(true)
    setError(null)

    try {
      // Debug: Log the current user to ensure we have the right user_id
      console.log('Current user:', user.id)
      
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title: newTodo.title,
            description: newTodo.description || null,
            priority: newTodo.priority,
            due_date: newTodo.due_date || null,
            user_id: user.id
          }
        ])
        .select()

      if (error) {
        setError(`Failed to create todo: ${error.message}`)
        console.error('Error creating todo:', error)
        return
      }

      if (data && data[0]) {
        setTodos([data[0], ...todos])
      }
      
      setNewTodo({ title: '', description: '', priority: 2, due_date: '' })
      setIsDialogOpen(false)
    } catch (error) {
      setError('Failed to create todo')
      console.error('Error creating todo:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !todo.is_complete })
        .eq('id', id)

      if (error) {
        console.error('Error updating todo:', error)
        return
      }

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_complete: !todo.is_complete } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error deleting todo:', error)
        return
      }

      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

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
          // Lower number = higher priority (1 = high, 2 = medium, 3 = low)
          return a.priority - b.priority
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' // high
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' // medium
      case 3: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' // low
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with user profile */}
      <header className="border-b border-white/20 dark:border-gray-700/20 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Choma Tasks
            </h1>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block font-medium">
                      {user.user_metadata.full_name || user.user_metadata.user_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Display */}
        {error && (
          <Card className="backdrop-blur-xl bg-red-50/20 dark:bg-red-900/20 border border-red-200/30 dark:border-red-700/30">
            <CardContent className="py-4">
              <div className="text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            </CardContent>
          </Card>
        )}
        {/* First Row: Search, Create, and Filter */}
        <Card className="backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Manage Your Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search todos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-900/50"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
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

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Todo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/30 dark:border-gray-700/30">
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
                      <div>
                        <Label htmlFor="dialog-title">Title</Label>
                        <Input
                          id="dialog-title"
                          value={newTodo.title}
                          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                          placeholder="Enter todo title..."
                          className="bg-white/50 dark:bg-gray-900/50"
                        />
                      </div>
                      <div>
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
                    <div>
                      <Label htmlFor="dialog-description">Description</Label>
                      <Textarea
                        id="dialog-description"
                        value={newTodo.description}
                        onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                        placeholder="Enter description (optional)..."
                        className="bg-white/50 dark:bg-gray-900/50 min-h-[150px]"
                      />
                    </div>
                    <div>
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
                    <Button variant="outline" onClick={() => {
                      setIsDialogOpen(false)
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={createTodo} disabled={loading} className="bg-green-500 hover:bg-green-600">
                      {loading ? 'Creating...' : 'Create Todo'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Second Row: Todo List */}
        <div className="space-y-4">
          {filteredAndSortedTodos.length === 0 ? (
            <Card className="backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30">
              <CardContent className="py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterStatus !== 'all' ? 'No todos match your filters' : 'No todos yet. Create your first one!'}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedTodos.map((todo) => (
              <Card key={todo.id} className="backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTodo(todo.id)}
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
                            onClick={() => deleteTodo(todo.id)}
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
            ))
          )}
        </div>
      </main>
    </div>
  )
}
