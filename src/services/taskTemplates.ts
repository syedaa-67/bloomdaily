import { TaskTemplate } from '@/types';

/**
 * Task templates let users spin up a pre-built set of tasks in one tap
 * (e.g. "Exam Prep"). Applying a template just calls addTask() once per
 * item in TaskListScreen — see applyTemplate below.
 */
export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'exam-prep',
    name: 'Exam Prep',
    description: 'A study sprint broken into manageable chunks.',
    tasks: [
      { title: 'Review lecture notes', category: 'Study', priority: 'High', estimatedMinutes: 45 },
      { title: 'Make a summary sheet', category: 'Study', priority: 'High', estimatedMinutes: 30 },
      { title: 'Practice past questions', category: 'Study', priority: 'Medium', estimatedMinutes: 60 },
      { title: 'Quick review + sleep well', category: 'Self-care', priority: 'Medium', estimatedMinutes: 15 },
    ],
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'A gentle, grounding start to the day.',
    tasks: [
      { title: 'Drink a glass of water', category: 'Health', priority: 'Low', estimatedMinutes: 2 },
      { title: '5-minute stretch or walk', category: 'Health', priority: 'Low', estimatedMinutes: 5 },
      { title: 'Plan top 3 priorities', category: 'Work', priority: 'Medium', estimatedMinutes: 10 },
      { title: 'Skincare / get ready', category: 'Self-care', priority: 'Low', estimatedMinutes: 15 },
    ],
  },
  {
    id: 'self-care-sunday',
    name: 'Self-Care Sunday',
    description: 'A reset day before the week begins.',
    tasks: [
      { title: 'Tidy your space', category: 'Errands', priority: 'Medium', estimatedMinutes: 30 },
      { title: 'Meal prep for the week', category: 'Health', priority: 'Medium', estimatedMinutes: 45 },
      { title: 'Journal / reflect', category: 'Self-care', priority: 'Low', estimatedMinutes: 15 },
      { title: 'Something just for fun', category: 'Self-care', priority: 'Low', estimatedMinutes: 30 },
    ],
  },
];
