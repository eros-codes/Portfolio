/* =========================================================
   CARD TO CARD — the card writes itself

   Typing your own card number shows the rest of it as a
   suggestion; Enter completes the number and fills in the expiry
   date. The card at the top of the screen mirrors every field as
   it is filled, which is what makes the screen feel like writing
   on the card itself.
   ========================================================= */

import { prefersReduced, root } from "../../animations/core.js";
import {
	fitStage,
	createSequence,
	makeCursor,
	boxIn,
	typeInto,
	completeField,
	resetField,
	focusField,
	whenVisible,
} from "./wa-stage.js";

const MY_CARD = "2370271292484928";
const DEST_CARD = "6221061234567890"; /* 622106 = Parsian Bank in the app's prefix table */
const EXPIRY = { year: "2030", month: "10" };
const CVV = "600";

export function initBankCard() {
	const frame = document.getElementById("card-stage");
	if (!frame) return;

	const scaleEl = frame.querySelector(".wa-scale");
	const screen = frame.querySelector('[data-screen="card"]');
	const f = (name) => frame.querySelector(`[data-f="${name}"]`);
	const g = (name) => frame.parentElement.querySelector(`[data-f="${name}"]`);

	const getScale = fitStage(frame);
	const seq = createSequence();
	const cursor = makeCursor(scaleEl);
	const hint = g("hint");
	const replay = g("replay");

	const centreOf = (el) => {
		const b = boxIn(el, screen);
		return [b.cx, b.cy];
	};

	const FIELDS = ["c-src", "c-dst", "c-amt", "c-y", "c-m", "c-c"];

	function reset() {
		for (const name of FIELDS) resetField(f(name));
		for (const name of ["c-num", "c-year", "c-month", "c-cvv"]) f(name).textContent = "";
		hint.classList.remove("is-on");
		replay.classList.remove("is-ready");
	}

	function fillEverything() {
		const set = (name, value) => {
			const field = f(name);
			field.querySelector(".typed").textContent = value;
			field.querySelector(".prompt")?.classList.add("is-gone");
			const ghost = field.querySelector(".ghost");
			if (ghost) ghost.textContent = "";
		};
		set("c-src", MY_CARD);
		set("c-dst", DEST_CARD);
		set("c-amt", "20000");
		set("c-y", EXPIRY.year);
		set("c-m", EXPIRY.month);
		set("c-c", CVV);
		f("c-num").textContent = MY_CARD;
		f("c-year").textContent = EXPIRY.year;
		f("c-month").textContent = EXPIRY.month;
		f("c-cvv").textContent = CVV;
		hint.classList.add("is-on");
	}

	async function play() {
		const id = seq.begin();
		reset();
		cursor.jump(450, 660);
		cursor.show();
		if (!(await seq.wait(id, 450))) return;

		/* own card number: type a little, then let Enter finish it */
		const src = f("c-src");
		await cursor.to(...centreOf(src), 620);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(src, true);
		if (!(await typeInto(seq, id, src, "2370", 120, (t) => (f("c-num").textContent = t)))) return;
		if (!(await seq.wait(id, 500))) return;
		completeField(src);
		f("c-num").textContent = MY_CARD;
		f("c-year").textContent = EXPIRY.year;
		f("c-month").textContent = EXPIRY.month;
		f("c-y").querySelector(".typed").textContent = EXPIRY.year;
		f("c-y").querySelector(".prompt").classList.add("is-gone");
		f("c-m").querySelector(".typed").textContent = EXPIRY.month;
		f("c-m").querySelector(".prompt").classList.add("is-gone");
		focusField(src, false);
		if (!(await seq.wait(id, 520))) return;

		/* cvv2 */
		const cvv = f("c-c");
		await cursor.to(...centreOf(cvv), 560);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(cvv, true);
		if (!(await typeInto(seq, id, cvv, CVV, 130, (t) => (f("c-cvv").textContent = t)))) return;
		focusField(cvv, false);

		/* destination card */
		const dst = f("c-dst");
		await cursor.to(...centreOf(dst), 520);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(dst, true);
		if (!(await typeInto(seq, id, dst, DEST_CARD, 62))) return;
		focusField(dst, false);
		if (!(await seq.wait(id, 300))) return;

		/* amount */
		const amt = f("c-amt");
		await cursor.to(...centreOf(amt), 430);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(amt, true);
		if (!(await typeInto(seq, id, amt, "20000", 95))) return;
		focusField(amt, false);

		/* confirm */
		await cursor.to(...centreOf(f("c-confirm")), 480);
		if (!seq.alive(id)) return;
		await cursor.click(f("c-confirm"));
		if (!(await seq.wait(id, 350))) return;

		hint.classList.add("is-on");
		cursor.hide();
		replay.classList.add("is-ready");
	}

	replay.addEventListener("click", play);

	if (prefersReduced() || !root.classList.contains("js-motion")) {
		fillEverything();
		replay.classList.add("is-ready");
		return;
	}

	reset();
	whenVisible(frame, play, 0.45);
}
