import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class NavigateToUrlTool implements Tool {
  name = 'navigate_to_url';
  description = 'Navigates browser to specified URL. Arguments: { url: string }';

  async execute(args: { url: string }, context: ToolContext): Promise<ToolResult> {
    if (!context.page) {
      return {
        success: false,
        message: 'Browser page is not initialized. Open the browser first.'
      };
    }
    const { url } = args;
    logger.info(`Running tool: navigate_to_url to "${url}"`);
    try {
      await context.page.goto(url, { waitUntil: 'load', timeout: 30000 });
      return {
        success: true,
        message: `Successfully navigated to URL: ${url}`
      };
    } catch (error: any) {
      logger.error(`navigate_to_url to "${url}" failed`, error);
      return {
        success: false,
        message: `Failed to navigate to ${url}: ${error.message || error}`
      };
    }
  }
}
