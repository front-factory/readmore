import { createRequire } from 'node:module';
import { defineConfig } from 'vitepress';
import baseConfig from '@frontfactory/vitepress-theme/config';

const { version } = createRequire(import.meta.url)('../../package.json');

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
            },
            {
                text: `v${version}`,
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
                        text: 'npm',
                        link: 'https://www.npmjs.com/package/@frontfactory/readmore'
                    }
                ]
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
            footerSocial: true
        },
        footer: {
            message: 'Released under the MIT License.',
            copyright: `Copyright © ${years} <a href="https://frontfactory.dev">Front Factory</a>.`
        }
    }
});
