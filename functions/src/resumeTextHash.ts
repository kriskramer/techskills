import { createHash } from 'node:crypto'

export function hashResumeText(resumeText: string): string {
  const normalized = resumeText.trim().replace(/\r\n/g, '\n')
  return createHash('sha256').update(normalized, 'utf8').digest('hex')
}
