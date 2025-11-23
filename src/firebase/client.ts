// src/firebase/client.ts

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// This function should ONLY be called on the client side.
export function initializeFirebaseClient() {
  if (getApps().length === 0) {
    // First-time initialization
    return initializeApp(firebaseConfig);
  } else {
    // Return existing app
    return getApp();
  }
}
