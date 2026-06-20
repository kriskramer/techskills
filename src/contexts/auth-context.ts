import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { RecruiterProfile } from '../types/user'

export interface AuthContextValue {
  user: User | null
  profile: RecruiterProfile | null
  loading: boolean
  isAuthenticated: boolean
  uid: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
