# ATS Resume Checker & Template Builder — Implementation Plan

## Context

We're building a web app that solves two problems:
1. **ATS Score Checker** — Users upload a resume + paste a job description, get a detailed ATS compatibility analysis with actionable feedback
2. **Resume Template Builder** — Users fill in structured data and generate ATS-optimized resumes in DOCX/PDF

The project is a fresh Next.js 16 app with Drizzle ORM, Better Auth, Vercel AI SDK, HeroUI, and Tailwind CSS v4 already installed. Route groups `(admin)`, `(auth)`, `(client)` exist but are empty. Database schema files exist but are empty/commented. The `drizzle.config.ts` has a path mismatch that needs fixing.

### Key Research-Backed Design Decisions
- **Scoring uses AI (LLM) via Vercel AI SDK** — `generateObject` with Zod schemas for typed, structured analysis. More accurate than TF-IDF for semantic matching. Single LLM call covers 7 of 8 scoring categories.
- **Parseability is scored deterministically** — file format, tables, columns, text boxes, fonts are detected by parsing libraries, not LLM.
- **DOCX is the primary output format** — maximum ATS compatibility. PDF offered as secondary.
- **All processing is server-side** — privacy (resume data stays server-side), security (API keys), consistency.
- **Templates enforce ATS rules** — single column, standard fonts, no tables/images/icons, standard section names.

---

## How ATS Actually Works (Research Summary)

### The Parsing Pipeline
```
File Upload → Format Detection → Text Extraction → Section Detection
→ Entity Extraction → Taxonomy Mapping → Structured Profile → Keyword Search Index
```

### What Breaks ATS Parsing
| Element | Impact | Severity |
|---------|--------|----------|
| Image-only PDFs | No text extractable | Critical |
| Tables | Content read in wrong order | High |
| Multi-column layouts | Left/right content merged on same line | High |
| Text boxes | Content invisible or out of order | High |
| Headers/footers | 25% of ATS miss this content | Medium |
| Custom fonts | Garbled characters if encoding fails | Medium |
| Icons/graphics | Render as garbage characters or invisible | Medium |
| Skill bars/progress indicators | ATS sees nothing — Skills section appears empty | High |

### The 3 ATS Scoring Paradigms
1. **Literal match** (Taleo) — exact string comparison, "ML" ≠ "Machine Learning"
2. **Fuzzy match** — Levenshtein distance, handles typos/abbreviations
3. **Semantic match** (iCIMS, modern) — embedding-based, understands meaning

### ATS-Friendly Resume Rules
- Single column layout only
- Standard fonts: Arial, Calibri, Garamond, Georgia, Helvetica, Times New Roman
- Standard section names: "Work Experience", "Education", "Skills" (not creative names)
- No tables, text boxes, images, icons, skill bars
- Contact info in document body (not header/footer)
- Date format: MM/YYYY or Month YYYY, consistent throughout
- DOCX preferred over PDF for maximum compatibility
- Reverse-chronological format is the gold standard

### Market Gaps (Competitive Advantages)
1. No tool simulates specific ATS platforms
2. Most tools lack semantic understanding (still keyword counting)
3. No outcome tracking (does a high score actually lead to interviews?)
4. Scoring is a black box — only one tool (Upplai) explains *why*
5. Privacy concerns — most upload data to servers
6. $25-50/month subscriptions create friction for job seekers

---

## Phase 1: Foundation

### 1.1 Fix Broken Config + Dependencies

