// The toggle. app.html has already resolved and stamped the theme before first
// paint — this only handles a later change, and must keep the same storage key.
const KEY = 'crete-theme';

/** @returns {'light' | 'dark'} */
export function current() {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** @param {'light' | 'dark'} theme */
export function set(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	try {
		localStorage.setItem(KEY, theme);
	} catch (e) {
		// Private mode, or storage disabled. The theme still applies for this
		// page view; it just will not be remembered.
	}
}

/** @returns {'light' | 'dark'} the theme now in effect */
export function toggle() {
	const next = current() === 'dark' ? 'light' : 'dark';
	set(next);
	return next;
}
