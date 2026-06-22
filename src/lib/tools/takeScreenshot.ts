import { Tool, ToolContext, ToolResult } from './Tool';
import { logger } from '../logger/WinstonLogger';
import path from 'path';
import fs from 'fs';

export class TakeScreenshotTool implements Tool {
  name = 'take_screenshot';
  description = 'Captures a screenshot of the current browser page. Arguments: { name?: string }';

  async execute(args: { name?: string }, context: ToolContext): Promise<ToolResult> {
    if (!context.page) {
      return {
        success: false,
        message: 'Browser page is not initialized.'
      };
    }
    const screenshotName = args.name || `step_${Date.now()}`;
    logger.info(`Running tool: take_screenshot (${screenshotName})`);
    try {
      const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const fileName = `${screenshotName}.png`;
      const screenshotPath = path.join(screenshotsDir, fileName);
      
      await context.page.screenshot({ path: screenshotPath, type: 'png' });
      
      const webPath = `/screenshots/${fileName}`;
      logger.info(`Screenshot captured: ${screenshotPath} (web accessible: ${webPath})`);
      
      return {
        success: true,
        message: 'Screenshot captured successfully.',
        screenshotPath: webPath
      };
    } catch (error: any) {
      logger.error('take_screenshot tool failed', error);
      return {
        success: false,
        message: `Failed to capture screenshot: ${error.message || error}`
      };
    }
  }
}
