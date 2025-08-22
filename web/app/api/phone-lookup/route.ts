import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyApiKey } from '@/lib/auth-middleware'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const { phone_number } = await request.json()
    
    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const { data: phoneLink, error: fetchError } = await supabaseAdmin
      .from('phone_link')
      .select('user_id, auth_code, created_at, is_active')
      .eq('phone_number_linked', phone_number)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to check phone number' }, { status: 500 })
    }

    if (!phoneLink) {
      return NextResponse.json({ 
        is_linked: false,
        user_id: null
      })
    }

    return NextResponse.json({ 
      is_linked: true,
      user_id: phoneLink.user_id,
      auth_code: phoneLink.auth_code,
      linked_at: phoneLink.created_at
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
