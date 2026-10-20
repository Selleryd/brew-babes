'use strict';
/* Keep enhanced navigation, share previews, and canonical metadata aligned. */
let brewSeoData=null,brewSeoPromise=null,brewSeoGeneration=0;
function brewSeoKey(){const [path]=appRouteLocation().split('?');if(path.startsWith('/product/'))return '/products/'+path.slice(9).replace(/\/$/,'')+'/';return path==='/shop'?'/shop/':path}
function brewSetMeta(key,value,property=false){let el=document.querySelector(`meta[${property?'property':'name'}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',key);document.head.appendChild(el)}el.setAttribute('content',value)}
function brewApplySeo(data,generation){
  if(generation!==brewSeoGeneration)return;
  const page=data.pages[brewSeoKey()];
  if(!page){brewSetMeta('robots','noindex,follow');return}
  document.title=page.title;
  brewSetMeta('description',page.description);
  brewSetMeta('robots',data.site.indexable?'index,follow,max-image-preview:large':'noindex,nofollow');
  [['og:title',page.title],['og:description',page.description],['og:url',page.url],['og:type',page.type],['og:image',page.image],['og:site_name','Brew Babes']].forEach(([k,v])=>{if(v)brewSetMeta(k,v,true)});
  [['twitter:card','summary_large_image'],['twitter:title',page.title],['twitter:description',page.description],['twitter:image',page.image]].forEach(([k,v])=>{if(v)brewSetMeta(k,v)});
  let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.setAttribute('rel','canonical');document.head.appendChild(canonical)}canonical.setAttribute('href',page.url);
  let schema=document.getElementById('seo-schema');if(!schema){schema=document.createElement('script');schema.type='application/ld+json';schema.id='seo-schema';document.head.appendChild(schema)}schema.textContent=JSON.stringify(page.structuredData);
}
function brewRefreshSeo(){
  if(!document.head||typeof window.fetch!=='function')return;
  const generation=++brewSeoGeneration;
  if(brewSeoData){brewApplySeo(brewSeoData,generation);return}
  if(!brewSeoPromise)brewSeoPromise=window.fetch(new URL('seo-data.json',brewBaseUrl()).href).then(r=>{if(!r.ok)throw Error('Metadata unavailable');return r.json()}).then(data=>brewSeoData=data).catch(()=>{brewSeoPromise=null;return null});
  brewSeoPromise.then(data=>{if(data)brewApplySeo(data,generation)});
}
function brewRewriteLinks(){document.querySelectorAll('a[href^="#/"]').forEach(a=>a.setAttribute('href',brewRouteUrl(a.getAttribute('href'))))}
function brewSyncUrl(){if(window.history?.replaceState&&(location.hash||'').startsWith('#/'))window.history.replaceState(null,'',brewRouteUrl(location.hash));brewRewriteLinks();brewRefreshSeo()}
const seoBaseRoute=route;
route=function(){seoBaseRoute();brewSyncUrl()};
// Filtered collections and dialogs create new links without a full route change.
for(const name of ['renderGrid','showCart','showCompare','renderFinder']){
  const original=window[name];
  if(typeof original==='function')window[name]=function(...args){const value=original.apply(this,args);brewRewriteLinks();return value};
}
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
  const raw=a.getAttribute('href');if(!raw||raw.startsWith('#'))return;
  let url;try{url=new URL(raw,brewBaseUrl())}catch{return}
  const base=brewBaseUrl();if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
  const local=url.pathname.slice(base.pathname.length);
  if(local!==''&&local!=='shop/'&&!/^products\/[^/]+\/$/.test(local))return;
  e.preventDefault();closeDialogs();window.history.pushState(null,'',url.href);route();
});
window.addEventListener('popstate',()=>{closeDialogs();route()});
document.addEventListener('change',e=>{if(e.target.id==='variant-select')brewSyncUrl()});
route();
