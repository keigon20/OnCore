import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import { useEventSocial } from '../hooks/useEventSocial';
import { useAuth } from '../contexts/AuthContext';
import { EventComment } from '../types';
import CommentThread from '../components/CommentThread';

export default function CommentsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { eventId, eventTitle, eventOwnerId } = route.params as { eventId: string; eventTitle?: string; eventOwnerId: string };
  const { comments, addComment, deleteComment } = useEventSocial(eventId, eventOwnerId, eventTitle);
  const [text, setText] = useState('');
  const isPostOwner = !!user && user.id === eventOwnerId;

  const handleSend = async () => {
    if (!text.trim()) return;
    await addComment(text);
    setText('');
  };

  const renderComment = ({ item }: { item: EventComment }) => (
    <CommentThread
      eventId={eventId}
      comment={item}
      onDeleteComment={() => deleteComment(item.id)}
      isPostOwner={isPostOwner}
      eventOwnerId={eventOwnerId}
      eventTitle={eventTitle}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{eventTitle || 'Comments'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet. Be the first.</Text>
        }
      />

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 50,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 14,
    marginTop: 40,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
