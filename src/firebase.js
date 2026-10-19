const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.trim());

let appPromise;
let authPromise;
let databasePromise;

function getFirebaseApp() {
  if (!firebaseConfigured) return Promise.resolve(null);
  if (!appPromise) {
    appPromise = import('firebase/app').then((appApi) => appApi.getApps()[0] || appApi.initializeApp(firebaseConfig));
  }
  return appPromise;
}

export function getFirebaseAuth() {
  if (!firebaseConfigured) return Promise.resolve(null);
  if (!authPromise) {
    authPromise = Promise.all([getFirebaseApp(), import('firebase/auth')]).then(([firebaseApp, authApi]) => ({
      auth: authApi.getAuth(firebaseApp),
      authApi,
    }));
  }
  return authPromise;
}

export function getFirebaseDatabase() {
  if (!firebaseConfigured) return Promise.resolve(null);
  if (!databasePromise) {
    databasePromise = Promise.all([getFirebaseApp(), import('firebase/firestore/lite')]).then(([firebaseApp, firestoreApi]) => ({
      database: firestoreApi.getFirestore(firebaseApp),
      firestoreApi,
    }));
  }
  return databasePromise;
}
