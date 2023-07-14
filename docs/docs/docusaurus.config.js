const config = {
    title: 'Shopify <> Solana Pay',
    tagline: 'Enable Solana powered Payments on Shopify',
    favicon: 'img/favicon.ico',
    url: 'https://shopifydocs.solanapay.com',
    baseUrl: '/',
    organizationName: 'solana-labs',
    projectName: 'solana-payments-app',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    routeBasePath: '/',
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],

    themeConfig: {
        navbar: {
            title: 'Solana Payments App',
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.png',
            },
            items: [
                {
                    href: 'https://github.com/solana-labs/solana-payments-app',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        colorMode: {
            defaultMode: 'dark',
            disableSwitch: false,
            respectPrefersColorScheme: false,
        },
    },
};

module.exports = config;
