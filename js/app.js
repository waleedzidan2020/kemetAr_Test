import {loadProject} from './storage.js';
import {registerRevealShader, createRevealController} from './reveal.mjs';
const $=id=>document.getElementById(id), root=new URL('../',import.meta.url), urls=[];
let running=false,scene=null,project=null,previousOpacity=85,demoBuffer=null,revealController=null;
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(src,root).href;s.onload=resolve;s.onerror=()=>reject(new Error('تعذر تحميل مكتبة: '+src));document.head.append(s);});
const setHomeMessage=msg=>{$('homeMessage').textContent=msg;};
function dialog(title,message,extra){$('dialogTitle').textContent=title;$('dialogText').textContent=message;$('dialogExtra').replaceChildren();if(extra){const a=document.createElement('a');a.href=extra.href;a.textContent=extra.label;$('dialogExtra').append(a)}$('dialog').hidden=false;}
function closeDialog(){$('dialog').hidden=true;}
$('dialogOK').onclick=closeDialog;$('dismissDialog').onclick=closeDialog;
function setStatus(msg,found=false){$('scanStatus').textContent=msg;document.querySelector('.center-guide').classList.toggle('found',found);}
function revoke(){for(const url of urls)URL.revokeObjectURL(url);urls.length=0;}
function useURL(value){const url=URL.createObjectURL(value);urls.push(url);return url;}
async function loadImg(src){const image=new Image();image.src=src;await image.decode();return image;}
function absolute(path){return new URL(path,root).href;}
async function compiledDemo(){if(!demoBuffer){setHomeMessage('يتم تجهيز نموذج العرض داخل متصفحك…');if(!window.MINDAR?.IMAGE?.Compiler)await loadScript('vendor/mindar-image.prod.js');const Compiler=window.MINDAR?.IMAGE?.Compiler;if(!Compiler)throw new Error('مكتبة إنشاء ملفات MindAR غير متاحة');const image=await loadImg(absolute('assets/demo-target.svg'));const compiler=new Compiler();await compiler.compileImageTargets([image],p=>setHomeMessage('تجهيز نموذج العرض: '+Math.round(p)+'%'));demoBuffer=await compiler.exportData();}return {name:'نموذج توضيحي — ألوان كيميت',mind:useURL(new Blob([demoBuffer],{type:'application/octet-stream'})),targets:[{title:'لوحة تجريبية',width:1000,height:700,overlay: absolute('assets/demo-color.svg'),fullOverlay:absolute('assets/demo-color.svg'),fullBounds:{x:0,y:0,width:1000,height:700}}],mode:'demo'};}
async function localProject(){const saved=await loadProject();if(!saved||!saved.mind||!Array.isArray(saved.targets)||!saved.targets.length)throw new Error('لا يوجد مشروع محفوظ على هذا المتصفح. أنشئه أولًا في استوديو النقوش.');return {name:saved.name||'مشروع محلي',mind:useURL(new Blob([saved.mind])),targets:saved.targets.map(t=>({title:t.title,width:t.width,height:t.height,overlay:useURL(t.overlay),fullOverlay:t.fullOverlay ? useURL(t.fullOverlay) : null,fullBounds:t.fullBounds||null})),mode:'local'};}
async function publishedProject(){const response=await fetch(absolute('data/targets.json'),{cache:'no-store'});if(!response.ok)throw new Error('تعذر تحميل إعدادات النقوش');const cfg=await response.json();if(!Array.isArray(cfg.targets)||!cfg.targets.length)throw new Error('الموقع جاهز، لكن لم يتم نشر صور النقوش وملف targets.mind بعد. استخدم استوديو النقوش لإنشاء ملف التتبع، أو شغّل النموذج التجريبي.');const file=absolute(cfg.mind||'targets/targets.mind');const check=await fetch(file,{method:'HEAD',cache:'no-store'});if(!check.ok)throw new Error('ملف targets.mind غير منشور في المستودع. راجع دليل النشر.');return {name:cfg.name||'النقوش المصرية',mind:file,targets:cfg.targets.map(t=>({title:t.title||'نقش',width:Number(t.width)||1,height:Number(t.height)||1,overlay:absolute(t.overlay),fullOverlay:t.fullOverlay ? absolute(t.fullOverlay) : null,fullBounds:t.fullBounds||null})),mode:'published'};}
async function ensureRuntime(){if(!window.AFRAME)await loadScript('vendor/aframe.min.js');registerRevealShader(AFRAME);if(!AFRAME.components['mindar-image-target'])await loadScript('vendor/mindar-image-aframe.prod.js');}

