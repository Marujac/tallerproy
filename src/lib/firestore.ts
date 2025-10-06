// src/lib/firestore.ts
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import type { QuizAttempt } from '@/types/history';

const HISTORY_COLLECTION = 'quizHistory';

// Add a new quiz attempt
export async function addQuizAttempt(attempt: Omit<QuizAttempt, 'id'>) {
  try {
    await addDoc(collection(db, HISTORY_COLLECTION), attempt);
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not save quiz attempt.');
  }
}

// Get quiz history for a user with real-time updates and sorted by date
export function getQuizHistory(userId: string, callback: (attempts: QuizAttempt[]) => void) {
  const q = query(
    collection(db, HISTORY_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const attempts: QuizAttempt[] = [];
    querySnapshot.forEach((doc) => {
      attempts.push({ id: doc.id, ...doc.data() } as QuizAttempt);
    });
    callback(attempts);
  });

  return unsubscribe; // Return the unsubscribe function to clean up the listener
}


// Clear all quiz history for a user
export async function clearQuizHistory(userId: string) {
    try {
        const q = query(collection(db, HISTORY_COLLECTION), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return;
        }

        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    } catch (e) {
        console.error('Error deleting documents: ', e);
        throw new Error('Could not clear quiz history.');
    }
}
