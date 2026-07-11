import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { PriorityBadge, CategoryTag } from '@/components/Badges';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { RootStackParamList } from '@/navigation/types';

export function TaskDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTaskDone = useTaskStore((s) => s.toggleTaskDone);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const task = useMemo(() => tasks.find((t) => t.id === route.params.taskId), [tasks, route.params.taskId]);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  if (!task) {
    return (
      <ScreenContainer>
        <Text style={{ color: theme.textPrimary }}>This task no longer exists.</Text>
      </ScreenContainer>
    );
  }

  const confirmDelete = () => {
    Alert.alert('Delete task?', `"${task.title}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => toggleTaskDone(task.id)}
          style={[styles.checkbox, { borderColor: theme.primary, backgroundColor: task.isDone ? theme.primary : 'transparent' }]}
        >
          {task.isDone ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>
        <Text
          style={[
            styles.title,
            { color: theme.textPrimary, textDecorationLine: task.isDone ? 'line-through' : 'none' },
          ]}
        >
          {task.title}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <PriorityBadge priority={task.priority} />
        <CategoryTag category={task.category} />
      </View>

      {task.dueDate ? (
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
          Due {format(new Date(task.dueDate), "EEEE, MMM d 'at' h:mm a")}
        </Text>
      ) : null}
      {task.estimatedMinutes ? (
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>Estimated {task.estimatedMinutes} minutes</Text>
      ) : null}

      {task.description ? (
        <Text style={[styles.description, { color: theme.textPrimary }]}>{task.description}</Text>
      ) : null}

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Subtasks</Text>
      {task.subtasks.map((sub) => (
        <Pressable key={sub.id} style={styles.subtaskRow} onPress={() => toggleSubtask(task.id, sub.id)}>
          <View
            style={[
              styles.subCheckbox,
              { borderColor: theme.primary, backgroundColor: sub.isDone ? theme.primary : 'transparent' },
            ]}
          >
            {sub.isDone ? <Text style={styles.subCheckmark}>✓</Text> : null}
          </View>
          <Text
            style={{
              color: theme.textPrimary,
              textDecorationLine: sub.isDone ? 'line-through' : 'none',
              flex: 1,
            }}
          >
            {sub.title}
          </Text>
        </Pressable>
      ))}
      <View style={styles.addSubtaskRow}>
        <TextInput
          value={subtaskDraft}
          onChangeText={setSubtaskDraft}
          placeholder="Add a subtask"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
          onSubmitEditing={() => {
            addSubtask(task.id, subtaskDraft);
            setSubtaskDraft('');
          }}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label="Start a focus session"
          onPress={() => navigation.navigate('Main', { screen: 'Pomodoro', params: { taskId: task.id } })}
          fullWidth
        />
        <Button label="Edit task" variant="secondary" onPress={() => navigation.navigate('AddEditTask', { taskId: task.id })} fullWidth />
        <Button label="Delete task" variant="ghost" onPress={confirmDelete} fullWidth />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  checkbox: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#FFF', fontFamily: typography.fontFamily.bodyBold },
  title: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xl, flex: 1 },
  metaRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  metaText: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: 4 },
  description: { fontFamily: typography.fontFamily.body, fontSize: typography.size.md, marginTop: spacing.sm, lineHeight: 22 },
  sectionTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8 },
  subCheckbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  subCheckmark: { color: '#FFF', fontSize: 12, fontFamily: typography.fontFamily.bodyBold },
  addSubtaskRow: { marginTop: spacing.xs, marginBottom: spacing.lg },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10 },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
