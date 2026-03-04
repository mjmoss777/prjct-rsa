import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2D5A3D",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://resume-ats.com"),
  title: {
    default: "ResumeATS — ATS Resume Checker & Builder",
    template: "%s | ResumeATS",
  },
  description:
    "Beat the ATS. Land the interview. Check your resume against ATS systems and build ATS-optimized resumes.",
  keywords: [
    "ATS resume checker",
    "resume builder",
    "ATS optimization",
    "applicant tracking system",
    "resume score",
    "job application",
    "resume keywords",
  ],
  openGraph: {
    type: "website",
    siteName: "ResumeATS",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dmSans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
