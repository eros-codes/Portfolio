/* =========================================================
   HERO NOTES — the inverse parallax every case study's hero has:
   the two notes drift against the pointer, at different depths.
   Desktop only, and only while the hero is on screen.

   Options, for the pages that need more than the drift:
     onPointer(pointer)  extra work on the same frame (Rivo tilts
                         its chat window toward the cursor)
     freezeOn            an element that can be dragged: while it
                         is, the notes hold still, and on release
                         they ease back to the pointer instead of
                         jumping (Bank's card)
   ========================================================= */
import { onFrame, pointer, hasFinePointer, startPointerTracking } from "../base/core.js";

const NOTE_DEPTH = [14, 22]; // px per note
const CATCH_UP = 0.035; // share of the way back per frame, about half a second

export function initHeroNotes({ onPointer, freezeOn } = {}) {
	if (!hasFinePointer()) return;
	const hero = document.querySelector(".case-hero");
	const notes = [...document.querySelectorAll(".case-hero .note")];
	if (!hero || (!notes.length && !onPointer)) return;

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
	if (freezeOn) {
		freezeOn.addEventListener("pointerdown", () => {
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
	}

	const last = [];
	onFrame(() => {
		if (!visible) return;
		onPointer?.(pointer);
		if (!held && blend < 1) blend = Math.min(1, blend + CATCH_UP);
		const ease = 1 - (1 - blend) ** 3;
		notes.forEach((note, i) => {
			const d = NOTE_DEPTH[i] ?? NOTE_DEPTH[0];
			const x = frozen[i].x + (-pointer.x * d - frozen[i].x) * ease;
			const y = frozen[i].y + (-pointer.y * d * 0.6 - frozen[i].y) * ease;
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
