const fs = require('node:fs');
const path = require('node:path');
const config = require('../content/services.json');
const { brand, city, url, logo, services, areas } = config;
const publicDir = path.join(__dirname, '../public');
const isSydney = city === 'Sydney';
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const stylesheet = isSydney ? '/css/blog.css?v=4' : '/css/seo-pages.css?v=1';
const menuScript = isSydney ? '/js/blog.js' : '/js/seo-pages.js';

function page(title, description, route, body, schema = []) {
    const canonical = url + route;
    const breadcrumb = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: url + '/' },
            ...(route.startsWith('/service/') ? [{ '@type': 'ListItem', position: 2, name: 'Services', item: url + '/services/' }] : []),
            { '@type': 'ListItem', position: route.startsWith('/service/') ? 3 : 2, name: title.split(' | ')[0], item: canonical }
        ]
    };
    const scripts = [...schema, breadcrumb].map(s => '<script type="application/ld+json">' + JSON.stringify(s).replaceAll('<', '\\u003c') + '</script>').join('\n');
    return '<!doctype html><html lang="en-AU"><head>' +
        '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>' + escape(title) + '</title><meta name="description" content="' + escape(description) + '">' +
        '<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="' + canonical + '">' +
        '<meta property="og:type" content="website"><meta property="og:title" content="' + escape(title) + '">' +
        '<meta property="og:description" content="' + escape(description) + '"><meta property="og:url" content="' + canonical + '">' +
        '<meta property="og:site_name" content="' + brand + '"><meta property="og:locale" content="en_AU">' +
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="' + stylesheet + '">' +
        '<style>.service-layout{max-width:850px;padding:3rem 1.5rem 5rem;margin:auto}.service-layout h2{margin-top:2.5rem}.service-layout p,.service-layout li{font-size:1.1rem;line-height:1.8}.service-layout blockquote{margin:1.5rem 0;padding:1.5rem;border-left:4px solid var(--gold);background:white}.service-links{display:flex;flex-wrap:wrap;gap:.8rem;padding:0;list-style:none}.service-links a{display:block;padding:.75rem 1rem;background:white;border:1px solid var(--line);border-radius:8px;color:var(--navy)}.service-layout .article-cta{margin-top:3rem}.service-layout .article-cta a{color:var(--navy)}.service-layout .article-cta .button{color:white}.service-layout .article-cta .button-secondary{color:var(--navy)}.service-layout details{padding:1rem 0;border-bottom:1px solid var(--line)}.service-layout summary{font-weight:600;cursor:pointer}.service-layout .button{margin:.4rem .6rem .4rem 0}</style>' +
        scripts + '<script defer src="/js/analytics.js"></script></head><body>' +
        '<header class="site-header"><div class="shell header-inner"><a class="brand-link" href="/"><img src="' + logo + '" width="210" height="68" alt="' + brand + '"></a>' +
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation"><span class="sr-only">Open navigation</span><span></span><span></span><span></span></button>' +
        '<nav id="site-navigation" class="site-navigation" aria-label="Primary navigation"><a href="/services/">Services</a>' +
        (isSydney ? '<a href="/areas/">Areas</a>' : '') + '<a href="/blog/">Articles</a>' +
        '<a href="/#gallery">Our Work</a><a href="/#contact">Contact</a></nav><a class="header-phone" href="tel:0408022833">0408 022 833</a></div></header>' +
        '<main class="service-layout"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>' +
        (route.startsWith('/service/') ? '<a href="/services/">Services</a><span>/</span>' : '') +
        '<span>' + escape(title.split(' | ')[0]) + '</span></nav>' + body + '</main>' +
        '<footer class="site-footer"><div class="shell footer-grid"><div class="footer-brand"><img src="' + logo + '" width="230" height="75" alt="' + brand + '"><p>Repairs, installations and maintenance in ' + city + '.</p></div>' +
        '<div><h2>Explore</h2><a href="/services/">Services</a>' + (isSydney ? '<a href="/areas/">Sydney service areas</a><a href="/blog/">Articles</a>' : '') +
        '<a href="/#contact">Request a quote</a></div><div><h2>Contact</h2><a href="tel:0408022833">0408 022 833</a><p>' + city + ' and surrounding suburbs</p><p>Mon-Fri: 7am-5pm</p></div></div>' +
        '<div class="shell footer-bottom">&copy; ' + new Date().getFullYear() + ' ' + brand + '</div></footer><script src="' + menuScript + '" defer></script></body></html>';
}

