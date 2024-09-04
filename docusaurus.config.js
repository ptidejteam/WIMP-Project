const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'WIMP Wiki',
  tagline: 'Where Is My Professor?',
  url: 'https://ptidejteam.github.io',
  baseUrl: '/wimp-wiki/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'ptidejteam', // Usually your GitHub org/user name.
  projectName: 'wimp-wiki', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'WIMP',
        logo: {
          alt: 'WIMP logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Documentation',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/ptidejteam/wimp-frontend',
            label: 'Frontend Github',
            position: 'right',
          },
          {
            href: 'https://github.com/ptidejteam/wimp-backend',
            label: 'Backend Github',
            position: 'right',
          },
          {
            href: 'https://github.com/ptidejteam/wimp-wiki/',
            label: 'Wiki GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Architecture',
                to: '/docs/architecture',
              },
              {
                label: 'Frontend',
                to: '/docs/frontend/frontend',
              },
              {
                label: 'Backend',
                to: '/docs/backend/intro',
              },
              {
                label: 'Deploy',
                to: '/docs/deploy/deploy',
              },
              {
                label: 'Contribute',
                to: '/docs/contribute/contribute_system',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Ptidej - Website',
                href: 'https://www.ptidej.net/',
              },
              {
                label: 'Ptidej - Chat',
                href: 'https://chat.ptidej.net/group/project-showcase-smarthome',
              },
              {
                label: 'Ptidej - Blog',
                href: 'https://blog.ptidej.net/ghost/#/site',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Ptidej - GitHub',
                href: 'https://github.com/ptidejteam',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} WIMP, Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});
