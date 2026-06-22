import { Page } from 'playwright';

export interface ToolResult {
  success: boolean;
  message: string;
  screenshotPath?: string;
  data?: any;
}

export interface ToolContext {
  page: Page | null;
  launchBrowser: (headless: boolean) => Promise<Page>;
  closeBrowser: () => Promise<void>;
  sessionId: string;
}

export interface Tool {
  name: string;
  description: string;
  execute(args: any, context: ToolContext): Promise<ToolResult>;
}
