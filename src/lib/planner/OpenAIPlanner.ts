import { Planner, ActionProposal } from './Planner';
import { AgentMemory } from '../agent/AgentMemory';
import { InteractiveElement } from '../vision/domDetector';
import { logger } from '../logger/WinstonLogger';

export class OpenAIPlanner implements Planner {
  async recover(
    goal: string,
    memory: AgentMemory,
    domElements: InteractiveElement[],
    screenshotPath?: string
  ): Promise<ActionProposal[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn('OPENAI_API_KEY is not set in environment variables. OpenAIPlanner will return empty list.');
      return [];
    }

    logger.info('Querying OpenAI Planner (gpt-4o) for recovery actions...');

    const elementsSummary = domElements.map(el => ({
      tagName: el.tagName,
      id: el.id,
      name: el.name,
      placeholder: el.placeholder,
      ariaLabel: el.ariaLabel,
      labelText: el.labelText,
      xpath: el.xpath,
      cssSelector: el.cssSelector
    }));

    const systemPrompt = `You are the AI Planner layer of AutoPilot AI browser automation agent.
Your objective is to help the agent recover when the deterministic action queue fails or elements cannot be found.

Given:
- The overall user goal
- The current URL
- The history of executed steps (both completed and failed)
- The list of visible interactive elements in the DOM

Provide a JSON object containing an "actions" field, which is an array of steps.
Each step must specify:
1. "action": one of ["navigate_to_url", "click_on_screen", "send_keys", "scroll", "double_click"]
2. "args": arguments for that action:
   - navigate_to_url: { "url": "string" }
   - click_on_screen: { "selector": "string" } OR { "x": number, "y": number }
   - send_keys: { "text": "string", "selector": "string" } OR { "text": "string" }
   - scroll: { "direction": "up" | "down", "amount": number }
   - double_click: { "selector": "string" }
3. "reason": why this action is chosen.

Response Format:
{
  "actions": [
    {
      "action": "send_keys",
      "args": { "selector": "input[name='name']", "text": "John" },
      "reason": "Type the name into the input field"
    }
  ]
}`;

    const userMessage = `Goal: "${goal}"
Current URL: "${memory.currentUrl}"
Completed Steps: ${JSON.stringify(memory.completedSteps)}
Failed Steps: ${JSON.stringify(memory.failedSteps)}
Visible DOM Elements: ${JSON.stringify(elementsSummary.slice(0, 40))}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status ${response.status}`);
      }

      const responseData = await response.json();
      const text = responseData.choices[0]?.message?.content || '';
      logger.info(`OpenAI response: ${text}`);

      const data = JSON.parse(text);
      return data.actions || [];
    } catch (error) {
      logger.error('Failed to query OpenAI Planner', error);
      return [];
    }
  }
}
