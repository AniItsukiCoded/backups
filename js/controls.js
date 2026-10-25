/* ===== Rebindable controls =====
   Bindings live in CFG.kb as {action:[primary,alt]} (only actions the player changed are stored). CFG.kb is one of the saved
   progress keys (see PROG in main.js), so it is uploaded to the account's cloud save with coins/skins; guests keep it on this device.
   A binding is a KeyboardEvent.code ("KeyW", "Space", ...) or a mouse button ("Mouse0" left, "Mouse1" middle, "Mouse2" right, "Mouse3/4" side buttons). */
const CTL=(()=>{
const ACT=[ /* id, label, group, [primary, alt] defaults */
['fwd','Move forward','Movement',['KeyW','']],['back','Move back','Movement',['KeyS','']],['left','Move left','Movement',['KeyA','']],['right','Move right','Movement',['KeyD','']],
['jump','Jump','Movement',['Space','']],['sprint','Sprint','Movement',['ShiftLeft','']],
['shoot','Shoot','Combat',['Mouse0','']],['aim','Aim / scope','Combat',['Mouse2','']],['reload','Reload','Combat',['KeyR','']],
['w1','Shotgun','Weapons',['Digit1','']],['w2','Assault rifle','Weapons',['Digit2','']],['pick','Pickaxe','Weapons',['KeyF','']],
['wall','Build wall','Building',['KeyZ','']],['floor','Build floor','Building',['KeyX','']],['ramp','Build stairs','Building',['KeyC','']],['roof','Build roof','Building',['KeyV','']],
['build','Build mode (on / off)','Building',['KeyQ','']],['edit','Edit mode','Building',['KeyG','']],['mat','Cycle material','Building',['KeyT','Mouse1']],['mw','Wood','Building',['Digit4','']],['mb','Brick','Building',['Digit5','']],['mm','Metal','Building',['Digit6','']],
['view','First / third person','Other',['KeyB','']],['music','Toggle music','Other',['KeyM','']],['map','Map (Zone Wars)','Other',['KeyN','']],['specN','Spectate: next player','Other',['ArrowRight','']],['specP','Spectate: previous player','Other',['ArrowLeft','']]];
const DEF={};ACT.forEach(a=>DEF[a[0]]=a[3]);
const OK=/^(Mouse[0-6]|[A-Za-z][A-Za-z0-9]{1,19})$/,NONE=[];
const NAMES={Space:'Space',ShiftLeft:'L-Shift',ShiftRight:'R-Shift',ControlLeft:'L-Ctrl',ControlRight:'R-Ctrl',AltLeft:'L-Alt',AltRight:'R-Alt',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backquote:'`',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\',CapsLock:'Caps',Tab:'Tab',Enter:'Enter',Backspace:'⌫'};
const MB=['Left Click','Middle Click','Right Click','Mouse 4','Mouse 5','Mouse 6','Mouse 7'];
let sig=null,MAP={},host=null,L=null,busy=false,cmT=0;
const user=()=>{const k=window.CFG&&CFG.kb;return k&&typeof k=='object'&&!Array.isArray(k)?k:{}};
const label=c=>!c?'':/^Mouse\d$/.test(c)?MB[+c[5]]:/^Key[A-Z]$/.test(c)?c[3]:/^Digit\d$/.test(c)?c[5]:/^Numpad/.test(c)?'Num '+c.slice(6):NAMES[c]||c;
function get(a){const u=user()[a],d=DEF[a]||['',''];return[0,1].map(i=>Array.isArray(u)&&typeof u[i]=='string'&&(u[i]===''||OK.test(u[i]))?u[i]:d[i])}
function rebuild(){const s=JSON.stringify(user());if(s===sig)return;sig=s;MAP={};ACT.forEach(([a])=>get(a).forEach(c=>{if(c)(MAP[c]||(MAP[c]=[])).push(a)}))}
function put(a,g){if(!CFG.kb||typeof CFG.kb!='object'||Array.isArray(CFG.kb))CFG.kb={};if(g[0]===DEF[a][0]&&g[1]===DEF[a][1])delete CFG.kb[a];else CFG.kb[a]=[g[0],g[1]]}
/* bind `code` to action a / slot (0 primary, 1 alt); anything else using that code is unbound. Returns the label of the action it was taken from, if any. */
function set(a,slot,code){let from=null;
if(code)ACT.forEach(([b,lab])=>{const g=get(b);[0,1].forEach(i=>{if(g[i]===code&&!(b===a&&i===slot)){g[i]='';put(b,g);from=from||lab}})});
const g=get(a);g[slot]=code;put(a,g);sig=null;saveCfg();return from}
function reset(){CFG.kb={};sig=null;saveCfg();render()}
const first=a=>{if(window.INPUT&&INPUT.dev==='pad'){const l=INPUT.label(a);if(l)return l}const g=get(a);return label(g[0]||g[1])||'—'};
function stop(){L=null;busy=false;removeEventListener('keydown',kd,true);removeEventListener('mousedown',md,true);clearTimeout(cmT);cmT=setTimeout(()=>removeEventListener('contextmenu',cm,true),400)}
function assign(code){if(!L)return;const{a,i}=L,from=set(a,i,code);stop();render();
if(window.toast){const me=ACT.find(x=>x[0]===a)[1];toast(code?me+' → '+label(code)+(from?' ('+from+' unbound)':''):me+' unbound')}}
function kd(e){e.preventDefault();e.stopPropagation();if(e.repeat)return;if(e.code==='Escape'){stop();render();return}if(e.code==='Delete'||e.code==='Backspace'){assign('');return}if(!OK.test(e.code))return;assign(e.code)}
/* left click binds only when you click the listening box again; any other left click just cancels. Other mouse buttons bind straight away. */
function md(e){if(e.button===0){if(!(e.target.closest&&e.target.closest('.kb.on'))){stop();render()}return}e.preventDefault();e.stopPropagation();assign('Mouse'+e.button)}
function cm(e){e.preventDefault()}
function click(a,i){if(window.SFX)SFX.click();if(L&&L.a===a&&L.i===i){assign('Mouse0');return}
stop();L={a,i};busy=true;addEventListener('keydown',kd,true);addEventListener('mousedown',md,true);addEventListener('contextmenu',cm,true);clearTimeout(cmT);render()}
function render(){if(!host)return;host.textContent='';let grp='';
ACT.forEach(([a,lab,g])=>{if(g!==grp){grp=g;const h=document.createElement('div');h.className='kg';h.textContent=g;host.appendChild(h)}
const r=document.createElement('div');r.className='kr';const s=document.createElement('span');s.textContent=lab;r.appendChild(s);
get(a).forEach((c,i)=>{const on=!!L&&L.a===a&&L.i===i,b=document.createElement('button');b.type='button';b.className='kb'+(on?' on':'')+(!c&&!on?' em':'');b.title=i?'Alternative key':'Main key';b.textContent=on?'Press a key…':label(c)||'—';b.onclick=()=>click(a,i);r.appendChild(b)});host.appendChild(r)})}
function build(el,resetBtn){host=el;if(resetBtn)resetBtn.onclick=()=>{if(window.SFX)SFX.click();reset();if(window.toast)toast('Controls reset to default')};render()}
return{ACT,build,refresh:render,reset,get,set,first,label,acts:c=>(rebuild(),MAP[c]||NONE),get busy(){return busy}}})();
