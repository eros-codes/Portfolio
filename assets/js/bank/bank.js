/* =========================================================
   WA BANK case study — entry point
   ========================================================= */

import { initHeader } from "../case-study/header.js";
import { initReveal } from "../case-study/reveal.js";
import { initBankTransfer } from "./bank-transfer.js";
import { initBankCard } from "./bank-card.js";
import { initBankSignup } from "./bank-signup.js";
import { initHeroNotes } from "../case-study/hero-notes.js";

initHeader();
initReveal(); // first: it may drop .js-motion, which the replicas check
initBankTransfer();
initBankCard();
initBankSignup();
/* the notes hold still while the card is dragged */
initHeroNotes({ freezeOn: document.querySelector('[data-f="card1"]') });
