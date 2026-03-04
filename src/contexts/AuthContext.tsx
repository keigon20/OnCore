import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  AuthError
} from 'firebase/auth';
import * as Google from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { UserProfile } from '../types';

// Complete the auth session on mount to handle redirects properly
// This helps prevent the "missing initial state" error
WebBrowser.maybeCompleteAuthSession();

// Extend the types for expo-auth-session
export type GoogleAuthRequestConfig = {
  clientId: string;
  scopes: string[];
  extraParams?: {
    include_granted_scopes?: string;
    prompt?: string;
  };
};

export type GoogleAuthResponse = {
  type: string;
  params: {
    code?: string;
    error?: string;
  };
  authentication?: {
    accessToken: string;
    idToken?: string;
    refreshToken?: string;
    scopes?: string[];
    expirationDate?: number;
    tokenType?: string;
  };
};

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Firebase's OAuth redirect handler - this should already be authorized
  const redirectUri = 'https://livemusictracker-6eeaf.firebaseapp.com/__/auth/handler';

  // Google Auth Request - must be called at component top level
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest(
    {
      clientId: "1077269817537-og56f8jtikapoj531kafcf431sc5u7in.apps.googleusercontent.com",
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
      extraParams: {
        include_granted_scopes: 'true',
        prompt: 'consent',
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    }
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.displayName || '',
              createdAt: userData.createdAt?.toDate() || new Date()
            });
          } else {
            // Create user profile if doesn't exist
            const newUser: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: new Date()
            });
            setUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user profile in Firestore
      const newUser: UserProfile = {
        id: userCredential.user.uid,
        email,
        displayName,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        createdAt: new Date()
      });
      
      setUser(newUser);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      // Check for missing initial state error and provide helpful message
      if (isMissingInitialStateError(err)) {
        setError('Unable to complete sign up. Please try again. If this persists, try closing and reopening the app.');
      } else {
        setError(mapFirebaseError(err.code));
      }
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      // Check for missing initial state error and provide helpful message
      if (isMissingInitialStateError(err)) {
        setError('Unable to complete sign in. Please try again. If this persists, try closing and reopening the app.');
      } else {
        setError(mapFirebaseError(err.code));
      }
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
    }
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(mapFirebaseError(err.code));
      setIsLoading(false);
      return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    const maxRetries = 2;
    let retryCount = 0;
    
    const attemptSignIn = async (): Promise<boolean> => {
      try {
        // Check if the request is null
        if (!googleRequest) {
          throw new Error('Failed to create Google auth request');
        }

        // Prompt the user to sign in with Google
        const result = await googlePromptAsync();
        
        if (result.type !== 'success') {
          // Check if it was cancelled by user or due to missing state
          // Use type assertion to access params since it may exist on success type
          const params = (result as any).params;
          if (params?.error === 'access_denied' || result.type === 'cancel') {
            setError('Google sign in was cancelled');
            return false;
          }
          // It might be a missing state error - try again
          throw new Error('Google sign in failed');
        }

        // Get tokens from the response - cast to any to access params
        const response = result as any;
        const { id_token, access_token } = response.params || {};
        
        // Use id_token for Firebase authentication
        const idToken = id_token || access_token;
        
        if (!idToken) {
          throw new Error('No ID token received from Google');
        }
        
        // Create Firebase credential with the id token
        const credential: any = GoogleAuthProvider.credential(idToken, '');
        
        // Sign in to Firebase with the credential
        await signInWithCredential(auth, credential);
        
        return true;
      } catch (err: any) {
        console.error('Google Sign-In attempt error:', err);
        
        // Check if this is a "missing initial state" error that we can retry
        if (retryCount < maxRetries && isMissingInitialStateError(err)) {
          retryCount++;
          console.log(`Retrying Google sign-in (attempt ${retryCount + 1}/${maxRetries + 1})...`);
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptSignIn();
        }
        
        throw err;
      }
    };
    
    try {
      const success = await attemptSignIn();
      setIsLoading(false);
      return success;
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      
      if (err.message === 'User cancelled') {
        setError('Google sign in was cancelled');
      } else if (isMissingInitialStateError(err)) {
        // Provide a more user-friendly message for this specific error
        setError('Unable to complete sign in. Please try again. If this persists, try closing and reopening the app.');
      } else {
        setError(mapFirebaseError(err.code) || 'Failed to sign in with Google');
      }
      setIsLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    error,
    signUp,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid credentials';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later';
    case 'auth/session-cookie-expired':
      return 'Session expired. Please sign in again';
    case 'auth/user-token-expired':
      return 'Your session has expired. Please sign in again';
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action';
    default:
      return 'An error occurred. Please try again';
  }
}

// Helper function to detect "missing initial state" error
// This error occurs when sessionStorage is unavailable or was cleared
function isMissingInitialStateError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const errorCode = error.code || '';
  
  // Check for various forms of this error
  return (
    errorMessage.includes('missing initial state') ||
    errorMessage.includes('Unable to process request due to missing initial state') ||
    errorCode === 'auth/internal-error' ||
    errorCode === 'auth/session-cookie-expired' ||
    errorCode === 'auth/user-token-expired'
  );
}

// Helper to handle auth state recovery
async function recoverAuthState(): Promise<void> {
  // Force reload the auth module to recover from stale state
  try {
    // The auth state listener will automatically re-initialize
    console.log('Attempting to recover auth state...');
  } catch (error) {
    console.error('Auth state recovery failed:', error);
  }
}

