
gsap.registerPlugin(ScrollTrigger);

/* ── Timezone data — 10 cities ── */
const TZ = [
  { city:'New York',     country:'United States', tz:'America/New_York',     label:'EST / EDT',    acc:'#c8a97e' },
  { city:'London',       country:'United Kingdom',tz:'Europe/London',       label:'GMT / BST',    acc:'#9bbfd8' },
  { city:'Paris',        country:'France',        tz:'Europe/Paris',        label:'CET / CEST',   acc:'#d8a899' },
  { city:'Dubai',        country:'UAE',           tz:'Asia/Dubai',          label:'GST +4',       acc:'#98c8a8' },
  { city:'Mumbai',       country:'India',         tz:'Asia/Kolkata',        label:'IST +5:30',    acc:'#c8a0d8' },
  { city:'Singapore',    country:'Singapore',     tz:'Asia/Singapore',      label:'SGT +8',       acc:'#b8d8e8' },
  { city:'Tokyo',        country:'Japan',         tz:'Asia/Tokyo',          label:'JST +9',       acc:'#e8c898' },
  { city:'Sydney',       country:'Australia',     tz:'Australia/Sydney',    label:'AEST / AEDT',  acc:'#a8d8c8' },
  { city:'Los Angeles',  country:'United States', tz:'America/Los_Angeles', label:'PST / PDT',    acc:'#d8c898' },
  { city:'São Paulo',    country:'Brazil',        tz:'America/Sao_Paulo',   label:'BRT −3',       acc:'#e8b8a8' },
];

/* ── Utility: hex → "r,g,b" ── */
const rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)].join(',');

