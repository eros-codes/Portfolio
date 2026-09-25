/* =========================================================
   SORT DEMO — Rivo's home screen, sorting itself.

   Rivo's rule: a chat stays in Active chats while its last
   message is unseen. Once the last message is seen and nobody
   replies, the conversation is over and it moves to Contacts.

   1. Ali's last message is mine, still unseen (one tick).
      He sees it (two ticks) and does not reply, so the chat
      loses its colour and moves to Contacts.
   2. Lili, a contact, sends a new message. It is unseen, so
      her chat moves back to the top of Active chats.

   The same <li> moves between the two lists; the list it sits in
   decides whether it looks like a pill or a card. Movement uses
   FLIP with the Web Animations API, so only transform and opacity
   are animated.
   ========================================================= */

import { prefersReduced, root } from "../../animations/core.js";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const SORT_SCRIPT = [
	[700, "seen", "ali"],
	[1400, "quiet", "ali"],
	[2200, "move", "ali", "contacts"],
	[3800, "ping", "lili"],
	[4700, "move", "lili", "active"],
];
const DONE_AT = 5900;

export function initSortDemo() {
	const fig = document.querySelector(".rv");
	if (!fig) return;
	if (prefersReduced() || !root.classList.contains("js-motion")) return;

	const lists = {
		active: fig.querySelector(".rv-active"),
		contacts: fig.querySelector(".rv-contacts"),
	};
	const replay = document.querySelector(".rv-replay");
	const snapshot = { active: lists.active.innerHTML, contacts: lists.contacts.innerHTML };

	let timers = [];
	const at = (ms, fn) => timers.push(setTimeout(fn, ms));
	const items = () => [...fig.querySelectorAll(".rv-chat")];
	const chat = (id) => fig.querySelector(`.rv-chat[data-id="${id}"]`);

	function move(el, target) {
		const first = new Map(items().map((i) => [i, i.getBoundingClientRect()]));

		const out = el.animate(
			[
				{ opacity: 1, transform: "none" },
				{ opacity: 0, transform: "scale(0.94)" },
			],
			{ duration: 260, easing: "ease-in", fill: "forwards" },
		);

		out.onfinish = () => {
			el.classList.remove("is-quiet", "is-pinged");
			target.prepend(el);
			out.cancel();

			for (const i of items()) {
				const f = first.get(i);
				const l = i.getBoundingClientRect();
				const dx = f.left - l.left;
				const dy = f.top - l.top;

				if (i === el) {
					/* arrives from the direction it left, but only part of
					   the way, so it reads as moving rather than teleporting */
					i.animate(
						[
							{ opacity: 0, transform: `translate(${dx * 0.3}px, ${dy * 0.3}px) scale(0.94)` },
							{ opacity: 1, transform: "none" },
						],
						{ duration: 650, easing: EASE },
					);
				} else if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
					i.animate(
						[{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
						{ duration: 650, easing: EASE },
					);
				}
			}
		};
	}

	/* the last message is seen: one tick becomes two */
	function seen(el) {
		const tick = el.querySelector(".rv-tick");
		if (tick) tick.textContent = "✓✓";
	}

	/* seen and no reply: the conversation is over */
	function quiet(el) {
		el.classList.add("is-quiet");
		el.querySelector(".rv-badge")?.remove();
	}

	function ping(el) {
		el.classList.add("is-pinged");
		el.querySelector(".rv-msg").textContent = "Free this Friday?";
		el.querySelector(".rv-time").textContent = "now";
		if (!el.querySelector(".rv-badge")) {
			const b = document.createElement("span");
			b.className = "rv-badge";
			b.textContent = "1";
			el.append(b);
		}
	}

	function reset() {
		timers.forEach(clearTimeout);
		timers = [];
		fig.getAnimations({ subtree: true }).forEach((a) => a.cancel());
		lists.active.innerHTML = snapshot.active;
		lists.contacts.innerHTML = snapshot.contacts;
		replay?.classList.remove("is-ready");
	}

	function play() {
		reset();
		for (const [ms, action, id, dest] of SORT_SCRIPT) {
			at(ms, () => {
				const el = chat(id);
				if (!el) return;
				if (action === "seen") seen(el);
				if (action === "quiet") quiet(el);
				if (action === "ping") ping(el);
				if (action === "move") move(el, lists[dest]);
			});
		}
		at(DONE_AT, () => replay?.classList.add("is-ready"));
	}

	/* play once, the first time the replica is properly in view */
	const io = new IntersectionObserver(
		([e]) => {
			if (!e.isIntersecting) return;
			io.disconnect();
			const begin = () => {
				if (document.visibilityState === "hidden") {
					document.addEventListener("visibilitychange", begin, { once: true });
					return;
				}
				play();
			};
			begin();
		},
		{ threshold: 0.55 },
	);
	io.observe(fig);

	replay?.addEventListener("click", play);
}
