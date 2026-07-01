import AsyncStorage from '@react-native-async-storage/async-storage';

const keyFor = (userId: string) => `seen_events_${userId}`;

export async function loadSeenEventIds(userId: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (err) {
    console.error('[seenEvents] Failed to load seen events:', err);
    return new Set();
  }
}

export async function markEventsSeen(userId: string, eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return;
  try {
    const existing = await loadSeenEventIds(userId);
    eventIds.forEach(id => existing.add(id));
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify([...existing]));
  } catch (err) {
    console.error('[seenEvents] Failed to persist seen events:', err);
  }
}
