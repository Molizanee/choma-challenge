import { NextRequest, NextResponse } from 'next/server'
import { verifySignature, checkRateLimit, verifyIPWhitelist } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature-256') || request.headers.get('x-hub-signature-256')

    const authResult = verifySignature(request, body, signature)
    if (!authResult.isValid) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: authResult.error 
      }, { status: 401 })
    }

    const ipResult = verifyIPWhitelist(request)
    if (!ipResult.isValid) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: ipResult.error 
      }, { status: 403 })
    }

    const clientId = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateLimitResult = checkRateLimit(clientId, 100, 60000)
    if (!rateLimitResult.isAllowed) {
      return NextResponse.json({ 
        error: 'Too Many Requests',
        message: rateLimitResult.error 
      }, { status: 429 })
    }

    const jsonBody = JSON.parse(body)
    
    if (!jsonBody.message || !jsonBody.senderPhoneNumber) {
      return NextResponse.json({ 
        error: 'Missing required fields: message, senderPhoneNumber' 
      }, { status: 400 })
    }

    const { message, senderPhoneNumber, date, type } = jsonBody

    const isAuthMessage = message.trim().toLowerCase().startsWith('#auth') || type === 'auth'
    
    if (isAuthMessage) {
      let authMessage = message.trim()
      
      if (type === 'auth' && !message.trim().toLowerCase().startsWith('#auth')) {
        authMessage = `#auth ${message.trim()}`
      }
      
      const authResponse = await fetch(`${request.nextUrl.origin}/api/whatsapp-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date || new Date().toISOString(),
          message: authMessage,
          senderPhoneNumber
        })
      })

      const authResult = await authResponse.json()
      
      return NextResponse.json({
        type: 'auth',
        success: authResponse.ok,
        ...authResult
      })
    }

    const lookupResponse = await fetch(`${request.nextUrl.origin}/api/phone-lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: senderPhoneNumber
      })
    })

    const lookupResult = await lookupResponse.json()

    if (!lookupResult.is_linked) {
      return NextResponse.json({
        type: 'unlinked',
        success: false,
        message: 'Phone number not linked to any account. Send #auth <code> to link your phone.',
        phone_number: senderPhoneNumber
      })
    }

    return NextResponse.json({
      type: 'message',
      success: true,
      message: 'Message received from linked phone',
      user_id: lookupResult.user_id,
      phone_number: senderPhoneNumber,
      content: message
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}
