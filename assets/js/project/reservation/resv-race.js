/* =========================================================
   NO TABLE TWICE — two guests, one table, the same moment

   Both requests reach the server together. Checking the table and
   creating the hold happen inside one Serializable transaction, so
   only one of them can win; the other gets the exact 409 message
   the API returns.
   ========================================================= */

import { prefersReduced, root } from "../../animations/core.js";
import { createSequence, whenVisible } from "./resv-shared.js";

export function initResvRace() {
	const stage = document.getElementById("race-stage");
	if (!stage) return;
	const replay = stage.parentElement.querySelector(".rz-replay");
	const [a, b] = stage.querySelectorAll(".race-guest");
	const server = stage.querySelector(".race-server");
	const seq = createSequence();

	const result = (guest) => guest.querySelector(".result");
	const button = (guest) => guest.querySelector(".rz-btn");

	function finalState() {
		result(a).classList.add("is-on");
		result(b).classList.add("is-on");
	}

	async function play() {
		const id = seq.begin();
		result(a).classList.remove("is-on");
		result(b).classList.remove("is-on");
		replay?.classList.remove("is-ready");
		if (!(await seq.wait(id, 600))) return;

		button(a).classList.add("is-press");
		button(b).classList.add("is-press");
		if (!(await seq.wait(id, 160))) return;
		button(a).classList.remove("is-press");
		button(b).classList.remove("is-press");

		server.classList.add("is-busy");
		if (!(await seq.wait(id, 700))) return;
		result(a).classList.add("is-on");
		if (!(await seq.wait(id, 650))) return;
		result(b).classList.add("is-on");
		server.classList.remove("is-busy");
		if (!(await seq.wait(id, 600))) return;
		replay?.classList.add("is-ready");
	}

	replay?.addEventListener("click", play);

	if (prefersReduced() || !root.classList.contains("js-motion")) {
		finalState();
		replay?.classList.add("is-ready");
		return;
	}
	whenVisible(stage, play, 0.5);
}