/* ────────────────────────────────────────────────────────────
    CLOCK DRAWING ENGINE
──────────────────────────────────────────────────────────── */
function drawClock(ctx, size, date, opts = {}) {
  const { accentColor='#c8a97e', glow=1, numerals=true, faceLight=false } = opts;
  const cx = size/2, cy = size/2, R = size*.44;
  const ac = rgb(accentColor);

  ctx.clearRect(0,0,size,size);

  /* Outer ambient halo */
  const halo = ctx.createRadialGradient(cx,cy,R*.82,cx,cy,R*1.18);
  halo.addColorStop(0, `rgba(${ac},${ .07*glow })`);
  halo.addColorStop(1, 'transparent');
  ctx.beginPath(); ctx.arc(cx,cy,R*1.16,0,Math.PI*2);
  ctx.fillStyle = halo; ctx.fill();

  /* Clock face */
  const face = ctx.createRadialGradient(cx,cy*.6,0,cx,cy,R);
  if (faceLight) {
    face.addColorStop(0,  'rgba(255,252,245,1)');
    face.addColorStop(.5, 'rgba(240,235,222,1)');
    face.addColorStop(1,  'rgba(215,208,192,1)');
  } else {
    face.addColorStop(0,  'rgba(28,26,22,1)');
    face.addColorStop(.55,'rgba(15,13,10,1)');
    face.addColorStop(1,  'rgba(7,6,4,1)');
  }
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
  ctx.fillStyle = face; ctx.fill();

  /* Outer bezel */
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
  ctx.strokeStyle = faceLight ? 'rgba(150,120,80,.45)' : `rgba(${ac},.24)`;
  ctx.lineWidth = size*.007; ctx.stroke();

  /* Inner accent ring */
  ctx.beginPath(); ctx.arc(cx,cy,R*.93,0,Math.PI*2);
  ctx.strokeStyle = faceLight ? 'rgba(150,120,80,.12)' : `rgba(${ac},.07)`;
  ctx.lineWidth = size*.0024; ctx.stroke();

  /* Tick marks */
  for (let i=0; i<60; i++) {
    const a=i/60*Math.PI*2-Math.PI/2, big=i%5===0;
    const len=big?R*.1:R*.038, ro=R*.905;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*ro,        cy+Math.sin(a)*ro);
    ctx.lineTo(cx+Math.cos(a)*(ro-len),  cy+Math.sin(a)*(ro-len));
    const alpha = big ? (faceLight?.62:.7) : (faceLight?.2:.18);
    ctx.strokeStyle = faceLight ? `rgba(110,85,50,${alpha})` : `rgba(${ac},${alpha})`;
    ctx.lineWidth = big?size*.006:size*.0022;
    ctx.lineCap = 'round'; ctx.stroke();
  }

  /* Numerals */
  if (numerals) {
    ctx.font = `italic ${size*.058}px 'Cormorant Garamond',serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for (let i=1; i<=12; i++) {
      const a=i/12*Math.PI*2-Math.PI/2, nr=R*.72;
      ctx.fillStyle = faceLight ? 'rgba(75,55,30,.55)' : `rgba(${ac},.5)`;
      ctx.fillText(i, cx+Math.cos(a)*nr, cy+Math.sin(a)*nr);
    }
  }

  /* Time */
  const h=date.getHours()%12, m=date.getMinutes(), s=date.getSeconds(), ms=date.getMilliseconds();
  const secA = (s+ms/1000)/60*Math.PI*2 - Math.PI/2;
  const minA = (m+s/60)   /60*Math.PI*2 - Math.PI/2;
  const hrA  = (h+m/60)   /12*Math.PI*2 - Math.PI/2;

  const H = (angle,len,width,color,shadow,blur) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(angle)*len, cy+Math.sin(angle)*len);
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round';
    ctx.shadowColor=shadow; ctx.shadowBlur=blur*glow;
    ctx.stroke(); ctx.restore();
  };

  const handDark = faceLight ? 'rgba(50,38,20,.90)' : `rgba(${ac},.92)`;
  const handMid  = faceLight ? 'rgba(50,38,20,.72)' : `rgba(${ac},.78)`;
  const handShad = faceLight ? '#3a2810' : accentColor;

  H(hrA,  R*.48, size*.018, handDark, handShad, 9);
  H(minA, R*.67, size*.011, handMid,  handShad, 7);
  H(secA+Math.PI, R*.2, size*.006, '#d05040','#d05040',8);
  H(secA,         R*.8, size*.005, '#d05040','#d05040',12);

  /* Centre hub */
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,size*.028,0,Math.PI*2);
  ctx.fillStyle=faceLight?'rgba(140,105,55,.4)':`rgba(${ac},.35)`;
  ctx.shadowColor=accentColor; ctx.shadowBlur=6*glow; ctx.fill(); ctx.restore();

  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,size*.013,0,Math.PI*2);
  ctx.fillStyle='#d05040'; ctx.shadowColor='#d05040'; ctx.shadowBlur=8*glow; ctx.fill(); ctx.restore();
}

/* ────────────────────────────────────────────────────────────
    HERO CLOCK INITIALIZATION
──────────────────────────────────────────────────────────── */
let heroSize = 280;
let heroCVS, heroCtx;

function initHeroClock() {
  const wsL  = document.getElementById('ws-l');
  const wrap = document.getElementById('hero-clock-wrap');
  heroCVS    = document.getElementById('hero-clock');
  heroCtx    = heroCVS.getContext('2d');

  const probe = document.createElement('span');
  probe.style.cssText = [
    'font-family:"Bebas Neue",Impact,sans-serif',
    `font-size:${getComputedStyle(wsL).fontSize}`,
    'visibility:hidden','position:absolute','white-space:nowrap','line-height:1',
  ].join(';');
  probe.textContent = 'O';
  document.body.appendChild(probe);
  const bw = probe.offsetWidth;
  const bh = probe.offsetHeight;
  document.body.removeChild(probe);

  heroSize = Math.round(Math.min(bw, bh) * 1.02);
  heroSize = Math.max(heroSize, 60);

  wrap.style.width  = heroSize + 'px';
  wrap.style.height = heroSize + 'px';
  heroCVS.width = heroCVS.height = heroSize;

  const dpr = window.devicePixelRatio || 1;
  heroCVS.width  = heroSize * dpr;
  heroCVS.height = heroSize * dpr;
  heroCVS.style.width  = heroSize + 'px';
  heroCVS.style.height = heroSize + 'px';
  heroCtx.scale(dpr, dpr);
}

(function heroLoop() {
  if (heroCtx) {
    drawClock(heroCtx, heroSize, new Date(), {
      accentColor: '#c8a97e',
      glow:        1.5,
      numerals:    true,
      faceLight:   true,
    });
  }
  requestAnimationFrame(heroLoop);
})();

document.fonts.ready.then(initHeroClock);
let rsT;
window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(initHeroClock,140); });

/* ────────────────────────────────────────────────────────────
    PARTICLES
──────────────────────────────────────────────────────────── */
(function() {
  const cvs = document.getElementById('pc');
  const ctx = cvs.getContext('2d');
  const N=100; let W,H,pts=[];
  const resize=()=>{ W=cvs.width=window.innerWidth; H=cvs.height=window.innerHeight; };
  window.addEventListener('resize',resize); resize();
  class P {
    constructor(){ this.reset(); }
    reset(){
      this.x=Math.random()*W; this.y=Math.random()*H;
      this.r=Math.random()*1.2+.3;
      this.vx=(Math.random()-.5)*.13; this.vy=(Math.random()-.5)*.13;
      this.a=Math.random()*.4+.07;
      this.da=(Math.random()*.003+.001)*(Math.random()>.5?1:-1);
    }
    tick(){
      this.x+=this.vx; this.y+=this.vy; this.a+=this.da;
      if(this.a<.04||this.a>.52) this.da*=-1;
      if(this.x<-4||this.x>W+4||this.y<-4||this.y>H+4) this.reset();
    }
    draw(){ ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`rgba(200,169,126,${this.a})`; ctx.fill(); }
  }
  pts=Array.from({length:N},()=>new P());
  (function loop(){ ctx.clearRect(0,0,W,H); pts.forEach(p=>{p.tick();p.draw();}); requestAnimationFrame(loop); })();
})();

/* ────────────────────────────────────────────────────────────
    GSAP ANIMATIONS
──────────────────────────────────────────────────────────── */
(function() {
  gsap.from('.sec-head', {
    opacity: 0, y: 55, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#timezones', start: 'top 82%' }
  });
  ScrollTrigger.batch('.card', {
    start: 'top 92%', once: true,
    onEnter: b => gsap.from(b, {
      opacity: 0, y: 48, stagger: .09, duration: .75, ease: 'power3.out'
    })
  });
})();

/* ────────────────────────────────────────────────────────────
    TIMEZONE GRID
──────────────────────────────────────────────────────────── */
const localDate = tz => new Date(new Date().toLocaleString('en-US',{timeZone:tz}));

(function() {
  const grid=document.getElementById('grid');
  const SZ=148;
  const cards=[];

  TZ.forEach((tz,i)=>{
    const card=document.createElement('div'); card.className='card';
    const dpr=window.devicePixelRatio||1;
    const cvs=document.createElement('canvas'); cvs.className='card-cvs';
    cvs.width=cvs.height=SZ*dpr;
    cvs.style.width=cvs.style.height=SZ+'px';
    const ctx=cvs.getContext('2d'); ctx.scale(dpr,dpr);

    const body=document.createElement('div'); body.className='card-body';
    body.innerHTML=`
      <div class="card-city">${tz.city}</div>
      <div class="card-tz">${tz.label}</div>
      <div class="card-dig" id="dig${i}">--:--:--</div>
    `;
    const hint=document.createElement('div'); hint.className='card-hint'; hint.textContent='Expand ↗';
    card.append(cvs,body,hint);
    grid.appendChild(card);
    cards.push({ctx,tz,SZ});

    card.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
    card.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
    card.addEventListener('click',()=>openModal(tz));
  });

  (function tick(){
    cards.forEach(({ctx,tz,SZ})=>{
      drawClock(ctx,SZ,localDate(tz.tz),{accentColor:tz.acc,glow:.72,numerals:false});
    });
    TZ.forEach((tz,i)=>{
      const el=document.getElementById(`dig${i}`);
      if(el) el.textContent=localDate(tz.tz).toLocaleTimeString('en-US',{
        hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:tz.tz
      });
    });
    requestAnimationFrame(tick);
  })();
})();

/* ────────────────────────────────────────────────────────────
    MODAL LOGIC
──────────────────────────────────────────────────────────── */
let mRAF=null;
function openModal(tz){
  const modal=document.getElementById('modal');
  const cvs=document.getElementById('modal-cvs');
  const ctx=cvs.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const sz=Math.min(Math.round(window.innerWidth*.64),Math.round(window.innerHeight*.5),500);
  cvs.width=cvs.height=sz*dpr;
  cvs.style.width=cvs.style.height=sz+'px';
  ctx.scale(dpr,dpr);
  document.getElementById('m-city').textContent=`${tz.city}, ${tz.country}`;
  document.getElementById('m-tz').textContent=tz.label;
  modal.classList.add('open');
  document.body.style.overflow='hidden';
  if(mRAF) cancelAnimationFrame(mRAF);
  (function tick(){
    const now=localDate(tz.tz);
    drawClock(ctx,sz,now,{accentColor:tz.acc,glow:2,numerals:true});
    document.getElementById('m-dig').textContent=now.toLocaleTimeString('en-US',{
      hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true,timeZone:tz.tz
    });
    mRAF=requestAnimationFrame(tick);
  })();
}

function closeModal(){
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow='';
  if(mRAF){cancelAnimationFrame(mRAF);mRAF=null;}
}

document.getElementById('modal-close').addEventListener('click',closeModal);
document.getElementById('modal').addEventListener('click',e=>{ if(e.target===document.getElementById('modal')) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

/* ────────────────────────────────────────────────────────────
    CUSTOM CURSOR & SCROLL
──────────────────────────────────────────────────────────── */
(function(){
  const dot=document.getElementById('c-dot'), ring=document.getElementById('c-ring');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{ mx=e.clientX;my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  (function loop(){ rx+=(mx-rx)*.1; ry+=(my-ry)*.1; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
})();


/* ────────────────────────────────────────────────────────────
    WORLD MAP SECTION
──────────────────────────────────────────────────────────── */
(function() {

  /* City coordinates as [lon, lat] — matched to TZ array */
  const CITY_COORDS = [
    { city:'New York',    lon:-74.0060,  lat:40.7128  },
    { city:'London',      lon:-0.1278,   lat:51.5074  },
    { city:'Paris',       lon:2.3522,    lat:48.8566  },
    { city:'Dubai',       lon:55.2708,   lat:25.2048  },
    { city:'Mumbai',      lon:72.8777,   lat:19.0760  },
    { city:'Singapore',   lon:103.8198,  lat:1.3521   },
    { city:'Tokyo',       lon:139.6917,  lat:35.6895  },
    { city:'Sydney',      lon:151.2093,  lat:-33.8688 },
    { city:'Los Angeles', lon:-118.2437, lat:34.0522  },
    { city:'São Paulo',   lon:-46.6333,  lat:-23.5505 },
  ];

  const cvs = document.getElementById('wm-canvas');
  const ctx = cvs.getContext('2d');
  const pinsEl = document.getElementById('wm-pins');

  /* ── Equirectangular projection ── */
  function project(lon, lat, W, H, padX, padY) {
    const x = padX + (lon + 180) / 360 * (W - 2*padX);
    const y = padY + (90 - lat) / 180 * (H - 2*padY);
    return [x, y];
  }

  /* ── World map as simplified SVG path data ── */
  /* Using a clean Mercator-ish simplified world outline */
  const WORLD_SVG_PATH = `
M 181,54 L 184,48 L 191,45 L 198,43 L 207,45 L 214,42 L 224,38 L 236,36 L 243,40
L 252,43 L 254,48 L 248,52 L 241,55 L 235,57 L 228,54 L 220,56 L 213,55 L 205,58
L 196,57 L 190,60 L 184,58 Z
M 100,62 L 108,58 L 118,55 L 126,53 L 130,57 L 127,63 L 120,68 L 113,70 L 106,67 Z
M 430,48 L 440,44 L 452,42 L 463,44 L 474,47 L 480,52 L 476,58 L 468,60 L 458,62
L 447,60 L 438,56 L 432,52 Z
`;

  /* ── Build world map using GeoJSON-inspired simplified coordinates ──
     We'll draw it as a series of simplified continent outlines using
     relative coordinate polygons mapped to canvas space.
  */

  /* Simplified continent outline data as lon/lat polygon arrays */
  const CONTINENTS = [
    /* North America */
    [[-168,72],[-140,74],[-120,74],[-100,72],[-82,70],[-70,68],[-65,66],
     [-60,62],[-64,58],[-60,52],[-54,48],[-60,46],[-66,44],[-70,42],[-74,40],
     [-76,36],[-80,32],[-82,28],[-80,24],[-84,22],[-88,20],[-90,18],[-92,18],
     [-96,20],[-100,22],[-105,22],[-110,24],[-114,28],[-118,32],[-122,36],
     [-124,40],[-124,46],[-122,50],[-126,54],[-130,56],[-134,58],[-138,60],
     [-140,60],[-145,62],[-150,62],[-155,60],[-160,60],[-165,64],[-168,66],
     [-168,72]],
    /* Greenland */
    [[-50,84],[-30,84],[-18,80],[-18,76],[-24,72],[-36,68],[-48,66],
     [-54,68],[-56,72],[-54,78],[-50,82],[-50,84]],
    /* South America */
    [[-82,10],[-78,14],[-74,12],[-70,12],[-68,14],[-60,10],[-56,6],
     [-52,4],[-50,2],[-50,-2],[-44,-4],[-38,-8],[-36,-12],[-38,-16],
     [-40,-20],[-42,-22],[-44,-24],[-46,-26],[-50,-28],[-52,-32],
     [-54,-36],[-64,-42],[-66,-46],[-68,-50],[-70,-54],[-70,-58],
     [-66,-56],[-60,-52],[-56,-50],[-52,-48],[-52,-44],[-54,-38],
     [-52,-34],[-50,-30],[-50,-26],[-48,-24],[-46,-20],[-48,-16],
     [-50,-12],[-52,-8],[-54,-4],[-58,-2],[-62,0],[-66,2],
     [-70,6],[-74,8],[-78,8],[-82,10]],
    /* Europe */
    [[-10,36],[-6,36],[-2,36],[2,38],[8,38],[14,40],[18,40],[20,38],
     [24,38],[28,42],[30,44],[32,46],[28,48],[24,50],[20,54],[18,56],
     [20,58],[22,60],[24,62],[22,64],[18,66],[14,68],[10,70],[6,68],
     [4,62],[0,60],[-4,58],[-6,56],[-8,52],[-10,48],[-10,44],[-8,40],
     [-6,38],[-10,36]],
    /* Scandinavia */
    [[5,58],[8,56],[10,56],[12,58],[14,62],[14,66],[16,68],[18,70],
     [20,70],[24,70],[28,70],[30,68],[28,64],[26,62],[24,60],[22,58],
     [20,56],[16,56],[14,56],[12,56],[10,56],[5,58]],
    /* Africa */
    [[-18,16],[-14,10],[-18,6],[-16,2],[-10,-2],[-8,-4],[-8,-8],
     [-14,-12],[-12,-18],[-18,-22],[-18,-28],[-16,-34],[-14,-38],
     [-18,-36],[-24,-34],[-30,-32],[-34,-28],[-36,-24],[-34,-20],
     [-36,-16],[-38,-10],[-36,-4],[-32,0],[-30,4],[-28,8],[-26,10],
     [-26,14],[-22,16],[-18,20],[-14,20],[-8,18],[-4,16],
     [2,14],[8,12],[12,10],[14,6],[18,4],[22,2],[26,2],[30,4],
     [36,6],[38,8],[40,12],[42,14],[44,12],[40,10],[38,6],[36,2],
     [34,-2],[36,-6],[36,-12],[34,-18],[32,-22],[32,-28],[30,-34],
     [26,-34],[22,-34],[18,-34],[14,-34],[8,-34],[4,-34],[2,-28],
     [-2,-24],[-4,-18],[-4,-12],[-2,-6],[-4,-2],[-8,4],[-12,8],
     [-16,12],[-18,16]],
    /* Asia mainland */
    [[30,70],[40,70],[50,68],[60,68],[70,70],[80,72],[90,74],[100,72],
     [110,70],[120,68],[130,68],[140,66],[150,62],[160,60],[166,64],
     [168,66],[165,60],[160,54],[160,48],[156,44],[150,40],[145,36],
     [140,32],[138,28],[138,22],[134,20],[130,18],[126,18],[122,24],
     [116,22],[110,22],[106,20],[102,22],[98,22],[94,24],[90,22],
     [86,18],[82,16],[78,12],[76,10],[72,12],[68,22],[66,26],[62,24],
     [60,22],[56,20],[52,22],[50,26],[48,30],[44,36],[40,38],[36,38],
     [30,40],[26,42],[28,46],[28,50],[26,52],[26,56],[30,58],[30,62],
     [28,66],[30,70]],
    /* Indian subcontinent */
    [[68,22],[72,22],[76,20],[80,14],[82,10],[80,8],[78,8],[76,10],
     [74,16],[72,20],[68,22]],
    /* Japan */
    [[130,32],[132,34],[134,34],[136,36],[138,38],[140,40],[140,44],
     [142,44],[144,42],[144,38],[142,34],[140,32],[138,30],[136,30],
     [134,32],[132,32],[130,32]],
    /* Southeast Asia */
    [[98,20],[100,16],[102,14],[104,10],[104,6],[106,2],[108,0],
     [110,2],[112,4],[116,6],[120,4],[122,4],[124,8],[122,12],[118,16],
     [114,18],[110,20],[106,20],[102,22],[98,20]],
    /* Australia */
    [[114,-22],[118,-20],[122,-18],[128,-16],[132,-14],[136,-12],[140,-14],
     [144,-18],[148,-22],[152,-26],[154,-28],[152,-32],[152,-36],[148,-38],
     [146,-40],[142,-38],[140,-36],[136,-36],[134,-32],[130,-30],[128,-32],
     [126,-34],[122,-34],[118,-32],[114,-28],[114,-24],[114,-22]],
    /* New Zealand (approximate) */
    [[172,-34],[174,-36],[176,-38],[178,-40],[177,-42],[176,-44],[174,-44],
     [172,-42],[171,-40],[171,-38],[172,-36],[172,-34]],
    /* Madagascar */
    [[44,-12],[46,-14],[50,-18],[50,-22],[48,-24],[46,-24],[44,-22],
     [44,-18],[44,-14],[44,-12]],
    /* UK - approximate */
    [[-6,50],[-2,50],[2,52],[0,54],[-2,56],[-4,58],[-6,58],[-6,54],
     [-4,52],[-6,50]],
    /* Iceland */
    [[-24,64],[-14,64],[-12,66],[-16,68],[-22,66],[-24,64]],
    /* Sri Lanka */
    [[80,10],[82,8],[82,6],[80,6],[80,8],[80,10]],
  ];

  let W = 0, H = 0, dpr = window.devicePixelRatio || 1;
  let shimmerOffset = 0;

  function resize() {
    const stageW = cvs.parentElement.clientWidth - 64;
    W = Math.min(stageW, 1136);
    H = Math.round(W * 0.52);
    cvs.width  = W * dpr;
    cvs.height = H * dpr;
    cvs.style.width  = W + 'px';
    cvs.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    positionPins();
  }

  function lonLatToCanvas(lon, lat) {
    const padX = W * 0.02;
    const padY = H * 0.04;
    return project(lon, lat, W, H, padX, padY);
  }

  function drawMap(shimmer) {
    ctx.clearRect(0, 0, W, H);

    /* subtle vignette behind map */
    const vign = ctx.createRadialGradient(W/2, H/2, H*.1, W/2, H/2, H*.8);
    vign.addColorStop(0, 'rgba(200,169,126,.012)');
    vign.addColorStop(1, 'transparent');
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, W, H);

    CONTINENTS.forEach(poly => {
      if (!poly.length) return;
      ctx.beginPath();
      poly.forEach(([lon, lat], idx) => {
        const [x, y] = lonLatToCanvas(lon, lat);
        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();

      /* Layered glow — three passes */
      /* Pass 1: wide soft halo */
      ctx.save();
      ctx.shadowColor = 'rgba(200,169,126,0.38)';
      ctx.shadowBlur  = 28 + Math.sin(shimmer) * 6;
      ctx.strokeStyle = 'rgba(200,169,126,0.0)';
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.restore();

      /* Pass 2: medium glow */
      ctx.save();
      ctx.shadowColor = 'rgba(220,185,120,0.55)';
      ctx.shadowBlur  = 12 + Math.sin(shimmer + 1) * 3;
      ctx.strokeStyle = 'rgba(200,169,126,0.55)';
      ctx.lineWidth   = 1.1;
      ctx.stroke();
      ctx.restore();

      /* Pass 3: crisp edge */
      ctx.save();
      ctx.shadowColor = 'rgba(240,210,150,0.22)';
      ctx.shadowBlur  = 4;
      ctx.strokeStyle = 'rgba(230,200,148,0.85)';
      ctx.lineWidth   = 0.65;
      ctx.stroke();
      ctx.restore();

      /* very subtle fill */
      ctx.fillStyle = `rgba(200,169,126,${0.012 + Math.sin(shimmer*.7)*.004})`;
      ctx.fill();
    });

    /* latitude/longitude faint grid lines */
    ctx.save();
    ctx.setLineDash([2, 8]);
    ctx.strokeStyle = 'rgba(200,169,126,0.055)';
    ctx.lineWidth   = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      const [,y] = lonLatToCanvas(0, lat);
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let lon = -150; lon <= 150; lon += 60) {
      ctx.beginPath();
      const [x,] = lonLatToCanvas(lon, 0);
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  /* ── City pin tooltips ── */
  function positionPins() {
    const allPins = pinsEl.querySelectorAll('.wm-pin');
    const stageRect = cvs.getBoundingClientRect();
    const stageParentRect = cvs.parentElement.getBoundingClientRect();
    const offsetX = (stageParentRect.width - W) / 2;
    const offsetY = 0;

    CITY_COORDS.forEach(({city, lon, lat}, i) => {
      const [cx, cy] = lonLatToCanvas(lon, lat);
      const pin = allPins[i];
      if (!pin) return;
      pin.style.left = (offsetX + cx) + 'px';
      pin.style.top  = (offsetY + cy) + 'px';
    });
  }

  function buildPins() {
    pinsEl.innerHTML = '';
    CITY_COORDS.forEach(({city}, i) => {
      const tzData = TZ.find(t => t.city === city);
      const pin = document.createElement('div');
      pin.className = 'wm-pin';
      pin.innerHTML = `
        <div class="wm-pin-dot"></div>
        <div class="wm-tooltip">
          <div class="wm-tip-city">${city}</div>
          <div class="wm-tip-time" id="wm-tip-${i}">--:--</div>
        </div>
      `;
      pinsEl.appendChild(pin);
    });
    positionPins();

    /* tick times in tooltips */
    function tickTips() {
      CITY_COORDS.forEach(({city}, i) => {
        const tzData = TZ.find(t => t.city === city);
        const el = document.getElementById(`wm-tip-${i}`);
        if (el && tzData) {
          el.textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tzData.tz
          });
        }
      });
      requestAnimationFrame(tickTips);
    }
    tickTips();
  }

  /* ── Animation loop ── */
  function loop(ts) {
    shimmerOffset = ts * 0.0008;
    drawMap(shimmerOffset);
    requestAnimationFrame(loop);
  }

  /* ── Init ── */
  resize();
  buildPins();
  requestAnimationFrame(loop);

  let rsWM;
  window.addEventListener('resize', () => {
    clearTimeout(rsWM);
    rsWM = setTimeout(() => { resize(); positionPins(); }, 120);
  });

  /* ── GSAP entrance animation ── */
  gsap.from('#worldmap .wm-head', {
    opacity: 0, y: 45, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#worldmap', start: 'top 82%' }
  });
  gsap.from('.wm-stage', {
    opacity: 0, scale: .97, duration: 1.3, ease: 'power3.out',
    scrollTrigger: { trigger: '#worldmap', start: 'top 75%' }
  });
  gsap.from('.wm-caption', {
    opacity: 0, duration: 1, delay: .4, ease: 'power2.out',
    scrollTrigger: { trigger: '#worldmap', start: 'top 70%' }
  });

})();
