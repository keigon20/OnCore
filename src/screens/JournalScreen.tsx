import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  Alert
} from 'react-native';
import { useEventStore } from '../contexts/EventStoreContext';
import { MusicEvent } from '../types';

interface JournalScreenProps {
  onEventPress: (event: MusicEvent) => void;
  onAddEvent: () => void;
}

export default function JournalScreen({ onEventPress, onAddEvent }: JournalScreenProps) {
  const { events, deleteEvent } = useEventStore();
  const [searchText, setSearchText] = useState('');

  const filteredEvents = events.filter(event => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      event.title.toLowerCase().includes(search) ||
      event.artists.some(artist => artist.toLowerCase().includes(search)) ||
      event.venue.toLowerCase().includes(search) ||
      event.notes.toLowerCase().includes(search)
    );
  });

  const handleDelete = (event: MusicEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteEvent(event.id)
        }
      ]
    );
  };

  const renderEvent = ({ item }: { item: MusicEvent }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onEventPress(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.eventContent}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventArtists}>{item.artists.join(', ')}</Text>
          <Text style={styles.eventVenue}>{item.venue}</Text>
          <View style={styles.eventMeta}>
            <Text style={styles.eventDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text style={styles.eventCost}>${item.cost.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎵</Text>
      <Text style={styles.emptyTitle}>No Events Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your live music experiences!
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddEvent}>
        <Text style={styles.emptyButtonText}>Add Your First Event</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
        contentContainerStyle={filteredEvents.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
      />

      {events.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={onAddEvent}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventContent: {
    padding: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventArtists: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventVenue: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventDate: {
    fontSize: 12,
    color: '#999',
  },
  eventCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '300',
  },
});

