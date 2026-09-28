/* =========================================================
   OS case study — entry point
   ========================================================= */
import { initHeader } from "../case-study/header.js";
import { initReveal } from "../case-study/reveal.js";
import { initHeroNotes } from "../case-study/hero-notes.js";
import { prefersReduced, root } from "../base/core.js";

/* The OS's app icons, copied from its source (src/ui/Icons.cpp):
   11 x 11 dots each, "#" a dot, "R" the one accent dot. */
const ICONS = {
	clock: [
		"...#####...",
		"..#.....#..",
		".#...#...#.",
		"#....#....#",
		"#....#....#",
		"#....##R..#",
		"#.........#",
		"#.........#",
		".#.......#.",
		"..#.....#..",
		"...#####..."
	],
	alarm: [
		".....#.....",
		"...#####...",
		"..#.....#..",
		"..#.....#..",
		"..#.....#..",
		".#.......#.",
		".#.......#.",
		"#.........#",
		"###########",
		"...........",
		".....R....."
	],
	music: [
		"......##...",
		"......#.##.",
		"......#...R",
		"......#....",
		"......#....",
		"......#....",
		"......#....",
		"...####....",
		"..#####....",
		"..#####....",
		"...###....."
	],
	notes: [
		".########..",
		".#......##.",
		".#.####..#.",
		".#.......#.",
		".#.#####.#.",
		".#.......#.",
		".#.#####.#.",
		".#.......#.",
		".#.###R..#.",
		".#.......#.",
		".#########."
	],
	vault: [
		"...#####...",
		"..#.....#..",
		"..#.....#..",
		"..#.....#..",
		"###########",
		"#.........#",
		"#....R....#",
		"#....#....#",
		"#....#....#",
		"#.........#",
		"###########"
	],
	recents: [
		"...........",
		"..#######..",
		"...........",
		".#########.",
		"...........",
		"###########",
		"#.........#",
		"#.........#",
		"#.......R.#",
		"#.........#",
		"###########"
	],
	settings: [
		"..###......",
		"###.#######",
		"..###......",
		"...........",
		"......###..",
		"#######R###",
		"......###..",
		"...........",
		"....###....",
		"#####.#####",
		"....###...."
	],
	snake: [
		"...........",
		".#######...",
		".#.........",
		".#.........",
		".#######...",
		".......#...",
		".......#...",
		".#######...",
		"...........",
		".........R.",
		"..........."
	],
	infinitic: [
		"...........",
		"...........",
		".##.....##.",
		"#..#...#..#",
		"#...#.#...#",
		"#....R....#",
		"#...#.#...#",
		"#..#...#..#",
		".##.....##.",
		"...........",
		"..........."
	]
};

/* The accents the OS's Settings offers, in the same order. */
const ACCENTS = [
	["RED", "#e8322b"],
	["AMBER", "#ffb020"],
	["WHITE", "#f1f1f1"],
	["CYAN", "#3fd0e0"],
];

const SVG = "http://www.w3.org/2000/svg";

/* ---- the device in the hero: a few real screens, one after another ---- */
function initDevice() {
	const device = document.getElementById("os-device");
	if (!device || prefersReduced() || !root.classList.contains("js-motion")) return;
	const screens = [...device.querySelectorAll(".os-screen")];
	if (screens.length < 2) return;
	let at = 0;
	let visible = true;
	device.classList.add("os-cycling");
	screens[0].classList.add("is-on");
	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
	}).observe(device);
	setInterval(() => {
		if (!visible || document.hidden) return;
		screens[at].classList.remove("is-on");
		at = (at + 1) % screens.length;
		screens[at].classList.add("is-on");
	}, 3200);
}

/* ---- the dot demo: the icons, with the OS's own two settings ---- */
function drawIcon(rows, square, accent) {
	const svg = document.createElementNS(SVG, "svg");
	svg.setAttribute("viewBox", "0 0 11 11");
	svg.setAttribute("aria-hidden", "true");
	rows.forEach((row, y) => {
		[...row].forEach((cell, x) => {
			if (cell !== "#" && cell !== "R") return;
			const fill = cell === "R" ? accent : "#f1f1f1";
			const dot = document.createElementNS(SVG, square ? "rect" : "circle");
			if (square) {
				dot.setAttribute("x", x + 0.11);
				dot.setAttribute("y", y + 0.11);
				dot.setAttribute("width", 0.78);
				dot.setAttribute("height", 0.78);
			} else {
				dot.setAttribute("cx", x + 0.5);
				dot.setAttribute("cy", y + 0.5);
				dot.setAttribute("r", 0.39);
			}
			dot.setAttribute("fill", fill);
			svg.appendChild(dot);
		});
	});
	return svg;
}

function initDots() {
	const grid = document.getElementById("os-dots-grid");
	const controls = document.getElementById("os-dots-controls");
	if (!grid || !controls) return;
	let square = false;
	let accent = ACCENTS[0][1];

	const render = () => {
		grid.replaceChildren(
			...Object.entries(ICONS).map(([name, rows]) => {
				const tile = document.createElement("div");
				tile.className = "os-tile";
				const label = document.createElement("span");
				label.textContent = name.toUpperCase();
				tile.append(drawIcon(rows, square, accent), label);
				return tile;
			}),
		);
	};

	const shape = controls.querySelectorAll("[data-shape]");
	shape.forEach((b) =>
		b.addEventListener("click", () => {
			square = b.dataset.shape === "square";
			shape.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
			render();
		}),
	);
	const swatches = controls.querySelectorAll("[data-accent]");
	swatches.forEach((b) =>
		b.addEventListener("click", () => {
			accent = b.dataset.accent;
			swatches.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
			render();
		}),
	);
	controls.hidden = false;
	render();
}

initHeader();
initReveal(); // first: it may drop .js-motion, which the device checks
initDevice();
initDots();
initHeroNotes();
