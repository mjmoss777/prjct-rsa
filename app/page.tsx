import type { Metadata } from "next";
import Homepage from "@/components/pages/Homepage";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "ResumeATS — ATS Resume Checker & Builder",
  description:
    "Beat the ATS. Land the interview. Check your resume against applicant tracking systems and build ATS-optimized resumes that get you hired.",
  openGraph: {
    title: "ResumeATS — ATS Resume Checker & Builder",
    description:
      "Check your resume against ATS systems and build optimized resumes that land interviews.",
    url: "/",
  },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ResumeATS",
          url: "https://resume-ats.com",
          description:
            "ATS resume checker and builder. Beat the ATS. Land the interview.",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ResumeATS",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "Check your resume against applicant tracking systems and build ATS-optimized resumes.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />
      <Homepage />
    </>
  );
}
