import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const expectedToken = process.env.CLEANUP_TOKEN || 'cleanup-secret'
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 24)

    const { data: expiredLinks, error: fetchError } = await supabaseAdmin
      .from('phone_link')
      .select('id, created_at, auth_code')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .lt('created_at', cutoffTime.toISOString())

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch expired codes' }, { status: 500 })
    }

    if (!expiredLinks || expiredLinks.length === 0) {
      return NextResponse.json({ 
        message: 'No expired auth codes found',
        cleaned_count: 0 
      })
    }

    const { error: updateError } = await supabaseAdmin
      .from('phone_link')
      .update({ 
        is_active: false,
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .in('id', expiredLinks.map(link => link.id))

    if (updateError) {
      return NextResponse.json({ error: 'Failed to cleanup expired codes' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: `Successfully cleaned up ${expiredLinks.length} expired auth codes`,
      cleaned_count: expiredLinks.length,
      expired_codes: expiredLinks.map(link => ({ 
        id: link.id, 
        auth_code: link.auth_code, 
        created_at: link.created_at 
      }))
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
