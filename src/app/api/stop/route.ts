import { NextResponse } from 'next/server';
import { agentController } from '@/lib/agent/AgentController';

export async function POST() {
  try {
    await agentController.stop();
    return NextResponse.json({ success: true, message: 'Agent stopped successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to stop agent.' }, { status: 500 });
  }
}
