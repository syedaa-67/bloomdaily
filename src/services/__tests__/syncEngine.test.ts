interface SyncableItem {
  id: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * Reconciles a local array and a remote array of items using a "newest-wins" strategy.
 * Items present on only one side are preserved. Items present on both sides are
 * merged by comparing their `updatedAt` timestamps.
 */
export function mergeById<T extends SyncableItem>(local: T[], remote: T[]): T[] {
  const remoteMap = new Map<string, T>();
  remote.forEach((item) => remoteMap.set(item.id, item));

  const mergedList: T[] = [];
  const processedRemoteIds = new Set<string>();

  // Process all local items and reconcile with remote items if there's an ID match
  local.forEach((localItem) => {
    const remoteItem = remoteMap.get(localItem.id);

    if (!remoteItem) {
      // Exists only locally
      mergedList.push(localItem);
    } else {
      processedRemoteIds.add(localItem.id);
      
      const localTime = new Date(localItem.updatedAt).getTime();
      const remoteTime = new Date(remoteItem.updatedAt).getTime();

      // Newest timestamp wins
      if (remoteTime > localTime) {
        mergedList.push(remoteItem);
      } else {
        mergedList.push(localItem);
      }
    }
  });

  // Append remote items that do not exist locally
  remote.forEach((remoteItem) => {
    if (!processedRemoteIds.has(remoteItem.id)) {
      mergedList.push(remoteItem);
    }
  });

  return mergedList;
}