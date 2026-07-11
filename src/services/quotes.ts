export const MORNING_QUOTES: string[] = [
  "Progress, not perfection. Today is another chance to bloom.",
  "You don't have to do it all today — just the next right thing.",
  "Small steps still move you forward. Be proud of showing up.",
  "Your pace is valid. Comparison steals the joy of your own growth.",
  "Rest is productive too. Listen to what you need today.",
  "You are allowed to be both a work in progress and worthy of love.",
  "One task at a time. One breath at a time. You've got this.",
  "Today doesn't need to be perfect to be good.",
  "Structure gives you freedom — plan gently, act kindly.",
  "You've handled hard days before. This one's no different.",
  "Celebrate the effort, not just the outcome.",
  "Growth is quiet most days. Trust the process.",
];

export const REVIEW_PROMPTS: string[] = [
  'What is one thing you did today that your past self would be proud of?',
  'What drained your energy today — and what gave you energy back?',
  'What is one thing you can let go of before tomorrow?',
  'Who or what supported you today?',
  'What would make tomorrow morning feel 10% easier?',
  'What are you grateful for right now, big or small?',
];

export function getQuoteForDate(date: Date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return MORNING_QUOTES[dayIndex % MORNING_QUOTES.length];
}

export function getPromptForDate(date: Date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return REVIEW_PROMPTS[dayIndex % REVIEW_PROMPTS.length];
}
