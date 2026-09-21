/* =========================================================
   HEADER — same behaviour as the homepage: solid bar at the top,
   glass bar once the page scrolls, and the mobile menu.
   ========================================================= */

export function initHeader() {
	const header = document.getElementById("header");
	const toggle = document.querySelector(".menu-toggle");
	const nav = document.querySelector(".mobile-nav");

	const close = () => {
		toggle?.setAttribute("aria-expanded", "false");
		nav?.setAttribute("aria-hidden", "true");
		nav?.classList.remove("is-open");
	};

	toggle?.addEventListener("click", () => {
		const open = toggle.getAttribute("aria-expanded") === "true";
		toggle.setAttribute("aria-expanded", String(!open));
		nav?.setAttribute("aria-hidden", String(open));
		nav?.classList.toggle("is-open", !open);
	});

	nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

	document.addEventListener("click", (e) => {
		if (!nav?.classList.contains("is-open")) return;
		if (nav.contains(e.target) || toggle?.contains(e.target)) return;
		close();
	});

	const update = () => {
		if (!header) return;
		const atTop = window.scrollY === 0;
		header.classList.toggle("header-deactive", atTop);
		header.classList.toggle("header-active", !atTop);
	};

	window.addEventListener("scroll", update, { passive: true });
	update();
}
