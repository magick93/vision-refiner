import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		conditions: ['browser', 'development', 'import']
	},
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['e2e/**/*', 'src/routes/page.svelte.spec.ts'],
		setupFiles: ['./vitest.setup.ts']
	}
});
