import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEventStore } from '../contexts/EventStoreContext';
import { MusicEvent } from '../types';

interface AddEventScreenProps {
  onClose: () => void;
  eventToEdit?: MusicEvent;
}

export default function AddEventScreen({ onClose, eventToEdit }: AddEventScreenProps) {
  const { addEvent, updateEvent } = useEventStore();
  
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [artistsText, setArtistsText] = useState(eventToEdit?.artists.join(', ') || '');
  const [venue, setVenue] = useState(eventToEdit?.venue || '');
  const [date, setDate] = useState(
    eventToEdit 
      ? new Date(eventToEdit.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [cost, setCost] = useState(eventToEdit?.cost.toString() || '');
  const [notes, setNotes] = useState(eventToEdit?.notes || '');
  const [imageUri, setImageUri] = useState(eventToEdit?.imageUri || '');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!venue.trim()) {
      Alert.alert('Error', 'Please enter a venue');
      return;
    }

    const artists = artistsText
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const eventData = {
      title: title.trim(),
      artists,
      venue: venue.trim(),
      date: new Date(date),
      cost: parseFloat(cost) || 0,
      notes: notes.trim(),
      imageUri: imageUri || undefined,
    };

    try {
      if (eventToEdit) {
        await updateEvent({
          ...eventToEdit,
          ...eventData,
        });
      } else {
        await addEvent(eventData);
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save event');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {eventToEdit ? 'Edit Event' : 'Add Event'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imagePlaceholderLabel}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Summer Tour 2024"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Artists (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={artistsText}
              onChangeText={setArtistsText}
              placeholder="e.g., Taylor Swift, Ed Sheeran"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue *</Text>
            <TextInput
              style={styles.input}
              value={venue}
              onChangeText={setVenue}
              placeholder="e.g., Madison Square Garden"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about the event..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  imageSection: {
    padding: 16,
  },
  imagePicker: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

