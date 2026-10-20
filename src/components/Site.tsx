"use client";

import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { About } from "./About";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { Journey } from "./Journey";
import { Achievements } from "./Achievements";
import { Interests } from "./Interests";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Guide } from "./Guide";
import { Bobo } from "./Bobo";
import { Cursor } from "./Cursor";
import { ScrollProgress } from "./ScrollProgress";
import { Terminal } from "./Terminal";
import { CommandPalette } from "./CommandPalette";

export function Site() {
  return (
    <>
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
        <Contact />
      </main>
      <Footer />
      <Guide />
      <Bobo />
      <Terminal />
      <CommandPalette />
    </>
  );
}
