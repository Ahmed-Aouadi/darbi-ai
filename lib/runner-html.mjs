/**
 * صفحة المنفّذ المعزول (/runner). تُحمَّل داخل iframe بخاصية sandbox="allow-scripts"
 * (منشأ مجهول: لا ملفات تعريف ارتباط ولا localStorage ولا وصول لواجهات الموقع)
 * مع CSP صارمة (انظر security.mjs): لا شبكة إطلاقًا. يعمل الكود داخل Worker يُنهى عند المهلة.
 */

/** مقارنة قيم صارمة: لا تساوي بين true و1، ولا بين null وundefined، وNaN لا يساوي نفسه. */
export const COMPARE_FN_SOURCE = String.raw`function same(a,b){
  if(typeof a==='number'&&typeof b==='number')return a===b;
  if(a===b)return true;
  if(a===null||b===null||a===undefined||b===undefined||typeof a!==typeof b)return false;
  if(Array.isArray(a)||Array.isArray(b)){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every(function(v,i){return same(v,b[i]);});}
  if(typeof a==='object'){var ka=Object.keys(a).sort(),kb=Object.keys(b).sort();return ka.length===kb.length&&ka.every(function(k,i){return k===kb[i]&&same(a[k],b[k]);});}
  return false;
}`;

export const WORKER_SOURCE = COMPARE_FN_SOURCE + String.raw`
try{self.fetch=undefined;self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.EventSource=undefined;self.importScripts=undefined;}catch(_){}
function show(v){
  try{
    var s=JSON.stringify(v,function(k,x){return typeof x==='number'&&!isFinite(x)?String(x):x===undefined?'undefined':typeof x==='function'?'[function]':x;});
    if(s===undefined)return String(v);
    return s.length>300?s.slice(0,300)+'…':s;
  }catch(e){return '[قيمة غير قابلة للعرض]';}
}
var logs=[],logSize=0;
function log(){
  var parts=[];for(var i=0;i<arguments.length;i++){parts.push(typeof arguments[i]==='string'?arguments[i]:show(arguments[i]));}
  var line=parts.join(' ').slice(0,400);
  if(logSize<2000){logs.push(line);logSize+=line.length;}
}
self.console={log:log,info:log,warn:log,error:log,debug:log};
self.onmessage=function(e){
  var d=e.data,fn;
  try{
    fn=(new Function(d.code+'\n;return typeof '+d.fn+"==='function'?"+d.fn+':null;'))();
  }catch(err){
    self.postMessage({kind:'fatal',error:'في الكود خطأ في الكتابة: '+(err&&err.message||err)});return;
  }
  if(typeof fn!=='function'){self.postMessage({kind:'fatal',error:'لم أجد دالة باسم '+d.fn+'. تأكد أنك لم تغيّر اسمها.'});return;}
  for(var i=0;i<d.tests.length;i++){
    var t=d.tests[i],t0=performance.now(),actual,error=null;
    try{actual=fn.apply(null,structuredClone(t.args));}catch(err){error=String(err&&err.message||err);}
    var ok=false;
    if(!error){
      if(t.compare===false)ok=true;
      else{try{ok=same(actual,t.expected);}catch(_){ok=false;}}
    }
    self.postMessage({kind:'test',index:i,ok:ok,actual:error?undefined:show(actual),error:error||undefined,ms:Math.round(performance.now()-t0)});
  }
  self.postMessage({kind:'done',logs:logs});
};
`;

const OUTER = String.raw`
(function(){
  'use strict';
  var worker=null,timer=null;
  function post(m){window.parent.postMessage(m,'*');}
  function stop(){clearTimeout(timer);if(worker){worker.terminate();worker=null;}}
  function run(d){
    stop();
    var bad=!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(d.fn)||typeof d.code!=='string'||d.code.length>20000||!Array.isArray(d.tests)||d.tests.length>30;
    if(bad){post({type:'error',id:d.id,error:'طلب غير صالح.'});return;}
    var per=Math.min(Math.max(Number(d.timeoutMs)||3000,500),10000),url;
    try{url=URL.createObjectURL(new Blob([WORKER_SRC],{type:'text/javascript'}));worker=new Worker(url);}
    catch(err){post({type:'error',id:d.id,error:'تعذّر إنشاء بيئة التشغيل.'});return;}
    var received=0;
    function arm(){clearTimeout(timer);timer=setTimeout(function(){var at=received;stop();post({type:'timeout',id:d.id,index:at});},per);}
    worker.onmessage=function(ev){
      var m=ev.data||{};arm();
      if(m.kind==='test'){received++;post({type:'test',id:d.id,test:m});}
      else if(m.kind==='done'){stop();post({type:'done',id:d.id,logs:m.logs||[]});}
      else if(m.kind==='fatal'){stop();post({type:'fatal',id:d.id,error:m.error});}
    };
    worker.onerror=function(ev){stop();post({type:'error',id:d.id,error:'تعذّر تشغيل الكود.'});if(ev&&ev.preventDefault)ev.preventDefault();};
    arm();
    worker.postMessage({code:d.code,fn:d.fn,tests:d.tests});
  }
  window.addEventListener('message',function(e){
    if(e.source!==window.parent)return;
    var d=e.data;
    if(!d||d.type!=='run'||typeof d.id!=='string')return;
    run(d);
  });
  post({type:'ready'});
})();
`;

export const RUNNER_HTML =
  '<!doctype html><html lang="ar"><head><meta charset="utf-8"><title>runner</title></head><body><script>var WORKER_SRC=' +
  JSON.stringify(WORKER_SOURCE).replace(/</g, '\\u003c') +
  ';' + OUTER + '</script></body></html>';
