/* ================= ADMINS / OWNERS =================
   Who is an admin lives in the Firebase Realtime Database (backend), NOT in the code:

       fyusaugczduirdgyfdr / <the part of the email before the @>  =  1      (1 = admin, 0 or missing = not an admin)

   e.g.  jace01b@gmail.com  ->  fyusaugczduirdgyfdr/jace01b = 1.  Use lower case; dots and  # $ [ ] /  are dropped from the key
   (Firebase keys can't contain them), so  jace.01b@gmail.com  ->  "jace01b".
   Every admin is an owner: all skins, infinite coins / candy / keys, never shown on a leaderboard, plus the ADMIN button in the MAIN MENU
   (the panel can't be opened anywhere else and closes the moment you leave the menu).
   Loaded after passes.js (EV) and lobby2.js; main.js waits for it (see sess() in main.js). */
const ADM=(()=>{
const KEY='fyusaugczduirdgyfdr',CAP={c:1e7,o:1e7,k:1000};
const prefix=u=>{if(!u||u.isAnonymous)return'';const em=u.email||((u.providerData||[]).find(p=>p&&p.email)||{}).email||'';return String(em).split('@')[0].toLowerCase().replace(/[.#$\[\]\/]/g,'')};
const tmo=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]);
let pfx='';

/* ---- is this account on the backend list? (runs on every sign-in, BEFORE the cloud save loads so the owner perks apply to it) ---- */
async function check(u){let st=false,known=true;pfx='';
 try{pfx=prefix(u);if(pfx){const v=(await tmo(db.ref(KEY+'/'+pfx).once('value'),6000)).val();st=v===1||v===true||v==='1'}}
 catch(e){known=false;console.warn('Admin check failed (is database.rules.json published?):',e&&e.message)}
 EV.setOwner(st,known);if(!st)$('#admin').classList.remove('on');return st}

/* ---- gift inbox: gifts/<my uid>/<id> = {by,bn,t,candy?,coins?,keys?}. Claimed once (the gift is deleted first, then applied) ---- */
let gOff=null,seen=new Set(),pend=[],pt=0;
function listen(u){gOff&&gOff();gOff=null;seen=new Set();if(!u)return;const r=db.ref('gifts/'+u.uid);
 const h=r.on('child_added',s=>{const g=s.val(),id=s.key;if(!g||typeof g!='object'||seen.has(id))return;seen.add(id);
  s.ref.remove().then(()=>{const a=EV.admin.gift(g);pend.push({n:String(g.bn||'An admin').slice(0,24),a});clearTimeout(pt);pt=setTimeout(flush,600)},()=>{})},e=>console.warn('gift inbox unavailable:',e&&e.message));
 gOff=()=>r.off('child_added',h)}
function flush(){const p=pend;pend=[];if(!p.length)return;const t={c:0,o:0,k:0};p.forEach(x=>{t.c+=x.a.c;t.o+=x.a.o;t.k+=x.a.k});
 const parts=[t.c?t.c.toLocaleString()+' 🍬':'',t.o?t.o.toLocaleString()+' 🪙':'',t.k?t.k+' 🗝️':''].filter(Boolean).join(' + ');
 const who=[...new Set(p.map(x=>x.n))];toast('🎁 '+who.slice(0,2).join(' & ')+(who.length>2?' +'+(who.length-2):'')+' sent you '+(parts||'a gift')+'!');SFX.claim&&SFX.claim()}

/* ================= the panel (main menu only) ================= */
let tgt=null,busy=0;
const cl=(v,m)=>Math.max(0,Math.min(m,Math.floor(+v)||0));
function setTgt(t){tgt=t;$('#admto').textContent=!t?'nobody selected':t.all?'EVERYONE ONLINE':t.name+' ('+t.uid.slice(-4).toUpperCase()+')';
 document.querySelectorAll('#admlist .admp').forEach(b=>b.classList.toggle('on',!!t&&!t.all&&b.dataset.u==t.uid));$('#admall').classList.toggle('on',!!t&&!!t.all)}
function render(list,empty){const box=$('#admlist');box.innerHTML='';
 if(!list.length){const p=document.createElement('p');p.className='sub';p.textContent=empty;box.appendChild(p);return}
 list.forEach(x=>{const b=document.createElement('button');b.className='admp';b.dataset.u=x.uid;const n=document.createElement('b'),s=document.createElement('small');
  n.textContent=x.name;s.textContent='#'+x.uid.slice(-4).toUpperCase();b.append(n,s);b.onclick=()=>{SFX.click();setTgt({uid:x.uid,name:x.name})};box.appendChild(b)});setTgt(tgt)}
const nameOf=(uid,v)=>String(v||'Player').slice(0,24);
async function online(){const box=$('#admlist');box.innerHTML='<p class="sub">Loading online players…</p>';
 try{const s=await tmo(db.ref('presence').once('value'),8000),ids=Object.keys(s.val()||{}).filter(u=>!user||u!==user.uid).slice(0,40);
  const nm_=await Promise.all(ids.map(u=>db.ref('users/'+u+'/name').once('value').then(x=>x.val(),()=>null)));
  render(ids.map((u,i)=>({uid:u,name:nameOf(u,nm_[i])})),'Nobody else is online right now. Search a username to gift an offline player.')}
 catch(e){box.innerHTML='<p class="sub">Could not load players.</p>'}}
async function find(){const q=$('#admq').value.trim();if(!q)return online();const box=$('#admlist');box.innerHTML='<p class="sub">Searching…</p>';
 try{const s=await tmo(db.ref('users').orderByChild('name').startAt(q).endAt(q+'').limitToFirst(15).once('value'),8000),a=[];
  s.forEach(c=>{const v=c.val();if(v&&v.name&&(!user||c.key!==user.uid))a.push({uid:c.key,name:nameOf(c.key,v.name)})});
  render(a,'No player found whose username starts with "'+q+'" (case sensitive).')}
 catch(e){box.innerHTML='<p class="sub">Search unavailable — publish the new database.rules.json (users index on "name").</p>'}}
async function send(){if(!EV.owner()||busy)return;if(!tgt)return toast('Pick who gets the gift first');
 const c=cl($('#admc').value,CAP.c),o=cl($('#admo').value,CAP.o),k=cl($('#admk').value,CAP.k);if(!(c||o||k))return toast('Enter an amount to give');
 busy=1;const btn=$('#admsend');btn.disabled=true;
 try{let ids;if(tgt.all){const s=await tmo(db.ref('presence').once('value'),8000);ids=Object.keys(s.val()||{}).filter(u=>u!==user.uid).slice(0,200)}else ids=[tgt.uid];
  if(!ids.length)return toast('Nobody else is online');
  const g={by:user.uid,bn:nm().slice(0,24),t:firebase.database.ServerValue.TIMESTAMP};if(c)g.candy=c;if(o)g.coins=o;if(k)g.keys=k;
  const r=await Promise.all(ids.map(u=>db.ref('gifts/'+u).push().set(g).then(()=>1,()=>0))),n=r.reduce((a,b)=>a+b,0);
  if(n){SFX.claim&&SFX.claim();toast('🎁 Gift sent to '+(tgt.all?n+' player'+(n==1?'':'s'):tgt.name)+'  ('+[c?c.toLocaleString()+' 🍬':'',o?o.toLocaleString()+' 🪙':'',k?k+' 🗝️':''].filter(Boolean).join(' + ')+')')}
  else toast('Could not send — publish the new database.rules.json first')}
 catch(e){toast('Could not send the gift')}
 finally{busy=0;btn.disabled=false}}

$('#admb').onclick=()=>{if(!EV.owner())return;SFX.click();$('#admwho').textContent='Signed in as '+nm()+' · admin key: '+KEY+'/'+pfx;$('#admin').classList.add('on');online()};
$('#admref').onclick=()=>{SFX.click();$('#admq').value='';online()};
$('#admall').onclick=()=>{SFX.click();setTgt({all:1})};
$('#admfind').onclick=()=>{SFX.click();find()};$('#admq').onkeydown=e=>{if(e.key=='Enter')find()};
$('#admsend').onclick=()=>{SFX.click();send()};
const tool=(btn,inp,fn,msg)=>{$(btn).onclick=()=>{if(!EV.owner())return;SFX.click();fn(inp?+$(inp).value:0);toast(msg(inp?+$(inp).value:0))}};
tool('#admlolb','#admlol',v=>EV.admin.setLol(v),v=>'LOL Pass tier set to '+cl(v,30));
tool('#admspkb','#admspk',v=>EV.admin.setSpooky(v),v=>'Spooky Pass tier set to '+cl(v,30));
tool('#admxpb','#admxp',v=>EV.admin.addXp(v),v=>'+'+cl(v,1e7).toLocaleString()+' XP');
tool('#admrd',null,()=>EV.admin.resetDaily(),()=>'Daily reward, treat & quests reset');
return{check,listen,owner:()=>EV.owner()}})();
