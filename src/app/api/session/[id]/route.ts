import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session/SessionManager';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const session = await SessionManager.getSessionDetails(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve session details.' }, { status: 500 });
  }
}
