"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { Quip } from "./Quip";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const portraitRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 55, damping: 18, mass: 0.6 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || !portraitRef.current) return;
    const rect = portraitRef.current.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const ny = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    mx.set(nx * 14);
    my.set(ny * 10);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="home"
      aria-label={t("nav.home")}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative flex min-h-[92svh] flex-col justify-center overflow-hidden pt-24 pb-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-shell items-center gap-14 px-5 md:grid-cols-[1fr_minmax(0,42%)] md:gap-12 md:px-8 lg:gap-20">
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
        >
          <motion.p
            variants={rise}
            className="mb-8 text-[11px] uppercase tracking-label text-glacier"
          >
            {t("hero.role")}
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={rise}
            className="font-display text-[clamp(2.75rem,9vw,5.75rem)] font-light leading-[1.02] tracking-[-0.02em] text-frost-50"
          >
            Sumit Kumar
            <br />
            <span className="text-frost-300">Sharma</span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-7 max-w-xl font-display text-xl font-light italic leading-snug text-glacier md:text-2xl"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.p
            variants={rise}
            className="mt-7 max-w-xl text-[15px] leading-relaxed text-frost-400"
          >
            {t("hero.intro")}
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2.5 border border-white/15 px-5 py-2.5 text-[13px] text-frost-100 transition-colors duration-300 hover:border-glacier/60 hover:text-white active:scale-[0.98]"
            >
              {t("hero.ctaWork")}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                →
              </span>
            </a>
            <a
              href="#about"
              className="link-underline text-[13px] text-frost-300 transition-colors duration-300 hover:text-frost-50"
            >
              {t("hero.ctaAbout")}
            </a>
            <a
              href={CV.links.cvFile}
              download
              className="link-underline text-[12px] text-frost-500 transition-colors duration-300 hover:text-frost-300"
            >
              {t("hero.cv")}
            </a>
          </motion.div>

          <motion.div variants={rise}>
            <Quip textKey="hero.quip" />
          </motion.div>
        </motion.div>

        <div
          ref={portraitRef}
          className="group relative mx-auto w-full max-w-[320px] sm:max-w-[380px] md:mx-0 md:max-w-none"
        >
          <motion.div
            style={reduce ? undefined : { x, y }}
            className="relative aspect-[4/5] overflow-hidden"
          >
            <Image
              src="/portrait.jpg"
              alt="Portrait of Sumit Kumar Sharma"
              width={960}
              height={960}
              priority
              sizes="(min-width: 768px) 42vw, 320px"
              className="h-full w-full object-cover object-[center_22%] grayscale-[10%] transition-[filter] duration-700 group-hover:grayscale-0"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_15%,rgba(156,197,232,0.10),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,15,28,0.85)_0%,rgba(10,15,28,0.25)_18%,transparent_38%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(to_right,rgba(10,15,28,0.9)_0%,transparent_100%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-1/5 bg-[linear-gradient(to_left,rgba(10,15,28,0.75)_0%,transparent_100%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 shadow-[inset_0_0_80px_rgba(10,15,28,0.5)]"
            />
          </motion.div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="relative mx-auto mt-16 w-full max-w-shell px-5 md:px-8"
      >
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-label text-frost-500">
          <span>{t("hero.scroll")}</span>
          <span className="block h-px w-16 bg-white/15" />
        </div>
      </div>
    </section>
  );
}
