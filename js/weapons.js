/* ================= WEAPON MODELS =================
   Detailed models for the shotgun, assault rifle and pickaxe, plus every gun-skin decoration.
   Gun space (same as before): +Z forward, +Y up, origin at the grip.  The first N parts of each weapon are its "skin slots"
   (shotgun 0 barrel,1 forend,2 receiver,3 stock,4 grip | rifle 0 body,1 handguard,2 barrel,3 mag,4 stock,5 grip,6 optic | pickaxe 0 handle,1 head,2 collar),
   i.e. the same colour indices js/gunskins.js has always used, so every saved skin keeps working.  Every other part derives its colour from a slot,
   from a fixed "trim" colour (lightly tinted by the skin) or from the skin's glow colour.

   Everything is tessellated here (boxes, tapered boxes, cylinders/cones, spheres, torus arcs and "lofts" for blades) and merged per material,
   so a whole gun costs only a handful of draw calls.  The same parts also feed the 2D side-view icons (WPN.icon).
   Colour spec of a part:  n = skin slot n | [n,s] = slot n shaded (s<1 darker, s>1 lighter) | '#hex' = trim | {r:'#hex'} = fixed colour
                           {e:'#hex' or [slot,s]} = glow strip: skin glow colour if the skin glows, else that fallback colour            */
