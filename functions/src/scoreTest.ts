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

      return { questionId: question.id, prompt: question.prompt, candidateAnswer, correctAnswer, isCorrect }
    })

    const score = { correct, total: questions.length, byCategory }

    await testRef.update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      score,
      questionBreakdown,
    })

    await sendRecruiterNotification(resendApiKey.value(), testData.candidateName as string, score)

    return { score }
  },
)

async function sendRecruiterNotification(
  apiKey: string,
  candidateName: string,
  score: { correct: number; total: number; byCategory: Record<string, ScoreBreakdown> },
): Promise<void> {
  const recruiterEmail = process.env.RECRUITER_EMAIL
  if (!recruiterEmail) return

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const categoryLines = Object.entries(score.byCategory)
    .map(([cat, b]) => {
      const catPct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0
      return `  ${cat}: ${b.correct}/${b.total} (${catPct}%)`
    })
    .join('\n')

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: fromEmail,
    to: recruiterEmail,
    subject: `Assessment complete: ${candidateName}`,
    text: [
      `${candidateName} has completed their skills assessment.`,
      '',
      `Overall score: ${score.correct}/${score.total} (${pct}%)`,
      '',
      'By category:',
      categoryLines,
    ].join('\n'),
  })
}

