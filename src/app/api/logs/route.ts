import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'agent.log');
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: 'No logs available yet.' });
    }
    const content = fs.readFileSync(logPath, 'utf8');
    return NextResponse.json({ logs: content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to read logs.' }, { status: 500 });
  }
}
