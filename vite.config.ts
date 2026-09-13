import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { transform as lightningcssTransform } from 'lightningcss';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/readmore.ts',
            fileName: (format) => (format === 'iife' ? 'readmore.iife.js' : 'readmore.js'),
            formats: [
                'es',
                'iife'
            ],
            // The IIFE (CDN build) exposes `FrontFactory.ReadMore`.
            name: 'FrontFactory'
        },
        rolldownOptions: {
            output: {
                // Adds to an existing `FrontFactory` global instead of replacing it.
                extend: true
            }
        },
        minify: true,
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
