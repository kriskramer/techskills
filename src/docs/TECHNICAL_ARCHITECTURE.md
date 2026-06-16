# TECHNICAL ARCHITECTURE: PracticalSkills Website

**Technology Stack & Firebase-First Approach**

---

## Table of Contents

1. [Frontend Framework & Stack](#frontend-framework--stack)
2. [Backend & Firebase Architecture](#backend--firebase-architecture)
3. [Database Design (Firestore)](#database-design-firestore)
4. [File Storage & Resume Processing](#file-storage--resume-processing)
5. [Real-Time Features (Timer)](#real-time-features-timer)
6. [Authentication & Security](#authentication--security)
7. [Deployment & Hosting](#deployment--hosting)
8. [Overall Architecture Diagram](#overall-architecture-diagram)
9. [Development Workflow](#development-workflow)
10. [Cost Analysis](#cost-analysis)

---

## Frontend Framework & Stack

### Recommended: React + TypeScript + Tailwind CSS

**Why React over Vue:**
- Better ecosystem for Firebase integration
- More Firebase libraries and examples available
- Larger community for problem-solving
- Better job market (if you hire)
- Slightly better performance for real-time apps

**Tech Stack Details:**

```
Frontend:
├── React 18+ (UI framework)
├── TypeScript (type safety)
├── Firebase SDK (client library)
├── Zustand (lightweight state management) OR Redux (if more complex)
├── Tailwind CSS + Headless UI (styling)
├── React Router (navigation)
├── React Hook Form (form handling)
├── TanStack Query (data fetching, caching)
└── Axios or native Fetch (HTTP client)

Development:
├── Vite (build tool - much faster than CRA)
├── ESLint + Prettier (code quality)
├── Vitest (unit testing)
└── Playwright (e2e testing)

Deployment:
└── Firebase Hosting (zero-config, fast)
```

### Project Structure

```
practical-skills/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── client/
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── SkillsAnalysis.tsx
│   │   │   ├── TestProfileBuilder.tsx
│   │   │   └── ResultsView.tsx
│   │   ├── candidate/
│   │   │   ├── TestInterface.tsx
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── Timer.tsx
│   │   │   └── ResultsPage.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── ClientDashboard.tsx
│   │   ├── CandidateDashboard.tsx
│   │   ├── TestPage.tsx
│   │   ├── ResultsPage.tsx
│   │   └── Landing.tsx
│   ├── hooks/
│   │   ├── useAuth.ts (Firebase auth)
│   │   ├── useFirestore.ts (Firestore CRUD)
│   │   ├── useResumeAnalysis.ts
│   │   └── useTestSession.ts
│   ├── services/
│   │   ├── firebase.ts (Firebase config & init)
│   │   ├── auth.ts (auth functions)
│   │   ├── firestore.ts (database functions)
│   │   ├── storage.ts (file storage)
│   │   └── functions.ts (Cloud Functions calls)
│   ├── types/
│   │   ├── index.ts (TypeScript interfaces)
│   │   ├── models.ts
│   │   └── api.ts
│   ├── store/
│   │   ├── authStore.ts (Zustand store for auth)
│   │   ├── testStore.ts (test state management)
│   │   └── uiStore.ts (UI state)
│   ├── utils/
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── functions/
│   ├── src/
│   │   ├── index.ts (Cloud Functions entry point)
│   │   ├── resumeAnalysis.ts (NLP processing)
│   │   ├── testGeneration.ts (test profile creation)
│   │   ├── scoring.ts (answer validation & scoring)
│   │   └── emailSender.ts (send invitations)
│   ├── package.json
│   └── tsconfig.json
├── .env.local (Firebase config, secrets)
├── firebase.json (deployment config)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Backend & Firebase Architecture

### Firebase Services Used

**1. Firebase Authentication**
```
- Email/password auth for recruiters and candidates
- Optional: Google OAuth for easier signup
- Role-based access control (custom claims)
  - recruiter: can upload resumes, create tests
  - candidate: can take tests
  - admin: full access
```

**2. Firestore Database**
```
- Primary database for all structured data
- Real-time subscriptions for live updates
- Security rules to enforce access control
- Collections:
  - users
  - candidates
  - skills (taxonomy)
  - test_profiles
  - tests
  - answers
  - questions
```

**3. Cloud Storage**
```
- Store uploaded resumes (PDF/DOCX)
- Path: /resumes/{userId}/{candidateId}/{filename}
- Automatic cleanup (delete after 30 days if test not taken)
```

**4. Cloud Functions**
```
- Serverless backend for heavy lifting
- Functions needed:
  - analyzeResume (triggered by upload)
  - generateTestProfile (callable)
  - submitAnswer (callable)
  - calculateScore (triggered by test completion)
  - sendInvitation (callable)
```

**5. Firebase Hosting**
```
- Deploy React app with zero config
- CDN-backed, fast globally
- Automatic HTTPS and SSL
- Built-in analytics
```

**6. Optional: Firestore Extensions**
```
- Delete User Data extension (privacy compliance)
- SendGrid extension (email sending for invitations)
- Translation API extension (future: multi-language)
```

### Cloud Functions Architecture

**Resume Analysis Function:**
```typescript
// functions/src/resumeAnalysis.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import language from "@google-cloud/language";

export const analyzeResume = functions.storage
  .object()
  .onFinalize(async (object) => {
    // 1. Extract text from PDF/DOCX using Google Cloud Vision or pdf library
    // 2. Parse text with NLP (Google Cloud NLP, spaCy, or custom)
    // 3. Extract skills using entity recognition
    // 4. Calculate recency and frequency scores
    // 5. Store results in Firestore
    // 6. Trigger test profile generation
  });
```

**Test Generation Function:**
```typescript
// functions/src/testGeneration.ts
export const generateTestProfile = functions.https.onCall(
  async (data, context) => {
    // 1. Get candidate skills from Firestore
    // 2. Map to question categories
    // 3. Select random questions from each category
    // 4. Create test_profile document
    // 5. Return test profile for display
  }
);
```

**Answer Submission Function:**
```typescript
// functions/src/scoring.ts
export const submitAnswer = functions.https.onCall(
  async (data, context) => {
    // 1. Get answer from request
    // 2. Get correct answer from questions collection
    // 3. Validate answer (exact match, case-insensitive)
    // 4. Store answer with metadata (time taken, is_correct, confidence)
    // 5. If test complete, trigger scoring
  }
);
```

**Email Invitation Function:**
```typescript
// functions/src/emailSender.ts
export const sendInvitation = functions.https.onCall(
  async (data, context) => {
    // 1. Get candidate email and test profile
    // 2. Generate unique test token
    // 3. Create test record in Firestore
    // 4. Send email with test link
    // 5. Return success status
  }
);
```

### Why Cloud Functions vs Express Server?

**Advantages of Cloud Functions:**
- No server management (serverless)
- Automatic scaling
- Pay only for execution time
- Easy integration with Firestore (direct access)
- Authentication built-in
- No deployment complexity

**Disadvantages:**
- Cold starts (300-500ms on first execution)
- Limited to 540 second timeout
- Vendor lock-in (Google Cloud)

**For this project:** Cloud Functions are perfect because:
- Most operations are lightweight (<30 seconds)
- No long-running processes
- Resume analysis can be async (doesn't block user)
- Direct Firestore integration is clean

---

## Database Design (Firestore)

### Collections & Data Model

```typescript
// Collections structure

// users collection
{
  id: "user123",
  email: "recruiter@company.com",
  firstName: "Jane",
  lastName: "Doe",
  companyName: "TechCorp",
  role: "recruiter", // or "candidate" or "admin"
  createdAt: timestamp,
  updatedAt: timestamp,
  subscriptionPlan: "professional", // starter, professional, enterprise
  stripeCustomerId: "cus_xxx" // for payment tracking
}

// candidates subcollection (under users/{userId})
{
  id: "cand456",
  email: "candidate@email.com",
  firstName: "John",
  lastName: "Smith",
  resumeText: "...", // extracted text
  resumeStoragePath: "gs://bucket/resumes/user123/cand456/resume.pdf",
  skillsExtracted: {
    "c#": { score: 95, mentions: 5, lastUsed: timestamp, category: "language" },
    "vue.js": { score: 90, mentions: 3, lastUsed: timestamp, category: "framework" },
    "docker": { score: 75, mentions: 2, lastUsed: timestamp, category: "tool" }
  },
  createdAt: timestamp,
  createdBy: "user123"
}

// test_profiles subcollection (under candidates/{candidateId})
{
  id: "profile789",
  candidateId: "cand456",
  createdBy: "user123",
  skillsIncluded: {
    "c#": { weight: 0.42, questionCount: 25, difficulty: "intermediate" },
    "vue.js": { weight: 0.20, questionCount: 12, difficulty: "intermediate" },
    "docker": { weight: 0.15, questionCount: 9, difficulty: "beginner" }
  },
  totalQuestions: 46,
  estimatedDurationMinutes: 45,
  timePerQuestionSeconds: 30,
  status: "published", // draft, published, archived
  customizations: {
    includeDifficulty: ["beginner", "intermediate"],
    manuallyAddedSkills: ["REST APIs"],
    excludedSkills: ["Legacy ASP"]
  },
  createdAt: timestamp,
  updatedAt: timestamp
}

// tests (assessment instances)
{
  id: "test999",
  testProfileId: "profile789",
  candidateId: "cand456",
  createdBy: "user123",
  invitationToken: "unique_token_xyz", // used in URL
  status: "completed", // invited, started, completed, expired
  invitationSentAt: timestamp,
  startedAt: timestamp,
  completedAt: timestamp,
  expiresAt: timestamp,
  score: 72.5,
  metadata: {
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla...",
    completionTime: 2847, // seconds
    questionsAttempted: 46,
    questionsSkipped: 0
  }
}

// answers subcollection (under tests/{testId})
{
  id: "answer001",
  questionId: "q123",
  questionText: "What is the format of web.config?",
  candidateAnswer: "xml",
  correctAnswer: "xml",
  isCorrect: true,
  timeToAnswer: 8, // seconds
  confidenceScore: 0.95, // based on speed
  skillTested: "c#",
  createdAt: timestamp
}

// questions collection (global, shared)
{
  id: "q123",
  skillId: "skill_csharp",
  questionText: "What is the format of web.config?",
  questionType: "text", // text, multiple_choice, code_snippet
  correctAnswer: "xml",
  acceptableAnswers: ["xml", "XML", "Extensible Markup Language"],
  difficulty: "beginner",
  category: "tool_knowledge",
  language: "csharp",
  qualityScore: 4.8, // out of 5
  usageCount: 234,
  correctPercentage: 87.2,
  avgTimeToAnswer: 12,
  createdAt: timestamp,
  createdBy: "admin",
  tags: ["configuration", "visual-studio", "dotnet"]
}

// skills collection (taxonomy)
{
  id: "skill_csharp",
  name: "C#",
  category: "programming_language",
  synonyms: ["csharp", "c sharp", "C Sharp"],
  description: "Object-oriented programming language",
  ecosystemUrl: "https://docs.microsoft.com/dotnet/csharp/",
  frequencyWeight: 1.0,
  technologies: ["dotnet", "unity", "xamarin"]
}

// Settings/config (single document)
{
  id: "config",
  questionBankSize: 2100,
  lastQuestionBankUpdate: timestamp,
  supportedSkills: ["c#", "vue.js", "python", "javascript"],
  supportedLanguages: ["en"],
  pricingPlans: {
    starter: { monthlyPrice: 99, assessmentsPerMonth: 10 },
    professional: { monthlyPrice: 299, assessmentsPerMonth: 50 }
  }
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Authentication check
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Role check
    function hasRole(role) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Candidates subcollection
      match /candidates/{candidateId} {
        allow read, write: if request.auth.uid == userId;
        
        // Test profiles subcollection
        match /test_profiles/{profileId} {
          allow read, write: if request.auth.uid == userId;
        }
      }
    }
    
    // Tests (candidates can read their own, recruiters can read those they created)
    match /tests/{testId} {
      allow read: if 
        request.auth.uid == resource.data.candidateId ||
        request.auth.uid == resource.data.createdBy;
      allow write: if request.auth.uid == resource.data.createdBy;
      
      // Answers subcollection
      match /answers/{answerId} {
        allow read, write: if 
          request.auth.uid == get(/databases/$(database)/documents/tests/$(testId)).data.candidateId;
      }
    }
    
    // Public read for questions (candidates take tests)
    match /questions/{questionId} {
      allow read: if isAuthenticated();
    }
    
    // Public read for skills taxonomy
    match /skills/{skillId} {
      allow read: if isAuthenticated();
    }
  }
}
```

---

## File Storage & Resume Processing

### Cloud Storage Strategy

```
Bucket structure:
gs://practical-skills-bucket/
├── resumes/
│   └── {userId}/
│       └── {candidateId}/
│           ├── resume.pdf
│           ├── resume_text.json (extracted text)
│           └── skills_extracted.json (parsed skills)
├── reports/
│   └── {userId}/
│       └── {testId}/
│           └── results.pdf
└── temp/
    └── {uploadSessionId}/
        └── partial_resume.pdf (for cleanup)
```

### Resume Processing Pipeline

**Step 1: Upload to Cloud Storage**
```typescript
// Frontend: Upload resume to Cloud Storage
const uploadResume = async (file: File, candidateId: string) => {
  const storage = firebase.storage();
  const path = `resumes/${currentUserId}/${candidateId}/${file.name}`;
  const ref = storage.ref(path);
  
  const uploadTask = ref.put(file);
  uploadTask.on('state_changed',
    (snapshot) => {
      // Track upload progress
      setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    },
    (error) => console.error(error),
    async () => {
      // Upload complete, Cloud Function triggers automatically
      setUploadStatus('Processing resume...');
    }
  );
};
```

**Step 2: Cloud Function Processes Resume**
```typescript
// functions/src/resumeAnalysis.ts
import PDFParser from "pdf-parse";
import * as admin from "firebase-admin";
import language from "@google-cloud/language";

export const analyzeResume = functions.storage
  .object()
  .onFinalize(async (object) => {
    try {
      // Extract path info
      const filePath = object.name; // "resumes/user123/cand456/resume.pdf"
      const [, userId, candidateId] = filePath.split('/');
      
      // Download file from Cloud Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);
      const [fileBuffer] = await file.download();
      
      // Extract text from PDF/DOCX
      const extractedText = await extractTextFromFile(fileBuffer, object.contentType);
      
      // Use Google Cloud NLP for entity recognition
      const client = new language.LanguageServiceClient();
      const document = {
        content: extractedText,
        type: 'PLAIN_TEXT',
        language: 'en',
      };
      
      const response = await client.analyzeEntities({ document });
      const entities = response[0].entities;
      
      // Extract skills using custom mapping
      const skillsExtracted = extractSkillsFromEntities(entities, extractedText);
      
      // Parse resume for dates and roles
      const jobHistory = parseJobHistory(extractedText);
      
      // Combine into skills profile with recency/frequency scoring
      const skillsProfile = enrichSkillsWithScores(skillsExtracted, jobHistory);
      
      // Store results
      const db = admin.firestore();
      await db.collection('users').doc(userId)
        .collection('candidates').doc(candidateId)
        .update({
          resumeText: extractedText,
          skillsExtracted: skillsProfile,
          resumeAnalyzedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      
      // Store raw analysis for debugging
      await bucket.file(`resumes/${userId}/${candidateId}/analysis.json`)
        .save(JSON.stringify({
          extractedText,
          skillsProfile,
          timestamp: new Date().toISOString()
        }));
        
    } catch (error) {
      console.error('Resume analysis failed:', error);
      // Store error for user notification
    }
  });
```

**Step 3: Skills Extraction Helper**
```typescript
// Extract and score skills from resume text
const extractSkillsFromEntities = (
  entities: any[],
  resumeText: string
): Record<string, SkillScore> => {
  const skillTaxonomy = {
    'c#': { category: 'language', synonyms: ['csharp', 'c sharp'] },
    'vue.js': { category: 'framework', synonyms: ['vue', 'vuejs'] },
    'docker': { category: 'tool', synonyms: [] },
    // ... more skills
  };
  
  const skillsFound: Record<string, SkillScore> = {};
  
  // Count mentions of each skill
  for (const [skill, meta] of Object.entries(skillTaxonomy)) {
    const patterns = [skill, ...meta.synonyms];
    const regex = new RegExp(patterns.join('|'), 'gi');
    const mentions = resumeText.match(regex)?.length || 0;
    
    if (mentions > 0) {
      skillsFound[skill] = {
        mentions,
        category: meta.category,
        // Score calculation: recency + frequency
        score: calculateSkillScore(mentions, lastMentioned)
      };
    }
  }
  
  return skillsFound;
};
```

### File Cleanup Strategy

```typescript
// Schedule cleanup of old resumes (Cloud Task or Cloud Scheduler)
export const cleanupOldResumes = functions.pubsub
  .schedule('every day 02:00')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();
    const storage = admin.storage();
    
    // Find candidates with resume not accessed in 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const oldCandidates = await db.collectionGroup('candidates')
      .where('resumeAnalyzedAt', '<', thirtyDaysAgo)
      .where('testStatus', 'in', ['expired', 'abandoned'])
      .get();
    
    // Delete storage files
    for (const doc of oldCandidates.docs) {
      const resumePath = doc.data().resumeStoragePath;
      await storage.bucket().file(resumePath).delete();
    }
  });
```

---

## Real-Time Features (Timer)

### Implementing the 30-Second Timer

**Challenge:** Keep timer synchronized across client and server

**Solution:** Use Firestore timestamps + client-side countdown

```typescript
// Frontend: Timer component with server-side sync
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface TimerProps {
  testId: string;
  initialSeconds: number;
  onTimeUp: () => void;
}

export const Timer = ({ testId, initialSeconds, onTimeUp }: TimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    // Subscribe to test document for server time
    const unsubscribe = onSnapshot(
      doc(db, 'tests', testId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const serverTime = data.currentQuestionStartTime?.toDate() || new Date();
          const questionStartTime = new Date(serverTime).getTime();
          
          // Calculate remaining time based on server timestamp
          const elapsed = (Date.now() - questionStartTime) / 1000;
          const remaining = Math.max(0, initialSeconds - Math.ceil(elapsed));
          
          setSecondsLeft(remaining);
          setIsWarning(remaining <= 5);
          
          if (remaining === 0) {
            onTimeUp();
          }
        }
      }
    );
    
    // Local countdown timer for smooth UI
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const newValue = Math.max(0, prev - 1);
        if (newValue === 0) {
          onTimeUp();
          clearInterval(interval);
        }
        return newValue;
      });
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [testId, initialSeconds, onTimeUp]);
  
  return (
    <div className={`timer ${isWarning ? 'warning' : ''}`}>
      <span className="text-2xl font-bold">{secondsLeft}s</span>
      <audio autoPlay loop volume={isWarning ? 1 : 0}>
        <source src="/sounds/warning.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};
```

**Why this approach:**
1. **Server timestamp** prevents client-side manipulation (can't cheat by changing system clock)
2. **Local countdown** keeps UI responsive (no network lag)
3. **Automatic sync** catches if client and server drift
4. **Warning sound** at 5 seconds (audio cue)

---

## Authentication & Security

### Firebase Authentication Setup

```typescript
// services/auth.ts
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';

const auth = initializeAuth();

// Sign up new recruiter
export const signUpRecruiter = async (email: string, password: string, companyName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Set custom claims (done by Cloud Function for security)
  // Actually, set in client-side Firestore for immediate use
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    companyName,
    role: 'recruiter',
    createdAt: serverTimestamp(),
    subscriptionPlan: 'starter',
    stripeCustomerId: null
  });
  
  return userCredential.user;
};

// Sign in
export const signInUser = async (email: string, password: string) => {
  // Use session persistence for better security
  await setPersistence(auth, browserSessionPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out
export const signOutUser = async () => {
  await signOut(auth);
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};
```

### Role-Based Access Control

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<'recruiter' | 'candidate' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setRole(userDoc.data()?.role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  return { user, role, loading };
};

// Protected route component
export const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode; 
  allowedRoles: string[] 
}) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(role!)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

### Additional Security Measures

```typescript
// Environment variables (.env.local)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

// Never commit Firebase keys - use .gitignore

// Content Security Policy headers (in firebase.json)
{
  "hosting": {
    "headers": [
      {
        "key": "Content-Security-Policy",
        "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com; connect-src 'self' https://firebaseapp.com"
      }
    ]
  }
}

// Firebase App Check (optional, for additional security)
// Prevents non-app traffic to your backend
```

---

## Deployment & Hosting

### Firebase Hosting Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting

# Build and deploy
npm run build
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

### firebase.json Configuration

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

### Deployment Workflow

```bash
# Local development
npm run dev              # Start Vite dev server
firebase emulators:start # Start Firebase emulators locally

# Testing
npm run test            # Run unit tests
npm run e2e            # Run end-to-end tests

# Build for production
npm run build           # Create optimized bundle

# Deploy to Firebase
firebase deploy --only hosting,functions
```

---

## Overall Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PracticalSkills Architecture                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React App)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Recruiter Portal          Candidate Portal                      │
│  ┌──────────────┐          ┌──────────────┐                     │
│  │ Resume Upload│          │ Test Taker   │                     │
│  │ Skills View  │ <───────>│ Timer Widget │                     │
│  │ Test Builder │          │ Answer Input │                     │
│  │ Results Page │          │ Results View │                     │
│  └──────────────┘          └──────────────┘                     │
│         │                        │                               │
│         └────────────┬───────────┘                               │
│                      ▼                                            │
│             ┌─────────────────┐                                 │
│             │ Firebase SDK    │                                 │
│             │ (Auth, Firestore│                                 │
│             │  Storage, etc)  │                                 │
│             └────────┬────────┘                                 │
└─────────────────────┼──────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌──────────┐  ┌─────────┐  ┌──────────────┐
   │ Firebase │  │ Cloud   │  │ Cloud        │
   │ Auth     │  │ Storage │  │ Functions    │
   │          │  │         │  │              │
   │ -Login   │  │ -Resumes│  │ -Resume      │
   │ -Register│  │ -Reports│  │  Analysis    │
   │ -Session │  │ -PDFs   │  │ -Test Gen    │
   └──────────┘  └─────────┘  │ -Scoring     │
                               │ -Email       │
                               └──────────────┘
                                      │
                      ┌───────────────┼───────────────┐
                      ▼               ▼               ▼
                  ┌──────────┐   ┌──────────┐   ┌─────────────┐
                  │ Firestore│   │Google NLP│   │SendGrid     │
                  │Database  │   │(Skills)  │   │(Emails)     │
                  │          │   │          │   │             │
                  │ -Users   │   │-Entity   │   │-Invitations │
                  │ -Tests   │   │ Recognition  │-Alerts      │
                  │ -Answers │   │          │   │             │
                  │ -Skills  │   └──────────┘   └─────────────┘
                  └──────────┘
                      ▼
                  ┌──────────┐
                  │ Real-time│
                  │ Timer    │
                  │(via      │
                  │ Firestore│
                  │ Timestamps)
                  └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Firebase Hosting (CDN)  ← React App Bundle (Vite)              │
│  Auto HTTPS, HTTP/2, Gzip Compression                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Development Workflow

### Local Development Setup

```bash
# 1. Clone and install
git clone <repo>
cd practical-skills
npm install
cd functions && npm install && cd ..

# 2. Create .env.local with Firebase config
cat > .env.local << EOF
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... other config
EOF

# 3. Start Firebase emulators
firebase emulators:start

# 4. In another terminal, start dev server
npm run dev

# App will be at http://localhost:5173
# Firestore emulator at http://localhost:4000
```

### Development Commands

```bash
# Development
npm run dev              # Vite dev server
npm run typecheck       # TypeScript check

# Testing
npm run test            # Run Vitest
npm run test:ui        # Test UI
npm run e2e            # Playwright tests

# Building
npm run build          # Production build
npm run preview        # Preview build locally

# Firebase
firebase emulators:start
firebase deploy
firebase functions:log

# Code quality
npm run lint           # ESLint
npm run format         # Prettier
```

### Git Workflow

```bash
# Branches
main       → Production (auto-deploys)
develop    → Integration branch
feature/*  → Feature branches

# Commits
git commit -m "feat: add resume analysis"
git commit -m "fix: timer sync issue"
git commit -m "docs: update architecture"
```

---

## Cost Analysis

### Firebase Pricing (As of June 2026)

| Service | Free Tier | Pricing |
|---------|-----------|---------|
| **Authentication** | 50k/month free, then $0.0055/100 | Included in free tier for MVP |
| **Firestore** | 1GB storage, 50k reads/day, 20k writes/day, 20k deletes/day | $0.06 per 100k reads, $0.18 per 100k writes |
| **Cloud Storage** | 5GB, 1GB/day downloads | $0.018/GB storage, $0.12/GB download |
| **Cloud Functions** | 2M invocations/month free, 400k GB-seconds/month | $0.40/M invocations after free tier |
| **Hosting** | Included | $1/month minimum + bandwidth |
| **Real-time Database** | 100 concurrent connections, 1GB storage | Usually not needed (use Firestore) |

### Estimated Monthly Costs (At Scale - 1,000+ tests/month)

```
Scenario: 1,000 assessments/month, 200 candidates

Firestore:
- Reads: 50k/month (resume lookups, test data)  = Free tier
- Writes: 15k/month (answers, results)          = Free tier
- Storage: 10GB (resumes, results)              = $1.80
Subtotal: ~$2/month (likely in free tier)

Cloud Storage:
- Resume uploads: 1,000 × 2MB = 2GB/month       = $0.036/month
- Report downloads: 1,000 × 0.5MB = 0.5GB      = $0.06/month
Subtotal: ~$0.10/month

Cloud Functions:
- Resume analysis: 1,000 × 2s CPU time = ~2,000 GB-seconds  = $0.80/month
- Answer validation: 50k × 0.5s = ~25,000 GB-seconds       = $10/month
- Test generation: 1,000 × 1s = ~1,000 GB-seconds          = $0.40/month
Subtotal: ~$11.20/month

Hosting:
- 1,000 users × average 100MB cdn = $1.20/month
Subtotal: ~$1.20/month

TOTAL ESTIMATED: ~$14.50/month

(Compare to: HackerRank $165/month, Codility $100/month)
```

### Scaling Costs (10,000 tests/month)

```
At 10x scale:
- Firestore: ~$10/month (approaching paid tier)
- Cloud Storage: ~$1/month
- Cloud Functions: ~$100/month (major cost driver)
- Hosting: ~$12/month

TOTAL: ~$123/month

Still cheaper than HackerRank ($165/month) and way cheaper than Codility
```

### Cost Optimization Strategies

1. **Batch writes** - Combine multiple updates into single transaction
2. **Index selective fields** - Only index fields you query on
3. **Pagination** - Don't load all questions at once
4. **Caching** - Redis-like caching for question bank (but Firebase doesn't have this built-in, would need separate service)
5. **Archive old data** - Move completed tests to cheaper cold storage
6. **Optimize function execution** - Keep Cloud Functions fast and efficient

---

## Recommended Implementation Order

### Week 1-2: Foundation
1. Set up React + TypeScript project with Vite
2. Configure Firebase in development
3. Implement Firebase Authentication (sign up, sign in, sign out)
4. Create basic routing and page structure

### Week 3-4: Client Features
1. Build resume upload component (Cloud Storage)
2. Implement skills extraction display (mock data initially)
3. Create test profile builder (UI only)
4. Build candidate test interface with timer

### Week 5-6: Backend & Integration
1. Implement Firestore schema
2. Build Cloud Functions for resume analysis
3. Build Cloud Functions for test generation
4. Integrate frontend with backend

### Week 7-8: Polish & Launch
1. Implement results analytics
2. Build PDF report generation
3. Security hardening (Firestore rules, CSP headers)
4. Testing and bug fixes
5. Deploy to Firebase Hosting

---

## Summary

**Tech Stack:**
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite
- Backend: Firebase (Firestore, Cloud Functions, Cloud Storage, Auth)
- Hosting: Firebase Hosting
- NLP: Google Cloud Natural Language API (called from Cloud Functions)
- Email: SendGrid (via Firebase Extension or Cloud Function)

**Advantages:**
✅ No server management (serverless)
✅ Automatic scaling
✅ Direct integration between layers
✅ Real-time database subscriptions (for timer sync)
✅ Built-in authentication
✅ CDN-backed hosting
✅ Cost-effective at small scale
✅ Firebase free tier covers MVP

**Considerations:**
⚠️ Vendor lock-in to Google Cloud ecosystem
⚠️ Cloud Functions have 540-second timeout limit
⚠️ Cold starts (though not critical for this use case)
⚠️ NLP analysis cost (but minimal with 1k tests/month)

This architecture is optimized for rapid development and can scale from MVP to production with minimal infrastructure changes.
