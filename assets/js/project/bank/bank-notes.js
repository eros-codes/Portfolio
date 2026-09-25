/* =========================================================
   HERO NOTES — the same inverse parallax as the homepage and Rivo

   Only the two notes move. The transfer window itself stays still
   on purpose: the visitor drags a card inside it, and a window that
   moved under the pointer would make the drag inaccurate.

   While a card is being dragged the notes hold still, so the only
   thing moving is the card. On release they ease back to following
   the pointer instead of jumping.
   ========================================================= */

import {
	onFrame,
	pointer,
	hasFinePointer,
	startPointerTracking,
} from "../../animations/core.js";

const NOTE_DEPTH = [14, 22]; // px per note, same as Rivo
const CATCH_UP = 0.035; // share of the way back per frame, about half a second

export function initBankNotes() {
	if (!hasFinePointer()) return;

	const hero = document.querySelector(".case-hero");
	const notes = [...document.querySelectorAll(".case-hero .note")];
	const card = document.querySelector('[data-f="card1"]');
	if (!hero || !notes.length) return;

	let visible = true;
	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
	}).observe(hero);

	startPointerTracking();

	/* blend: 0 = frozen where the drag began, 1 = following the pointer */
	let held = false;
	let blend = 1;
	const shown = notes.map(() => ({ x: 0, y: 0 }));
	const frozen = notes.map(() => ({ x: 0, y: 0 }));

	card?.addEventListener("pointerdown", () => {
		held = true;
		blend = 0;
		shown.forEach((s, i) => {
			frozen[i].x = s.x;
			frozen[i].y = s.y;
		});
	});

	const release = () => {
		held = false;
	};
	window.addEventListener("pointerup", release);
	window.addEventListener("pointercancel", release);

	const last = [];

	onFrame(() => {
		if (!visible) return;

		if (!held && blend < 1) blend = Math.min(1, blend + CATCH_UP);
		const ease = 1 - (1 - blend) ** 3;

		notes.forEach((note, i) => {
			const d = NOTE_DEPTH[i] ?? NOTE_DEPTH[0];
			const targetX = -pointer.x * d;
			const targetY = -pointer.y * d * 0.6;
			const x = frozen[i].x + (targetX - frozen[i].x) * ease;
			const y = frozen[i].y + (targetY - frozen[i].y) * ease;
			shown[i].x = x;
			shown[i].y = y;

			/* notes carry backdrop-filter: quantise to half pixels and
			   skip unchanged writes so the blur is not recomputed needlessly */
			const qx = Math.round(x * 2) / 2;
			const qy = Math.round(y * 2) / 2;
			if (last[i] && last[i][0] === qx && last[i][1] === qy) return;
			last[i] = [qx, qy];
			note.style.setProperty("--nx", `${qx}px`);
			note.style.setProperty("--ny", `${qy}px`);
		});
	});
}
