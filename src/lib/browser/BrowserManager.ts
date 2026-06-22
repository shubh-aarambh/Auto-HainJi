import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from '../logger/WinstonLogger';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launch(headless: boolean = false): Promise<Page> {
    try {
      if (this.page) {
        return this.page;
      }

      logger.info(`Launching Playwright Chromium browser (headless: ${headless})...`);
      this.browser = await chromium.launch({
        headless,
        args: ['--disable-blink-features=AutomationControlled']
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1
      });

      this.page = await this.context.newPage();
      logger.info('Browser launched successfully.');
      return this.page;
    } catch (error) {
      logger.error('Failed to launch browser', error);
      throw error;
    }
  }

  async getPage(): Promise<Page> {
    if (!this.page) {
      throw new Error('Browser is not launched. Call launch() first.');
    }
    return this.page;
  }

  async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      throw new Error('Browser is not launched. Call launch() first.');
    }
    return this.context;
  }

  async close(): Promise<void> {
    try {
      logger.info('Closing browser and cleaning resources...');
      if (this.page) {
        try { await this.page.close(); } catch (_) {}
        this.page = null;
      }
      if (this.context) {
        try { await this.context.close(); } catch (_) {}
        this.context = null;
      }
      if (this.browser) {
        try { await this.browser.close(); } catch (_) {}
        this.browser = null;
      }
      logger.info('Browser closed and resources cleared.');
    } catch (error) {
      logger.error('Error closing browser', error);
    }
  }
}
