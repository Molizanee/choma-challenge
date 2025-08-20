'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Todo, User } from '@/types'

export function useTodos(user: User | null) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        return
      }

      setTodos(todos || [])
    } catch (error) {
      setError('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  const createTodo = async (newTodo: { title: string; description: string; priority: number; due_date: string }) => {
    if (!newTodo.title.trim() || !user) return

    setLoading(true)
    setError(null)

    try {
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
        return
      }

      if (data && data[0]) {
        setTodos([data[0], ...todos])
      }
    } catch (error) {
      setError('Failed to create todo')
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
        return
      }

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_complete: !todo.is_complete } : todo
      ))
    } catch (error) {
      // Handle error silently
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        return
      }

      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      // Handle error silently
    }
  }

  useEffect(() => {
    if (user) {
      loadTodos()
    }
  }, [user])

  return {
    todos,
    loading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
    loadTodos
  }
}