window.WPN=(()=>{
const {sin,cos,PI,hypot,min,max,pow,abs,sqrt}=Math,TAU=PI*2;
/* ---------- colour helpers ---------- */
const h2r=h=>{h=h.replace('#','');if(h.length==3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]};
const r2h=c=>'#'+c.map(v=>max(0,min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),shade=(c,s)=>s<=1?c.map(v=>v*s):mix(c,[255,255,255],min(1,s-1)),lum=c=>(.2126*c[0]+.7152*c[1]+.0722*c[2])/255;
/* ---------- tessellation (flat arrays of triangles + normals) ---------- */
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],O=[0,0,0];
const unit=a=>{const l=hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
function Msh(){const P=[],N=[];
/* every triangle is wound so that it faces away from `ref` (a point inside the solid); flat = geometric normal, smooth = the given vertex normals */
const add=(a,b,c,na,nb,nc,ref)=>{const g=crs(sub(b,a),sub(c,a)),l=hypot(g[0],g[1],g[2]);if(l<1e-11)return;
 const cen=[(a[0]+b[0]+c[0])/3-ref[0],(a[1]+b[1]+c[1])/3-ref[1],(a[2]+b[2]+c[2])/3-ref[2]];
 if(dot(g,cen)<0){[b,c]=[c,b];if(na){[nb,nc]=[nc,nb]}}
 const f=na?null:[g[0]/l,g[1]/l,g[2]/l];if(!na&&dot(g,cen)<0)f.forEach((v,i)=>f[i]=-v);
 const n1=na||f,n2=nb||f,n3=nc||f;P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);N.push(n1[0],n1[1],n1[2],n2[0],n2[1],n2[2],n3[0],n3[1],n3[2])};
return{P,N,flat:(a,b,c,ref)=>add(a,b,c,0,0,0,ref),smooth:add,quad(a,b,c,d,ref){add(a,b,c,0,0,0,ref);add(a,c,d,0,0,0,ref)}}}
/* box / tapered box: w0,h0 at the rear (-z), w1,h1 at the front (+z) */
function tFrus(m,w0,h0,w1,h1,l){const ring=(w,h,z)=>[[-w/2,-h/2,z],[w/2,-h/2,z],[w/2,h/2,z],[-w/2,h/2,z]],r=ring(w0,h0,-l/2),f=ring(w1,h1,l/2);
for(let i=0;i<4;i++){const j=(i+1)%4;m.quad(r[i],r[j],f[j],f[i],O)}m.quad(r[0],r[1],r[2],r[3],O);m.quad(f[0],f[1],f[2],f[3],O)}
/* cylinder / cone along z: r0 at the rear, r1 at the front */
function tCyl(m,r0,r1,l,seg){seg=seg||10;const a=-l/2,b=l/2,sl=(r0-r1)/l,P=(r,z,k)=>[r*cos(k/seg*TAU),r*sin(k/seg*TAU),z],Nn=k=>unit([cos(k/seg*TAU),sin(k/seg*TAU),sl]);
for(let k=0;k<seg;k++){const A=P(r0,a,k),B=P(r0,a,k+1),C=P(r1,b,k+1),D=P(r1,b,k),n0=Nn(k),n1=Nn(k+1);
 m.smooth(A,B,C,n0,n1,n1,O);m.smooth(A,C,D,n0,n1,n0,O);
 m.smooth([0,0,a],A,B,[0,0,-1],[0,0,-1],[0,0,-1],O);m.smooth([0,0,b],D,C,[0,0,1],[0,0,1],[0,0,1],O)}}
function tSph(m,rx,ry,rz,ws,hs){ws=ws||10;hs=hs||7;const P=(i,j)=>{const t=i/ws*TAU,f=j/hs*PI;return[rx*sin(f)*cos(t),ry*cos(f),rz*sin(f)*sin(t)]},Nn=p=>unit([p[0]/(rx*rx),p[1]/(ry*ry),p[2]/(rz*rz)]);
for(let j=0;j<hs;j++)for(let i=0;i<ws;i++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);m.smooth(a,b,c,Nn(a),Nn(b),Nn(c),O);m.smooth(a,c,d,Nn(a),Nn(c),Nn(d),O)}}
/* torus arc in the XY plane (axis z): ring radius R, tube radius r, sweep `arc` radians */
function tTor(m,R,r,arc,seg,ts){seg=seg||16;ts=ts||6;const P=(i,j)=>{const u=i/seg*arc,v=j/ts*TAU,c=[cos(u),sin(u),0],nv=[c[0]*cos(v),c[1]*cos(v),sin(v)];return[[R*c[0]+r*nv[0],R*c[1]+r*nv[1],r*nv[2]],nv,[R*c[0],R*c[1],0]]};
for(let i=0;i<seg;i++)for(let j=0;j<ts;j++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);m.smooth(a[0],b[0],c[0],a[1],b[1],c[1],a[2]);m.smooth(a[0],c[0],d[0],a[1],c[1],d[1],a[2])}}
/* loft along +y through samples [y, z0, z1, thickness(x), bevel]: blades, claws, wings, spade ... */
function tLoft(m,S){const ring=s=>{const[y,z0,z1,th,bv]=s,x=th/2,b=min(bv||0,th/2,(z1-z0)/2);
 return[[x,y,z0+b],[x,y,z1-b],[x-b,y,z1],[-x+b,y,z1],[-x,y,z1-b],[-x,y,z0+b],[-x+b,y,z0],[x-b,y,z0]]},R=S.map(ring),C=S.map(s=>[0,s[0],(s[1]+s[2])/2]);
for(let i=0;i<R.length-1;i++){const ref=[0,(S[i][0]+S[i+1][0])/2,(C[i][2]+C[i+1][2])/2];for(let k=0;k<8;k++){const j=(k+1)%8;m.quad(R[i][k],R[i][j],R[i+1][j],R[i+1][k],ref)}}
const cap=(r,ref)=>{for(let k=1;k<7;k++)m.flat(r[0],r[k],r[k+1],ref)};cap(R[0],C[R.length-1]);cap(R[R.length-1],C[0])}
/* ---------- parts ---------- */
const rot3=(v,rx,ry,rz)=>{let[x,y,z]=v,t;if(rz){t=x*cos(rz)-y*sin(rz);y=x*sin(rz)+y*cos(rz);x=t}if(rx){t=y*cos(rx)-z*sin(rx);z=y*sin(rx)+z*cos(rx);y=t}if(ry){t=x*cos(ry)+z*sin(ry);z=-x*sin(ry)+z*cos(ry);x=t}return[x,y,z]};
function tess(p){const m=Msh(),a=p.a;switch(p.k){case 'f':tFrus(m,...a);break;case 'c':tCyl(m,...a);break;case 's':tSph(m,...a);break;case 't':tTor(m,...a);break;case 'l':tLoft(m,a)}
const r=p.r||O,q=p.p,P=[],N=[];for(let i=0;i<m.P.length;i+=3){const v=rot3([m.P[i],m.P[i+1],m.P[i+2]],r[0],r[1],r[2]),n=rot3([m.N[i],m.N[i+1],m.N[i+2]],r[0],r[1],r[2]);P.push(v[0]+q[0],v[1]+q[1],v[2]+q[2]);N.push(n[0],n[1],n[2])}return{P,N}}
/* part constructors: x,y,z = centre.  o: r [rx,ry,rz] rotation, m material ('s' steel,'p' polymer,'w' wood,'g' glow), g sub-group name, q 1 = leave out of the 2D icon */
const F=(w0,h0,w1,h1,l,x,y,z,c,o)=>({k:'f',a:[w0,h0,w1,h1,l],p:[x,y,z],c,...o});
const B=(w,h,l,x,y,z,c,o)=>F(w,h,w,h,l,x,y,z,c,o);
const C=(r0,r1,l,x,y,z,c,o)=>({k:'c',a:[r0,r1,l,o&&o.seg||10],p:[x,y,z],c,...o});
const S=(rx,ry,rz,x,y,z,c,o)=>({k:'s',a:[rx,ry,rz,o&&o.ws||10,o&&o.hs||7],p:[x,y,z],c,...o});
const T=(R,r,arc,x,y,z,c,o)=>({k:'t',a:[R,r,arc,o&&o.seg||18,6],p:[x,y,z],c,...o});
const L=(smp,x,y,z,c,o)=>({k:'l',a:smp,p:[x,y,z],c,...o});
const UP=[-PI/2,0,0],DN=[PI/2,0,0],SIDE=[0,PI/2,0]; /* rotations that turn a z-axis cylinder/cone to point up / down / sideways */
const K0='#14161c',K1='#242832',K2='#3a3f4c',K3='#7b8295';
const sym=f=>[...f(1),...f(-1)];
/* blade profile helper: n+1 samples from y0 to y1; fz centre z, fh z-extent, ft x-thickness (all functions of u 0..1) */
const blade=(y0,y1,n,fz,fh,ft,bv)=>{const s=[];for(let i=0;i<=n;i++){const u=i/n;s.push([y0+(y1-y0)*u,fz(u)-fh(u)/2,fz(u)+fh(u)/2,ft(u),bv])}return s};
const lerpT=(t,u)=>{for(let i=1;i<t.length;i++)if(u<=t[i][0]){const a=t[i-1],b=t[i];return a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]||1)}return t[t.length-1][1]};

