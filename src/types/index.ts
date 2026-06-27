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
  overallRating?: number; // 0.0 - 10.0
  soundRating?: number; // 1 - 5
  crowdRating?: number; // 1 - 5
  setlistRating?: number; // 1 - 5
  isHidden?: boolean; // hidden from friends' feed
  createdAt: Date;
  updatedAt: Date;
}

// An event as it appears in a friend's feed - includes the owner's identity
export interface FeedEvent extends MusicEvent {
  userId: string;
  userDisplayName: string;
}

export interface Friend {
  id: string; // friend's uid
  displayName: string;
  email: string;
  addedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromEmail: string;
  toUserId: string;
  toDisplayName: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface EventComment {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: Date;
}

export interface EventLike {
  userId: string;
  displayName: string;
  createdAt: Date;
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

