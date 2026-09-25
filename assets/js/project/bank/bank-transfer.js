/* =========================================================
   INTERNAL TRANSFER — the hero replica

   Plays the real flow once: the account numbers are typed, the
   cards appear, a one-time code is sent, and the source card is
   dragged onto the destination card. Then the visitor can drag
   it themselves, with a mouse, a finger or the keyboard.

   The proximity rule is the one from Transitions.java:
     distance <= 20   -> full 4px outline, release completes
     distance <= 150  -> outline thickens in steps from 1 to 4
     further away     -> no outline
   Only the colour differs: the app uses white then yellow, this
   page uses green throughout.
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
	nowStamp,
	transactionCode,
	whenVisible,
	TITLEBAR,
} from "./wa-stage.js";

const NEAR = 20;
const FAR = 150;
const CARD_W = 300;
const CARD_H = 200;
const HOME = { x: 50, y: 443 };
const DEST = { x: 550, y: 443 };

const SRC_ACCOUNT = "5596409736";
const DST_ACCOUNT = "4664948316";

export function initBankTransfer() {
	const frame = document.getElementById("transfer-stage");
	if (!frame) return;

	const scaleEl = frame.querySelector(".wa-scale");
	const screen = frame.querySelector('[data-screen="transfer"]');
	const receipt = frame.querySelector('[data-screen="receipt"]');
	const f = (name) => frame.querySelector(`[data-f="${name}"]`);
	/* the hint and replay live under the frame, not inside it */
	const g = (name) => frame.parentElement.querySelector(`[data-f="${name}"]`);

	const card1 = f("card1");
	const card2 = f("card2");
	const hint = g("hint");
	const replay = g("replay");

	const getScale = fitStage(frame);
	const seq = createSequence();
	const cursor = makeCursor(scaleEl);

	/* ---------- shared state ---------- */

	const setCards = (on) => {
		for (const c of [card1, card2]) {
			c.classList.add("is-shown");
			c.classList.toggle("is-hidden", !on);
		}
		card1.classList.toggle("is-grab", on);
	};

	const placeCard = (x, y) => {
		card1.style.left = `${x}px`;
		card1.style.top = `${y}px`;
	};

	const outline = (distance) => {
		let ring = 0;
		let ready = false;
		if (distance <= NEAR) {
			ring = 4;
			ready = true;
		} else if (distance <= FAR) {
			ring = Math.max(1, Math.trunc(4 - (distance - NEAR) / ((FAR - NEAR) / 3)));
		}
		card2.style.setProperty("--ring", `${ring}px`);
		card2.classList.toggle("is-ready", ready);
		return ready;
	};

	const distanceFrom = (x, y) =>
		Math.hypot(x + CARD_W / 2 - (DEST.x + CARD_W / 2), y + CARD_H / 2 - (DEST.y + CARD_H / 2));

	const clearOutline = () => {
		card2.style.setProperty("--ring", "0px");
		card2.classList.remove("is-ready");
	};

	function showReceipt() {
		f("code").textContent = transactionCode();
		f("time").textContent = nowStamp();
		clearOutline();
		screen.classList.add("is-away");
		receipt.classList.remove("is-away");
		receipt.querySelector(".wa-paper").classList.add("is-in");
	}

	function showTransfer() {
		receipt.classList.add("is-away");
		receipt.querySelector(".wa-paper").classList.remove("is-in");
		screen.classList.remove("is-away");
		card1.classList.add("is-snap");
		placeCard(HOME.x, HOME.y);
		setTimeout(() => card1.classList.remove("is-snap"), 300);
	}

	/* the filled state the visitor is handed after the demo */
	function fillEverything() {
		f("src").querySelector(".typed").textContent = SRC_ACCOUNT;
		f("src").querySelector(".ghost").textContent = "";
		for (const [name, value] of [["dst", DST_ACCOUNT], ["amt", "20000"], ["otp", "•••••"]]) {
			const field = f(name);
			field.querySelector(".typed").textContent = value;
			field.querySelector(".prompt")?.classList.add("is-gone");
			focusField(field, false);
		}
		f("sendotp").classList.add("is-disabled");
		f("timer").textContent = "1:48";
		card1.querySelector(".num").textContent = SRC_ACCOUNT;
		card1.querySelector(".name").textContent = "ARVIN SAGHAFI";
		card2.querySelector(".num").textContent = DST_ACCOUNT;
		card2.querySelector(".name").textContent = "SARA KARIMI";
		setCards(true);
		placeCard(HOME.x, HOME.y);
	}

	function handOver() {
		cursor.hide();
		hint.classList.add("is-on");
		replay.classList.add("is-ready");
	}

	/* ---------- the visitor's own drag ---------- */

	let dragging = false;
	let ready = false;

	const stageCoords = (event) => {
		const rect = screen.getBoundingClientRect();
		const s = getScale();
		return { x: (event.clientX - rect.left) / s, y: (event.clientY - rect.top) / s };
	};

	card1.addEventListener("pointerdown", (event) => {
		if (card1.classList.contains("is-hidden")) return;
		seq.stop();
		cursor.hide();
		dragging = true;
		card1.setPointerCapture(event.pointerId);
		card1.classList.add("is-drag");
		card1.classList.remove("is-snap");
	});

	card1.addEventListener("pointermove", (event) => {
		if (!dragging) return;
		const p = stageCoords(event);
		const x = p.x - CARD_W / 2;
		const y = p.y - CARD_H / 2;
		placeCard(x, y);
		ready = outline(distanceFrom(x, y));
	});

	const endDrag = (event) => {
		if (!dragging) return;
		dragging = false;
		card1.classList.remove("is-drag");
		card1.releasePointerCapture?.(event.pointerId);
		if (ready) {
			showReceipt();
			ready = false;
			return;
		}
		clearOutline();
		card1.classList.add("is-snap");
		placeCard(HOME.x, HOME.y);
		setTimeout(() => card1.classList.remove("is-snap"), 300);
	};

	card1.addEventListener("pointerup", endDrag);
	card1.addEventListener("pointercancel", endDrag);

	/* keyboard: the same transfer without a pointer */
	card1.addEventListener("keydown", (event) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		seq.stop();
		cursor.hide();
		card1.classList.add("is-snap");
		placeCard(DEST.x, DEST.y);
		outline(0);
		setTimeout(() => {
			card1.classList.remove("is-snap");
			showReceipt();
		}, 320);
	});

	f("receipt-back").addEventListener("click", showTransfer);
	receipt.addEventListener("click", (event) => {
		if (event.target.closest('[data-f="receipt-back"]')) showTransfer();
	});

	/* ---------- the scripted run ---------- */

	function reset() {
		clearOutline();
		receipt.classList.add("is-away");
		screen.classList.remove("is-away");
		for (const name of ["src", "dst", "amt", "otp"]) resetField(f(name));
		f("sendotp").classList.remove("is-disabled");
		f("timer").textContent = "2:00";
		card1.querySelector(".num").textContent = "";
		card1.querySelector(".name").textContent = "";
		card2.querySelector(".num").textContent = "";
		card2.querySelector(".name").textContent = "";
		card1.classList.remove("is-shown");
		card2.classList.remove("is-shown");
		setCards(false);
		placeCard(HOME.x, HOME.y);
		hint.classList.remove("is-on");
		replay.classList.remove("is-ready");
	}

	const centreOf = (el) => {
		const b = boxIn(el, screen);
		return [b.cx, b.cy];
	};

	async function play() {
		const id = seq.begin();
		reset();
		cursor.jump(450, 640);
		cursor.show();
		if (!(await seq.wait(id, 500))) return;

		/* source account, with its own number suggested */
		const src = f("src");
		await cursor.to(...centreOf(src), 650);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(src, true);
		if (!(await typeInto(seq, id, src, "559", 120))) return;
		if (!(await seq.wait(id, 420))) return;
		completeField(src);
		card1.querySelector(".num").textContent = SRC_ACCOUNT;
		card1.querySelector(".name").textContent = "ARVIN SAGHAFI";
		if (!(await seq.wait(id, 320))) return;
		focusField(src, false);

		/* destination account */
		const dst = f("dst");
		await cursor.to(...centreOf(dst), 520);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(dst, true);
		if (!(await typeInto(seq, id, dst, DST_ACCOUNT, 85))) return;
		focusField(dst, false);
		card2.querySelector(".num").textContent = DST_ACCOUNT;
		card2.querySelector(".name").textContent = "SARA KARIMI";
		setCards(true);
		if (!(await seq.wait(id, 500))) return;

		/* amount */
		const amt = f("amt");
		await cursor.to(...centreOf(amt), 460);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(amt, true);
		if (!(await typeInto(seq, id, amt, "20000", 95))) return;
		focusField(amt, false);

		/* one-time code */
		await cursor.to(...centreOf(f("sendotp")), 520);
		if (!seq.alive(id)) return;
		await cursor.click(f("sendotp"));
		f("sendotp").classList.add("is-disabled");

		let left = 120;
		const timer = f("timer");
		const tick = setInterval(() => {
			if (!seq.alive(id)) return clearInterval(tick);
			left -= 1;
			timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
		}, 1000);

		const otp = f("otp");
		await cursor.to(...centreOf(otp), 420);
		if (!seq.alive(id)) return;
		await cursor.click();
		focusField(otp, true);
		if (!(await typeInto(seq, id, otp, "•••••", 170))) return;
		focusField(otp, false);
		if (!(await seq.wait(id, 350))) return;

		/* the drag itself */
		const start = { x: HOME.x + CARD_W / 2, y: HOME.y + CARD_H / 2 };
		const end = { x: DEST.x + CARD_W / 2, y: DEST.y + CARD_H / 2 };
		await cursor.to(start.x, start.y, 620);
		if (!seq.alive(id)) return;
		cursor.down();
		card1.classList.add("is-drag");
		if (!(await seq.wait(id, 220))) return;

		const steps = 46;
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
			const x = start.x + (end.x - start.x) * ease;
			const y = start.y + (end.y - start.y) * ease - Math.sin(ease * Math.PI) * 26;
			cursor.jump(x, y);
			placeCard(x - CARD_W / 2, y - CARD_H / 2);
			outline(distanceFrom(x - CARD_W / 2, y - CARD_H / 2));
			if (!(await seq.wait(id, 26))) return;
		}

		if (!(await seq.wait(id, 420))) return;
		cursor.up();
		card1.classList.remove("is-drag");
		clearInterval(tick);
		showReceipt();
		if (!(await seq.wait(id, 2900))) return;

		showTransfer();
		fillEverything();
		handOver();
	}

	/* ---------- start ---------- */

	replay.addEventListener("click", play);

	if (prefersReduced() || !root.classList.contains("js-motion")) {
		fillEverything();
		hint.classList.add("is-on");
		replay.classList.add("is-ready");
		return;
	}

	reset();
	whenVisible(frame, play, 0.35);
}