/* =========================== SHOTGUN (pump action) =========================== */
function shotgun(){const P=[];
/* barrel (slot 0) + muzzle device, bore, vent rib, glowing front bead */
P.push(C(.027,.027,.70,0,.047,.52,0,{m:'s',seg:12}),C(.033,.033,.05,0,.047,.857,[0,.7],{m:'s',seg:12}),C(.019,.019,.006,0,.047,.885,{r:'#050507'}),
 C(.036,.036,.012,0,.047,.832,K2,{m:'s',seg:12}),B(.012,.009,.62,0,.079,.50,K2,{m:'s'}),S(.008,.008,.008,0,.092,.86,{e:'#ff5a3c'},{m:'g',ws:6,hs:4}));
/* magazine tube under the barrel, clamps and end cap */
P.push(C(.02,.02,.46,0,.003,.50,K2,{m:'s'}),C(.025,.025,.03,0,.003,.738,[0,.8],{m:'s'}),B(.054,.086,.026,0,.026,.70,K1,{m:'s'}),B(.052,.082,.02,0,.027,.275,K1,{m:'s'}));
/* pump forend (slot 1) - slides back when the gun is pumped */
const pg={g:'pump',m:'p'};
P.push(F(.07,.066,.078,.072,.25,0,-.003,.41,1,pg),B(.083,.07,.012,0,-.003,.345,[1,.58],pg),B(.083,.07,.012,0,-.003,.385,[1,.58],pg),B(.083,.07,.012,0,-.003,.425,[1,.58],pg),B(.083,.07,.012,0,-.003,.465,[1,.58],pg),
 B(.082,.076,.016,0,-.003,.288,K1,{g:'pump',m:'s'}),B(.082,.076,.016,0,-.003,.538,K1,{g:'pump',m:'s'}),...sym(s=>[B(.004,.014,.14,s*.0385,.0,.41,{e:[1,1.3]},{g:'pump',m:'g'})]));
/* receiver (slot 2): main body, top cover, blocks, ejection port, bolt handle, loading gate */
P.push(B(.064,.088,.30,0,.034,.10,2,{m:'s'}),B(.05,.012,.31,0,.089,.10,K1,{m:'s'}),B(.059,.092,.04,0,.036,.262,[2,.75],{m:'s'}),B(.062,.082,.022,0,.034,-.045,[2,.8],{m:'s'}),
 B(.05,.014,.075,0,-.012,.13,K1,{m:'s'}),B(.022,.014,.04,0,.098,.14,K2,{m:'s'}),
 ...sym(s=>[B(.006,.026,.085,s*.0325,.055,.15,K0,{m:'s'}),B(.004,.008,.2,s*.033,.018,.10,{e:[2,1.5]},{m:'g'})]),
 C(.006,.006,.035,.049,.062,.175,K2,{r:SIDE,m:'s',q:1}),S(.011,.011,.011,.068,.062,.175,K3,{m:'s'}));
/* grip (slot 4) + trigger guard + trigger */
P.push(B(.044,.105,.052,0,-.07,-.025,4,{m:'p',r:[.3,0,0]}),B(.048,.012,.056,0,-.124,-.048,[4,1.25],{m:'p',r:[.3,0,0]}),
 B(.012,.012,.095,0,-.052,.035,K1,{m:'s'}),B(.012,.042,.012,0,-.031,.083,K1,{m:'s'}),B(.008,.026,.012,0,-.027,.03,K0,{r:[.25,0,0]}));
/* stock (slot 3) + butt pad, cheek riser, wrist, glow strips */
const sk=[-.09,0,0];
P.push(F(.05,.115,.044,.074,.30,0,-.012,-.225,3,{m:'w',r:sk}),B(.052,.125,.022,0,-.02,-.385,K0,{m:'p',r:sk}),B(.034,.02,.12,0,.043,-.2,[3,.85],{m:'w',r:sk}),B(.046,.07,.06,0,.02,-.065,[3,.9],{m:'w'}),
 ...sym(s=>[B(.004,.012,.2,s*.0245,-.012,-.23,{e:[3,1.5]},{m:'g',r:sk})]));
/* side saddle of shells on the far side */
for(let j=0;j<2;j++)for(let i=0;i<3;i++){const y=.03+j*.03,z=.0+i*.05;P.push(C(.011,.011,.034,-.043,y,z+.01,{r:'#c4382b'},{m:'p',seg:8}),C(.0118,.0118,.014,-.043,y,z-.012,{r:'#d4a63a'},{m:'s',seg:8}))}
P.push(B(.004,.08,.16,-.036,.04,.05,K1,{m:'s'}));
return P}

