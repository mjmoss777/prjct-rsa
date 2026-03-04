"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSession } from "@/config/auth/client";
import {
    colors,
    fontVars,
    typeScale,
    spacing,
    radii,
    focus,
    motion as motionTokens,
} from "@/themes/tokens";

const features = [
    {
        title: "ATS Score Checker",
        description:
            "Upload your resume and paste a job description. Get a detailed compatibility analysis with actionable feedback across 8 scoring categories.",
    },
    {
        title: "Resume Builder",
        description:
            "Build ATS-optimized resumes with proven templates. Single-column layouts, standard fonts, and proper formatting — guaranteed to parse correctly.",
    },
    {
        title: "Instant Feedback",
        description:
            "See your analysis stream in real-time. Scores update live as each category is evaluated, so you know exactly where to improve.",
    },
];

const howItWorks = [
    { step: "1", title: "Upload", description: "Drop your resume (PDF or DOCX) and paste the job description." },
    { step: "2", title: "Analyze", description: "AI evaluates your resume across 8 categories against the JD." },
    { step: "3", title: "Improve", description: "Follow specific recommendations to boost your ATS score." },
];

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: motionTokens.stagger.hero,
        },
    },
};

const featureStagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: motionTokens.stagger.features,
        },
    },
};

const focusVisible = {
    outline: focus.ring,
    outlineOffset: focus.offset,
} as const;

