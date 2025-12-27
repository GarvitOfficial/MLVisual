import { defineConfig } from 'vite';

export default defineConfig({
    // Use relative base path to ensure assets load correctly on GitHub Pages
    // regardless of the repository name.
    base: './',
});
