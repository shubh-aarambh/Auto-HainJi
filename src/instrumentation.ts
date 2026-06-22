export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initWebSocketServer } = await import('./server/websocket');
    initWebSocketServer();
  }
}