/* =========================== ASSAULT RIFLE =========================== */
function rifle(){const P=[];
/* receiver (slot 0): lower + upper, top rail with teeth, ejection port, charging handle, mag well */
P.push(B(.066,.06,.46,0,.012,.215,0,{m:'s'}),B(.062,.052,.46,0,.068,.215,[0,1.15],{m:'s'}),B(.05,.012,.5,0,.1,.21,K1,{m:'s'}),
 B(.028,.014,.05,0,.1,-.04,K2,{m:'s'}),B(.054,.04,.11,0,-.035,.24,[0,.8],{m:'s'}),B(.044,.02,.05,0,-.01,-.012,[0,.85],{m:'s'}));
for(let i=0;i<9;i++)P.push(B(.054,.006,.012,0,.108,-.02+i*.055,K0,{m:'s',q:1}));
P.push(...sym(s=>[B(.006,.03,.09,s*.0335,.07,.25,K0,{m:'s'}),B(.004,.01,.2,s*.0335,.012,.2,{e:[0,1.6]},{m:'g'}),B(.01,.016,.03,s*.034,.012,.06,K2,{m:'s',q:1})]));
/* grip (slot 5), trigger guard, trigger */
P.push(B(.044,.105,.052,0,-.07,-.02,5,{m:'p',r:[.32,0,0]}),B(.048,.012,.056,0,-.124,-.045,[5,1.25],{m:'p',r:[.32,0,0]}),
 B(.012,.012,.1,0,-.048,.045,K1,{m:'s'}),B(.012,.036,.012,0,-.03,.095,K1,{m:'s'}),B(.008,.026,.012,0,-.025,.04,K0,{r:[.25,0,0]}));
/* curved magazine (slot 3) */
P.push(B(.04,.07,.07,0,-.08,.24,3,{m:'p'}),B(.04,.07,.07,0,-.142,.256,3,{m:'p',r:[-.13,0,0]}),B(.04,.07,.07,0,-.2,.285,3,{m:'p',r:[-.27,0,0]}),B(.046,.012,.08,0,-.24,.3,K1,{m:'s',r:[-.27,0,0]}),
 ...sym(s=>[B(.004,.02,.05,s*.0205,-.1,.245,{e:[3,1.6]},{m:'g'}),B(.004,.02,.05,s*.0205,-.17,.265,{e:[3,1.6]},{m:'g',r:[-.2,0,0]})]));
/* handguard (slot 1): body, key-mod slots, vents, rails, caps, glow strips */
P.push(F(.066,.068,.072,.07,.31,0,.03,.585,1,{m:'p'}),B(.03,.012,.27,0,-.008,.585,K1,{m:'s'}),B(.036,.01,.3,0,.068,.585,K1,{m:'s'}),B(.078,.076,.012,0,.03,.743,K1,{m:'s'}),B(.07,.074,.014,0,.03,.432,[1,.6],{m:'s'}),
 ...sym(s=>[B(.004,.012,.24,s*.0375,.03,.585,{e:[1,1.35]},{m:'g'}),B(.004,.014,.04,s*.036,.052,.5,K0,{q:1}),B(.004,.014,.04,s*.036,.052,.58,K0,{q:1}),B(.004,.014,.04,s*.036,.052,.66,K0,{q:1}),
  B(.004,.014,.04,s*.036,.008,.5,K0,{q:1}),B(.004,.014,.04,s*.036,.008,.58,K0,{q:1}),B(.004,.014,.04,s*.036,.008,.66,K0,{q:1})]));
for(let i=0;i<4;i++)P.push(B(.026,.004,.022,0,.074,.5+i*.055,K0,{q:1}));
/* barrel (slot 2): gas block, front sight, flash hider, bore */
P.push(C(.016,.016,.27,0,.04,.86,2,{m:'s'}),B(.034,.04,.034,0,.047,.762,K1,{m:'s'}),B(.02,.012,.03,0,.08,.762,K1,{m:'s'}),B(.007,.04,.007,0,.1,.762,K0),
 C(.023,.023,.075,0,.04,.952,K0,{m:'s',seg:12}),C(.026,.026,.012,0,.04,.92,K2,{m:'s',seg:12}),C(.012,.012,.006,0,.04,.992,{r:'#050507'}));
/* optic (slot 6): mount, hooded holo housing, glass, red dot */
P.push(B(.044,.014,.09,0,.113,.23,K1,{m:'s'}),B(.046,.052,.076,0,.145,.235,6,{m:'s'}),B(.05,.008,.08,0,.174,.235,[6,.7],{m:'s'}),B(.038,.036,.004,0,.145,.275,{e:'#69c8ff'},{m:'g'}),B(.038,.036,.004,0,.145,.195,{r:'#0b1b2c'},{m:'g'}),S(.0045,.0045,.0045,0,.147,.278,{r:'#ff3030'},{m:'g',ws:6,hs:4}));
/* stock (slot 4): buffer tube, collapsible stock, butt pad, cheek, glow strips */
const sk=[-.07,0,0];
P.push(C(.022,.022,.2,0,.03,-.14,K1,{m:'s'}),F(.05,.12,.046,.09,.17,0,-.012,-.255,4,{m:'p',r:sk}),B(.05,.13,.02,0,-.015,-.348,K0,{m:'p',r:sk}),B(.04,.015,.15,0,.056,-.25,[4,1.3],{m:'p',r:sk}),
 ...sym(s=>[B(.004,.012,.11,s*.0255,-.002,-.25,{e:[4,1.5]},{m:'g',r:sk})]));
return P}

