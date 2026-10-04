const {
    SITE_URL,
    escapeHtml,
    formatArticleDate,
    getTableOfContents
} = require('../lib/blog');

const LOGO_PATH = '/images/logos/river-city-logo-nobg.png';
const PHONE_DISPLAY = '0408 022 833';
const PHONE_LINK = '0408022833';

function renderHead({ title, description, canonical, image, type = 'website', jsonLd = [], robots = 'index, follow, max-image-preview:large' }) {
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    const schemas = jsonLd
        .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`)
        .join('\n');

    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="${escapeHtml(robots)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <title>${escapeHtml(title)}</title>
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:site_name" content="River City Handyman">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${escapeHtml(absoluteImage)}">
    <meta property="og:locale" content="en_AU">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(absoluteImage)}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="alternate" type="application/rss+xml" title="River City Handyman Articles" href="${SITE_URL}/blog/feed.xml">
    <link rel="stylesheet" href="/css/blog.css?v=4">
    ${schemas}
    <script defer src="/js/analytics.js"></script>`;
}

function renderHeader() {
    return `
    <header class="site-header">
        <div class="shell header-inner">
            <a class="brand-link" href="/" aria-label="River City Handyman home">
                <img src="${LOGO_PATH}" width="210" height="68" alt="River City Handyman">
            </a>
            <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">
                <span class="sr-only">Open navigation</span>
                <span></span><span></span><span></span>
            </button>
            <nav id="site-navigation" class="site-navigation" aria-label="Primary navigation">
                <a href="/services/">Services</a>
                <a href="/#why-us">Why Choose Us</a>
                <a href="/#gallery">Our Work</a>
                <a href="/blog/" aria-current="page">Articles</a>
                
                <a href="/#faq">FAQ</a>
                <a href="/#contact">Contact</a>
            </nav>
            <a class="header-phone" href="tel:${PHONE_LINK}" aria-label="Call River City Handyman on ${PHONE_DISPLAY}">${PHONE_DISPLAY}</a>
        </div>
    </header>`;
}

function renderFooter() {
    const year = new Date().getFullYear();

    return `
    <footer class="site-footer">
        <div class="shell footer-grid">
            <div class="footer-brand">
                <img src="${LOGO_PATH}" width="230" height="75" alt="River City Handyman">
                <p>Reliable repairs, installations and property maintenance across Brisbane.</p>
            </div>
            <div>
                <h2>Explore</h2>
                <a href="/">Home</a>
                <a href="/services/">Services</a>
                <a href="/blog/">Articles</a>
                <a href="/#contact">Get a quote</a>
            </div>
            <div>
                <h2>Contact</h2>
                <a href="tel:${PHONE_LINK}">${PHONE_DISPLAY}</a>
                <p>Brisbane and surrounding suburbs</p>
                <p>Mon-Fri: 7am-5pm<br>Sat: 8am-2pm</p>
            </div>
        </div>
        <div class="shell footer-bottom">&copy; ${year} River City Handyman. All rights reserved.</div>
    </footer>
    <script src="/js/blog.js" defer></script>`;
}

function renderArticleCard(article, { featured = false } = {}) {
    const cardImageStyle = article.cardImagePosition
        ? ` style="object-position: ${escapeHtml(article.cardImagePosition)}"`
        : '';

    return `
    <article class="article-card${featured ? ' article-card-featured' : ''}">
        <a class="article-card-image" href="/blog/${escapeHtml(article.slug)}/" tabindex="-1" aria-hidden="true">
            <img src="${escapeHtml(article.image)}" width="1536" height="1024" alt="" loading="${featured ? 'eager' : 'lazy'}"${cardImageStyle}>
        </a>
        <div class="article-card-content">
            <div class="article-meta"><span>${escapeHtml(article.category)}</span><span>${article.readMinutes} min read</span><span>${article.hasGuideDate ? 'Guide date: ' : ''}${formatArticleDate(article.hasGuideDate ? article.displayDate : article.publishedDate)}</span></div>
            <h2><a href="/blog/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2>
            <p>${escapeHtml(article.excerpt)}</p>
            <a class="text-link" href="/blog/${escapeHtml(article.slug)}/">Read the guide <span aria-hidden="true">&rarr;</span></a>
        </div>
    </article>`;
}

function renderBlogIndex(articles) {
    const [featuredArticle, ...remainingArticles] = articles;
    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Brisbane Home Repair and Maintenance Articles',
        url: `${SITE_URL}/blog/`,
        description: 'Practical repair and home maintenance guides for Brisbane homeowners, tenants and property managers.',
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: articles.map((article, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: article.url,
                name: article.title
            }))
        }
    };

    return `<!doctype html>
<html lang="en-AU">
<head>
${renderHead({
        title: 'Brisbane Home Repair & Maintenance Guides | River City Handyman',
        description: 'Practical Brisbane home repair guides for homeowners, tenants and property managers. Know what to fix, who to call and how to prepare.',
        canonical: `${SITE_URL}/blog/`,
        image: featuredArticle.image,
        jsonLd: [itemListSchema]
    })}
</head>
<body>
${renderHeader()}
<main>
    <section class="blog-hero">
        <div class="shell blog-hero-grid">
            <div>
                <p class="section-label">Brisbane home care</p>
                <h1>Practical advice for Brisbane home repairs</h1>
                <p>Checklists and explanations to help you plan repairs, assembly and installation in Brisbane.</p>
            </div>
            <div class="blog-hero-note">
                <strong>Need the work done?</strong>
                <p>Send a short job list and a few photos. We can often provide an estimate before the visit.</p>
                <a href="/#contact">Get a free quote</a>
            </div>
        </div>
    </section>
    <section class="article-list shell" aria-label="Latest articles">
        ${renderArticleCard(featuredArticle, { featured: true })}
        <div class="article-card-stack">
            ${remainingArticles.map((article) => renderArticleCard(article)).join('\n')}
        </div>
    </section>
    <section class="index-cta">
        <div class="shell index-cta-inner">
            <div>
                <h2>Turn the list into one booked visit</h2>
                <p>Tell us what needs attention and we will help you group the right jobs together.</p>
            </div>
            <a class="button" href="/#contact">Get a free quote</a>
        </div>
    </section>
</main>
${renderFooter()}
</body>
</html>`;
}

