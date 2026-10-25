// ============================================================================================= //
//                                            ESLINT                                             //
// ============================================================================================= //

import { defineConfig } from 'eslint/config';
import frontFactoryConfig from '@front-factory/eslint-config';
import ts from 'typescript-eslint';

export default defineConfig([
    {
        ignores: [
            'dist/**',
            'docs/.vitepress/cache/**',
            'docs/.vitepress/dist/**',
            'node_modules/**'
        ]
    },
    ...ts.configs.recommended,
    ...frontFactoryConfig,
    {
        // The shared config re-enables core rules that typescript-eslint turns off for TS files
        files: [
            '**/*.ts'
        ],
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off'
        }
    }
]);
