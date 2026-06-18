import type { QuestionCategory } from '../types/question'

export const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  CSharp: 'C# Language',
  DotNet: '.NET / ASP.NET Core',
  SQL: 'SQL & Databases',
  JavaScript: 'JavaScript',
  TypeScript: 'TypeScript',
  Angular: 'Angular',
  Vue: 'Vue.js',
  React: 'React',
  NodeJS: 'Node.js',
  HTML: 'HTML',
  CSS: 'CSS',
}

export function formatCategoryLabel(category: string): string {
  return CATEGORY_LABEL[category as QuestionCategory] ?? category
}
