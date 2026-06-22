import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';

export class SendKeysTool implements Tool {
  name = 'send_keys';
  description = 'Types text into the active focused element or specified selector. Arguments: { text: string, selector?: string }';

  async execute(args: { text: string; selector?: string }, context: ToolContext): Promise<ToolResult> {
    if (!context.page) {
      return {
        success: false,
        message: 'Browser page is not initialized.'
      };
    }
    const { text, selector } = args;
    try {
      if (selector) {
        logger.info(`Running tool: send_keys typing "${text}" into selector "${selector}"`);
        const targetSelector = selector.startsWith('/') || selector.startsWith('//') ? `xpath=${selector}` : selector;
        // Focus the element first
        await context.page.focus(targetSelector);
        // Clear it if it's an input
        await context.page.fill(targetSelector, '');
        // Type the text
        await context.page.type(targetSelector, text, { delay: 50 });
      } else {
        logger.info(`Running tool: send_keys typing "${text}" into active element`);
        await context.page.keyboard.type(text, { delay: 50 });
      }
      return {
        success: true,
        message: `Successfully typed text: "${text}"`
      };
    } catch (error: any) {
      logger.error(`send_keys failed for text "${text}"`, error);
      return {
        success: false,
        message: `Failed to type keys: ${error.message || error}`
      };
    }
  }
}
