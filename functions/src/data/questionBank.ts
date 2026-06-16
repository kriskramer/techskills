import type { QuestionCategory, QuestionDifficulty, QuestionType } from '../types'

// Maps difficulty to the per-question countdown shown to the candidate.
export const TIME_LIMIT_BY_DIFFICULTY: Record<QuestionDifficulty, number> = {
  easy: 15,
  medium: 20,
  hard: 30,
}

export interface QuestionBankEntry {
  id: string
  category: QuestionCategory
  prompt: string
  type: QuestionType
  options: string[] | null
  difficulty: QuestionDifficulty
  correctAnswer: string
}

// NOTE: This is a small placeholder seed set (~18 questions) that proves the
// generateTestProfile pipeline end-to-end. PROJECT_OVERVIEW.md describes a
// goal of a 200-question bank with 50-75 questions per generated test —
// migrate this to a Firestore-backed collection when that's built out.
export const QUESTION_BANK: QuestionBankEntry[] = [
  // --- Frontend ---
  {
    id: 'fe-react-hooks',
    category: 'Frontend',
    prompt: 'Which React hook is used to run side effects after a component renders?',
    type: 'multiple-choice',
    options: ['useEffect', 'useState', 'useMemo', 'useRef'],
    difficulty: 'easy',
    correctAnswer: 'useEffect',
  },
  {
    id: 'fe-css-flexbox',
    category: 'Frontend',
    prompt: 'In CSS Flexbox, which property aligns items along the cross axis?',
    type: 'multiple-choice',
    options: ['align-items', 'justify-content', 'flex-direction', 'gap'],
    difficulty: 'easy',
    correctAnswer: 'align-items',
  },
  {
    id: 'fe-html-semantic-nav',
    category: 'Frontend',
    prompt: "What HTML element is used to define a section of navigation links (e.g. a site's main menu)?",
    type: 'short-answer',
    options: null,
    difficulty: 'easy',
    correctAnswer: 'nav',
  },
  {
    id: 'fe-js-strict-equality',
    category: 'Frontend',
    prompt: 'What does the `===` operator check in JavaScript that `==` does not?',
    type: 'multiple-choice',
    options: [
      'Variable type in addition to value',
      'Object reference equality',
      'Whether both operands are functions',
      'Array length equality',
    ],
    difficulty: 'medium',
    correctAnswer: 'Variable type in addition to value',
  },
  {
    id: 'fe-ts-type-guards',
    category: 'Frontend',
    prompt:
      "Which TypeScript feature lets you narrow a union type based on a runtime check, such as `typeof x === 'string'`?",
    type: 'multiple-choice',
    options: ['Type guards', 'Generics', 'Decorators', 'Type assertions'],
    difficulty: 'medium',
    correctAnswer: 'Type guards',
  },
  {
    id: 'fe-react-state-updater',
    category: 'Frontend',
    prompt:
      "In React, what is the recommended way to update state that depends on the previous state value (e.g. a counter)?",
    type: 'multiple-choice',
    options: [
      'Pass a function to the state setter, e.g. setCount(c => c + 1)',
      'Mutate the state variable directly',
      'Call the setter twice in a row',
      'Store the value in a global variable instead',
    ],
    difficulty: 'hard',
    correctAnswer: 'Pass a function to the state setter, e.g. setCount(c => c + 1)',
  },

  // --- Backend ---
  {
    id: 'be-http-status-created',
    category: 'Backend',
    prompt: 'Which HTTP status code indicates a request succeeded and created a new resource?',
    type: 'multiple-choice',
    options: ['201', '200', '204', '302'],
    difficulty: 'easy',
    correctAnswer: '201',
  },
  {
    id: 'be-express-middleware-next',
    category: 'Backend',
    prompt:
      'In an Express.js middleware function, what is the name of the callback parameter that must be called to pass control to the next handler?',
    type: 'short-answer',
    options: null,
    difficulty: 'easy',
    correctAnswer: 'next',
  },
  {
    id: 'be-node-event-loop',
    category: 'Backend',
    prompt: "What is the term for Node.js's mechanism that handles asynchronous, non-blocking operations on a single thread?",
    type: 'multiple-choice',
    options: ['Event loop', 'Thread pool', 'Garbage collector', 'Call stack'],
    difficulty: 'medium',
    correctAnswer: 'Event loop',
  },
  {
    id: 'be-rest-idempotent-method',
    category: 'Backend',
    prompt:
      'Which HTTP method is idempotent, meaning sending the same request multiple times has the same effect as sending it once?',
    type: 'multiple-choice',
    options: ['PUT', 'POST', 'CONNECT', 'TRACE'],
    difficulty: 'medium',
    correctAnswer: 'PUT',
  },
  {
    id: 'be-sql-inner-join',
    category: 'Backend',
    prompt: 'Which SQL join returns only rows that have matching values in both tables?',
    type: 'multiple-choice',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    difficulty: 'medium',
    correctAnswer: 'INNER JOIN',
  },
  {
    id: 'be-transaction-atomicity',
    category: 'Backend',
    prompt:
      'Which ACID property guarantees that a database transaction either completes fully or has no effect at all?',
    type: 'multiple-choice',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    difficulty: 'hard',
    correctAnswer: 'Atomicity',
  },

  // --- DevOps ---
  {
    id: 'do-dockerfile',
    category: 'DevOps',
    prompt: 'What file is used to define the steps for building a Docker image?',
    type: 'multiple-choice',
    options: ['Dockerfile', 'docker-compose.yml', 'Makefile', '.dockerignore'],
    difficulty: 'easy',
    correctAnswer: 'Dockerfile',
  },
  {
    id: 'do-continuous-integration',
    category: 'DevOps',
    prompt:
      'What two-word term describes the practice of automatically building and testing code changes as they are merged frequently?',
    type: 'short-answer',
    options: null,
    difficulty: 'easy',
    correctAnswer: 'continuous integration',
  },
  {
    id: 'do-kubernetes-pod',
    category: 'DevOps',
    prompt: 'In Kubernetes, what is the smallest deployable unit that can contain one or more containers?',
    type: 'multiple-choice',
    options: ['Pod', 'Node', 'Service', 'Deployment'],
    difficulty: 'medium',
    correctAnswer: 'Pod',
  },
  {
    id: 'do-env-file',
    category: 'DevOps',
    prompt:
      'What is the conventional filename for storing local environment variables that should NOT be committed to version control?',
    type: 'short-answer',
    options: null,
    difficulty: 'medium',
    correctAnswer: '.env',
  },
  {
    id: 'do-load-balancer-purpose',
    category: 'DevOps',
    prompt: 'What is the primary purpose of a load balancer in a distributed system?',
    type: 'multiple-choice',
    options: [
      'Distribute incoming traffic across multiple servers',
      'Encrypt data at rest',
      'Compile application source code',
      'Manage database schema migrations',
    ],
    difficulty: 'medium',
    correctAnswer: 'Distribute incoming traffic across multiple servers',
  },
  {
    id: 'do-infrastructure-as-code',
    category: 'DevOps',
    prompt:
      'What term describes managing and provisioning infrastructure through machine-readable configuration files instead of manual processes?',
    type: 'multiple-choice',
    options: ['Infrastructure as Code', 'Platform as a Service', 'Configuration drift', 'Container orchestration'],
    difficulty: 'hard',
    correctAnswer: 'Infrastructure as Code',
  },
]
