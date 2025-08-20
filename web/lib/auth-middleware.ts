import { NextRequest } from 'next/server'

export interface AuthenticatedRequest extends NextRequest {
  isAuthenticated?: boolean
}

export function verifyApiKey(request: NextRequest): { 
  isValid: boolean; 
  error?: string 
} {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!apiKey) {
    return {
      isValid: false,
      error: 'Missing API key. Include X-API-Key header or Authorization: Bearer <key>'
    }
  }

  const expectedApiKey = process.env.WEBHOOK_API_KEY
  
  if (!expectedApiKey) {
    return {
      isValid: false,
      error: 'Server configuration error'
    }
  }

  if (apiKey !== expectedApiKey) {
    return {
      isValid: false,
      error: 'Invalid API key'
    }
  }

  return { isValid: true }
}

export function verifySignature(
  request: NextRequest, 
  body: string, 
  signature: string | null
): { isValid: boolean; error?: string } {
  if (!signature) {
    return {
      isValid: false,
      error: 'Missing signature header'
    }
  }

  const secret = process.env.WEBHOOK_SECRET
  if (!secret) {
    return {
      isValid: false,
      error: 'Server configuration error'
    }
  }

  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    
    const providedSignature = signature.replace('sha256=', '')
    
    if (expectedSignature !== providedSignature) {
      return {
        isValid: false,
        error: 'Invalid signature'
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'Error verifying signature'
    }
  }
}

export function verifyIPWhitelist(request: NextRequest): { 
  isValid: boolean; 
  error?: string 
} {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || []
  
  if (allowedIPs.length === 0) {
    return { isValid: true }
  }

  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') ||
                   'unknown'

  if (!allowedIPs.includes(clientIP)) {
    return {
      isValid: false,
      error: `IP address ${clientIP} not allowed`
    }
  }

  return { isValid: true }
}

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { isAllowed: boolean; error?: string } {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return { isAllowed: true }
  }

  if (record.count >= maxRequests) {
    return {
      isAllowed: false,
      error: 'Rate limit exceeded'
    }
  }

  record.count++
  return { isAllowed: true }
}
