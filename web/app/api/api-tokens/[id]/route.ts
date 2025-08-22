import { NextRequest, NextResponse } from 'next/server';

// TODO: Implement API tokens functionality
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    { error: 'API tokens endpoint not implemented yet', id },
    { status: 501 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    { error: 'API tokens endpoint not implemented yet', id },
    { status: 501 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(
    { error: 'API tokens endpoint not implemented yet', id },
    { status: 501 }
  );
}