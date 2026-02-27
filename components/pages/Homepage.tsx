"use client";

import { motion, useReducedMotion } from "motion/react";
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
        title: "Contextual recall",
        description:
            "Surfaces relevant notes, docs, and past conversations exactly when you need them — no searching required.",
    },
    {
        title: "Idea threading",
        description:
            "Connects fragments across your work into coherent threads, so nothing slips through the cracks.",
    },
    {
        title: "Private by design",
        description:
            "Your data stays yours. Local-first processing with end-to-end encryption for everything in the cloud.",
    },
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
                <span
                    className={`${fontVars.display}`}
                    style={{ ...typeScale.title, color: colors.foreground }}
                >
                    meld
                </span>
                <div className="flex items-center" style={{ gap: spacing.navGap }}>
                    {["Product", "Pricing", "About"].map((item) => (
                        <a
                            key={item}
                            href="#"
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
                    <a
                        href="#"
                        className="flex items-center justify-center transition-opacity duration-200 hover:opacity-90"
                        style={{
                            ...typeScale.buttonSm,
                            backgroundColor: colors.accent,
                            color: colors.onAccent,
                            borderRadius: radii.pill,
                            paddingBlock: "10px",
                            paddingInline: "24px",
                            touchAction: "manipulation",
                        }}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusVisible)}
                        onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.outlineOffset = ""; }}
                    >
                        Get started
                    </a>
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
                        Now in public beta
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
                    Your thinking,
                    <br />
                    quietly amplified
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    className="max-w-[480px] text-center"
                    style={{ ...typeScale.body, color: colors.muted }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                >
                    Meld works alongside your train of thought — surfacing context,
                    connecting ideas, and staying out of the way.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex items-center"
                    style={{ gap: spacing.ctaGap }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.normal, ease }}
                >
                    <a
                        href="#"
                        className="flex items-center justify-center transition-opacity duration-200 hover:opacity-90"
                        style={{
                            ...typeScale.button,
                            backgroundColor: colors.accent,
                            color: colors.onAccent,
                            borderRadius: radii.pill,
                            paddingBlock: "14px",
                            paddingInline: "32px",
                            touchAction: "manipulation",
                        }}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusVisible)}
                        onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.outlineOffset = ""; }}
                    >
                        Start for free
                    </a>
                    <a
                        href="#"
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
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusVisible)}
                        onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.outlineOffset = ""; }}
                    >
                        See how it works
                    </a>
                </motion.div>

                {/* Hero Image */}
                <motion.div
                    className="flex w-full items-center justify-center"
                    style={{ paddingTop: "16px" }}
                    variants={fadeUp}
                    transition={{ duration: dur ?? motionTokens.duration.slow, ease }}
                >
                    <div
                        style={{
                            width: "1000px",
                            maxWidth: "100%",
                            height: "558px",
                            borderRadius: radii.card,
                            backgroundImage:
                                "url(https://workers.paper.design/file-assets/01KJF8F5AWKS0D7V3A7SYW5SVC/5SW3KHCZAMNE58326FVR2ZS4ZJ.png)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        role="img"
                        aria-label="Abstract green shapes illustrating Meld"
                    />
                </motion.div>
            </motion.section>

            {/* Features */}
            <motion.section
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
                        className="flex max-w-[280px] flex-col"
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
                    &copy; 2026 Meld. All rights reserved.
                </span>
                <div className="flex items-center" style={{ gap: "32px" }}>
                    {["Privacy", "Terms", "Twitter"].map((item) => (
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
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusVisible)}
                            onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.outlineOffset = ""; }}
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </motion.footer>
        </div>
    );
}
