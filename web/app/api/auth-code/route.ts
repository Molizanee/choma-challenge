import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateAuthCode(): number {
  return Math.floor(10000000 + Math.random() * 90000000)
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: existingLink, error: fetchError } = await supabaseAdmin
      .from('phone_link')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to check existing auth code' }, { status: 500 })
    }

    if (existingLink) {
      return NextResponse.json({ 
        auth_code: existingLink.auth_code,
        is_linked: !!existingLink.phone_number_linked,
        phone_number: existingLink.phone_number_linked,
        created_at: existingLink.created_at
      })
    }

    const authCode = generateAuthCode()

    const { data: newLink, error: insertError } = await supabaseAdmin
      .from('phone_link')
      .insert([
        {
          user_id: user.id,
          auth_code: authCode,
          is_active: true,
          is_deleted: false
        }
      ])
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create auth code' }, { status: 500 })
    }

    return NextResponse.json({ 
      auth_code: newLink.auth_code,
      is_linked: false,
      phone_number: null,
      created_at: newLink.created_at
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('phone_link')
      .update({ 
        is_active: false,
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to deactivate auth codes' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
