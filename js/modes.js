/* ===== Game modes =====
   size  = players per team (team modes) · ffa = free-for-all (every player is their own team) · win = rounds needed to win the match
   map   = 'arena' (random small arena) · 'box' (enclosed box-fight room) · 'zone' (big map + shrinking storm)
   min / max = player count for online free-for-all queues · bots = how many bots fill a practice match
   room = open room: no bots, players join / leave at any time, rounds repeat (rounds = how many, roundSec = seconds per round) and a round starts as soon as 2 players are in
   Menu art (mode picker): grp = group label · badge = corner ribbon · c1/c2 = card colours · art = big emoji on the card · where = map line · rule = match rule line */
window.MODES={
'1v1':{id:'1v1',n:'1v1',ic:'⚔️',tag:'Classic duel on a random map',size:1,win:3,map:'arena',ppl:2,grp:'SOLO',badge:'CLASSIC',c1:'#2f8bff',c2:'#5a2ad8',art:'⚔️',where:'Random arena',rule:'First to 3 rounds'},
'2v2':{id:'2v2',n:'2v2',ic:'🤝',tag:'You + a teammate vs two enemies',size:2,win:3,map:'arena',ppl:4,grp:'DUOS',badge:'TEAMS',c1:'#16c9a0',c2:'#1c6fd0',art:'🤝',where:'Random arena',rule:'First to 3 rounds'},
'3v3':{id:'3v3',n:'3v3',ic:'👥',tag:'Squad up: three vs three',size:3,win:3,map:'arena',ppl:6,grp:'SQUADS',badge:'TEAMS',c1:'#ff8a2a',c2:'#d02a6a',art:'👥',where:'Random arena',rule:'First to 3 rounds'},
'box':{id:'box',n:'Box Fights',ic:'📦',tag:'Fortnite-style box fights · everyone starts in their own box · build, edit, outplay · join any time',ffa:1,room:1,rounds:100,roundSec:120,min:2,max:10,win:100,map:'box',ppl:10,grp:'BUILD',badge:'LIVE',c1:'#ffc233',c2:'#d9531e',art:'📦',where:'Open-sky box arena',rule:'100 rounds · 2 min each'},
'zone':{id:'zone',n:'Zone Wars',ic:'🌀',tag:'Big map · closing storm · last one standing · join any time',ffa:1,room:1,rounds:100,roundSec:120,min:2,max:10,win:100,map:'zone',ppl:10,grp:'BATTLE',badge:'LIVE',c1:'#a64dff',c2:'#3a1a9a',art:'🌀',where:'Big map + storm',rule:'100 rounds · 2 min each'}
};
window.modeOf=id=>window.MODES[id]||window.MODES['1v1'];
window.MODE_ORDER=['1v1','2v2','3v3','box','zone'];
/* AFK zone: stand in the zone and collect these every minute. candyRank=false keeps AFK candy out of the event leaderboard & candy goals (it is still spendable). */
window.AFK={ms:60000,candy:5,coins:10,candyRank:false};
