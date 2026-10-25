/* weak-device detection (Chromebooks, <=4 cores or <=4GB RAM): switches on the cheap 'lite' look and a few CPU/GPU savers */
try{window.LITE=/\bCrOS\b/.test(navigator.userAgent)||(+navigator.hardwareConcurrency||8)<=4||(+navigator.deviceMemory||8)<=4;document.body.classList.toggle('lite',window.LITE)}catch(e){}
// Using your own Firebase project? Replace this object (Project settings > Your apps > Web app).
window.FIREBASE_CONFIG={apiKey:"AIzaSyA0xHTS3vec9zX2GP2v3JidY1Af9TnTilA",authDomain:"v1-lol-1e584.firebaseapp.com",databaseURL:"https://v1-lol-1e584-default-rtdb.firebaseio.com",projectId:"v1-lol-1e584",storageBucket:"v1-lol-1e584.firebasestorage.app",messagingSenderId:"1083992982686",appId:"1:1083992982686:web:61c8486bba6de426a1a78f"};
