'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, RefreshCw, CheckCircle, Clock, Copy, Unlink, QrCode } from 'lucide-react'
import type { AuthCode } from '@/types'

interface WhatsAppAuthProps {
  authCode: AuthCode | null
  authCodeLoading: boolean
  unlinkLoading: boolean
  onLoadAuthCode: () => void
  onGenerateNewAuthCode: () => void
  onCopyAuthCode: () => void
  onSendWhatsAppMessage: () => void
  onUnlinkPhoneNumber: () => void
}

export default function WhatsAppAuth({
  authCode,
  authCodeLoading,
  unlinkLoading,
  onLoadAuthCode,
  onGenerateNewAuthCode,
  onCopyAuthCode,
  onSendWhatsAppMessage,
  onUnlinkPhoneNumber
}: WhatsAppAuthProps) {
  return (
    <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700/40 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          WhatsApp Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authCodeLoading ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : authCode ? (
          <div className="space-y-4">
            {authCode.is_linked ? (
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-lg font-medium">WhatsApp Connected</span>
                  </div>                      
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Connected Phone:</p>
                    <p className="font-mono text-lg font-semibold text-green-700 dark:text-green-300">
                      {authCode.phone_number}
                    </p>                      
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onUnlinkPhoneNumber}
                    disabled={unlinkLoading}
                    className="h-8 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                  >
                    {unlinkLoading ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Unlinking...
                      </>
                    ) : (
                      <>
                        <Unlink className="h-3 w-3 mr-1" />
                        Unlink Phone
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">Your Auth Code</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onCopyAuthCode}
                      className="h-8 px-2"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>                        
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onGenerateNewAuthCode}
                      className="h-8 px-2"
                      title="Generate new code"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Waiting for WhatsApp Link, 
                      Code expires in 24 hours
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    
                  <p className='text-sm'>Send this message to +55 11 94833-2094: #auth {authCode.auth_code}</p>                        
                  </div>
                  <div className="border border-zinc-400 p-4 rounded-lg w-min mx-auto text-nowrap text-lg font-mono font-bold tracking-wider text-green-600 dark:text-gree-400 bg-green-50 dark:bg-green-900/30">
                    #auth {authCode.auth_code}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onSendWhatsAppMessage}
                    className="h-8 p-4"
                    title="Link Whatsapp"
                  >
                    Link WhatsApp!
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Button onClick={onLoadAuthCode} className="bg-blue-500 hover:bg-blue-600">
              <QrCode className="h-4 w-4 mr-2" />
              Generate Auth Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
