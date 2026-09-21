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
    ...frontFactoryConfig
]);
