# Auth Context Fix - TODO

## Task: Fix "missing initial state" Firebase Auth error

### Steps:
- [x] 1. Analyze codebase to understand the issue
- [x] 2. Add explicit session persistence to Firebase Auth
- [x] 3. Add error handling for "missing initial state" with retry
- [x] 4. Add state recovery mechanism
- [x] 5. Improve Google sign-in error handling
- [x] 6. Add WebBrowser.maybeCompleteAuthSession() for redirect handling

### Files modified:
- src/utils/firebase.ts - Added auth persistence settings
- src/contexts/AuthContext.tsx - Added error handling, retry logic, and recovery

### Summary of changes:
1. Added session-based persistence to Firebase Auth (with fallback to in-memory)
2. Added helper function to detect "missing initial state" error
3. Added retry logic (up to 2 retries) for Google sign-in
4. Improved error messages for all auth methods
5. Added WebBrowser.maybeCompleteAuthSession() call on module load
6. Added new error codes to mapFirebaseError (session-cookie-expired, user-token-expired, requires-recent-login)