/* =========================== PICKAXE =========================== */
const HZ=.775; /* z of the head */
function pickaxe(sk){const P=[],v=sk&&sk.v||'pick';
/* handle (slot 0): shaft, leather wrap with bands, pommel, collar rings */
P.push(C(.0235,.0235,.93,0,0,.3,0,{m:'w'}),C(.0275,.0275,.24,0,0,-.02,[0,.5],{m:'p'}));
for(let i=0;i<6;i++)P.push(C(.0298,.0298,.01,0,0,-.125+i*.045,[0,.75],{m:'p'}));
P.push(S(.034,.034,.03,0,0,-.18,2,{m:'s'}),C(.03,.03,.02,0,0,-.15,[2,.85],{m:'s'}),C(.034,.034,.03,0,0,.56,2,{m:'s'}),C(.03,.03,.015,0,0,.5,[2,.85],{m:'s'}),C(.03,.03,.015,0,0,.12,[2,.85],{m:'s'}));
/* socket / collar (slot 2) with rivets */
P.push(F(.062,.1,.058,.1,.11,0,0,HZ,2,{m:'s'}),C(.011,.011,.08,0,.03,HZ,K3,{r:SIDE,m:'s',q:1}),C(.011,.011,.08,0,-.03,HZ,K3,{r:SIDE,m:'s',q:1}),
 ...sym(s=>[S(.013,.013,.008,s*.04,.03,HZ,K3,{m:'s',ws:8,hs:5}),S(.013,.013,.008,s*.04,-.03,HZ,K3,{m:'s',ws:8,hs:5})]));
const half=(sg,len)=>{const pts=[];for(let i=0;i<=8;i++){const u=i/8;pts.push([sg*len*u,u])}return pts};
const curve=(y0,y1,n,drop,hb,tb,pw)=>blade(y0,y1,n,u=>-drop*pow(u,pw||2),u=>hb*pow(1-pow(u,1.25),.9)+.006,u=>tb*(1-pow(u,1.15))+.003,.008);
const head=(smp,ridge)=>{P.push(L(smp,0,0,HZ,1,{m:'s'}));if(ridge)P.push(L(ridge,0,0,HZ,{e:[1,1.4]},{m:'g'}))};
const mirror=(smp)=>smp.map(s=>[-s[0],s[1],s[2],s[3],s[4]]).reverse();
if(v=='pick'||v=='key'){
 const f=curve(0,.34,10,.14,.085,.064),b=v=='pick'?curve(0,.34,10,.14,.085,.064):null;
 const rf=f.slice(0,9).map(s=>{const m=(s[1]+s[2])/2,h=(s[2]-s[1])*.3;return[s[0]*.97,m-h/2,m+h/2,s[3]+.008,.002]});
 if(v=='pick'){const bk=mirror(b),rb=mirror(rf);head(bk.concat(f.slice(1)),rb.concat(rf.slice(1)))}
 else{head(f,rf);/* skeleton key: ornate bow ring on the back end, teeth on the blade */
  P.push(T(.058,.011,TAU,0,-.115,HZ-.01,1,{r:SIDE,m:'s'}),T(.026,.007,TAU,0,-.115,HZ-.01,[1,.8],{r:SIDE,m:'s'}),C(.016,.016,.05,0,-.045,HZ,[1,.9],{r:[0,0,0],m:'s',q:1}));
  for(let i=0;i<3;i++)P.push(B(.016,.03,.012,0,.15+i*.06,HZ-.04-.02*i*i,[1,.9],{m:'s'}));
  P.push(S(.016,.016,.016,0,-.115,HZ-.01,{e:[1,1.4]},{m:'g',ws:6,hs:4}))}}
else if(v=='scythe'){
 /* one long hooked reaper blade on the front, short spike behind */
 const f=blade(.02,.64,16,u=>-.27*pow(u,1.8),u=>.1*pow(1-u,.75)+.006,u=>.016*(1-pow(u,2))+.003,.004),rf=blade(.06,.6,14,u=>-.27*pow(u,1.8)-.012,u=>.03*pow(1-u,.6)+.002,u=>.016*(1-pow(u,2))+.01,.002);
 head(f,rf);const bk=curve(0,.15,5,.05,.04,.04);head(mirror(bk),null);
 P.push(B(.03,.06,.05,0,.02,HZ-.015,[1,.8],{m:'s'}))}
else if(v=='claw'){
 /* three hooked talons */
 for(const[x,rz,len] of [[-.032,.2,.34],[0,0,.42],[.032,-.2,.34]]){const t=blade(0,len,10,u=>-.2*pow(u,2),u=>.045*pow(1-u,.9)+.005,u=>.026*(1-pow(u,1.2))+.003,.004);P.push(L(t,x,.02,HZ,1,{r:[0,0,rz],m:'s'}))}
 head(mirror(curve(0,.15,5,.06,.05,.04)),null);P.push(B(.1,.04,.05,0,.02,HZ-.01,[1,.8],{m:'s'}),...sym(s=>[S(.012,.012,.012,s*.04,.0,HZ+.045,{e:[1,1.4]},{m:'g',ws:6,hs:4})]))}
else if(v=='spade'){
 /* grave digger: a flat spade blade on the front, a stubby pick behind */
 const wd=[[0,.06],[.15,.115],[.4,.15],[.7,.12],[.9,.06],[1,.004]],sp=[];for(let i=0;i<=14;i++){const u=i/14;sp.push([.05+.36*u,HZ-.012-.03*u*u,HZ+.012-.03*u*u,lerpT(wd,u),.005])}
 P.push(L(sp,0,0,0,1,{m:'s'}));P.push(L(blade(.05,.4,10,u=>HZ-.02*u*u,u=>.03,u=>.012,.002).map(s=>[s[0],s[1]+.004,s[2]+.004,s[3]*1,s[4]]),0,0,0,{e:[1,1.3]},{m:'g',q:1}));
 head(mirror(curve(0,.17,6,.06,.05,.04)),null)}
return P}

