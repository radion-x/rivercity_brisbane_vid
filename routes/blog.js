const express = require('express');
const {
    SITE_URL,
    escapeHtml,
    getArticleBySlug,
    getArticles,
    renderMarkdown
} = require('../lib/blog');
const {
    renderArticlePage,
    renderBlogIndex,
    renderNotFound
} = require('../views/blog');

const router = express.Router({ strict: true });

router.get('/', (req, res, next) => {
    try {
        const articles = getArticles();
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
        res.send(renderBlogIndex(articles));
    } catch (error) {
        next(error);
    }
});

router.get('/feed.xml', (req, res, next) => {
    try {
        const articles = getArticles();
        const items = articles.map((article) => `
        <item>
            <title>${escapeHtml(article.title)}</title>
            <link>${article.url}</link>
            <guid isPermaLink="true">${article.url}</guid>
            <pubDate>${article.publishedDate.toUTCString()}</pubDate>
            <description>${escapeHtml(article.description)}</description>
        </item>`).join('');

        res.type('application/rss+xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>River City Handyman Articles</title>
        <link>${SITE_URL}/blog/</link>
        <description>Practical Brisbane home repair and property maintenance guides.</description>
        <language>en-au</language>
        ${items}
    </channel>
</rss>`);
    } catch (error) {
        next(error);
    }
});

router.get('/:slug/', async (req, res, next) => {
    try {
        const article = getArticleBySlug(req.params.slug);

        if (!article) {
            res.status(404).send(renderNotFound());
            return;
        }

        const articleBody = await renderMarkdown(article.body);
        const relatedArticles = getArticles()
            .filter((candidate) => candidate.slug !== article.slug)
            .slice(0, 2);

        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
        res.send(renderArticlePage(article, articleBody, relatedArticles));
    } catch (error) {
        next(error);
    }
});

router.get('/:slug', (req, res) => {
    res.redirect(301, `/blog/${encodeURIComponent(req.params.slug)}/`);
});

module.exports = router;
