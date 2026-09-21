/* =========================================================
   HERO POINTER — desktop only, like the homepage.
   The chat window tilts toward the cursor; the two notes drift
   against it at different depths.
   ========================================================= */

import {
	onFrame,
	pointer,
	round,
	setVar,
	hasFinePointer,
	startPointerTracking,
} from "../animations/core.js";

const TILT_Y = 5; // deg
const TILT_X = 4; // deg
const NOTE_DEPTH = [14, 22]; // px per note

export function initHeroPointer() {
	if (!hasFinePointer()) return;

	const hero = document.querySelector(".case-hero");
	const chat = document.querySelector(".chat");
	const notes = [...document.querySelectorAll(".note")];
	if (!hero || !chat) return;

	let visible = true;
	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
	}).observe(hero);

	startPointerTracking();

	const last = [];

	onFrame(() => {
		if (!visible) return;

		setVar(chat, "--ty", `${round(pointer.x * TILT_Y, 1000)}deg`);
		setVar(chat, "--tx", `${round(-pointer.y * TILT_X, 1000)}deg`);

		/* notes carry backdrop-filter: quantise to half pixels and
		   skip unchanged writes so the blur is not recomputed needlessly */
		notes.forEach((note, i) => {
			const d = NOTE_DEPTH[i] ?? NOTE_DEPTH[0];
			const x = Math.round(-pointer.x * d * 2) / 2;
			const y = Math.round(-pointer.y * d * 0.6 * 2) / 2;
			if (last[i] && last[i][0] === x && last[i][1] === y) return;
			last[i] = [x, y];
			setVar(note, "--nx", `${x}px`);
			setVar(note, "--ny", `${y}px`);
		});
	});
}
