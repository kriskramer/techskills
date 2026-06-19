const STORAGE_KEY = 'praxis-recruit-email'

export function getStoredRecruitEmail(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function setStoredRecruitEmail(email: string): void {
  try {
    const trimmed = email.trim()
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures (private browsing, etc.)
  }
}
