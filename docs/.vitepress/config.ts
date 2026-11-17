import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import baseConfig from '@frontfactory/vitepress-theme/config';
import pkg from '../../package.json' with { type: 'json' };

const { version, license } = pkg;
const hostname = 'https://readmore.frontfactory.dev';
const description = 'Clamp text to N lines or a fixed height, with an accessible read more / read less toggle.';

const fontsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../node_modules/@fontsource/inter/files');
const startYear = 2026;
const thisYear = new Date().getFullYear();
const years = thisYear > startYear ? `${startYear}–${thisYear}` : `${startYear}`;

export default defineConfig({
    extends: baseConfig,
    title: 'Readmore',
    titleTemplate: ':title | Readmore',
    description,
    lang: 'en-US',
    lastUpdated: false,
    cleanUrls: true,
    sitemap: {
        hostname
    },
    head: [
        [
            'meta',
            {
                name: 'twitter:card',
                content: 'summary_large_image'
            }
        ],
        [
            'meta',
            {
                name: 'theme-color',
                content: '#2745cf'
            }
        ]
    ],
    transformPageData(pageData) {
        const path = pageData.relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1');
        const head = (pageData.frontmatter.head ??= []) as unknown[];

        head.push([
            'link',
            {
                rel: 'canonical',
                href: `${hostname}/${path}`
            }
        ]);

        if (pageData.relativePath === 'index.md') {
            head.push([
                'script',
                { type: 'application/ld+json' },
                JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareSourceCode',
                    name: 'Readmore',
                    description,
                    url: hostname,
                    codeRepository: 'https://github.com/front-factory/readmore',
                    programmingLanguage: 'TypeScript',
                    license: `https://spdx.org/licenses/${license}`
                })
            ]);
        }
    },
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
                    },
                    {
                        text: 'Changelog',
                        link: 'https://github.com/front-factory/readmore/blob/main/CHANGELOG.md'
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
            pageActions: {
                copyMarkdown: true,
                copyLink: true,
                share: [
                    'x',
                    'linkedin',
                    'bluesky',
                    'mastodon'
                ],
                mastodonInstance: 'mastodon.social'
            },
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
