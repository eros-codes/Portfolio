/* =========================================================
   SCRIPTED DEMOS — shared by the case studies' replicas
   A demo plays like a short film when it scrolls into view.
   createSequence numbers each run, so a run that has been
   superseded notices and stops; whenVisible starts a demo the
   first time enough of it is on screen.
   ========================================================= */

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
