/* =========================================================
   THE CAFÉ IS DATA — the admin editor, in miniature

   One table in the roof garden is picked, moved, turned, and loses
   two chairs; its capacity and guest range follow. In the real admin
   panel every one of these is a field on the table, not code.
   ========================================================= */

import { RoofMap } from "./map-renderer.js";
import { TABLES } from "./floor-data.js";
import { prefersReduced, root } from "../../animations/core.js";
import { MAP_URLS, fa, freeTheScroll, createSequence, makeCursor, whenVisible } from "./resv-shared.js";

const TARGET = "t27";

export function initResvEditor() {
	const frame = document.getElementById("editor-stage");
	if (!frame) return;
	const q = (s) => frame.querySelector(s);
	const card = q(".ed-card");
	const replay = frame.parentElement.querySelector(".rz-replay");
	const field = (name) => card.querySelector(`[data-f="${name}"]`);

	freeTheScroll(frame);
	const seq = createSequence();
	const cursor = makeCursor(frame);
	const home = TABLES.find((t) => t.id === TARGET);
	const map = new RoofMap({ svg: q(".rz-map"), wrap: q(".rz-mapwrap"), ...MAP_URLS });

	const anchor = () => map.tableNodes.get(TARGET);
	const spin = () => anchor()?.querySelector(".roof-table-spin");

	/* where a map coordinate lands inside the frame, in CSS pixels */
	function toFrame(x, y) {
		const svg = q(".rz-map");
		const pt = svg.createSVGPoint();
		pt.x = x;
		pt.y = y;
		const p = pt.matrixTransform(svg.getScreenCTM());
		const f = frame.getBoundingClientRect();
		return [p.x - f.left, p.y - f.top];
	}

	function setValues({ rotation, capacity, min, max }, changed = []) {
		field("rot").textContent = `${fa(rotation)} درجه`;
		field("cap").textContent = fa(capacity);
		field("min").textContent = fa(min);
		field("max").textContent = fa(max);
		card.querySelectorAll("dd").forEach((dd) => {
			dd.classList.remove("is-editing");
			dd.classList.toggle("is-changed", changed.includes(dd.dataset.f));
		});
	}

	/* the renderer draws the table's 3D edge and shadow outside the
	   rotating group, each with its own rotation: all three must turn */
	function rotateTo(r) {
		spin()?.setAttribute("transform", `rotate(${r})`);
		const [shadow, side] = anchor()?.querySelectorAll(".roof-table-shadow-layer > g") || [];
		shadow?.setAttribute("transform", `translate(0 12) rotate(${r})`);
		side?.setAttribute("transform", `translate(0 8) rotate(${r})`);
	}

	/* click a value, select it, type the new one: the cause is shown
	   before its effect, so nothing on the map changes by itself */
	async function editField(id, name, value) {
		const dd = field(name);
		await cursor.to(dd, 560);
		if (!seq.alive(id)) return false;
		await cursor.click();
		dd.classList.add("is-editing");
		dd.innerHTML = `<span class="sel">${dd.textContent}</span>`;
		if (!(await seq.wait(id, 450))) return false;
		dd.innerHTML = `${fa(value)}<span class="caret"></span>`;
		if (!(await seq.wait(id, 550))) return false;
		dd.textContent = fa(value);
		dd.classList.remove("is-editing");
		dd.classList.add("is-changed");
		return true;
	}

	function reset() {
		map.setTables(TABLES.map((t) => ({ ...t, availability: null })), { selectedTableIds: [] });
		card.classList.remove("is-on");
		setValues({ rotation: 0, capacity: home.capacity, min: home.minGuests, max: home.maxGuests });
		replay?.classList.remove("is-ready");
	}

	const tween = (id, ms, step) =>
		new Promise((resolve) => {
			const start = performance.now();
			const frameStep = (now) => {
				if (!seq.alive(id)) return resolve(false);
				const t = Math.min(1, (now - start) / ms);
				step(t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
				if (t < 1) requestAnimationFrame(frameStep);
				else resolve(true);
			};
			requestAnimationFrame(frameStep);
		});

	async function play() {
		const id = seq.begin();
		reset();
		cursor.jump(frame.clientWidth * 0.3, frame.clientHeight * 0.85);
		cursor.show();
		if (!(await seq.wait(id, 500))) return;

		/* pick the table */
		await cursor.to(toFrame(home.x, home.y), 700);
		if (!seq.alive(id)) return;
		await cursor.click();
		map.setSelected([TARGET]);
		card.classList.add("is-on");
		if (!(await seq.wait(id, 700))) return;

		/* move it */
		const to = { x: home.x + 70, y: home.y - 60 };
		cursor.down();
		const moved = await tween(id, 900, (e) => {
			const x = home.x + (to.x - home.x) * e;
			const y = home.y + (to.y - home.y) * e;
			anchor()?.setAttribute("transform", `translate(${x} ${y})`);
			cursor.jump(...toFrame(x, y));
		});
		if (!moved) return;
		cursor.up();
		if (!(await seq.wait(id, 350))) return;

		/* turn it */
		const turned = await tween(id, 700, (e) => {
			const r = Math.round(90 * e);
			rotateTo(r);
			field("rot").textContent = `${fa(r)} درجه`;
		});
		if (!turned) return;
		setValues({ rotation: 90, capacity: 6, min: 5, max: 6 }, ["rot"]);
		if (!(await seq.wait(id, 500))) return;

		/* capacity 6 -> 4: two chairs leave the table */
		if (!(await editField(id, "cap", 4))) return;
		/* the middle chair of each long side goes, so two stay on each side */
		const chairs = [...(spin()?.querySelectorAll(".roof-chair") || [])];
		const middle = home.chairs
			.map((c, i) => [Math.abs(c.x), i])
			.sort((a, b) => a[0] - b[0])
			.slice(0, 2)
			.map(([, i]) => chairs[i]);
		middle.forEach((c) => {
			if (!c) return;
			c.style.transition = "opacity .45s ease";
			c.style.opacity = "0";
		});
		if (!(await seq.wait(id, 650))) return;

		/* and the guest range is set to match */
		if (!(await editField(id, "min", 3))) return;
		if (!(await editField(id, "max", 4))) return;
		setValues({ rotation: 90, capacity: 4, min: 3, max: 4 }, ["rot", "cap", "min", "max"]);
		if (!(await seq.wait(id, 900))) return;
		cursor.hide();
		replay?.classList.add("is-ready");
	}

	replay?.addEventListener("click", play);

	map.init().then(() => {
		map.setTables(TABLES.map((t) => ({ ...t, availability: null })));
		map.focusZone("ROOF");
		setValues({ rotation: 0, capacity: home.capacity, min: home.minGuests, max: home.maxGuests });
		if (prefersReduced() || !root.classList.contains("js-motion")) {
			map.setSelected([TARGET]);
			card.classList.add("is-on");
			replay?.classList.add("is-ready");
			return;
		}
		whenVisible(frame, () => setTimeout(play, 500), 0.5);
	});
}
