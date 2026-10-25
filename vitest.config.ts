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
            ],
            // Slightly below the measured values (99.3 / 97.8 / 100 / 99.3) to catch regressions without flakiness.
            thresholds: {
                lines: 97,
                statements: 97,
                branches: 95,
                functions: 98
            }
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
                            },
                            {
                                browser: 'firefox'
                            },
                            {
                                browser: 'webkit'
                            }
                        ]
                    }
                }
            }
        ]
    }
});
