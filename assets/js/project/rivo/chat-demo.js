/* =========================================================
   CHAT DEMO — the hero plays a short Rivo conversation:
   a one-time message is opened and burns, a time capsule
   counts down and unlocks.

   Every state already exists in the HTML; this file only flips
   classes and data-state. Without it, the conversation shows
   in its finished state.
   ========================================================= */

import { prefersReduced, root } from "../../animations/core.js";

const COUNTDOWN = 3;

/* the script, in milliseconds from the start */
const SCRIPT = [
	[500, "typing"],
	[1400, "show", 0],
	[2300, "show", 1],
	[3100, "show", 2],
	[4100, "once", "open"],
	[5900, "once", "gone"],
	[6500, "typing"],
	[7400, "show", 3],
	[8300, "show", 4],
];

export function initChatDemo() {
	const chat = document.querySelector(".chat");
	if (!chat) return;
	if (prefersReduced() || !root.classList.contains("js-motion")) return;

	const replay = document.querySelector(".chat-replay");
	const msgs = [...chat.querySelectorAll(".msg")];
	const once = chat.querySelector(".msg-once");
	const capsule = chat.querySelector(".msg-capsule");
	const count = chat.querySelector(".capsule-count");

	let timers = [];
	const at = (ms, fn) => timers.push(setTimeout(fn, ms));
	const fmt = (s) => `0:${String(s).padStart(2, "0")}`;

	function reset() {
		timers.forEach(clearTimeout);
		timers = [];
		chat.classList.remove("is-typing");
		msgs.forEach((m) => m.classList.remove("is-in"));
		if (once) once.dataset.state = "sealed";
		if (capsule) capsule.dataset.state = "locked";
		if (count) count.textContent = fmt(COUNTDOWN);
		replay?.classList.remove("is-ready");
	}

	function play() {
		reset();

		for (const [ms, action, arg] of SCRIPT) {
			at(ms, () => {
				if (action === "typing") chat.classList.add("is-typing");
				if (action === "show") {
					chat.classList.remove("is-typing");
					msgs[arg]?.classList.add("is-in");
				}
				if (action === "once" && once) once.dataset.state = arg;
			});
		}

		/* the capsule's own clock starts once it is on screen */
		const start = SCRIPT[SCRIPT.length - 1][0];
		for (let s = 1; s <= COUNTDOWN; s++) {
			at(start + s * 1000, () => {
				if (count) count.textContent = fmt(COUNTDOWN - s);
				if (s === COUNTDOWN && capsule) capsule.dataset.state = "open";
			});
		}

		at(start + COUNTDOWN * 1000 + 900, () => replay?.classList.add("is-ready"));
	}

	chat.classList.add("is-armed");
	reset();

	/* a tab opened in the background waits until it is looked at */
	const begin = () => {
		if (document.visibilityState === "hidden") {
			document.addEventListener("visibilitychange", begin, { once: true });
			return;
		}
		play();
	};

	setTimeout(begin, 900);
	replay?.addEventListener("click", play);
}
