import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                realisations: 'realisations.html',
                expertise: 'expertise.html',
                contact: 'contact.html',
                mentionsLegales: 'mentions-legales.html',
                politiqueConfidentialite: 'politique-confidentialite.html',
            },
        },
    },
});
