# Phase 1: Foundation — Full Implementation Task

You are working on an ATS Resume Checker & Template Builder web app. Your job is to implement **all of Phase 1** — the foundation layer that every other feature depends on.

The project is tracked in Linear under the **"ATS Resume Checker & Template Builder"** project in the **Oakbridge** team. Phase 1 corresponds to the **"Phase 1: Foundation"** milestone. Before you start each issue, update its status to "In Progress". When done, mark it "Done". The issues are: OAK-5 through OAK-16.

Use `list_issues` with project "ATS Resume Checker & Template Builder" and milestone "Phase 1: Foundation" to see all issues and their descriptions. Read each issue before working on it — the descriptions contain full specifications.

## Project Context

- **Stack:** Next.js 16.1.6 (App Router), React 19, Drizzle ORM 0.45.1, PostgreSQL (Neon serverless), Better Auth 1.4.19, Vercel AI SDK 6.0.103, HeroUI v3 beta, Tailwind CSS v4, nuqs 2.8.8
- **Working directory:** `/Users/em/dev/cdk/prjt-rs`
- **Current state:** Fresh scaffold — route groups `(admin)`, `(auth)`, `(client)` exist but are empty. Schema files exist but are empty/commented. Default Next.js boilerplate home page.

## Current File State (read these, don't guess)

- `drizzle.config.ts` — points to wrong path `./src/db/schema.ts`, needs fix to `./config/db/schema/index.ts`
- `config/db/index.ts` — uses `drizzle-orm/node-postgres`, needs switch to `drizzle-orm/neon-http` with `@neondatabase/serverless`
- `config/db/schema/index.ts` — just has `// export everything here`
- `config/db/schema/ats-schema.ts` — empty file
- `config/db/schema/file-schema.ts` — empty file
- `config/db/schema/config-schema.ts` — has commented pseudocode for 5 tables (siteSettings, navbar, sidebar, footer, page)
- `.env.example` — only has `DATABASE_URL`
- `app/layout.tsx` — has Geist, Geist_Mono, Instrument_Serif, DM_Sans fonts loaded. Default metadata. No providers wrapper.
- `package.json` — has core deps installed but missing `@ai-sdk/openai`, `docx`, `mammoth`, `pdf-parse`, `@react-pdf/renderer`, `zod`

## Execution Order

Work through issues in this dependency order:

```
1. OAK-7  — Install npm dependencies (FIRST — unblocks everything)
2. OAK-5  — Fix drizzle.config.ts schema path
3. OAK-6  — Switch db to Neon serverless adapter (depends on OAK-5)
4. OAK-8  — Update .env.example
5. OAK-9  — Create auth-schema.ts
6. OAK-11 — Create file-schema.ts        (parallel with OAK-10, OAK-12)
7. OAK-10 — Create ats-schema.ts         (depends on OAK-9 for user FK)
8. OAK-12 — Implement config-schema.ts   (parallel with OAK-10)
9. Update config/db/schema/index.ts to export all schemas
10. OAK-13 — Set up Better Auth server + client + API route (depends on OAK-9)
11. OAK-14 — Create auth middleware (depends on OAK-13)
12. OAK-15 — Configure OpenRouter AI provider
13. OAK-16 — Create Providers wrapper + update root layout
```

## Key Specifications

### Schema Rules
- Use `pgTable` from `drizzle-orm/pg-core`
- All user FKs: `text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })`
- All timestamps: `timestamp('created_at').notNull().defaultNow()`
- JSONB columns: use `jsonb('col_name').$type<TypeHere>().notNull()`
- Auth tables use `text` PKs (not serial) — Better Auth generates its own IDs

### Auth Setup
- Server config: `config/auth/index.ts` — `betterAuth` with `drizzleAdapter(db, { provider: 'pg' })`, email+password enabled, 7-day sessions
- Client config: `config/auth/client.ts` — `createAuthClient` from `better-auth/client/react`, export `signIn`, `signUp`, `signOut`, `useSession`
- API route: `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)` exporting GET and POST
- Middleware: `middleware.ts` at root — protect `/dashboard/*`, `/checker/*`, `/builder/*`; redirect authed users away from `/sign-in`, `/sign-up`

### AI Provider
- `config/ai/index.ts` — use `createOpenAI` from `@ai-sdk/openai` with OpenRouter base URL
- Export `getModel(modelId?)` function defaulting to `OPENROUTER_MODEL` env var

### Providers + Layout
- `components/providers.tsx` — client component wrapping `HeroUIProvider` + `NuqsAdapter`
- `app/layout.tsx` — wrap children with `<Providers>`, update metadata title/description, keep all existing fonts

### The `ResumeData` Type (export from ats-schema.ts)
```typescript
export type ResumeData = {
  contactInfo: { fullName: string; email: string; phone: string; linkedIn?: string; location?: string; website?: string };
  professionalSummary: string;
  workExperience: { jobTitle: string; company: string; location?: string; startDate: string; endDate: string; bullets: string[] }[];
  education: { degree: string; institution: string; location?: string; graduationDate: string; gpa?: string; honors?: string }[];
  skills: { category: string; items: string[] }[];
  certifications?: { name: string; issuer: string; date?: string }[];
  additionalSections?: { title: string; content: string }[];
};
```

## Rules

- Path alias `@/*` maps to project root
- Do NOT modify `globals.css`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, or `next.config.ts`
- Do NOT create any pages, components, or features beyond what's listed in the issues
- Do NOT run `drizzle-kit push` or any migration commands — just create the schema files
- After completing all files, run `npx tsc --noEmit` to verify zero TypeScript errors
- Update each Linear issue status as you go: "In Progress" when starting, "Done" when complete
