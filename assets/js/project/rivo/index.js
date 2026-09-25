/* =========================================================
   CASE STUDY — entry point, shared by every project page
   ========================================================= */

import { initHeader } from "../header.js";
import { initReveal } from "../reveal.js";
import { initChatDemo } from "./chat-demo.js";
import { initSortDemo } from "./sort-demo.js";
import { initHeroPointer } from "./hero-pointer.js";

initHeader();
initReveal(); // first: it may drop .js-motion, which the demo checks
initChatDemo();
initSortDemo();
initHeroPointer();
