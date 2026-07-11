import { Category, Priority } from '@/types';

export interface ParsedTaskInput {
  title: string;
  dueDate: Date | null;
  priority: Priority | null;
  category: Category | null;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Study: ['study', 'homework', 'assignment', 'exam', 'class', 'lecture', 'reading', 'essay', 'thesis'],
  'Self-care': ['self-care', 'self care', 'relax', 'skincare', 'meditate', 'rest', 'journal'],
  Errands: ['errand', 'grocery', 'groceries', 'pick up', 'buy', 'shop', 'return', 'mail'],
  Health: ['gym', 'workout', 'doctor', 'appointment', 'dentist', 'run', 'yoga', 'therapy'],
  Work: ['meeting', 'email', 'report', 'deadline', 'project', 'client', 'presentation'],
  Social: ['call', 'brunch', 'coffee', 'dinner', 'party', 'hang out', 'catch up'],
  Other: [],
};

/**
 * A small, dependency-free natural-language parser tuned for everyday task
 * phrasing like "Finish math assignment tomorrow 3pm" or "Call mom Friday
 * morning !high". It intentionally stays simple and predictable rather than
 * calling an external LLM — so it works fully offline and instantly.
 */
export function parseNaturalLanguageTask(input: string, now: Date = new Date()): ParsedTaskInput {
  let working = input.trim();
  let priority: Priority | null = null;
  let category: Category | null = null;
  let dueDate: Date | null = null;

  // Priority shorthand: !high / !med / !low
  const priorityMatch = working.match(/!\s*(high|med(ium)?|low)\b/i);
  if (priorityMatch) {
    const raw = priorityMatch[1].toLowerCase();
    priority = raw.startsWith('h') ? 'High' : raw.startsWith('l') ? 'Low' : 'Medium';
    working = working.replace(priorityMatch[0], '').trim();
  }

  // Time of day, e.g. "3pm", "3:30pm", "15:00"
  let hour: number | null = null;
  let minute = 0;
  const timeMatch = working.match(/\b(\d{1,2})(:(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const meridiem = timeMatch[4]?.toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    if (meridiem) working = working.replace(timeMatch[0], '').trim();
  }

  // Relative day words
  const base = new Date(now);
  base.setSeconds(0, 0);

  if (/\btoday\b/i.test(working)) {
    dueDate = new Date(base);
    working = working.replace(/\btoday\b/i, '').trim();
  } else if (/\btomorrow\b/i.test(working)) {
    dueDate = new Date(base);
    dueDate.setDate(dueDate.getDate() + 1);
    working = working.replace(/\btomorrow\b/i, '').trim();
  } else {
    for (let i = 0; i < WEEKDAYS.length; i++) {
      const re = new RegExp(`\\b(next\\s+)?${WEEKDAYS[i]}\\b`, 'i');
      const match = working.match(re);
      if (match) {
        dueDate = nextWeekday(base, i, !!match[1]);
        working = working.replace(match[0], '').trim();
        break;
      }
    }
  }

  if (dueDate) {
    if (hour !== null) {
      dueDate.setHours(hour, minute, 0, 0);
    } else if (/\bmorning\b/i.test(working)) {
      dueDate.setHours(9, 0, 0, 0);
      working = working.replace(/\bmorning\b/i, '').trim();
    } else if (/\bafternoon\b/i.test(working)) {
      dueDate.setHours(14, 0, 0, 0);
      working = working.replace(/\bafternoon\b/i, '').trim();
    } else if (/\bevening\b/i.test(working) || /\btonight\b/i.test(working)) {
      dueDate.setHours(19, 0, 0, 0);
      working = working.replace(/\b(evening|tonight)\b/i, '').trim();
    } else if (/\bnoon\b/i.test(working)) {
      dueDate.setHours(12, 0, 0, 0);
      working = working.replace(/\bnoon\b/i, '').trim();
    } else {
      dueDate.setHours(9, 0, 0, 0); // sensible default
    }
  } else if (hour !== null) {
    // Only a time was given ("3pm") — assume today, or tomorrow if already past.
    const candidate = new Date(base);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate.getTime() < now.getTime()) candidate.setDate(candidate.getDate() + 1);
    dueDate = candidate;
  }

  // Category inference by keyword
  const lowerTitle = working.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    if (keywords.some((k) => lowerTitle.includes(k))) {
      category = cat;
      break;
    }
  }

  const title = working.replace(/\s{2,}/g, ' ').replace(/[,.]\s*$/, '').trim();

  return {
    title: title.length > 0 ? capitalize(title) : input.trim(),
    dueDate,
    priority,
    category,
  };
}

function nextWeekday(from: Date, targetDay: number, forceNextWeek: boolean): Date {
  const result = new Date(from);
  const currentDay = result.getDay();
  let diff = (targetDay - currentDay + 7) % 7;
  if (diff === 0 && forceNextWeek) diff = 7;
  if (diff === 0) diff = 0; // today, if same weekday and not "next"
  result.setDate(result.getDate() + diff);
  return result;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