/* =========================== SKIN DECORATIONS =========================== */
const BONE={r:'#e9e4cc'};
const AN={shotgun:{side:[.034,.04,.1],top:[.085,.28,.82],muz:[0,.047,.885],hang:[0,-.056,.075],eye:[0,.115,.12],gem:[.034,.05,.04,.05]},
 ar:{side:[.034,.04,.24],top:[.075,.46,.72],muz:[0,.04,.99],hang:[0,-.056,.1],eye:[0,.19,.235],gem:[.034,.04,.1,.06]},
 pickaxe:{head:[0,0,HZ],butt:[0,0,-.2]}};
const DECO={
 skull:A=>sym(s=>{const[x,y,z]=A.side,X=s*(x+.016);return[S(.026,.03,.028,X,y,z,BONE,{m:'p'}),B(.024,.014,.024,X,y-.026,z+.004,BONE,{m:'p'}),S(.007,.009,.007,s*(x+.04),y+.004,z-.011,{e:'#080808'},{m:'g',ws:6,hs:4}),S(.007,.009,.007,s*(x+.04),y+.004,z+.011,{e:'#080808'},{m:'g',ws:6,hs:4})]}),
 pumpkin:A=>{const[x,y,z]=A.hang||A.butt;const o=[C(.003,.003,.04,x,y-.02,z,K0,{r:UP,q:0}),S(.032,.027,.032,x,y-.06,z,{r:'#ff7a12'},{m:'p'}),S(.019,.027,.029,x+.018,y-.06,z,{r:'#e86a08'},{m:'p'}),S(.019,.027,.029,x-.018,y-.06,z,{r:'#e86a08'},{m:'p'}),C(.005,.007,.02,x,y-.03,z,{r:'#3b6b1c'},{r:UP,m:'p'})];
  return o.concat(sym(s=>[B(.004,.01,.009,s*.032,y-.054,z-.01,{e:'#ffd23f'},{m:'g'}),B(.004,.01,.009,s*.032,y-.054,z+.01,{e:'#ffd23f'},{m:'g'}),B(.004,.006,.022,s*.032,y-.07,z,{e:'#ffd23f'},{m:'g'})]))},
 bolts:A=>{const[x,y,z]=A.side;return sym(s=>[C(.007,.007,.05,s*(x+.014),y,z,K3,{r:SIDE,m:'s',q:1}),S(.013,.013,.013,s*(x+.04),y,z,{e:'#b4ff6b'},{m:'g',ws:8,hs:5}),T(.014,.004,TAU,s*(x+.016),y,z,K3,{r:SIDE,m:'s',q:1})])},
 spikes:A=>{const[y,z0,z1]=A.top,o=[];for(let i=0;i<6;i++){const z=z0+(z1-z0)*i/5;o.push(C(.011,0,.05+.012*(i%2),0,y+.025,z,[1,1.1],{r:UP,m:'s'}))}return o},
 batwings:A=>{const[x,y,z]=A.side,o=[];for(const s of[1,-1])[[.55,.11,.034],[.95,.13,.032],[1.35,.1,.03]].forEach(([a,len,w],i)=>{const t=blade(0,len,6,u=>0,u=>w*(1-pow(u,1.5))+.003,u=>.004,0);o.push(L(t,s*(x+.002),y+.01,z-.03+i*.018,3,{r:[0,0,-s*a],m:'p'}))});return o},
 stripes:A=>{const o=[],cl=[2,0,1];for(let i=0;i<7;i++)o.push(B(.077,.074,.022,0,.03,.45+i*.04,cl[i%3],{m:'p'}));return o},
 halo:A=>{const[x,y,z]=A.muz,c={e:[1,1.4]};return[T(.052,.0055,TAU,x,y,z-.12,c,{m:'g',seg:24}),T(.07,.004,TAU,x,y,z-.2,c,{m:'g',seg:24})]},
 flames:A=>{const[x,y,z]=A.muz,c={e:'#ff7a12'};return[-1,0,1].map((k,i)=>C(.016,0,.07+.02*(i==1),x+k*.014,y+.034,z-.025,c,{r:[-1.3+.1*k*k-.15*(i==1),0,k*.15],m:'g'}))},
 fangs:A=>{const[x,y,z]=A.muz;return[-1,1].map(s=>C(.007,0,.05,x+s*.013,y-.03,z-.05,{r:'#f6f2e2'},{r:DN,m:'p'}))},
 drips:A=>{const[x,y,z]=A.muz,o=[];[[0,-.18,.03],[.014,-.3,.02],[-.012,-.42,.026],[.01,-.55,.018]].forEach(([dx,dz,r])=>{const zz=z+dz,len=.04+(r*2);o.push(C(.0045,.0045,len,x+dx,y-.03-len/2,zz,{e:'#5dff2a'},{r:UP,m:'g'}),S(r*.55,r*.75,r*.55,x+dx,y-.03-len-r*.6,zz,{e:'#5dff2a'},{m:'g',ws:8,hs:6}))});return o},
 moon:A=>{const[x,y,z]=A.side;return sym(s=>[T(.045,.009,TAU*.72,s*(x+.014),y+.01,z,{e:[1,1.4]},{r:[0,s*PI/2,1.05],m:'g',seg:20})])},
 orbs:A=>{const[x,y,z]=A.muz;return[[.034,.07,-.04,.012],[-.03,.09,-.12,.009],[.0,.12,-.07,.011],[.045,.02,-.2,.008]].map(([dx,dy,dz,r])=>S(r,r,r,x+dx,y+dy,z+dz,{e:'#c88cff'},{m:'g',ws:8,hs:6}))},
 eye:A=>{const[x,y,z]=A.eye;return[S(.026,.026,.026,x,y,z,{r:'#f4f0f0'},{m:'p'}),S(.013,.013,.007,x,y,z+.0235,{e:'#ff4dd2'},{m:'g',ws:10,hs:5,r:[PI/2,0,0]}),S(.006,.006,.004,x,y,z+.029,{r:'#0a0a0a'},{m:'p',ws:6,hs:4})]},
 chain:A=>{const[x,y,z]=A.hang,o=[];for(let i=0;i<6;i++)o.push(T(.013,.0035,TAU,x,y-.012-i*.021,z+i*.003,1,{r:[PI/2,i%2?PI/2:0,0],m:'s',seg:10}));return o},
 gems:A=>{const[x,y,z,sp]=A.gem||[.034,0,0,.05];return sym(s=>[0,1,2].map(i=>S(.011,.014,.011,s*x,y,z+i*sp,{e:'#ffd23f'},{m:'g',ws:5,hs:3})))},
 wrap:A=>{const o=[],c={r:'#e6dcc0'};[.2,.26,.31,.38,.45,.52].forEach((z,i)=>o.push(C(.0285,.0285,.022,0,0,z,c,{r:[.22*(i%2?1:-1),0,0],m:'p',seg:8})));
  o.push(B(.078,.03,.1,0,0,HZ,c,{m:'p',r:[0,0,.2]}));[[.02,.04],[-.03,.03],[.05,.025]].forEach(([y,l],i)=>o.push(B(.006,l,.012,.04,y,HZ-.07-i*.012,c,{m:'p',r:[0,0,.3]})));return o}};
