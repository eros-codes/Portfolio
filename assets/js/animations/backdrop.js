/* =========================================================
   BACKDROP PARALLAX

   The dot grid is moved onto its own fixed layer and drifts at
   ~0.3x page speed. Because the pattern tiles every 10px we can
   wrap the offset with a modulo — the layer never travels more
   than one tile, so there is no edge to run out of and the whole
   thing stays a single composited transform.
   ========================================================= */

import { onFrame, scroll, pointer, round, prefersReduced, root } from "./core.js";

const TILE = 10; // must match background-size in animations.css
const SCROLL_RATE = 0.3; // 0 = pinned to viewport, 1 = pinned to page
const POINTER_SHIFT = 6; // px

export function initBackdrop() {
	if (prefersReduced()) return;

	const layer = document.createElement("div");
	layer.className = "bg-parallax";
	layer.setAttribute("aria-hidden", "true");
	document.body.prepend(layer);
	root.classList.add("has-bg-layer");

	const wrap = (v) => ((v % TILE) + TILE) % TILE;

	onFrame(() => {
		const y = wrap(-scroll.y * SCROLL_RATE + pointer.y * POINTER_SHIFT);
		const x = wrap(pointer.x * POINTER_SHIFT);
		layer.style.transform = `translate3d(${round(x)}px, ${round(y)}px, 0)`;
	});
}