| File | Action | What |
|------|--------|------|
| `drizzle.config.ts` | MODIFY | Fix schema path: `./src/db/schema.ts` → `./config/db/schema/index.ts` |
| `config/db/index.ts` | MODIFY | Switch to Neon serverless adapter (`drizzle-orm/neon-http`) |
| `.env.example` | MODIFY | Add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL` |

**Install dependencies:**
```
npm install @ai-sdk/openai docx mammoth pdf-parse @react-pdf/renderer zod
npm install -D @types/pdf-parse
```

### 1.2 Database Schema

| File | Action | What |
|------|--------|------|
| `config/db/schema/auth-schema.ts` | CREATE | Better Auth tables: `user`, `session`, `account`, `verification` |
| `config/db/schema/ats-schema.ts` | REPLACE | `resumeScan` table (stores analysis results with JSONB score breakdowns), `savedResume` table (stores builder output with JSONB resume data) |
| `config/db/schema/file-schema.ts` | REPLACE | `uploadedFile` table (optional file tracking) |
| `config/db/schema/config-schema.ts` | MODIFY | Implement actual Drizzle tables from existing pseudocode |
| `config/db/schema/index.ts` | MODIFY | Export all schemas |

**`resumeScan` table — key columns:**
- `userId`, `fileName`, `fileType`, `fileSize`, `extractedText`, `jobDescription`
- `overallScore` (0-100 float)
- 8 JSONB columns for category scores (parseability, section completeness, hard skills, content quality, job title alignment, experience depth, soft skills, education match) — each contains `score`, `weight`, `feedback[]`, and category-specific data
- `summary`, `topRecommendations` (AI-generated)

**`savedResume` table — key columns:**
- `userId`, `name`, `templateType`
- `resumeData` (JSONB containing contactInfo, summary, workExperience[], education[], skills[], certifications[])
- `lastScanId`, `lastScanScore` (optional link to a scan)

**ResumeData TypeScript type:**
```typescript
type ResumeData = {
  contactInfo: { fullName, email, phone, linkedIn?, location?, website? }
  professionalSummary: string
  workExperience: { jobTitle, company, location?, startDate, endDate, bullets[] }[]
  education: { degree, institution, location?, graduationDate, gpa?, honors? }[]
  skills: { category, items[] }[]
  certifications?: { name, issuer, date? }[]
  additionalSections?: { title, content }[]
}
```

### 1.3 Auth Setup

| File | Action | What |
|------|--------|------|
| `config/auth/index.ts` | CREATE | Better Auth server config with Drizzle adapter, email+password enabled |
| `config/auth/client.ts` | CREATE | Better Auth React client (`signIn`, `signUp`, `signOut`, `useSession`) |
| `app/api/auth/[...all]/route.ts` | CREATE | Better Auth catch-all route handler |
| `middleware.ts` | CREATE | Protect `/dashboard`, `/checker`, `/builder`; redirect auth'd users away from `/sign-in`, `/sign-up` |

### 1.4 AI Provider + App Shell

| File | Action | What |
|------|--------|------|
| `config/ai/index.ts` | CREATE | OpenRouter provider via `@ai-sdk/openai` with custom base URL |
| `components/providers.tsx` | CREATE | Client providers wrapper: HeroUIProvider + NuqsAdapter |
| `app/layout.tsx` | MODIFY | Wrap children in Providers, update metadata |

### 1.5 Page Routing Structure
```
app/
  layout.tsx                            — root layout with Providers
  page.tsx                              — landing page / marketing
  (auth)/
    layout.tsx                          — centered auth layout
    sign-in/page.tsx                    — sign in form
    sign-up/page.tsx                    — sign up form
  (client)/
    layout.tsx                          — authenticated layout with sidebar nav
    dashboard/page.tsx                  — user dashboard
    checker/page.tsx                    — ATS checker (upload + JD paste)
    checker/[scanId]/page.tsx           — scan results detail view
    builder/page.tsx                    — new resume builder
    builder/[resumeId]/page.tsx         — edit existing resume
  (admin)/
    layout.tsx                          — admin layout
    settings/page.tsx                   — site settings
  api/
    auth/[...all]/route.ts              — Better Auth handler
    download/[format]/route.ts          — DOCX/PDF download
    analyze/route.ts                    — streaming analysis (Phase 5)
