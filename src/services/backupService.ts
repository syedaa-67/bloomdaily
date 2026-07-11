import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTaskStore } from '@/store/useTaskStore';
import { useWellnessStore } from '@/store/useWellnessStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';

const BACKUP_VERSION = 1;

interface BackupPayload {
  version: number;
  exportedAt: string;
  tasks: ReturnType<typeof useTaskStore.getState>['tasks'];
  wellness: {
    habits: ReturnType<typeof useWellnessStore.getState>['habits'];
    moodCheckIns: ReturnType<typeof useWellnessStore.getState>['moodCheckIns'];
    journalEntries: ReturnType<typeof useWellnessStore.getState>['journalEntries'];
    cycleSettings: ReturnType<typeof useWellnessStore.getState>['cycleSettings'];
    cycleLogs: ReturnType<typeof useWellnessStore.getState>['cycleLogs'];
  };
  settings: {
    themePreference: ReturnType<typeof useSettingsStore.getState>['themePreference'];
    quietHours: ReturnType<typeof useSettingsStore.getState>['quietHours'];
  };
  profile: ReturnType<typeof useUserStore.getState>['profile'];
}

function buildBackupPayload(): BackupPayload {
  const taskState = useTaskStore.getState();
  const wellnessState = useWellnessStore.getState();
  const settingsState = useSettingsStore.getState();
  const userState = useUserStore.getState();

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: taskState.tasks,
    wellness: {
      habits: wellnessState.habits,
      moodCheckIns: wellnessState.moodCheckIns,
      journalEntries: wellnessState.journalEntries,
      cycleSettings: wellnessState.cycleSettings,
      cycleLogs: wellnessState.cycleLogs,
    },
    settings: {
      themePreference: settingsState.themePreference,
      quietHours: settingsState.quietHours,
    },
    profile: userState.profile,
  };
}

/** Export all local data as a shareable .json file (JSON is used as the
 * canonical backup format; a flattened CSV of tasks is also offered for
 * spreadsheet users via exportTasksAsCsv). */
export async function exportBackup(): Promise<void> {
  const payload = buildBackupPayload();
  const fileUri = `${FileSystem.documentDirectory}bloomdaily-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export BloomDaily data' });
  }
}

export async function exportTasksAsCsv(): Promise<void> {
  const tasks = useTaskStore.getState().tasks;
  const header = 'Title,Category,Priority,Due Date,Completed,Estimated Minutes\n';
  const rows = tasks
    .map((t) =>
      [t.title, t.category, t.priority, t.dueDate ?? '', t.isDone ? 'Yes' : 'No', t.estimatedMinutes ?? '']
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const fileUri = `${FileSystem.documentDirectory}bloomdaily-tasks-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, header + rows);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export tasks as CSV' });
  }
}

/** Restore data from a previously exported .json backup file. */
export async function importBackup(): Promise<{ success: boolean; message: string }> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled || !result.assets?.length) {
    return { success: false, message: 'Import cancelled.' };
  }

  try {
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const payload = JSON.parse(content) as BackupPayload;

    if (!payload.version || !Array.isArray(payload.tasks)) {
      return { success: false, message: 'This file doesn\'t look like a BloomDaily backup.' };
    }

    useTaskStore.setState({ tasks: payload.tasks });
    useWellnessStore.setState({
      habits: payload.wellness.habits,
      moodCheckIns: payload.wellness.moodCheckIns,
      journalEntries: payload.wellness.journalEntries,
      cycleSettings: payload.wellness.cycleSettings,
      cycleLogs: payload.wellness.cycleLogs,
    });
    useSettingsStore.setState({
      themePreference: payload.settings.themePreference,
      quietHours: payload.settings.quietHours,
    });
    if (payload.profile) {
      useUserStore.setState({ profile: payload.profile });
    }

    return { success: true, message: 'Backup restored successfully.' };
  } catch (err) {
    return { success: false, message: 'Could not read that file. Please check it\'s a valid backup.' };
  }
}
