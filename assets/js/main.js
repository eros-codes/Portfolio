import { createGlassFolder } from "../../components/glass-folders/create-glass-folder.js";
import { generateProjectSchema } from "./project-schema.js";

const $ = document;

const menuToggle = $.querySelector(".menu-toggle");
const mobileNav = $.querySelector(".mobile-nav");
const header = $.getElementById("header");
const mainProjectsGrid = $.getElementById("main-projects-grid");
const sideProjectsGrid = $.getElementById("side-projects-grid");

const mainProjects = [
	{
		imageAddress: "assets/images/projects/rivo.webp",
		altText:
			"Rivo web application built by Arvin Saghafi using Node.js and PostgreSQL",
		folderName: "Rivo",
		description:
			"Rivo is a real-time web application built with Node.js and PostgreSQL, featuring Socket.IO communication and secure message encryption using envelope encryption with HashiCorp Vault key management.",
		category: "Web Application",
		operatingSystem: "Web",
		technologies: [
			"HTML",
			"CSS",
			"JavaScript",
			"Node.js",
			"Express.js",
			"PostgreSQL",
			"Socket.IO",
			"WebSocket",
			"HashiCorp Vault",
			"Envelope Encryption",
			"Key Management",
			"REST API",
		],
		keywords: [
			"Real-time Application",
			"Secure Messaging",
			"Backend System",
			"Encryption",
			"Database",
			"API",
		],
		main: true,
	},

	{
		imageAddress: "assets/images/projects/bank.webp",
		altText:
			"Bank management system desktop application built with Java, JavaFX, and MySQL by Arvin Saghafi",
		folderName: "Bank",
		description:
			"Bank is a desktop banking management system developed using Java, JavaFX, and MySQL.",
		category: "Desktop Application",
		operatingSystem: "Windwos",
		technologies: ["Java", "JavaFX", "MySQL"],
		keywords: ["Banking System", "Desktop Application", "Database"],
		main: true,
	},

	{
		imageAddress: "assets/images/projects/reservasion.webp",
		altText:
			"Reservation management web application built with Node.js and PostgreSQL by Arvin Saghafi",
		folderName: "Reservation",
		description:
			"Reservation is a web application for managing reservations built with HTML, CSS, JavaScript, Node.js, and PostgreSQL.",
		category: "Web Application",
		operatingSystem: "Windows",
		technologies: ["HTML", "CSS", "JavaScript", "Node.js", "PostgreSQL"],
		keywords: ["Reservation System", "Backend", "API", "Database"],
		main: true,
	},

	{
		imageAddress: "assets/images/projects/shop.webp",
		altText:
			"Shop e-commerce web application built with React, NestJS, and PostgreSQL by Arvin Saghafi",
		folderName: "Shop",
		description:
			"Shop is an e-commerce web application built with React, NestJS, and PostgreSQL.",
		category: "E-commerce Application",
		operatingSystem: "Web",
		technologies: ["React", "NestJS", "PostgreSQL"],
		keywords: ["E-commerce", "Backend", "API", "Database"],
		main: true,
	},
];

const minorProjects = [
	{
		imageAddress: "assets/images/projects/cafe.webp",
		altText: "Cafe web application project built by Arvin Saghafi",
		folderName: "Cafe",
		description:
			"Cafe is a web application project developed by Arvin Saghafi.",
		category: "Web Application",
		operatingSystem: "Web",
		technologies: [],
		keywords: ["Web Application"],
		main: false,
	},

	{
		altText:
			"PassVault password management application project built by Arvin Saghafi",
		folderName: "PassVault",
		description:
			"PassVault is a password management application project developed by Arvin Saghafi.",
		category: "Desktop Application",
		operatingSystem: "Web",
		technologies: [],
		keywords: ["Security", "Password Management"],
		main: false,
	},

	{
		altText:
			"Instagram downloader application project built by Arvin Saghafi",
		folderName: "IG Downloader",
		description:
			"IG Downloader is an application project developed by Arvin Saghafi.",
		category: "Software Application",
		operatingSystem: "Web",
		technologies: [],
		keywords: ["Downloader", "Application"],
		main: false,
	},

	{
		altText:
			"Task Manager productivity application project built by Arvin Saghafi",
		folderName: "Task Manager",
		description:
			"Task Manager is a productivity application developed by Arvin Saghafi.",
		category: "Productivity Application",
		operatingSystem: "Web",
		technologies: [],
		keywords: ["Productivity", "Task Management"],
		main: false,
	},

	{
		imageAddress: "assets/images/projects/infinitic.webp",
		altText: "InfiniTic software project built by Arvin Saghafi",
		folderName: "InfiniTic",
		description:
			"InfiniTic is a software project developed by Arvin Saghafi.",
		category: "Software Project",
		operatingSystem: "Web",
		technologies: [],
		keywords: ["Software Development"],
		main: false,
	},

	{
		imageAddress: "assets/images/projects/todolist.webp",
		altText:
			"To Do List task management application built by Arvin Saghafi",
		folderName: "To Do List",
		description:
			"To Do List is a task management application developed by Arvin Saghafi.",
		category: "Productivity Application",
		operatingSystem: "Web",
		technologies: [],
		keywords: ["Task Management"],
		main: false,
	},
];

const allProjects = [...mainProjects, ...minorProjects];

const projectSchema = generateProjectSchema(allProjects);
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

mainProjects.forEach((project) => {
	const folder = createGlassFolder(
		project.imageAddress,
		project.altText,
		project.folderName,
		project.main,
	);
	mainProjectsGrid.appendChild(folder);
});

minorProjects.forEach((project) => {
	const folder = createGlassFolder(
		project.imageAddress,
		project.altText,
		project.folderName,
		project.main,
	);
	sideProjectsGrid.appendChild(folder);
});
