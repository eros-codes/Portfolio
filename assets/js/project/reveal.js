/* =========================================================
   REVEAL — generic, attribute driven.

   data-reveal=""          rise + fade (staggered per container)
   data-reveal="wipe"      mask wipe, for headings
   data-reveal="step"      pipeline step, lit on mobile
   data-reveal="pipeline"  the rail sequence on desktop

   The hidden states live in project.css behind .js-motion, so
   with no JavaScript nothing is ever hidden.
   ========================================================= */

import { prefersReduced, onResize, root } from "../animations/core.js";

const STAGGER = 90;
const SETTLE_MS = 1100;

/* how far into the viewport an element must be before it plays;
   the pipeline waits longer so its sequence is actually seen */
const DEPTH = { pipeline: 0.62 };

const watched = new Set();

function show(el) {
	if (!watched.has(el)) return;
	watched.delete(el);
	el.classList.add("is-inview");
	setTimeout(() => el.classList.add("is-settled"), SETTLE_MS);
}

function rescan() {
	const h = window.innerHeight;
	for (const el of [...watched]) {
		const r = el.getBoundingClientRect();
		if (r.width === 0 && r.height === 0) continue;
		const depth = DEPTH[el.dataset.reveal] ?? 0.94;
		if (r.top < h * depth) show(el);
	}
}

export function initReveal() {
	if (prefersReduced() || !("IntersectionObserver" in window)) {
		root.classList.remove("js-motion");
		return;
	}

	const perParent = new Map();
	for (const el of document.querySelectorAll("[data-reveal]")) {
		if (el.dataset.reveal === "") {
			const i = perParent.get(el.parentElement) || 0;
			perParent.set(el.parentElement, i + 1);
			el.style.setProperty("--rv-delay", `${i * STAGGER}ms`);
		}
		watched.add(el);
	}

	const make = (options) =>
		new IntersectionObserver((entries, io) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				show(e.target);
				io.unobserve(e.target);
			}
		}, options);

	const normal = make({ threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
	const deep = make({ threshold: 0, rootMargin: "0px 0px -38% 0px" });

	for (const el of watched) {
		(el.dataset.reveal === "pipeline" ? deep : normal).observe(el);
	}

	onResize(rescan);

	/* safety sweep: catches anything the observer misses, then stops */
	const sweep = setInterval(() => {
		if (!watched.size) return clearInterval(sweep);
		rescan();
	}, 1200);

	window.addEventListener("load", () => setTimeout(rescan, 400), { once: true });
}
