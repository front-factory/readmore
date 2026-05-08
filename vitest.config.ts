import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'jsdom',
        include: [
            'src/**/*.test.ts'
        ],
        reporters: [
            'default',
            'junit'
        ],
        outputFile: {
            junit: 'junit.xml'
        },
        coverage: {
            provider: 'v8',
            include: [
                'src/**/*.ts'
            ],
            exclude: [
                'src/**/*.test.ts'
            ]
        }
    }
});