```

---

## Phase 2: Resume Parser & ATS Scorer

### 2.1 File Parsers

| File | What |
|------|------|
| `lib/parsers/pdf-parser.ts` | Extract text from PDF via `pdf-parse`. Detect: image-only PDFs, font names, page count |
| `lib/parsers/docx-parser.ts` | Extract text from DOCX via `mammoth`. Detect: tables, text boxes, multi-column, images |
| `lib/parsers/index.ts` | Unified `parseResume(buffer, fileType)` → `ParsedResume` with text + parseability metadata |

### 2.2 Scoring Engine (5 files)

| File | What |
|------|------|
| `lib/scoring/schemas.ts` | Zod schemas for each scoring category — used as `generateObject` schema parameter |
| `lib/scoring/prompts.ts` | System prompt + user prompt builder for the AI analysis |
| `lib/scoring/parseability-scorer.ts` | **Deterministic** scorer — deducts points for tables (-20), text boxes (-15), multi-column (-20), image-only PDF (-100), custom fonts (-5 each), header/footer content (-10) |
| `lib/scoring/ai-scorer.ts` | Single `generateObject` call scoring 7 categories: section completeness, hard skills match, content quality, job title alignment, experience depth, soft skills, education match |
| `lib/scoring/composite-scorer.ts` | Weighted average: hard skills 32.5%, parseability 12.5%, job title 12.5%, experience 12.5%, section completeness 10%, content quality 10%, soft skills 7.5%, education 5% |

**Scoring Weight Rationale:**
- Hard skills (32.5%) — This is what ATS keyword searches target. Highest impact on whether a recruiter finds the resume.
- Parseability (12.5%) — If the ATS can't read it, nothing else matters. But most modern ATS handle clean files well.
- Job title alignment (12.5%) — Recruiters search by title. Direct title match is a strong signal.
- Experience depth (12.5%) — Years of experience is a common knockout filter.
- Section completeness (10%) — Missing sections mean missing data in the ATS profile.
- Content quality (10%) — Action verbs and quantification matter for the human reader after ATS.
- Soft skills (7.5%) — Important but should be shown contextually, not listed.
- Education (5%) — Only matters when JD specifies degree requirements.

### 2.3 Checker Pages & Components

| File | What |
|------|------|
| `app/(client)/checker/actions.ts` | Server action: `analyzeResume(formData)` — parse → score → save → return scanId |
| `app/(client)/checker/page.tsx` | Upload form page |
| `app/(client)/checker/[scanId]/page.tsx` | Results detail page (fetches scan by ID) |
| `components/pages/checker/CheckerForm.tsx` | Drag-drop file upload + JD textarea + submit with loading state |
| `components/pages/checker/ScoreReport.tsx` | Overall score gauge + 8 category cards + recommendations |
| `components/ui/ScoreGauge.tsx` | Circular score visualization |
| `components/ui/ScoreCard.tsx` | Category score bar with expandable feedback |

**Server Action Flow:**
```
analyzeResume(formData)
  1. Auth check
  2. Validate file (size < 5MB, type = pdf|docx)
  3. parseResume(buffer, fileType) → ParsedResume
  4. scoreParseability(parsedResume) → ParseabilityScore (deterministic)
  5. runAIAnalysis(resumeText, jobDescription) → 7 category scores (LLM)
  6. computeOverallScore(parseability, aiAnalysis) → weighted composite
  7. db.insert(resumeScan).values({...}) → persist results
  8. return { scanId }
  9. redirect to /checker/[scanId]
```

---

## Phase 3: Resume Template Builder

### 3.1 Templates (6 files)

| File | What |
|------|------|
| `lib/templates/base-template.tsx` | Shared rendering logic: maps `ResumeData` → styled React components |
| `lib/templates/reverse-chronological.tsx` | Default template — standard order, clean typography |
| `lib/templates/hybrid.tsx` | Skills-first layout for career changers |
| `lib/templates/minimalist.tsx` | Maximum whitespace, minimal decoration |
| `lib/templates/professional.tsx` | Traditional with subtle accent color + horizontal rules |
| `lib/templates/modern.tsx` | Typography-forward with weight contrast, ATS-safe visual enhancements |

**All templates enforce:**
- Single column layout
- System fonts only (Arial, Calibri, Georgia, Times New Roman)
- Standard section names ("Professional Summary", "Work Experience", "Education", "Skills")
- No tables, text boxes, images, icons, skill bars
- MM/YYYY or Month YYYY date formatting
- Real selectable text
- Body text 10-12pt, headers 12-14pt, name 14-16pt
- Contact info separated by `|` in document body
- Bullet format: Action Verb + What + Quantified Result

### 3.2 Document Generators

| File | What |
|------|------|
| `lib/generators/docx-generator.ts` | Uses `docx` npm package — builds Word document from `ResumeData` + template style config |
| `lib/generators/pdf-generator.ts` | Uses `@react-pdf/renderer` — renders React components to PDF buffer with embedded fonts |
| `app/api/download/[format]/route.ts` | GET route: generates DOCX or PDF on-the-fly, streams as download |

### 3.3 Builder Pages & Form Components

| File | What |
|------|------|
| `app/(client)/builder/page.tsx` | New resume — split layout: form (left) + live preview (right) |
| `app/(client)/builder/[resumeId]/page.tsx` | Edit existing — loads saved data, same UI |
| `app/(client)/builder/actions.ts` | Server actions: `saveResume`, `deleteResume`, `improveBulletPoint` (AI-assisted) |
| `components/pages/builder/ResumeForm.tsx` | Master form orchestrating all sections |
| `components/pages/builder/TemplateSelector.tsx` | Template selection grid with thumbnails |
| `components/pages/builder/ResumePreview.tsx` | Live HTML preview, updates as user types |
| `components/pages/builder/sections/ContactInfoForm.tsx` | Name, email, phone, LinkedIn, location |
| `components/pages/builder/sections/ProfessionalSummaryForm.tsx` | Textarea with AI suggestions button |
| `components/pages/builder/sections/WorkExperienceForm.tsx` | Dynamic list: title, company, dates, bullets |
| `components/pages/builder/sections/EducationForm.tsx` | Dynamic list: degree, institution, date |
| `components/pages/builder/sections/SkillsForm.tsx` | Grouped categories with tag-input |
| `components/pages/builder/sections/CertificationsForm.tsx` | Optional dynamic list |

---

## Phase 4: Dashboard & History

| File | What |
|------|------|
| `app/(client)/layout.tsx` | Authenticated layout with sidebar nav |
| `components/layout/ClientNav.tsx` | Sidebar: Dashboard, ATS Checker, Resume Builder, sign-out |
| `app/(client)/dashboard/page.tsx` | Dashboard home — overview + recent scans + saved resumes |
| `app/(client)/dashboard/actions.ts` | Server actions: `getRecentScans`, `getSavedResumes`, `deleteScan` |
| `components/pages/dashboard/DashboardOverview.tsx` | Stats: total scans, average score, trend |
| `components/pages/dashboard/ScanHistoryTable.tsx` | Past scans list with scores + actions |
| `components/pages/dashboard/SavedResumesGrid.tsx` | Resume cards with download/edit/scan actions |

---

## Phase 5: Polish

| File | What |
|------|------|
| `app/page.tsx` | Landing page (replace boilerplate): hero, features, how-it-works, CTA |
| `app/(auth)/layout.tsx` | Centered auth layout |
| `app/(auth)/sign-in/page.tsx` | Sign in form |
| `app/(auth)/sign-up/page.tsx` | Sign up form |
| `app/api/analyze/route.ts` | Streaming alternative using `streamObject` for progressive score display |
| `app/(client)/checker/loading.tsx` | Skeleton loading states |
| `app/(client)/dashboard/loading.tsx` | Skeleton loading states |
| `app/(client)/builder/loading.tsx` | Skeleton loading states |
| `app/not-found.tsx` | Custom 404 |
| `app/error.tsx` | Global error boundary |

---

## Dependency Chain

```
Phase 1 ──────────────────────────────────────────────────
  drizzle fix → schema files → db migration → auth setup
  AI config (parallel with auth)
  Providers + layout (after auth client)

