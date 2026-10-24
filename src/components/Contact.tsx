"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-white/[0.09] py-5 md:grid-cols-[10rem_1fr] md:gap-6">
      <dt className="text-[11px] uppercase tracking-label text-frost-500">{label}</dt>
      <dd className="text-[15px] text-frost-200">{children}</dd>
    </div>
  );
}

const fieldClass =
  "w-full rounded border border-white/[0.12] bg-ink/60 px-3.5 py-2.5 text-[14px] text-frost-100 outline-none transition-colors duration-300 placeholder:text-frost-600 focus:border-glacier/60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier";

export function Contact() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "ready">("idle");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CV.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!name.trim() || !validEmail || !subject.trim() || !message.trim()) {
      setStatus("error");
      return;
    }
    setStatus("ready");
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    const href = `mailto:${CV.email}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  return (
    <SectionShell
      id="contact"
      index="08"
      label={t("contact.label")}
      title={t("contact.title")}
      intro={t("contact.invite")}
    >
      <Reveal>
        <dl className="max-w-2xl">
          <Row label={t("contact.email")}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href={`mailto:${CV.email}`} className="link-underline break-all text-glacier">
                {CV.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className={`rounded border px-3 py-1 text-[11px] uppercase tracking-label transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97] ${
                  copied
                    ? "border-glacier/60 bg-glacier/[0.12] text-frost-50"
                    : "border-white/[0.14] text-frost-400 hover:border-glacier/40 hover:text-frost-100"
                }`}
                aria-live="polite"
              >
                {copied ? t("contact.copied") : t("contact.copy")}
              </button>
            </div>
          </Row>
          <Row label={t("contact.location")}>
            <span className="text-frost-300">{t("contact.locationValue")}</span>
          </Row>
          <Row label={t("contact.linkedin")}>
            <a
              href={CV.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline break-all text-frost-200 hover:text-glacier"
            >
              linkedin.com/in/sumit-kumar-sharma
            </a>
          </Row>
          <Row label={t("contact.github")}>
            <a
              href={CV.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline break-all text-frost-200 hover:text-glacier"
            >
              github.com/summonerwalacoder
            </a>
          </Row>
          <Row label={t("contact.cv")}>
            <a
              href={CV.links.cvFile}
              download
              className="link-underline text-frost-200 hover:text-glacier"
            >
              {t("hero.cv")}
            </a>
          </Row>
        </dl>
      </Reveal>

      <Reveal>
        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-12 max-w-2xl rounded-lg border border-white/[0.1] bg-ink-raised/70 p-5 sm:p-7"
        >
          <h3 className="text-[11px] uppercase tracking-label text-glacier">
            {t("contact.compose")}
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-frost-500">
            {t("contact.composeNote")}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="cf-name" className="text-[12px] text-frost-400">
                {t("contact.fName")}
              </label>
              <input
                id="cf-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="cf-email" className="text-[12px] text-frost-400">
                {t("contact.email")}
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="cf-subject" className="text-[12px] text-frost-400">
                {t("contact.fSubject")}
              </label>
              <input
                id="cf-subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <label htmlFor="cf-message" className="text-[12px] text-frost-400">
                {t("contact.fMessage")}
              </label>
              <textarea
                id="cf-message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${fieldClass} resize-y`}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="rounded border border-glacier/50 bg-glacier/[0.1] px-5 py-2.5 text-[12px] uppercase tracking-label text-frost-50 transition-all duration-300 hover:bg-glacier/[0.18] focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
            >
              {t("contact.formOpen")}
            </button>
            {status === "error" && (
              <p role="alert" className="text-[13px] text-frost-300">
                {t("contact.formInvalid")}
              </p>
            )}
            {status === "ready" && (
              <p role="status" className="text-[13px] text-glacier">
                {t("contact.formReady")}
              </p>
            )}
          </div>
        </form>
      </Reveal>

      <Quip textKey="contact.quip" />
    </SectionShell>
  );
}
