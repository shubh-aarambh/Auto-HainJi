import { NextRequest, NextResponse } from 'next/server';
import { agentController } from '@/lib/agent/AgentController';

export async function POST(req: NextRequest) {
  try {
    const { goal, url } = await req.json();
    if (!goal || !url) {
      return NextResponse.json({ error: 'Goal and URL are required.' }, { status: 400 });
    }

    agentController.resetStateMachine();
    const sessionId = await agentController.start(goal, url);
    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to start agent.' }, { status: 500 });
  }
}
