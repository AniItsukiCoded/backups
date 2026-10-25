/* ================= COSMETICS =================
   A skin value is a single number: colour (low 24 bits) + cosmetic id * 2^24.  Because it is one number it travels through the
   existing party / invite / waiting-room data unchanged, so your opponent sees your outfit with no Firebase changes.
   Accessories are authored in "character space": origin at the holder, +Y up, the character faces -Z, +X is its right.
   make(id) -> {head,back,hip,chest:[Object3D], mat(material), upd(t,dt,o)}                                                       */
window.COS=(()=>{
const T=THREE,TAU=Math.PI*2;
const M=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.7,flatShading:true},o));
const BM=(c,o={})=>new T.MeshBasicMaterial(Object.assign({color:c},o));
const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);return o};
const grp=(...a)=>{const g=new T.Group();a.forEach(x=>x&&g.add(x));return g};
const Y=new T.Vector3(0,1,0);
/* thin cylinder between two points */
const bar=(a,b,r,m)=>{const d=b.clone().sub(a),o=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),5),m);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(Y,d.normalize());return o};
const poly=(pts,m)=>{const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));return new T.Mesh(new T.ShapeGeometry(s),m)};
const glowTex=(()=>{let t;return()=>{if(t)return t;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return t=new T.CanvasTexture(c)}})();
const glow=(c,s)=>{const sp=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:c,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));sp.scale.set(s,s,1);return sp};

/* ---------- reusable pieces ---------- */
function pumpkin(s=1,gl=0xffc83a,body=0xff7a12,lite){const g=new T.Group(),mo=M(body,{emissive:0x8a2a00,emissiveIntensity:.55}),rb=M(0xd95a00);
const b=mesh(new T.SphereGeometry(.2,14,12),mo);b.scale.set(1.12,.95,1.1);g.add(b);
if(!lite)for(let i=0;i<4;i++){const r=mesh(new T.TorusGeometry(.2,.012,5,22),rb);r.rotation.y=i*Math.PI/4;r.scale.set(1.12,.95,1.1);g.add(r)}
const st=mesh(new T.CylinderGeometry(.028,.045,.1,6),M(0x3f7d22));st.position.y=.2;st.rotation.z=.2;g.add(st);
const gm=BM(gl),eye=poly([[-.045,-.03],[.045,-.03],[0,.045]],gm);[-1,1].forEach(sx=>{const e=eye.clone();e.position.set(sx*.08,.04,-.222);e.rotation.y=Math.PI;g.add(e)});
const mo2=poly([[-.1,.0],[-.06,-.04],[-.03,-.01],[0,-.045],[.03,-.01],[.06,-.04],[.1,0],[.07,-.075],[-.07,-.075]],gm);mo2.position.set(0,-.045,-.215);mo2.rotation.y=Math.PI;g.add(mo2);
g.scale.setScalar(s);g.userData.glow=gm;return g}
function eyes(c,y=.02,x=.055,z=-.128,r=.016){return grp(...[-1,1].map(s=>mesh(new T.SphereGeometry(r,6,5),BM(c),s*x,y,z)))}
function horn(c,h=.17,r=.035){const g=new T.Group(),m=M(c),a=mesh(new T.ConeGeometry(r,h,6),m,0,h/2,0),b=mesh(new T.ConeGeometry(r*.55,h*.6,6),m,.03,h*.95,0);b.rotation.z=-.5;g.add(a,b);return g}
function ear(c,inner,s=1){const g=new T.Group();g.add(mesh(new T.ConeGeometry(.06*s,.15*s,4),M(c),0,.075*s,0),mesh(new T.ConeGeometry(.032*s,.1*s,4),M(inner),0,.06*s,-.018));return g}
function wingShape(m,sz=1,feather){const pts=feather?[[0,0],[.3,.34],[.75,.5],[1.15,.42],[1.3,.2],[1.2,.0],[1.28,-.2],[1.0,-.3],[1.05,-.5],[.75,-.5],[.7,-.7],[.45,-.55],[.3,-.6],[.15,-.3]]:[[0,0],[.3,.34],[.8,.46],[1.1,.3],[.98,.04],[.86,.14],[.74,-.12],[.56,.0],[.44,-.24],[.26,-.06],[.1,-.2]];
const w=poly(pts,m);w.scale.setScalar(.34*sz);return w}
function wings(c,sz,feather,flap=.22,spd=5){const m=M(c,{side:T.DoubleSide,emissive:feather?0x9aa8c8:0x1a0830,emissiveIntensity:feather?.5:.5}),R=grp(wingShape(m,sz,feather)),L=grp(wingShape(m,sz,feather));L.scale.x=-1;
const pr=grp(R),pl=grp(L);pr.position.x=.07;pl.position.x=-.07;pr.rotation.y=-.5;pl.rotation.y=.5;
const g=grp(pr,pl);return{g,upd:(t,k)=>{const f=Math.sin(t*(spd+k*4))*flap;R.rotation.z=.2+f;L.rotation.z=-.2-f}}}
function capeMesh(c,inner,len=.85,w0=.2,w1=.36){const g=new T.Group(),sh=[[-w0,0],[w0,0],[w1,-len],[-w1,-len]],o=poly(sh,M(inner,{side:T.DoubleSide}));
const back=poly(sh.map(p=>[p[0]*.985,p[1]]),M(c,{side:T.DoubleSide}));back.position.z=.004;g.add(o,back);g.position.set(0,0,.1);return g}
function tail(c,r,n,step,curl,tip){const g=new T.Group(),m=M(c),seg=[];for(let i=0;i<n;i++){const s=mesh(new T.SphereGeometry(r*(1-i/n*.55),6,5),m);g.add(s);seg.push(s)}
let sp=null;if(tip==='spade'){sp=mesh(new T.ConeGeometry(.05,.1,3),M(0xc4161c));g.add(sp)}
const place=t=>{for(let i=0;i<n;i++){seg[i].position.set(Math.sin(t*2.2+i*.55)*.014*i,-.03*i+curl*i*i,.04+step*i)}if(sp){const e=seg[n-1].position;sp.position.set(e.x,e.y+.05,e.z+.02);sp.rotation.x=-1.2}};place(0);return{g,upd:place}}
function flames(n,h,c1,c2){const g=new T.Group(),fl=[];for(let i=0;i<n;i++){const a=i/n*TAU,f=mesh(new T.ConeGeometry(.045,h,5),BM(i%2?c1:c2,{transparent:true,opacity:.9}),Math.cos(a)*.13,h/2,Math.sin(a)*.13);g.add(f);fl.push(f)}
return{g,upd:t=>fl.forEach((f,i)=>{const s=.75+.35*Math.sin(t*9+i*1.7)+.15*Math.sin(t*17+i);f.scale.set(1,s,1);f.position.y=h*s/2})}}
function orbit(n,mk,rad,spd,ymin,ymax){const g=new T.Group(),o=[];for(let i=0;i<n;i++){const m=mk(i);g.add(m);o.push({m,a:i/n*TAU,s:spd*(.7+(i*37%7)/10),y:ymin+(ymax-ymin)*((i*53%10)/10),r:rad*(.8+(i*29%5)/10)})}
return{g,upd:t=>o.forEach(q=>{const a=q.a+t*q.s;q.m.position.set(Math.cos(a)*q.r,q.y+Math.sin(t*2+q.a)*.05,Math.sin(a)*q.r)})}}
function embers(n,c,w,h){const g=new T.Group(),o=[];for(let i=0;i<n;i++){const m=mesh(new T.SphereGeometry(.014,4,4),BM(c,{transparent:true}));g.add(m);o.push({m,p:i/n,x:Math.sin(i*12.9)*w,z:Math.cos(i*7.3)*w*.6})}
return{g,upd:t=>o.forEach((q,i)=>{const p=(t*.45+q.p)%1;q.m.position.set(q.x+Math.sin(t*3+i)*.04,p*h,q.z);q.m.material.opacity=1-p;q.m.scale.setScalar(1.2-p)})}}

