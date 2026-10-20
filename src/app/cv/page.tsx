import type { Metadata } from "next";
import Link from "next/link";
import { CV } from "@/data/cv";
import { PROJECTS } from "@/data/projects";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description: "Curriculum vitae of Sumit Kumar Sharma — B.Tech CSE (AI) student.",
};

export default function CvPage() {
  return (
    <div className="min-h-screen bg-[#eef1f5]">
      <div className="no-print mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="text-[13px] text-[#33506e] underline-offset-4 hover:underline"
        >
          ← Portfolio
        </Link>
        <PrintButton />
      </div>

      <article className="cv-sheet mx-auto max-w-3xl px-6 py-10 shadow-sm md:px-12 md:py-14">
        <header className="border-b border-[#d5dde7] pb-6">
          <h1 className="font-display text-3xl font-normal text-[#14202f] md:text-4xl">
            {CV.name}
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.18em] text-[#4a6280]">
            {CV.role}
          </p>
          <p className="mt-4 text-[13.5px] leading-relaxed text-[#31445c]">
            {CV.email} · {CV.location}
            <br />
            <a href={CV.links.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin.com/in/sumit-kumar-sharma-81a485383
            </a>
            {" · "}
            <a href={CV.links.github} target="_blank" rel="noopener noreferrer">
              github.com/summonerwalacoder
            </a>
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#4a6280]">
            Profile
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#243447]">
            Computer Science Engineering student specialising in Artificial
            Intelligence at Invertis University. Interested in artificial
            intelligence, data-driven technologies, programming, and practical
            project development. Learning through building.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#4a6280]">
            Education
          </h2>
          <ul className="mt-3 space-y-3">
            {[...CV.education].reverse().map((e) => (
              <li key={e.id} className="text-[14px] leading-relaxed">
                <span className="font-medium text-[#14202f]">
                  {e.institution}
                </span>
                <span className="text-[#5a7089]"> — {e.period}</span>
                <br />
                <span className="text-[#31445c]">{e.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#4a6280]">
            Skills
          </h2>
          <dl className="mt-3 space-y-2 text-[14px] leading-relaxed">
            <div>
              <dt className="inline font-medium text-[#14202f]">Programming: </dt>
              <dd className="inline text-[#31445c]">
                {CV.skills.programming.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-[#14202f]">Tools: </dt>
              <dd className="inline text-[#31445c]">
                {CV.skills.tools.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-[#14202f]">
                Libraries and technical areas:{" "}
              </dt>
              <dd className="inline text-[#31445c]">
                {CV.skills.areas.join(", ")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#4a6280]">
            Projects
          </h2>
          <ul className="mt-3 space-y-3 text-[14px] leading-relaxed">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <span className="font-medium text-[#14202f]">
                  {p.id === "smart-crop"
                    ? "Smart Crop Advisory System"
                    : p.id === "dhruva"
                      ? "Dhruva"
                      : "Varun-X"}
                </span>
                {p.links.repo && (
                  <>
                    {" — "}
                    <a href={p.links.repo} target="_blank" rel="noopener noreferrer">
                      repository
                    </a>
                  </>
                )}
                {p.id === "smart-crop" && (
                  <p className="text-[#31445c]">
                    Team project exploring an AI-based agricultural advisory
                    system. Eighth place among 50 teams in the software domain
                    at Inverthon 2026.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#4a6280]">
            Achievements
          </h2>
          <ul className="mt-3 space-y-1.5 text-[14px] text-[#243447]">
            {CV.achievements.map((a) => (
              <li key={a.id}>
                <span className="text-[#5a7089]">{a.year}</span> — {a.title}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#4a6280]">
            Interests
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#243447]">
            {CV.interests.activities.join(" · ")}
          </p>
        </section>
      </article>

      <div className="no-print h-10" />
    </div>
  );
}