function write(route, html) {
    const directory = path.join(publicDir, route);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'index.html'), html);
}

const list = services.map(s => '<li><a href="/service/' + s.slug + '/">' + escape(s.name) + '</a></li>').join('');
const articleGuides = {"tv-mounting": ["tv-mounting-brisbane-rental-checklist", "Prepare for a TV-mounting booking"], "flatpack-assembly": ["furniture-assembly-brisbane-room-checklist", "Prepare for furniture assembly"]};
for (const service of services) {
    const title = service.name + ' ' + city + ' | ' + brand;
    const route = '/service/' + service.slug + '/';
    const description = service.name + ' in ' + city + '. Send photos and job details to ' + brand + ' for an estimate. Call 0408 022 833.';
    if (description.length > 160) throw new Error('Description too long: ' + service.slug);
    const schema = {
        '@context': 'https://schema.org', '@type': 'Service',
        '@id': url + route + '#service', name: service.name + ' in ' + city,
        serviceType: service.name, url: url + route, description: service.intro,
        areaServed: { '@type': 'City', name: city },
        provider: { '@type': 'Organization', '@id': url + '/#business', name: brand, url: url + '/', telephone: '+61408022833' }
    };
    const guide = articleGuides[service.slug];
    const guideLink = guide ? '<p><a href="/blog/' + guide[0] + '/">' + escape(guide[1]) + '</a></p>' : '';
    const sections = service.sections.map(([heading, paragraphs]) => '<section><h2>' + escape(heading) + '</h2>' + paragraphs.map(p => '<p>' + escape(p) + '</p>').join('') + '</section>').join('');
    const booking = '<section><h2>Request a quote in ' + city + '</h2><p>' + brand + ' accepts enquiries for ' + service.name.toLowerCase() + ' across the ' + areas + '. Include your suburb and preferred timing so we can confirm coverage and availability for the particular job. A listed service area does not mean an appointment is available on every date.</p>' +
        '<ol><li><strong>Send the details.</strong> Use the quote form with a short description, photos and any relevant product links. Include the size or quantity of items and the access arrangements.</li><li><strong>Confirm the scope.</strong> We discuss the work, required materials and estimate. Tell us about permission, a deadline or other trades involved before booking.</li><li><strong>Prepare for the visit.</strong> Keep the work area accessible and the agreed parts ready. Any additional tasks or unexpected conditions need to be discussed before extra work proceeds.</li></ol>' +
        '<p>Pricing depends on the work required, time, access and materials. There is no fixed price published here because those details can change the job substantially. For a larger or uncertain task, an on-site assessment may be needed. Tell us if you want to group several repairs so they can be assessed together.</p></section>';
    const faq = '<section><h2>Questions about ' + escape(service.name.toLowerCase()) + '</h2>' + service.faq.map(([q,a]) => '<details><summary>' + escape(q) + '</summary><p>' + escape(a) + '</p></details>').join('') + '</section>';
    const related = '<section><h2>Related services</h2><ul class="service-links">' + services.filter(s=>s.slug!==service.slug).map(s=>'<li><a href="/service/'+s.slug+'/">'+escape(s.name)+'</a></li>').join('') +
        '<li><a href="/service/test-and-tag/">Test and tag</a></li></ul>' +
        (isSydney ? '<p>Planning several jobs? Read our <a href="/blog/bundle-small-handyman-jobs-one-visit/">guide to bundling repairs</a>. For a rental inspection, see the <a href="/blog/end-of-lease-repair-checklist-sydney/">end-of-lease repair checklist</a>. Check <a href="/areas/">our priority Sydney areas</a> for local pages.</p>' : '<p>Looking for help with other repairs? See our <a href="/#services">Brisbane handyman service overview</a> and include the complete list in your enquiry.</p>') + '</section>';
    const cta = '<section class="article-cta"><h2>Tell us what needs doing</h2><p>Send the details and we will confirm the scope and next available booking.</p><a class="button" href="/#contact">Request a free quote</a><a class="button button-secondary" href="tel:0408022833">Call 0408 022 833</a></section>';
    write(route, page(title, description, route, '<p class="section-label">' + city + ' handyman services</p><h1>' + escape(service.name) + ' in ' + city + '</h1><blockquote>' + escape(service.intro) + '</blockquote><a class="button" href="/#contact">Request a free quote</a>' + sections + booking + guideLink + faq + related + cta, [schema]));
}