export default function Homepage() {
    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;
    const prefersReduced = useReducedMotion();
    const fadeUp = prefersReduced ? motionTokens.reducedFadeIn : motionTokens.fadeUp;
    const fadeDown = prefersReduced ? motionTokens.reducedFadeIn : motionTokens.fadeDown;
    const ease = [...motionTokens.ease] as [number, number, number, number];
    const dur = prefersReduced ? motionTokens.duration.reduced : undefined;

    return (
        <div
            className={`flex min-h-screen flex-col ${fontVars.body}`}
            style={{ backgroundColor: colors.surface }}
        >
            {/* Nav */}
            <motion.nav
                className="flex w-full items-center justify-between"
                style={{ paddingInline: spacing.pageX, paddingBlock: spacing.footer }}
                initial={fadeDown.hidden}
                animate={fadeDown.visible}
                transition={{ duration: dur ?? motionTokens.duration.fast, ease }}
            >
                <Link
                    href="/"
                    className={`${fontVars.display} no-underline`}
                    style={{ ...typeScale.title, color: colors.foreground }}
                >
                    ResumeATS
                </Link>
                <div className="flex items-center" style={{ gap: spacing.navGap }}>
                    {["Features", "How it Works"].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="transition-colors duration-200"
                            style={{
                                ...typeScale.label,
                                color: colors.muted,
                                touchAction: "manipulation",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = colors.foreground)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusVisible)}
                            onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.outlineOffset = ""; }}
                        >
                            {item}
                        </a>
                    ))}
                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-center transition-opacity duration-200 hover:opacity-90"
                            style={{
                                ...typeScale.buttonSm,
                                backgroundColor: colors.accent,
                                color: colors.onAccent,
                                borderRadius: radii.pill,
                                paddingBlock: "10px",
                                paddingInline: "24px",
                                touchAction: "manipulation",
                                textDecoration: "none",
                            }}
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="flex items-center justify-center transition-colors duration-200"
                                style={{
                                    ...typeScale.buttonSm,
                                    fontWeight: 400,
                                    border: `1px solid ${colors.borderSoft}`,
                                    color: colors.foreground,
                                    borderRadius: radii.pill,
                                    paddingBlock: "10px",
                                    paddingInline: "24px",
                                    touchAction: "manipulation",
                                    textDecoration: "none",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.hoverTint)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="flex items-center justify-center transition-opacity duration-200 hover:opacity-90"
                                style={{
                                    ...typeScale.buttonSm,
                                    backgroundColor: colors.accent,
                                    color: colors.onAccent,
                                    borderRadius: radii.pill,
                                    paddingBlock: "10px",
                                    paddingInline: "24px",
                                    touchAction: "manipulation",
                                    textDecoration: "none",
                                }}
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* Hero */}
            <motion.section
                className="flex w-full flex-1 flex-col items-center"
                style={{
                    paddingTop: spacing.heroTop,
                    paddingInline: spacing.pageX,
                    paddingBottom: spacing.sectionY,
                    gap: spacing.group,
                }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div
                    className="flex items-center"
                    style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radii.pill,
                        paddingBlock: "6px",
                        paddingInline: "16px",
                        gap: spacing.compact,
                    }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                >
                    <span
                        className="block shrink-0 rounded-full"
                        style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: colors.accentSoft,
                        }}
                    />
                    <span style={{ ...typeScale.tag, color: colors.muted }}>
                        Free to use
                    </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    className={`max-w-[800px] text-center ${fontVars.display}`}
                    style={{
                        ...typeScale.display,
                        color: colors.foreground,
                        textWrap: "balance",
                    }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? 0.7, ease }}
                >
                    Beat the ATS.
                    <br />
                    Land the interview.
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    className="max-w-[520px] text-center"
                    style={{ ...typeScale.body, color: colors.muted }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                >
                    Check your resume against real ATS scoring criteria, get actionable feedback,
                    and build resumes that actually get parsed.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex items-center"
                    style={{ gap: spacing.ctaGap }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                >
                    <Link
                        href="/sign-up"
                        className="flex items-center justify-center transition-opacity duration-200 hover:opacity-90"
                        style={{
                            ...typeScale.button,
                            backgroundColor: colors.accent,
                            color: colors.onAccent,
                            borderRadius: radii.pill,
                            paddingBlock: "14px",
                            paddingInline: "32px",
                            touchAction: "manipulation",
                            textDecoration: "none",
                        }}
                    >
                        Check your resume
                    </Link>
                    <a
                        href="#how-it-works"
                        className="flex items-center justify-center transition-colors duration-200"
                        style={{
                            ...typeScale.button,
                            fontWeight: 400,
                            border: `1px solid ${colors.borderSoft}`,
                            color: colors.foreground,
                            borderRadius: radii.pill,
                            paddingBlock: "14px",
                            paddingInline: "32px",
                            touchAction: "manipulation",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.hoverTint)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        See how it works
                    </a>
                </motion.div>
            </motion.section>

            {/* Features */}
            <motion.section
                id="features"
                className="flex w-full items-start justify-center"
                style={{
                    paddingInline: spacing.sectionX,
                    paddingBottom: spacing.sectionY,
                    gap: spacing.feature,
                }}
                variants={featureStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
            >
                {features.map((feature) => (
                    <motion.div
                        key={feature.title}
                        className="flex max-w-[320px] flex-col"
                        style={{ gap: spacing.element }}
                        variants={fadeUp}
                        transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                    >
                        <h3
                            className={fontVars.display}
                            style={{ ...typeScale.heading, color: colors.foreground }}
                        >
                            {feature.title}
                        </h3>
                        <p style={{ ...typeScale.bodySm, color: colors.muted }}>
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </motion.section>

            {/* How it Works */}
            <motion.section
                id="how-it-works"
                className="flex w-full flex-col items-center"
                style={{
                    paddingInline: spacing.sectionX,
                    paddingBottom: spacing.sectionY,
                    gap: "48px",
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
            >
                <motion.h2
                    className={`text-center ${fontVars.display}`}
                    style={{ ...typeScale.title, color: colors.foreground }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                >
                    How it works
                </motion.h2>
                <div className="flex items-start justify-center" style={{ gap: spacing.feature }}>
                    {howItWorks.map((item) => (
                        <motion.div
                            key={item.step}
                            className="flex max-w-[280px] flex-col items-center text-center"
                            style={{ gap: spacing.element }}
                            variants={fadeUp}
                            transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                        >
                            <span
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: colors.accent,
                                    color: colors.onAccent,
                                    ...typeScale.buttonSm,
                                }}
                            >
                                {item.step}
                            </span>
                            <h3
                                className={fontVars.display}
                                style={{ ...typeScale.heading, color: colors.foreground }}
                            >
                                {item.title}
                            </h3>
                            <p style={{ ...typeScale.bodySm, color: colors.muted }}>
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
                className="flex w-full items-center justify-between"
                style={{
                    paddingInline: spacing.pageX,
                    paddingBlock: spacing.footer,
                    borderTop: `1px solid ${colors.border}`,
                }}
                initial={motionTokens.fadeIn.hidden}
                whileInView={motionTokens.fadeIn.visible}
                viewport={{ once: true }}
                transition={{ duration: dur ?? motionTokens.duration.fast, ease }}
            >
                <span style={{ ...typeScale.caption, color: colors.subtle }}>
                    &copy; 2026 ResumeATS. All rights reserved.
                </span>
                <div className="flex items-center" style={{ gap: "32px" }}>
                    {["Privacy", "Terms"].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="transition-colors duration-200"
                            style={{
                                ...typeScale.caption,
                                color: colors.subtle,
                                touchAction: "manipulation",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = colors.muted)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = colors.subtle)}
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </motion.footer>
        </div>
    );
}
