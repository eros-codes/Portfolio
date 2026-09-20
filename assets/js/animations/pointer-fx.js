/* =========================================================
   POINTER FX

   spotlight — a soft light that follows the cursor across the
               contact card. It is a pseudo-element moved with
               transform, NOT an animated gradient position,
               because gradients repaint and transforms don't.

   magnetic  — the CTA pulls toward the cursor when you get near.
               Safe to use transform here: the stylesheet animates
               `scale` (a separate property), not `transform`.
   ========================================================= */

import { onFrame, lerp, round, hasFinePointer, setVar } from "./core.js";

const MAGNET_RADIUS = 90; // px beyond the button edge
const MAGNET_PULL = 0.32; // 0..1

export function initPointerFx() {
	if (!hasFinePointer()) return;
	initSpotlight(".contact-cta");
	document.querySelectorAll(".contact-button").forEach(initMagnetic);
}

/* ---------------------------------------------------------- */

function initSpotlight(selector) {
	const el = document.querySelector(selector);
	if (!el) return;

	el.classList.add("has-spotlight");

	let tx = 0,
		ty = 0,
		x = 0,
		y = 0,
		live = false;

	el.addEventListener(
		"pointermove",
		(e) => {
			const r = el.getBoundingClientRect();
			tx = e.clientX - r.left;
			ty = e.clientY - r.top;
			if (!live) {
				x = tx;
				y = ty;
				live = true;
				el.classList.add("is-lit");
			}
		},
		{ passive: true },
	);

	el.addEventListener(
		"pointerleave",
		() => {
			live = false;
			el.classList.remove("is-lit");
		},
		{ passive: true },
	);

	onFrame(() => {
		if (!live) return;
		x = lerp(x, tx, 0.12);
		y = lerp(y, ty, 0.12);
		setVar(el, "--lx", `${round(x)}px`);
		setVar(el, "--ly", `${round(y)}px`);
	});
}

/* ---------------------------------------------------------- */

function initMagnetic(el) {
	el.classList.add("is-magnetic");

	let tx = 0,
		ty = 0,
		x = 0,
		y = 0,
		near = false;

	window.addEventListener(
		"pointermove",
		(e) => {
			const r = el.getBoundingClientRect();
			if (r.width === 0) return; // hidden breakpoint twin

			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const dx = e.clientX - cx;
			const dy = e.clientY - cy;

			const inside =
				Math.abs(dx) < r.width / 2 + MAGNET_RADIUS &&
				Math.abs(dy) < r.height / 2 + MAGNET_RADIUS;

			near = inside;
			tx = inside ? dx * MAGNET_PULL : 0;
			ty = inside ? dy * MAGNET_PULL : 0;
		},
		{ passive: true },
	);

	onFrame(() => {
		if (!near && Math.abs(x) < 0.05 && Math.abs(y) < 0.05) return;
		x = lerp(x, tx, 0.16);
		y = lerp(y, ty, 0.16);
		setVar(el, "--mx", `${round(x)}px`);
		setVar(el, "--my", `${round(y)}px`);
	});
}
