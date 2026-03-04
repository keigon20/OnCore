// Music Event type definition
export interface MusicEvent {
  id: string;
  title: string;
  artists: string[];
  venue: string;
  date: Date;
  cost: number;
  notes: string;
  imageUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// Statistics type
export interface YearStatistics {
  year: number;
  totalEvents: number;
  totalMoneySpent: number;
  uniqueArtists: number;
  uniqueVenues: number;
  favoriteArtist?: string;
  averageCost: number;
  mostRecentEvent?: MusicEvent;
  oldestEvent?: MusicEvent;
}

// Auth state type
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

