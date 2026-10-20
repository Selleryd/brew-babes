'use strict';
/* Resolve both published clean URLs and older shared hash links. */
function brewBaseUrl(){
  const base=document.querySelector('base');
  return new URL(base?.getAttribute('href')||'./',location.href||'https://selleryd.github.io/brew-babes/');
}
function appRouteLocation(){
  if((location.hash||'').startsWith('#/'))return location.hash.slice(1);
  const base=brewBaseUrl().pathname;
  let path=location.pathname||'/';
  if(base!=='/'&&path.startsWith(base))path='/'+path.slice(base.length);
  if(path==='/index.html')path='/';
  if(path.startsWith('/products/'))path='/product/'+path.slice(10).replace(/\/$/,'');
  if(path==='/shop/'||path==='/shop/index.html')path='/shop';
  return path+(location.search||'');
}
function brewRouteUrl(route){
  const [path,query='']=route.replace(/^#/,'').split('?');
  let relative=path.replace(/^\//,'');
  if(path.startsWith('/product/'))relative='products/'+path.slice(9).replace(/\/$/,'')+'/';
  else if(path==='/shop')relative='shop/';
  else if(path==='/')relative='';
  return new URL(relative+(query?'?'+query:''),brewBaseUrl()).href;
}
