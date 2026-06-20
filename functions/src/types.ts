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

/** 1 = easiest, 5 = hardest */
export type QuestionDifficulty = 1 | 2 | 3 | 4 | 5

export type QuestionType = 'multiple-choice' | 'short-answer'
