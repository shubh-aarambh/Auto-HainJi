import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class ClickOnScreenTool implements Tool {
  name = 'click_on_screen';
  description = 'Clicks at specific coordinates (x, y) or a selector on the page. Arguments: { x?: number, y?: number, selector?: string }';

  async execute(args: { x?: number; y?: number; selector?: string }, context: ToolContext): Promise<ToolResult> {
    if (!context.page) {
      return {
        success: false,
        message: 'Browser page is not initialized.'
      };
    }
    const { x, y, selector } = args;
    try {
      if (selector) {
        logger.info(`Running tool: click_on_screen using selector "${selector}"`);
        const targetSelector = selector.startsWith('/') || selector.startsWith('//') ? `xpath=${selector}` : selector;
        await context.page.click(targetSelector, { timeout: 10000 });
        return {
          success: true,
          message: `Successfully clicked selector: "${selector}"`
        };
      } else if (x !== undefined && y !== undefined) {
        logger.info(`Running tool: click_on_screen at coordinates (${x}, ${y})`);
        await context.page.mouse.click(x, y);
        return {
          success: true,
          message: `Successfully clicked at coordinates: (${x}, ${y})`
        };
      } else {
        return {
          success: false,
          message: 'Error: Must provide either coordinates (x, y) or a selector.'
        };
      }
    } catch (error: any) {
      logger.error('click_on_screen tool failed', error);
      return {
        success: false,
        message: `Failed to click: ${error.message || error}`
      };
    }
  }
}
