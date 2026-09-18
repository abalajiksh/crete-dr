<script>
	// Four stylesheet layers, in this order and no other:
	//   fonts.css — self-hosted @font-face, no third-party request
	//   app.css   — the vendored Modernist design system (tokens + components)
	//   site.css  — the light/dark shell and base element styling
	//   pages.css — layout utilities shared by the content pages
	// Anything page-specific belongs in that page's own scoped <style>.
	import '../fonts.css';
	import '../app.css';
	import '../site.css';
	import '../pages.css';

	import Nav from '$lib/Nav.svelte';

	let { children } = $props();
</script>

<div class="shell">
	<a class="skip" href="#main">Skip to content</a>
	<Nav />
	<main id="main">
		{@render children()}
	</main>
</div>
