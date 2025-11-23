'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ---------------------------------------------
// FIX 1 — Prevent server-side initialization
// ---------------------------------------------
export function initializeFirebase() {
  // If running on server (SSR/RSC), never create a new app
  if (typeof window === "undefined") {
    if (!getApps().length) {
      // create a dummy app using config — Hosting env won't be here on server
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    }
    return getSdks(getApp());
  }

  // ---------------------------------------------
  // CLIENT-SIDE INITIALIZATION (REAL APP)
  // ---------------------------------------------
  if (!getApps().length) {
    let firebaseApp;
    try {
      // Try Firebase Hosting automatic initialization
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e
        );
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // return existing app if already initialized
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
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
