import { Page } from 'playwright';
import { logger } from '../logger/WinstonLogger';

export interface InteractiveElement {
  tagName: string;
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  labelText?: string;
  value?: string;
  xpath: string;
  cssSelector: string;
  rect: { x: number; y: number; width: number; height: number };
}

export class DomDetector {
  static async scanPage(page: Page): Promise<InteractiveElement[]> {
    try {
      logger.info('Scanning page DOM for interactive elements...');
      
      const elements = await page.evaluate(() => {
        const getXPath = (element: Element): string => {
          if (element.id) {
            return `//*[@id="${element.id}"]`;
          }
          const paths: string[] = [];
          for (let el: Node | null = element; el && el.nodeType === Node.ELEMENT_NODE; el = el.parentNode) {
            let index = 0;
            for (let sibling = el.previousSibling; sibling; sibling = sibling.previousSibling) {
              if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) continue;
              if (sibling.nodeName === el.nodeName) {
                index++;
              }
            }
            const tagName = el.nodeName.toLowerCase();
            const pathIndex = index > 0 ? `[${index + 1}]` : '';
            paths.unshift(`${tagName}${pathIndex}`);
          }
          return paths.length ? `/${paths.join('/')}` : '';
        };

        const getCSSSelector = (el: Element): string => {
          if (el.id) return `#${el.id}`;
          let path = el.tagName.toLowerCase();
          const nameAttr = el.getAttribute('name');
          if (nameAttr) {
            path += `[name="${nameAttr}"]`;
            return path;
          }
          const testId = el.getAttribute('data-testid');
          if (testId) {
            path += `[data-testid="${testId}"]`;
            return path;
          }
          return path;
        };

        const getAssociatedLabel = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string => {
          let parent = el.parentElement;
          while (parent) {
            if (parent.tagName.toLowerCase() === 'label') {
              return parent.textContent?.trim() || '';
            }
            parent = parent.parentElement;
          }
          if (el.id) {
            const labels = document.querySelectorAll(`label[for="${el.id}"]`);
            if (labels.length > 0) {
              return labels[0].textContent?.trim() || '';
            }
          }
          const labelledBy = el.getAttribute('aria-labelledby');
          if (labelledBy) {
            const labelEl = document.getElementById(labelledBy);
            if (labelEl) {
              return labelEl.textContent?.trim() || '';
            }
          }
          const prevSibling = el.previousElementSibling;
          if (prevSibling && prevSibling.tagName.toLowerCase() === 'label') {
            return prevSibling.textContent?.trim() || '';
          }
          return '';
        };

        const list: any[] = [];
        const selector = 'input, textarea, select, button, a, [role="button"], [role="link"], [role="checkbox"]';
        const interactive = document.querySelectorAll(selector);

        interactive.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const tagName = el.tagName.toLowerCase();
          const type = el.getAttribute('type') || undefined;
          const id = el.id || undefined;
          const name = el.getAttribute('name') || undefined;
          const placeholder = el.getAttribute('placeholder') || undefined;
          const ariaLabel = el.getAttribute('aria-label') || undefined;
          const value = (el as any).value || undefined;

          let labelText = '';
          if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
            labelText = getAssociatedLabel(el as any);
          } else {
            labelText = el.textContent?.trim() || '';
          }

          list.push({
            tagName,
            type,
            id,
            name,
            placeholder,
            ariaLabel,
            labelText,
            value,
            xpath: getXPath(el),
            cssSelector: getCSSSelector(el),
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            }
          });
        });

        return list;
      });

      logger.info(`Detected ${elements.length} interactive elements on page.`);
      return elements;
    } catch (error) {
      logger.error('Failed to scan page DOM', error);
      return [];
    }
  }
}
