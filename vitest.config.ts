// ============================================================================================= //
//                                            VITEST                                             //
// ============================================================================================= //

import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    test: {
        globals: false,
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
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'jsdom',
                    include: [
                        'src/**/*.test.ts'
                    ],
                    exclude: [
                        'src/**/*.browser.test.ts'
                    ]
                }
            },
            // Real layout (line-clamp, transitions, ResizeObserver) that jsdom cannot compute.
            {
                extends: true,
                test: {
                    name: 'browser',
                    include: [
                        'src/**/*.browser.test.ts'
                    ],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [
                            {
                                browser: 'chromium'
                            }
                        ]
                    }
                }
            }
        ]
    }
});
