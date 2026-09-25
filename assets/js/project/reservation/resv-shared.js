/* =========================================================
   RESERVATION — helpers shared by the three demos
   ========================================================= */

export const MAP_URLS = {
	baseUrl: "../assets/images/projects/reservation/roof-base.svg",
	configUrl: "../assets/images/projects/reservation/roof-map.json",
};

export const fa = (n) => Number(n).toLocaleString("fa-IR");

/* the renderer zooms on every wheel event, which would trap the page
   scroll whenever the pointer rests on the map. Ordinary wheel events
   are stopped before they reach it; pinch and ctrl+wheel still zoom. */
export function freeTheScroll(frame) {
	frame.addEventListener(
		"wheel",
		(event) => {
			if (!event.ctrlKey) event.stopPropagation();
		},
		{ capture: true },
	);
}

export function createSequence() {
	let token = 0;
	return {
		begin: () => ++token,
		stop: () => token++,
		alive: (id) => id === token,
		async wait(id, ms) {
			await new Promise((r) => setTimeout(r, ms));
			return id === token;
		},
	};
}

/* a pointer that moves in the frame's own CSS pixels */
export function makeCursor(frame) {
	const el = frame.querySelector(".rz-cursor");
	const place = (x, y) => {
		el.style.setProperty("--cx", `${x}px`);
		el.style.setProperty("--cy", `${y}px`);
	};
	const centre = (target) => {
		const f = frame.getBoundingClientRect();
		const r = target.getBoundingClientRect();
		return [r.left - f.left + r.width / 2, r.top - f.top + r.height / 2];
	};
	return {
		centre,
		show: () => el.classList.add("is-on"),
		hide: () => el.classList.remove("is-on", "is-down"),
		jump(x, y) {
			el.style.transition = "opacity .3s ease";
			place(x, y);
		},
		async to(target, ms = 600) {
			const [x, y] = Array.isArray(target) ? target : centre(target);
			el.style.transition = `opacity .3s ease, transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
			place(x, y);
			await new Promise((r) => setTimeout(r, ms));
		},
		down: () => el.classList.add("is-down"),
		up: () => el.classList.remove("is-down"),
		async click(pressEl) {
			el.classList.add("is-down");
			pressEl?.classList.add("is-press");
			await new Promise((r) => setTimeout(r, 140));
			el.classList.remove("is-down");
			pressEl?.classList.remove("is-press");
			await new Promise((r) => setTimeout(r, 90));
		},
	};
}

export function whenVisible(el, start, threshold = 0.45) {
	const go = () => {
		if (document.visibilityState === "hidden") {
			document.addEventListener("visibilitychange", go, { once: true });
			return;
		}
		start();
	};
	if (!("IntersectionObserver" in window)) return go();
	const io = new IntersectionObserver(
		([e]) => {
			if (!e.isIntersecting) return;
			io.disconnect();
			go();
		},
		{ threshold },
	);
	io.observe(el);
}
