"use client";

import { motion } from "motion/react";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const featureStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Homepage() {
  return (
    <div
      className="flex min-h-screen flex-col font-[family-name:var(--font-dm-sans)]"
      style={{ backgroundColor: "#F5F0E8", scrollBehavior: "smooth" }}
    >
      {/* Nav */}
      <motion.nav
        className="flex w-full items-center justify-between px-20 py-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span
          className="text-2xl font-[family-name:var(--font-instrument-serif)]"
          style={{ color: "#1A1A18", letterSpacing: "-0.02em" }}
        >
          meld
        </span>
        <div className="flex items-center gap-10">
          {["Product", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[15px] transition-colors duration-200 hover:text-[#1A1A18]"
              style={{ color: "#6B6960" }}
            >
              {item}
            </a>
          ))}
          <a
            href="#"
            className="flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: "#2D5A3D", color: "#F5F0E8" }}
          >
            Get started
          </a>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        className="flex w-full flex-1 flex-col items-center px-20 pb-20 pt-[100px]"
        style={{ gap: "32px" }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ border: "1px solid #D4CDBE" }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span
            className="block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#7BA085" }}
          />
          <span
            className="text-[13px] font-medium uppercase"
            style={{ color: "#6B6960", letterSpacing: "0.04em" }}
          >
            Now in public beta
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="max-w-[800px] text-center font-[family-name:var(--font-instrument-serif)]"
          style={{
            fontSize: "72px",
            lineHeight: "76px",
            letterSpacing: "-0.03em",
            color: "#1A1A18",
          }}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Your thinking,
          <br />
          quietly amplified
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="max-w-[480px] text-center text-lg"
          style={{ lineHeight: "28px", color: "#6B6960" }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Meld works alongside your train of thought — surfacing context,
          connecting ideas, and staying out of the way.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex items-center gap-4"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <a
            href="#"
            className="flex items-center justify-center rounded-full px-8 py-3.5 text-base font-medium transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: "#2D5A3D", color: "#F5F0E8" }}
          >
            Start for free
          </a>
          <a
            href="#"
            className="flex items-center justify-center rounded-full px-8 py-3.5 text-base transition-colors duration-200 hover:bg-[#E8E3DB]"
            style={{
              border: "1px solid #C8C1B4",
              color: "#1A1A18",
            }}
          >
            See how it works
          </a>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          className="flex w-full items-center justify-center pt-4"
          variants={fadeUp}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div
            className="rounded-2xl"
            style={{
              width: "1000px",
              maxWidth: "100%",
              height: "558px",
              backgroundImage:
                "url(https://workers.paper.design/file-assets/01KJF8F5AWKS0D7V3A7SYW5SVC/5SW3KHCZAMNE58326FVR2ZS4ZJ.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="flex w-full items-start justify-center px-[120px] pb-20"
        style={{ gap: "80px" }}
        variants={featureStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            className="flex max-w-[280px] flex-col"
            style={{ gap: "12px" }}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3
              className="text-[22px] font-[family-name:var(--font-instrument-serif)]"
              style={{
                lineHeight: "28px",
                letterSpacing: "-0.01em",
                color: "#1A1A18",
              }}
            >
              {feature.title}
            </h3>
            <p
              className="text-[15px]"
              style={{ lineHeight: "24px", color: "#6B6960" }}
            >
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="flex w-full items-center justify-between px-20 py-6"
        style={{ borderTop: "1px solid #D4CDBE" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span className="text-[13px]" style={{ color: "#A39E93" }}>
          &copy; 2026 Meld. All rights reserved.
        </span>
        <div className="flex items-center gap-8">
          {["Privacy", "Terms", "Twitter"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[13px] transition-colors duration-200 hover:text-[#6B6960]"
              style={{ color: "#A39E93" }}
            >
              {item}
            </a>
          ))}
        </div>
      </motion.footer>
    </div>
  );
}
