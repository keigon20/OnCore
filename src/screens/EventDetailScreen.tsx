import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { useEventStore } from '../contexts/EventStoreContext';
import { MusicEvent } from '../types';

interface EventDetailScreenProps {
  event: MusicEvent;
  onEdit: (event: MusicEvent) => void;
  onClose: () => void;
}

export default function EventDetailScreen({ event, onEdit, onClose }: EventDetailScreenProps) {
  const { deleteEvent } = useEventStore();

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(event.id);
            onClose();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {event.imageUri && (
        <Image source={{ uri: event.imageUri }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🎸</Text>
          <Text style={styles.detailLabel}>Artists:</Text>
          <Text style={styles.detailValue}>{event.artists.join(', ')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🏟️</Text>
          <Text style={styles.detailLabel}>Venue:</Text>
          <Text style={styles.detailValue}>{event.venue}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>💰</Text>
          <Text style={styles.detailLabel}>Cost:</Text>
          <Text style={styles.costValue}>${event.cost.toFixed(2)}</Text>
        </View>

        {event.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{event.notes}</Text>
          </View>
        )}

        <View style={styles.metaSection}>
          <Text style={styles.metaText}>
            Added: {new Date(event.createdAt).toLocaleDateString()}
          </Text>
          {event.updatedAt && (
            <Text style={styles.metaText}>
              Updated: {new Date(event.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => onEdit(event)}
          >
            <Text style={styles.editButtonText}>Edit Event</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
  },
  costValue: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  notesSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  metaSection: {
    marginTop: 20,
    paddingVertical: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

