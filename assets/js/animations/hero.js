/* =========================================================
   HERO

   Four things happen here, all folded into ONE transform per
   element so nothing fights anything else:

   1. image frame  -> pendulum swing driven by scroll VELOCITY
                      (uses the transform-origin already in the
                       stylesheet: center -1740% / -827%)
   2. image itself -> tilt + drift inside the frame, so the frame
                      stays put but the picture gains depth
   3. cards        -> inverse parallax at three different depths
                      + a slow idle float so they never look dead
   ========================================================= */

import {
	onFrame,
	pointer,
	scroll,
	clamp,
	lerp,
	round,
	setVar,
	hasFinePointer,
	prefersReduced,
} from "./core.js";

/* --- tuning ------------------------------------------------ */

/* The frame's transform-origin sits 1740% of its own height above
   itself — roughly 8300px up. That is a very long lever: one degree
   of rotation slides the image about 145px sideways. Amplitude has
   to stay tiny or the image swings across the page while it scrolls.
   0.105deg works out to roughly 15px of lateral drift, which reads
   as a long slow pendulum rather than a wobble. */
const SWING_MAX = 0.105; // deg
const SWING_GAIN = 0.0016; // deg per px/frame of scroll velocity

const TILT_Y = 3.4; // deg, left/right
const TILT_X = 2.6; // deg, up/down
const FRAME_DRIFT = 3.5; // px, whole frame — deliberately tiny

const TITLE_RATE = -0.16; // h1 moves faster than the page
const FRAME_RATE = 0.075; // image moves slower than the page

/* per card: [parallax strength px, float amplitude px, period s] */
const CARDS = [
	[14, 5.0, 7.4],
	[23, 6.5, 6.1], // middle card = front layer = strongest
	[11, 4.2, 8.6],
];

/* ----------------------------------------------------------- */

export function initHero() {
	const hero = document.querySelector(".hero");
	if (!hero) return;

	const frame = hero.querySelector(".hero-image");
	const img = frame?.querySelector("img");
	const title = hero.querySelector("h1");
	const kicker = hero.querySelector("h2");
	const cards = [...hero.querySelectorAll(".hero-card")];

	const fine = hasFinePointer();
	const reduced = prefersReduced();

	/* intro: let CSS fade things in, then ramp motion up so the
	   float doesn't start mid-swing while the card is arriving  */
	let intro = reduced ? 1 : 0;

	let heroVisible = true;
	if ("IntersectionObserver" in window) {
		new IntersectionObserver(
			([e]) => {
				heroVisible = e.isIntersecting;
			},
			{ rootMargin: "20% 0px" },
		).observe(hero);
	}

	if (reduced) return;
	/* Scroll-linked motion is desktop-only, on purpose.
		On a touch device the page scrolls on the compositor thread
		while this loop runs on the main thread, so anything driven
		from scrollY is permanently a frame or more behind the page
		and visibly swims during momentum scrolling. */
	if (!fine) return;

	let swing = 0;
	const last = [];

	onFrame((time) => {
		if (!heroVisible) return;

		intro = lerp(intro, 1, 0.02);
		const t = time / 1000;
		const px = fine ? pointer.x : 0;
		const py = fine ? pointer.y : 0;

		/* ---- 1. pendulum ---- */
		const target = clamp(
			scroll.smoothVelocity * SWING_GAIN,
			-SWING_MAX,
			SWING_MAX,
		);
		swing = lerp(swing, target, 0.08);

		if (frame) {
			setVar(frame, "--swing", `${round(swing, 1000)}deg`);
			setVar(frame, "--shift", `${round(scroll.y * FRAME_RATE)}px`);
		}

		/* ---- 2. tilt ----
		   The tilt goes on the <img>, which has its own centred
		   origin, so it does not inherit the frame's pendulum
		   origin. The frame itself only drifts a few pixels —
		   enough to feel alive, not enough to look like it moved. */
		if (fine) {
			if (img) {
				setVar(img, "--tilt-y", `${round(px * TILT_Y, 1000)}deg`);
				setVar(img, "--tilt-x", `${round(-py * TILT_X, 1000)}deg`);
			}
			if (frame) {
				setVar(frame, "--fx", `${round(-px * FRAME_DRIFT)}px`);
				setVar(frame, "--fy", `${round(-py * FRAME_DRIFT * 0.7)}px`);
			}
		}

		/* ---- 3. headline layer ---- */
		if (title)
			setVar(title, "--shift", `${round(scroll.y * TITLE_RATE)}px`);
		if (kicker)
			setVar(
				kicker,
				"--shift",
				`${round(scroll.y * TITLE_RATE * 0.55)}px`,
			);

		/* ---- 4. cards ----
		   Only on a real cursor. These carry backdrop-filter, and
		   moving them forces the browser to re-blur what is behind
		   them every single frame — fine on desktop, a frame-rate
		   sink on phones. Delete the guard to enable it anyway. */
		if (!fine) return;

		cards.forEach((card, i) => {
			const [strength, amp, period] = CARDS[i] || CARDS[0];
			const floatY =
				Math.sin((t / period) * Math.PI * 2 + i * 1.9) * amp * intro;
			const floatX =
				Math.cos((t / period) * Math.PI * 2 + i * 2.7) *
				amp *
				0.45 *
				intro;

			/* negative = moves AGAINST the cursor */
			const x = -px * strength * intro + floatX;
			const y = -py * strength * 0.65 * intro + floatY;

			/* These carry backdrop-filter: every changed transform makes
			   the browser re-blur what is behind them. Quantising to a
			   half pixel cuts the number of re-blurs by roughly an order
			   of magnitude and is invisible at this speed. */
			const qx = Math.round(x * 2) / 2;
			const qy = Math.round(y * 2) / 2;
			const prev = last[i];
			if (prev && prev[0] === qx && prev[1] === qy) return;
			last[i] = [qx, qy];

			setVar(card, "--cx", `${qx}px`);
			setVar(card, "--cy", `${qy}px`);
		});
	});
}
