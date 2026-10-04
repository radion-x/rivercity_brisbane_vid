const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const SITE_URL = require('../content/services.json').url;
const REQUIRED_FIELDS = [
    'title',
    'seoTitle',
    'description',
    'slug',
    'published',
    'category',
    'excerpt',
    'image',
    'imageAlt',
    'author'
];

const markedModulePromise = import('marked');

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function parseValue(rawValue) {
    const value = rawValue.trim();

    if (!value) return '';

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }

    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

    if (value.startsWith('[') || value.startsWith('{')) {
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new Error(`Invalid JSON front matter value: ${value}`);
        }
    }

    return value;
}

function parseArticleFile(filePath) {
    const source = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

    if (!match) {
        throw new Error(`${path.basename(filePath)} is missing valid front matter`);
    }

    const metadata = {};

    for (const line of match[1].split(/\r?\n/)) {
        if (!line.trim() || line.trim().startsWith('#')) continue;

        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) {
            throw new Error(`Invalid front matter line in ${path.basename(filePath)}: ${line}`);
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1);
        metadata[key] = parseValue(value);
    }

    for (const field of REQUIRED_FIELDS) {
        if (!metadata[field]) {
            throw new Error(`${path.basename(filePath)} is missing required field: ${field}`);
        }
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug)) {
        throw new Error(`${path.basename(filePath)} has an invalid slug`);
    }

    if (metadata.description.length > 160) {
        throw new Error(`${path.basename(filePath)} has a meta description over 160 characters`);
    }

    const publishedDate = new Date(`${metadata.published}T00:00:00+10:00`);
    if (Number.isNaN(publishedDate.getTime())) {
        throw new Error(`${path.basename(filePath)} has an invalid published date`);
    }

    const words = match[2]
        .replace(/\[[^\]]+\]\([^\)]+\)/g, ' ')
        .replace(/[#>*_`|\-]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return {
        ...metadata,
        body: match[2].trim(),
        publishedDate,
        hasGuideDate: Boolean(metadata.displayDate),
        displayDate: new Date(`${metadata.displayDate || metadata.published}T12:00:00+10:00`),
        readMinutes: Math.max(1, Math.ceil(words / 220)),
        url: `${SITE_URL}/blog/${metadata.slug}/`
    };
}

function getArticles() {
    if (!fs.existsSync(ARTICLES_DIR)) return [];

    return fs.readdirSync(ARTICLES_DIR)
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => parseArticleFile(path.join(ARTICLES_DIR, fileName)))
        .filter((article) => article.draft !== true)
        .sort((a, b) => {
            const featuredOrder = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
            return featuredOrder || b.displayDate - a.displayDate || a.title.localeCompare(b.title);
        });
}

function getArticleBySlug(slug) {
    return getArticles().find((article) => article.slug === slug);
}

function slugifyHeading(value) {
    return value
        .replace(/<[^>]+>/g, '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function getTableOfContents(markdown) {
    return markdown
        .split(/\r?\n/)
        .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
        .filter(Boolean)
        .map((match) => ({
            level: match[1].length,
            title: match[2].replace(/[*_`]/g, '').trim(),
            id: slugifyHeading(match[2])
        }));
}

async function renderMarkdown(markdown) {
    const { marked } = await markedModulePromise;
    let html = await marked.parse(markdown, {
        gfm: true,
        breaks: false
    });

    html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (fullMatch, level, content) => {
        const id = slugifyHeading(content);
        return `<h${level} id="${id}">${content}<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`;
    });

    return html;
}

function formatArticleDate(date) {
    return new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Australia/Brisbane'
    }).format(date);
}

module.exports = {
    SITE_URL,
    escapeHtml,
    formatArticleDate,
    getArticleBySlug,
    getArticles,
    getTableOfContents,
    renderMarkdown
};
