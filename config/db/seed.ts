import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { user, account, session, verification } from "./schema/auth-schema";
import { siteSettings, navbarItem, sidebarItem, footerList, page, originDomain } from "./schema/config-schema";
import { uploadedFile } from "./schema/file-schema";
import { resumeScan, savedResume } from "./schema/ats-schema";
import { blogPost } from "./schema/blog-schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const db = drizzle({ connection: process.env.DATABASE_URL! });

// better-auth uses scrypt for password hashing (not bcrypt)
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

function id() {
  return crypto.randomUUID();
}

async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error("Seed script must not run in production.");
    process.exit(1);
  }

  console.log("Seeding database…");

  // Clean existing data (order matters for FK constraints)
  await db.delete(uploadedFile);
  await db.delete(resumeScan);
  await db.delete(savedResume);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);
  await db.delete(siteSettings);
  await db.delete(navbarItem);
  await db.delete(sidebarItem);
  await db.delete(footerList);
  await db.delete(originDomain);
  await db.delete(page);
  await db.delete(blogPost);
  console.log("  Cleared existing data");

  // --- Auth: admin user ---
  const adminId = id();
  const accountId = id();
  const seedEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@admin.com";
  const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? crypto.randomBytes(16).toString("hex");
  const hashedPassword = await hashPassword(seedPassword);

  await db.insert(user).values({
    id: adminId,
    name: "Admin",
    email: seedEmail,
    emailVerified: true,
    role: "admin",
    accountStatus: "active",
    isBanned: false,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: adminId,
    providerId: "credential",
    userId: adminId,
    password: hashedPassword,
  });
  console.log(`  Created admin user (${seedEmail} / ${seedPassword})`);

  // --- Site Settings ---
  await db.insert(siteSettings).values({
    siteName: "ResumeATS",
    description: "Beat the ATS. Land the interview.",
    copyrightText: "\u00a9 2026 ResumeATS. All rights reserved.",
  });
  console.log("  Created site settings");

  // --- Navbar ---
  const navItems = [
    { label: "Dashboard", path: "/dashboard", order: "1" },
    { label: "Scan Resume", path: "/scan", order: "2" },
    { label: "Builder", path: "/builder", order: "3" },
    { label: "Templates", path: "/templates", order: "4" },
  ];
  await db.insert(navbarItem).values(navItems);
  console.log("  Created navbar items");

  // --- Sidebar ---
  const sideItems = [
    { label: "Overview", path: "/dashboard", order: "1" },
    { label: "My Resumes", path: "/dashboard/resumes", order: "2" },
    { label: "Scan History", path: "/dashboard/scans", order: "3" },
    { label: "Settings", path: "/dashboard/settings", order: "4" },
  ];
  await db.insert(sidebarItem).values(sideItems);
  console.log("  Created sidebar items");

  // --- Footer ---
  await db.insert(footerList).values([
    {
      listLabel: "Product",
      listItems: [
        { label: "Features", path: "/features", order: 1 },
        { label: "Pricing", path: "/pricing", order: 2 },
        { label: "Templates", path: "/templates", order: 3 },
      ],
    },
    {
      listLabel: "Company",
      listItems: [
        { label: "About", path: "/about", order: 1 },
        { label: "Privacy", path: "/privacy", order: 2 },
        { label: "Terms", path: "/terms", order: 3 },
      ],
    },
  ]);
  console.log("  Created footer lists");

  // --- Origin Domain ---
  await db.insert(originDomain).values({
    domain: "resume-ats.com",
    isDefault: true,
    isActive: true,
  });
  console.log("  Created origin domain");

  // --- Pages ---
  await db.insert(page).values([
    {
      slug: "about",
      title: "About ResumeATS",
      content: `## Our Mission

ResumeATS helps job seekers optimize their resumes for Applicant Tracking Systems. We believe everyone deserves a fair shot at landing an interview — and that starts with a resume that gets read.

## How It Works

Upload your resume and a job description. Our ATS checker analyzes your resume against the same criteria used by leading applicant tracking systems, then gives you actionable recommendations to improve your match rate.

## The Team

ResumeATS is built by a small team of engineers and hiring professionals who have seen firsthand how qualified candidates get filtered out by automated systems. We built the tool we wished existed.

## Contact

Have questions or feedback? Reach out at [hello@resume-ats.com](mailto:hello@resume-ats.com).`,
      tags: ["company", "about"],
      isPublished: true,
      metaDescription: "Learn about ResumeATS — the ATS resume checker that helps job seekers optimize their resumes and land more interviews.",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: `*Last updated: March 2026*

## Overview

Your privacy matters. This policy explains what data we collect, how we use it, and your rights.

## Data We Collect

- **Account information** — name, email address, and password (hashed)
- **Resumes and job descriptions** — uploaded for analysis, stored securely
- **Usage data** — pages visited, features used, scan history

## How We Use Your Data

- To provide and improve our ATS checking and resume building services
- To send you scan results and account notifications
- To understand how our product is used so we can make it better

## Data Retention

- Resumes and scan results are retained while your account is active
- You can delete your data at any time from your account settings
- When you delete your account, all associated data is permanently removed within 30 days

## Third Parties

We do not sell or share your personal information with third parties for marketing purposes. We use:

- **Hosting** — Vercel (application), AWS (file storage)
- **AI analysis** — Your resume text is sent to our AI provider for analysis, but is not stored by them

## Your Rights

You have the right to access, correct, or delete your personal data at any time. Contact us at [privacy@resume-ats.com](mailto:privacy@resume-ats.com).

## Cookies

We use essential cookies for authentication and session management. No third-party tracking cookies are used unless you have opted in to analytics.

## Changes

We may update this policy from time to time. Changes will be posted on this page with an updated date.`,
      tags: ["legal"],
      isPublished: true,
      metaDescription: "ResumeATS Privacy Policy — how we collect, use, and protect your personal data and uploaded resumes.",
    },
    {
      slug: "terms",
      title: "Terms of Service",
      content: `*Last updated: March 2026*

## Acceptance

By creating an account or using ResumeATS, you agree to these terms. If you do not agree, please do not use the service.

## The Service

ResumeATS provides automated resume analysis and resume building tools. Our ATS checker evaluates resumes against common applicant tracking system criteria and provides suggestions for improvement.

## Your Account

- You must provide accurate information when creating an account
- You are responsible for maintaining the security of your account
- One person per account — do not share credentials

## Acceptable Use

You agree not to:

- Upload content that is illegal, harmful, or infringes on others' rights
- Attempt to access other users' data or accounts
- Use the service to generate misleading or fraudulent resumes
- Reverse-engineer or scrape the service

## Intellectual Property

- Your resumes and content remain yours
- The ResumeATS name, logo, and service design are our intellectual property
- AI-generated suggestions and analysis are provided as guidance, not guaranteed outcomes

## Disclaimers

- ResumeATS does not guarantee job interviews or employment outcomes
- ATS scores are estimates based on common patterns and may differ from actual ATS results
- The service is provided "as is" without warranties of any kind

## Limitation of Liability

To the fullest extent permitted by law, ResumeATS shall not be liable for indirect, incidental, or consequential damages arising from your use of the service.

## Termination

We may suspend or terminate accounts that violate these terms. You may delete your account at any time.

## Contact

Questions about these terms? Email [legal@resume-ats.com](mailto:legal@resume-ats.com).`,
      tags: ["legal"],
      isPublished: true,
      metaDescription: "ResumeATS Terms of Service — the rules and guidelines for using our ATS resume checker and resume builder.",
    },
  ]);
  console.log("  Created pages");

  // --- Blog Posts ---
  await db.insert(blogPost).values([
    // Glossary
    {
      slug: "what-is-ats",
      title: "What Is an ATS? (Applicant Tracking System Explained)",
      excerpt: "Learn what an Applicant Tracking System is, how it works, and why it matters for your job search.",
      category: "glossary",
      author: "ResumeATS Team",
      content: `## What Is an ATS?

An **Applicant Tracking System (ATS)** is software used by employers to manage the recruitment process. It collects, sorts, scans, and ranks job applications automatically — often before a human ever sees your resume.

Over 97% of Fortune 500 companies use an ATS, and adoption among mid-size companies is growing rapidly. If you're applying for jobs online, your resume almost certainly passes through one.

## How Does an ATS Work?

When you submit a resume through an online job portal, the ATS:

1. **Parses** your resume — extracting text and identifying sections like contact info, work experience, education, and skills
2. **Indexes** the content — storing keywords, job titles, dates, and other structured data
3. **Ranks** your application — comparing your resume against the job description to calculate a relevance score
4. **Filters** candidates — recruiters see a ranked list and often only review the top-scoring applicants

## Why Does It Matter?

If your resume isn't optimized for ATS parsing, it might never reach a recruiter — even if you're perfectly qualified. Common issues include:

- **Non-standard formatting** — tables, columns, headers/footers, and text boxes can confuse parsers
- **Missing keywords** — if the ATS can't find relevant skills and job titles, your score drops
- **Incompatible file types** — some systems struggle with certain PDF formats or image-heavy resumes

## How to Optimize Your Resume for ATS

### Use a clean, single-column layout
Avoid multi-column designs, tables, and graphics. Stick to standard section headings like "Work Experience," "Education," and "Skills."

### Include relevant keywords
Mirror the language from the job description. If the posting says "project management," use that exact phrase rather than just "PM."

### Use standard fonts
Stick with Arial, Calibri, Times New Roman, or other system fonts. Custom or decorative fonts can cause parsing errors.

### Submit the right file format
PDF is generally safe, but check the application instructions. Some older ATS platforms prefer .docx files.

### Test your resume
Use a tool like ResumeATS to check your resume's ATS compatibility score before submitting. You'll get specific feedback on what to fix.

## Popular ATS Platforms

Some of the most widely used applicant tracking systems include:

- **Workday** — common among large enterprises
- **Greenhouse** — popular with tech companies and startups
- **Lever** — known for its collaborative hiring features
- **iCIMS** — widely used across industries
- **Taleo (Oracle)** — one of the oldest and most established systems

Each has slightly different parsing capabilities, which is why a broadly optimized resume performs best.

## Key Takeaway

An ATS is the gatekeeper between your resume and a human recruiter. Understanding how it works — and formatting your resume accordingly — is one of the highest-leverage things you can do in your job search.`,
      readingTime: 4,
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2026-02-15"),
      metaDescription: "Learn what an Applicant Tracking System (ATS) is, how it scans and ranks resumes, and how to optimize yours to get past the filter.",
      templateData: {
        term: "Applicant Tracking System",
        relatedSlugs: ["what-is-ats-score", "what-are-ats-keywords"],
        faqs: [
          { question: "What does ATS stand for?", answer: "ATS stands for Applicant Tracking System — software used by employers to manage job applications, scan resumes, and rank candidates automatically." },
          { question: "Do all companies use an ATS?", answer: "Not all, but the vast majority of mid-size and large companies do. Over 97% of Fortune 500 companies use an ATS, and adoption is growing among smaller businesses too." },
          { question: "Can an ATS reject my resume?", answer: "Yes. If your resume doesn't match enough keywords or can't be parsed properly, the ATS may rank it so low that no recruiter ever sees it." },
        ],
      },
    },
    {
      slug: "what-is-ats-score",
      title: "What Is an ATS Score? How Resumes Get Ranked",
      excerpt: "Understand how ATS scoring works and what determines whether your resume ranks high or gets filtered out.",
      category: "glossary",
      author: "ResumeATS Team",
      content: `## What Is an ATS Score?

An **ATS score** is a numerical ranking that an Applicant Tracking System assigns to your resume based on how well it matches a specific job description. Think of it as a compatibility percentage between your resume and the role you're applying for.

## How Is the Score Calculated?

While each ATS platform uses its own algorithm, most scores are based on:

### Keyword Match
The system compares keywords in your resume against those in the job description. This includes hard skills (e.g., "Python," "project management"), job titles, certifications, and industry-specific terminology.

### Section Completeness
ATS platforms look for standard resume sections: contact information, work experience, education, and skills. Missing sections can lower your score.

### Experience Relevance
Job titles, years of experience, and the recency of your roles all factor in. A senior engineer applying for a senior role scores higher than a junior candidate for the same position.

### Formatting and Parseability
If the ATS can't read your resume correctly — due to tables, images, or unusual formatting — it may fail to extract key information, resulting in a lower score.

## What's a Good ATS Score?

There's no universal scale, but in general:

- **80–100%** — Strong match. Your resume is well-optimized for this role.
- **60–79%** — Decent match. Some improvements could help you rank higher.
- **Below 60%** — Weak match. Significant keyword or formatting gaps.

## How to Improve Your ATS Score

1. **Tailor your resume** to each job description — don't use one generic resume for every application
2. **Use exact keyword matches** — if the JD says "data analysis," don't just write "analytics"
3. **Quantify achievements** — metrics help both ATS algorithms and human reviewers
4. **Check formatting** — use a simple, single-column layout with standard section headings
5. **Test before submitting** — run your resume through ResumeATS to see your score and get improvement suggestions

## Key Takeaway

Your ATS score determines whether a recruiter ever sees your resume. By understanding what factors drive the score and optimizing accordingly, you dramatically improve your chances of landing an interview.`,
      readingTime: 3,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-02-18"),
      metaDescription: "Learn what an ATS score is, how applicant tracking systems rank resumes, and what you can do to improve your score.",
      templateData: {
        term: "ATS Score",
        relatedSlugs: ["what-is-ats", "what-are-ats-keywords"],
        faqs: [
          { question: "What is a good ATS score?", answer: "Generally, 80% or above is considered a strong match. Scores between 60-79% are decent but could be improved. Below 60% indicates significant gaps." },
          { question: "Is the ATS score the same across all systems?", answer: "No. Each ATS platform uses its own algorithm, so your score can vary between systems. Optimizing broadly for keyword match, formatting, and completeness works across all of them." },
        ],
      },
    },
    {
      slug: "what-are-ats-keywords",
      title: "What Are ATS Keywords? A Complete Guide",
      excerpt: "Discover what ATS keywords are, where to find them, and how to use them effectively in your resume.",
      category: "glossary",
      author: "ResumeATS Team",
      content: `## What Are ATS Keywords?

**ATS keywords** are specific words and phrases that an Applicant Tracking System looks for when scanning your resume. They typically come directly from the job description and include:

- **Hard skills** — Python, SQL, Figma, project management, financial modeling
- **Soft skills** — leadership, collaboration, communication
- **Job titles** — Software Engineer, Product Manager, Data Analyst
- **Certifications** — PMP, AWS Certified, CPA, Six Sigma
- **Industry terms** — agile, SaaS, HIPAA compliance, B2B

## Why Do Keywords Matter?

When an ATS scans your resume, it builds a keyword profile and compares it against the job description. The more relevant keywords you include, the higher your match score — and the more likely a recruiter is to see your application.

## Where to Find the Right Keywords

### 1. The Job Description
This is your primary source. Read the posting carefully and note every skill, tool, qualification, and responsibility mentioned.

### 2. Multiple Job Postings
Look at 3-5 similar roles at different companies. Keywords that appear across multiple postings are especially important — they represent industry-standard expectations.

### 3. LinkedIn Profiles
Search for people currently in the role you're targeting. Their profiles often contain keywords you might have missed.

## How to Use Keywords Effectively

### Be Specific
Use the exact phrasing from the job description. If it says "cross-functional collaboration," use that phrase — not just "teamwork."

### Use Them in Context
Don't keyword-stuff. Integrate keywords naturally into your work experience bullets and skills section.

### Include Both Acronyms and Full Terms
Write "Search Engine Optimization (SEO)" the first time, so the ATS catches both versions.

### Prioritize Hard Skills
ATS algorithms typically weight hard skills and technical terms more heavily than soft skills.

### Place Keywords Strategically
Include them in your:
- Professional summary
- Work experience bullets
- Skills section
- Certifications

## Common Keyword Mistakes

- **Using synonyms the ATS doesn't recognize** — "People Management" instead of "Team Leadership" when the JD uses the latter
- **Hiding keywords in white text** — some ATS platforms can detect this, and recruiters will reject your resume
- **Overloading your skills section** — list only skills you can actually demonstrate in an interview

## Key Takeaway

ATS keywords are the bridge between your resume and a recruiter's inbox. Extract them from the job description, use them naturally throughout your resume, and verify your keyword coverage with a tool like ResumeATS before you apply.`,
      readingTime: 4,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-02-20"),
      metaDescription: "Learn what ATS keywords are, where to find them in job descriptions, and how to use them to boost your resume's ATS score.",
      templateData: {
        term: "ATS Keywords",
        relatedSlugs: ["what-is-ats", "what-is-ats-score"],
        faqs: [
          { question: "How many keywords should I include in my resume?", answer: "There's no magic number. Focus on covering the most important 10-15 keywords from the job description, used naturally in context throughout your resume." },
          { question: "Should I use the exact same words as the job description?", answer: "Yes, whenever possible. ATS systems often do exact-match comparisons, so using the same phrasing improves your chances of a keyword match." },
        ],
      },
    },
    // Resume Guides
    {
      slug: "software-engineer-resume-guide",
      title: "Software Engineer Resume Guide (2026)",
      excerpt: "Everything you need to write a software engineer resume that passes ATS filters and impresses hiring managers.",
      category: "resume-guide",
      author: "ResumeATS Team",
      content: `## Software Engineer Resume Guide

Getting a software engineering job in 2026 is competitive. Your resume needs to clear automated ATS filters and impress technical recruiters — often in under 30 seconds.

This guide covers the exact structure, keywords, and strategies that work.

## Resume Structure

### Contact Information
Include your full name, email, phone, LinkedIn, and GitHub. City and state are enough — no street address needed.

### Professional Summary (2-3 sentences)
Lead with years of experience, core technologies, and a quantified achievement.

> Full-stack software engineer with 4+ years building scalable web applications in TypeScript and Python. Led a team of 5 engineers to deliver a payments platform processing $2M+ in monthly transactions. Passionate about clean architecture and developer experience.

### Technical Skills
Organize into categories:

- **Languages:** TypeScript, Python, Go, SQL
- **Frontend:** React, Next.js, Tailwind CSS
- **Backend:** Node.js, FastAPI, PostgreSQL, Redis
- **Infrastructure:** AWS, Docker, Kubernetes, Terraform
- **Tools:** Git, GitHub Actions, Datadog, Jira

### Work Experience
Use reverse chronological order. For each role:

- **Job title** | Company | Dates
- 3-5 bullet points starting with strong action verbs
- Quantify impact whenever possible

**Strong bullets:**
- "Reduced API response time by 40% by implementing Redis caching layer, improving user experience for 50k+ daily active users"
- "Built CI/CD pipeline with GitHub Actions, cutting deployment time from 45 minutes to 8 minutes"
- "Designed and shipped a real-time notification system handling 100k events/day using WebSockets and Redis Pub/Sub"

**Weak bullets:**
- "Responsible for backend development"
- "Worked on various features"
- "Helped with deployment"

### Education
Include degree, institution, and graduation year. GPA only if above 3.5 and you graduated within the last 3 years.

### Optional Sections
- **Projects** — especially valuable for early-career engineers
- **Certifications** — AWS, Google Cloud, etc.
- **Publications or talks** — if relevant

## ATS Optimization Tips

1. **Match the job title** — if the posting says "Software Engineer," use that exact title
2. **Mirror the tech stack** — list every technology mentioned in the JD that you actually know
3. **Use standard section headings** — "Work Experience" not "Where I've Built Things"
4. **Single-column layout** — no tables, no columns, no graphics
5. **PDF format** — unless the application specifically requests .docx

## Keywords to Include

Based on analysis of 1,000+ software engineering job postings, the most common keywords are:

JavaScript/TypeScript, Python, React, Node.js, AWS, Docker, REST APIs, Git, SQL, Agile, CI/CD, microservices, testing, PostgreSQL, Kubernetes

## Common Mistakes

- Listing every technology you've ever touched (focus on what's relevant)
- No metrics or quantified achievements
- Functional or creative resume formats (use reverse chronological)
- Objective statements instead of professional summaries
- Missing GitHub or portfolio links

## Key Takeaway

A great software engineer resume is concise, metric-driven, and tailored to each role. Use the structure above, optimize for ATS keywords, and test your resume with ResumeATS before applying.`,
      readingTime: 5,
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2026-02-22"),
      metaDescription: "Complete guide to writing a software engineer resume in 2026. ATS-optimized structure, keywords, examples, and common mistakes to avoid.",
      templateData: {
        targetRole: "Software Engineer",
        relatedSlugs: ["software-engineer-resume-example", "what-are-ats-keywords"],
        faqs: [
          { question: "How long should a software engineer resume be?", answer: "One page for less than 10 years of experience, two pages maximum for senior/staff engineers. Recruiters spend an average of 7 seconds on initial review." },
          { question: "Should I include a GitHub link on my resume?", answer: "Yes. For software engineers, a GitHub profile with active contributions or portfolio projects adds credibility and can differentiate you from other candidates." },
          { question: "Do I need a cover letter for software engineering roles?", answer: "It depends on the company. Most tech companies don't require one, but a brief, tailored cover letter can help for competitive roles or career transitions." },
        ],
      },
    },
    {
      slug: "product-manager-resume-guide",
      title: "Product Manager Resume Guide (2026)",
      excerpt: "How to write a product manager resume that showcases impact, clears ATS filters, and gets interviews.",
      category: "resume-guide",
      author: "ResumeATS Team",
      content: `## Product Manager Resume Guide

Product management is one of the most competitive fields in tech. Your resume needs to demonstrate strategic thinking, execution ability, and measurable business impact — all in a format that ATS platforms can parse.

## What Hiring Managers Look For

PM hiring managers typically evaluate:

1. **Impact** — did you move metrics that matter?
2. **Scope** — how complex were the problems you solved?
3. **Leadership** — can you drive alignment across engineering, design, and business?
4. **Strategic thinking** — do you understand the "why" behind product decisions?

Your resume should clearly demonstrate all four.

## Resume Structure

### Professional Summary
Lead with years of PM experience, domain expertise, and your biggest metric.

> Product manager with 6 years of experience building B2B SaaS products. Led the launch of a self-serve onboarding flow that increased free-to-paid conversion by 35% and reduced support tickets by 50%. Experienced in data-driven product development, A/B testing, and cross-functional team leadership.

### Work Experience
This is the heart of your PM resume. Each bullet should follow the **Action → Context → Result** framework:

**Strong bullets:**
- "Defined and launched a new pricing tier that generated $1.2M in incremental ARR within 6 months"
- "Led cross-functional team of 8 (engineering, design, data science) to redesign the user onboarding flow, improving 7-day retention by 22%"
- "Identified and prioritized a critical payment flow issue through user research and data analysis, reducing cart abandonment by 18%"

**Weak bullets:**
- "Managed product roadmap"
- "Collaborated with engineering team"
- "Conducted user research"

### Skills Section
Include both PM-specific and domain skills:

- **Product:** Product strategy, roadmap planning, user research, A/B testing, product analytics
- **Tools:** Jira, Figma, Amplitude, Mixpanel, SQL, Tableau
- **Domain:** B2B SaaS, marketplace, fintech, healthcare (whatever applies)

### Education
MBA is helpful but not required. If you have one, list it. If not, focus on certifications and continuous learning.

## ATS Keywords for Product Managers

Based on analysis of PM job postings:

Product strategy, roadmap, user research, A/B testing, data-driven, cross-functional, agile, sprint planning, OKRs, KPIs, user stories, PRD, market analysis, competitive analysis, stakeholder management, SQL, product analytics, growth, retention, conversion

## Formatting Tips

- **One page** unless you have 10+ years of experience
- **Reverse chronological** order
- **Quantify everything** — revenue, users, conversion rates, time savings
- **Single-column layout** for ATS compatibility
- **Standard section headings** — Work Experience, not "Impact I've Made"

## Key Takeaway

The best PM resumes tell a story of impact through metrics. Structure each bullet around measurable outcomes, mirror the job description's language, and keep the formatting simple for ATS compatibility.`,
      readingTime: 4,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-02-25"),
      metaDescription: "Step-by-step guide to writing a product manager resume in 2026. Includes ATS keywords, bullet examples, and formatting best practices.",
      templateData: {
        targetRole: "Product Manager",
        relatedSlugs: ["software-engineer-resume-guide", "what-are-ats-keywords"],
        faqs: [
          { question: "Do product managers need technical skills on their resume?", answer: "It helps. Listing SQL, basic data analysis tools, and familiarity with engineering concepts shows you can collaborate effectively with technical teams." },
          { question: "Should I include side projects on a PM resume?", answer: "Yes, if they demonstrate product thinking — especially for career changers. Launching a side project, running user research, or building a prototype all count." },
        ],
      },
    },
    // Resume Examples
    {
      slug: "software-engineer-resume-example",
      title: "Software Engineer Resume Example",
      excerpt: "A complete, ATS-optimized software engineer resume example you can use as a template.",
      category: "resume-example",
      author: "ResumeATS Team",
      content: `## Software Engineer Resume Example

Below is a complete, ATS-optimized resume example for a mid-level software engineer. Use it as a starting point and customize it for your own experience.

---

## Alex Chen
San Francisco, CA | alex.chen@email.com | (555) 123-4567
LinkedIn: linkedin.com/in/alexchen | GitHub: github.com/alexchen

---

### Professional Summary

Full-stack software engineer with 4 years of experience building high-performance web applications. Proficient in TypeScript, React, and Node.js. Delivered features used by 200k+ monthly active users. Passionate about clean code, developer tooling, and user experience.

---

### Technical Skills

**Languages:** TypeScript, JavaScript, Python, SQL, Go
**Frontend:** React, Next.js, Redux, Tailwind CSS, HTML/CSS
**Backend:** Node.js, Express, PostgreSQL, Redis, GraphQL
**Infrastructure:** AWS (EC2, S3, Lambda), Docker, GitHub Actions, Terraform
**Tools:** Git, Datadog, Sentry, Jira, Figma

---

### Work Experience

**Software Engineer** | TechCorp Inc. | San Francisco, CA | Jan 2023 – Present
- Built and maintained a customer-facing dashboard serving 200k+ monthly active users, using React and Next.js with server-side rendering
- Reduced page load time by 55% by implementing code splitting, image optimization, and edge caching with Vercel
- Designed and shipped a RESTful API for the billing module, processing 15k+ transactions/month with zero downtime
- Led migration from JavaScript to TypeScript across 3 services, reducing production bugs by 30%
- Mentored 2 junior engineers through pair programming and structured code reviews

**Junior Software Engineer** | StartupXYZ | Remote | Jun 2021 – Dec 2022
- Developed real-time notification system using WebSockets and Redis Pub/Sub, handling 50k+ events/day
- Implemented automated testing pipeline with Jest and Cypress, achieving 85% code coverage
- Built internal admin dashboard used by operations team to manage 5k+ customer accounts
- Collaborated with product and design teams in agile sprints to ship features on 2-week cycles

---

### Education

**B.S. Computer Science** | University of California, Berkeley | 2021
GPA: 3.8/4.0

---

### Certifications

AWS Certified Developer – Associate (2024)

---

## Why This Resume Works

- **ATS-friendly format** — single column, standard section headings, clean hierarchy
- **Quantified impact** — specific numbers in every bullet (200k users, 55% faster, 30% fewer bugs)
- **Keyword-rich** — includes technologies and skills that match common job descriptions
- **Concise** — fits on one page while covering all essential sections
- **Strong action verbs** — Built, Reduced, Designed, Led, Implemented

## How to Customize This Example

1. Replace the skills with your own tech stack
2. Rewrite bullets to reflect your specific achievements and metrics
3. Match keywords to the job description you're applying for
4. Run the final version through ResumeATS to check your score`,
      readingTime: 4,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-02-26"),
      metaDescription: "ATS-optimized software engineer resume example with professional summary, skills, and quantified work experience bullets. Use as a template.",
      templateData: {
        targetRole: "Software Engineer",
        relatedSlugs: ["software-engineer-resume-guide", "what-are-ats-keywords"],
        faqs: [
          { question: "Can I copy this resume example exactly?", answer: "Use it as a structural template, but always customize the content to reflect your own experience, skills, and achievements. Recruiters can spot generic resumes." },
          { question: "Should I include a GitHub link?", answer: "Absolutely. For software engineers, a GitHub profile with real projects demonstrates practical ability beyond what a resume can convey." },
        ],
      },
    },
    {
      slug: "nurse-resume-example",
      title: "Nurse Resume Example",
      excerpt: "An ATS-optimized registered nurse resume example with clinical experience, certifications, and skills.",
      category: "resume-example",
      author: "ResumeATS Team",
      content: `## Registered Nurse Resume Example

Below is a complete, ATS-optimized resume example for a registered nurse. Customize it with your own clinical experience and certifications.

---

## Sarah Martinez, RN, BSN
Chicago, IL | sarah.martinez@email.com | (555) 987-6543
LinkedIn: linkedin.com/in/sarahmartinezrn

---

### Professional Summary

Registered Nurse with 5 years of experience in acute care and emergency medicine. Skilled in patient assessment, care planning, and interdisciplinary collaboration. Managed care for 6-8 patients per shift in a high-volume ED with 85k+ annual visits. BLS, ACLS, and TNCC certified.

---

### Licenses & Certifications

- Registered Nurse (RN) — Illinois Board of Nursing, License #041-XXXXX
- Basic Life Support (BLS) — American Heart Association, exp. 2027
- Advanced Cardiovascular Life Support (ACLS) — AHA, exp. 2027
- Trauma Nursing Core Course (TNCC) — ENA, exp. 2027
- NIH Stroke Scale Certified

---

### Clinical Skills

Patient Assessment, IV Therapy, Medication Administration, Wound Care, Ventilator Management, Cardiac Monitoring, EHR Documentation (Epic, Cerner), Patient Education, Triage, Infection Control, Code Blue Response

---

### Work Experience

**Emergency Department RN** | Northwestern Memorial Hospital | Chicago, IL | Mar 2023 – Present
- Provide direct patient care for 6-8 patients per shift in a Level I trauma center with 85k+ annual ED visits
- Conduct rapid triage assessments, prioritizing patients by acuity level to ensure timely treatment
- Administer medications, IV fluids, and blood products following physician orders and hospital protocols
- Collaborate with physicians, specialists, and social workers in interdisciplinary care planning
- Precept 4 new graduate nurses, developing orientation materials and competency checklists

**Medical-Surgical RN** | Rush University Medical Center | Chicago, IL | Jun 2021 – Feb 2023
- Managed care for 5-6 patients on a 36-bed medical-surgical unit with complex, multi-system diagnoses
- Reduced patient fall rate by 25% by implementing hourly rounding protocol and bedside handoff process
- Documented patient assessments, interventions, and outcomes in Epic EHR with 98% charting compliance
- Served on the unit's Quality Improvement committee, leading a catheter-associated UTI (CAUTI) reduction initiative

---

### Education

**Bachelor of Science in Nursing (BSN)** | University of Illinois at Chicago | 2021

---

## Why This Resume Works

- **Certifications are prominent** — nursing recruiters scan for specific licenses and certs first
- **Clinical keywords** — includes terminology that ATS platforms look for in nursing roles
- **Quantified impact** — patient ratios, annual visit volumes, fall rate reduction
- **Standard format** — single column, clear sections, easy to parse

## ATS Keywords for Nursing Resumes

Patient assessment, medication administration, IV therapy, wound care, EHR, Epic, Cerner, triage, BLS, ACLS, infection control, patient education, care planning, interdisciplinary collaboration, discharge planning, clinical documentation`,
      readingTime: 4,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-02-27"),
      metaDescription: "ATS-optimized registered nurse resume example with clinical skills, certifications, and quantified experience bullets. Use as a template for your nursing resume.",
      templateData: {
        targetRole: "Registered Nurse",
        relatedSlugs: ["what-is-ats", "what-are-ats-keywords"],
        faqs: [
          { question: "Should I list all my certifications on a nursing resume?", answer: "List all current, relevant certifications. For nurses, certifications like BLS, ACLS, and specialty certs are often required and heavily weighted by ATS filters." },
          { question: "How important is the EHR system I know?", answer: "Very. Many nursing job descriptions specifically mention Epic or Cerner. Include the systems you're proficient in, as these are common ATS keywords." },
        ],
      },
    },
    // Comparisons
    {
      slug: "resume-vs-cv",
      title: "Resume vs CV: What's the Difference?",
      excerpt: "Understand when to use a resume vs a CV, how they differ in format and content, and which ATS systems expect.",
      category: "comparison",
      author: "ResumeATS Team",
      content: `## Resume vs CV: What's the Difference?

The terms "resume" and "CV" are often used interchangeably, but they serve different purposes. Using the wrong one can hurt your application — especially when ATS systems are involved.

## Resume: The Quick Version

A **resume** is a concise, 1-2 page document tailored to a specific job. It highlights your most relevant experience, skills, and achievements.

**Best for:**
- Corporate jobs in the US, Canada, and Australia
- Most private-sector positions
- Tech, business, marketing, engineering, and similar fields

**Key characteristics:**
- 1-2 pages maximum
- Tailored to each job application
- Focuses on relevant experience and skills
- Uses reverse chronological format
- Optimized for ATS scanning

## CV: The Full Picture

A **CV (Curriculum Vitae)** is a comprehensive document that covers your entire academic and professional history. It can be 3-10+ pages.

**Best for:**
- Academic positions (professor, researcher)
- Medical and scientific roles
- International job applications (especially Europe, UK, and Asia)
- Grants, fellowships, and academic appointments

**Key characteristics:**
- No page limit
- Includes publications, research, presentations, and teaching experience
- More comprehensive and less tailored
- Updated infrequently

## Key Differences

| | Resume | CV |
|---|---|---|
| **Length** | 1-2 pages | 3-10+ pages |
| **Focus** | Relevant experience | Complete history |
| **Tailoring** | Customized per job | Generally static |
| **Use case** | Most jobs (US/Canada) | Academia, medicine, international |
| **ATS optimization** | Essential | Less common |

## Which One Do ATS Systems Expect?

Most ATS platforms are designed to parse **resumes** — concise, keyword-rich documents with standard sections. If you submit a 10-page CV to a system expecting a resume, the parser may:

- Truncate your document
- Miss important keywords that appear on later pages
- Rank you lower due to information density issues

**Rule of thumb:** Unless the job posting specifically asks for a CV, submit a resume.

## When You're Unsure

- **US/Canada private sector** → Resume
- **US/Canada academia** → CV
- **Europe** → Check the posting; "CV" in Europe often means what Americans call a resume
- **The posting says "CV or resume"** → Submit a resume unless you're in academia

## Key Takeaway

A resume is a targeted marketing document; a CV is a comprehensive record. For most job applications — especially those processed by ATS — a well-crafted, keyword-optimized resume is the way to go.`,
      readingTime: 4,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-03-01"),
      metaDescription: "Resume vs CV: learn the key differences, when to use each, and which format ATS systems expect. Includes comparison table and practical guidance.",
      templateData: {
        comparisonA: "Resume",
        comparisonB: "CV",
        relatedSlugs: ["what-is-ats", "one-page-vs-two-page-resume"],
        faqs: [
          { question: "Is a CV the same as a resume?", answer: "No. A resume is a 1-2 page targeted document, while a CV is a comprehensive academic/professional history that can span many pages. In some countries (like the UK), 'CV' is used colloquially to mean 'resume.'" },
          { question: "Should I send a CV to a tech company?", answer: "No. Tech companies expect a concise resume, typically one page. Sending a multi-page CV may hurt your chances as ATS systems and recruiters prefer brevity." },
        ],
      },
    },
    {
      slug: "one-page-vs-two-page-resume",
      title: "One-Page vs Two-Page Resume: Which Is Better?",
      excerpt: "Settle the debate: when a one-page resume works, when two pages are acceptable, and what ATS systems prefer.",
      category: "comparison",
      author: "ResumeATS Team",
      content: `## One-Page vs Two-Page Resume

The one-page resume rule is one of the most debated topics in career advice. Here's what actually matters in 2026.

## The One-Page Resume

**Best for:**
- Less than 8-10 years of experience
- Early to mid-career professionals
- Career changers
- Most entry-level and mid-level roles

**Advantages:**
- Forces you to prioritize your most impressive and relevant experience
- Easier for recruiters to scan quickly (average review time: 7 seconds)
- ATS systems process the full document without truncation concerns
- Demonstrates editing and communication skills

## The Two-Page Resume

**Best for:**
- 10+ years of experience with progressive career growth
- Senior, director, or executive roles
- Roles requiring extensive technical skill lists
- Government or federal positions (which often expect detailed experience)

**Advantages:**
- Room to include more quantified achievements
- Space for relevant certifications, publications, or patents
- Can better demonstrate depth of experience for senior roles

## What ATS Systems Prefer

ATS platforms don't penalize resume length directly. They scan and index the entire document regardless of page count. However:

- **More pages = more noise** — irrelevant content can dilute your keyword density
- **Two-page resumes with lots of early-career filler** score lower because the ratio of relevant keywords to total content drops
- **Well-curated one-page resumes** often score higher because every line is targeted

## The Real Answer

**It's not about pages — it's about relevance.**

A one-page resume with highly relevant, quantified experience will outperform a two-page resume padded with generic responsibilities. Conversely, artificially compressing 15 years of senior leadership experience onto one page wastes valuable content.

## Guidelines

| Experience Level | Recommended Length |
|---|---|
| 0-3 years | 1 page (no exceptions) |
| 3-8 years | 1 page (preferred) |
| 8-15 years | 1-2 pages |
| 15+ years / executive | 2 pages |

## Tips for Staying on One Page

- Cut bullets that don't include metrics or specific achievements
- Remove roles from 10+ years ago (unless highly relevant)
- Condense your skills section — no need to list every tool
- Use a professional summary instead of an objective statement
- Reduce margins slightly (but no less than 0.5 inches)

## Key Takeaway

Default to one page. Go to two only if you have the senior experience to fill both pages with relevant, quantified achievements. When in doubt, test both versions with ResumeATS and compare scores.`,
      readingTime: 4,
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date("2026-03-03"),
      metaDescription: "One-page vs two-page resume: learn which length is right for your experience level, what ATS systems prefer, and how to decide.",
      templateData: {
        comparisonA: "One-Page Resume",
        comparisonB: "Two-Page Resume",
        relatedSlugs: ["resume-vs-cv", "what-is-ats-score"],
        faqs: [
          { question: "Will a two-page resume hurt my ATS score?", answer: "Not directly. ATS systems scan the entire document. However, a shorter, more targeted resume often has better keyword density, which can result in a higher match score." },
          { question: "Is it ever okay for a new grad to have a two-page resume?", answer: "Rarely. With less than 3 years of experience, one page is the standard. A two-page resume at this stage usually signals poor editing, not more experience." },
        ],
      },
    },
    {
      slug: "resumeats-vs-jobscan",
      title: "ResumeATS vs Jobscan: Which ATS Checker Is Better?",
      excerpt: "An honest comparison of ResumeATS and Jobscan — features, pricing, accuracy, and which tool is right for you.",
      category: "comparison",
      author: "ResumeATS Team",
      content: `## ResumeATS vs Jobscan

Choosing the right ATS checker can make a real difference in your job search. Here's how ResumeATS compares to Jobscan across the criteria that matter most.

## Overview

**ResumeATS** is a free ATS resume checker and builder that analyzes your resume against a job description and provides detailed scoring across 8 categories — from keyword matching to formatting and content quality.

**Jobscan** is an established ATS optimization tool that compares your resume to job descriptions and provides a match rate percentage with keyword and formatting suggestions.

## Feature Comparison

| Feature | ResumeATS | Jobscan |
|---|---|---|
| ATS score analysis | 8 detailed categories | Match rate + keyword list |
| Resume builder | Included (ATS-optimized templates) | Separate tool |
| Price | Free tier available | Free limited / $49.95/mo |
| Real-time streaming | Yes — scores stream live | Results after processing |
| Keyword analysis | Context-aware with synonym matching | Keyword match list |
| Formatting check | Detailed parseability analysis | Basic formatting tips |
| Content quality | Action verb and metric analysis | Not included |

## Scoring Depth

**ResumeATS** breaks your score into 8 weighted categories:
1. Parseability (can the ATS read your resume?)
2. Section completeness
3. Hard skills match
4. Content quality
5. Job title alignment
6. Experience depth
7. Soft skills
8. Education match

Each category includes specific feedback and recommendations. This granularity helps you understand exactly *why* your score is what it is and *where* to focus improvements.

**Jobscan** provides an overall match rate and a keyword comparison. It's simpler but less diagnostic — you see what keywords are missing, but less about formatting issues or content quality.

## Resume Building

**ResumeATS** includes a built-in resume builder with ATS-optimized templates. You can build your resume and check its score in one workflow.

**Jobscan** offers resume building as a separate product (Jobscan Resume Builder) with its own pricing.

## Pricing

**ResumeATS:** Free tier with core features. Paid plans for unlimited scans and advanced features.

**Jobscan:** Limited free scans, then $49.95/month for unlimited access. Annual plans available at a discount.

## Who Should Use Which?

**Choose ResumeATS if you want:**
- Detailed, multi-category scoring
- A combined ATS checker + resume builder
- Free access to core features
- Real-time analysis streaming

**Choose Jobscan if you want:**
- An established brand with a longer track record
- LinkedIn profile optimization (a Jobscan-specific feature)
- Integration with specific job boards

## Key Takeaway

Both tools help you optimize your resume for ATS systems. ResumeATS offers deeper analysis across more categories and includes a resume builder at a lower price point. Jobscan has broader brand recognition and a LinkedIn optimization feature. Try both and see which workflow suits you better.`,
      readingTime: 4,
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date("2026-03-05"),
      metaDescription: "ResumeATS vs Jobscan: compare features, pricing, scoring depth, and accuracy. Find out which ATS checker is the best fit for your job search.",
      templateData: {
        comparisonA: "ResumeATS",
        comparisonB: "Jobscan",
        relatedSlugs: ["what-is-ats", "what-is-ats-score"],
        faqs: [
          { question: "Is ResumeATS free?", answer: "Yes, ResumeATS offers a free tier with core ATS checking features. Paid plans are available for unlimited scans and advanced analysis." },
          { question: "Which ATS checker is more accurate?", answer: "Both tools provide useful analysis. ResumeATS offers more granular scoring across 8 categories, while Jobscan focuses on keyword matching. Accuracy depends on how you define it — keyword coverage vs. comprehensive resume quality." },
          { question: "Can I use both tools together?", answer: "Absolutely. Some job seekers use ResumeATS for in-depth resume analysis and building, and Jobscan for LinkedIn optimization. They complement each other well." },
        ],
      },
    },
  ]);
  console.log("  Created blog posts");

  // --- Sample resume for admin ---
  const [savedResumeRow] = await db.insert(savedResume).values({
    userId: adminId,
    name: "Software Engineer Resume",
    templateType: "reverse-chronological",
    resumeData: {
      contactInfo: {
        fullName: "Admin User",
        email: seedEmail,
        phone: "+1 555-0100",
        linkedIn: "linkedin.com/in/admin",
        location: "San Francisco, CA",
      },
      professionalSummary:
        "Full-stack engineer with 5+ years building scalable web applications. Proficient in React, Node.js, and PostgreSQL.",
      workExperience: [
        {
          jobTitle: "Senior Software Engineer",
          company: "Acme Corp",
          location: "San Francisco, CA",
          startDate: "2022-01",
          endDate: "Present",
          bullets: [
            "Led migration from monolith to microservices, reducing deploy time by 70%",
            "Mentored 3 junior engineers through structured code review process",
            "Built real-time notification system handling 50k events/min",
          ],
        },
        {
          jobTitle: "Software Engineer",
          company: "StartupCo",
          location: "Remote",
          startDate: "2019-06",
          endDate: "2021-12",
          bullets: [
            "Developed customer-facing dashboard used by 10k+ monthly active users",
            "Implemented CI/CD pipeline cutting release cycle from 2 weeks to 2 days",
          ],
        },
      ],
      education: [
        {
          degree: "B.S. Computer Science",
          institution: "UC Berkeley",
          location: "Berkeley, CA",
          graduationDate: "2019-05",
          gpa: "3.7",
        },
      ],
      skills: [
        { category: "Languages", items: ["TypeScript", "Python", "Go", "SQL"] },
        { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
        { category: "Backend", items: ["Node.js", "PostgreSQL", "Redis", "Docker"] },
      ],
      certifications: [
        { name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023-03" },
      ],
    },
  }).returning();
  console.log("  Created sample resume");

  // --- Sample scan for admin ---
  await db.insert(resumeScan).values({
    userId: adminId,
    fileName: "admin_resume.pdf",
    fileType: "application/pdf",
    fileSize: 48200,
    extractedText: "Admin User — Senior Software Engineer…",
    jobDescription: "Looking for a senior full-stack engineer with React and Node.js experience.",
    jobTitle: "Senior Software Engineer",
    status: 'complete',
    overallScore: 82.5,
    parseabilityScore: {
      score: 95,
      weight: 15,
      feedback: ["Clean PDF format", "Standard fonts used"],
      fileFormatQuality: "excellent",
      fontSafety: ["Arial", "Helvetica"],
      layoutSafety: "single-column",
      headerFooterIssues: [],
      graphicElements: [],
    },
    sectionCompletenessScore: {
      score: 90,
      weight: 10,
      feedback: ["All core sections present"],
      foundSections: ["contact", "summary", "experience", "education", "skills"],
      missingSections: ["projects"],
      nonStandardHeaders: [],
      contactInfo: { email: true, phone: true, linkedin: true, location: true },
    },
    hardSkillsScore: {
      score: 78,
      weight: 25,
      feedback: ["Strong match on core stack", "Missing Kubernetes mention"],
      matchedSkills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      missingSkills: ["Kubernetes", "GraphQL"],
      synonymMatches: [{ resume: "Tailwind CSS", jd: "CSS frameworks" }],
      keywordDensity: [
        { keyword: "React", count: 4 },
        { keyword: "Node.js", count: 3 },
      ],
    },
    contentQualityScore: {
      score: 85,
      weight: 15,
      feedback: ["Good use of metrics", "Strong action verbs"],
      actionVerbUsage: { good: ["Led", "Built", "Implemented"], weak: ["Helped"] },
      quantifiedAchievements: [
        { bullet: "reducing deploy time by 70%", metric: "70%" },
        { bullet: "50k events/min", metric: "50k" },
      ],
      bulletLengthIssues: [],
      fillerLanguage: [],
    },
    jobTitleAlignmentScore: {
      score: 90,
      weight: 10,
      feedback: ["Title closely matches target role"],
      targetTitle: "Senior Software Engineer",
      resumeTitles: ["Senior Software Engineer", "Software Engineer"],
      alignmentLevel: "exact",
    },
    experienceDepthScore: {
      score: 75,
      weight: 10,
      feedback: ["5 years total, 3 in senior role"],
      totalYears: 5,
      relevantYears: 5,
      positions: [
        { title: "Senior Software Engineer", company: "Acme Corp", years: 3 },
        { title: "Software Engineer", company: "StartupCo", years: 2.5 },
      ],
    },
    softSkillsScore: {
      score: 70,
      weight: 5,
      feedback: ["Mentorship evidence found"],
      identifiedSkills: ["Leadership", "Mentorship"],
      contextualEvidence: [
        { skill: "Mentorship", evidence: "Mentored 3 junior engineers" },
      ],
    },
    educationMatchScore: {
      score: 85,
      weight: 10,
      feedback: ["B.S. in CS meets requirement"],
      requiredDegree: "Bachelor's in Computer Science",
      foundDegrees: ["B.S. Computer Science"],
      certifications: ["AWS Solutions Architect"],
      isMatch: true,
    },
    summary:
      "Strong resume with good ATS compatibility. Main gaps: missing Kubernetes and GraphQL keywords. Consider adding a projects section.",
    topRecommendations: [
      "Add Kubernetes and GraphQL to skills section",
      "Include a projects section with relevant side projects",
      "Quantify more achievements in the StartupCo role",
    ],
  });
  console.log("  Created sample scan");

  // Link scan to resume
  const scans = await db.select().from(resumeScan).limit(1);
  if (scans[0] && savedResumeRow) {
    await db
      .update(savedResume)
      .set({ lastScanId: scans[0].id, lastScanScore: scans[0].overallScore })
      .where(eq(savedResume.id, savedResumeRow.id));
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
