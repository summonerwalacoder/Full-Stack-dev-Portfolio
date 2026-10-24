"use client";

import dynamic from "next/dynamic";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { About } from "./About";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { Journey } from "./Journey";
import { Achievements } from "./Achievements";
import { Interests } from "./Interests";
import { DeveloperMultiverse } from "./multiverse/DeveloperMultiverse";
import { HackMyBrainBanner } from "./HackMyBrainBanner";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Guide } from "./Guide";
import { Bobo } from "./Bobo";
import { Cursor } from "./Cursor";
import { ScrollProgress } from "./ScrollProgress";
import { Terminal } from "./Terminal";
import { CommandPalette } from "./CommandPalette";
import { MusicProvider } from "./music/MusicProvider";
import { MusicModes } from "./music/MusicModes";
import { MatrixRain } from "./MatrixRain";

const HackMyBrain = dynamic(
  () => import("./HackMyBrain").then((m) => m.HackMyBrain),
  { ssr: false }
);

export function Site() {
  return (
    <MusicProvider>
      <MatrixRain />
      <div className="relative z-10 min-h-screen">
        <ScrollProgress />
        <Cursor />
        <Nav />
        <main id="content">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Journey />
          <Achievements />
          <Interests />
          <DeveloperMultiverse />
          <HackMyBrainBanner />
          <Contact />
        </main>
        <Footer />
        <Guide />
        <Bobo />
        <Terminal />
        <CommandPalette />
        <MusicModes />
        <HackMyBrain />
      </div>
    </MusicProvider>
  );
}
