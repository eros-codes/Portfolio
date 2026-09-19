import { createGlassFolder } from "../../components/glass-folders/create-glass-folder.js";

const $ = document

const menuToggle = $.querySelector(".menu-toggle");
const mobileNav = $.querySelector(".mobile-nav");
const header = $.getElementById("header")
const mainProjectsGrid = $.getElementById("main-projects-grid");
const sideProjectsGrid = $.getElementById("side-projects-grid");

const mainProjects = [
	{
		imageAddress: "assets/images/projects/rivo.webp",
		folderName: "Rivo",
		main: true
	},
	{
		imageAddress: "assets/images/projects/bank.webp",
		folderName: "Bank",
		main: true
	},
	{
		imageAddress: "assets/images/projects/reservasion.webp",
		folderName: "Reservation",
		main: true
	},
	{
		imageAddress: "assets/images/projects/shop.webp",
		folderName: "Shop",
		main: true
	},
];

const minorProjects = [
	{
		imageAddress: "assets/images/projects/cafe.webp",
		folderName: "Cafe",
		main: false,
	},
	{
		folderName: "PassVault",
		main: false,
	},
	{
		folderName: "IG Downloader",
		main: false,
	},
	{
		folderName: "Task Maneger",
		main: false,
	},
	{
		imageAddress: "assets/images/projects/infinitic.webp",
		folderName: "InfiniTic",
		main: false,
	},
	{
		imageAddress: "assets/images/projects/todolist.webp",
		folderName: "To Do List",
		main: false,
	},
	{
		folderName: "Task Maneger",
		main: false,
	},
];

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

mainProjects.forEach(project => {
	const folder = createGlassFolder(project.imageAddress, project.folderName, project.main);
	mainProjectsGrid.appendChild(folder);
});

minorProjects.forEach(project => {
	const folder = createGlassFolder(project.imageAddress, project.folderName, project.main);
	sideProjectsGrid.appendChild(folder);
});