/* =========================================================
   RESERVATION case study — entry point
   ========================================================= */

import { initHeader } from "../header.js";
import { initReveal } from "../reveal.js";
import { onFrame, pointer, hasFinePointer, startPointerTracking } from "../../animations/core.js";
import { initResvHero } from "./resv-hero.js";
import { initResvEditor } from "./resv-editor.js";
import { initResvRace } from "./resv-race.js";

/* the hero notes drift against the pointer, as on every other page */
function initNotes() {
	if (!hasFinePointer()) return;
	const hero = document.querySelector(".case-hero");
	const notes = [...document.querySelectorAll(".case-hero .note")];
	if (!hero || !notes.length) return;
	let visible = true;
	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
	startPointerTracking();
	const depth = [14, 22];
	const last = [];
	onFrame(() => {
		if (!visible) return;
		notes.forEach((note, i) => {
			const d = depth[i] ?? depth[0];
			const x = Math.round(-pointer.x * d * 2) / 2;
			const y = Math.round(-pointer.y * d * 0.6 * 2) / 2;
			if (last[i] && last[i][0] === x && last[i][1] === y) return;
			last[i] = [x, y];
			note.style.setProperty("--nx", `${x}px`);
			note.style.setProperty("--ny", `${y}px`);
		});
	});
}

initHeader();
initReveal(); // first: it may drop .js-motion, which the demos check
initResvHero();
initResvEditor();
initResvRace();
initNotes();
