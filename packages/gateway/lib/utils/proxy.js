const { createProxyMiddleware } = require('http-proxy-middleware');

exports.setupProxies = (app, routes) => {
    routes.forEach((route) => {
        if (!route.proxy.target) {
            throw new Error(`Proxy configuration is missing for route: ${route.url}`);
        }

        console.log(`Setting up proxy for URL: ${route.url} -> ${route.proxy.target}`);

        app.use(route.url, createProxyMiddleware(route.proxy));

        console.log(`Proxy setup complete for: ${route.url}`);
    });
};
