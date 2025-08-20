import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, checkRateLimit, verifyIPWhitelist } from '@/lib/auth-middleware'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PhoneStatusRequest {
  senderPhoneNumber: string
}

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyApiKey(request)
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
    const rateLimitResult = checkRateLimit(clientId, 200, 60000)
    if (!rateLimitResult.isAllowed) {
      return NextResponse.json({ 
        error: 'Too Many Requests',
        message: rateLimitResult.error 
      }, { status: 429 })
    }

    const body: PhoneStatusRequest = await request.json()
    
    if (!body.senderPhoneNumber) {
      return NextResponse.json({ 
        error: 'Missing required field: senderPhoneNumber',
        is_linked: false,
        user_id: null
      }, { status: 400 })
    }

    const { senderPhoneNumber } = body

    const normalizedPhoneNumber = String(senderPhoneNumber).trim()

    const { data: phoneLinks, error: fetchError } = await supabaseAdmin
      .from('phone_link')
      .select('user_id, phone_number_linked, created_at, is_active, is_deleted')
      .eq('phone_number_linked', normalizedPhoneNumber)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    const phoneLink = phoneLinks && phoneLinks.length > 0 ? phoneLinks[0] : null

    if (fetchError || !phoneLink) {
      return NextResponse.json({
        is_linked: false,
        user_id: null,
        phone_number: senderPhoneNumber,
        message: 'Phone number not linked to any account',
        status: 'unlinked'
      })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('id', phoneLink.user_id)
      .single()

    return NextResponse.json({
      is_linked: true,
      user_id: phoneLink.user_id,
      phone_number: senderPhoneNumber,
      message: 'Phone number is linked to an account',
      status: 'linked',
      user_info: userError ? null : {
        email: user?.email,
        full_name: user?.full_name,
        account_created: user?.created_at
      },
      phone_link_info: {
        linked_at: phoneLink.created_at
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      is_linked: false,
      user_id: null,
      status: 'error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'phone-status',
    description: 'Check if a phone number is linked to a user account',
    method: 'POST',
    required_fields: ['senderPhoneNumber'],
    authentication: 'X-API-Key header required'
  })
}
