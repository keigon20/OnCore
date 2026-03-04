import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { EventStoreProvider } from './src/contexts/EventStoreContext';
import AuthScreen from './src/screens/AuthScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import { MusicEvent } from './src/types';

const Tab = createBottomTabNavigator();

function MainTabs({ onSignIn }: { onSignIn: () => void }) {
  const [selectedEvent, setSelectedEvent] = useState<MusicEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MusicEvent | undefined>(undefined);

  const handleEventPress = (event: MusicEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleEditEvent = (event: MusicEvent) => {
    setEditingEvent(event);
    setShowEventDetail(false);
    setShowAddEvent(true);
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Journal"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size }}>🎵</Text>
            ),
          }}
        >
          {() => (
            <JournalScreen
              onEventPress={handleEventPress}
              onAddEvent={() => {
                setEditingEvent(undefined);
                setShowAddEvent(true);
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size }}>👤</Text>
            ),
          }}
        >
          {() => <ProfileScreen onSignIn={onSignIn} />}
        </Tab.Screen>
      </Tab.Navigator>

      {showAddEvent && (
        <AddEventScreen
          onClose={() => {
            setShowAddEvent(false);
            setEditingEvent(undefined);
          }}
          eventToEdit={editingEvent}
        />
      )}

      {showEventDetail && selectedEvent && (
        <EventDetailScreen
          event={selectedEvent}
          onEdit={handleEditEvent}
          onClose={() => {
            setShowEventDetail(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated && !showAuth) {
    return (
      <AuthScreen
        onAuthSuccess={() => setShowAuth(true)}
        onContinueAsGuest={() => setShowAuth(true)}
      />
    );
  }

  return (
    <MainTabs onSignIn={() => setShowAuth(true)} />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <EventStoreProvider>
            <StatusBar style="auto" />
            <AppContent />
          </EventStoreProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

