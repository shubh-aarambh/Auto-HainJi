import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session/SessionManager';

export async function GET() {
  try {
    const history = await SessionManager.getHistory();
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve history.' }, { status: 500 });
  }
}