function validBounds(item){
  const b=item.fullBounds;
  if(!item.fullOverlay||!b)return null;
  const x=Number(b.x),y=Number(b.y),width=Number(b.width),height=Number(b.height);
  if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0||x<0||y<0||x+width>item.width+1||y+height>item.height+1)return null;
  return {x,y,width,height};
}
function makeColorPlane(id,src,position,width,height){
  const plane=document.createElement('a-plane');
  plane.className='color-plane';
  plane.dataset.targetIndex=id;
  plane.setAttribute('position',position);
  plane.setAttribute('width',String(width));
  plane.setAttribute('height',String(height));
  plane.setAttribute('material','shader: kemet-reveal; src: #'+src+'; transparent: true; revealMode: 0; progress: 1; opacity: '+(Number($('overlayOpacity').value)/100)+'; depthWrite: false; side: double');
  return plane;
}
function createScene(data){
  revealController?.dispose();
  revealController=createRevealController({
    getMode:()=> $('revealMode').value,
    getDuration:()=> Number($('revealDuration').value)*1000
  });
  const stage=$('arStage');stage.replaceChildren();
  const s=document.createElement('a-scene');
  s.setAttribute('embedded','');
  s.setAttribute('vr-mode-ui','enabled: false');
  s.setAttribute('device-orientation-permission-ui','enabled: false');
  s.setAttribute('renderer','colorManagement: true; alpha: true; antialias: true');
  s.setAttribute('mindar-image','imageTargetSrc: '+data.mind+'; autoStart: false; maxTrack: 1; uiLoading: no; uiScanning: no; uiError: no; filterMinCF: 0.001; filterBeta: 120; warmupTolerance: 5; missTolerance: 10');
  const assets=document.createElement('a-assets');assets.setAttribute('timeout','20000');
  data.targets.forEach((item,i)=>{
    const img=document.createElement('img');img.id='paint-'+i;img.setAttribute('src',item.overlay);img.setAttribute('crossorigin','anonymous');assets.append(img);
    if(validBounds(item)){
      const full=document.createElement('img');full.id='paint-full-'+i;full.setAttribute('src',item.fullOverlay);full.setAttribute('crossorigin','anonymous');assets.append(full);
    }
  });
  s.append(assets);
  const camera=document.createElement('a-camera');camera.setAttribute('position','0 0 0');camera.setAttribute('look-controls','enabled: false');s.append(camera);
  data.targets.forEach((item,i)=>{
    const anchor=document.createElement('a-entity');
    anchor.setAttribute('mindar-image-target','targetIndex: '+i);
    const logo=makeColorPlane(i,'paint-'+i,'0 0 0.01',1,item.height/item.width);
    logo.classList.add('logo-color-plane');
    anchor.append(logo);
    const b=validBounds(item);
    let full=null;
    if(b){
      const x=(b.x+b.width/2)/item.width-0.5;
      const y=(item.height/2-b.y-b.height/2)/item.width;
      full=makeColorPlane(i,'paint-full-'+i,x+' '+y+' 0.012',b.width/item.width,b.height/item.width);
      full.classList.add('full-color-plane');
      anchor.append(full);
    }
    const useFull=$('overlayStyle').value==='full'&&!!full;
    logo.setAttribute('visible',!useFull);
    if(full)full.setAttribute('visible',useFull);
    revealController.register(i,useFull?full:logo);
    anchor.addEventListener('targetFound',()=>{
      revealController?.found(i);
      setStatus('تم التعرف على: '+item.title,true);
    });
    anchor.addEventListener('targetLost',()=>{
      revealController?.lost(i);
      setStatus('التتبع مفقود — وجّه الكاميرا نحو النقش مجددًا');
    });
    s.append(anchor);
  });
  scene=s;stage.append(s);return s;
}
function applyOverlayStyle(){
  const preferred=$('overlayStyle').value;
  if(!project||!scene||!revealController)return;
  let missing=0;
  project.targets.forEach((item,i)=>{
    const logo=scene.querySelector('.logo-color-plane[data-target-index="'+i+'"]');
    const full=scene.querySelector('.full-color-plane[data-target-index="'+i+'"]');
    if(!logo)return;
    const useFull=preferred==='full'&&!!full;
    if(preferred==='full'&&!full)missing++;
    logo.setAttribute('visible',!useFull);
    if(full)full.setAttribute('visible',useFull);
    revealController.setPlane(i,useFull?full:logo);
  });
  revealController.setOpacity(Number($('overlayOpacity').value)/100);
  if(missing)setStatus('بعض النقوش لا تحتوي صورة ملونة كاملة؛ تم عرض وضع الشعار لها');
}
async function start(mode){if(running)return;running=true;setHomeMessage('');$('liveButton').disabled=true;$('demoButton').disabled=true;try{if(!window.isSecureContext)throw new Error('الكاميرا تحتاج اتصال HTTPS آمنًا. افتح رابط GitHub Pages.');if(!navigator.mediaDevices?.getUserMedia)throw new Error('الكاميرا غير متاحة في هذا المتصفح أو لم يُسمح باستخدامها.');
if(mode==='demo')project=await compiledDemo();else if(mode==='local')project=await localProject();else project=await publishedProject();
if(project.targets.length>20)throw new Error('عدد الصور كبير جدًا لهذه النسخة؛ استخدم حتى 20 صورة لكل مجموعة.');
await ensureRuntime();
$('projectLabel').textContent=project.name;
if($('overlayStyle').value==='full'){
  $('overlayOpacity').value='100';$('opacityLabel').textContent='100%';previousOpacity=100;
}
$('viewer').hidden=false;document.body.style.overflow='hidden';setStatus('تهيئة الكاميرا — يرجى الموافقة على الصلاحية');
const s=createScene(project);await new Promise((resolve,reject)=>{if(s.hasLoaded)return resolve();s.addEventListener('loaded',resolve,{once:true});s.addEventListener('error',()=>reject(new Error('فشل تحميل واجهة الواقع المعزز')),{once:true});});
await s.systems['mindar-image-system'].start();setStatus('حرّك الهاتف برفق حتى يتعرف على الصورة');}
catch(err){await stop();const msg=err?.message||String(err);setHomeMessage(msg);dialog('تعذّر بدء التجربة',msg,{href:'./studio.html',label:'افتح استوديو النقوش'});}
finally{running=false;$('liveButton').disabled=false;$('demoButton').disabled=false;}}
async function stop(){revealController?.dispose();revealController=null;const old=scene;scene=null;if(old){try{await old.systems?.['mindar-image-system']?.stop()}catch(e){console.warn(e)}old.remove();}$('arStage').replaceChildren();$('viewer').hidden=true;document.body.style.overflow='';document.querySelector('.center-guide').classList.remove('found');project=null;revoke();}
$('liveButton').addEventListener('click',()=>start('published'));$('demoButton').addEventListener('click',()=>start('demo'));$('closeViewer').addEventListener('click',()=>stop());
$('overlayOpacity').addEventListener('input',e=>{const value=Number(e.target.value);$('opacityLabel').textContent=value+'%';revealController?.setOpacity(value/100);if(value>0)previousOpacity=value;});
$('toggleColor').addEventListener('click',()=>{const slider=$('overlayOpacity');slider.value=Number(slider.value)>0?0:previousOpacity;slider.dispatchEvent(new Event('input'));});
$('overlayStyle').addEventListener('change',()=>{
  const full=$('overlayStyle').value==='full';
  $('overlayOpacity').value=full?'100':'85';
  $('overlayOpacity').dispatchEvent(new Event('input'));
  applyOverlayStyle();
  try{localStorage.setItem('kemet-overlay-style',$('overlayStyle').value);}catch{}
});
$('fullScreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('viewer').requestFullscreen();}catch(e){setStatus('ملء الشاشة غير مدعوم هنا');}});

function updateRevealControls(){
  const animated=$('revealMode').value!=='instant';
  $('revealDurationGroup').hidden=!animated;
  $('replayReveal').disabled=!animated;
  $('revealDurationLabel').textContent=Number($('revealDuration').value).toLocaleString('ar-EG')+' ثوانٍ';
}
try {
  const savedStyle=localStorage.getItem('kemet-overlay-style');
  if(['logo','full'].includes(savedStyle))$('overlayStyle').value=savedStyle;
  const savedMode=localStorage.getItem('kemet-reveal-mode');
  if(['instant','fade','wipe'].includes(savedMode))$('revealMode').value=savedMode;
  const savedSeconds=Number(localStorage.getItem('kemet-reveal-seconds'));
  if(savedSeconds>=1 && savedSeconds<=8)$('revealDuration').value=String(savedSeconds);
} catch {}
updateRevealControls();
$('revealMode').addEventListener('change',()=>{
  updateRevealControls();
  revealController?.setMode();
  try {localStorage.setItem('kemet-reveal-mode',$('revealMode').value);} catch {}
});
$('revealDuration').addEventListener('input',()=>{
  updateRevealControls();
  try {localStorage.setItem('kemet-reveal-seconds',$('revealDuration').value);} catch {}
});
$('replayReveal').addEventListener('click',()=>{
  if(!revealController?.replay())setStatus('وجّه الكاميرا نحو الشعار أولًا لتكرار التأثير');
});
const mode=new URLSearchParams(location.search).get('mode');if(mode==='local')start('local');else if(mode==='demo')start('demo');
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(absolute('sw.js'),{scope:root.pathname}).catch(console.warn));
