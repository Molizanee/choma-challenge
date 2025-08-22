import { NextRequest, NextResponse } from 'next/server';

// TODO: Implement API tokens functionality
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'API tokens endpoint not implemented yet' },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'API tokens endpoint not implemented yet' },
    { status: 501 }
  );
}