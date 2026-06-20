import { useRef, useState, type ChangeEvent } from 'react'
import { extractResumeFromUpload, readTextResumeFile } from '../../services/resumeUpload'

const ACCEPT = '.txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

interface ResumeFileUploadProps {
  onTextExtracted: (text: string) => void
  disabled?: boolean
}

export function ResumeFileUpload({ onTextExtracted, disabled }: ResumeFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setIsProcessing(true)

    try {
      const lowerName = file.name.toLowerCase()
      if (lowerName.endsWith('.txt') || file.type === 'text/plain') {
        onTextExtracted(await readTextResumeFile(file))
      } else if (lowerName.endsWith('.pdf') || lowerName.endsWith('.docx')) {
        onTextExtracted(await extractResumeFromUpload(file))
      } else {
        setError('Upload a .txt, .pdf, or .docx file.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this file.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled || isProcessing}
        onChange={(event) => void handleFileChange(event)}
      />
      <button
        type="button"
        disabled={disabled || isProcessing}
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:opacity-50"
      >
        {isProcessing ? 'Extracting text…' : 'Upload resume file'}
      </button>
      <p className="text-xs text-slate-500">Supports .txt, .pdf, and .docx</p>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  )
}
