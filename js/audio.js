const SFX=(()=>{let c,mus=null,on=true;const A=()=>c||(c=new(window.AudioContext||window.webkitAudioContext)());let mg;const out=()=>{if(!mg){mg=A().createGain();mg.connect(A().destination);mg.gain.value=window.CFG?CFG.vol:1}return mg};
function tone(f,d,type='sine',v=.15,sl=0,dl=0){const a=A(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime+dl;o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+sl),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(out());o.start(t);o.stop(t+d)}
let nb=null;/* one shared 1s noise buffer: building a fresh random buffer on every shot/step caused CPU + GC hitches */
const nbuf=()=>{const a=A();if(!nb||nb.sampleRate!==a.sampleRate){nb=a.createBuffer(1,a.sampleRate,a.sampleRate);const x=nb.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1}return nb};
function noise(d,v=.3,f=1500){const a=A(),t=a.currentTime,s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=nbuf();s.loop=true;fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.linearRampToValueAtTime(0,t+d);s.connect(fl).connect(g).connect(out());s.start(t,Math.random()*.5);s.stop(t+d+.02)}
const bass=[55,55,82,55,73,73,98,73],spook=[55,58.3,55,82.4,51.9,55,77.8,58.3];let i=0;const hw0=()=>window.EVT&&EVT.on();
return{resume(){A().resume()},setVol(v){out().gain.value=v},click(){tone(660,.08,'triangle',.12)},
shoot(v=1){noise(.18,.35*v,2800);tone(150,.14,'square',.2*v,-110)},
gun(k,v=1){switch(k){
case 'pickaxe':noise(.12,.25*v,1200);tone(300,.1,'triangle',.15*v,-200);break;
case 'smg':noise(.07,.28*v,4200);tone(220,.06,'square',.12*v,-120);break;
case 'ar':noise(.13,.34*v,2400);tone(130,.11,'sawtooth',.16*v,-90);break;
case 'shotgun':noise(.42,.6*v,1400);tone(90,.3,'sawtooth',.3*v,-60);tone(60,.25,'square',.2*v,-30,.02);break;
case 'sniper':noise(.5,.5*v,900);tone(70,.5,'sawtooth',.35*v,-45);tone(1500,.08,'square',.08*v,-1200);break;
case 'revolver':noise(.3,.5*v,1800);tone(110,.25,'square',.28*v,-70);break;
default:noise(.15,.3*v,3000);tone(180,.12,'square',.18*v,-120)}},
candy(g){if(g){[784,988,1319,1568].forEach((f,k)=>tone(f,.16,'triangle',.14,0,k*.05))}else{tone(988,.07,'triangle',.11);tone(1480,.1,'triangle',.1,0,.05)}},claim(){[523,659,784,1046,1568].forEach((f,k)=>tone(f,.22,'triangle',.14,0,k*.06))},thunder(){noise(1.6,.28,240);tone(48,1.2,'sawtooth',.07,-20)},spook(){tone(220,.5,'sawtooth',.1,-120);tone(330,.4,'triangle',.08,-150,.05)},swap(){tone(500,.04,'square',.08);tone(700,.05,'square',.08,0,.05)},build(m){if(m==2){tone(980,.07,'square',.05,-350);tone(1500,.05,'triangle',.04);noise(.04,.1,3200)}else if(m==1){noise(.08,.2,520);tone(120,.09,'square',.07,-45)}else{noise(.07,.17,950);tone(190,.07,'triangle',.09,-70)}},crumble(){noise(.38,.28,700);tone(90,.3,'sawtooth',.08,-40)},tick(){tone(880,.07,'triangle',.12)},go(){tone(1175,.25,'triangle',.18);tone(1568,.3,'triangle',.14,0,.08)},hit(){tone(1200,.07,'square',.12);tone(800,.1,'square',.1,0,.05)},
hurt(){tone(120,.25,'sawtooth',.25,-60);noise(.12,.2,600)},empty(){tone(300,.05,'square',.1)},
reload(){tone(400,.06,'square',.1);tone(300,.08,'square',.1,0,.5);tone(600,.06,'square',.12,0,1.2)},
jump(){tone(250,.15,'sine',.12,300)},land(){noise(.1,.2,400)},step(){noise(.05,.06,500)},
death(){tone(300,.7,'sawtooth',.25,-250)},kill(){[523,659,784,1046].forEach((f,k)=>tone(f,.15,'triangle',.15,0,k*.07))},
win(){[523,659,784,1046,1318].forEach((f,k)=>tone(f,.3,'triangle',.18,0,k*.12))},lose(){[400,350,300,200].forEach((f,k)=>tone(f,.35,'sawtooth',.12,0,k*.15))},
music(s){if(s===undefined)s=!on;on=s;clearInterval(mus);mus=null;if(on)mus=setInterval(()=>{const hw=window.EVT&&EVT.on(),b=hw?spook:bass;tone(b[i++%8],hw?.45:.38,'triangle',.07);if(i%4==0)tone(b[i%8]*(hw?6:4),hw?.5:.2,'sine',hw?.03:.025);if(hw&&i%16==0)tone(b[i%8]*8,.6,'sine',.02,-30)},hw0()?460:400)}}})();
