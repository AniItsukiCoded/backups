/* ================= GUN SKINS =================
   A gun skin recolours one of the three weapons (0 shotgun, 1 assault rifle, 2 pickaxe; same order as WEAPONS in game.js).
   Equipped gun skins travel inside the player's skin number, above the colour (24 bits) and cosmetic (8 bits) fields:
       skin = colour + cosmetic*2^24 + gunCode*2^32      gunCode = shotgunN + arN*32 + pickaxeN*1024   (N = 0 -> stock gun)
   so the opponent sees your guns without any Firebase changes.  APPEND-ONLY: a skin's number N is its position within its weapon,
   never reorder or delete entries or players' saved loadouts will change.                                                        */
window.GUN=(()=>{
const WN=['SHOTGUN','ASSAULT RIFLE','PICKAXE'],K=4294967296;
const L=[];
/* c = colour for each part of the stock gun (same index as WEAPONS[w].parts); e/ei = glow colour + strength; g = which parts glow (default all) */
const add=(id,w,name,rar,c,o={})=>{L.push(Object.assign({id,w,n:L.filter(x=>x.w==w).length+1,name,rar,c,e:0,ei:0,g:null},o))};
/* ---- Halloween Box ---- */
add('g_bone',0,'Bone White','common',['#d9d3b8','#f1ecd8','#9d977f','#c9c3a8','#6d6a58'],{d:['skull']});
add('g_candy',1,'Candy Corn','common',['#ffd23f','#ff8a1f','#fafafa','#ff8a1f','#ffd23f','#c9a21f','#fafafa'],{d:['stripes']});
add('g_web',2,'Cobweb','common',['#6e6e7a','#e6e8f2','#aeb2c6']);
add('g_spice',0,'Pumpkin Spice','common',['#2b1608','#ff7a12','#7a3f10','#ff9a2f','#2b1608'],{d:['pumpkin']});
add('g_midnight',1,'Midnight','common',['#14141c','#3a3a52','#0a0a10','#22222e','#14141c','#0f0f16','#3a3a52']);
add('g_slime',1,'Slime Splatter','rare',['#2e6b1a','#78e03a','#1a3a0f','#3f9a22','#2e6b1a','#3f9a22','#78e03a'],{e:'#4dff1a',ei:.5,g:[1,6],d:['drips']});
add('g_brew',0,"Witch's Brew",'rare',['#2a1740','#a45cff','#3d2260','#5b2a8c','#2a1740'],{e:'#9a4dff',ei:.55,g:[1],d:['orbs']});
add('g_rust',2,'Rusty Scythe','rare',['#4a3320','#a0522d','#5c3a22'],{v:'scythe'});
add('g_velvet',1,'Vampire Velvet','epic',['#4a0a18','#d81e2a','#1a0610','#8c0a22','#4a0a18','#1a0610','#d81e2a'],{e:'#ff1a3a',ei:.6,g:[1,6],d:['fangs']});
add('g_franken',0,'Frankenbolt','epic',['#2a3328','#8bd16b','#3a4a38','#7bb36b','#1c231a'],{e:'#b4ff6b',ei:.5,g:[1],d:['bolts']});
add('g_grave',2,'Grave Digger','epic',['#3a2a1c','#9aa0b4','#4a4d58'],{e:'#7dffea',ei:.25,g:[1],v:'spade'});
add('g_jacko',0,'Jack-o-Blaster','legendary',['#2a1a08','#ff7a12','#ff5a0a','#ffa01a','#2a1a08'],{e:'#ff7a12',ei:.9,g:[1,2,3],d:['pumpkin','flames']});
add('g_harvest',1,'Haunted Harvest','legendary',['#2a1740','#ff7a12','#ffd23f','#5b2a8c','#2a1740','#ff7a12','#ffd23f'],{e:'#ff8a1f',ei:.8,g:[1,5,6],d:['pumpkin']});
add('g_reaper',2,"Reaper's Scythe",'legendary',['#15151f','#cfd6ee','#5a6080'],{e:'#9ac4ff',ei:.7,g:[1,2],v:'scythe'});
add('g_spectral',1,'Spectral Reaper','mythic',['#aee8ff','#38f5c8','#e6f0ff','#7de8ff','#aee8ff','#7de8ff','#38f5c8'],{e:'#7dffea',ei:1,d:['halo','orbs']});
add('g_nightmare',0,'Nightmare Scattergun','mythic',['#12081f','#ff4dd2','#2a1040','#8a2aff','#12081f'],{e:'#ff4dd2',ei:1,d:['spikes','eye']});
/* ---- Spooky Pass ---- */
add('g_mummy',2,'Mummy Wrap','rare',['#d8c8a0','#f0e6c8','#a8986f'],{d:['wrap']});
add('g_gnasher',1,'Zombie Gnasher','rare',['#3c4a2a','#6fa55a','#1e2616','#4a3a24','#3c4a2a','#4a3a24','#6fa55a'],{e:'#6fff4a',ei:.3,g:[1,6],d:['fangs']});
add('g_batwing',0,'Bat Wing Blaster','epic',['#1a1030','#7a4ab0','#2b1d46','#c07aa8','#1a1030'],{e:'#c07aa8',ei:.45,g:[3],d:['batwings']});
add('g_skelkey',2,'Skeleton Key','epic',['#f1ecd8','#ffd23f','#c9a21f'],{e:'#ffd23f',ei:.5,g:[1],v:'key'});
add('g_ecto',1,'Ecto Rifle','epic',['#dfe8ff','#9fd6ff','#bcd0ff','#e6f0ff','#dfe8ff','#e6f0ff','#9fd6ff'],{e:'#6688ff',ei:.55,d:['halo']});
/* ---- Goals ---- */
add('g_moonlight',1,'Moonlight','legendary',['#1b2a5a','#e6f0ff','#fff1c9','#2f4cff','#1b2a5a','#2f4cff','#fff1c9'],{e:'#9ac4ff',ei:.8,g:[1,2,6],d:['moon']});
add('g_wolfclaw',2,'Werewolf Claw','legendary',['#4a2f1a','#e8e8f0','#8a6a40'],{e:'#ffd23f',ei:.35,g:[1],v:'claw'});
add('g_cursed',0,'Cursed Gold','legendary',['#3a2a08','#ffd23f','#7a5a10','#ffc400','#3a2a08'],{e:'#ffc400',ei:.7,g:[0,1,3],d:['chain','gems']});
/* ---- Leaderboard exclusives ---- */
add('g_gh_sg',0,'Golden Harvest','mythic',['#ffd23f','#fff2a8','#8a5a00','#ffb800','#3a2a08'],{e:'#ffb800',ei:1,d:['pumpkin','halo']});
add('g_gh_ar',1,'Golden Harvest','mythic',['#8a5a00','#fff2a8','#ffd23f','#ffb800','#8a5a00','#ffb800','#fff2a8'],{e:'#ffb800',ei:1,d:['halo','gems']});
add('g_gh_px',2,'Golden Harvest','mythic',['#3a2a08','#fff2a8','#ffb800'],{e:'#ffb800',ei:1,d:['gems']});
add('g_midharv',1,'Midnight Harvest','legendary',['#1a0a2e','#ffa01a','#7a1fa2','#2a1448','#1a0a2e','#7a1fa2','#ffa01a'],{e:'#ffa01a',ei:.7,g:[1,2,6],d:['pumpkin','batwings']});
add('g_moonlit',0,'Moonlit Witch','epic',['#14204a','#6a8cff','#1f2f6a','#3a54c8','#14204a'],{e:'#6a8cff',ei:.6,g:[1,3],d:['moon']});
add('g_harvpick',2,'Harvest Pick','rare',['#5a3a1a','#ffd23f','#d98a1a'],{e:'#ffd23f',ei:.3,g:[1],d:['pumpkin']});
add('g_patch',1,'Pumpkin Patch','rare',['#3d7d22','#ff7a12','#1d3a10','#ff9a2f','#3d7d22','#2a5a18','#ff7a12'],{e:'#ff7a12',ei:.4,g:[1,6],d:['pumpkin']});

const by={};L.forEach(x=>by[x.id]=x);
const code=v=>Math.floor((v||0)/K);
return{L,WN,K,by,
 get:(w,n)=>n?L.find(x=>x.w==w&&x.n==n)||null:null,
 /* equipped numbers [sg,ar,px] -> number to add to a skin value */
 pack:gs=>((gs[0]|0)+(gs[1]|0)*32+(gs[2]|0)*1024)*K,
 /* which skin (1..31, 0 = stock) is equipped on weapon w inside a skin value */
 pick:(v,w)=>Math.floor(code(v)/Math.pow(32,w))%32,
 /* the plain player-skin part of a combined value (colour + cosmetic) */
 base:v=>(v||0)%K,
 /* a stable unique "owned" id for an item (never collides with player skin values, which are < 2^32) */
 val:x=>K*256+x.w*64+x.n};
})();
