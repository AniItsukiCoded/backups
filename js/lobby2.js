/* ================= LOBBY 2: Fortnite-style game-mode screen + AFK zone =================
   Loaded after main.js and passes.js (uses CFG, saveCfg, saveLocal, ui, toast, show, menu, beginBot, party, EV, SFX, MODES, AFK).
   - Scroll down on the lobby (mouse wheel, trackpad, swipe up, ArrowDown / PageDown, controller right stick down or Y) and the game modes slide up.
     Scroll up / swipe down / Esc / the ⌃ button / controller B brings the lobby back.
   - AFK zone: stand in the zone and every minute you get AFK.candy 🍬 and AFK.coins 🪙 (numbers live in modes.js). */
const LB2=(()=>{
const $=s=>document.querySelector(s);
let isOpen=false,cool=0;

/* ---------- game-mode screen ---------- */
const isOn=()=>$('#menu').classList.contains('on');
const blocked=()=>!isOn()||!!document.querySelector('.modal.on')||$('#reveal').classList.contains('on');
function mInfo(){const M=modeOf(CFG.mode);let h=`<b>${M.ic} ${M.n}</b> · ${M.tag}`;
 if(M.room)h+=`<small>${M.min}–${M.max} players · ${M.rounds} rounds of ${M.roundSec/60} min · join any time, a round starts as soon as 2 players are in. Join mid-round and you spawn next round. No bots.</small>`;
 else if(M.ffa)h+=`<small>${M.min}–${M.max} players per match. Nobody online? Bots fill the lobby and you still earn everything.</small>`;
 else if(M.size>1)h+=`<small>Queue solo and you get matched with teammates, or party up with a friend (the + button in the lobby).</small>`;
 else if(M.map=='box')h+=`<small>Edit and build from the first second. Party up to fight a friend in private.</small>`;
 else h+=`<small>Party up to duel a friend in private, or queue and get a random opponent.</small>`;
 $('#msinfo').innerHTML=h}
function modeShow(){const M=modeOf(CFG.mode);{const b=$('#msbot');if(b)b.style.display=M.room?'none':''}$('#modet').textContent=M.n.toUpperCase();$('#msnow').innerHTML=`<span>${M.ic}</span><b>${M.n}</b>`;mInfo();
 document.querySelectorAll('#mstrack .mcard').forEach(c=>{const on=c.dataset.m==CFG.mode;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)})}
function cards(){const h=$('#mstrack');if(h.dataset.built)return;h.dataset.built=1;
 h.innerHTML=MODE_ORDER.map(id=>{const M=MODES[id];
 return`<button class="mcard" data-m="${id}" style="--c1:${M.c1};--c2:${M.c2}"><i class="mbadge">${M.badge}</i><i class="mchk">✓</i>
<div class="mart"><span class="mg1"></span><span class="mg2"></span><span class="mbig">${M.art}</span></div>
<div class="minfo"><small class="mgrp">${M.grp}</small><b>${M.n}</b><p>${M.tag}</p><div class="mchips"><span>👤 ${M.ffa?M.min+'–'+M.max:M.ppl} players</span><span>🏆 ${M.rule}</span><span>🗺️ ${M.where}</span></div></div></button>`}).join('');
 h.querySelectorAll('.mcard').forEach(b=>b.onclick=()=>pick(b.dataset.m))}
function pick(id,quiet){if(!MODES[id])return;SFX.click();const was=CFG.mode;CFG.mode=id;saveLocal();modeShow();if(!quiet&&was!==id)toast(modeOf(id).n+' selected')}
function center(){const t=$('#mstrack'),c=t.querySelector('.mcard.on');if(c)t.scrollLeft=c.offsetLeft-(t.clientWidth-c.offsetWidth)/2}
function sheet(v,instant){v=!!v;if(v===isOpen)return;isOpen=v;cool=Date.now()+650;document.body.classList.toggle('msopen',v);
 if(v){cards();modeShow();center();requestAnimationFrame(center)}
 if(!instant)SFX.click()}
const toggle=d=>{if(Date.now()<cool)return;sheet(d>0?1:d<0?0:!isOpen)};

/* wheel / trackpad: scroll down = modes, scroll up = back to the lobby */
let wacc=0,wt=0;
addEventListener('wheel',e=>{if(blocked()||e.ctrlKey)return;if(Date.now()-wt>350)wacc=0;wt=Date.now();wacc+=e.deltaY;
 if(Math.abs(wacc)>50){const d=wacc;wacc=0;toggle(d)}},{passive:true});
/* touch: swipe up = modes, swipe down = lobby */
let ty=0,tx=0,tOk=false;
addEventListener('touchstart',e=>{const t=e.touches[0];tOk=isOn()&&!blocked()&&!e.target.closest('input,select,textarea');ty=t.clientY;tx=t.clientX},{passive:true});
addEventListener('touchend',e=>{if(!tOk)return;tOk=false;const t=e.changedTouches[0],dy=ty-t.clientY,dx=tx-t.clientX;
 if(Math.abs(dy)>60&&Math.abs(dy)>Math.abs(dx)*1.3)toggle(dy)},{passive:true});
/* keyboard */
addEventListener('keydown',e=>{if(blocked()||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
 if(e.code=='ArrowDown'||e.code=='PageDown'){if(!isOpen){e.preventDefault();toggle(1)}}
 else if(e.code=='ArrowUp'||e.code=='PageUp'||e.code=='Escape'){if(isOpen){e.preventDefault();toggle(-1)}}
 else if(isOpen&&(e.code=='ArrowLeft'||e.code=='ArrowRight')){e.preventDefault();const i=MODE_ORDER.indexOf(CFG.mode),n=MODE_ORDER[(i+(e.code=='ArrowRight'?1:MODE_ORDER.length-1))%MODE_ORDER.length];pick(n,1);center()}
 else if(isOpen&&e.code=='Enter'&&!e.target.closest('button')){e.preventDefault();$('#msplay').click()}});
/* controller (pad.js sends this: right stick down / up, Y) */
document.addEventListener('menuscroll',e=>{if(blocked())return;toggle(e.detail)});
$('#mhint').onclick=()=>sheet(1);$('#modebox').onclick=()=>sheet(1);$('#msback').onclick=()=>sheet(0);
$('#msplay').onclick=()=>{sheet(0,1);$('#play').click()};
$('#msbot').onclick=()=>{SFX.resume();SFX.click();if(party&&Object.keys(party.m).length>1)return toast('Leave your party to play vs bots');window.touchEnter&&touchEnter();sheet(0,1);beginBot(CFG.mode)};

/* ---------- AFK zone ---------- */
const CIRC=2*Math.PI*52,fmtT=ms=>{ms=Math.max(0,Math.ceil(ms/1000));return Math.floor(ms/60)+':'+String(ms%60).padStart(2,'0')},nf=n=>Math.round(n).toLocaleString();
let A=null,lockT=0;
const LK='afkLock',readLock=()=>{try{return JSON.parse(localStorage[LK]||'null')}catch(e){return null}};
const writeLock=()=>{try{localStorage[LK]=JSON.stringify({id:A.id,t:Date.now()})}catch(e){}};
const dropLock=()=>{try{const l=readLock();if(A&&l&&l.id===A.id)localStorage.removeItem(LK)}catch(e){}};
const ca=()=>CFG.ev&&Number.isFinite(CFG.ev.candy)?CFG.ev.candy:0;
function afkUi(){const ev=EV.on();$('#afkcoins').textContent=nf(CFG.coins);$('#afkcandyn').textContent=nf(ca());$('#afkcandybar').style.display=ev?'':'none';
 $('#afkrc').textContent=ev?'+'+AFK.candy:'—';$('#afkrcs').textContent=ev?'every minute':'during events';$('#afkrk').textContent='+'+AFK.coins;
 $('#afknote').textContent=ev?'Rewards go straight to your account. Keep this tab open.':'Candy drops while a candy event is live — coins drop all the time. Keep this tab open.';
 if(!A)return;$('#afkt').textContent=fmtT(AFK.ms-A.acc);$('#afkarc').style.strokeDashoffset=(CIRC*(A.acc/AFK.ms)).toFixed(1);
 $('#afkel').textContent=fmtT(A.el);$('#afkcn').textContent=nf(A.candy);$('#afkco').textContent=nf(A.coins)}
function fly(txt,cls){const f=$('#afkfx'),e=document.createElement('span');e.className='afkf '+(cls||'');e.textContent=txt;e.style.left=(35+Math.random()*30)+'%';f.appendChild(e);setTimeout(()=>e.remove(),2600)}
function drop(){const co=AFK.coins,c=EV.afkCandy(AFK.candy);CFG.coins+=co;saveCfg();ui();A.coins+=co;A.candy+=c;A.drops++;
 SFX.claim();fly('+'+co+' 🪙','co');if(c)setTimeout(()=>fly('+'+c+' 🍬','cd'),180)}
function afkTick(){if(!A)return;if(!$('#afk').classList.contains('on'))return afkStop(); /* the zone screen was replaced (party closed, sign-out...): stop paying out */
 const n=Date.now();let d=Math.max(0,n-A.last);A.last=n;d=Math.min(d,document.hidden?65000:3000); /* a sleeping laptop / frozen tab can never fast-forward the clock */
 A.acc+=d;A.el+=d;while(A.acc>=AFK.ms){A.acc-=AFK.ms;drop()}
 if(n-lockT>1000){lockT=n;const l=readLock();if(l&&l.id!==A.id&&n-l.t<5000){afkStop();toast('AFK zone is already running in another tab');menu();return}writeLock()}
 afkUi()}
function afkStart(){if(A||!user)return;SFX.resume();SFX.click();const l=readLock(),n=Date.now();
 if(l&&n-l.t<5000)return toast('AFK zone is already running in another tab');
 sheet(0,1);A={id:Math.random().toString(36).slice(2),last:n,acc:0,el:0,candy:0,coins:0,drops:0};lockT=0;writeLock();
 const fx=$('#afkfx');fx.querySelectorAll('i').forEach(x=>x.remove());
 for(let i=0;i<14;i++){const e=document.createElement('i');e.textContent=['🍬','🪙','⭐','🍭','🪙'][i%5];e.style.cssText=`left:${(i*37+11)%96}%;--d:${(7+(i*13)%9)}s;--s:${(18+(i*7)%22)}px;animation-delay:-${(i*5)%11}s`;fx.appendChild(e)}
 show('afk');afkUi();A.tm=setInterval(afkTick,250)}
function afkStop(){if(!A)return;clearInterval(A.tm);dropLock();const s=A;A=null;
 if(s.drops)toast(`AFK zone: +${nf(s.coins)} 🪙`+(s.candy?` +${nf(s.candy)} 🍬`:'')+` in ${fmtT(s.el)}`)}
$('#afkb').onclick=afkStart;
$('#afkleave').onclick=()=>{SFX.click();afkStop();menu()};
$('#afkarc').style.strokeDasharray=CIRC.toFixed(1);
addEventListener('pagehide',()=>{dropLock()});

return{modeShow,sheet,afkStart,afkStop,isOpen:()=>isOpen,afkActive:()=>!!A}})();
