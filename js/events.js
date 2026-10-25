/* ================= EVENT + CATALOGUE + PASS / BOX / QUEST DEFINITIONS (pure data, no DOM) =================
   Move the event by editing the dates below. Test any time with  ?event=1  (force on) or  ?event=0  (force off) on the page URL.
   A skin value is one number: colour + cosmetic*2^24 (see cosmetics.js).                                                                 */
window.EVT=(()=>{
const C={name:'HAUNTED HARVEST',title:'Halloween 2026',start:Date.UTC(2026,9,1),end:Date.UTC(2026,11,1)}; /* Oct 1 -> Dec 1 (2 months) */
const q=typeof location!=='undefined'?new URLSearchParams(location.search).get('event'):null;
const on=()=>q=='1'||(q!='0'&&Date.now()>=C.start&&Date.now()<C.end);
const left=()=>q=='1'?864e5*30:Math.max(0,C.end-Date.now());
const GRACE=7*864e5,open=()=>on()||(q!='0'&&Date.now()>=C.start&&Date.now()<C.end+GRACE);/* collecting stops at the end; spending/claiming stays open 7 more days */
return{name:C.name,title:C.title,start:C.start,end:C.end,on,open,left,ended:()=>q!='1'&&Date.now()>=C.end,lb:'halloween26v2'}})();

