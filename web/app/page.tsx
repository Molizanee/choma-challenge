'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import MountainsBackground from "@/assets/mountains-background.jpg"
import Image from 'next/image'

// Components
import Header from '@/components/Header'
import ErrorDisplay from '@/components/ErrorDisplay'
import WhatsAppAuth from '@/components/WhatsAppAuth'
import TodoManager from '@/components/TodoManager'
import TodoList from '@/components/TodoList'

// Hooks
import { useTodos } from '@/hooks/useTodos'
import { useWhatsAppAuth } from '@/hooks/useWhatsAppAuth'

// Types
import type { User } from '@/types'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Custom hooks for state management
  const { todos, loading, error: todoError, createTodo, toggleTodo, deleteTodo } = useTodos(user)
  const {
    authCode,
    authCodeLoading,
    unlinkLoading,
    loadAuthCode,
    generateNewAuthCode,
    copyAuthCode,
    sendWhatsAppMessage,
    unlinkPhoneNumber
  } = useWhatsAppAuth(user)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  // Combine errors from different sources
  useEffect(() => {
    setError(todoError)
  }, [todoError])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth'
      return
    }
    setUser(user as User)
  }

  const handleCreateTodo = async (newTodo: { title: string; description: string; priority: number; due_date: string }) => {
    await createTodo(newTodo)
    setIsDialogOpen(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (!user) return null

  return (
    <>
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={MountainsBackground} 
          alt="Mountains" 
          fill
          className="object-cover opacity-50"
          priority
        />
      </div>
      
      {/* Content with backdrop blur */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-blue-50/30 via-white/20 to-purple-50/30 dark:from-gray-900/40 dark:via-gray-800/30 dark:to-gray-900/40 backdrop-blur-sm">
        <Header user={user} onSignOut={signOut} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {error && <ErrorDisplay error={error} />}

          <WhatsAppAuth
            authCode={authCode}
            authCodeLoading={authCodeLoading}
            unlinkLoading={unlinkLoading}
            onLoadAuthCode={loadAuthCode}
            onGenerateNewAuthCode={generateNewAuthCode}
            onCopyAuthCode={copyAuthCode}
            onSendWhatsAppMessage={sendWhatsAppMessage}
            onUnlinkPhoneNumber={unlinkPhoneNumber}
          />

          <TodoManager
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isDialogOpen={isDialogOpen}
            onDialogOpenChange={setIsDialogOpen}
            onCreateTodo={handleCreateTodo}
            loading={loading}
          />

          <TodoList
            todos={todos}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            sortBy={sortBy}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
          />
        </main>
      </div>
    </div>
    </>
  )
}
