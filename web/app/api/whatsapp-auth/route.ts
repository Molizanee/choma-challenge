import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyApiKey } from '@/lib/auth-middleware'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WhatsAppAuthMessage {
  date: string
  message: string
  senderPhoneNumber: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authResult = verifyApiKey(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const body: WhatsAppAuthMessage = await request.json()
    
    if (!body.message || !body.senderPhoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const authMatch = body.message.match(/#auth\s+(\d{8})/)
    if (!authMatch) {
      return NextResponse.json({ 
        error: 'Invalid message format. Use: #auth 12345678',
        success: false 
      }, { status: 400 })
    }

    const authCode = parseInt(authMatch[1])
    
    const { data: phoneLink, error: fetchError } = await supabaseAdmin
      .from('phone_link')
      .select('*')
      .eq('auth_code', authCode)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single()

    if (fetchError || !phoneLink) {
      return NextResponse.json({ 
        error: 'Invalid or expired auth code',
        success: false 
      }, { status: 404 })
    }

    const createdAt = new Date(phoneLink.created_at)
    const now = new Date()
    const dayInMs = 24 * 60 * 60 * 1000
    
    if (now.getTime() - createdAt.getTime() > dayInMs) {
      await supabaseAdmin
        .from('phone_link')
        .update({ 
          is_active: false,
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', phoneLink.id)

      return NextResponse.json({ 
        error: 'Auth code expired. Please generate a new one.',
        success: false 
      }, { status: 410 })
    }

    const { data: updatedLink, error: updateError } = await supabaseAdmin
      .from('phone_link')
      .update({ 
        phone_number_linked: body.senderPhoneNumber
      })
      .eq('id', phoneLink.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to link phone number' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Phone number successfully linked to your account!',
      user_id: phoneLink.user_id,
      phone_number: body.senderPhoneNumber
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
