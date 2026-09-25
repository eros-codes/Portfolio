/* =========================================================
   BOOKING — the hero demo

   The floor plan is drawn by the project's own renderer. What the
   server would return is computed here with the same rules as
   availability.service.js:
     guests outside a table's min–max   -> not available
     guests equal to its seat count     -> "perfect" (dark green)
     anything else in range             -> "soft" (light green)
     connected tables can be combined when the sum of their minimums
     and maximums covers the group
   A chosen table is then held for ten minutes, as in the app.
   ========================================================= */

import { RoofMap } from "./map-renderer.js";
import { TABLES, CONNECTIONS } from "./floor-data.js";
import { prefersReduced, root } from "../../animations/core.js";
import { MAP_URLS, fa, freeTheScroll, createSequence, makeCursor, whenVisible } from "./resv-shared.js";

const HOLD_SECONDS = 600;
const RESERVED = new Set(["t4", "t9", "t15", "t21", "t25", "t32"]);
const byId = new Map(TABLES.map((t) => [t.id, t]));
const neighbours = new Map(TABLES.map((t) => [t.id, new Set()]));
CONNECTIONS.forEach(([a, b]) => {
	neighbours.get(a).add(b);
	neighbours.get(b).add(a);
});

function availability(guests) {
	const tables = TABLES.map((t) => {
		let a;
		if (RESERVED.has(t.id)) a = { available: false, reason: "این میز در این زمان رزرو شده است." };
		else if (guests < t.minGuests) a = { available: false, reason: "تعداد نفرات برای این میز کم است." };
		else if (guests > t.maxGuests) a = { available: false, reason: "ظرفیت این میز کافی نیست." };
		else a = { available: true, matchType: guests === t.capacity ? "perfect" : "soft", startTime: "15:00" };
		return { ...t, availability: a };
	});

	/* groups of two or three connected free tables */
	const seen = new Set();
	const combos = [];
	const consider = (ids) => {
		const key = [...ids].sort().join("+");
		if (seen.has(key)) return;
		seen.add(key);
		const group = ids.map((id) => byId.get(id));
		const min = group.reduce((s, t) => s + t.minGuests, 0);
		const max = group.reduce((s, t) => s + t.maxGuests, 0);
		const cap = group.reduce((s, t) => s + t.capacity, 0);
		if (guests < min || guests > max) return;
		combos.push({ ids, cap, perfect: cap === guests, numbers: group.map((t) => t.displayNumber) });
	};
	if (guests >= 3) {
		for (const t of TABLES) {
			if (RESERVED.has(t.id)) continue;
			for (const n of neighbours.get(t.id)) {
				if (RESERVED.has(n)) continue;
				consider([t.id, n]);
				for (const m of new Set([...neighbours.get(t.id), ...neighbours.get(n)])) {
					if (m !== t.id && m !== n && !RESERVED.has(m)) consider([t.id, n, m]);
				}
			}
		}
	}
	combos.sort((a, b) => b.perfect - a.perfect || a.ids.length - b.ids.length || a.numbers[0] - b.numbers[0]);
	return { tables, combos: combos.slice(0, 3) };
}

