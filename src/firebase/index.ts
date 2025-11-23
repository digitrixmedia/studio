'use client';

import { initializeFirebaseClient } from './client';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: This function should be the SINGLE SOURCE OF TRUTH for getting Firebase services.
export function initializeFirebase() {
  const firebaseApp = initializeFirebaseClient();
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
