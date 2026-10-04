const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../content/services.json');
const source = fs.readFileSync(path.join(__dirname, '../public/js/analytics.js'), 'utf8');
function load(hostname = new URL(config.url).hostname, pathname = '/', privacy = {}) {
 const scripts = [], listeners = {};
 const window = { location: { hostname, pathname } };
 const context = { window, navigator: privacy, Date, encodeURIComponent, document: {
  addEventListener: (name, fn) => listeners[name] = fn,
  createElement: () => ({}), head: { appendChild: tag => scripts.push(tag) }
 }};
 vm.runInNewContext(source, context);
 return { window, scripts, listeners, context };
}
test('tracking loads once on own public site and emits only event names', () => {
 const s = load();
 assert.equal(s.scripts.length, 1);
 vm.runInNewContext(source, s.context);
 assert.equal(s.scripts.length, 1);
 s.listeners.click({ target: { closest: () => ({}) } });
 s.window.handymanAnalytics.lead();
 assert.equal(JSON.stringify(s.window.dataLayer.slice(1)), JSON.stringify([{event:'phone_click'}, {event:'generate_lead'}]));
});
test('tracking excludes admin, API, other hosts and privacy opt-outs', () => {
 for (const args of [['example.test'], [undefined, '/admin/callbacks.html'], [undefined, '/api/send-email'], [undefined, '/', {doNotTrack:'1'}], [undefined, '/', {globalPrivacyControl:true}]]) {
  const s = load(...args); assert.equal(s.scripts.length, 0); assert.equal(s.window.handymanAnalytics, undefined);
 }
});
test('quote tracking fires only on successful server response', async () => {
 for (const file of ['formHandler.js','contactModal.js']) {
  for (const mode of ['success','failure','rejected','network']) {
   let leads = 0;
   const button = {textContent:'Send'};
   const form = {querySelector:()=>button, reset:()=>{}};
   const context = { window:{handymanAnalytics:{lead:()=>leads++}}, document:{readyState:'loading',getElementById:id=>id==='modalContactForm'?form:null,addEventListener:()=>{}}, console:{error:()=>{}}, setTimeout:()=>{}, FormData:class {entries(){return [][Symbol.iterator]();}}, fetch:async()=>{if(mode==='network')throw new Error('offline');return {ok:mode!=='failure',json:async()=>({success:mode!=='rejected'})};} };
   const className = file==='formHandler.js'?'FormHandler':'ContactModal';
   vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/js',file),'utf8')+';globalThis.SubmitClass='+className, context);
   await context.SubmitClass.prototype.handleSubmit.call({form,apiEndpoint:'/api/send-email',validateForm:()=>true,showStatus:()=>{},close:()=>{}},{preventDefault:()=>{}});
   assert.equal(leads,mode==='success'?1:0,file+' '+mode);
  }
 }
});