window.RAR={common:['COMMON','#9aa3c7'],rare:['RARE','#4da6ff'],epic:['EPIC','#b36bff'],legendary:['LEGENDARY','#ffb020'],mythic:['MYTHIC','#ff4dd2']};
/* candy economy: normal candy = 5, golden pumpkin = 25 (used by game.js), plus a bonus for finishing a match */
window.CANDY={normal:5,gold:25,matchBonus:50,winBonus:50};
(()=>{
const pk=(c,i)=>c+i*16777216,I=[];
const col=(id,n,c,o={})=>I.push(Object.assign({id,n,v:c,rar:'common',ico:'',k:'color'},o));
const skin=(id,n,c,cos,rar,o={})=>I.push(Object.assign({id,n,v:pk(c,cos),rar,ico:COS.info(cos).ico,k:'skin',cos},o));
/* base colours (coin shop) */
col('blue','Blue',0x2f9bff,{src:'start'});col('red','Red',0xff4d4d,{src:'start'});col('green','Green',0x3ddc84,{price:200});col('purple','Purple',0xa65cff,{price:300});
col('orange','Orange',0xff9a2f,{price:400});col('pink','Pink',0xff5fb8,{price:500});col('gold','Gold',0xffd23f,{price:900,rar:'rare'});col('silver','Silver',0xe8e8f0,{price:1200,rar:'rare'});
/* LOL pass */
col('teal','Teal',0x1ad1c9,{src:'bp'});col('lime','Lime',0x9be32b,{src:'bp'});col('crimson','Crimson',0xd81e4a,{src:'bp',rar:'rare'});col('midnight','Midnight',0x232a5a,{src:'bp',rar:'rare'});
skin('shades','Cool Blue',0x2f9bff,24,'common',{src:'bp'});skin('dj','DJ Pink',0xff5fb8,22,'rare',{src:'bp'});skin('halo','Halo Silver',0xe8e8f0,21,'rare',{src:'bp'});
skin('cyberb','Cyber Blue',0x2f9bff,23,'epic',{src:'bp'});skin('cyberp','Cyber Pink',0xff5fb8,23,'epic',{src:'bp'});skin('royal','Royal',0xffd23f,20,'epic',{src:'bp'});
skin('dking','Diamond King',0x7de8ff,20,'legendary',{src:'bp'});skin('archangel','Archangel',0xf5f5ff,25,'legendary',{src:'bp'});
/* halloween colours */
col('pumpkin','Pumpkin',0xff7a12,{src:'hw',ico:'🎃'});col('slime','Slime',0x78e03a,{src:'hw',ico:'🟢'});col('blood','Blood',0xa8101f,{src:'hw',rar:'rare',ico:'🩸'});
/* halloween skins */
skin('jack','Jack',0xff7a12,1,'rare',{src:'hw'});skin('witch','Witch',0x5b2a8c,2,'rare',{src:'hw'});skin('skeleton','Skeleton',0xf1ecd8,3,'epic',{src:'hw'});
skin('ghost','Ghost',0xe6f0ff,4,'epic',{src:'hw'});skin('vampire','Vampire',0x3a0f1a,5,'epic',{src:'hw'});skin('bat','Bat',0x2b2540,9,'epic',{src:'hw'});
skin('devil','Devil',0xc4161c,8,'epic',{src:'hw'});skin('spider','Spider',0x1a1a22,14,'epic',{src:'hw'});skin('reaper','Reaper',0x15151f,10,'legendary',{src:'hw'});
skin('phantom','Phantom',0x7a5cff,4,'legendary',{src:'hw'});skin('king','Pumpkin King',0xffa01a,11,'legendary',{src:'hw'});
skin('candycorn','Candy Corn',0xffd23f,13,'rare',{src:'hw'});skin('cat','Black Cat',0x181820,16,'rare',{src:'hw'});
skin('mummy','Mummy',0xd9c9a3,6,'rare',{src:'hw'});skin('frank','Frankenstein',0x7bb36b,12,'rare',{src:'hw'});
skin('zombie','Zombie',0x6fa55a,7,'epic',{src:'hw'});skin('wolf','Werewolf',0x6b4a2b,15,'epic',{src:'hw'});
/* event-quest exclusives + mythics */
skin('hexed','Hexed',0x2e8b57,3,'epic',{src:'hw'});skin('violet','Violet Jack',0xa030ff,1,'epic',{src:'hw'});skin('ghostly','Ghostly',0x38f5c8,4,'legendary',{src:'hw'});
skin('knight','Spectral Knight',0xbfe9ff,18,'mythic',{src:'hw'});skin('nking','Nightmare King',0x6a1aa8,17,'mythic',{src:'hw'});
/* leaderboard rewards (claimed after the event ends) */
skin('champion','Harvest Champion',0xffd23f,17,'mythic',{src:'hw'});skin('podium','Midnight Pumpkin King',0x7a1fa2,11,'legendary',{src:'hw'});
skin('moonwitch','Moonlit Witch',0x2f4cff,2,'epic',{src:'hw'});skin('harvestjack','Harvest Jack',0xffd23f,1,'rare',{src:'hw'});
/* halloween gun skins (visuals live in gunskins.js). Each one is its own item; v = a unique "owned" number, k:'gun' */
const gun=id=>{const g=GUN.by[id];I.push({id,n:g.name,v:GUN.val(g),rar:g.rar,ico:'',k:'gun',w:g.w,gn:g.n,g,col:parseInt(g.c[1].slice(1),16),src:'hw'})};
GUN.L.forEach(g=>gun(g.id));
window.ITEMS=I;window.ITEM=id=>I.find(x=>x.id==id);window.ITEM_V=v=>I.find(x=>x.v==v);

/* ---------- reward = {k:'coins',n} | {k:'item',id} | {k:'key',n} | {k:'candy',n}   (a reward may also be an ARRAY of those) ---------- */
const C=n=>({k:'coins',n}),It=id=>({k:'item',id}),Ky=n=>({k:'key',n}),Cd=n=>({k:'candy',n});
function track(sp){const a=[];for(let t=1;t<=30;t++)a.push(sp[t]);return a}
/* LOL pass progress comes from ROUNDS: every round you win/lose gives pass XP (see PASSXP), 250 XP per tier. Tiers can NOT be bought. */
window.PASSXP={win:60,loss:20};
window.PASSES={
bp:{key:'bp',name:'LOL PASS',per:250,
 free:track({1:C(18),2:C(21),3:It('teal'),4:C(27),5:C(30),6:It('shades'),7:C(36),8:C(39),9:It('lime'),10:C(45),11:C(48),12:It('dj'),13:C(54),14:C(57),15:It('cyberb'),16:C(63),17:C(66),18:It('crimson'),19:C(72),20:C(75),21:It('halo'),22:C(81),23:C(84),24:It('midnight'),25:C(90),26:It('royal'),27:It('cyberp'),28:C(99),29:It('dking'),30:It('archangel')})},
/* Spooky Pass (MM2 style): you BUY tiers with candy. Tier 1-29 cost 600 each, the final tier costs 100,000. Player skins, colours AND gun skins. */
hw:{key:'hw',name:'SPOOKY PASS',tierCost:600,finalCost:100000,
 free:track({1:Ky(1),2:It('pumpkin'),3:It('candycorn'),4:C(100),5:It('jack'),6:It('g_mummy'),7:It('blood'),8:It('mummy'),9:Ky(1),10:It('witch'),
  11:It('slime'),12:It('g_gnasher'),13:C(150),14:It('skeleton'),15:It('frank'),16:Ky(1),17:It('ghost'),18:It('g_batwing'),19:C(200),20:It('vampire'),
  21:It('zombie'),22:It('bat'),23:It('g_skelkey'),24:It('devil'),25:It('wolf'),26:It('spider'),27:It('g_ecto'),28:It('phantom'),29:It('reaper'),30:It('nking')})}};
window.tierCost=t=>t>=30?PASSES.hw.finalCost:PASSES.hw.tierCost;

/* ---------- Halloween Box '26: WEAPON SKINS ONLY (MM2 style odds: 70 / 18 / 8 / 4 / 0.2). Duplicates refund candy. ---------- */
window.BOX={name:"Halloween Box '26",cost:600,
 tiers:[['common','Common',70,'#9aa3c7',100,['g_bone','g_candy','g_web','g_spice','g_midnight']],['uncommon','Uncommon',18,'#00e5ff',200,['g_slime','g_brew','g_rust']],['rare','Rare',8,'#3dff3d',400,['g_velvet','g_franken','g_grave']],
        ['legendary','Legendary',4,'#ff3d3d',1500,['g_jacko','g_harvest','g_reaper']],['mythic','????',.2,'#ff4dd2',5000,['g_spectral','g_nightmare']]]};

/* ---------- daily quest: ONE quest with 3 stages, and it is only about winning matches ---------- */
window.DQ=[{id:'win',n:'Win matches',stat:'win',st:[1,2,3],r:[100,150,250],ico:'🏆'}];
/* permanent event quest: finish the daily quest (all 3 stages) on N different days */
window.PQ=[{n:7,id:'cat'},{n:14,id:'hexed'},{n:21,id:'violet'},{n:28,id:'ghostly'}];

/* ---------- leaderboard rewards: exclusive rare skins (rank = position by candy collected) ---------- */
window.RANKREW=[{max:1,t:'#1',r:[It('champion'),It('g_gh_sg'),It('g_gh_ar'),It('g_gh_px')]},{max:3,t:'Top 3',r:[It('podium'),It('g_midharv')]},{max:10,t:'Top 10',r:[It('moonwitch'),It('g_moonlit')]},
 {max:25,t:'Top 25',r:[It('harvestjack'),It('g_harvpick')]},{max:50,t:'Top 50',r:[It('g_patch')]}];

/* ---------- goals (lifetime milestones, small rewards). stat: tot=candy collected, gold, win, play, box, dq=daily quests done, tier=pass tier, own=event items owned ---------- */
window.ACH=[
{id:'a1',n:'Sweet Tooth',d:'Collect 1,000 candy',stat:'tot',goal:1000,r:Cd(40)},
{id:'a2',n:'Candy Hoarder',d:'Collect 5,000 candy',stat:'tot',goal:5000,r:Cd(75)},
{id:'a3',n:'Sugar Rush',d:'Collect 15,000 candy',stat:'tot',goal:15000,r:Ky(1)},
{id:'a4',n:'Candy Baron',d:'Collect 40,000 candy',stat:'tot',goal:40000,r:It('g_moonlight')},
{id:'a5',n:'Candy Legend',d:'Collect 100,000 candy',stat:'tot',goal:100000,r:It('king')},
{id:'a6',n:'Golden Touch',d:'Collect 10 golden pumpkins',stat:'gold',goal:10,r:C(25)},
{id:'a7',n:'Pumpkin Picker',d:'Collect 50 golden pumpkins',stat:'gold',goal:50,r:Cd(75)},
{id:'a8',n:'Trick Winner',d:'Win 5 matches',stat:'win',goal:5,r:Cd(30)},
{id:'a9',n:'Monster Hunter',d:'Win 25 matches',stat:'win',goal:25,r:C(75)},
{id:'a10',n:'Night Owl',d:'Play 50 matches',stat:'play',goal:50,r:C(100)},
{id:'a11',n:'Box Opener',d:'Open 10 boxes',stat:'box',goal:10,r:Cd(75)},
{id:'a12',n:'Box Addict',d:'Open 50 boxes',stat:'box',goal:50,r:It('g_wolfclaw')},
{id:'a13',n:'Quest Apprentice',d:'Finish the daily quest 7 times',stat:'dq',goal:7,r:C(50)},
{id:'a14',n:'Halfway There',d:'Reach pass tier 15',stat:'tier',goal:15,r:Cd(100)},
{id:'a15',n:'Fully Haunted',d:'Reach pass tier 30',stat:'tier',goal:30,r:It('g_cursed')},
{id:'a16',n:'Collector',d:'Own 15 event items',stat:'own',goal:15,r:Ky(1)},
{id:'a17',n:'Completionist',d:'Own 45 event items',stat:'own',goal:45,r:It('knight')}];
})();
