/* ===== Controller support + automatic input-device detection =====
   INPUT.dev is always 'kbm' (keyboard + mouse), 'pad' (gamepad) or 'touch' and follows whatever the player used last:
   press a controller button / push a stick -> 'pad', move the mouse or press a key -> 'kbm', touch the screen (touch devices only) -> 'touch'.
   Everything that depends on the device (on-screen touch controls, pointer lock, button prompts) reads INPUT.dev / the body classes it sets:
   body[data-dev], body.touch (touch UI visible) and body.pad.
   While a match is running the game drains the button events (PAD.drain) and reads the sticks (PAD.axes). Everywhere else (menus, settings, pause, results) this
   file turns the D-pad / left stick into focus movement: A clicks, B goes back, LB/RB switch tabs, left/right adjusts sliders. */
(()=>{
const TOUCH0=!!window.TOUCH,subs=[];
const INPUT=window.INPUT={dev:TOUCH0?'touch':'kbm',touchOK:TOUCH0,pad:null,type:'xbox',on(f){subs.push(f)},
 get isPad(){return INPUT.dev==='pad'}};
const cfg=(k,d)=>{const v=window.CFG&&CFG[k];return v==null||!Number.isFinite(+v)?d:+v};
/* ---------- button prompts ---------- */
const FACE={xbox:['A','B','X','Y'],ps:['✕','○','□','△'],switch:['B','A','Y','X'],generic:['A','B','X','Y']};
const BN={xbox:{4:'LB',5:'RB',6:'LT',7:'RT',8:'View',9:'Menu',10:'L3',11:'R3',12:'↑',13:'↓',14:'←',15:'→'},
 ps:{4:'L1',5:'R1',6:'L2',7:'R2',8:'Share',9:'Options',10:'L3',11:'R3',12:'↑',13:'↓',14:'←',15:'→'},
 switch:{4:'L',5:'R',6:'ZL',7:'ZR',8:'−',9:'+',10:'L3',11:'R3',12:'↑',13:'↓',14:'←',15:'→'}};
BN.generic=BN.xbox;
function typeOf(id){id=(id||'').toLowerCase();if(/054c|playstation|dualshock|dualsense|ps4|ps5|wireless controller/.test(id))return'ps';if(/057e|nintendo|switch|joy-con|pro controller/.test(id))return'switch';if(/xbox|045e|xinput|microsoft/.test(id))return'xbox';return'generic'}
const btnLabel=i=>i<4?FACE[INPUT.type][i]:(BN[INPUT.type]||BN.xbox)[i]||('B'+i);
/* in-match layout. Two layers: the normal one and the BUILD layer (while a build piece is selected) */
const LAYOUT={
 move:'Left stick',look:'Right stick',
 shoot:[7],aim:[6],jump:[0],reload:[2],build:[1],wnext:[3],sprint:[10],view:[11],edit:[5],mat:[4],map:[8],pause:[9],
 w1:[12],w2:[15],pick:[13],
 wall:[12],floor:[15],ramp:[13],roof:[14],
 specP:[4,14],specN:[5,15]};
LAYOUT.buildOn=LAYOUT.build;
INPUT.label=a=>{const b=LAYOUT[a];if(!b||typeof b=='string')return b||'';return b.map(btnLabel).slice(0,1).join('')};
INPUT.layout=()=>[
 ['Move',LAYOUT.move],['Look / aim','Right stick'],['Fire · place piece',btnLabel(7)],['Aim down sights',btnLabel(6)+' (build: cycle material)'],['Jump',btnLabel(0)],['Reload',btnLabel(2)],
 ['Build mode on / off',btnLabel(1)],['Next weapon',btnLabel(3)],['Sprint',btnLabel(10)],['First / third person',btnLabel(11)],['Edit (hold, release to confirm)',btnLabel(5)],['Cycle material',btnLabel(4)],['Map (Zone Wars)',btnLabel(8)],['Pause',btnLabel(9)],
 ['Weapons',btnLabel(12)+' shotgun · '+btnLabel(15)+' rifle · '+btnLabel(13)+' pickaxe'],['Build pieces (build mode)',btnLabel(12)+' wall · '+btnLabel(15)+' floor · '+btnLabel(13)+' stairs · '+btnLabel(14)+' roof'],['Spectate',btnLabel(4)+' / '+btnLabel(5)+' switch player · '+btnLabel(0)+' view']];
INPUT.layoutMap=LAYOUT;
/* ---------- device switching ---------- */
function setDev(d){if(d==='touch'&&!INPUT.touchOK)return;if(INPUT.dev===d)return;INPUT.dev=d;
 document.body.dataset.dev=d;document.body.classList.toggle('pad',d==='pad');
 /* the touch controls only show while touch is the active device; the game reads window.TOUCH to decide how the mouse / pointer lock is handled */
 window.TOUCH=d==='touch';document.body.classList.toggle('touch',d==='touch');
 subs.forEach(f=>{try{f(d)}catch(e){}})}
document.body.dataset.dev=INPUT.dev;
let lastTouchT=0,lastPadT=0;
addEventListener('mousemove',e=>{if(INPUT.dev==='kbm')return;if(Math.abs(e.movementX||0)+Math.abs(e.movementY||0)>2&&Date.now()-lastTouchT>800&&Date.now()-lastPadT>250)setDev('kbm')},true);
addEventListener('mousedown',e=>{if(INPUT.dev!=='kbm'&&Date.now()-lastTouchT>800&&e.isTrusted)setDev('kbm')},true);
addEventListener('keydown',e=>{if(/^(Shift|Control|Alt|Meta)/.test(e.code))return;if(INPUT.dev!=='kbm')setDev('kbm')},true);
addEventListener('touchstart',()=>{lastTouchT=Date.now();if(INPUT.touchOK&&INPUT.dev!=='touch')setDev('touch')},{capture:true,passive:true});
/* ---------- gamepad state ---------- */
const S={lx:0,ly:0,rx:0,ry:0,b:new Array(18).fill(0),pb:new Array(18).fill(0)},Q=[];let gpI=-1;
const PAD=window.PAD={axes:S,drain(){const q=Q.splice(0,Q.length);return q},get connected(){return gpI>=0},
 rumble(strong,weak,ms){if(INPUT.dev!=='pad'||cfg('prum',1)===0)return;const g=cur();if(!g)return;try{const a=g.vibrationActuator;if(a&&a.playEffect)a.playEffect('dual-rumble',{startDelay:0,duration:ms||100,weakMagnitude:Math.min(1,weak||0),strongMagnitude:Math.min(1,strong||0)}).catch(()=>{})}catch(e){}}};
const cur=()=>{const l=navigator.getGamepads?navigator.getGamepads():[];return gpI>=0?l[gpI]:null};
function pick(){const l=navigator.getGamepads?navigator.getGamepads():[];for(let i=0;i<l.length;i++){const g=l[i];if(g&&g.connected&&g.buttons&&g.buttons.length>=10){if(gpI!==i){gpI=i;INPUT.type=typeOf(g.id);INPUT.pad=g.id}return g}}if(gpI>=0){gpI=-1;INPUT.pad=null}return null}
addEventListener('gamepadconnected',e=>{pick();INPUT.type=typeOf(e.gamepad.id);if(window.toast)toast('🎮 Controller connected: '+e.gamepad.id.replace(/\s*\(.*$/,'').slice(0,40)+' — press any button to use it');subs.forEach(f=>{try{f(INPUT.dev)}catch(_){}})});
addEventListener('gamepaddisconnected',()=>{pick();if(window.toast)toast('🎮 Controller disconnected');if(INPUT.dev==='pad')setDev(INPUT.touchOK?'touch':'kbm');if(window.Game&&Game.padLost)Game.padLost()});
/* ---------- menu navigation ---------- */
let navT=0,navDir=null,rep=0,hold={};
const vis=e=>{if(!e||e.disabled)return false;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>.05};
function layer(){/* the topmost thing the player can interact with */
 const q=sel=>[...document.querySelectorAll(sel)];
 const reveal=document.getElementById('reveal');if(reveal&&getComputedStyle(reveal).display!=='none'&&reveal.classList.contains('on'))return reveal;
 const m=q('.modal.on');if(m.length)return m[m.length-1];
 const p=document.getElementById('pause');if(p&&p.classList.contains('on'))return p;
 const sc=q('.screen.on');return sc.length?sc[sc.length-1]:document.body}
const SEL='button,input,select,a[href],.sq,.tab,.t2,.kb,.swc,.mcard,.item,[data-nav],#modebox,#friend,#hpass,#lpass,#coins';
function focusables(root){return[...root.querySelectorAll(SEL)].filter(e=>vis(e)&&!e.closest('[hidden]')&&e.type!=='file'&&e.type!=='hidden')}
let fo=null;
function setFocus(e){if(fo)fo.classList.remove('padfocus');fo=e;if(fo){fo.classList.add('padfocus');try{fo.scrollIntoView({block:'nearest',inline:'nearest'})}catch(_){}}}
const center=e=>{const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2,r]};
function move(dx,dy){const root=layer(),list=focusables(root);if(!list.length)return;
 if(!fo||!list.includes(fo)){const pl=(document.body.classList.contains('msopen')&&list.find(e=>e.classList.contains('mcard')&&e.classList.contains('on')))||list.find(e=>e.id==='play')||list[0];setFocus(pl);return}
 const[cx,cy]=center(fo);let best=null,bs=1e9;
 for(const e of list){if(e===fo)continue;const[x,y]=center(e),ox=x-cx,oy=y-cy;const along=ox*dx+oy*dy;if(along<=2)continue;const perp=Math.abs(ox*dy-oy*dx);const s=along+perp*2.2;if(s<bs){bs=s;best=e}}
 if(best)setFocus(best);else if(dy&&fo.closest('.panel,.pb')){const sc=fo.closest('.pb')||fo.closest('.panel');if(sc)sc.scrollTop+=dy*120}}
function press(){if(!fo||!document.body.contains(fo)||!vis(fo))return;if(window.SFX&&SFX.click&&fo.tagName!=='INPUT')try{SFX.click()}catch(_){}
 if(fo.type==='checkbox'){fo.click();return}if(fo.tagName==='INPUT'&&fo.type==='range')return;if(fo.tagName==='INPUT'){fo.focus();return}fo.click()}
function adjust(dir){if(fo&&fo.tagName==='INPUT'&&fo.type==='range'){const s=+fo.step||1,mn=+fo.min||0,mx=+fo.max||100;fo.value=Math.max(mn,Math.min(mx,+fo.value+dir*s));fo.dispatchEvent(new Event('input',{bubbles:true}));return true}return false}
function back(){const root=layer();const c=root.querySelector&&root.querySelector('.close,#evback,#rvok,#back,#cancel,#pno,#msback,#afkleave');if(c&&vis(c)){c.click();return}
 if(root.id==='pause'){const r=document.getElementById('pres');r&&r.click();return}if(root.classList&&root.classList.contains('screen')&&root.id==='end'){const h=document.getElementById('home');h&&h.click()}}
function tab(dir){const root=layer();const t=[...root.querySelectorAll('.tab,.t2,.seg button')].filter(vis);if(t.length<2)return false;let i=t.findIndex(e=>e.classList.contains('on'));i=(i+dir+t.length)%t.length;t[i].click();return true}
let rsT=0;
function menuNav(now){const dz=.55;let dx=0,dy=0;
 if(Math.abs(S.ry)>.6&&now>rsT&&layer().id==='menu'){rsT=now+500;document.dispatchEvent(new CustomEvent('menuscroll',{detail:S.ry>0?1:-1}))} /* right stick down / up = scroll the lobby (game modes) */
 if(S.b[14]||S.lx<-dz)dx=-1;else if(S.b[15]||S.lx>dz)dx=1;if(S.b[12]||S.ly<-dz)dy=-1;else if(S.b[13]||S.ly>dz)dy=1;
 const d=dx||dy?dx+','+dy:null;
 if(d!==navDir){navDir=d;rep=0;navT=0}
 if(d&&now>=navT){navT=now+(rep++?110:360);if(dx&&adjust(dx)){}else move(dx,dy)}
 for(const i of[0,1,2,3,4,5,9]){if(S.b[i]&&!S.pb[i]){
  if(i===0)press();else if(i===1)back();else if(i===4)tab(-1);else if(i===5)tab(1);else if(i===3&&fo&&fo.tagName==='INPUT'&&fo.type==='range')adjust(1);else if(i===3&&layer().id==='menu')document.dispatchEvent(new CustomEvent('menuscroll',{detail:0}));else if(i===2&&fo&&fo.tagName==='INPUT'&&fo.type==='range')adjust(-1);
  else if(i===9){const p=['play','msplay'].map(x=>document.getElementById(x)).find(x=>x&&vis(x));if(p&&layer().id==='menu')p.click();else{const a=document.getElementById('again');if(a&&vis(a))a.click()}}}}}
/* ---------- main poll ---------- */
const inGame=()=>{const h=document.getElementById('hud');return!!h&&h.classList.contains('on')&&!document.getElementById('pause').classList.contains('on')&&!document.querySelector('.modal.on')};
let lastCtx=null;
function frame(t){requestAnimationFrame(frame);const g=pick();if(!g){S.lx=S.ly=S.rx=S.ry=0;S.b.fill(0);return}
 const a=g.axes||[],b=g.buttons||[];S.lx=a[0]||0;S.ly=a[1]||0;S.rx=a[2]||0;S.ry=a[3]||0;
 S.pb=S.b.slice();for(let i=0;i<S.b.length;i++){const v=b[i];S.b[i]=v?(typeof v=='object'?(v.pressed||v.value>.45?1:0):v?1:0):0}
 S.lt=b[6]?b[6].value:0;S.rt=b[7]?b[7].value:0;if(b[6]&&b[6].value>.3)S.b[6]=1;if(b[7]&&b[7].value>.3)S.b[7]=1;
 const dz=.4,act=Math.hypot(S.lx,S.ly)>dz||Math.hypot(S.rx,S.ry)>dz||S.b.some((v,i)=>v&&!S.pb[i]);
 if(act){lastPadT=Date.now();if(INPUT.dev!=='pad'&&!(INPUT.dev==='touch'&&Date.now()-lastTouchT<500))setDev('pad')}
 if(INPUT.dev!=='pad')return;
 const ctx=inGame();if(ctx!==lastCtx){lastCtx=ctx;if(!ctx){fo&&fo.classList.remove('padfocus');fo=null}}
 if(ctx){for(let i=0;i<S.b.length;i++){if(S.b[i]!==S.pb[i])Q.push({i,d:S.b[i]})}}
 else{menuNav(t);if(fo&&!document.body.contains(fo))fo=null}}
requestAnimationFrame(frame);
addEventListener('blur',()=>{S.b.fill(0)});
})();
