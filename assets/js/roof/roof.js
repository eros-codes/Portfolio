/* =========================================================
   ROOF case study — entry point
   ========================================================= */

import { initHeader } from "../case-study/header.js";
import { initReveal } from "../case-study/reveal.js";
import { initHeroNotes } from "../case-study/hero-notes.js";
import { initResvHero } from "./resv-hero.js";
import { initResvEditor } from "./resv-editor.js";
import { initResvRace } from "./resv-race.js";

initHeader();
initReveal(); // first: it may drop .js-motion, which the demos check
initResvHero();
initResvEditor();
initResvRace();
initHeroNotes();
