'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthCode, User } from '@/types'

export function useWhatsAppAuth(user: User | null) {
  const [authCode, setAuthCode] = useState<AuthCode | null>(null)
  const [authCodeLoading, setAuthCodeLoading] = useState(false)
  const [unlinkLoading, setUnlinkLoading] = useState(false)

  const loadAuthCode = async () => {
    if (!user) return
    
    setAuthCodeLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/auth-code', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAuthCode(data)
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setAuthCodeLoading(false)
    }
  }

  const generateNewAuthCode = async () => {
    if (!user) return
    
    setAuthCodeLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/auth-code', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAuthCode(data)
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setAuthCodeLoading(false)
    }
  }

  const copyAuthCode = async () => {
    if (authCode?.auth_code) {
      try {
        await navigator.clipboard.writeText(`#auth ${authCode.auth_code}`)
      } catch (error) {
        // Handle error silently
      }
    }
  }

  const sendWhatsAppMessage = () => {
    if (authCode?.auth_code) {
      const message = encodeURIComponent(`#auth ${authCode.auth_code}`)
      const whatsappUrl = `https://api.whatsapp.com/send?phone=5511948332094&text=${message}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const unlinkPhoneNumber = async () => {
    if (!user) return
    
    setUnlinkLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/phone-unlink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        await loadAuthCode()
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setUnlinkLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadAuthCode()
    }
  }, [user])

  return {
    authCode,
    authCodeLoading,
    unlinkLoading,
    loadAuthCode,
    generateNewAuthCode,
    copyAuthCode,
    sendWhatsAppMessage,
    unlinkPhoneNumber
  }
}
