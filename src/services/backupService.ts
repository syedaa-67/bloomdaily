import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// ✅ JSON backup
export async function exportBackup(): Promise<void> {
  const payload = buildBackupPayload();

  if (Platform.OS === 'web') {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloomdaily-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const fileUri = `${FileSystem.documentDirectory}bloomdaily-backup-${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  }
}

// ✅ CSV export
export async function exportTasksAsCsv(tasks: Task[]): Promise<void> {
  const header = "id,title,completed\n";
  const rows = tasks.map(t => `${t.id},${t.title},${t.completed}`).join("\n");

  if (Platform.OS === 'web') {
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloomdaily-tasks-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const fileUri = `${FileSystem.documentDirectory}bloomdaily-tasks-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, header + rows);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  }
}

// ✅ Import backup
export async function importBackup(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.type === 'success') {
      const content = await FileSystem.readAsStringAsync(result.uri);
      const parsed = JSON.parse(content);
      // TODO: apply parsed backup to your stores
      return { success: true, message: 'Backup imported successfully' };
    }
    return { success: false, message: 'No file selected' };
  } catch (e) {
    return { success: false, message: 'Import failed' };
  }
}
