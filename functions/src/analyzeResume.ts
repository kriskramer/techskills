import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { SkillsProfileSchema } from './schemas/skillsProfile'

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY')

interface AnalyzeResumeRequest {
  candidateId: string
}

export const analyzeResume = onCall<AnalyzeResumeRequest>(
  { secrets: [anthropicApiKey] },
  async (request) => {
    const { candidateId } = request.data

    if (!candidateId || typeof candidateId !== 'string') {
      throw new HttpsError('invalid-argument', 'candidateId is required.')
    }

    const db = getFirestore()
    const candidateRef = db.collection('candidates').doc(candidateId)
    const snapshot = await candidateRef.get()

    if (!snapshot.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }

    const resumeText = snapshot.data()?.resumeText as string | undefined
    if (!resumeText?.trim()) {
      throw new HttpsError('failed-precondition', 'Candidate has no resume text to analyze.')
    }

    const client = new Anthropic({ apiKey: anthropicApiKey.value() })

    const response = await client.messages.parse({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: `You are analyzing a candidate's resume to build a skills profile for a C#/.NET/SQL technical hiring assessment.

Write a 2-3 sentence summary of the candidate's overall background, then list each distinct C#, .NET, or SQL-related skill you can identify. For each skill:
- Classify it into exactly one category: "CSharp" (C# language features, OOP, LINQ, async/await, generics, etc.), "DotNet" (ASP.NET Core, Entity Framework, Web API, DI, middleware, NuGet, .NET CLI, etc.), or "SQL" (SQL Server, T-SQL, queries, joins, stored procedures, indexes, transactions, etc.).
- Estimate the candidate's proficiency level as "beginner", "intermediate", "advanced", or "expert" based on the evidence in the resume.
- Provide a short quote or summary of the resume text that supports this assessment.
- Assign a frequencyScore from 1 to 5 indicating how prominently this skill appears across the resume: 1 = mentioned once in passing, 3 = appears in multiple roles or projects, 5 = a central, recurring theme throughout the resume.
- Assign a recencyScore from 1 to 5 indicating how recently this skill was used: 5 = current role or within the last year, 4 = within the last 2-3 years, 3 = within the last 5 years, 2 = more than 5 years ago, 1 = more than 10 years ago or the resume gives no date context.

Only include skills relevant to C#, .NET, and SQL — omit unrelated technologies unless they are deeply integrated with the .NET ecosystem.

Resume:
${resumeText}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(SkillsProfileSchema),
      },
    })

    const skillsProfile = response.parsed_output
    if (!skillsProfile) {
      throw new HttpsError('internal', 'Claude did not return a parsable skills profile.')
    }

    await candidateRef.update({
      skillsProfile,
      status: 'analyzed',
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { skillsProfile }
  },
)
