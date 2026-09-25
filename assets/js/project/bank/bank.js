/* =========================================================
   WA BANK case study — entry point
   ========================================================= */

import { initHeader } from "../header.js";
import { initReveal } from "../reveal.js";
import { initBankTransfer } from "./bank-transfer.js";
import { initBankCard } from "./bank-card.js";
import { initBankSignup } from "./bank-signup.js";

initHeader();
initReveal(); // first: it may drop .js-motion, which the replicas check
initBankTransfer();
initBankCard();
initBankSignup();
