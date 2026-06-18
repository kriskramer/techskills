export const ASSESSMENT_CATEGORIES = [
  { id: 'CSharp', label: 'C# Language', description: 'C# language features, OOP, LINQ, async/await, generics, etc.' },
  { id: 'DotNet', label: '.NET / ASP.NET Core', description: 'ASP.NET Core, Entity Framework, Web API, DI, middleware, NuGet, .NET CLI, etc.' },
  { id: 'SQL', label: 'SQL & Databases', description: 'SQL Server, T-SQL, queries, joins, stored procedures, indexes, transactions, etc.' },
  { id: 'JavaScript', label: 'JavaScript', description: 'JS language features, ES6+, DOM, closures, promises, prototypes, etc.' },
  { id: 'TypeScript', label: 'TypeScript', description: 'TypeScript types, generics, decorators, strict mode, utility types, etc.' },
  { id: 'Angular', label: 'Angular', description: 'Angular framework, components, services, RxJS, routing, directives, forms, etc.' },
  { id: 'Vue', label: 'Vue.js', description: 'Vue.js framework, Composition API, Options API, Vuex, Vue Router, directives, etc.' },
  { id: 'React', label: 'React', description: 'React library, hooks, JSX, context, state management, Next.js, etc.' },
  { id: 'NodeJS', label: 'Node.js', description: 'Node.js runtime, Express, streams, npm packages, server-side JS, etc.' },
  { id: 'HTML', label: 'HTML', description: 'HTML5 semantics, forms, accessibility, meta tags, document structure, etc.' },
  { id: 'CSS', label: 'CSS', description: 'CSS selectors, flexbox, grid, responsive design, specificity, animations, etc.' },
] as const

export type QuestionCategory = (typeof ASSESSMENT_CATEGORIES)[number]['id']

export const CATEGORY_IDS = ASSESSMENT_CATEGORIES.map((category) => category.id) as [
  QuestionCategory,
  ...QuestionCategory[],
]

export function buildCategoryPromptLines(): string {
  return ASSESSMENT_CATEGORIES.map((category) => `  - "${category.id}" (${category.description})`).join('\n')
}

export function buildAssessmentScopeSummary(): string {
  return ASSESSMENT_CATEGORIES.map((category) => category.label).join(', ')
}
