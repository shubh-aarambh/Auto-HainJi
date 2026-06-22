import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class ScrollTool implements Tool {
  name = 'scroll';
  description = 'Scrolls the page up or down. Arguments: { direction: "up" | "down", amount?: number }';

  async execute(args: { direction: 'up' | 'down'; amount?: number }, context: ToolContext): Promise<ToolResult> {
    if (!context.page) {
      return {
        success: false,
        message: 'Browser page is not initialized.'
      };
    }
    const direction = args.direction || 'down';
    const amount = args.amount || 500;
    logger.info(`Running tool: scroll ${direction} by ${amount}px`);
    try {
      const scrollY = direction === 'down' ? amount : -amount;
      await context.page.evaluate((y) => {
        window.scrollBy(0, y);
      }, scrollY);
      // Let any scroll animations settle
      await context.page.waitForTimeout(400);
      return {
        success: true,
        message: `Scrolled page ${direction} by ${amount} pixels.`
      };
    } catch (error: any) {
      logger.error('scroll tool failed', error);
      return {
        success: false,
        message: `Failed to scroll page: ${error.message || error}`
      };
    }
  }
}
