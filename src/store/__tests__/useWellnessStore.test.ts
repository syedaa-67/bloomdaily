import { format, subDays } from 'date-fns';
import { useWellnessStore } from '../useWellnessStore';

const dayKey = (daysAgo: number) => format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');

beforeEach(() => {
  useWellnessStore.setState({ habits: [] });
});

describe('useWellnessStore.addHabit', () => {
  it('creates a habit with an empty history and an updatedAt stamp', () => {
    useWellnessStore.getState().addHabit('Drink water', '💧', 'Health', 5);
    const [habit] = useWellnessStore.getState().habits;

    expect(habit.name).toBe('Drink water');
    expect(habit.completedDates).toEqual([]);
    expect(habit.targetDaysPerWeek).toBe(5);
    expect(typeof habit.updatedAt).toBe('string');
  });

  it('trims the habit name', () => {
    useWellnessStore.getState().addHabit('  Stretch  ', '🧘', 'Health', 3);
    expect(useWellnessStore.getState().habits[0].name).toBe('Stretch');
  });
});

describe('useWellnessStore.toggleHabitToday', () => {
  it('adds today to completedDates and bumps updatedAt on first toggle', async () => {
    useWellnessStore.getState().addHabit('Read', '📚', 'Study', 4);
    const { id, updatedAt: before } = useWellnessStore.getState().habits[0];

    await new Promise((r) => setTimeout(r, 2));
    useWellnessStore.getState().toggleHabitToday(id);

    const habit = useWellnessStore.getState().habits.find((h) => h.id === id)!;
    expect(habit.completedDates).toContain(dayKey(0));
    expect(habit.updatedAt).not.toBe(before);
  });

  it('removes today again on a second toggle (undo)', () => {
    useWellnessStore.getState().addHabit('Read', '📚', 'Study', 4);
    const { id } = useWellnessStore.getState().habits[0];

    useWellnessStore.getState().toggleHabitToday(id);
    useWellnessStore.getState().toggleHabitToday(id);

    expect(useWellnessStore.getState().habits.find((h) => h.id === id)!.completedDates).not.toContain(
      dayKey(0)
    );
  });
});

describe('useWellnessStore.getHabitStreak', () => {
  it('returns 0 for a habit with no completed dates', () => {
    useWellnessStore.getState().addHabit('Meditate', '🧘', 'Health', 7);
    const { id } = useWellnessStore.getState().habits[0];
    expect(useWellnessStore.getState().getHabitStreak(id)).toBe(0);
  });

  it('counts a consecutive run ending yesterday even if today is not done yet', () => {
    useWellnessStore.getState().addHabit('Meditate', '🧘', 'Health', 7);
    const { id } = useWellnessStore.getState().habits[0];
    useWellnessStore.setState({
      habits: [
        {
          ...useWellnessStore.getState().habits[0],
          completedDates: [dayKey(1), dayKey(2), dayKey(3)],
        },
      ],
    });
    expect(useWellnessStore.getState().getHabitStreak(id)).toBe(3);
  });

  it('breaks the streak on a gap', () => {
    useWellnessStore.getState().addHabit('Meditate', '🧘', 'Health', 7);
    const { id } = useWellnessStore.getState().habits[0];
    useWellnessStore.setState({
      habits: [
        {
          ...useWellnessStore.getState().habits[0],
          completedDates: [dayKey(1), dayKey(5)],
        },
      ],
    });
    expect(useWellnessStore.getState().getHabitStreak(id)).toBe(1);
  });
});

describe('useWellnessStore.removeHabit', () => {
  it('removes the habit from state', () => {
    useWellnessStore.getState().addHabit('Meditate', '🧘', 'Health', 7);
    const { id } = useWellnessStore.getState().habits[0];
    useWellnessStore.getState().removeHabit(id);
    expect(useWellnessStore.getState().habits).toHaveLength(0);
  });
});
