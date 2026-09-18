// A deliberately tiny inline formatter for the prose held in the data files.
//
// The copy needs exactly three inline marks — `code`, **strong** and *em* — and
// nothing else. Tokenising them here means the pages render text nodes through
// Svelte's normal escaping, so no {@html} appears anywhere on the site and a
// stray angle bracket in a flag name or a filter spec cannot become markup.

const PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

/**
 * @param {string} text
 * @returns {{ kind: 'text' | 'code' | 'strong' | 'em', value: string }[]}
 */
export function inline(text) {
	/** @type {{ kind: 'text' | 'code' | 'strong' | 'em', value: string }[]} */
	const out = [];
	let at = 0;

	for (const m of text.matchAll(PATTERN)) {
		const start = /** @type {number} */ (m.index);
		if (start > at) out.push({ kind: 'text', value: text.slice(at, start) });

		if (m[1] !== undefined) out.push({ kind: 'code', value: m[1] });
		else if (m[2] !== undefined) out.push({ kind: 'strong', value: m[2] });
		else out.push({ kind: 'em', value: /** @type {string} */ (m[3]) });

		at = start + m[0].length;
	}

	if (at < text.length) out.push({ kind: 'text', value: text.slice(at) });
	return out;
}
