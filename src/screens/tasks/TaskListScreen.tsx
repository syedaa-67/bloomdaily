import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startOfDay } from 'date-fns';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { useTaskStore } from '@/store/useTaskStore';
import { Task } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { TASK_TEMPLATES } from '@/services/taskTemplates';

type Filter = 'today' | 'all' | 'done';
const { width } = Dimensions.get('window');

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
      const todayStart = startOfDay(new Date()).getTime();
      const todayEnd = todayStart + 86400000;

      list = tasks.filter((t) => {
        if (!t.dueDate || t.isDone) return false;
        const taskTime = new Date(t.dueDate).getTime();
        return taskTime >= todayStart && taskTime < todayEnd;
      });
    } else if (filter === 'done') {
      list = tasks.filter((t) => t.isDone);
    } else {
      list = tasks.filter((t) => !t.isDone);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }, [tasks, filter]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <ScaleDecorator>
      <Pressable 
        onLongPress={drag} 
        disabled={isActive} 
        delayLongPress={150}
        style={({ pressed }) => [
          styles.taskCardWrapper,
          isActive && styles.activeDraggingCard,
          pressed && { opacity: 0.95 }
        ]}
      >
        <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Upper Top Accent Bar */}
      <View style={[styles.topGradientBar, { backgroundColor: theme.primary + '10' }]} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Your Focus</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Keep blooming daily</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setTemplatesVisible(true)}
            style={[styles.templatesButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Text style={[styles.templatesButtonText, { color: theme.textPrimary }]}>
              ✨ Templates
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('AddEditTask', undefined)}
            style={[styles.addButton, { backgroundColor: theme.primary }, shadow.soft]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Optimized Glass-style Segmented Control for Filters */}
      <View style={[styles.filterRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {(['today', 'all', 'done'] as Filter[]).map((f) => {
          const isSelected = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                isSelected && { backgroundColor: theme.primary, ...shadow.soft },
              ]}
            >
              <Text style={[
                styles.filterChipText,
                { color: isSelected ? '#FFF' : theme.textSecondary }
              ]}>
                {f === 'today' ? 'Today' : f === 'all' ? 'Active' : 'Done'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            emoji="🌿"
            title="All caught up"
            message="Your space is clean. Take a breath, or explore template sets."
            actionLabel="Create new task"
            onAction={() => navigation.navigate('AddEditTask', undefined)}
          />
        </View>
      ) : (
        <DraggableFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => reorderTasks(data.map((t) => t.id))}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modern High-End Template Sheet */}
      <Modal visible={templatesVisible} transparent animationType="slide" onRequestClose={() => setTemplatesVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setTemplatesVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Choose a Toolkit</Text>
            <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
              Instantly deploy standard routines to your schedule.
            </Text>
            {TASK_TEMPLATES.map((template) => (
              <Pressable
                key={template.id}
                onPress={() => applyTemplate(template.id)}
                style={[styles.templateOption, shadow.soft, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.templateHeader}>
                  <Text style={[styles.templateName, { color: theme.textPrimary }]}>
                    {template.name}
                  </Text>
                  {applyingTemplate === template.id && (
                    <Text style={{ color: theme.primary, fontSize: typography.size.xs, fontFamily: typography.fontFamily.bodyBold }}>Deploying...</Text>
                  )}
                </View>
                <Text style={[styles.templateDesc, { color: theme.textSecondary }]}>
                  {template.description}
                </Text>
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
  topGradientBar: { height: 180, width: width, position: 'absolute', top: 0, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xl, letterSpacing: -0.5 },
  subtitle: { fontFamily: typography.fontFamily.body, fontSize: typography.size.xs, marginTop: 2 },
  templatesButton: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1 },
  templatesButtonText: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.bodyBold },
  addButton: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFF', fontSize: 24, fontFamily: typography.fontFamily.headingBold, marginTop: -2 },
  filterRow: { flexDirection: 'row', padding: 4, borderRadius: radius.xl, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderWidth: 1 },
  filterChip: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  filterChipText: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.size.xs },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: 4 },
  taskCardWrapper: { marginBottom: spacing.sm, borderRadius: radius.lg },
  activeDraggingCard: { opacity: 0.9, transform: [{ scale: 1.02 }] },
  emptyContainer: { flex: 0.8, justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { padding: spacing.lg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%' },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.pill, alignSelf: 'center', marginBottom: spacing.md },
  sheetTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.lg, marginBottom: 2 },
  sheetSubtitle: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: spacing.lg },
  templateOption: { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  templateName: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.size.sm },
  templateDesc: { fontFamily: typography.fontFamily.body, fontSize: typography.size.xs, lineHeight: 16 },
});