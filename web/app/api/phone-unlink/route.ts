import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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

    const { data: phoneLink, error: fetchError } = await supabaseAdmin
      .from('phone_link')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .not('phone_number_linked', 'is', null)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to check phone link' }, { status: 500 })
    }

    if (!phoneLink) {
      return NextResponse.json({ error: 'No linked phone number found' }, { status: 404 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('phone_link')
      .update({ 
        phone_number_linked: null
      })
      .eq('id', phoneLink.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to unlink phone number' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Phone number successfully unlinked from your account'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