const DECO_W={shotgun:1,ar:1};

/* =========================== resolving parts for a skin =========================== */
const STOCK={shotgun:['#23262f','#b9814f','#3a3f4d','#7a4c27','#1d2029'],ar:['#343a48','#ff9a2f','#232730','#262a34','#3b4252','#1d2029','#2a2f3b'],pickaxe:['#8a5a30','#cfd6e6','#59607a']};
const TINT={shotgun:2,ar:0,pickaxe:1},RB={common:0,rare:.04,epic:.08,legendary:.13,mythic:.18};
const MAT={s:[.4,.42],p:[.08,.62],w:[0,.72],g:[.15,.45]};
const cache={};
function parts(id,sk){const key=id+(sk&&sk.v?sk.v:'')+(sk&&sk.d?sk.d.join():'');if(cache[key])return cache[key];
 const base={shotgun,ar:rifle,pickaxe}[id](sk),A=AN[id];let out=base;if(sk&&sk.d)sk.d.forEach(n=>{if(DECO[n])out=out.concat(DECO[n](A))});return cache[key]=out}
/* -> [{p: part, col:'#rrggbb', em:null|['#hex',intensity], rough, metal}] */
function resolve(id,sk){const prim=STOCK[id].map((h,i)=>h2r(sk&&sk.c&&sk.c[i]?sk.c[i]:h)),sg=sk&&sk.e,gl=sk&&sk.g,glows=i=>sg&&(!gl||gl.indexOf(i)>=0),rb=sk?RB[sk.rar]||0:0,tint=prim[TINT[id]];
 return parts(id,sk).map(p=>{const c=p.c;let rgb,em=null;
  if(typeof c=='number'){rgb=prim[c];if(glows(c))em=[sk.e,sk.ei]}
  else if(Array.isArray(c)){rgb=shade(prim[c[0]],c[1]);if(glows(c[0]))em=[sk.e,sk.ei*.9]}
  else if(typeof c=='string')rgb=sk?mix(h2r(c),tint,.28):h2r(c);
  else if(c.r)rgb=h2r(c.r);
  else{const fb=c.e;if(sg){rgb=h2r(sk.e);em=[sk.e,max(.8,sk.ei*1.5)]}else rgb=Array.isArray(fb)?shade(prim[fb[0]],fb[1]):h2r(fb)}
  const mt=MAT[p.m||'s'];let metal=mt[0],rough=mt[1];if(sk){metal=min(.6,metal+rb*(p.m=='p'?.5:1));rough=max(.2,rough-rb*.9)}
  return{p,col:r2h(rgb),em,rough,metal}})}