Phase 2 (depends on Phase 1) ────────────────────────────
  Parsers (independent)
  Scoring engine (depends on AI config)
  Server actions (depends on parsers + scoring + auth + db)
  UI (depends on server actions)

Phase 3 (depends on Phase 1, parallel with Phase 2) ─────
  Templates (independent)
  Generators (depends on templates)
  Form components (independent)
  Server actions + pages (depends on generators + auth + db)

Phase 4 (depends on Phase 1, benefits from 2+3) ─────────
  Layout + nav (depends on auth)
  Dashboard (depends on db schema)

Phase 5 (after all above) ───────────────────────────────
  Landing page, auth pages, streaming, loading states
```

---

## Verification Plan

1. **Phase 1**: Run `npx drizzle-kit push` — schema should apply without errors. Visit `/api/auth/sign-up` — should return Better Auth response. Check that HeroUI components render on the root page.
2. **Phase 2**: Upload a sample PDF and DOCX with known content → verify text extraction. Paste a job description → verify all 8 score categories return valid data. Check score is persisted in DB.
3. **Phase 3**: Fill out all form fields → verify live preview renders correctly. Download DOCX → open in Word, verify formatting. Download PDF → verify text is selectable. Copy-paste all text from PDF → verify it reads in correct order.
4. **Phase 4**: Create multiple scans → verify they appear in dashboard. Save multiple resumes → verify grid displays correctly. Delete a scan → verify it's removed.
5. **Phase 5**: Visit `/` as unauthenticated user → see landing page. Click "Get Started" → redirected to sign-up. Sign up → redirected to dashboard. Test all loading states by throttling network.

---

## Potential Challenges & Mitigations

1. **PDF parsing quality varies** — `pdf-parse` may miss layout issues. Mitigation: Use LLM as second pass to identify structural problems from garbled text.
2. **AI scoring consistency** — LLMs give different scores for same input. Mitigation: `temperature: 0`, strict Zod schemas, benchmark test set.
3. **OpenRouter rate limits** — Full analysis could hit limits. Mitigation: Single `generateObject` call (one Zod schema) instead of 8 separate calls.
4. **DOCX generation complexity** — `docx` library is imperative. Mitigation: Shared abstraction layer mapping ResumeData sections to paragraphs.
5. **React-PDF in Next.js** — Heavy, Node.js dependencies. Mitigation: Use only in API route handlers, generate on-demand, cache results.

---

## Total: ~70 files across 5 phases
- Phase 1: 15 files (foundation — must complete first)
- Phase 2: 12 files (the core product — ATS checker)
- Phase 3: 18 files (resume builder — can parallel with Phase 2)
- Phase 4: 7 files (dashboard)
- Phase 5: 10 files (polish + landing + auth pages)
