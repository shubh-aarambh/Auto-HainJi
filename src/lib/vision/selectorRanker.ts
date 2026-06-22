import { InteractiveElement } from './domDetector';
import { logger } from '../logger/WinstonLogger';

export class SelectorRanker {
  /**
   * Finds the best matching element in the scanned DOM elements list for a given text query.
   * Priority: data-testid > id > placeholder > aria-label > labelText > name.
   */
  static findBestMatch(elements: InteractiveElement[], targetLabel: string, action?: string): InteractiveElement | null {
    logger.info(`Searching element matching target label: "${targetLabel}"`);
    const query = targetLabel.toLowerCase().trim();

    // Determine synonyms based on target label
    const synonyms = [query];
    if (query === 'name') {
      synonyms.push('title', 'subject');
    } else if (query === 'description') {
      synonyms.push('desc', 'bio', 'about');
    } else if (query === 'submit') {
      synonyms.push('save', 'send', 'confirm', 'update');
    } else if (query === 'search') {
      synonyms.push('query', 'q', 'find', 'search_query');
    }

    let candidates = elements;
    if (action === 'send_keys') {
      const inputs = elements.filter(el => 
        el.tagName === 'input' || 
        el.tagName === 'textarea' || 
        el.tagName === 'select'
      );
      if (inputs.length > 0) {
        candidates = inputs;
      }
    } else if (action === 'click_on_screen' && (query === 'submit' || query === 'search')) {
      const clickables = elements.filter(el => 
        el.tagName === 'button' || 
        el.tagName === 'a' || 
        el.type === 'submit' || 
        el.type === 'button'
      );
      if (clickables.length > 0) {
        candidates = clickables;
      }
    }

    let bestMatch: InteractiveElement | null = null;
    let highestScore = -1;

    const containsWholeWord = (text: string, q: string): boolean => {
      if (!text) return false;
      const regex = new RegExp(`\\b${q}\\b`, 'i');
      return regex.test(text);
    };

    for (const el of candidates) {
      const id = el.id ? el.id.toLowerCase() : '';
      const name = el.name ? el.name.toLowerCase() : '';
      const placeholder = el.placeholder ? el.placeholder.toLowerCase() : '';
      const ariaLabel = el.ariaLabel ? el.ariaLabel.toLowerCase() : '';
      const labelText = el.labelText ? el.labelText.toLowerCase() : '';

      let score = -1;

      // 1. Exact Match on data-testid
      const isTestIdExact = el.cssSelector.toLowerCase().includes(`data-testid="${query}"`);
      if (isTestIdExact) {
        score = 100;
      }
      
      // 2. Exact matches with synonyms
      if (score < 0) {
        for (const q of synonyms) {
          if (id === q) score = 90;
          else if (placeholder === q) score = 80;
          else if (ariaLabel === q) score = 70;
          else if (labelText === q) score = 60;
          else if (name === q) score = 50;
          if (score > 0) break;
        }
      }

      // 3. Whole word matches with synonyms
      if (score < 0) {
        for (const q of synonyms) {
          if (containsWholeWord(labelText, q)) score = 40;
          else if (containsWholeWord(placeholder, q)) score = 30;
          else if (containsWholeWord(ariaLabel, q)) score = 20;
          else if (containsWholeWord(id, q) || containsWholeWord(name, q)) score = 10;
          if (score > 0) break;
        }
      }

      // 4. Fuzzy contains matches with synonyms (substring fallback)
      if (score < 0) {
        for (const q of synonyms) {
          if (labelText.includes(q)) score = 4;
          else if (placeholder.includes(q)) score = 3;
          else if (ariaLabel.includes(q)) score = 2;
          else if (id.includes(q) || name.includes(q)) score = 1;
          if (score > 0) break;
        }
      }

      if (score > highestScore) {
        bestMatch = el;
        highestScore = score;
      }
    }

    if (bestMatch) {
      logger.info(`Best element match found: Tag=${bestMatch.tagName}, Selector=${bestMatch.id ? '#' + bestMatch.id : bestMatch.xpath}, Score=${highestScore}`);
    } else {
      logger.warn(`No match found for target label: "${targetLabel}"`);
    }

    return bestMatch;
  }
}
