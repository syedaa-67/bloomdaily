import { useTaskStore } from '../useTaskStore';

const baseInput = {
  title: 'Finish reading assignment',
  dueDate: new Date('2026-03-10T09:00:00.000Z').toISOString(),
  priority: 'High' as const,
  category: 'Study' as const,
};

beforeEach(() => {
  useTaskStore.setState({ tasks: [] });
});

describe('useTaskStore.addTask', () => {
  it('creates a task with sane defaults and an updatedAt stamp', async () => {
    const task = await useTaskStore.getState().addTask(baseInput);

    expect(task.title).toBe(baseInput.title);
    expect(task.isDone).toBe(false);
    expect(task.completedAt).toBeNull();
    expect(task.subtasks).toEqual([]);
    expect(task.recurrence).toEqual({ type: 'none' });
    expect(typeof task.updatedAt).toBe('string');
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  it('trims the title and converts subtask strings into subtask objects', async () => {
    const task = await useTaskStore.getState().addTask({
      ...baseInput,
      title: '  Read chapter 4  ',
      subtasks: ['Take notes', 'Answer questions'],
    });

    expect(task.title).toBe('Read chapter 4');
    expect(task.subtasks).toHaveLength(2);
    expect(task.subtasks[0]).toMatchObject({ title: 'Take notes', isDone: false });
  });

  it('assigns increasing order values as tasks are added', async () => {
    const first = await useTaskStore.getState().addTask(baseInput);
    const second = await useTaskStore.getState().addTask(baseInput);
    expect(second.order).toBeGreaterThan(first.order);
  });
});

describe('useTaskStore.toggleTaskDone', () => {
  it('marks a task done, stamps completedAt, and bumps updatedAt', async () => {
    const task = await useTaskStore.getState().addTask(baseInput);
    const beforeUpdatedAt = task.updatedAt;

    await new Promise((r) => setTimeout(r, 2));
    await useTaskStore.getState().toggleTaskDone(task.id);

    const updated = useTaskStore.getState().tasks.find((t) => t.id === task.id)!;
    expect(updated.isDone).toBe(true);
    expect(updated.completedAt).not.toBeNull();
    expect(updated.updatedAt).not.toBe(beforeUpdatedAt);
  });

  it('spawns the next occurrence when a daily recurring task is completed', async () => {
    const task = await useTaskStore.getState().addTask({
      ...baseInput,
      recurrence: { type: 'daily' },
    });

    await useTaskStore.getState().toggleTaskDone(task.id);

    const tasks = useTaskStore.getState().tasks;
    expect(tasks).toHaveLength(2);
    const spawned = tasks.find((t) => t.id !== task.id)!;
    expect(spawned.title).toBe(task.title);
    expect(new Date(spawned.dueDate!).getTime()).toBeGreaterThan(new Date(task.dueDate!).getTime());
  });

  it('does not spawn a follow-up task for non-recurring tasks', async () => {
    const task = await useTaskStore.getState().addTask(baseInput);
    await useTaskStore.getState().toggleTaskDone(task.id);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });
});

describe('useTaskStore.reorderTasks', () => {
  it('applies the new order and stamps updatedAt for reordered tasks', async () => {
    const a = await useTaskStore.getState().addTask(baseInput);
    const b = await useTaskStore.getState().addTask(baseInput);

    useTaskStore.getState().reorderTasks([b.id, a.id]);

    const tasks = useTaskStore.getState().tasks;
    expect(tasks.find((t) => t.id === b.id)!.order).toBe(0);
    expect(tasks.find((t) => t.id === a.id)!.order).toBe(1);
  });
});

describe('useTaskStore.deleteTask', () => {
  it('removes the task from state', async () => {
    const task = await useTaskStore.getState().addTask(baseInput);
    await useTaskStore.getState().deleteTask(task.id);
    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });
});

describe('useTaskStore.getTasksForDate', () => {
  it('only returns tasks due on the given day', async () => {
    await useTaskStore.getState().addTask(baseInput); // due 2026-03-10
    await useTaskStore.getState().addTask({
      ...baseInput,
      dueDate: new Date('2026-03-11T09:00:00.000Z').toISOString(),
    });

    const dayOf = useTaskStore.getState().getTasksForDate(new Date('2026-03-10T00:00:00.000Z'));
    expect(dayOf).toHaveLength(1);
  });
});
