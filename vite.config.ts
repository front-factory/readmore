import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { transform as lightningcssTransform } from 'lightningcss';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/readmore.ts'
        },
        rolldownOptions: {
            output: [
                {
                    // Readable ES module for bundlers and `node_modules`.
                    format: 'es',
                    entryFileNames: 'readmore.js',
                    minify: false
                },
                {
                    format: 'iife',
                    entryFileNames: 'readmore.iife.js',
                    // The IIFE (CDN build) exposes `FrontFactory.ReadMore`.
                    name: 'FrontFactory',
                    // Adds to an existing `FrontFactory` global instead of replacing it.
                    extend: true,
                    // Minified CDN build.
                    minify: true
                }
            ]
        },
        sourcemap: true,
        minify: false,
        emptyOutDir: true
    },
    plugins: [
        dts({
            include: [
                'src/readmore.ts'
            ]
        }),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/readmore.css',
                    dest: '.',
                    rename: {
                        stripBase: true
                    },
                    transform: {
                        encoding: 'buffer',
                        handler: (content, filename) => {
                            const { code } = lightningcssTransform({
                                filename,
                                code: content,
                                minify: true
                            });

                            return Buffer.from(code);
                        }
                    }
                }
            ]
        })
    ]
});
