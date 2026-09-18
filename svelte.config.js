import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		// Fully static output: Cloudflare serves `build/` as files, with no
		// Worker script — hence adapter-static rather than adapter-cloudflare.
		//
		// No `fallback`: every route is prerendered, so the SvelteKit fallback
		// shell would only ever be served for a genuine miss — and it renders
		// blank without JavaScript. static/404.html is a real page instead, and
		// wrangler's not_found_handling serves it.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			precompress: false,
			strict: true
		})
	}
};
