export type QuestionCategory =
  | 'CSharp'
  | 'DotNet'
  | 'SQL'
  | 'JavaScript'
  | 'TypeScript'
  | 'Angular'
  | 'Vue'
  | 'React'
  | 'NodeJS'
  | 'HTML'
  | 'CSS'

export type QuestionDifficulty = 1 | 2 | 3 | 4 | 5

/** @deprecated Legacy tests stored easy/medium/hard per question before the 1–5 scale. */
export type LegacyQuestionDifficulty = 'easy' | 'medium' | 'hard'

export type StoredQuestionDifficulty = QuestionDifficulty | LegacyQuestionDifficulty

export type QuestionType = 'multiple-choice' | 'short-answer'
