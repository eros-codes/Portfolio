/* =========================================================
   SHOP case study — entry point
   A live replica of the storefront in the hero, and three
   demos of what the API gets right: the last unit sold once,
   a payment taken exactly once, and filters that match one
   real variant.
   ========================================================= */
import { prefersReduced } from "../base/core.js";
import { initHeader } from "../case-study/header.js";
import { initReveal } from "../case-study/reveal.js";
import { initHeroNotes } from "../case-study/hero-notes.js";
import { createSequence, whenVisible } from "../case-study/demo.js";

const fa = (n) => n.toLocaleString("fa-IR");

/* ---------- the replica is drawn at 760 × 440 and scaled to fit ---------- */
function fitStage(fit, stage, width = 760, height = 440) {
	const apply = () => {
		const s = fit.clientWidth / width;
		stage.style.transform = `scale(${s})`;
		fit.style.height = `${height * s}px`;
		stage.dataset.scale = s;
	};
	apply();
	if ("ResizeObserver" in window) new ResizeObserver(apply).observe(fit);
	else window.addEventListener("resize", apply);
}

/* =========================================================
   HERO — choose a variant, buy the last one, follow the order
   ========================================================= */
const PRICES = { 256: 104_600_000, 512: 118_900_000 };
const STOCK = { "black-256": 3, "black-512": 2, "white-256": 2, "white-512": 1, "blue-256": 4, "blue-512": 2 };
const COLOUR_NAMES = { black: "مشکی", white: "سفید", blue: "آبی" };

function initHero() {
	const fit = document.querySelector(".tc-fit");
	const tc = fit?.querySelector(".tc");
	if (!tc) return;
	fitStage(fit, tc);

	const $ = (sel) => tc.querySelector(sel);
	const phone = $(".tc-phone");
	const price = $(".tc-price b");
	const stockLine = $(".tc-stock");
	const btn = $(".tc-btn");
	const badge = $(".tc-badge");
	const sheet = $(".tc-sheet");
	const payBtn = $(".tc-pay .tc-btn");
	const track = [...tc.querySelectorAll(".tc-track li")];
	const sms = $(".tc-sms");
	const cursor = $(".tc-cursor");
	const seq = createSequence();
	const state = { colour: "black", storage: "256", sold: false };

	const showVariant = () => {
		const key = `${state.colour}-${state.storage}`;
		const left = state.sold && key === "white-512" ? 0 : STOCK[key];
		tc.querySelectorAll("[data-colour-chip]").forEach((c) => c.classList.toggle("is-on", c.dataset.colourChip === state.colour));
		tc.querySelectorAll("[data-storage-chip]").forEach((c) => c.classList.toggle("is-on", c.dataset.storageChip === state.storage));
		phone.dataset.colour = state.colour;
		$("[data-colour-name]").textContent = COLOUR_NAMES[state.colour];
		$("[data-storage-name]").textContent = `${fa(Number(state.storage))} گیگابایت`;
		price.textContent = fa(PRICES[state.storage]);
		stockLine.textContent = left === 0 ? "ناموجود" : left <= 3 ? `تنها ${fa(left)} عدد در انبار` : "";
		btn.classList.toggle("is-off", left === 0);
		btn.textContent = left === 0 ? "ناموجود" : "افزودن به سبد خرید";
	};

	const reset = () => {
		Object.assign(state, { colour: "black", storage: "256", sold: false });
		showVariant();
		badge.classList.remove("is-on");
		sheet.classList.remove("is-open", "is-paid");
		payBtn.textContent = "پرداخت";
		track.forEach((li) => li.classList.remove("is-on"));
		sms.classList.remove("is-on");
		cursor.classList.remove("is-hidden");
	};

	/* moves the cursor to an element, in the stage's own (unscaled) pixels */
	const pointAt = (el) => {
		const s = Number(tc.dataset.scale) || 1;
		const a = el.getBoundingClientRect();
		const b = tc.getBoundingClientRect();
		const x = (a.left - b.left + a.width / 2) / s;
		const y = (a.top - b.top + a.height / 2) / s;
		cursor.style.transform = `translate(${x - 3}px, ${y - 2}px)`;
	};
	const press = async (id, el, after) => {
		pointAt(el);
		if (!(await seq.wait(id, 850))) return false;
		el.classList.add("is-press");
		if (!(await seq.wait(id, 160))) return false;
		el.classList.remove("is-press");
		after?.();
		return seq.wait(id, 650);
	};

	const play = async () => {
		const id = seq.begin();
		reset();
		if (!(await seq.wait(id, 900))) return;
		if (!(await press(id, $('[data-colour-chip="white"]'), () => { state.colour = "white"; showVariant(); }))) return;
		if (!(await press(id, $('[data-storage-chip="512"]'), () => { state.storage = "512"; showVariant(); }))) return;
		if (!(await seq.wait(id, 500))) return;
		if (!(await press(id, btn, () => badge.classList.add("is-on")))) return;
		sheet.classList.add("is-open");
		if (!(await seq.wait(id, 900))) return;
		if (!(await press(id, payBtn, () => { payBtn.textContent = "در حال پرداخت…"; }))) return;
		if (!(await seq.wait(id, 700))) return;
		state.sold = true;
		sheet.classList.add("is-paid");
		cursor.classList.add("is-hidden");
		for (const [i, li] of track.entries()) {
			li.classList.add("is-on");
			if (i === 2) sms.classList.add("is-on");
			if (!(await seq.wait(id, i === 2 ? 2600 : 1100))) return;
		}
		sms.classList.remove("is-on");
		if (!(await seq.wait(id, 600))) return;
		sheet.classList.remove("is-open");
		showVariant();
		if (!(await seq.wait(id, 3200))) return;
		play();
	};

	if (prefersReduced()) {
		reset();
		cursor.classList.add("is-hidden");
		return;
	}
	reset();
	whenVisible(fit, play, 0.3);
}

