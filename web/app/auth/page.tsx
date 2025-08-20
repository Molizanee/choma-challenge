'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MountainsBackground from "@/assets/mountains-background.jpg"
import Image from 'next/image'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)

  const signInWithGitHub = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-blue-50/30 via-white/20 to-purple-50/30 dark:from-gray-900/40 dark:via-gray-800/30 dark:to-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-gray-700/30 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Sign in to Choma Tasks
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Continue with your GitHub account to access your tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 dark:from-white dark:to-gray-200 dark:hover:from-gray-100 dark:hover:to-gray-300 dark:text-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              onClick={signInWithGitHub}
              disabled={isLoading}
            >
              <Github className="mr-3 h-5 w-5" />
              {isLoading ? 'Signing in...' : 'Continue with GitHub'}
            </Button>
            
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}