import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class CloseBrowserTool implements Tool {
  name = 'close_browser';
  description = 'Closes the current Playwright browser session. Arguments: {}';

  async execute(args: any, context: ToolContext): Promise<ToolResult> {
    logger.info('Running tool: close_browser');
    try {
      await context.closeBrowser();
      return {
        success: true,
        message: 'Browser closed successfully.'
      };
    } catch (error: any) {
      logger.error('close_browser tool failed', error);
      return {
        success: false,
        message: `Failed to close browser: ${error.message || error}`
      };
    }
  }
}
