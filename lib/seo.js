const fs = require('node:fs');
const path = require('node:path');
const config = require('../content/services.json');
const publicDir = path.join(__dirname, '../public');
const SITE_URL = config.url;
// These unrelated marketing-agency template routes are retired on Brisbane only.
const retiredPaths = config.city === 'Brisbane' ? new Set([
    '/about/', '/contact/', '/blog/', '/case-studies/', '/privacy-policy-2/',
    '/offers/', '/offers/simple-websites/',
    '/industries/professional-services/', '/industries/real-estate/',
    '/industries/healthcare/', '/industries/home-services/',
    '/industries/ecommerce/', '/industries/hospitality/',
    '/service/', '/service/website-development/', '/service/growth-strategy-analytics/',
    '/service/crm-sales-funnel/', '/service/social-growth/',
    '/service/swift-appdevelopment/', '/service/seo-local-seo/', '/service/ai-assistants/'
]) : new Set();

function routeFor(relative) {
    if (relative === 'index.html') return '/';
    return '/' + relative.replace(/\/index\.html$/, '/');
}

function staticPages(directory = publicDir, pages = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name === 'admin') continue;
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) staticPages(full, pages);
        else if (entry.name === 'index.html') {
            const html = fs.readFileSync(full, 'utf8');
            const route = routeFor(path.relative(publicDir, full).split(path.sep).join('/'));
            const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
            if (!retiredPaths.has(route) && canonical === SITE_URL + route &&
                !/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
                pages.push({ loc: canonical });
            }
        }
    }
    return pages;
}

const staticEntries = staticPages();
const canonicalPaths = new Set(staticEntries.map(entry => entry.loc.slice(SITE_URL.length)));

function seoMiddleware(req, res, next) {
    if (/^\/(?:admin(?:\/|$)|api(?:\/|$)|health$)/.test(req.path)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    const normalized = req.path === '/index.html' ? '/' :
        req.path.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
    if (retiredPaths.has(normalized)) {
        res.setHeader('X-Robots-Tag', 'noindex, follow');
        return res.status(410).type('html').send('<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>Page removed | River City Handyman</title></head><body><main><h1>This page has been removed</h1><p>This page was unrelated to our Brisbane handyman services.</p><p><a href="/services/">Explore our handyman services</a> or <a href="/#contact">request a quote</a>.</p></main></body></html>');
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && canonicalPaths.has(normalized) && req.path !== normalized) {
        const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
        return res.redirect(301, normalized + query);
    }
    next();
}

function robots(req, res) {
    res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /health\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
}

function xmlEscape(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function renderSitemap(extraEntries = []) {
    const entries = [...new Map([...staticEntries, ...extraEntries].map(entry => [entry.loc, entry])).values()];
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        entries.map(entry => '<url><loc>' + xmlEscape(entry.loc) + '</loc>' +
            (entry.lastmod ? '<lastmod>' + xmlEscape(entry.lastmod) + '</lastmod>' : '') + '</url>').join('\n') +
        '</urlset>';
}

module.exports = { SITE_URL, staticEntries, retiredPaths, seoMiddleware, robots, renderSitemap };
