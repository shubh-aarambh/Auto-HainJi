import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class OpenBrowserTool implements Tool {
  name = 'open_browser';
  description = 'Launches a Playwright browser session. Arguments: { headless?: boolean }';

  async execute(args: { headless?: boolean }, context: ToolContext): Promise<ToolResult> {
    const headless = args.headless !== false;
    logger.info(`Running tool: open_browser (headless: ${headless})`);
    try {
      await context.launchBrowser(headless);
      return {
        success: true,
        message: 'Browser opened successfully.'
      };
    } catch (error: any) {
      logger.error('open_browser tool failed', error);
      return {
        success: false,
        message: `Failed to open browser: ${error.message || error}`
      };
    }
  }
}
