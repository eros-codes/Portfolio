/* =========================================================
   WA BANK — shared replica helpers

   Each replica is laid out at the app's real size (900×700 plus
   a 31px title bar) and then scaled as one unit, so every
   coordinate in these files is the coordinate from the FXML.
   ========================================================= */

export const STAGE_W = 900;
export const TITLEBAR = 31;

/* ---------- scale the stage to whatever width it gets ---------- */

export function fitStage(frame) {
	const apply = () => {
		const w = frame.clientWidth;
		if (w) frame.style.setProperty("--s", (w / STAGE_W).toFixed(4));
	};
	apply();
	if ("ResizeObserver" in window) new ResizeObserver(apply).observe(frame);
	else window.addEventListener("resize", apply, { passive: true });
	return () => parseFloat(getComputedStyle(frame).getPropertyValue("--s")) || 1;
}

/* ---------- a sequence that can be cancelled and restarted ---------- */

export function createSequence() {
	let token = 0;
	return {
		begin() {
			return ++token;
		},
		stop() {
			token++;
		},
		alive(id) {
			return id === token;
		},
		/* resolves to false when the run has been superseded */
		async wait(id, ms) {
			await new Promise((r) => setTimeout(r, ms));
			return id === token;
		},
	};
}

/* ---------- position of an element inside its screen ---------- */

export function boxIn(el, root) {
	let x = 0;
	let y = 0;
	let node = el;
	while (node && node !== root) {
		x += node.offsetLeft;
		y += node.offsetTop;
		node = node.offsetParent;
	}
	return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 };
}

/* ---------- the demo pointer ---------- */

export function makeCursor(scaleEl) {
	const el = scaleEl.querySelector(".wa-cursor");
	let x = 450;
	let y = 420;

	const place = () => {
		el.style.setProperty("--cx", `${x}px`);
		el.style.setProperty("--cy", `${y}px`);
	};
	place();

	return {
		el,
		show() {
			el.classList.add("is-on");
		},
		hide() {
			el.classList.remove("is-on");
			el.classList.remove("is-down");
		},
		/* coordinates are screen coordinates: the title bar is added here */
		async to(nx, ny, ms = 600) {
			el.style.transition = `opacity .3s ease, transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
			x = nx;
			y = ny + TITLEBAR;
			place();
			await new Promise((r) => setTimeout(r, ms));
		},
		jump(nx, ny) {
			el.style.transition = "opacity .3s ease";
			x = nx;
			y = ny + TITLEBAR;
			place();
		},
		down() {
			el.classList.add("is-down");
		},
		up() {
			el.classList.remove("is-down");
		},
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

/* ---------- fields ---------- */

export function resetField(field) {
	field.querySelector(".typed").textContent = "";
	field.classList.remove("is-focus");
	const prompt = field.querySelector(".prompt");
	if (prompt) prompt.classList.remove("is-gone");
	const ghost = field.querySelector(".ghost");
	if (ghost) ghost.textContent = ghost.dataset.full || ghost.textContent;
}

export function focusField(field, on = true) {
	field.classList.toggle("is-focus", on);
}

/* types character by character; the ghost suggestion shrinks as the
   typed text grows, exactly like the TextFlow in the real app */
export async function typeInto(seq, id, field, text, per = 90, onStep) {
	const typed = field.querySelector(".typed");
	const ghost = field.querySelector(".ghost");
	const prompt = field.querySelector(".prompt");
	if (prompt) prompt.classList.add("is-gone");
	if (ghost && !ghost.dataset.full) ghost.dataset.full = ghost.textContent;

	for (let i = 1; i <= text.length; i++) {
		typed.textContent = text.slice(0, i);
		if (ghost && ghost.dataset.full.startsWith(text.slice(0, i))) {
			ghost.textContent = ghost.dataset.full.slice(i);
		}
		onStep?.(text.slice(0, i));
		if (!(await seq.wait(id, per))) return false;
	}
	return true;
}

/* the Enter shortcut: the rest of your own number fills itself in */
export function completeField(field) {
	const typed = field.querySelector(".typed");
	const ghost = field.querySelector(".ghost");
	if (!ghost) return;
	typed.textContent = ghost.dataset.full || typed.textContent + ghost.textContent;
	ghost.textContent = "";
}

/* ---------- misc ---------- */

export function nowStamp() {
	const d = new Date();
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function transactionCode() {
	return String(100000 + Math.floor(Math.random() * 900000));
}

/* starts a run once the replica is on screen, and waits if the page
   was opened in a background tab */
export function whenVisible(el, start, threshold = 0.4) {
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