/* =========================================================
   THE LAST UNIT — two checkouts, one phone
   ========================================================= */
const RACE = {
	none: {
		steps: [
			["a", "BEGIN", ""],
			["b", "BEGIN", ""],
			["a", "SELECT stock → 1", ""],
			["b", "SELECT stock → 1", ""],
			["a", "UPDATE stock = 0 · COMMIT ✓", "ok", 0],
			["b", "UPDATE stock = 0 · COMMIT ✓", "bad", 0],
		],
		verdict: ["bad", "Both checkouts succeed. Stock says 0, and two people were sold one phone."],
	},
	bug: {
		steps: [
			["a", "BEGIN · read the address", ""],
			["b", "BEGIN · read the address\n↳ snapshot taken here", "snap"],
			["a", "SELECT id … FOR UPDATE · locked", "lock"],
			["b", "SELECT id … FOR UPDATE · waits for A", "wait"],
			["a", "SELECT stock → 1", ""],
			["a", "UPDATE stock = 0 · COMMIT ✓", "ok", 0],
			["b", "lock granted", "lock"],
			["b", "SELECT stock → 1 (its snapshot)", "bad"],
			["b", "UPDATE stock = 0 · COMMIT ✓", "bad", 0],
		],
		verdict: ["bad", "Locked, and still sold twice: B waited for the lock, then read stock from the snapshot it took before."],
	},
	fix: {
		steps: [
			["a", "BEGIN · read the address", ""],
			["b", "BEGIN · read the address", ""],
			["a", "SELECT … FOR UPDATE → stock 1", "lock"],
			["b", "SELECT … FOR UPDATE · waits for A", "wait"],
			["a", "UPDATE stock = 0 · COMMIT ✓", "ok", 0],
			["b", "lock granted → current row: stock 0", "lock"],
			["b", "INSUFFICIENT_STOCK · ROLLBACK", "stop"],
		],
		verdict: ["good", "Sold once. B is told which line ran out (and how many are left), and nothing else changed."],
	},
};

