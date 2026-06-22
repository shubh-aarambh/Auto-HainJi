import { Tool, ToolContext, ToolResult } from './Tool';
import { OpenBrowserTool } from './openBrowser';
import { NavigateToUrlTool } from './navigateToUrl';
import { SendKeysTool } from './sendKeys';
import { ScrollTool } from './scroll';
import { ClickOnScreenTool } from './clickOnScreen';
import { TakeScreenshotTool } from './takeScreenshot';
import { CloseBrowserTool } from './closeBrowser';
import { DoubleClickTool } from './doubleClick';

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  constructor() {
    this.register(new OpenBrowserTool());
    this.register(new NavigateToUrlTool());
    this.register(new SendKeysTool());
    this.register(new ScrollTool());
    this.register(new ClickOnScreenTool());
    this.register(new TakeScreenshotTool());
    this.register(new CloseBrowserTool());
    this.register(new DoubleClickTool());
  }

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  async execute(name: string, args: any, context: ToolContext): Promise<ToolResult> {
    const tool = this.get(name);
    if (!tool) {
      return {
        success: false,
        message: `Tool "${name}" is not registered in the ToolRegistry.`
      };
    }
    try {
      return await tool.execute(args, context);
    } catch (error: any) {
      return {
        success: false,
        message: `Error executing tool "${name}": ${error.message || error}`
      };
    }
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}
