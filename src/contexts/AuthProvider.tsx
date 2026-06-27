import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { AuthContext } from './auth-context'
import { auth, db } from '../lib/firebase'
import { isRecruiterAuthDisabled, DEV_RECRUITER_UID } from '../lib/recruiterAuth'
import { ensureUserProfile, subscribeToAuthState } from '../services/auth'
import type { RecruiterProfile } from '../types/user'

const DEV_USER: User = {
  uid: DEV_RECRUITER_UID,
  email: 'dev@localhost',
  displayName: 'Dev Recruiter',
} as User

const DEV_PROFILE: RecruiterProfile = {
  uid: DEV_RECRUITER_UID,
  email: 'dev@localhost',
  displayName: 'Dev Recruiter',
  photoURL: null,
  defaultCompany: 'Dev Company',
  defaultRoleArchetype: 'general',
  createdAt: null,
}

function initialLoading(): boolean {
  if (isRecruiterAuthDisabled) return false
  return Boolean(auth)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(isRecruiterAuthDisabled ? DEV_USER : null)
  const [profile, setProfile] = useState<RecruiterProfile | null>(isRecruiterAuthDisabled ? DEV_PROFILE : null)
  const [loading, setLoading] = useState(initialLoading)

  useEffect(() => {
    if (isRecruiterAuthDisabled || !auth) return

    return subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setProfile(null)
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (isRecruiterAuthDisabled || !user || !db) return

    const ref = doc(db, 'users', user.uid)
    return onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ uid: user.uid, ...(snapshot.data() as Omit<RecruiterProfile, 'uid'>) })
        } else {
          void ensureUserProfile(user).then(setProfile)
        }
        setLoading(false)
      },
      (error) => {
        console.error('User profile subscription failed:', error)
        setLoading(false)
      },
    )
  }, [user])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: isRecruiterAuthDisabled || user != null,
      uid: user?.uid ?? null,
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