export function initResvHero() {
	const frame = document.getElementById("resv-stage");
	if (!frame) return;
	const outer = frame.parentElement;
	const q = (s) => frame.querySelector(s);

	const countEl = q(".rz-count");
	const status = q(".rz-status");
	const combosEl = q(".rz-combos");
	const pick = q(".rz-pick");
	const hint = outer.querySelector(".rz-hint");
	const replay = outer.querySelector(".rz-replay");

	freeTheScroll(frame);
	const seq = createSequence();
	const cursor = makeCursor(frame);

	const state = { guests: 2, result: null, selected: [], hold: null };
	let map = null;
	/* once the visitor has touched anything, the demo never starts on its own */
	let touched = false;

	/* ---------- ui ---------- */

	const setStatus = (text) => (status.textContent = text);

	function stopHold() {
		clearInterval(state.hold);
		state.hold = null;
	}

	function clearPick() {
		stopHold();
		state.selected = [];
		map?.setSelected([]);
		pick.classList.remove("is-on");
		combosEl.querySelectorAll(".rz-combo").forEach((b) => b.classList.remove("is-on"));
	}

	function invalidate() {
		clearPick();
		state.result = null;
		combosEl.innerHTML = "";
		map?.setTables(TABLES.map((t) => ({ ...t, availability: null })), { selectedTableIds: [] });
		setStatus("تعداد نفرات رو انتخاب کن و میزهای آزاد رو ببین.");
	}

	function setGuests(n) {
		state.guests = Math.max(1, Math.min(12, n));
		countEl.textContent = fa(state.guests);
		invalidate();
	}

	function search() {
		clearPick();
		state.result = availability(state.guests);
		map.setTables(state.result.tables, { selectedTableIds: [] });
		const free = state.result.tables.filter((t) => t.availability.available).length;
		setStatus(
			free
				? `${fa(free)} میز مناسب روی نقشه روشن شد.`
				: state.result.combos.length
					? "میز تکی برای این تعداد نیست؛ ترکیب‌های پیشنهادی رو ببین."
					: "برای این تعداد میز آزادی پیدا نشد.",
		);
		combosEl.innerHTML = "";
		state.result.combos.forEach((combo) => {
			const b = document.createElement("button");
			b.type = "button";
			b.className = `rz-combo${combo.perfect ? " is-perfect" : ""}`;
			b.textContent = `میزهای ${combo.numbers.map(fa).join(" و ")} · ${fa(combo.cap)} نفر`;
			b.addEventListener("click", () => {
				touched = true;
				seq.stop();
				choose(combo.ids, `میزهای ${combo.numbers.map(fa).join(" و ")} · ظرفیت ${fa(combo.cap)} نفر`, b);
			});
			combosEl.append(b);
		});
	}

	function choose(ids, label, comboButton = null) {
		stopHold();
		state.selected = ids;
		map.setSelected(ids);
		combosEl.querySelectorAll(".rz-combo").forEach((b) => b.classList.toggle("is-on", b === comboButton));
		pick.innerHTML = "";
		const text = document.createElement("span");
		text.textContent = label;
		const go = document.createElement("button");
		go.type = "button";
		go.className = "rz-btn rz-go";
		go.textContent = "ادامه رزرو";
		go.addEventListener("click", () => {
			touched = true;
			seq.stop();
			startHold();
		});
		pick.append(text, go);
		pick.classList.add("is-on");
	}

	function startHold() {
		let left = HOLD_SECONDS;
		const format = () => {
			const m = Math.floor(left / 60);
			const s = String(left % 60).padStart(2, "0");
			return `${m}:${s}`;
		};
		pick.innerHTML = `<span class="rz-hold"><span class="rz-clock">${format()}</span><span>زمان نگه‌داری میز — جای رزروت تا پایان این تایمر محفوظه.</span></span>`;
		const clock = pick.querySelector(".rz-clock");
		stopHold();
		state.hold = setInterval(() => {
			left = Math.max(0, left - 1);
			clock.textContent = format();
			if (!left) stopHold();
		}, 1000);
	}

	function onTableClick(table) {
		touched = true;
		seq.stop();
		cursor.hide();
		if (!state.result) {
			setStatus("اول تعداد نفرات رو بزن و «بررسی میزهای آزاد» رو انتخاب کن.");
			return;
		}
		const t = state.result.tables.find((x) => x.id === table.id);
		if (!t?.availability?.available) {
			setStatus(t?.availability?.reason || "میز در این زمان قابل رزرو نیست.");
			return;
		}
		choose([t.id], `میز ${fa(t.displayNumber)} · ظرفیت ${fa(t.capacity)} نفر`);
	}

	/* ---------- wiring ---------- */

	frame.querySelectorAll(".rz-step").forEach((b) =>
		b.addEventListener("click", () => {
			touched = true;
			seq.stop();
			cursor.hide();
			setGuests(state.guests + Number(b.dataset.step));
		}),
	);
	q(".rz-search").addEventListener("click", () => {
		touched = true;
		seq.stop();
		cursor.hide();
		search();
	});

	/* ---------- the scripted run ---------- */

	async function play() {
		const id = seq.begin();
		setGuests(2);
		map.focusZone("ALL");
		hint.classList.remove("is-on");
		replay.classList.remove("is-ready");
		cursor.jump(frame.clientWidth * 0.55, frame.clientHeight * 0.8);
		cursor.show();
		if (!(await seq.wait(id, 500))) return;

		const plus = q('.rz-step[data-step="1"]');
		await cursor.to(plus, 650);
		for (let i = 0; i < 4; i++) {
			if (!seq.alive(id)) return;
			await cursor.click(plus);
			if (!seq.alive(id)) return; // the visitor took over mid-click
			setGuests(state.guests + 1);
			if (!(await seq.wait(id, 170))) return;
		}

		const searchBtn = q(".rz-search");
		await cursor.to(searchBtn, 520);
		if (!seq.alive(id)) return;
		await cursor.click(searchBtn);
		if (!seq.alive(id)) return;
		search();
		if (!(await seq.wait(id, 1100))) return;

		const first = combosEl.querySelector(".rz-combo");
		if (first) {
			await cursor.to(first, 620);
			if (!seq.alive(id)) return;
			await cursor.click(first);
			if (!seq.alive(id)) return;
			const combo = state.result.combos[0];
			choose(combo.ids, `میزهای ${combo.numbers.map(fa).join(" و ")} · ظرفیت ${fa(combo.cap)} نفر`, first);
			map.focusZone(TABLES.find((t) => t.id === combo.ids[0]).zone);
			if (!(await seq.wait(id, 1300))) return;

			const go = pick.querySelector(".rz-go");
			await cursor.to(go, 520);
			if (!seq.alive(id)) return;
			await cursor.click(go);
			if (!seq.alive(id)) return;
			startHold();
		}
		if (!(await seq.wait(id, 1400))) return;
		cursor.hide();
		hint.classList.add("is-on");
		replay.classList.add("is-ready");
	}

	replay.addEventListener("click", play);

	/* ---------- start ---------- */

	map = new RoofMap({ svg: q(".rz-map"), wrap: q(".rz-mapwrap"), zoneTabs: q(".map-zone-tabs"), onTableClick, ...MAP_URLS });
	map.init().then(() => {
		invalidate();
		if (prefersReduced() || !root.classList.contains("js-motion")) {
			setGuests(6);
			search();
			hint.classList.add("is-on");
			replay.classList.add("is-ready");
			return;
		}
		whenVisible(frame, () => !touched && play(), 0.4);
	});
}
