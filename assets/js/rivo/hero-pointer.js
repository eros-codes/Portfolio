/* =========================================================
   HERO POINTER — desktop only, like the homepage.
   The chat window tilts toward the cursor; the notes drift
   against it (the shared hero-notes parallax).
   ========================================================= */
import { round, setVar } from "../base/core.js";
import { initHeroNotes } from "../case-study/hero-notes.js";

const TILT_Y = 5; // deg
const TILT_X = 4; // deg

export function initHeroPointer() {
	const chat = document.querySelector(".chat");
	if (!chat) return;
	initHeroNotes({
		onPointer(pointer) {
			setVar(chat, "--ty", `${round(pointer.x * TILT_Y, 1000)}deg`);
			setVar(chat, "--tx", `${round(-pointer.y * TILT_X, 1000)}deg`);
		},
	});
}
