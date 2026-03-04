import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { user, account, session, verification } from "./schema/auth-schema";
import { siteSettings, navbarItem, sidebarItem, footerList, page, originDomain } from "./schema/config-schema";
import { uploadedFile } from "./schema/file-schema";
import { resumeScan, savedResume } from "./schema/ats-schema";
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
  console.log("  Cleared existing data");

  // --- Auth: admin user (admin:admin) ---
  const adminId = id();
  const accountId = id();
  const hashedPassword = await hashPassword("admin");

  await db.insert(user).values({
    id: adminId,
    name: "Admin",
    email: "admin@admin.com",
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
  console.log("  Created admin user (admin@admin.com / admin)");

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
      title: "About",
      content: "ResumeATS helps job seekers optimize their resumes for Applicant Tracking Systems.",
      tags: ["company", "about"],
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: "Your data stays yours. We do not sell or share your personal information.",
      tags: ["legal"],
    },
    {
      slug: "terms",
      title: "Terms of Service",
      content: "By using ResumeATS you agree to these terms of service.",
      tags: ["legal"],
    },
  ]);
  console.log("  Created pages");

  // --- Sample resume for admin ---
  const [savedResumeRow] = await db.insert(savedResume).values({
    userId: adminId,
    name: "Software Engineer Resume",
    templateType: "reverse-chronological",
    resumeData: {
      contactInfo: {
        fullName: "Admin User",
        email: "admin@admin.com",
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
