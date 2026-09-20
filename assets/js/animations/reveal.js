/* =========================================================
   SCROLL REVEAL

   SEO NOTE — read before editing:
   The hidden start state lives in animations.css behind the
   `.js-motion` class, which is only added by the inline script
   in <head>. If JS never runs, nothing is ever hidden.
   The selector list below is mirrored EXACTLY in
   assets/stylesheets/animations.css (section "REVEAL TARGETS").
   Change one, change the other.
   ========================================================= */

import { prefersReduced, onResize, root } from "./core.js";
import { splitWords } from "./split-words.js";

/* The About paragraphs get a later trigger than everything else.
   They are tall, so on a phone a chunk of the paragraph is already
   on screen by the time a 12% threshold fires and the word-by-word
   entrance starts half-finished. threshold 0 with a -18% bottom
   margin means it always starts from below the fold instead. */
const LATE = { margin: "0px 0px -18% 0px", threshold: 0 };

const WORD_SPLIT = ".about-text p";

const GROUPS = [
	{ sel: ".about-card > h3", stagger: 0 },
	{ sel: WORD_SPLIT, stagger: 90, opts: LATE },
	{ sel: ".education-card > h3", stagger: 0 },
	{ sel: ".education-info", stagger: 0 },
	{ sel: ".skills-card > h3", stagger: 0 },
	{ sel: ".skill-group", stagger: 110 },
	{ sel: ".connect-card > h3", stagger: 0 },
	{ sel: ".profile-card", stagger: 0 },
	{ sel: ".vertical-divider", stagger: 0 },
	{ sel: ".projects h2", stagger: 0 },
	{ sel: ".projects > span", stagger: 0 },
	{ sel: "#main-projects-grid .folder", stagger: 110 },
	{ sel: "#side-projects-grid .folder", stagger: 65 },
	{ sel: ".contact-content h2, .contact-cta-mobile h2", stagger: 0 },
	{ sel: ".contact-content p, .contact-cta-mobile p", stagger: 70 },
	{ sel: ".contact-button", stagger: 0 },
	{ sel: ".footer-brand, .footer-column", stagger: 120 },
];

/* how long the reveal transition runs — after this we hand the
   element back to its own transitions (folder hover, etc.)      */
const SETTLE_MS = 1100;

const watched = new Set();

function show(el) {
	if (!watched.has(el)) return;
	watched.delete(el);
	el.classList.add("is-inview");
	setTimeout(() => el.classList.add("is-settled"), SETTLE_MS);
}

/* Reveals anything that is currently on screen or already
   scrolled past. Never touches elements still below the fold,
   so a genuine reveal is never spoiled.                        */
function rescan() {
	const h = window.innerHeight;
	for (const el of [...watched]) {
		const r = el.getBoundingClientRect();
		if (r.height === 0 && r.width === 0) continue; // display:none twin
		if (r.top < h * 0.94) show(el);
	}
}

export function initReveal() {
	/* reduced motion, or no IntersectionObserver:
	   drop the gate class so CSS never hides anything. */
	if (prefersReduced() || !("IntersectionObserver" in window)) {
		root.classList.remove("js-motion");
		return;
	}

	splitWords(WORD_SPLIT);

	const observers = new Map();
	const observerFor = (opts) => {
		const key = `${opts.margin}|${opts.threshold}`;
		if (!observers.has(key)) {
			const io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						show(entry.target);
						io.unobserve(entry.target);
					}
				},
				{ threshold: opts.threshold, rootMargin: opts.margin },
			);
			observers.set(key, io);
		}
		return observers.get(key);
	};

	const DEFAULT = { margin: "0px 0px -6% 0px", threshold: 0.12 };

	for (const { sel, stagger, opts } of GROUPS) {
		const matches = [...document.querySelectorAll(sel)];

		/* Stagger has to restart inside each container. The bento grid
		   exists three times over (laptop / tablet / mobile), so a
		   single running index would hand the mobile copy a delay of
		   half a second before its first element even appears. */
		if (stagger) {
			const seen = new Map();
			for (const el of matches) {
				const i = seen.get(el.parentElement) || 0;
				seen.set(el.parentElement, i + 1);
				el.style.setProperty("--rv-delay", `${i * stagger}ms`);
			}
		}

		const io = observerFor(opts || DEFAULT);
		for (const el of matches) {
			watched.add(el);
			io.observe(el);
		}
	}

	/* Breakpoint switches flip whole bento grids between
	   display:none and visible — re-check on resize.       */
	onResize(rescan);

	/* Safety sweep. IntersectionObserver can silently refuse to
	   report an element whose own paint is collapsed (Chrome does
	   this for clip-path), and crawlers render at odd viewport
	   sizes. This catches anything the observer misses, then stops
	   itself once every element has been revealed. */
	const sweep = setInterval(() => {
		if (!watched.size) return clearInterval(sweep);
		rescan();
	}, 1200);

	window.addEventListener("load", () => setTimeout(rescan, 400), {
		once: true,
	});
}