/* ---------- v4 helpers: tattered cloth, armour pads, belts, spikes ---------- */
/* raise the lower rim of an open cylinder/cone in a zig-zag so it looks torn (position-based, so the seam stays closed) */
const tatter=(geo,amp,n=9)=>{const p=geo.attributes.position;let lo=1e9;for(let i=0;i<p.count;i++)lo=Math.min(lo,p.getY(i));
for(let i=0;i<p.count;i++)if(p.getY(i)<lo+1e-4){const a=Math.atan2(p.getZ(i),p.getX(i));p.setY(i,p.getY(i)+amp*(.5+.5*Math.sin(a*n)))}p.needsUpdate=true;geo.computeVertexNormals();return geo};
/* hanging cloth: top ring at height y, flattened front-to-back so it hugs the body */
const skirt=(c,rt,rb,len,y,z,mo,amp,n)=>{const m=M(c,Object.assign({side:T.DoubleSide},mo||{})),s=mesh(tatter(new T.CylinderGeometry(rt,rb,len,20,1,true),amp==null?.07:amp,n||9),m,0,y-len/2,z||0);s.scale.z=.82;return s};
const pauldron=(c,s=1,mo)=>grp(...[-1,1].map(sx=>{const p=mesh(new T.SphereGeometry(.1*s,10,8,0,TAU,0,Math.PI*.6),M(c,Object.assign({side:T.DoubleSide},mo||{})),sx*.25,-.07,0);p.rotation.z=-sx*.5;return p}));
const belt=(c,y=-.5,mo)=>{const t=mesh(new T.TorusGeometry(.19,.022,6,22),M(c,mo||{}),0,y,0);t.rotation.x=Math.PI/2;t.scale.set(1,.85,1);return t};
const spike=(c,h,r,x,y,z,rx=0,rz=0,mo)=>{const s=mesh(new T.ConeGeometry(r,h,6),M(c,mo||{}),x,y,z);s.rotation.set(rx,0,rz);return s};
const sheen=(c,s,x,y,z)=>{const g=glow(c,s);g.position.set(x,y,z);return g};
const wrapped=c=>{const g=new T.Group(),m=M(c,{emissive:c,emissiveIntensity:.3});g.add(mesh(new T.SphereGeometry(.05,8,6),m));[-1,1].forEach(s=>{const k=mesh(new T.ConeGeometry(.04,.06,5),m,s*.08,0,0);k.rotation.z=-s*Math.PI/2;g.add(k)});return g};
const gemM=(c,e=.8)=>M(c,{emissive:c,emissiveIntensity:e,roughness:.25,metalness:.2});
const goldM=()=>M(0xffd23f,{metalness:.85,roughness:.25,emissive:0x664400,emissiveIntensity:.45});

/* ---------- catalogue ---------- */
const LIST=[
{id:1,n:'Jack',ico:'🎃',set:'hw',rar:'rare'},{id:2,n:'Witch',ico:'🧙',set:'hw',rar:'rare'},{id:3,n:'Skeleton',ico:'💀',set:'hw',rar:'epic'},
{id:4,n:'Ghost',ico:'👻',set:'hw',rar:'epic'},{id:5,n:'Vampire',ico:'🧛',set:'hw',rar:'epic'},{id:6,n:'Mummy',ico:'🧻',set:'hw',rar:'rare'},
{id:7,n:'Zombie',ico:'🧟',set:'hw',rar:'rare'},{id:8,n:'Devil',ico:'😈',set:'hw',rar:'epic'},{id:9,n:'Bat',ico:'🦇',set:'hw',rar:'epic'},
{id:10,n:'Reaper',ico:'☠️',set:'hw',rar:'legendary'},{id:11,n:'Pumpkin King',ico:'👑',set:'hw',rar:'legendary'},{id:12,n:'Frankenstein',ico:'🔩',set:'hw',rar:'rare'},
{id:13,n:'Candy Corn',ico:'🍬',set:'hw',rar:'rare'},{id:14,n:'Spider',ico:'🕷️',set:'hw',rar:'epic'},{id:15,n:'Werewolf',ico:'🐺',set:'hw',rar:'epic'},{id:16,n:'Black Cat',ico:'🐈‍⬛',set:'hw',rar:'rare'},{id:17,n:'Nightmare King',ico:'👹',set:'hw',rar:'mythic'},{id:18,n:'Spectral Knight',ico:'⚔️',set:'hw',rar:'mythic'},
{id:20,n:'Crown',ico:'👑',set:'bp',rar:'epic'},{id:21,n:'Halo',ico:'😇',set:'bp',rar:'rare'},{id:22,n:'Headphones',ico:'🎧',set:'bp',rar:'rare'},
{id:23,n:'Cyber Visor',ico:'🥽',set:'bp',rar:'epic'},{id:24,n:'Shades',ico:'😎',set:'bp',rar:'common'},{id:25,n:'Angel',ico:'🪽',set:'bp',rar:'legendary'}];
const B={};

