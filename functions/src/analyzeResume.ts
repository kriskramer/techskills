import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { normalizeSkillsProfile, SkillsProfileOutputSchema } from './schemas/skillsProfile'
import { buildAssessmentScopeSummary, buildCategoryPromptLines } from './data/assessmentCategories'
import { enrichSkillsProfile } from './resumeSkillDetection'
import { assertCandidateAccess, requireAuth } from './authHelpers'
import { hashResumeText } from './resumeTextHash'
import { logClaudeUsage } from './usageLogging'

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY')

const DEFAULT_RESUME_MODEL = 'claude-sonnet-4-6'

function resumeAnalysisModel(): string {
  return process.env.RESUME_ANALYSIS_MODEL?.trim() || DEFAULT_RESUME_MODEL
}

function buildAnalysisInstructions(): string {
  return `You are analyzing a candidate's resume to build a skills profile for a technical hiring assessment covering ${buildAssessmentScopeSummary()}.

Write a 2-3 sentence summary of the candidate's overall background, then list each distinct technical skill you can identify. For each skill:
- Classify it into exactly one category:
${buildCategoryPromptLines()}
- If the resume mentions Angular, Vue.js, React, TypeScript, HTML, or CSS specifically, classify those under their matching category above — do not lump them into JavaScript unless only generic JS is mentioned.
- Include at least one skill entry for every category above that appears anywhere in the resume text.
- Estimate the candidate's proficiency level as "beginner", "intermediate", "advanced", or "expert" based on the evidence in the resume.
- Provide a short quote or summary of the resume text that supports this assessment.
- Assign frequencyScore (required integer 1-5) indicating how prominently this skill appears across the resume: 1 = mentioned once in passing, 3 = appears in multiple roles or projects, 5 = a central, recurring theme throughout the resume.
- Assign recencyScore (required integer 1-5) indicating how recently this skill was used: 5 = current role or within the last year, 4 = within the last 2-3 years, 3 = within the last 5 years, 2 = more than 5 years ago, 1 = more than 10 years ago or the resume gives no date context.

Only include skills relevant to the categories listed above — omit unrelated technologies.`
}

interface AnalyzeResumeRequest {
  candidateId: string
  force?: boolean
}

export const analyzeResume = onCall<AnalyzeResumeRequest>(
  { secrets: [anthropicApiKey] },
  async (request) => {
    requireAuth(request)

    const { candidateId, force = false } = request.data

    if (!candidateId || typeof candidateId !== 'string') {
      throw new HttpsError('invalid-argument', 'candidateId is required.')
    }

    const db = getFirestore()
    const candidateRef = db.collection('candidates').doc(candidateId)
    const snapshot = await candidateRef.get()

    if (!snapshot.exists) {
      throw new HttpsError('not-found', `Candidate ${candidateId} not found.`)
    }

    const candidateData = snapshot.data()!
    assertCandidateAccess(request, candidateData)

    const resumeText = candidateData.resumeText as string | undefined
    if (!resumeText?.trim()) {
      throw new HttpsError('failed-precondition', 'Candidate has no resume text to analyze.')
    }

    const currentHash = hashResumeText(resumeText)
    const storedHash = candidateData.resumeTextHash as string | undefined
    const existingProfile = candidateData.skillsProfile

    if (!force && existingProfile && storedHash === currentHash && !candidateData.analysisError) {
      return { skillsProfile: existingProfile, cached: true }
    }

    const model = resumeAnalysisModel()
    const client = new Anthropic({ apiKey: anthropicApiKey.value() })
    const instructions = buildAnalysisInstructions()

    try {
      const response = await client.messages.parse({
        model,
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: instructions,
                cache_control: { type: 'ephemeral' },
              },
              {
                type: 'text',
                text: `Resume:\n${resumeText}`,
              },
            ],
          },
        ],
        output_config: {
          format: zodOutputFormat(SkillsProfileOutputSchema),
        },
      })

      const parsedProfile = response.parsed_output
      if (!parsedProfile) {
        throw new HttpsError('internal', 'Claude did not return a parsable skills profile.')
      }

      const enrichedProfile = enrichSkillsProfile(normalizeSkillsProfile(parsedProfile), resumeText)

      await candidateRef.update({
        skillsProfile: enrichedProfile,
        resumeTextHash: currentHash,
        status: 'analyzed',
        analysisError: null,
        updatedAt: FieldValue.serverTimestamp(),
      })

      const usage = response.usage
      await logClaudeUsage({
        type: 'claude_analyze_resume',
        candidateId,
        createdBy: candidateData.createdBy as string | undefined,
        model,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheCreationInputTokens: usage.cache_creation_input_tokens ?? undefined,
        cacheReadInputTokens: usage.cache_read_input_tokens ?? undefined,
        cached: false,
      })

      return { skillsProfile: enrichedProfile, cached: false }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Resume analysis failed.'

      if (!(err instanceof HttpsError) || err.code === 'internal') {
        await candidateRef.update({
          analysisError: message,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }

      if (err instanceof HttpsError) {
        throw err
      }

      throw new HttpsError('internal', message)
    }
  },
)
