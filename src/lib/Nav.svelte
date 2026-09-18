<script>
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';

	const links = [
		{ href: '/', label: 'Overview' },
		{ href: '/testing/', label: 'Testing' },
		{ href: '/standards/', label: 'Standards' },
		{ href: '/formats/', label: 'Formats' },
		{ href: '/changelog/', label: 'Changelog' }
	];

	// trailingSlash is 'always', so a route's pathname always ends in a slash
	// and an exact match is enough — no prefix test that would light up every
	// link for '/'.
	const here = $derived(page.url.pathname);
</script>

<nav class="nav">
	<a class="nav-brand" href="/">crête<span class="dot">.</span></a>
	{#each links as link (link.href)}
		<a href={link.href} aria-current={here === link.href ? 'page' : undefined}>{link.label}</a>
	{/each}
	<a class="out" href="https://codeberg.org/abksh/Crete">Codeberg →</a>
	<ThemeToggle />
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 10;
		background: var(--color-bg);
		flex-wrap: wrap;
		gap: 20px;
		padding-inline: 24px;
	}

	.nav-brand {
		text-decoration: none;
		color: var(--color-text);
	}

	.dot {
		color: var(--color-accent);
	}

	.out {
		color: var(--color-accent-700);
	}

	@media (max-width: 640px) {
		.nav {
			gap: 14px;
		}
	}
</style>