B[1]=()=>({head:[pumpkin(1)]});
B[2]=()=>{/* Witch: tall bent hat with wavy brim + star sparkles, shawl, belt, broom and a glowing potion */
const hm=M(0x2a1348),g=new T.Group(),br=mesh(new T.CylinderGeometry(.3,.31,.022,24),hm,0,.1,0);br.rotation.z=.07;
const c1=mesh(new T.CylinderGeometry(.13,.17,.14,14),hm,0,.18,0),c2=mesh(new T.ConeGeometry(.13,.24,14),hm,0,.37,.0);c2.rotation.x=.18;const c3=mesh(new T.ConeGeometry(.055,.2,10),hm,0,.55,.07);c3.rotation.x=.75;
const bd=mesh(new T.CylinderGeometry(.172,.178,.05,14),M(0xff8a1f,{emissive:0xff6a00,emissiveIntensity:.35}),0,.145,0),bk=mesh(new T.BoxGeometry(.075,.06,.014),goldM(),0,.145,-.176),bk2=mesh(new T.BoxGeometry(.04,.032,.016),M(0x2a1348),0,.145,-.178);
g.add(br,c1,c2,c3,bd,bk,bk2);g.position.y=.02;
const hair=grp(...[-1,1].map(s=>{const h=mesh(new T.SphereGeometry(.07,8,6),M(0x7a2cc0),s*.13,-.07,.03);h.scale.set(.7,1.8,.8);return h}));
const sp=orbit(5,()=>glow(0xd79bff,.16),.34,1.4,.15,.62);
const shawl=skirt(0x3b1766,.17,.31,.26,.04,0,{emissive:0x1a0838,emissiveIntensity:.4},.05,8),brooch=mesh(new T.SphereGeometry(.028,8,6),gemM(0x7dff6a,.9),0,-.07,-.17);
const bl=belt(0x2a1348,-.5),bk3=mesh(new T.BoxGeometry(.07,.06,.016),goldM(),0,-.5,-.17);
const broom=new T.Group();broom.add(mesh(new T.CylinderGeometry(.018,.018,1.35,6),M(0x6b4524),0,0,0));const bs=mesh(new T.ConeGeometry(.1,.34,9),M(0xd9a441,{roughness:1}),0,-.78,0);broom.add(bs,mesh(new T.TorusGeometry(.055,.012,5,10),M(0x3a2410),0,-.66,0));broom.children[2].rotation.x=Math.PI/2;broom.rotation.z=.5;broom.position.set(-.02,-.3,.08);
const pot=grp(mesh(new T.SphereGeometry(.055,10,8),M(0x6aff5a,{emissive:0x2aff2a,emissiveIntensity:.8,transparent:true,opacity:.9}),0,0,0),mesh(new T.CylinderGeometry(.016,.02,.05,6),M(0x6b4524),0,.07,0),sheen(0x7dff6a,.32,0,0,0));pot.position.set(.25,.0,-.1);
return{head:[g,hair,sp.g,eyes(0xb26bff,.0,.052,-.128,.018)],chest:[shawl,brooch,bl,bk3],back:[broom],hip:[pot],upd:(t,dt,o)=>{sp.upd(t);pot.position.y=Math.sin(t*2.2)*.01;pot.children[0].material.emissiveIntensity=.6+.3*Math.sin(t*3)}}};
B[3]=()=>{/* Skeleton: skull, ribcage, collar bones, pelvis, drifting green soul-light */
const g=new T.Group(),bone=M(0xf1ecd8,{roughness:.8}),sk=mesh(new T.SphereGeometry(.17,14,12),bone);sk.scale.set(.86,1,.96);g.add(sk);
const so=M(0x0a0a10);[-1,1].forEach(s=>{const e=mesh(new T.SphereGeometry(.04,8,6),so,s*.06,.025,-.15);e.scale.z=.5;g.add(e,mesh(new T.SphereGeometry(.016,6,5),BM(0x7dff9a),s*.06,.025,-.172),sheen(0x7dff9a,.26,s*.06,.025,-.18))});
const ns=mesh(new T.ConeGeometry(.018,.04,3),so,0,-.03,-.165);ns.rotation.x=Math.PI;g.add(ns);
const jw=mesh(new T.BoxGeometry(.14,.05,.1),bone,0,-.14,-.07);g.add(jw);for(let i=-2;i<=2;i++)g.add(mesh(new T.BoxGeometry(.006,.05,.102),so,i*.028,-.14,-.07));
const cr=mesh(new T.BoxGeometry(.016,.01,.03),so,0,.15,-.1);cr.rotation.x=.3;g.add(cr);
const chest=grp();for(let i=0;i<5;i++)[-1,1].forEach(s=>{const r=mesh(new T.BoxGeometry(.13-i*.006,.016,.024),bone,s*(.09-i*.004),-.07-i*.052,-.152);r.rotation.z=s*.08;chest.add(r)});
chest.add(mesh(new T.BoxGeometry(.02,.28,.022),bone,0,-.16,-.155));
[-1,1].forEach(s=>chest.add(bar(new T.Vector3(s*.03,-.03,-.15),new T.Vector3(s*.2,-.05,-.12),.012,bone)));
const pel=grp(mesh(new T.BoxGeometry(.28,.07,.15),bone,0,-.03,-.1),...[-1,1].map(s=>{const w=mesh(new T.CylinderGeometry(.07,.06,.08,8),bone,s*.12,.0,-.1);w.scale.z=.7;return w}));
const em=embers(9,0x7dff9a,.26,1.1);em.g.position.set(0,-.9,-.1);
return{head:[g],chest:[chest],hip:[pel,em.g],upd:t=>em.upd(t)}};
B[4]=()=>{/* Ghost: translucent hooded sheet with a torn hem, glowing halo of wisps */
const f=eyes(0x10101a,.02,.05,-.127,.018);f.children.forEach(e=>e.scale.set(.8,1.5,.5));const mo=mesh(new T.SphereGeometry(.024,8,6),BM(0x10101a),0,-.055,-.128);mo.scale.set(1,1.4,.4);
const orb=orbit(8,i=>glow(i%2?0x9fd6ff:0xffffff,.24),.52,1.1,.2,1.5),sheetM={transparent:true,opacity:.5,emissive:0x8aa8ff,emissiveIntensity:.55,depthWrite:false};
const dome=mesh(new T.SphereGeometry(.205,14,10,0,TAU,0,Math.PI*.62),M(0xe8f0ff,Object.assign({side:T.DoubleSide},sheetM)),0,.0,.0);dome.scale.set(.95,1.02,1.02);
const sheet=skirt(0xe8f0ff,.2,.43,1.2,.0,0,sheetM,.16,7),aura=glow(0x9fd6ff,1.5);aura.position.y=-.3;
const wp=grp(f,mo);
return{head:[wp,dome],chest:[sheet,aura],hip:[orb.g],mat:m=>{m.transparent=true;m.opacity=.7;m.emissive.set(0x6688ff);m.emissiveIntensity=.5;m.side=T.FrontSide},upd:(t,d,o)=>{orb.upd(t);sheet.rotation.z=Math.sin(t*1.3)*.03;sheet.scale.set(1+Math.sin(t*2)*.02,1,1)}}};
B[5]=()=>{/* Vampire: slicked hair, high collar, crimson-lined cape, vest and ruby brooch */
const cape=capeMesh(0x1a0610,0xa00c26,1.0,.2,.44),fang=grp(...[-1,1].map(s=>{const f=mesh(new T.ConeGeometry(.011,.04,4),M(0xffffff),s*.03,-.078,-.13);f.rotation.x=Math.PI;return f}));
const col=grp(...[-1,1].map(s=>{const c=poly([[0,0],[s*.17,.03],[s*.06,.24]],M(0x1a0610,{side:T.DoubleSide,emissive:0x400010,emissiveIntensity:.3}));c.position.set(0,-.05,.11);return c}));
const hair=mesh(new T.SphereGeometry(.175,14,10,0,TAU,0,Math.PI*.55),M(0x0a0608,{roughness:.4}),0,.015,.012);hair.rotation.x=-.28;hair.scale.set(.92,1,1.02);
const peak=poly([[-.06,0],[0,-.045],[.06,0],[0,.03]],M(0x0a0608,{side:T.DoubleSide}));peak.position.set(0,.115,-.15);peak.rotation.set(-.35,Math.PI,0);
const vest=mesh(new T.BoxGeometry(.27,.34,.02),M(0x2a0a14,{roughness:.5}),0,-.2,-.148),bt=[0,1,2].map(i=>mesh(new T.SphereGeometry(.014,6,5),goldM(),0,-.14-i*.07,-.162));
const ruby=mesh(new T.SphereGeometry(.026,8,6),gemM(0xff2a3a,1),0,-.05,-.165),rg=mesh(new T.TorusGeometry(.03,.007,5,12),goldM(),0,-.05,-.163);
return{head:[fang,eyes(0xff2a3a,.02,.05,-.128,.015),col,hair,peak,sheen(0xff2a3a,.18,-.05,.02,-.14),sheen(0xff2a3a,.18,.05,.02,-.14)],chest:[vest,...bt,ruby,rg,sheen(0xff2a3a,.2,0,-.05,-.18)],back:[cape],upd:(t,d,o)=>{cape.rotation.x=-.1-.05*Math.sin(t*2)-(o.k||0)*.25;ruby.material.emissiveIntensity=.7+.4*Math.sin(t*2.5)}}};
B[6]=()=>{/* Mummy: layered wraps, glowing eyes and loose bandage tails */
const m=M(0xd8c8a0,{roughness:1}),h=grp();[-.12,-.085,-.05,.07,.1,.13,.155].forEach((y,i)=>{const r=mesh(new T.TorusGeometry(.128-Math.abs(y)*.16,.017,5,18),m,0,y,0);r.rotation.x=Math.PI/2+(i%2?.12:-.1);r.rotation.z=i*.4;h.add(r)});
const ch=grp();[0,-.07,-.14,-.21,-.28,-.35,-.42].forEach((y,i)=>{const r=mesh(new T.TorusGeometry(.19,.018,5,20),m,0,y,0);r.rotation.x=Math.PI/2+(i%2?.1:-.08);r.rotation.z=i;r.scale.set(1,.88,1);ch.add(r)});
const x1=mesh(new T.BoxGeometry(.012,.5,.01),m,.06,-.2,-.168);x1.rotation.z=.6;const x2=x1.clone();x2.rotation.z=-.6;x2.position.x=-.06;ch.add(x1,x2);
const strip=(x,y,z,len)=>{const s=mesh(new T.PlaneGeometry(.05,len),M(0xcdbb90,{side:T.DoubleSide,roughness:1}),x,y-len/2,z);return s};
const tl=[strip(.17,-.35,-.05,.4),strip(-.2,-.3,-.04,.3)],bk=[strip(-.08,-.1,.03,.55),strip(.05,-.1,.03,.45),strip(.14,-.1,.03,.35)];
const hs=grp(strip(.11,.0,.09,.22),strip(-.1,-.02,.09,.18));
return{head:[h,hs,eyes(0xff3030,.045,.05,-.13,.014),sheen(0xff3030,.2,-.05,.045,-.14),sheen(0xff3030,.2,.05,.045,-.14)],chest:[ch,...tl],back:bk,upd:t=>{[...tl,...bk,...hs.children].forEach((s,i)=>{s.rotation.x=Math.sin(t*2.4+i*1.3)*.18;s.rotation.z=Math.sin(t*1.7+i)*.1})}}};
B[7]=()=>{/* Zombie: torn shirt, rib wound, patchy hair, dark stitched mouth */
const st=M(0x1c1410),sc=mesh(new T.BoxGeometry(.12,.012,.01),st,.03,-.07,-.13),bx=grp(sc);for(let i=0;i<4;i++)bx.add(mesh(new T.BoxGeometry(.006,.03,.01),st,-.02+i*.025,-.07,-.13));
const dk=grp(...[-1,1].map(s=>{const d=mesh(new T.SphereGeometry(.034,8,6),M(0x2a3a1c),s*.052,.022,-.118);d.scale.set(1,.8,.3);return d}));
const fl=orbit(5,()=>mesh(new T.SphereGeometry(.012,4,4),BM(0x050505)),.22,5,.02,.25);
const hair=grp(...[[-.07,.15],[.0,.17],[.08,.14]].map(([x,y],i)=>spike(0x2a2218,.1,.02,x,y,.0,.2,x*-2)));
const shirt=skirt(0x4a5668,.205,.225,.42,-.02,0,{roughness:1},.09,7),wound=mesh(new T.CircleGeometry(.055,10),BM(0x5a0a10),.08,-.16,-.17);wound.rotation.y=Math.PI;wound.scale.y=1.3;
const rb=[0,1,2].map(i=>mesh(new T.BoxGeometry(.07,.012,.01),M(0xe8e0c0),.08,-.2+i*.04,-.172));
const stain=mesh(new T.CircleGeometry(.07,8),BM(0x3a0a0a),-.09,-.3,-.172);stain.rotation.y=Math.PI;
return{head:[bx,dk,hair,eyes(0xe8ff80,.022,.052,-.127,.01),fl.g,sheen(0xc8ff60,.18,-.052,.022,-.13),sheen(0xc8ff60,.18,.052,.022,-.13)],chest:[shirt,wound,...rb,stain],upd:fl.upd}};
B[8]=()=>{/* Devil: big glowing horns, brows, goatee, bat wings, pitchfork, tail and embers */
const hn=[-1,1].map(s=>{const h=horn(0xc4161c,.26,.045);h.position.set(s*.08,.12,-.02);h.rotation.z=-s*.32;return h}),tl=tail(0xc4161c,.026,10,.05,.006,'spade');
const br=grp(...[-1,1].map(s=>{const b=mesh(new T.BoxGeometry(.065,.014,.012),M(0x5a0008),s*.055,.065,-.132);b.rotation.z=s*.35;return b}));
const gt=mesh(new T.ConeGeometry(.03,.09,5),M(0x5a0008),0,-.17,-.1);gt.rotation.x=Math.PI+.2;
const w=wings(0x8a0c14,1.05,false,.2,4);w.g.position.y=-.1;
const pf=new T.Group();pf.add(mesh(new T.CylinderGeometry(.014,.014,1.5,6),M(0x2a1a14,{metalness:.5}),0,0,0),mesh(new T.BoxGeometry(.2,.02,.02),M(0xb0b8c8,{metalness:.8}),0,.78,0));[-1,0,1].forEach(s=>pf.add(mesh(new T.ConeGeometry(.018,.16,5),M(0xd0d8e8,{metalness:.8,roughness:.3,emissive:0x802020,emissiveIntensity:.4}),s*.09,.87,0)));pf.rotation.z=-.45;pf.position.set(.1,-.3,.28);
const em=embers(10,0xff6a1a,.3,1.0);em.g.position.set(0,-.9,-.1);
const bl=belt(0x3a0a10,-.5,{metalness:.4}),bk=mesh(new T.BoxGeometry(.07,.06,.016),goldM(),0,-.5,-.17);
return{head:[...hn,br,gt,eyes(0xffd23f,.022,.052,-.128,.015),sheen(0xff5a1a,.3,-.052,.022,-.14),sheen(0xff5a1a,.3,.052,.022,-.14)],chest:[bl,bk],back:[w.g,pf],hip:[tl.g,em.g],upd:(t,d,o)=>{tl.upd(t);em.upd(t);w.upd(t,o.k||0)}}};
B[9]=()=>{/* Bat: big wings, fur ruff, fangs and a few little bats circling */
const w=wings(0x2b1d46,1.55,false,.28,5),ear1=[-1,1].map(s=>{const e=ear(0x2b1d46,0xc07aa8,1.25);e.position.set(s*.085,.13,-.01);e.rotation.z=-s*.14;return e});
const mini=[];const swarm=new T.Group();for(let i=0;i<4;i++){const b=bat(.28);swarm.add(b);mini.push({b,a:i/4*TAU,r:.55+i*.04,y:.3+i*.28})}
const rf=new T.Group();for(let i=0;i<14;i++){const a=i/14*TAU,c=spike(0xe9dff2,.13,.038,Math.cos(a)*.15,-.03,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*1.2;c.rotation.x=Math.sin(a)*1.2;rf.add(c)}
const fang=grp(...[-1,1].map(s=>{const f=mesh(new T.ConeGeometry(.01,.035,4),M(0xffffff),s*.028,-.075,-.13);f.rotation.x=Math.PI;return f})),nose=mesh(new T.SphereGeometry(.014,6,5),M(0xe86a98),0,-.035,-.14);
return{head:[...ear1,fang,nose,eyes(0xff4d6d,.025,.05,-.128,.014),sheen(0xff4d6d,.2,-.05,.025,-.14),sheen(0xff4d6d,.2,.05,.025,-.14)],chest:[rf],back:[w.g],hip:[swarm],upd:(t,d,o)=>{w.upd(t,o.k||0);mini.forEach((q,i)=>{const a=q.a+t*1.1;q.b.position.set(Math.cos(a)*q.r,q.y+Math.sin(t*2+i)*.06,Math.sin(a)*q.r);q.b.rotation.y=-a;q.b.userData.flap(t*12+i)})}}};
B[10]=()=>{/* Reaper: hooded skull-face, torn double cloak, scythe, purple smoke */
const blk=M(0x0b0b12),hd=mesh(new T.SphereGeometry(.185,12,10),blk);hd.scale.set(.98,1.04,1.04);hd.position.y=.01;
const pk=mesh(new T.ConeGeometry(.1,.3,8),blk,0,.1,.15);pk.rotation.x=-1.15;const cl=mesh(new T.CylinderGeometry(.17,.3,.24,10),blk,0,-.2,0);
const fc=mesh(new T.SphereGeometry(.12,10,8),M(0x000000),0,.0,-.07);fc.scale.set(.95,1.05,.8);
const g1=glow(0xff5a1a,.1),g2=glow(0xff5a1a,.1);g1.position.set(-.05,.015,-.17);g2.position.set(.05,.015,-.17);
const sc=grp(bar(new T.Vector3(.3,-.6,.06),new T.Vector3(-.12,.62,.06),.014,M(0x3a2a1c)));const sil=M(0xcfd6ee,{metalness:.7,roughness:.3,emissive:0x334466,emissiveIntensity:.6});
const arc=[[-.12,.62],[-.2,.74],[-.34,.78],[-.46,.7],[-.5,.58]];for(let i=0;i<arc.length-1;i++)sc.add(bar(new T.Vector3(arc[i][0],arc[i][1],.06),new T.Vector3(arc[i+1][0],arc[i+1][1],.06),.017-i*.003,sil));
const cloak=skirt(0x0b0b12,.2,.46,1.05,-.04,0,{roughness:1},.2,8),cloak2=skirt(0x1a1226,.205,.4,.8,-.06,0,{roughness:1,emissive:0x1a0838,emissiveIntensity:.5},.14,6);
const sh=pauldron(0x15101f,1.15,{roughness:.9}),sm=orbit(6,()=>glow(0x7a3aff,.5),.4,.8,-1.2,-.2);
return{head:[hd,pk,cl,fc,g1,g2,eyes(0xff7a1a,.015,.05,-.17,.013)],chest:[cloak,cloak2,sh,sm.g],back:[sc],upd:t=>{const s=.1+.025*Math.sin(t*5);g1.scale.set(s,s,1);g2.scale.set(s,s,1);sm.upd(t);cloak.rotation.z=Math.sin(t*1.2)*.025}}};
B[11]=()=>{/* Pumpkin King: flaming pumpkin head, gold crown, pumpkin pauldrons and buckle, ember cape */
const pm=pumpkin(1.12,0xff5a1a,0xff6a0a),fl=flames(7,.2,0xffd23f,0xff5a1a);fl.g.position.y=.27;const crown=mesh(new T.CylinderGeometry(.14,.16,.05,10,1,true),M(0x2a1a08,{metalness:.7,side:T.DoubleSide,emissive:0x553300,emissiveIntensity:.6}),0,.26,0);
const pts=grp(...[...Array(8)].map((_,i)=>{const a=i/8*TAU;return spike(0xffd23f,.09,.02,Math.cos(a)*.15,.31,Math.sin(a)*.15,0,0,{metalness:.8,emissive:0x664400,emissiveIntensity:.5})}));
const cape=capeMesh(0x2a0f44,0xff6a0a,1.0,.2,.44),em=embers(12,0xffa030,.32,.9);em.g.position.y=-.1;
const sp=grp(...[-1,1].map(s=>{const p=pumpkin(.55,0xffc83a,0xff7a12,true);p.position.set(s*.28,-.04,0);return p}));
const bl=belt(0x2a1a08,-.5,{metalness:.5}),bp=pumpkin(.42,0xffc83a,0xff7a12,true);bp.position.set(0,-.5,-.19);
return{head:[pm,fl.g,crown,pts,glow(0xff7a1a,.9),em.g],chest:[sp,bl,bp],back:[cape],upd:(t,d,o)=>{fl.upd(t);em.upd(t);cape.rotation.x=-.1-.05*Math.sin(t*2)-(o.k||0)*.25}}};
B[12]=()=>{/* Frankenstein: flat head, forehead stitches, neck bolts with sparks, patched jacket */
const top=mesh(new T.BoxGeometry(.27,.1,.26),M(0x15151c),0,.16,0),bolt=[-1,1].map(s=>{const g=grp(mesh(new T.CylinderGeometry(.015,.015,.09,6),M(0xb0b8c8,{metalness:.8,roughness:.3}),0,0,0),mesh(new T.SphereGeometry(.025,6,5),M(0xb0b8c8,{metalness:.8}),s*.045,0,0));g.children[0].rotation.z=Math.PI/2;g.position.set(s*.13,-.06,-.01);return g});
const sc=mesh(new T.BoxGeometry(.12,.014,.01),M(0x5a1a1a),.0,.095,-.13),st=grp(sc);for(let i=0;i<5;i++)st.add(mesh(new T.BoxGeometry(.006,.04,.01),M(0x2a0a0a),-.05+i*.025,.095,-.13));
const brow=mesh(new T.BoxGeometry(.2,.03,.02),M(0x6a9a5a),0,.055,-.14);
const jacket=skirt(0x2a2a3a,.21,.23,.52,.0,0,{roughness:.9},.04,8),lap=grp(...[-1,1].map(s=>{const l=poly([[0,0],[s*.1,.02],[s*.04,-.3]],M(0x3c3c52,{side:T.DoubleSide}));l.position.set(0,-.02,-.165);l.rotation.y=Math.PI;return l}));
const sp=[-1,1].map(s=>glow(0x7fe8ff,.3));sp[0].position.set(-.13,-.06,-.01);sp[1].position.set(.13,-.06,-.01);
const bt=[0,1,2].map(i=>mesh(new T.SphereGeometry(.014,6,5),M(0xb0b8c8,{metalness:.8}),.0,-.18-i*.1,-.172));
return{head:[top,...bolt,st,brow,...sp,eyes(0xf0f0d0,.02,.05,-.127,.012)],chest:[jacket,lap,...bt],upd:t=>sp.forEach((s,i)=>{const k=.18+.2*Math.max(0,Math.sin(t*14+i*2.1)*Math.sin(t*5+i));s.scale.set(k,k,1)})}};
B[13]=()=>{/* Candy Corn: striped cone hat, candy-corn striped torso and orbiting wrapped sweets */
const g=new T.Group();[[.15,.11,.12,0xffd23f,.16],[.11,.075,.1,0xff8a1f,.255],[.075,.012,.1,0xfafafa,.35]].forEach(([rb,rt,h,c,y])=>{const s=mesh(new T.CylinderGeometry(rt,rb,h,14),M(c,{emissive:c,emissiveIntensity:.2}),0,y,0);g.add(s)});g.rotation.z=.12;
const ch=grp();[[-.06,0xffd23f],[-.15,0xff8a1f],[-.24,0xfafafa],[-.33,0xffd23f],[-.42,0xff8a1f]].forEach(([y,c])=>{const r=mesh(new T.TorusGeometry(.19,.036,6,22),M(c,{emissive:c,emissiveIntensity:.25}),0,y,0);r.rotation.x=Math.PI/2;r.scale.set(1,.86,1);ch.add(r)});
const or=orbit(5,i=>wrapped([0xff4d6d,0x7dff6a,0xffd23f,0xa65cff,0x4dd2ff][i]),.5,1.2,.0,1.1);
return{head:[g,eyes(0x2a1a10,.02,.05,-.128,.014),sheen(0xffd23f,.4,0,.25,0)],chest:[ch],hip:[or.g],upd:or.upd}};
B[14]=()=>{/* Spider: many eyes, fangs, red hourglass, web cape and eight legs */
const m=M(0x14141c),legs=[];const g=new T.Group();
for(let s=-1;s<=1;s+=2)for(let i=0;i<4;i++){const z=(i-1.5)*.12,P=[[0,0,0],[s*.26,.26+i*.03,.05+z*.4],[s*.52,.14,.12+z*.9],[s*.66,-.34,.16+z*1.1]].map(p=>new T.Vector3(...p)),lg=new T.Group();for(let k=0;k<3;k++)lg.add(bar(P[k],P[k+1],.015,m));lg.position.set(s*.08,0,.04);g.add(lg);legs.push({lg,i,s})}
const hg=mesh(new T.SphereGeometry(.055,8,6),M(0x14141c),0,-.15,.08);hg.scale.set(1,1.3,1);g.add(hg,mesh(new T.BoxGeometry(.02,.03,.01),BM(0xff2a2a),0,-.16,.13));
const ey=grp(...[[-.035,.075],[.035,.075],[-.065,.045],[.065,.045],[-.02,.04],[.02,.04]].map((p,i)=>mesh(new T.SphereGeometry(i<4?.013:.009,5,4),BM(0xff2a3a),p[0],p[1]+.04,-.128)));
const fg=grp(...[-1,1].map(s=>{const f=mesh(new T.ConeGeometry(.012,.06,4),M(0x2a2a30),s*.025,-.085,-.125);f.rotation.x=Math.PI+.25;return f}));
const hr=poly([[-.045,.07],[.045,.07],[0,0],[.045,-.07],[-.045,-.07],[0,0]],BM(0xff2a2a,{side:T.DoubleSide}));hr.position.set(0,-.2,-.168);hr.rotation.y=Math.PI;
const web=new T.Group();for(let i=0;i<8;i++){const a=i/8*TAU;web.add(bar(new T.Vector3(0,0,0),new T.Vector3(Math.cos(a)*.34,Math.sin(a)*.34,0),.004,BM(0xdfe6f0,{transparent:true,opacity:.7})))}[.12,.22,.32].forEach(r=>{const t=mesh(new T.TorusGeometry(r,.0035,3,8),BM(0xdfe6f0,{transparent:true,opacity:.6}));t.rotation.z=Math.PI/8;web.add(t)});web.position.set(0,-.25,.05);
return{head:[ey,fg],chest:[hr],back:[g,web],upd:t=>legs.forEach(q=>{q.lg.rotation.z=q.s*(Math.sin(t*3+q.i*.9)*.07);q.lg.rotation.y=q.s*Math.sin(t*3+q.i*.9)*.08})}};
B[15]=()=>{/* Werewolf: shaggy mane, ears, long snout with teeth, chest fur, tail */
const fur=0x6b4a2b,ea=[-1,1].map(s=>{const e=ear(fur,0x3a2a1a,1.4);e.position.set(s*.085,.13,.0);e.rotation.z=-s*.2;return e}),tl=tail(fur,.04,10,.055,.004);
const sn=mesh(new T.ConeGeometry(.055,.13,7),M(0x5a3d22),0,-.04,-.17);sn.rotation.x=-Math.PI/2;
const jaw=mesh(new T.BoxGeometry(.085,.025,.1),M(0x4a3018),0,-.095,-.15),teeth=grp(...[-2,-1,0,1,2].map(i=>{const t=mesh(new T.ConeGeometry(.008,.026,4),M(0xffffff),i*.016,-.075,-.19);t.rotation.x=Math.PI;return t}));
const mane=new T.Group();for(let i=0;i<16;i++){const a=i/16*TAU,c=spike(i%2?0x7a5a36:0x5a3d22,.16,.04,Math.cos(a)*.17,.0,Math.sin(a)*.14);c.rotation.z=-Math.cos(a)*1.25;c.rotation.x=Math.sin(a)*1.25;mane.add(c)}
const tufts=grp(...[[-.1,-.1],[.1,-.1],[0,-.18],[-.12,-.24],[.12,-.24],[0,-.3]].map(([x,y])=>spike(0x7a5a36,.12,.035,x,y,-.16,-Math.PI/2.4,0)));
return{head:[...ea,sn,jaw,teeth,mesh(new T.SphereGeometry(.016,5,4),BM(0x0a0a0a),0,-.04,-.235),eyes(0xffd23f,.03,.052,-.127,.016),sheen(0xffd23f,.2,-.052,.03,-.14),sheen(0xffd23f,.2,.052,.03,-.14)],chest:[mane,tufts],hip:[tl.g],upd:tl.upd}};
B[16]=()=>{/* Black Cat: bell collar, white chest patch, whiskers, slit eyes, long swishing tail */
const ea=[-1,1].map(s=>{const e=ear(0x181820,0xe48aa8,1.15);e.position.set(s*.085,.14,-.02);e.rotation.z=-s*.12;return e}),tl=tail(0x181820,.028,13,.04,.009),wh=grp();
[-1,1].forEach(s=>[-.02,0,.02].forEach(y=>wh.add(bar(new T.Vector3(s*.05,-.05+y,-.13),new T.Vector3(s*.2,-.05+y*2.5,-.12),.002,BM(0xe0e0e0)))));
const slit=grp(...[-1,1].map(s=>{const k=mesh(new T.BoxGeometry(.007,.032,.006),BM(0x050508),s*.05,.025,-.136);return k})),nose=mesh(new T.SphereGeometry(.014,6,5),M(0xe86a98),0,-.025,-.138);
const collar=mesh(new T.TorusGeometry(.105,.018,6,18),M(0xc4161c,{emissive:0x500008,emissiveIntensity:.5}),0,.02,0);collar.rotation.x=Math.PI/2;
const bell=mesh(new T.SphereGeometry(.028,8,6),goldM(),0,-.0,-.115),patch=mesh(new T.CircleGeometry(.06,12),BM(0xf2f2f8),0,-.12,-.16);patch.rotation.y=Math.PI;patch.scale.y=1.5;
return{head:[...ea,wh,nose,slit,eyes(0x7dff6a,.025,.05,-.128,.015),sheen(0x7dff6a,.2,-.05,.025,-.14),sheen(0x7dff6a,.2,.05,.025,-.14)],chest:[collar,bell,patch],hip:[tl.g],upd:tl.upd}};
B[17]=()=>{/* Nightmare King: skeletal horned tyrant with spiked crown, shoulder spikes, flame, orbiting rings and pumpkins */
const sk=B[3](),fl=flames(9,.32,0xff4dd2,0x8a2aff),cape=capeMesh(0x12081f,0x8a2aff,1.15,.22,.52),em=embers(16,0xff4dd2,.38,1.0),hn=[-1,1].map(s=>{const h=horn(0x2a1040,.26,.045);h.position.set(s*.1,.12,0);h.rotation.z=-s*.5;return h}),or=orbit(3,()=>pumpkin(.3,0xff4dd2,0x8a2aff),.5,1.4,.1,.5);fl.g.position.y=.3;em.g.position.y=-.1;
const crown=grp(...[...Array(7)].map((_,i)=>{const a=i/7*TAU;return spike(0x8a2aff,.14,.025,Math.cos(a)*.13,.2,Math.sin(a)*.13,0,0,{metalness:.7,emissive:0xff4dd2,emissiveIntensity:.7})}));
const sps=grp(...[-1,1].flatMap(s=>[0,1,2].map(i=>spike(0x2a1040,.2-i*.03,.035,s*(.24+i*.03),-.02+i*.04,0,0,-s*(1.1+i*.2),{metalness:.5,emissive:0x8a2aff,emissiveIntensity:.5}))));
const rg=[0,1].map(i=>{const t=mesh(new T.TorusGeometry(.5+i*.12,.008,4,32),BM(i?0x8a2aff:0xff4dd2,{transparent:true,opacity:.75}),0,.2+i*.25,0);t.rotation.x=Math.PI/2;return t});
return{head:[...sk.head,fl.g,...hn,crown,glow(0xff4dd2,1.1),em.g],chest:[...sk.chest,sps],back:[cape],hip:[or.g,...rg,...sk.hip],mat:m=>{m.emissive.set(0x3a0a60);m.emissiveIntensity=.45},upd:(t,d,o)=>{fl.upd(t);em.upd(t);or.upd(t);sk.upd&&sk.upd(t);rg[0].rotation.z=t*.8;rg[1].rotation.z=-t*.6;rg.forEach((r,i)=>r.rotation.x=Math.PI/2+Math.sin(t*1.3+i)*.12);cape.rotation.x=-.1-.05*Math.sin(t*2)-(o.k||0)*.25}}};
B[18]=()=>{/* Spectral Knight: ghostly armour (helm plume, pauldrons, glowing breastplate), spirit sword, wings, flame */
const sk=B[3](),fl=flames(7,.24,0x7dffea,0x2a8aff),w=wings(0xbfe9ff,1.4,true,.18,3),orb=orbit(6,i=>glow(i%2?0x7dffea:0xffffff,.24),.55,1,.2,1.6);fl.g.position.y=.26;
const st={metalness:.85,roughness:.28,emissive:0x2a6aff,emissiveIntensity:.45},pl=pauldron(0x9ec9ff,1.3,st);
const plate=mesh(new T.BoxGeometry(.31,.34,.05),M(0x9ec9ff,st),0,-.2,-.158),em=poly([[0,.07],[.05,0],[0,-.07],[-.05,0]],BM(0x7dffea,{side:T.DoubleSide}));em.position.set(0,-.2,-.188);em.rotation.y=Math.PI;
const bl=belt(0x6aa6ff,-.5,st),plume=new T.Group();for(let i=0;i<5;i++){const p=mesh(new T.ConeGeometry(.04,.3-i*.03,5),M(0x7dffea,{emissive:0x7dffea,emissiveIntensity:.7,transparent:true,opacity:.85}),0,.2+i*.02,.05+i*.04);p.rotation.x=.9+i*.12;plume.add(p)}
const sw=new T.Group();sw.add(mesh(new T.BoxGeometry(.055,.95,.012),M(0xdff6ff,{metalness:.9,roughness:.2,emissive:0x7dffea,emissiveIntensity:.8}),0,.1,0),mesh(new T.BoxGeometry(.24,.035,.03),M(0x9ec9ff,st),0,-.4,0),mesh(new T.CylinderGeometry(.016,.016,.2,6),M(0x2a3a5a),0,-.52,0),sheen(0x7dffea,.9,0,.2,0));sw.rotation.z=.6;sw.position.set(-.05,-.3,.08);
return{head:[...sk.head,fl.g,plume,glow(0x7dffea,.8)],chest:[...sk.chest,pl,plate,em,bl],back:[w.g,sw],hip:[orb.g,...sk.hip],mat:m=>{m.transparent=true;m.opacity=.78;m.emissive.set(0x2a8aff);m.emissiveIntensity=.5;m.side=T.FrontSide},upd:(t,d,o)=>{fl.upd(t);orb.upd(t);w.upd(t,o.k||0);sk.upd&&sk.upd(t)}}};
/* level-pass accessories */
B[20]=()=>{/* Crown: tall jewelled gold crown with arches, big front gem and a soft glow */
const gm=goldM(),g=new T.Group(),band=mesh(new T.CylinderGeometry(.14,.155,.075,16,1,true),Object.assign(gm.clone(),{side:T.DoubleSide}),0,0,0);g.add(band);
const vel=mesh(new T.CylinderGeometry(.138,.138,.06,16,1,true),M(0x8a0c24,{side:T.DoubleSide,roughness:.9}),0,0,0);g.add(vel);
const cols=[0xff4d6d,0x4dd2ff,0x7dff6a,0xb36bff,0xffffff];
for(let i=0;i<7;i++){const a=i/7*TAU,x=Math.cos(a)*.148,z=Math.sin(a)*.148;g.add(mesh(new T.ConeGeometry(.032,.13,4),gm,x,.1,z));g.add(mesh(new T.SphereGeometry(.018,8,6),gemM(cols[i%5],.9),x,.175,z))}
[0,1].forEach(i=>{const t=mesh(new T.TorusGeometry(.14,.01,5,16,Math.PI),gm,0,.075,0);t.rotation.y=i*Math.PI/2;g.add(t)});g.add(mesh(new T.SphereGeometry(.024,8,6),gemM(0xffd23f,1),0,.215,0));
const big=mesh(new T.SphereGeometry(.03,8,6),gemM(0xff2a5a,1),0,.012,-.158);big.scale.z=.6;g.add(big,sheen(0xffd23f,.7,0,.1,0));g.position.y=.19;
return{head:[g],upd:t=>{big.material.emissiveIntensity=.7+.4*Math.sin(t*2.4)}}};
B[21]=()=>{/* Halo: twin glowing rings with drifting sparkles */
const h=mesh(new T.TorusGeometry(.15,.016,8,28),BM(0xffe680),0,.32,0),h2=mesh(new T.TorusGeometry(.185,.006,6,28),BM(0xfff6c8,{transparent:true,opacity:.8}),0,.32,0);h.rotation.x=h2.rotation.x=Math.PI/2;const gl=glow(0xffe680,.7);gl.position.y=.32;
const sp=orbit(5,()=>glow(0xfff6c8,.12),.2,1.6,.3,.42);
return{head:[h,h2,gl,sp.g],upd:t=>{const y=.32+Math.sin(t*2)*.014;h.position.y=h2.position.y=gl.position.y=y;h.rotation.z=t*.6;h2.rotation.z=-t*.9;sp.upd(t);gl.material.opacity=.75+.25*Math.sin(t*3)}}};
B[22]=()=>{/* Headphones: padded band, glowing LED cups and a boom mic */
const bandM=M(0x20222e,{metalness:.5,roughness:.4}),ar=mesh(new T.TorusGeometry(.16,.02,8,22,Math.PI),bandM,0,-.005,0),pad=mesh(new T.TorusGeometry(.16,.014,6,16,Math.PI*.5),M(0x1ad1c9,{emissive:0x0a6a66,emissiveIntensity:.5}),0,-.005,0);pad.rotation.z=Math.PI/4;
const leds=[],cs=[-1,1].map(s=>{const g=new T.Group(),c=mesh(new T.CylinderGeometry(.065,.065,.06,14),bandM),pd=mesh(new T.CylinderGeometry(.07,.07,.02,14),M(0x15161e,{roughness:1}),0,-s*.04,0),lg=mesh(new T.TorusGeometry(.04,.007,5,16),BM(0x4dffee),0,s*.032,0);lg.rotation.x=Math.PI/2;leds.push(lg);c.add(lg);g.add(c,pd);g.rotation.z=Math.PI/2;g.position.set(s*.155,-.005,0);return g});
const mic=grp(bar(new T.Vector3(-.17,-.03,-.01),new T.Vector3(-.15,-.1,-.1),.007,bandM),bar(new T.Vector3(-.15,-.1,-.1),new T.Vector3(-.07,-.115,-.14),.007,bandM),mesh(new T.SphereGeometry(.02,8,6),M(0x111118),-.06,-.115,-.145));
return{head:[ar,pad,...cs,mic],upd:t=>leds.forEach((l,i)=>l.material.color.setHSL(.5+.05*Math.sin(t*3+i),1,.6))}};
B[23]=()=>{/* Cyber visor: glowing wrap-around visor, side modules, antenna and scan line */
const v=mesh(new T.CylinderGeometry(.145,.145,.075,20,1,true,Math.PI-1.1,2.2),BM(0x4dd2ff,{transparent:true,opacity:.7,side:T.DoubleSide}),0,.025,0);v.scale.set(.92,1,1.04);const g=glow(0x4dd2ff,.4);g.position.set(0,.025,-.15);
const fr=M(0x1a1e2e,{metalness:.7,roughness:.3}),mods=[-1,1].map(s=>{const m=mesh(new T.BoxGeometry(.04,.075,.06),fr,s*.148,.025,-.03);return m}),ant=bar(new T.Vector3(.15,.04,0),new T.Vector3(.17,.2,.02),.006,fr),tip=mesh(new T.SphereGeometry(.014,6,5),BM(0xff2a5a),.17,.205,.02);
const scan=mesh(new T.BoxGeometry(.2,.006,.004),BM(0xffffff,{transparent:true,opacity:.8}),0,.025,-.152);
return{head:[v,g,...mods,ant,tip,scan],upd:t=>{v.material.opacity=.6+.15*Math.sin(t*3);scan.position.y=.025+Math.sin(t*4)*.028;tip.visible=((t*2)|0)%2==0}}};
B[24]=()=>{/* Shades: dark gradient lenses with a moving glint, gold frame and a chain with a pendant */
const lm=M(0x07070c,{metalness:.6,roughness:.12}),fr=goldM(),g=grp(...[-1,1].map(s=>mesh(new T.BoxGeometry(.078,.052,.012),lm,s*.05,.025,-.132)),mesh(new T.BoxGeometry(.03,.012,.012),fr,0,.04,-.132));
[-1,1].forEach(s=>{g.add(bar(new T.Vector3(s*.088,.04,-.13),new T.Vector3(s*.125,.04,-.02),.005,fr));const e=mesh(new T.BoxGeometry(.086,.006,.014),fr,s*.05,.052,-.133),f=mesh(new T.BoxGeometry(.086,.006,.014),fr,s*.05,-.001,-.133);g.add(e,f)});
const gl=[-1,1].map(s=>mesh(new T.BoxGeometry(.012,.04,.004),BM(0x8fe8ff,{transparent:true,opacity:.7}),s*.05,.025,-.14));
const chain=mesh(new T.TorusGeometry(.115,.008,5,22),goldM(),0,.02,0);chain.rotation.x=Math.PI/2;const pend=mesh(new T.OctahedronGeometry(.03),gemM(0x4dd2ff,.8),0,-.1,-.15);
return{head:[g,...gl],chest:[chain,pend],upd:t=>{const k=((t*.7)%1.6)-.3;gl.forEach((q,i)=>{q.position.x=(i?1:-1)*.05+(k-.5)*.06;q.material.opacity=k>0&&k<1?.7:0});pend.rotation.y=t*1.5}}};
B[25]=()=>{/* Angel: big feathered wings, halo, gold pauldrons, white drape and drifting sparkles */
const w=wings(0xffffff,1.6,true,.12,2.4),h=mesh(new T.TorusGeometry(.14,.014,6,26),BM(0xfff2a8),0,.31,0);h.rotation.x=Math.PI/2;const gl=glow(0xfff2a8,.6);gl.position.y=.31;
const sp=orbit(8,()=>glow(0xffffff,.14),.55,1,.0,1.5),pl=pauldron(0xfff0b8,1.15,{metalness:.7,roughness:.3,emissive:0x665020,emissiveIntensity:.5});
const drape=skirt(0xffffff,.2,.3,.55,.0,0,{emissive:0xdfe8ff,emissiveIntensity:.35,roughness:.8},.1,8),tr=mesh(new T.TorusGeometry(.115,.014,6,20),goldM(),0,.02,0);tr.rotation.x=Math.PI/2;
return{head:[h,gl],chest:[pl,drape,tr],back:[w.g],hip:[sp.g],upd:(t,d,o)=>{w.upd(t,.0);const y=.31+Math.sin(t*2)*.012;h.position.y=gl.position.y=y;sp.upd(t)}}};

/* ---------- Halloween scenery props (used by the lobby and in-match decor) ---------- */
function jack(s=1,lite){return pumpkin(s,0xffd34a,0xff7a12,lite)}
function tomb(w=.8,h=1.1){const g=new T.Group(),m=M(0x7d8190,{roughness:1});g.add(mesh(new T.BoxGeometry(w,h,.22),m,0,h/2,0),mesh(new T.CylinderGeometry(w/2,w/2,.22,10),m,0,h,0));g.children[1].rotation.x=Math.PI/2;
const c=M(0x2c2e38);g.add(mesh(new T.BoxGeometry(.07,.36,.03),c,0,h*.62,-.12),mesh(new T.BoxGeometry(.24,.07,.03),c,0,h*.68,-.12));g.children.forEach(o=>o.castShadow=true);return g}
function bat(sz=1){const m=M(0x120a22,{side:T.DoubleSide}),R=grp(wingShape(m,sz)),L=grp(wingShape(m,sz));L.scale.x=-1;const g=grp(R,L,mesh(new T.SphereGeometry(.07*sz,6,5),m));g.userData.flap=t=>{R.rotation.z=Math.sin(t)*.7;L.rotation.z=-Math.sin(t)*.7};return g}
function tree(h=5){const g=new T.Group(),m=M(0x1b1320,{roughness:1});g.add(mesh(new T.CylinderGeometry(.18,.4,h,6),m,0,h/2,0));
[[.5,.9,.25],[.65,-.8,.2],[.8,.5,.15],[.4,-.5,.3]].forEach(([y,a,s],i)=>{const b=mesh(new T.CylinderGeometry(.03,.12,h*.45,5),m,Math.sin(a)*h*.14,h*y,Math.cos(a)*.0);b.rotation.z=-a*.9;b.rotation.y=i;g.add(b)});return g}
function moon(r=3){const g=new T.Group();g.add(mesh(new T.SphereGeometry(r,24,18),BM(0xfff1c9,{fog:false})));const h=glow(0xffe2a0,r*5.5);h.material.fog=false;g.add(h);
[[-.4,.5,.7],[.5,-.2,.5],[-.1,-.6,.4]].forEach(([x,y,s])=>g.add(mesh(new T.CircleGeometry(r*.14*s,10),BM(0xe6cf9c,{fog:false}),x*r,y*r,r*.98)));return g}

return{
 LIST,Y:16777216,
 id:v=>Math.floor((v||0)/16777216)%256,col:v=>(v||0)%16777216,pack:(c,i)=>c+i*16777216,
 info:id=>LIST.find(x=>x.id==id),
 make:(id,mat)=>{const f=B[id];if(!f)return null;const r=f();if(r.mat)r.mat(mat);return r},
 prop:{jack,tomb,bat,tree,moon,glow,wingShape,pumpkin}};
})();
