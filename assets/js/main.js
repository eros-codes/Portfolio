import { initMotion } from "./animations/index.js";

const $ = document;

const menuToggle = $.querySelector(".menu-toggle");
const mobileNav = $.querySelector(".mobile-nav");
const header = $.getElementById("header");

function closeMobileMenu() {
	menuToggle?.setAttribute("aria-expanded", "false");
	mobileNav?.setAttribute("aria-hidden", "true");
	mobileNav?.classList.remove("is-open");
}

menuToggle?.addEventListener("click", () => {
	const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
	menuToggle.setAttribute("aria-expanded", String(!isOpen));
	mobileNav?.setAttribute("aria-hidden", String(isOpen));
	mobileNav?.classList.toggle("is-open", !isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => {
	link.addEventListener("click", closeMobileMenu);
});

$.addEventListener("click", (e) => {
	if (
		!mobileNav?.classList.contains("is-open") ||
		mobileNav.contains(e.target) ||
		menuToggle?.contains(e.target)
	) {
		return;
	}
	closeMobileMenu();
});

function updateHeaderState() {
	if (!header) {
		return;
	}

	const isAtTop = window.scrollY === 0;
	header.classList.toggle("header-deactive", isAtTop);
	header.classList.toggle("header-active", !isAtTop);
}

window.addEventListener("scroll", updateHeaderState);
updateHeaderState();

initMotion();
