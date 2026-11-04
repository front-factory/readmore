import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import baseConfig from '@frontfactory/vitepress-theme/config';
import { version } from '../../package.json';

const fontsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../node_modules/@fontsource/inter/files');
const startYear = 2026;
const thisYear = new Date().getFullYear();
const years = thisYear > startYear ? `${startYear}–${thisYear}` : `${startYear}`;

export default defineConfig({
    extends: baseConfig,
    title: 'Readmore',
    titleTemplate: ':title | Readmore',
    description: 'Clamp text to N lines or a fixed height, with an accessible read more / read less toggle.',
    lastUpdated: true,
    cleanUrls: true,
    themeConfig: {
        nav: [
            {
                text: 'Guide',
                link: '/guide/',
                activeMatch: '/guide/'
            },
            {
                text: 'API',
                link: '/api/'
            }
        ],
        sidebar: [
            {
                text: 'Overview',
                items: [
                    {
                        text: 'Introduction',
                        link: '/guide/introduction'
                    },
                    {
                        text: 'Getting started',
                        link: '/guide/'
                    }
                ]
            },
            {
                text: 'Guides',
                items: [
                    {
                        text: 'Lines or height',
                        link: '/guide/modes'
                    },
                    {
                        text: 'Styling',
                        link: '/guide/styling'
                    },
                    {
                        text: 'Animation',
                        link: '/guide/animation'
                    },
                    {
                        text: 'Controlling instances',
                        link: '/guide/controlling'
                    },
                    {
                        text: 'Frameworks',
                        link: '/guide/frameworks'
                    },
                    {
                        text: 'Accessibility',
                        link: '/guide/accessibility'
                    },
                    {
                        text: 'How it works',
                        link: '/guide/how-it-works'
                    }
                ]
            },
            {
                text: 'Reference',
                items: [
                    {
                        text: 'API',
                        link: '/api/'
                    }
                ]
            }
        ],
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/front-factory/readmore'
            }
        ],
        search: {
            provider: 'local'
        },
        ff: {
            navOrder: 'menu-first',
            footerColumns: [
                {
                    title: 'Guide',
                    items: [
                        {
                            text: 'Introduction',
                            link: '/guide/introduction'
                        },
                        {
                            text: 'Getting started',
                            link: '/guide/'
                        },
                        {
                            text: 'Accessibility',
                            link: '/guide/accessibility'
                        },
                        {
                            text: 'API',
                            link: '/api/'
                        }
                    ]
                },
                {
                    title: 'Project',
                    items: [
                        {
                            text: 'Changelog',
                            link: 'https://github.com/front-factory/readmore/blob/main/CHANGELOG.md'
                        },
                        {
                            text: 'Releases',
                            link: 'https://github.com/front-factory/readmore/releases'
                        },
                        {
                            text: 'Issues',
                            link: 'https://github.com/front-factory/readmore/issues'
                        },
                        {
                            text: 'npm',
                            link: 'https://www.npmjs.com/package/@frontfactory/readmore'
                        }
                    ]
                }
            ],
            footerSocial: true,
            llms: true,
            copyMarkdown: true,
            versions: {
                current: `v${version}`,
                items: [
                    {
                        text: `v${version} (latest)`,
                        link: '/'
                    },
                    {
                        text: 'All releases',
                        link: 'https://github.com/front-factory/readmore/releases'
                    }
                ]
            },
            og: {
                hostname: 'https://readmore.frontfactory.dev',
                fonts: [
                    {
                        name: 'Inter',
                        path: resolve(fontsDir, 'inter-latin-400-normal.woff'),
                        weight: 400
                    },
                    {
                        name: 'Inter',
                        path: resolve(fontsDir, 'inter-latin-700-normal.woff'),
                        weight: 700
                    }
                ]
            }
        },
        footer: {
            message: 'Released under the MIT License.',
            copyright: `Copyright © ${years} <a href="https://frontfactory.dev">Front Factory</a>.`
        }
    }
});
