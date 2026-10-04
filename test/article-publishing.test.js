const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
process.env.MAILGUN_API_KEY='test-key';process.env.MAILGUN_DOMAIN='example.test';process.env.NODE_ENV='test';
const app=require('../server');
const {getArticles,renderMarkdown}=require('../lib/blog');
const config=require('../content/services.json');
test('article pages preserve branding, dates, tracking, sources and internal destinations',async(t)=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 const articles=getArticles();assert.equal(articles.length,config.city==='Sydney'?9:6);
 assert.ok(articles.every((a,i)=>(!a.hasGuideDate||a.displayDate.toISOString().slice(0,10)<=a.published)&&(!i||articles[i-1].displayDate>=a.displayDate)));
 const siteMap=await(await fetch(base+'/sitemap.xml')).text();
 for(const article of articles){
  const route='/blog/'+article.slug+'/'; const response=await fetch(base+route);assert.equal(response.status,200,route);const html=await response.text();
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/src="\/js\/analytics.js"/g)||[]).length,1);
  assert.ok(html.includes('href="'+article.url+'"'));assert.ok(siteMap.includes(article.url));
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const schema=schemas.find(s=>s['@type']==='Article');assert.equal(schema.publisher.name,config.brand);assert.equal(schema.datePublished,article.published);assert.equal(schema.dateModified,article.updated||article.published);
  assert.ok(fs.existsSync(path.join(__dirname,'../public',decodeURIComponent(article.image))));
  if(article.published==='2026-10-04'){assert.ok(article.body.split(/\s+/).length>500);assert.equal(article.updated,'2026-10-04');assert.ok(html.includes('Guide date:'));}
  if(config.city==='Brisbane'){assert.ok(!html.includes('Harbour Town'));assert.ok(!html.includes('harbourtownhandyman.com.au'));}
  assert.doesNotMatch(article.body,/[—–]/);
  const body=await renderMarkdown(article.body);
  for(const match of body.matchAll(/href="(\/[^"#]*)"/g)){
   const destination=match[1].split('#')[0];assert.equal((await fetch(base+destination)).status,200,route+' -> '+destination);
  }
  assert.equal((await fetch(base+'/blog/'+article.slug,{redirect:'manual'})).status,301);
 }
 const hub=await(await fetch(base+'/blog/')).text();assert.equal((hub.match(/src="\/js\/analytics.js"/g)||[]).length,1);
 assert.equal((await fetch(base+'/blog/index.html',{redirect:'manual'})).status,301);
 assert.equal((await fetch(base+'/blog/missing-article/')).status,404);
 assert.ok((await(await fetch(base+'/blog/feed.xml')).text()).includes(config.brand+' Articles'));
});
