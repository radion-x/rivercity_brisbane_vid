const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
process.env.MAILGUN_API_KEY = 'test-key';
process.env.MAILGUN_DOMAIN = 'example.test';
process.env.NODE_ENV = 'test';
const app = require('../server');
const config = require('../content/services.json');
const { staticEntries, retiredPaths } = require('../lib/seo');
const { getArticleBySlug } = require('../lib/blog');
const isSydney = config.city === 'Sydney';

test('canonical content, sitemap, redirects and retired routes', async (t) => {
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = 'http://127.0.0.1:' + server.address().port;
    const sitemapResponse = await fetch(base + '/sitemap.xml');
    assert.equal(sitemapResponse.status, 200);
    const sitemap = await sitemapResponse.text();
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
    assert.equal(locs.length, new Set(locs).size);
    assert.ok(locs.every(loc=>loc.startsWith(config.url + '/')));
    assert.ok(!sitemap.includes('/admin/') && !sitemap.includes('websited.org'));
    if (isSydney) {
        assert.ok(locs.length > 220);
        assert.ok(sitemap.includes('/service/bondi/'));
        assert.ok(sitemap.includes('/blog/what-jobs-can-a-handyman-do-nsw/'));
    } else assert.equal(locs.length, 8);
    for (const entry of staticEntries) {
        const route = entry.loc.slice(config.url.length);
        const response = await fetch(base + route);
        assert.equal(response.status, 200, route);
        const html = await response.text();
        assert.ok(html.includes('href="' + entry.loc + '"'), route + ' canonical');
    }
    for (const service of config.services) {
        const response = await fetch(base + '/service/' + service.slug + '/');
        const html = await response.text();
        assert.equal((html.match(/<h1\b/g)||[]).length, 1);
        const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
        assert.equal(schema[0]['@type'], 'Service');
        assert.equal(schema[0].provider.name, config.brand);
        assert.equal(schema[1]['@type'], 'BreadcrumbList');
        assert.ok(html.includes('href="/#contact"'));
        const redirect = await fetch(base + '/service/' + service.slug + '/index.html?source=test', { redirect:'manual' });
        assert.equal(redirect.status, 301);
        assert.equal(redirect.headers.get('location'), '/service/' + service.slug + '/?source=test');
    }
    for (const route of retiredPaths) {
        for (const variant of [route, route + 'index.html', route.slice(0,-1)]) {
            const response = await fetch(base + variant, { redirect:'manual' });
            assert.equal(response.status, 410, variant);
            assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
        }
    }
    assert.equal((await fetch(base + '/does-not-exist/')).status, 404);
    assert.equal((await fetch(base + '/health')).headers.get('x-robots-tag'), 'noindex, nofollow');
    const robots = await (await fetch(base + '/robots.txt')).text();
    assert.ok(robots.includes('Sitemap: ' + config.url + '/sitemap.xml'));
});

test('new service pages link only to available routes and assets', () => {
    for (const service of config.services) {
        const file = path.join(__dirname, '../public/service', service.slug, 'index.html');
        const html = fs.readFileSync(file, 'utf8');
        for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
            const route = match[1].split(/[?#]/)[0] || '/';
            const local = path.join(__dirname, '../public', decodeURIComponent(route));
            assert.ok(fs.existsSync(local) || (route === '/blog/' || (route.startsWith('/blog/') && getArticleBySlug(route.split('/')[2]))), route);
        }
    }
});
