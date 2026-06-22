import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class DoubleClickTool implements Tool {
  name = 'double_click';
  description = 'Double-clicks at specific coordinates (x, y) or a selector on the page. Arguments: { x?: number, y?: number, selector?: string }';

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
        logger.info(`Running tool: double_click using selector "${selector}"`);
        const targetSelector = selector.startsWith('/') || selector.startsWith('//') ? `xpath=${selector}` : selector;
        await context.page.dblclick(targetSelector, { timeout: 10000 });
        return {
          success: true,
          message: `Successfully double-clicked selector: "${selector}"`
        };
      } else if (x !== undefined && y !== undefined) {
        logger.info(`Running tool: double_click at coordinates (${x}, ${y})`);
        await context.page.mouse.dblclick(x, y);
        return {
          success: true,
          message: `Successfully double-clicked at coordinates: (${x}, ${y})`
        };
      } else {
        return {
          success: false,
          message: 'Error: Must provide either coordinates (x, y) or a selector.'
        };
      }
    } catch (error: any) {
      logger.error('double_click tool failed', error);
      return {
        success: false,
        message: `Failed to double-click: ${error.message || error}`
      };
    }
  }
}
