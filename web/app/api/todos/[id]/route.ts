import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type TodoUpdate = Database['public']['Tables']['todos']['Update'];

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { data: todo, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch todo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();

    const updateData: TodoUpdate = {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.due_date !== undefined && { due_date: body.due_date }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.is_complete !== undefined && { is_complete: body.is_complete }),
      ...(body.user_id !== undefined && { user_id: body.user_id }),
    };

    const { data: todo, error } = await supabaseAdmin
      .from('todos')
      .update(updateData)
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update todo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { data: todo, error } = await supabaseAdmin
      .from('todos')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete todo', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Todo deleted successfully', todo },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
