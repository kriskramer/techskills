import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Resend } from 'resend'

const resendApiKey = defineSecret('RESEND_API_KEY')

interface ScoreTestRequest {
  testId: string
}

interface ScoreBreakdown {
  correct: number
  total: number
}

interface TestQuestion {
  id: string
  category: string
  prompt: string
  skills?: string[]
}

export const scoreTest = onCall<ScoreTestRequest>(
  { secrets: [resendApiKey] },
  async (request) => {
    const { testId } = request.data

    if (!testId || typeof testId !== 'string') {
      throw new HttpsError('invalid-argument', 'testId is required.')
    }

    const db = getFirestore()
    const testRef = db.collection('tests').doc(testId)
    const privateRef = testRef.collection('private').doc('answerKey')

    const [testSnap, privateSnap] = await Promise.all([testRef.get(), privateRef.get()])

    if (!testSnap.exists) {
      throw new HttpsError('not-found', `Test ${testId} not found.`)
    }

    const testData = testSnap.data()!
    const candidateId = testData.candidateId as string

    if (testData.status === 'completed') {
      return { score: testData.score }
    }

    if (!privateSnap.exists) {
      throw new HttpsError('failed-precondition', 'Answer key not found for this test.')
    }

    const answerKey = privateSnap.data()!.key as Record<string, string>
    const answers = (testData.answers ?? {}) as Record<string, string>
    const questions = (testData.questions ?? []) as TestQuestion[]

    const byCategory: Record<string, ScoreBreakdown> = {}
    const bySkill: Record<string, ScoreBreakdown> = {}
    let correct = 0

    const questionBreakdown = questions.map((question) => {
      const candidateAnswer = (answers[question.id] ?? '').trim()
      const correctAnswer = (answerKey[question.id] ?? '').trim()
      const isCorrect = candidateAnswer.toLowerCase() === correctAnswer.toLowerCase()

      const cat = byCategory[question.category] ?? { correct: 0, total: 0 }
      cat.total += 1
      if (isCorrect) {
        cat.correct += 1
        correct += 1
      }
      byCategory[question.category] = cat

      for (const skill of question.skills ?? []) {
        const sk = bySkill[skill] ?? { correct: 0, total: 0 }
        sk.total += 1
        if (isCorrect) sk.correct += 1
        bySkill[skill] = sk
      }

      return { questionId: question.id, prompt: question.prompt, candidateAnswer, correctAnswer, isCorrect }
    })

    const score = { correct, total: questions.length, byCategory, bySkill }

    await testRef.update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      score,
      questionBreakdown,
    })

    await db.collection('candidates').doc(candidateId).update({
      status: 'completed',
      updatedAt: FieldValue.serverTimestamp(),
    })

    await createInAppNotification(db, candidateId, testId, testData.candidateName as string, score)

    await sendRecruiterNotification(
      resendApiKey.value(),
      candidateId,
      testData.candidateName as string,
      score,
    )

    return { score }
  },
)

async function createInAppNotification(
  db: FirebaseFirestore.Firestore,
  candidateId: string,
  testId: string,
  candidateName: string,
  score: { correct: number; total: number },
): Promise<void> {
  const candidateSnap = await db.collection('candidates').doc(candidateId).get()
  const createdBy = candidateSnap.data()?.createdBy as string | undefined
  if (!createdBy) return

  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  await db.collection('users').doc(createdBy).collection('notifications').add({
    type: 'test_completed',
    candidateId,
    candidateName,
    testId,
    message: `${candidateName} completed their assessment (${pct}%)`,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  })
}

async function sendRecruiterNotification(
  apiKey: string,
  candidateId: string,
  candidateName: string,
  score: { correct: number; total: number; byCategory: Record<string, ScoreBreakdown>; bySkill: Record<string, ScoreBreakdown> },
): Promise<void> {
  const db = getFirestore()
  const candidateSnap = await db.collection('candidates').doc(candidateId).get()
  const candidateData = candidateSnap.data()
  const recruiterEmail =
    (candidateData?.recruiterEmail as string | undefined)?.trim() || process.env.RECRUITER_EMAIL

  if (!recruiterEmail) {
    console.warn(
      'No recruiter email on candidate and RECRUITER_EMAIL is not set — skipping recruiter notification.',
    )
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const appUrl = process.env.APP_URL
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  const categoryLines = Object.entries(score.byCategory)
    .map(([cat, b]) => {
      const catPct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0
      return `  ${cat}: ${b.correct}/${b.total} (${catPct}%)`
    })
    .join('\n')

  const skillLines = Object.entries(score.bySkill)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([skill, b]) => {
      const skillPct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0
      return `  ${skill}: ${b.correct}/${b.total} (${skillPct}%)`
    })
    .join('\n')

  const candidateLink = appUrl ? `${appUrl}/recruiter/candidates/${candidateId}` : null

  const lines = [
    `${candidateName} has completed their skills assessment.`,
    '',
    `Overall score: ${score.correct}/${score.total} (${pct}%)`,
    '',
    'By category:',
    categoryLines,
  ]

  if (skillLines) {
    lines.push('', 'By skill:', skillLines)
  }

  if (candidateLink) {
    lines.push('', `View candidate: ${candidateLink}`)
  }

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: fromEmail,
    to: recruiterEmail,
    subject: `Assessment complete: ${candidateName}`,
    text: lines.join('\n'),
  })
}