/* =========================== three.js model =========================== */
const MC=new Map();
function material(T,r){const key=[r.col,r.rough.toFixed(2),r.metal.toFixed(2),r.em?r.em[0]+r.em[1].toFixed(2):''].join('|');let m=MC.get(key);
 if(!m){const o={color:new T.Color(r.col),roughness:r.rough,metalness:r.metal};if(r.em){o.emissive=new T.Color(r.em[0]);o.emissiveIntensity=r.em[1]}m=new T.MeshStandardMaterial(o);MC.set(key,m)}return m}
/* id: 'shotgun' | 'ar' | 'pickaxe'; sk: a js/gunskins.js entry or null.  userData.pump = group that slides on a pump; userData.glow = pulsing emissive materials */
/* the tessellated geometry of a gun only depends on the weapon + skin, so it is built ONCE and shared by every copy (every player in every match used to re-tessellate 3 guns, which was a big part of the match-load freeze) */
const BC=new Map();
function binsOf(T,id,sk){const key=id+'|'+(sk?JSON.stringify([sk.c,sk.e,sk.ei,sk.g,sk.rar,sk.v,sk.d]):''),hit=BC.get(key);if(hit)return hit;
 const bins=new Map(),res=resolve(id,sk);
 res.forEach(r=>{const k=(r.p.g||'')+'#'+r.col+r.rough+r.metal+(r.em?r.em[0]+r.em[1]:'');let b=bins.get(k);if(!b){b={g:r.p.g||'',r,P:[],N:[]};bins.set(k,b)}
  const t=tess(r.p);for(let i=0;i<t.P.length;i++){b.P.push(t.P[i]);b.N.push(t.N[i])}});
 const out=[];bins.forEach(b=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.P,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.N,3));geo.userData.keep=1;out.push({g:b.g,r:b.r,geo})});
 BC.set(key,out);return out}
function build(T,id,sk){const g=new T.Group(),groups={},glow=[],amp=sk?{mythic:.3,legendary:.22,epic:.16}[sk.rar]||.1:0;
 binsOf(T,id,sk).forEach(b=>{const m=material(T,b.r),mesh=new T.Mesh(b.geo,m);mesh.castShadow=true;
  if(b.r.em&&!glow.some(q=>q.m===m))glow.push({m,b:b.r.em[1],a:amp,s:2.2+glow.length*.37,p:glow.length*1.3});
  let tgt=g;if(b.g){if(!groups[b.g]){groups[b.g]=new T.Group();g.add(groups[b.g]);g.userData[b.g]=groups[b.g]}tgt=groups[b.g]}tgt.add(mesh)});
 g.userData.glow=glow;return g}
/* ---------- 2D side-view icon (an svg string) ---------- */
function hull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(pts.length<3)return pts;const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
 for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
 for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}lo.pop();up.pop();return lo.concat(up)}
function icon(id,cols,sz,sk){if(!sk&&cols)sk={c:cols};const res=resolve(id,sk),stock=!sk,polys=[];
 res.filter(r=>!r.p.q&&r.p.p[0]>-.015).sort((a,b)=>a.p.p[0]-b.p.p[0]).forEach(r=>{const t=tess(r.p);let c=h2r(r.col);if(stock){const l=lum(c);if(l<.5)c=mix(c,[228,232,251],.85-l)}
  const pts=[];for(let i=0;i<t.P.length;i+=3)pts.push([t.P[i+2],-t.P[i+1]]);
  const chunks=r.p.k=='l'?(()=>{const out=[],n=r.p.a.length;let k=0;const per=pts.length/(n-1||1);for(let s=0;s<n-1;s++)out.push(pts.slice(Math.floor(s*per),Math.floor((s+1)*per)));return out})():[pts];
  chunks.forEach(ch=>{const h=hull(ch);if(h.length>2)polys.push({h,c:r2h(c),e:r.em})})});
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;polys.forEach(p=>p.h.forEach(q=>{x0=min(x0,q[0]);x1=max(x1,q[0]);y0=min(y0,q[1]);y1=max(y1,q[1])}));
 const ar=150/62,pad=.05;let w=(x1-x0)*(1+pad*2),h=(y1-y0)*(1+pad*2);if(w/h<ar)w=h*ar;else h=w/ar;const cx=(x0+x1)/2,cy=(y0+y1)/2;
 const s=100,vb=[(cx-w/2)*s,(cy-h/2)*s,w*s,h*s].map(v=>v.toFixed(1)).join(' '),glow=sk&&sk.e?` style="filter:drop-shadow(0 0 3px ${sk.e})"`:'';
 return`<svg viewBox="${vb}" width="${sz?sz*2.4:68}" height="${sz||28}"${glow}>`+polys.map(p=>`<polygon points="${p.h.map(q=>(q[0]*s).toFixed(1)+','+(q[1]*s).toFixed(1)).join(' ')}" fill="${p.c}" stroke="rgba(0,0,0,.45)" stroke-width="${(.45).toFixed(2)}" stroke-linejoin="round"/>`).join('')+'</svg>'}
return{build,icon,resolve,tess,parts,STOCK}})();