write('/services/', page('Handyman services ' + city + ' | ' + brand, 'Explore handyman repairs, assembly and installation services in ' + city + '. Send your job list for a quote from ' + brand + '.', '/services/',
    '<h1>Handyman services in ' + city + '</h1><p>Choose the service that matches your job, or send a complete repair list so we can help plan the booking.</p><ul class="service-links">' + list + '<li><a href="/service/test-and-tag/">Test and tag</a></li></ul>' +
    '<h2>General repairs and grouped bookings</h2><p>We also accept enquiries for door and cupboard adjustments, picture hanging, shelves, blinds and other small maintenance tasks. Describe the problem, include photos and tell us the suburb. We confirm what can be handled and when a specialist is needed.</p>' +
    '<h2>What to include in your enquiry</h2><p>List each task, add photos and note any product models, deadline or access restrictions. Fixed electrical work, regulated plumbing and structural repairs require the appropriate specialist.</p><a class="button" href="/#contact">Request a free quote</a>'));

if (isSydney) {
    const groups = [
        ['Eastern Suburbs', ['bondi','bondi-junction','bronte','coogee','randwick','double-bay','rose-bay','woollahra','paddington']],
        ['Inner city', ['sydney-cbd','surry-hills','darlinghurst','redfern','chippendale','pyrmont','ultimo','waterloo','alexandria']],
        ['North Shore', ['mosman','cremorne','neutral-bay','north-sydney','kirribilli','milsons-point','crows-nest','st-leonards','artarmon','chatswood','willoughby','lane-cove']]
    ];
    const body = '<h1>Sydney handyman service areas</h1><p>Our current focus is the Eastern Suburbs, inner city and North Shore. Choose a local page below or send your suburb and repair list to confirm coverage and availability.</p>' +
        groups.map(([name,slugs]) => '<section><h2>' + name + '</h2><ul class="service-links">' + slugs.map(s=>'<li><a href="/service/'+s+'/">'+s.split('-').map(w=>w==='cbd'?'CBD':w[0].toUpperCase()+w.slice(1)).join(' ')+'</a></li>').join('') + '</ul></section>').join('') +
        '<h2>Choose a service, then plan the visit</h2><ul class="service-links">' + list + '</ul><p>For apartments, tell us about lift access, parking and building rules. For rentals, organise approval for fixture changes or wall drilling. A list and a few photos help us plan a useful booking.</p><a class="button" href="/#contact">Request a Sydney quote</a>';
    write('/areas/', page('Sydney handyman areas | Eastern Suburbs, City & North Shore', 'Handyman service areas across Sydney Eastern Suburbs, inner city and North Shore. Find your local page and request a quote for repairs and maintenance.', '/areas/', body));
}
console.log('Generated ' + services.length + ' service pages and directories for ' + city);
