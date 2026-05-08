import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/readmore.ts',
            fileName: 'readmore',
            formats: [
                'es'
            ]
        },
        sourcemap: true,
        emptyOutDir: true
    },
    plugins: [
        dts({
            rollupTypes: true,
            include: [
                'src/**/*.ts'
            ]
        }),
        viteStaticCopy({
            targets: [{
                src: 'src/readmore.css',
                dest: '.',
                rename: {
                    stripBase: true
                }
            }]
        })
    ]
});
