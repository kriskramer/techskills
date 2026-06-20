import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { RecruiterNotification } from '../types/notification'

function requireDb() {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* env vars in .env.local.')
  }
  return db
}

export function subscribeToNotifications(
  uid: string,
  onChange: (notifications: RecruiterNotification[]) => void,
): Unsubscribe {
  const firestore = requireDb()
  const notificationsQuery = query(
    collection(firestore, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) => ({
          id: document.id,
          ...(document.data() as Omit<RecruiterNotification, 'id'>),
        })),
      )
    },
    (error) => {
      console.error('Notifications subscription failed:', error)
      onChange([])
    },
  )
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  const firestore = requireDb()
  await updateDoc(doc(firestore, 'users', uid, 'notifications', notificationId), { read: true })
}

export async function markAllNotificationsRead(uid: string, notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return
  const firestore = requireDb()
  const batch = writeBatch(firestore)
  for (const notificationId of notificationIds) {
    batch.update(doc(firestore, 'users', uid, 'notifications', notificationId), { read: true })
  }
  await batch.commit()
}

export async function markNotificationsReadForCandidate(uid: string, candidateId: string): Promise<void> {
  const firestore = requireDb()
  const snapshot = await getDocs(
    query(collection(firestore, 'users', uid, 'notifications'), where('read', '==', false)),
  )

  const batch = writeBatch(firestore)
  let pending = 0

  for (const document of snapshot.docs) {
    if (document.data().candidateId === candidateId) {
      batch.update(document.ref, { read: true })
      pending++
    }
  }

  if (pending > 0) {
    await batch.commit()
  }
}
