/* =========================================================
   WORD SPLITTING

   Wraps every word in two nested spans so it can rise out from
   behind its own line:

     <span class="w"><span class="w-i">word</span></span>

   The outer span clips, the inner one moves. Text content is
   untouched — only element wrappers are added — so what a
   crawler reads is identical to before.

   If this ever fails, animations.css still reveals the paragraph
   itself on scroll, so the text appears as plain prose rather
   than disappearing.
   ========================================================= */

const WORD_STAGGER = 28; // ms between consecutive words

export function splitWords(selector) {
	document.querySelectorAll(selector).forEach((el) => {
		if (el.dataset.wordsSplit === "1") return;
		try {
			if (splitElement(el)) {
				el.dataset.wordsSplit = "1";
				el.setAttribute("role", "text");
			}
		} catch (e) {
			/* leave the paragraph as plain text */
		}
	});
}

function splitElement(el) {
	/* collect text nodes first — the tree is mutated below */
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const textNodes = [];
	while (walker.nextNode()) textNodes.push(walker.currentNode);

	const words = [];

	for (const node of textNodes) {
		if (!node.nodeValue.trim()) continue;

		const frag = document.createDocumentFragment();

		/* split on whitespace but KEEP the separators, otherwise the
		   words run together once they become inline-blocks */
		for (const part of node.nodeValue.split(/(\s+)/)) {
			if (!part) continue;

			if (/^\s+$/.test(part)) {
				frag.appendChild(document.createTextNode(" "));
				continue;
			}

			const outer = document.createElement("span");
			outer.className = "w";

			const inner = document.createElement("span");
			inner.className = "w-i";
			inner.textContent = part;

			outer.appendChild(inner);
			frag.appendChild(outer);
			words.push(inner);
		}

		node.parentNode.replaceChild(frag, node);
	}

	words.forEach((w, i) =>
		w.style.setProperty("--w-delay", `${i * WORD_STAGGER}ms`),
	);

	return words.length > 0;
}
