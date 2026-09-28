/* =========================================================
   MOTION CORE
   One rAF loop for the whole site. Every effect subscribes
   here instead of owning its own listener.

   JS produces numbers -> CSS decides what they look like.
   ========================================================= */

const root = document.documentElement;

/* ---------- capability queries ---------- */

export const media = {
	reduced: matchMedia("(prefers-reduced-motion: reduce)"),
	finePointer: matchMedia("(hover: hover) and (pointer: fine)"),
	laptop: matchMedia("(min-width: 1025px)"),
};

export const prefersReduced = () => media.reduced.matches;
export const hasFinePointer = () =>
	media.finePointer.matches && !prefersReduced();

/* ---------- math helpers ---------- */

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const round = (v, p = 100) => Math.round(v * p) / p;

/* ---------- shared state ---------- */

/* pointer.x / pointer.y are SMOOTHED and normalised to -1..1.
   tx / ty are the raw targets. The gap between them is what
   makes things feel like they float instead of twitch.       */
export const pointer = { tx: 0, ty: 0, x: 0, y: 0, inside: false };

export const scroll = { y: 0, prev: 0, velocity: 0, smoothVelocity: 0 };

/* ---------- scheduler ---------- */

const tasks = new Set();
let ticking = false;
let idleFrames = 0;

/* frames of complete stillness before the loop parks itself.
   Kept high enough that the hero's idle float keeps running. */
const IDLE_LIMIT = 100000;

const POINTER_EASE = 0.075;
const VELOCITY_EASE = 0.1;

function tick(time) {
	/* pointer smoothing */
	pointer.x = lerp(pointer.x, pointer.tx, POINTER_EASE);
	pointer.y = lerp(pointer.y, pointer.ty, POINTER_EASE);

	/* scroll + scroll velocity */
	scroll.y = window.scrollY || 0;
	scroll.velocity = scroll.y - scroll.prev;
	scroll.prev = scroll.y;
	scroll.smoothVelocity = lerp(
		scroll.smoothVelocity,
		clamp(scroll.velocity, -90, 90),
		VELOCITY_EASE,
	);

	for (const task of tasks) task(time);

	/* Go quiet when nothing is actually moving, so an idle tab is
	   not burning a frame callback forever. Any pointer move or
	   scroll calls wake() again. */
	const still =
		Math.abs(pointer.x - pointer.tx) < 0.0005 &&
		Math.abs(pointer.y - pointer.ty) < 0.0005 &&
		Math.abs(scroll.smoothVelocity) < 0.05;
	idleFrames = still ? idleFrames + 1 : 0;

	ticking = tasks.size > 0 && !document.hidden && idleFrames < IDLE_LIMIT;
	if (ticking) requestAnimationFrame(tick);
}

export function onFrame(task) {
	tasks.add(task);
	wake();
	return () => tasks.delete(task);
}

export function wake() {
	idleFrames = 0;
	if (ticking || document.hidden) return;
	ticking = true;
	scroll.prev = window.scrollY || 0;
	requestAnimationFrame(tick);
}

window.addEventListener("scroll", wake, { passive: true });

document.addEventListener("visibilitychange", () => {
	if (!document.hidden) wake();
});

/* ---------- pointer tracking ---------- */

export function startPointerTracking() {
	if (!hasFinePointer()) return;

	window.addEventListener(
		"pointermove",
		(e) => {
			if (e.pointerType !== "mouse") return;
			pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
			pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
			pointer.inside = true;
			wake();
		},
		{ passive: true },
	);

	document.addEventListener(
		"pointerleave",
		() => {
			pointer.tx = 0;
			pointer.ty = 0;
			pointer.inside = false;
		},
		{ passive: true },
	);
}

/* ---------- css var helper ---------- */

export function setVar(el, name, value) {
	el.style.setProperty(name, value);
}

/* ---------- debounced resize ---------- */

export function onResize(fn, delay = 180) {
	let timer;
	window.addEventListener(
		"resize",
		() => {
			clearTimeout(timer);
			timer = setTimeout(fn, delay);
		},
		{ passive: true },
	);
}

export { root };