function initRace() {
	const demo = document.getElementById("shop-race");
	if (!demo) return;
	const lanes = { a: demo.querySelector('[data-lane="a"] ol'), b: demo.querySelector('[data-lane="b"] ol') };
	const stock = demo.querySelector(".race-stock b");
	const verdict = demo.querySelector(".shop-verdict");
	const tabs = [...demo.querySelectorAll("[data-mode]")];
	const seq = createSequence();
	let mode = "bug";

	const run = async (instant = false) => {
		const id = seq.begin();
		const { steps, verdict: [kind, text] } = RACE[mode];
		tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === mode)));
		lanes.a.replaceChildren();
		lanes.b.replaceChildren();
		stock.textContent = "1";
		stock.classList.remove("is-bad");
		verdict.className = "shop-verdict";
		let sold = 0;
		for (const [lane, label, cls, after] of steps) {
			if (!instant && !(await seq.wait(id, 750))) return;
			const li = document.createElement("li");
			li.textContent = label;
			if (cls) li.classList.add(`is-${cls}`);
			lanes[lane].append(li);
			if (after !== undefined) {
				sold++;
				stock.textContent = String(after);
			}
		}
		if (sold > 1) stock.classList.add("is-bad");
		if (!instant && !(await seq.wait(id, 500))) return;
		verdict.textContent = text;
		verdict.classList.add("is-on", kind === "bad" ? "is-bad" : "is-good");
	};

	tabs.forEach((t) => t.addEventListener("click", () => { mode = t.dataset.mode; run(prefersReduced()); }));
	demo.querySelector(".shop-replay").addEventListener("click", () => run(prefersReduced()));
	if (prefersReduced()) run(true);
	else whenVisible(demo, () => run(), 0.35);
}

/* =========================================================
   PAYMENTS — exactly once, whatever the network does
   ========================================================= */
const PAY = {
	twice: [
		["req", "→ POST /orders\n  Idempotency-Key: 7f3a9c"],
		["res", "← order #1047, waiting for payment"],
		["note", "  the customer double-clicks"],
		["req", "→ POST /orders\n  Idempotency-Key: 7f3a9c"],
		["res", "← the same order #1047, not a second one"],
		["req", "→ POST /orders  (another basket)\n  Idempotency-Key: 7f3a9c"],
		["err", "← 409 Conflict: this key was already used\n  for a different order"],
	],
	callback: [
		["req", "→ GET /payments/zarinpal/callback/order\n  ?Authority=A00000…&Status=OK"],
		["note", "  verify with ZarinPal ✓ · lock order #1047"],
		["res", "← #1047 paid · INV-1404-000123\n  the SMS goes out after the commit"],
		["req", "→ GET /payments/zarinpal/callback/order\n  ?Authority=A00000…&Status=OK  (again)"],
		["note", "  lock order #1047: it is already paid"],
		["res", "← already_paid · nothing sold or counted twice"],
	],
	late: [
		["note", "  order #1048 waits for payment"],
		["warn", "  its time runs out: #1048 is cancelled,\n  its stock and discount are released"],
		["note", "  …meanwhile the customer finishes paying"],
		["req", "→ GET /payments/zarinpal/callback/order\n  ?Authority=A00000…&Status=OK"],
		["note", "  verify with ZarinPal ✓ · the money did leave"],
		["warn", "← #1048 is closed: 34,540,000 Toman\n  refunded to the customer's wallet"],
	],
};

