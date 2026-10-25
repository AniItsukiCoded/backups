/* ===== Custom crosshair =====
   Saved in this browser only (localStorage "xh"), never sent to Firebase. Styles: ring (default), cross, dot, or your own image.
   Uploaded images are trimmed + downscaled to <=128px and stored as a small PNG data URL. */
const XH=(()=>{
const KEY='xh',STY=['ring','cross','dot','img'];
const DEF={st:'ring',sz:{ring:14,cross:24,dot:14,img:48},dy:{ring:true,cross:true,dot:false,img:false},op:100,th:2,c:'#ffffff',ol:true,tint:false,img:''};
const $=s=>document.querySelector(s);
let S=load();
function load(){let o={};try{o=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}const s=JSON.parse(JSON.stringify(DEF));
if(STY.includes(o.st))s.st=o.st;
if(o.sz&&typeof o.sz=='object')STY.forEach(k=>{const v=+o.sz[k];if(v>=6&&v<=140)s.sz[k]=v});
if(o.dy&&typeof o.dy=='object')STY.forEach(k=>{if(typeof o.dy[k]=='boolean')s.dy[k]=o.dy[k]});
const op=+o.op;if(op>=10&&op<=100)s.op=op;const th=+o.th;if(th>=1&&th<=8)s.th=th;
if(typeof o.c=='string'&&/^#[0-9a-f]{6}$/i.test(o.c))s.c=o.c;
if(typeof o.ol=='boolean')s.ol=o.ol;if(typeof o.tint=='boolean')s.tint=o.tint;
if(typeof o.img=='string'&&o.img.length<300000&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(o.img))s.img=o.img;
return s}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){note('Could not save the crosshair (browser storage is full or blocked)')}}
function note(t){if(window.toast)toast(t)}
/* style an element (the in-game #cross and the settings preview) from the saved state */
function apply(el){if(!el)return;const st=S.st=='img'&&!S.img?'ring':S.st,y=el.style;
el.dataset.st=st;el.dataset.dy=S.dy[S.st]?'1':'0';el.dataset.ol=S.ol?'1':'0';
y.setProperty('--xz',S.sz[S.st]+'px');y.setProperty('--xc',S.c);y.setProperty('--xo',S.op/100);y.setProperty('--xt',S.th+'px');
if(st=='img'){const u='url("'+S.img+'")';if(S.tint){y.backgroundImage='none';y.webkitMaskImage=u;y.maskImage=u;y.backgroundColor=S.c}else{y.webkitMaskImage='none';y.maskImage='none';y.backgroundColor='transparent';y.backgroundImage=u}}
else{y.backgroundImage='';y.webkitMaskImage='';y.maskImage='';y.backgroundColor=''}}
function sync(){apply($('#cross'));apply($('#xhp'));
document.querySelectorAll('#xhst button').forEach(b=>b.classList.toggle('on',b.dataset.s===S.st));
const set=(id,v)=>{const e=$(id);if(e)e.value=v};
set('#xhsz',S.sz[S.st]);set('#xhop',S.op);set('#xhth',S.th);set('#xhc',S.c);
const t=(id,v)=>{const e=$(id);if(e)e.textContent=v};t('#xhszv',S.sz[S.st]+' px');t('#xhopv',S.op+'%');t('#xhthv',S.th+' px');
const ck=(id,v)=>{const e=$(id);if(e)e.checked=!!v};ck('#xhol',S.ol);ck('#xhdy',S.dy[S.st]);ck('#xhtint',S.tint);
const sh=(id,on)=>{const e=$(id);if(e)e.style.display=on?'':'none'};
sh('#xhthr',S.st==='ring'||S.st==='cross');sh('#xhimr',S.st==='img');sh('#xhtr',S.st==='img'&&!!S.img);sh('#xhcr',S.st!=='img'||(S.tint&&!!S.img));
const hint=$('#xhhint');if(hint)hint.textContent=S.st==='img'&&!S.img?'Upload an image to use it as your crosshair (PNG with a transparent background works best).':''}
/* trim transparent margins + shrink to <=128px so the size slider matches what you see */
function fromFile(f){if(!f)return;if(!/^image\//.test(f.type))return note('Pick an image file (PNG, JPG, GIF, WebP…)');if(f.size>8e6)return note('That image is too big (8 MB max)');
const r=new FileReader();r.onerror=()=>note('Could not read that file');r.onload=()=>{const im=new Image();im.onerror=()=>note('Could not open that image');
im.onload=()=>{try{const m=128,k=Math.min(1,m/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*k)),h=Math.max(1,Math.round(im.height*k)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0,w,h);
const d=x.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(d[(j*w+i)*4+3]>10){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
if(x1<0)return note('That image is fully transparent');
const cw=x1-x0+1,ch=y1-y0+1,o=document.createElement('canvas');o.width=cw;o.height=ch;o.getContext('2d').drawImage(c,x0,y0,cw,ch,0,0,cw,ch);
S.img=o.toDataURL('image/png');S.st='img';save();sync();note('Crosshair image set')}catch(e){note('Could not use that image')}};im.src=r.result};r.readAsDataURL(f)}
function wire(){const on=(id,ev,fn)=>{const e=$(id);if(e)e[ev]=fn};
document.querySelectorAll('#xhst button').forEach(b=>b.onclick=()=>{if(window.SFX)SFX.click();S.st=b.dataset.s;save();sync()});
on('#xhsz','oninput',e=>{S.sz[S.st]=+e.target.value;save();sync()});on('#xhop','oninput',e=>{S.op=+e.target.value;save();sync()});on('#xhth','oninput',e=>{S.th=+e.target.value;save();sync()});
on('#xhc','oninput',e=>{S.c=e.target.value;save();sync()});on('#xhol','onchange',e=>{S.ol=e.target.checked;save();sync()});
on('#xhdy','onchange',e=>{S.dy[S.st]=e.target.checked;save();sync()});on('#xhtint','onchange',e=>{S.tint=e.target.checked;save();sync()});
on('#xhup','onclick',()=>{if(window.SFX)SFX.click();$('#xhfile').click()});on('#xhfile','onchange',e=>{const f=e.target.files&&e.target.files[0];e.target.value='';fromFile(f)});
on('#xhrm','onclick',()=>{if(window.SFX)SFX.click();S.img='';if(S.st==='img')S.st='ring';save();sync()});
on('#xhreset','onclick',()=>{if(window.SFX)SFX.click();S=JSON.parse(JSON.stringify(DEF));save();sync();note('Crosshair reset')});
sync()}
wire();
return{apply,sync,get:()=>S}})();
