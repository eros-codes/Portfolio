/* =========================================================
   DELIVERY DEMO — nothing lost when the connection drops.
   1. The phone falls asleep; the connection drops without a
      sound. On the server, Sara edits her message.
   2. The phone wakes up; two messages are written. They go
      into the outbox (a clock) and are saved in the browser.
   3. Reconnect: the server confirms the same account, then the
      app catches up from the last time it heard the server,
      minus 30 seconds, so the edit arrives.
   4. The outbox sends in order. One answer is lost; the app
      sends again with the same clientId and gets the same
      message back, not a second copy.
   ========================================================= */
import { prefersReduced } from "../base/core.js";
import { createSequence, whenVisible } from "../case-study/demo.js";

export function initDeliveryDemo() {
	const demo = document.getElementById("dl-demo");
	if (!demo) return;
	const chat = demo.querySelector(".dl-chat");
	const status = demo.querySelector(".chat-status");
	const list = demo.querySelector(".chat-log");
	const theirs = demo.querySelector("[data-their]");
	const log = demo.querySelector(".dl-log");
	const verdict = demo.querySelector(".dl-verdict");
	const replay = demo.querySelector(".chat-replay");
	const seq = createSequence();

	const line = (text, kind = "") => {
		const li = document.createElement("li");
		li.textContent = text;
		if (kind) li.className = `is-${kind}`;
		log.append(li);
	};
	const mine = (text) => {
		const li = document.createElement("li");
		li.className = "msg msg-me dl-msg";
		li.append(text);
		const tick = document.createElement("span");
		tick.className = "dl-tick";
		tick.textContent = "🕓";
		tick.setAttribute("aria-label", "waiting to be sent");
		li.append(tick);
		list.append(li);
		return tick;
	};
	const sent = (tick) => {
		tick.textContent = "✓";
		tick.setAttribute("aria-label", "sent");
	};
	const reset = () => {
		chat.classList.remove("is-offline", "is-asleep");
		status.textContent = "online";
		list.querySelectorAll(".dl-msg").forEach((m) => m.remove());
		theirs.classList.remove("is-updated");
		theirs.querySelector("span").textContent = "See you at 7";
		theirs.querySelector(".dl-edited")?.remove();
		log.replaceChildren();
		verdict.classList.remove("is-on");
		replay?.classList.remove("is-ready");
	};

	const STEPS = (id) => [
		[900, () => line("21:04:10  last heard from the server")],
		[1300, () => { chat.classList.add("is-asleep"); line("the phone sleeps · the connection drops unnoticed", "warn"); }],
		[1500, () => line("21:06  Sara edits: 7 → 8  (on the server)", "server")],
		[1700, () => { chat.classList.remove("is-asleep"); chat.classList.add("is-offline"); status.textContent = "waiting for network"; line("21:14  the phone wakes up", "warn"); }],
		[1100, (s) => { s.a = mine("Leaving now"); }],
		[900, (s) => { s.b = mine("Grabbing coffee on the way"); line("2 messages in the outbox · saved in the browser"); }],
		[1600, () => { chat.classList.remove("is-offline"); status.textContent = "online"; line("reconnected · same account confirmed", "ok"); }],
		[1100, () => {
			line("GET /changes?since=21:03:40  (last heard − 30 s)", "server");
		}],
		[900, () => {
			theirs.querySelector("span").textContent = "See you at 8";
			const e = document.createElement("span");
			e.className = "dl-edited";
			e.textContent = "edited";
			theirs.append(e);
			theirs.classList.add("is-updated");
			line("↳ the edit from 21:06 arrives", "ok");
		}],
		[1100, (s) => { sent(s.a); line("send clientId 8fK2…  ✓", "ok"); }],
		[1100, () => line("send clientId Q7xa…  the answer is lost", "warn")],
		[1200, (s) => { sent(s.b); line("send clientId Q7xa… again → the same message back", "ok"); }],
		[800, () => { verdict.classList.add("is-on"); replay?.classList.add("is-ready"); }],
	];

	const play = async (instant = false) => {
		const id = seq.begin();
		reset();
		const state = {};
		for (const [delay, step] of STEPS(id)) {
			if (!instant && !(await seq.wait(id, delay))) return;
			step(state);
		}
	};

	replay?.addEventListener("click", () => play(prefersReduced()));
	if (prefersReduced()) play(true);
	else whenVisible(demo, () => play(), 0.35);
}