function initPayments() {
	const demo = document.getElementById("shop-pay");
	if (!demo) return;
	const log = demo.querySelector(".pay-log");
	const tabs = [...demo.querySelectorAll("[data-case]")];
	const seq = createSequence();
	let current = "twice";

	const run = async (instant = false) => {
		const id = seq.begin();
		tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.case === current)));
		log.replaceChildren();
		for (const [kind, text] of PAY[current]) {
			if (!instant && !(await seq.wait(id, 800))) return;
			const li = document.createElement("li");
			li.className = `is-${kind}`;
			li.textContent = text;
			log.append(li);
		}
	};

	tabs.forEach((t) => t.addEventListener("click", () => { current = t.dataset.case; run(prefersReduced()); }));
	demo.querySelector(".shop-replay").addEventListener("click", () => run(prefersReduced()));
	if (prefersReduced()) run(true);
	else whenVisible(demo, () => run(), 0.35);
}

/* =========================================================
   VARIANTS — the chosen values have to meet on one variant
   ========================================================= */
const COLOURS = ["Black", "White", "Blue"];
const STORAGE = ["256 GB", "512 GB", "1 TB"];
const VARIANTS = {
	"Black 256 GB": "in", "Black 512 GB": "in", "Black 1 TB": "in",
	"White 256 GB": "in", "White 512 GB": "in",
	"Blue 256 GB": "out", "Blue 512 GB": "in",
};

function initVariantFilter() {
	const demo = document.getElementById("shop-filter");
	if (!demo) return;
	const chosen = { colour: new Set(["White"]), storage: new Set(["1 TB"]) };
	const grid = demo.querySelector(".shop-variants");
	const result = demo.querySelector(".shop-result");

	grid.replaceChildren();
	const head = (text, cls) => {
		const b = document.createElement("b");
		b.textContent = text;
		if (cls) b.className = cls;
		grid.append(b);
	};
	head("");
	STORAGE.forEach((s) => head(s, "is-head"));
	const cells = {};
	COLOURS.forEach((c) => {
		head(c);
		STORAGE.forEach((s) => {
			const key = `${c} ${s}`;
			const cell = document.createElement("span");
			cell.className = "shop-cell";
			const state = VARIANTS[key];
			if (!state) cell.classList.add("is-missing");
			if (state === "out") cell.classList.add("is-out");
			cell.textContent = !state ? "none" : state === "out" ? "sold out" : "in stock";
			cells[key] = cell;
			grid.append(cell);
		});
	});

	const render = () => {
		demo.querySelectorAll("[data-colour]").forEach((b) => b.setAttribute("aria-pressed", String(chosen.colour.has(b.dataset.colour))));
		demo.querySelectorAll("[data-storage]").forEach((b) => b.setAttribute("aria-pressed", String(chosen.storage.has(b.dataset.storage))));
		const colours = chosen.colour.size ? [...chosen.colour] : COLOURS;
		const storages = chosen.storage.size ? [...chosen.storage] : STORAGE;
		const matches = [];
		Object.values(cells).forEach((c) => c.classList.remove("is-match"));
		colours.forEach((c) => storages.forEach((s) => {
			const key = `${c} ${s}`;
			if (VARIANTS[key] === "in") {
				matches.push(key);
				cells[key].classList.add("is-match");
			}
		}));
		result.classList.toggle("is-shown", matches.length > 0);
		result.classList.toggle("is-hidden", matches.length === 0);
		result.querySelector("b").textContent = matches.length ? "Shown" : "Not shown";
		result.querySelector("span").textContent = matches.length
			? `Matched by ${matches.length === 1 ? "the variant" : "the variants"} ${matches.join(", ")}.`
			: "It comes in these values, but no single variant in stock has them together.";
	};

	const toggle = (set, value) => {
		if (set.has(value)) set.delete(value);
		else set.add(value);
		render();
	};
	demo.querySelectorAll("[data-colour]").forEach((b) => b.addEventListener("click", () => toggle(chosen.colour, b.dataset.colour)));
	demo.querySelectorAll("[data-storage]").forEach((b) => b.addEventListener("click", () => toggle(chosen.storage, b.dataset.storage)));
	render();
}

initHeader();
initReveal();
initHero();
initRace();
initPayments();
initVariantFilter();
initHeroNotes();
