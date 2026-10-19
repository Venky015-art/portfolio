import { getFirebaseDatabase } from '../firebase';

export async function loadProgress(userId) {
  const services = await getFirebaseDatabase();
  if (!services) throw new Error('Firebase is not configured.');
  const { doc, getDoc } = services.firestoreApi;
  const snapshot = await getDoc(doc(services.database, 'users', userId, 'progress', 'current'));
  const state = snapshot.data()?.state;
  return state && typeof state === 'object' && !Array.isArray(state) ? state : null;
}

export async function saveProgress(userId, state) {
  const services = await getFirebaseDatabase();
  if (!services) throw new Error('Firebase is not configured.');
  const { doc, serverTimestamp, setDoc } = services.firestoreApi;
  await setDoc(doc(services.database, 'users', userId, 'progress', 'current'), {
    state,
    updatedAt: serverTimestamp(),
  });
}
