/* =========================================================
   SIGN-UP, STEP 6 — declarations and signature

   Runs the real validation in the real order, from
   Costumer.finalcheck():
     1. no signature            -> "Give your signature"
     2. terms not accepted      -> "You have not accepted our terms
                                    and conditions"
     3. terms never opened      -> "You have not read our terms and
                                    conditions"
   Only then is the account created — and even then it is created
   as Pending until an employee approves it.
   ========================================================= */

import { prefersReduced, root } from "../../animations/core.js";
import { fitStage, createSequence, makeCursor, boxIn, whenVisible, nowStamp } from "./wa-stage.js";

const SIGN_ORIGIN = { x: 52, y: 269 };

export function initBankSignup() {
	const frame = document.getElementById("signup-stage");
	if (!frame) return;

	const scaleEl = frame.querySelector(".wa-scale");
	const screen = frame.querySelector('[data-screen="signup"]');
	const done = frame.querySelector('[data-screen="signdone"]');
	const f = (name) => frame.querySelector(`[data-f="${name}"]`);
	const g = (name) => frame.parentElement.querySelector(`[data-f="${name}"]`);

	fitStage(frame);
	const seq = createSequence();
	const cursor = makeCursor(scaleEl);
	const replay = g("replay");

	const paths = [f("sign"), f("sign2")];
	const lengths = paths.map((p) => p.getTotalLength());

	const centreOf = (el) => {
		const b = boxIn(el, screen);
		return [b.cx, b.cy];
	};

	function hidePenStrokes() {
		paths.forEach((p, i) => {
			p.style.strokeDasharray = lengths[i];
			p.style.strokeDashoffset = lengths[i];
		});
	}

	function showPenStrokes() {
		paths.forEach((p) => {
			p.style.strokeDasharray = "";
			p.style.strokeDashoffset = "";
		});
	}

	function reset() {
		hidePenStrokes();
		f("accept").querySelector("i").textContent = "";
		f("terms").classList.remove("is-visited");
		f("dim").classList.remove("is-open");
		f("termswin").classList.remove("is-open");
		f("now").textContent = nowStamp();
		done.classList.add("is-away");
		screen.classList.remove("is-away");
		replay.classList.remove("is-ready");
	}

	async function alert(id, message) {
		f("alertmsg").textContent = message;
		f("dim").classList.add("is-open");
		if (!(await seq.wait(id, 700))) return false;
		await cursor.to(...centreOf(f("alertok")), 420);
		if (!seq.alive(id)) return false;
		await cursor.click(f("alertok"));
		f("dim").classList.remove("is-open");
		return await seq.wait(id, 250);
	}

	/* the cursor traces the path while the stroke draws itself */
	async function sign(id) {
		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];
			const total = lengths[i];
			const first = path.getPointAtLength(0);
			await cursor.to(SIGN_ORIGIN.x + first.x, SIGN_ORIGIN.y + first.y, 420);
			if (!seq.alive(id)) return false;
			cursor.down();

			const steps = Math.round(total / 9);
			for (let step = 1; step <= steps; step++) {
				const at = (total * step) / steps;
				const point = path.getPointAtLength(at);
				path.style.strokeDashoffset = total - at;
				cursor.jump(SIGN_ORIGIN.x + point.x, SIGN_ORIGIN.y + point.y);
				if (!(await seq.wait(id, 12))) return false;
			}
			cursor.up();
			if (!(await seq.wait(id, 220))) return false;
		}
		return true;
	}

	async function play() {
		const id = seq.begin();
		reset();
		cursor.jump(620, 660);
		cursor.show();
		if (!(await seq.wait(id, 500))) return;

		/* 1. finish with nothing filled in */
		await cursor.to(...centreOf(f("finished")), 620);
		if (!seq.alive(id)) return;
		await cursor.click(f("finished"));
		if (!(await alert(id, "Give your signature"))) return;

		/* 2. sign */
		if (!(await sign(id))) return;

		/* 3. accept, but the terms were never opened */
		await cursor.to(...centreOf(f("accept")), 520);
		if (!seq.alive(id)) return;
		await cursor.click();
		f("accept").querySelector("i").textContent = "✓";
		if (!(await seq.wait(id, 320))) return;
		await cursor.to(...centreOf(f("finished")), 560);
		if (!seq.alive(id)) return;
		await cursor.click(f("finished"));
		if (!(await alert(id, "You have not read our terms and conditions"))) return;

		/* 4. actually open them */
		await cursor.to(...centreOf(f("terms")), 520);
		if (!seq.alive(id)) return;
		await cursor.click();
		f("termswin").classList.add("is-open");
		f("terms").classList.add("is-visited");
		if (!(await seq.wait(id, 1900))) return;
		f("termswin").classList.remove("is-open");
		if (!(await seq.wait(id, 400))) return;

		/* 5. now it goes through */
		await cursor.to(...centreOf(f("finished")), 560);
		if (!seq.alive(id)) return;
		await cursor.click(f("finished"));
		if (!(await seq.wait(id, 300))) return;
		screen.classList.add("is-away");
		done.classList.remove("is-away");
		cursor.hide();
		if (!(await seq.wait(id, 600))) return;
		replay.classList.add("is-ready");
	}

	replay.addEventListener("click", play);

	if (prefersReduced() || !root.classList.contains("js-motion")) {
		showPenStrokes();
		f("accept").querySelector("i").textContent = "✓";
		f("now").textContent = nowStamp();
		replay.classList.add("is-ready");
		return;
	}

	reset();
	whenVisible(frame, play, 0.45);
}
