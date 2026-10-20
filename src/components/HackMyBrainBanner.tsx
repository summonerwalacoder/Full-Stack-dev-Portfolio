"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "./Reveal";
import { HMB_OPEN_EVENT } from "./hack-my-brain/hmbEvents";

export function HackMyBrainBanner() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setGlow(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const open = () => window.dispatchEvent(new CustomEvent(HMB_OPEN_EVENT));

  return (
    <section
      aria-labelledby="hmb-banner-title"
      className="mx-auto max-w-shell scroll-mt-20 px-5 py-12 md:px-8 md:py-16"
    >
      <Reveal>
        <div
          ref={ref}
          className={`hmb-banner relative overflow-hidden rounded-2xl border border-glacier/25 bg-ink-raised px-6 py-12 text-center md:px-14 md:py-16 ${
            glow ? "hmb-banner-glow" : ""
          }`}
        >
          <div aria-hidden="true" className="hmb-banner-grid" />
          <div aria-hidden="true" className="hmb-banner-scan" />

          <p className="relative text-[11px] uppercase tracking-label text-glacier/80">
            {t("hmb.bannerKicker")}
          </p>
          <h2
            id="hmb-banner-title"
            className="hmb-banner-title relative mx-auto mt-4 max-w-2xl font-display text-[clamp(1.8rem,5vw,3.2rem)] font-light leading-[1.1] tracking-[-0.02em] text-frost-50"
          >
            {t("hmb.bannerTitle")}
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-[14.5px] leading-relaxed text-frost-400">
            {t("hmb.bannerNote")}
          </p>

          <div className="relative mt-8 flex justify-center">
            <button
              type="button"
              onClick={open}
              className="hmb-cta group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-glacier/60 bg-glacier/[0.12] px-9 py-4 text-[13px] uppercase tracking-label text-frost-50 transition-all duration-300 hover:scale-[1.03] hover:bg-glacier/[0.22] hover:shadow-[0_0_40px_-6px_rgba(156,197,232,0.55)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.98]"
            >
              <span aria-hidden="true" className="font-mono text-glacier">
                {">_"}
              </span>
              {t("hmb.launch")}
              <span
                aria-hidden="true"
                className="text-glacier transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
