import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { transform as lightningcssTransform } from 'lightningcss';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/readmore.ts',
            fileName: 'readmore',
            formats: [
                'es'
            ]
        },
        minify: true,
        sourcemap: true,
        emptyOutDir: true
    },
    plugins: [
        dts({
            include: [
                'src/readmore.ts'
            ]
        }),
        viteStaticCopy({
            targets: [{
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
            }]
        })
    ]
});
