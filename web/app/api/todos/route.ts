import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types';
import { verifyApiKey } from '@/lib/auth-middleware';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type TodoInsert = Database['public']['Tables']['todos']['Insert'];
type TodoRow = Database['public']['Tables']['todos']['Row'];

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const authResult = verifyApiKey(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = supabaseAdmin
      .from('todos')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: todos, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch todos', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const todoData: TodoInsert = {
      title: body.title,
      description: body.description || null,
      due_date: body.due_date || null,
      priority: body.priority || 1,
      is_complete: body.is_complete || false,
      user_id: body.user_id || null,
      is_deleted: false,
    };

    const { data: todo, error } = await supabaseAdmin
      .from('todos')
      .insert([todoData])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create todo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
