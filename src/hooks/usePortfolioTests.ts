import { useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../lib/firebase'
import { subscribeToTest } from '../services/tests'
import type { TestDoc } from '../types/test'

/** Subscribes to the current test doc for each token in the list. */
export function useTestsByToken(testIds: string[]): Record<string, TestDoc | null> {
  const [testsByToken, setTestsByToken] = useState<Record<string, TestDoc | null>>({})

  useEffect(() => {
    if (!isFirebaseConfigured || testIds.length === 0) return

    const unsubscribes = testIds.map((testId) =>
      subscribeToTest(testId, (test) => {
        setTestsByToken((current) => ({ ...current, [testId]: test }))
      }),
    )

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe()
    }
  }, [testIds])

  return useMemo(() => {
    if (testIds.length === 0) return {}

    const result: Record<string, TestDoc | null> = {}
    for (const testId of testIds) {
      result[testId] = testsByToken[testId] ?? null
    }
    return result
  }, [testIds, testsByToken])
}

export function mapTestsByCandidateId(
  candidates: { id: string; testId: string | null }[],
  testsByToken: Record<string, TestDoc | null>,
): Record<string, TestDoc | null> {
  const result: Record<string, TestDoc | null> = {}
  for (const candidate of candidates) {
    if (candidate.testId) {
      result[candidate.id] = testsByToken[candidate.testId] ?? null
    }
  }
  return result
}
