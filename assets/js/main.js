import { createGlassFolder } from "../../components/glass-folders/create-glass-folder.js";
import { generateProjectSchema } from "./schemas/project-schema.js";
import { projects } from "./data/projects.js";
import { initMotion } from "./animations/index.js";

const $ = document;

const menuToggle = $.querySelector(".menu-toggle");
const mobileNav = $.querySelector(".mobile-nav");
const header = $.getElementById("header");
const mainProjectsGrid = $.getElementById("main-projects-grid");
const sideProjectsGrid = $.getElementById("side-projects-grid");

const projectSchema = generateProjectSchema(projects);
const schemaScript = document.createElement("script");
schemaScript.type = "application/ld+json";
schemaScript.textContent = JSON.stringify(projectSchema);
document.head.appendChild(schemaScript);

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

projects
	.filter((project) => project.main)
	.forEach((project) => {
		const folder = createGlassFolder(
			project.imageAddress,
			project.altText,
			project.folderName,
			project.main,
		);
		mainProjectsGrid.appendChild(folder);
	});

projects
	.filter((project) => !project.main)
	.forEach((project) => {
		const folder = createGlassFolder(
			project.imageAddress,
			project.altText,
			project.folderName,
			project.main,
		);
		sideProjectsGrid.appendChild(folder);
	});

/* Motion is initialised LAST: the reveal observer needs the
   project folders to already exist in the DOM. */
initMotion();
