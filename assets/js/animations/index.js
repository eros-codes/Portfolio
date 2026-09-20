/* =========================================================
   MOTION — entry point

   Call initMotion() AFTER the project folders have been
   appended to the DOM, otherwise the reveal observer has
   nothing to watch.
   ========================================================= */

import { startPointerTracking, prefersReduced, root } from "./core.js";
import { initReveal } from "./reveal.js";
import { initHero } from "./hero.js";
import { initBackdrop } from "./backdrop.js";
import { initPointerFx } from "./pointer-fx.js";

export function initMotion() {
	if (prefersReduced()) {
		root.classList.remove("js-motion");
		root.classList.add("motion-reduced");
		return;
	}

	startPointerTracking();
	initReveal();
	initBackdrop();
	initHero();
	initPointerFx();
}
