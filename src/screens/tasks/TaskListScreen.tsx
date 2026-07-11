import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { useTaskStore } from '@/store/useTaskStore';
import { Task } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { TASK_TEMPLATES } from '@/services/taskTemplates';

type Filter = 'today' | 'all' | 'done';

export function TaskListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tasks = useTaskStore((s) => s.tasks);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const addTask = useTaskStore((s) => s.addTask);
  const [filter, setFilter] = useState<Filter>('today');
  const [templatesVisible, setTemplatesVisible] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  const applyTemplate = async (templateId: string) => {
    const template = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setApplyingTemplate(templateId);
    for (const t of template.tasks) {
      await addTask({
        title: t.title,
        category: t.category,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        dueDate: new Date().toISOString(),
        templateOrigin: template.name,
      });
    }
    setApplyingTemplate(null);
    setTemplatesVisible(false);
  };

  const filtered = useMemo(() => {
    let list: Task[];
    if (filter === 'today') {
      const todayKey = new Date().toDateString();
      list = tasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === todayKey && !t.isDone);
    } else if (filter === 'done') {
      list = tasks.filter((t) => t.isDone);
    } else {
      list = tasks.filter((t) => !t.isDone);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }, [tasks, filter]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <ScaleDecorator>
      <Pressable onLongPress={drag} disabled={isActive} delayLongPress={150}>
        <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Your tasks</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setTemplatesVisible(true)}
            style={[styles.templatesButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.textPrimary, fontSize: typography.size.xs, fontFamily: typography.fontFamily.bodyMedium }}>
              Templates
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('AddEditTask', undefined)}
            style={[styles.addButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['today', 'all', 'done'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              { backgroundColor: filter === f ? theme.primary : theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={{ color: filter === f ? '#FFF' : theme.textPrimary, fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.sm }}>
              {f === 'today' ? 'Today' : f === 'all' ? 'All active' : 'Completed'}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🗒️"
          title="All clear here"
          message="No tasks in this view. Add one, or check another filter."
          actionLabel="Add a task"
          onAction={() => navigation.navigate('AddEditTask', undefined)}
        />
      ) : (
        <DraggableFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => reorderTasks(data.map((t) => t.id))}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Modal visible={templatesVisible} transparent animationType="fade" onRequestClose={() => setTemplatesVisible(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={() => setTemplatesVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Start from a template</Text>
            <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
              Adds a ready-made set of tasks for today — edit anything after.
            </Text>
            {TASK_TEMPLATES.map((template) => (
              <Pressable
                key={template.id}
                onPress={() => applyTemplate(template.id)}
                style={[styles.templateOption, shadow.soft, { backgroundColor: theme.card }]}
              >
                <Text style={{ color: theme.textPrimary, fontFamily: typography.fontFamily.bodyBold }}>
                  {template.name}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: typography.size.xs, marginTop: 2 }}>
                  {template.description}
                </Text>
                {applyingTemplate === template.id ? (
                  <Text style={{ color: theme.primaryDark, fontSize: typography.size.xs, marginTop: 4 }}>Adding…</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  templatesButton: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  title: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xxl },
  addButton: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFF', fontSize: 22, fontFamily: typography.fontFamily.bodyBold, marginTop: -2 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginVertical: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: spacing.lg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.lg, marginBottom: 4 },
  sheetSubtitle: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: spacing.md },
  templateOption: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
});