function renderTableOfContents(article) {
    const items = getTableOfContents(article.body).filter((item) => item.level === 2);
    if (!items.length) return '';

    return `
    <nav class="article-toc" aria-label="On this page">
        <h2>On this page</h2>
        <ol>${items.map((item) => `<li><a href="#${escapeHtml(item.id)}">${escapeHtml(item.title)}</a></li>`).join('')}</ol>
    </nav>`;
}

function renderArticlePage(article, articleBody, relatedArticles) {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: `${SITE_URL}${article.image}`,
        datePublished: article.published,
        dateModified: article.updated || article.published,
        author: {
            '@type': 'Organization',
            name: article.author,
            url: SITE_URL
        },
        publisher: {
            '@type': 'Organization',
            name: 'River City Handyman',
            url: SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}${LOGO_PATH}`
            }
        },
        mainEntityOfPage: article.url
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/blog/` },
            { '@type': 'ListItem', position: 3, name: article.title, item: article.url }
        ]
    };

    return `<!doctype html>
<html lang="en-AU">
<head>
${renderHead({
        title: article.seoTitle,
        description: article.description,
        canonical: article.url,
        image: article.image,
        type: 'article',
        jsonLd: [articleSchema, breadcrumbSchema]
    })}
    <meta property="article:published_time" content="${escapeHtml(article.published)}">
    <meta property="article:modified_time" content="${escapeHtml(article.updated || article.published)}">
    <meta property="article:section" content="${escapeHtml(article.category)}">
</head>
<body>
${renderHeader()}
<main>
    <article>
        <header class="article-hero shell">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog/">Articles</a>
            </nav>
            <div class="article-hero-copy">
                <div class="article-meta"><span>${escapeHtml(article.category)}</span><span>${article.hasGuideDate ? 'Guide date: ' : ''}${formatArticleDate(article.hasGuideDate ? article.displayDate : article.publishedDate)}</span><span>${article.readMinutes} min read</span></div>
                <h1>${escapeHtml(article.title)}</h1>
                <p>${escapeHtml(article.excerpt)}</p>
            </div>
            <figure class="article-hero-image">
                <img src="${escapeHtml(article.image)}" width="1536" height="1024" alt="${escapeHtml(article.imageAlt)}" fetchpriority="high">
            </figure>
        </header>
        <div class="article-layout shell">
            <aside>${renderTableOfContents(article)}</aside>
            <div class="article-body">
                ${articleBody}
                <section class="article-cta" aria-labelledby="article-cta-title">
                    <h2 id="article-cta-title">Need a reliable Brisbane handyman?</h2>
                    <p>Send us your job list and a few photos. We will confirm what we can handle and explain when a licensed specialist is the right call.</p>
                    <p>Explore <a href="/service/tv-mounting/">TV mounting</a> and <a href="/service/flatpack-assembly/">furniture assembly</a>, or include other repair requests in your enquiry.</p>
                    <div class="article-cta-actions">
                        <a class="button" href="/#contact">Get a free quote</a>
                        <a class="button button-secondary" href="tel:${PHONE_LINK}">Call ${PHONE_DISPLAY}</a>
                    </div>
                </section>
            </div>
        </div>
    </article>
    ${relatedArticles.length ? `
    <section class="related-articles shell" aria-labelledby="related-title">
        <h2 id="related-title">More practical guides</h2>
        <div class="related-grid">${relatedArticles.map((related) => renderArticleCard(related)).join('\n')}</div>
    </section>` : ''}
</main>
${renderFooter()}
</body>
</html>`;
}

function renderNotFound() {
    return `<!doctype html>
<html lang="en-AU">
<head>
${renderHead({
        title: 'Article not found | River City Handyman',
        description: 'The requested article could not be found.',
        canonical: `${SITE_URL}/blog/`,
        image: '/images/hero.jpg',
        robots: 'noindex, follow'
    })}
</head>
<body>
${renderHeader()}
<main class="not-found shell">
    <p class="section-label">404</p>
    <h1>That article is not here</h1>
    <p>Browse our current repair and maintenance guides instead.</p>
    <a class="button" href="/blog/">View all articles</a>
</main>
${renderFooter()}
</body>
</html>`;
}

module.exports = {
    renderArticlePage,
    renderBlogIndex,
    renderNotFound
};
