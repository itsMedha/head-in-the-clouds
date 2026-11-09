(function(){"use strict";
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
var $=function(s,r){return (r||document).querySelector(s)};
var clamp=function(v,a,b){return v<a?a:v>b?b:v};
var smooth=function(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
var esc=function(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML};

/* =================== ASCII ENGINE =================== */
var cv=$("#ascii"),cx=cv.getContext("2d"),photo=$("#photo"),veil=$("#veil");
var RAMP=" .'`:-=+*oO#%@",atlas,cw,ch,dW,dH,W,H,PAD,cloud,rnd,handL,handR,dpr;
function buildAtlas(){
  atlas=document.createElement("canvas");atlas.width=dW*RAMP.length;atlas.height=dH;
  var a=atlas.getContext("2d");a.font="500 "+Math.round(dH*.82)+"px 'JetBrains Mono','Courier New',monospace";
  a.textBaseline="middle";a.textAlign="center";a.fillStyle="#fffdf6";
  for(var i=0;i<RAMP.length;i++)a.fillText(RAMP[i],(i+.5)*dW,dH*.54);
}
function coverSample(img,w,h){
  var c=document.createElement("canvas");c.width=w;c.height=h;var g=c.getContext("2d",{willReadFrequently:true});
  var ir=img.naturalWidth/img.naturalHeight,vr=(w*cw)/(h*ch),sw,sh;
  if(ir>vr){sh=img.naturalHeight;sw=sh*vr}else{sw=img.naturalWidth;sh=sw/vr}
  g.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,0,0,w,h);
  return g.getImageData(0,0,w,h).data;
}
/* The hands are sculpted and lit renders of the Creation of Adam pose. Each image is
   sampled into a tone field so light and shadow survive as character density. */
var IMG={adam:new Image(),god:new Image()};IMG.adam.src="assets/adam.png";IMG.god.src="assets/god.png";
var TIP={adam:880,god:120},TIPY=286.67,IMW=1000,IMH=600;
function buildField(){
  var fw=W+PAD,c=document.createElement("canvas");c.width=fw;c.height=H;
  var g=c.getContext("2d",{willReadFrequently:true});g.imageSmoothingQuality="high";
  var vw=innerWidth,vh=innerHeight,small=vw<640;
  var s=small?vw/860:Math.min(vw/1500,vh/760),img=1.5*s,cy=vh*(small?.49:.6),gap=11*s;
  function bake(im,tip,tipX,oxCss){
    var out=new Float32Array(fw*H);if(!im.naturalWidth)return out;
    g.clearRect(0,0,fw,H);
    var dx=(oxCss+tipX-tip*img)/cw,dy=(cy-TIPY*img)/ch;
    g.drawImage(im,dx,dy,IMW*img/cw,IMH*img/ch);
    var d=g.getImageData(0,0,fw,H).data;
    for(var i=0;i<fw*H;i++){var a=d[i*4+3]/255;if(a<.5)continue;
      var l=clamp((d[i*4]/255-.14)/.8,0,1);out[i]=.13+.82*l*l*(3-2*l)}
    return out;
  }
  handL=bake(IMG.adam,TIP.adam,vw/2-gap,0);
  handR=bake(IMG.god,TIP.god,vw/2+gap,PAD*cw);
}
function resize(){
  dpr=Math.min(devicePixelRatio||1,1.75);
  var vw=innerWidth,vh=innerHeight;
  cw=vw<640?4:vw<1100?5:6;ch=Math.round(cw*1.72);
  W=Math.ceil(vw/cw);H=Math.ceil(vh/ch);PAD=Math.ceil(W*.55);
  dW=Math.max(2,Math.round(cw*dpr));dH=Math.max(2,Math.round(ch*dpr));
  cv.width=W*dW;cv.height=H*dH;
  buildAtlas();
  rnd=new Float32Array(W*H);for(var r=0;r<rnd.length;r++)rnd[r]=Math.random();
  cloud=new Float32Array(W*H);
  if(photo.naturalWidth){var d=coverSample(photo,W,H);
    for(var i=0;i<W*H;i++){cloud[i]=clamp((d[i*4]-62)/158,0,1)}}
  buildField();
}

/* =================== INTRO TIMELINE =================== */
var frozen=false,T_END=5.6,tl=RM?T_END:0,playing=!RM,last=0,lastDraw=0,ptr={x:innerWidth*.72,y:innerHeight*.3,on:false},lens=0;
var headEl=$("#head"),spread=RM?1:0;
function intro(t){
  var dissolve=smooth(.25,1,t);
  var form=smooth(.95,2.75,t)*(1-smooth(3.75,4.95,t));
  var slide=Math.round(PAD*(1-smooth(.95,2.75,t)+smooth(3.75,4.95,t)));
  var touch=t>2.7?clamp(1-(t-2.7)/.9,0,1):0;
  var ringR=(t-2.7)*W*.62;
  veil.style.opacity=(dissolve*(1-smooth(3.95,5.2,t))).toFixed(3);
  var rev=smooth(.1,.95,t)*1.25,back=smooth(4.2,5.5,t);
  var fw=W+PAD,cxC=W/2,cyC=Math.round(H*(innerWidth<640?.49:.6)),gA=1-back*.9;
  for(var y=0;y<H;y++)for(var x=0;x<W;x++){
    var i=y*W+x,n=rnd[i];
    var diag=(x/W*.6+y/H*.4);
    if(rev<diag+n*.25)continue;
    var c=cloud[i]*(1-form*.8);
    var h=Math.max(handL[y*fw+clamp(x+slide,0,fw-1)],handR[y*fw+clamp(x-slide+PAD,0,fw-1)]);
    var mix=clamp(form*1.75-n*.75,0,1);
    var v=c+(h-c)*mix*(h>0?1:.88);
    if(touch>0){var dx=(x-cxC)*.58,dy=y-cyC,d=Math.sqrt(dx*dx+dy*dy)-ringR*.58;v+=Math.max(0,1-Math.abs(d)/3)*touch*.9}
    if(v<.055)continue;
    var k=clamp(Math.round(v*(RAMP.length-1)+(n-.5)*1.2),1,RAMP.length-1);
    cx.globalAlpha=clamp((.34+v*.72)*gA,0,1);
    cx.drawImage(atlas,k*dW,0,dW,dH,x*dW,y*dH,dW,dH);
  }
  cx.globalAlpha=1;
  /* The head is born where the fingertips meet, the orbit follows it. */
  var hs=smooth(2.72,3.62,t),over=1+Math.sin(clamp((t-3.1)/.6,0,1)*3.14)*.05;
  headEl.style.opacity=hs>.01?1:0;
  headEl.style.transform="translateY(-50%) scale("+(.03+.97*hs)*over+")";
  spread=smooth(3.6,4.9,t);
  if(t>3.75&&!document.body.classList.contains("ready")){document.body.classList.add("ready");typeLine()}
}
function hero(t){
  lens+=((ptr.on?1:0)-lens)*.12;
  var pxC=ptr.x/cw,pyC=ptr.y/ch,R=(innerWidth<640?120:210)/cw,sw=(t*.32)%1.6-.3;
  if(lens>.01){
    var g=cx.createRadialGradient(ptr.x*dW/cw,ptr.y*dH/ch,0,ptr.x*dW/cw,ptr.y*dH/ch,R*dW);
    g.addColorStop(0,"rgba(47,111,176,"+.94*lens+")");g.addColorStop(.62,"rgba(47,111,176,"+.86*lens+")");g.addColorStop(1,"rgba(47,111,176,0)");
    cx.fillStyle=g;cx.fillRect(0,0,cv.width,cv.height);
  }
  var tq=Math.floor(t*7);
  for(var y=0;y<H;y++)for(var x=0;x<W;x++){
    var i=y*W+x,v=cloud[i],n=rnd[i];
    var dx=x-pxC,dy=(y-pyC)*(ch/cw),d=Math.sqrt(dx*dx+dy*dy),l=lens*(1-smooth(R*.55,R,d));
    var wave=Math.max(0,1-Math.abs(x/W-sw)*5.5);
    var amb=RM?0:v*.2*wave*wave;
    var a=Math.max(amb,l*(.42+v*.62));
    if(a<.02)continue;
    if(v<.08&&l<.1)continue;
    var q=Math.max(v,l*.1);
    var k=clamp(Math.round(q*(RAMP.length-1)+((n*97+tq*(n>.82?1:0))%1-.5)*1.5),1,RAMP.length-1);
    cx.globalAlpha=a;
    cx.drawImage(atlas,k*dW,0,dW,dH,x*dW,y*dH,dW,dH);
  }
  cx.globalAlpha=1;
}

/* =================== ORBIT =================== */
var FOLDERS=[
 {id:"filespace",name:"FileSpace",hook:"~60% fewer clicks"},
 {id:"bookrush",name:"BookRush",hook:"track this order"},
 {id:"usersync",name:"User Sync",hook:"crash it on purpose"},
 {id:"uiux",name:"UI/UX",hook:"two case studies"},
 {id:"skills",name:"Skills",hook:"ask for proof"},
 {id:"experience",name:"Experience",hook:"read it bottom-up"},
 {id:"quests",name:"Side Quests",hook:"ducks: ongoing"}
];
var orbit=$("#orbit"),rot=.5,vel=0,targetRot=null,hoverN=0;
FOLDERS.forEach(function(f,i){
  var b=document.createElement("button");b.className="fold";b.type="button";b.dataset.id=f.id;
  b.innerHTML='<span class="hov"><span class="art" aria-hidden="true"><img class="c" src="assets/folder1.png" alt=""><img class="o" src="assets/folder2.png" alt=""></span><span class="tag">'+f.name+'<span class="hook">'+f.hook+'</span></span></span>';
  b.setAttribute("aria-label",f.name+". "+f.hook);
  f.el=b;f.a=i/FOLDERS.length*Math.PI*2;
  b.addEventListener("pointerenter",function(){hoverN++});
  b.addEventListener("pointerleave",function(){hoverN=Math.max(0,hoverN-1)});
  b.addEventListener("focus",function(){if(b.matches(":focus-visible")){targetRot=Math.PI/2-f.a;gazeLock=f}});
  b.addEventListener("blur",function(){gazeLock=null});
  b.addEventListener("click",function(){if(!moved)openSection(f.id==="quests"?"sidequests":f.id,b)});
  orbit.appendChild(b);f.x=0;
});
function placeOrbit(){
  var vw=innerWidth,vh=innerHeight,small=vw<640;
  var Rx=(small?vw*.33:Math.min(vw*.4,720))*spread,Ry=(small?vh*.205:vh*.21)*spread;
  FOLDERS.forEach(function(f){
    var a=f.a+rot,s=Math.sin(a),c=Math.cos(a),depth=(s+1)/2;
    f.x=c*Rx;
    var sc=(.78+depth*.34)*(.4+.6*spread);
    var ry=-c*26;
    f.el.style.transform="translate3d("+(c*Rx).toFixed(1)+"px,"+(s*Ry).toFixed(1)+"px,0) scale("+sc.toFixed(3)+")";
    $(".art",f.el).style.transform="perspective(700px) rotateY("+ry.toFixed(1)+"deg)";
    /* the head sits at z 30: the front half of the orbit passes over it, the back half behind */
    f.el.style.zIndex=f.el.matches(":hover")?55:s>0?40+Math.round(depth*10):10+Math.round(depth*10);
    f.el.style.opacity=clamp(spread*1.6,0,1);
    f.el.style.pointerEvents=document.body.classList.contains("ready")?"auto":"none";
  });
  orbit.style.zIndex="auto";
}
/* #orbit has no stacking context of its own, so folders sort around the head (z 30). */

/* =================== EYES + POINTER =================== */
var tiltEl=$("#headTilt"),tx=0,ty=0,sayA=$("#say .s1"),sayB=$("#say .s2"),winGaze=null,gazeLock=null,lastMove=-1e9;
var EY=[{el:$("#irisL"),cx:.3781,cy:.3949,x:0,y:0,vx:0,vy:0,lid:$("#lidL i")},{el:$("#irisR"),cx:.607,cy:.3943,x:0,y:0,vx:0,vy:0,lid:$("#lidR i")}];
var polyL=[[259.5, 322.0], [265.5, 317.0], [275.0, 313.0], [286.2, 310.5], [300.0, 309.0], [312.5, 309.5], [323.8, 314.5], [332.5, 322.5], [340.0, 330.5], [343.8, 336.5], [335.0, 338.0], [325.0, 340.5], [310.0, 342.5], [295.0, 342.5], [282.5, 340.5], [271.2, 335.5], [263.8, 328.8]],polyR=[[443.8, 335.0], [450.0, 327.5], [457.5, 321.2], [467.5, 314.5], [480.0, 310.5], [495.0, 309.5], [507.5, 310.5], [517.5, 314.5], [525.0, 320.5], [527.5, 326.2], [522.5, 332.0], [512.5, 337.5], [500.0, 340.5], [482.5, 341.8], [465.0, 341.0], [452.5, 338.5]];
function pct(p){return "polygon("+p.map(function(q){return (q[0]/8).toFixed(2)+"% "+(q[1]/8.23).toFixed(2)+"%"}).join(",")+")"}
$("#lidL").style.clipPath=pct(polyL);$("#lidR").style.clipPath=pct(polyR);
var wander={x:0,y:0,next:0},jit={x:0,y:0,next:0},blink={next:2.4,t:-1,again:false};
function gazeTarget(now){
  if(gazeLock){var f=gazeLock.el.getBoundingClientRect();return {x:f.left+f.width/2,y:f.top+f.height/2}}
  if(now-lastMove<2600)return ptr;
    if(now>wander.next){var r=headEl.getBoundingClientRect();wander.x=r.left+r.width/2+(Math.random()-.5)*innerWidth*.8;wander.y=r.top+r.height*.4+(Math.random()-.5)*innerHeight*.5;wander.next=now+1400+Math.random()*2800}
  return wander;
}
function updateEyes(now,dt){
  var r=headEl.getBoundingClientRect(),t=gazeTarget(now);
  if(now>jit.next){jit.x=(Math.random()-.5)*1.3;jit.y=(Math.random()-.5)*.7;jit.next=now+700+Math.random()*1700}
  EY.forEach(function(e){
    var ex=r.left+e.cx*r.width,ey=r.top+e.cy*r.height,dx=t.x-ex,dy=t.y-ey,d=Math.hypot(dx,dy)||1;
    var m=1-Math.exp(-d/(r.width*.42));
    /* range in source pixels: the opening is wide and shallow, so x travels much further than y */
    var gx=dx/d*m*16.5+jit.x,gy=dy/d*m*4.6+jit.y;
    if(RM){e.x=gx;e.y=gy}
    else{var k=150,c=21,st=Math.min(dt,.033);e.vx+=(k*(gx-e.x)-c*e.vx)*st;e.vy+=(k*(gy-e.y)-c*e.vy)*st;e.x+=e.vx*st;e.y+=e.vy*st}
    e.el.style.transform="translate("+(e.x/46*100).toFixed(2)+"%,"+(e.y/46*100).toFixed(2)+"%)";
  });
  if(RM)return;
  var s=now/1000;
  if(blink.t<0&&s>blink.next){blink.t=s}
  var b=0;
  if(blink.t>=0){var p=(s-blink.t)/.17;if(p>=1){blink.t=-1;if(!blink.again&&Math.random()<.18){blink.again=true;blink.next=s+.09}else{blink.again=false;blink.next=s+2.2+Math.random()*4.2}}else b=Math.sin(p*Math.PI)}
  var yo=-105+b*105;EY[0].lid.style.transform=EY[1].lid.style.transform="translateY("+yo.toFixed(1)+"%)";
}
var stage=$("#stage"),down=null,moved=false;
function onMove(e){ptr.x=e.clientX;ptr.y=e.clientY;ptr.on=true;lastMove=performance.now();
  if(down){var dx=e.clientX-down.x;if(Math.abs(dx)>5)moved=true;if(moved){vel=(e.clientX-down.lx)*.0042;rot+=vel;targetRot=null;var tp=$("#tip");if(tp)tp.classList.add("gone")}down.lx=e.clientX}}
addEventListener("pointermove",onMove);
document.documentElement.addEventListener("pointerleave",function(){ptr.on=false});
stage.addEventListener("pointerdown",function(e){if(!playing&&!inRoom){down={x:e.clientX,lx:e.clientX};moved=false}});
addEventListener("pointerup",function(e){down=null;if(e.pointerType==="touch")ptr.on=false;setTimeout(function(){moved=false},0)});

var typedEl=$("#typed"),typeTimer;
function typeLine(){
  if(RM)return;clearInterval(typeTimer);var full=["Hands in","the code."],lines=full.join("\n"),i=0;typedEl.textContent="";
  typeTimer=setInterval(function(){i++;typedEl.innerHTML=esc(lines.slice(0,i)).replace("\n",innerWidth<640?" ":"<br>");if(i>=lines.length)clearInterval(typeTimer)},62);
}
/* =================== MAIN LOOP =================== */
function frame(now){
  requestAnimationFrame(frame);
  if(!last)last=now;var dt=Math.min(.05,(now-last)/1000);last=now;
  if(playing&&!frozen){tl+=dt;if(tl>=T_END)endIntro()}
  if(!RM&&!down){
    if(targetRot!==null){var d=((targetRot-rot+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;rot+=d*.1;if(Math.abs(d)<.01)targetRot=null}
    else{vel*=.95;rot+=vel+(hoverN?0:dt*.11)}
  }else if(RM&&targetRot!==null){rot=targetRot;targetRot=null}
  if(!inRoom)placeOrbit();updateEyes(now,dt);
  if(!RM){tx+=((ptr.x/innerWidth-.5)-tx)*.06;ty+=((ptr.y/innerHeight-.5)-ty)*.06;
    tiltEl.style.transform="rotateY("+(tx*13).toFixed(2)+"deg) rotateX("+(-ty*9).toFixed(2)+"deg)";
    if(document.body.classList.contains("ready")){sayA.style.transform="translate("+(-tx*14).toFixed(1)+"px,"+(-ty*6).toFixed(1)+"px)";sayB.style.transform="translate("+(-tx*14).toFixed(1)+"px,"+(-ty*6).toFixed(1)+"px)"}}
  if(inRoom||now-lastDraw<31)return;lastDraw=now;
  cx.clearRect(0,0,cv.width,cv.height);
  if(playing)intro(tl);else hero(now/1000);
}
function endIntro(){var was=document.body.classList.contains("ready");playing=false;tl=T_END;spread=1;veil.style.opacity=0;headEl.style.opacity=1;headEl.style.transform="";document.body.classList.remove("intro");document.body.classList.add("ready");if(!was)typeLine()}
$("#skip").addEventListener("click",endIntro);
addEventListener("keydown",function(e){if(playing&&(e.key==="Escape"||e.key===" "||e.key==="Enter"))endIntro();else if(e.key==="Escape")closeTop()});
stage.addEventListener("pointerdown",function(e){if(playing&&e.target!==$("#skip")&&tl>.5)endIntro()});

/* =================== ROOMS: one full-screen page per folder =================== */
var ROOM_ORDER=[["filespace","FileSpace"],["bookrush","BookRush"],["usersync","User Sync"],["uiux","UI/UX"],["skills","Skills"],["experience","Experience"],["sidequests","Side Quests"]];
var roomEl=null,inRoom=false,roomClean=[],lastFolder=null,toastT;
function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove("on")},2400)}
function copyMail(){var a="hello.medhasingh@gmail.com",d=function(){toast(a)};try{navigator.clipboard.writeText(a).then(function(){toast("Copied "+a)},d)}catch(_){d()}}
$("#btnMail").addEventListener("click",function(e){e.preventDefault();copyMail()});
function paras(t){return t.split(/\n\s*\n/).map(function(p){return "<p>"+esc(p)+"</p>"}).join("")}
function bullets(a){return '<ul class="bul">'+a.map(function(i){return "<li>"+esc(i)+"</li>"}).join("")+"</ul>"}
function rich(v){return typeof v==="string"?paras(v):paras(v.intro)+bullets(v.bullets)}
function sec(h,b){return '<section class="sec"><h3>'+esc(h)+'</h3><div class="txt">'+b+"</div></section>"}
function techs(a){return '<ul class="techs">'+a.map(function(t){return "<li>"+esc(t)+"</li>"}).join("")+"</ul>"}
function band(b){return '<div class="band"><div><b class="v">'+esc(b.statValue)+'</b><span class="t">'+esc(b.statTitle)+'</span><span class="s">'+esc(b.statText)+'</span></div><ul>'+b.points.map(function(p){return "<li><strong>"+esc(p.title)+"</strong>"+esc(p.text)+"</li>"}).join("")+"</ul></div>"}
function pager(id){var i=ROOM_ORDER.findIndex(function(r){return r[0]===id}),n=ROOM_ORDER.length,a=ROOM_ORDER[(i+n-1)%n],b=ROOM_ORDER[(i+1)%n];
  return '<div class="rwrap"><nav class="pager" aria-label="Other sections"><a href="#'+a[0]+'"><small>previous</small>'+a[1]+'</a><a href="#'+b[0]+'"><small>next</small>'+b[1]+"</a></nav></div>"}
function caseStudy(d){
  var links=d.links&&d.links.length?d.links.map(function(l){return '<a class="linkbtn" target="_blank" rel="noopener" href="'+esc(l.url)+'">'+esc(l.label)+" ↗</a>"}).join(""):"<p>"+esc(d.noLinksNote||"Internal enterprise project — source code and live demo are confidential.")+"</p>";
  return '<div class="block"><div class="rwrap story">'+
    sec("Technologies / Tools",techs(d.tech))+sec("Overview",rich(d.overview))+sec("Problem",rich(d.problem))+sec("Solution",rich(d.solution))+
    sec("My Contribution",rich(d.contribution))+sec("Outcome / Results",rich(d.outcome))+sec("Links",links)+"</div></div>";
}
function head(eyebrow,title,when){return '<header class="rhead"><div class="rwrap"><span class="eyebrow">'+esc(eyebrow)+'</span><h1 tabindex="-1">'+esc(title)+"</h1>"+(when?'<span class="when">'+esc(when)+"</span>":"")+"</div></header>"}

var ROOMS={
filespace:function(root){var d=DATA.project1;
  /* Before and after, from one data source. ROWS feeds all three tables, which is the point:
     same rows, three views. The data is invented; the real product is confidential. */
  var ROWS=[
   {name:"Q3_vendor_contracts.pdf",owner:"A. Rao",size:"1.4 MB",bytes:1468006,path:"DemoFiles/Legal",date:"23 Sep 2025",iso:"2025-09-23",tags:["Contract","Retain-6Y"],body:"Vendor agreements for Q3.\nRenewal terms on page 4, signatures pending for two suppliers."},
   {name:"onboarding_checklist.docx",owner:"L. Chen",size:"316 KB",bytes:323584,path:"DemoFiles/HR",date:"23 Sep 2025",iso:"2025-09-23",tags:["HR"],body:"Day 1: accounts and badge.\nWeek 1: team intro, tooling setup, first review."},
   {name:"shift_roster_JIS.txt",owner:"K. Tanaka",size:"1.2 KB",bytes:1198,path:"DemoFiles/Ops",date:"22 Sep 2025",iso:"2025-09-22",tags:["Ops"],body:"Mon to Fri: early shift 06:00, late shift 14:00.\nWeekend cover rotates weekly."},
   {name:"invoice_batch_0421.csv",owner:"M. Ortiz",size:"71 KB",bytes:72704,path:"DemoFiles/Finance",date:"19 Sep 2025",iso:"2025-09-19",tags:["Finance","Retain-10Y"],body:"invoice_id,amount,status\n0421-001,1200.00,paid\n0421-002,860.50,open"},
   {name:"meeting_notes_sept.txt",owner:"S. Iyer",size:"137 B",bytes:137,path:"DemoFiles/Notes",date:"18 Sep 2025",iso:"2025-09-18",tags:["Notes"],body:"Agreed: one screen for search and export.\nNext: review the toolbar."},
   {name:"retention_policy_v2.pdf",owner:"D. Mensah",size:"5.8 MB",bytes:6081740,path:"DemoFiles/Legal",date:"12 Sep 2025",iso:"2025-09-12",tags:["Policy","Retain-6Y"],body:"Records are kept for six years unless a hold applies.\nDisposal needs sign-off."},
   {name:"site_audit_photos.zip",owner:"P. Novak",size:"9.2 MB",bytes:9646899,path:"DemoFiles/Ops",date:"08 Sep 2025",iso:"2025-09-08",tags:["Audit"],body:"Archive: 42 images from the September site audit."},
   {name:"release_summary.html",owner:"R. Haddad",size:"4.2 KB",bytes:4301,path:"DemoFiles/Notes",date:"02 Sep 2025",iso:"2025-09-02",tags:["Notes","Dispose"],body:"Release summary\nSearch, preview and export now live on one screen."}
  ];
  var TOTAL="1,248";
  var COPY={
   before:{h:"Same results. Two places to work.",
    s:"Workspace Main and Raw Data showed the same search results, but each tab had its own layout, preview and actions. Click either window, try the rows.",
    cta:"Merge into one workspace →",
    legend:[
     ["bad","An always-open content panel takes space from the results table."],
     ["bad","Preserve All and Export sit at the bottom, apart from the top toolbar."],
     ["bad","The total count is only in the pager at the bottom."],
     ["bad","The same results again in a second tab, so you had to know which tab a task belonged in."],
     ["good","Double-click opens a row's content. The redesign kept this."],
     ["bad","No Preserve or Export in this view, so finishing a task meant switching tabs."]],
    journey:[["Raw Data: search"],["Double-click to read"],["Switch tab","bad"],["Workspace Main"],["Preserve / Export at the bottom"]]},
   after:{h:"One unified workspace.",
    s:"Search, sort, read and act on one screen. Double-click a row to read it.",
    cta:"← Back to the two tabs",
    legend:[
     ["good","Total items shown up front, so result size is clear at once."],
     ["good","Preserve All, Cross-tabulation and Export grouped in one top-right toolbar."],
     ["good","No always-open panel, so results use the full width."],
     ["good","Double-click opens a row's content on demand; close it to return to results."]],
    journey:[["Search"],["Filter / sort"],["Results"],["Double-click"],["View content"],["Preserve / cross-tabulate / export"]]}
  };
  var SIDE='<span class="fsnav dim">Search History</span><span class="fsnav dim">Audit Log</span><span class="fsnav dim">Export</span>';
  root.innerHTML=head(d.eyebrow,d.title,d.timeframe)+
  '<div class="block fsblock"><div class="rwrap">'+
    '<h2 id="fsH"></h2><p class="lead" id="fsSub"></p>'+
    '<div class="fsctl"><button class="btn pri" id="fsSwap" type="button"></button>'+
    '<label class="fsnotes"><input type="checkbox" id="fsNotes" checked> Show notes</label></div>'+
    '<section class="fsdemo" id="fsStage" data-state="before" data-notes="on" aria-label="Interactive demo">'+
      '<div class="fsbefore" id="fsBefore">'+
        '<article class="fswin fswin-a is-front" id="fsWinA" aria-label="Before: Workspace Main tab">'+
          '<div class="fschrome"><i></i><i></i><i></i><span>Workspace Main</span></div>'+
          '<div class="fsapp"><nav class="fsside">'+
            '<button class="fsnav is-on" data-go="fsWinA" type="button">Workspace Main</button>'+
            '<button class="fsnav" data-go="fsWinB" type="button">Raw Data</button>'+SIDE+'</nav>'+
          '<div class="fsmain">'+
            '<div class="fsbar"><strong>Workspace Main</strong><span class="fssp"></span>'+
              '<span class="fsico" title="Filter"></span><span class="fsico" title="Saved searches"></span><span class="fsico" title="Tags"></span><span class="fsico r" title="Refresh"></span></div>'+
            '<div class="fssplit"><div class="fstbl"><table><thead><tr><th>File Name</th><th style="width:30%">Size</th></tr></thead><tbody id="fsTbA"></tbody></table></div>'+
              '<aside class="fsprev" id="fsPvA" aria-live="polite"></aside></div>'+
            '<div class="fsfoot"><b class="fspin">3</b><span>1–8 of '+TOTAL+'</span><span class="fssp"></span>'+
              '<b class="fspin">2</b><span class="fsbtn solid">Preserve All</span><span class="fsbtn solid">Export</span></div>'+
          '</div></div></article>'+
        '<article class="fswin fswin-b" id="fsWinB" aria-label="Before: Raw Data tab">'+
          '<div class="fschrome"><i></i><i></i><i></i><span>Raw Data</span></div>'+
          '<div class="fsapp"><nav class="fsside">'+
            '<button class="fsnav" data-go="fsWinA" type="button">Workspace Main</button>'+
            '<button class="fsnav is-on" data-go="fsWinB" type="button">Raw Data</button>'+SIDE+'</nav>'+
          '<div class="fsmain">'+
            '<div class="fsbar"><strong>Raw Data</strong><span class="fssp"></span><b class="fspin">4</b>'+
              '<span class="fsico r" title="Refresh"></span><span class="fsico" title="Columns"></span></div>'+
            '<div class="fstbl"><table><thead><tr><th>File Name</th><th style="width:16%">Size</th><th style="width:22%">Path</th><th style="width:22%">Date Created</th></tr></thead><tbody id="fsTbB"></tbody></table></div>'+
            '<div class="fsfoot"><b class="fspin good">5</b><span class="fshint">Double-click a row to view its content</span><span class="fssp"></span>'+
              '<span class="fsghost">no Preserve / Export here</span><b class="fspin">6</b></div>'+
            '<div class="fspop" id="fsPopB"><div class="fscard" role="dialog" aria-label="File content"></div></div>'+
          '</div></div></article>'+
      '</div>'+
      '<div class="fsafter" id="fsAfter">'+
        '<article class="fswin" id="fsWinU" aria-label="After: unified File Space">'+
          '<div class="fschrome"><i></i><i></i><i></i><span>File Space</span></div>'+
          '<div class="fsapp"><nav class="fsside"><span class="fsnav dim">Dashboard</span><span class="fsnav is-on">File Space</span>'+
            '<span class="fsnav dim">Search History</span><span class="fsnav dim">Audit Log</span><span class="fsnav dim">Exports</span></nav>'+
          '<div class="fsmain">'+
            '<div class="fsbar"><strong>File Space</strong><span class="fscount" id="fsCount"></span><b class="fspin good">1</b>'+
              '<span class="fssp"></span><b class="fspin good">2</b>'+
              '<div class="fstools"><span class="fsbtn">Preserve All</span><span class="fsbtn">Cross-tabulation</span><span class="fsbtn solid">Export</span></div></div>'+
            '<div class="fsbar"><input class="fssearch" id="fsQ" placeholder="Search for a keyword…" aria-label="Search results"><b class="fspin good">3</b></div>'+
            '<div class="fstbl"><table><thead><tr><th><span class="fspin good">4</span></th><th data-k="name">File Name</th><th data-k="owner" style="width:13%">Owner</th><th data-k="bytes" style="width:10%">Size</th><th data-k="path" style="width:16%">Path</th><th data-k="iso" style="width:14%">Date Created</th><th style="width:17%">Tags</th></tr></thead><tbody id="fsTbU"></tbody></table></div>'+
            '<div class="fsfoot"><span class="fshint">Double-click a row to view its content. Click a column to sort.</span></div>'+
            '<div class="fspop" id="fsPopU"><div class="fscard" role="dialog" aria-label="File content"></div></div>'+
          '</div></div></article>'+
      '</div>'+
    '</section>'+
    '<ol class="fslegend" id="fsLegend"></ol>'+
    '<div class="fsjourney" id="fsJourney" aria-label="Path to finish a task"></div>'+
    '<p class="note" style="margin-top:18px">Mock rows and a simplified layout. The real product is confidential.</p>'+
  '</div></div>'+
  '<div class="block"><div class="rwrap"><h2>The consolidation, mapped</h2><img class="flowimg" src="'+esc(d.flowImage.src)+'" alt="'+esc(d.flowImage.alt)+'" loading="lazy"></div></div>'+caseStudy(d)+pager("filespace");

  var fsStage=$("#fsStage",root),fsState="before";
  function fsTags(r){return r.tags.map(function(t){return '<span class="fstag">'+esc(t)+"</span>"}).join("")}
  function fsCard(r){return "<header><h3>"+esc(r.name)+'</h3><button class="fsx" type="button" aria-label="Close">×</button></header>'+
    '<dl class="fsmeta"><dt>Owner</dt><dd>'+esc(r.owner)+"</dd><dt>Created</dt><dd>"+esc(r.date)+"</dd><dt>Path</dt><dd>"+esc(r.path)+"</dd></dl>"+
    '<div class="fsdoc">'+esc(r.body)+"</div>"}
  /* open on double-click, double-tap or Enter; single click selects */
  function fsWire(tbody,onSelect,onOpen){
    var last={i:null,t:0};
    tbody.addEventListener("click",function(e){
      var tr=e.target.closest("tr[data-i]");if(!tr||e.target.closest("input"))return;
      var now=Date.now(),i=+tr.dataset.i;
      if(onSelect)onSelect(i,tr);
      if(onOpen&&last.i===i&&now-last.t<450){onOpen(i);last.t=0}else last={i:i,t:now};
    });
    tbody.addEventListener("keydown",function(e){
      var tr=e.target.closest("tr[data-i]");if(!tr||e.key!=="Enter")return;
      e.preventDefault();(onOpen||onSelect)(+tr.dataset.i,tr);
    });
  }
  function fsMark(tbody,tr){var s=tbody.querySelector(".is-sel");if(s)s.classList.remove("is-sel");tr.classList.add("is-sel")}
  function fsOpen(pop,i){pop.firstElementChild.innerHTML=fsCard(ROWS[i]);pop.classList.add("is-open");pop.querySelector(".fsx").focus()}
  function fsCloseAll(){root.querySelectorAll(".fspop.is-open").forEach(function(p){p.classList.remove("is-open")})}
  root.querySelectorAll(".fspop").forEach(function(p){
    p.addEventListener("click",function(e){if(e.target===p||e.target.closest(".fsx"))p.classList.remove("is-open")});
  });
  /* Escape closes the content card first; the room's own Escape only fires once nothing is open. */
  function fsEsc(e){if(e.key!=="Escape")return;var o=root.querySelector(".fspop.is-open");if(!o)return;
    o.classList.remove("is-open");e.stopPropagation();e.preventDefault()}
  document.addEventListener("keydown",fsEsc,true);
  roomClean.push(function(){document.removeEventListener("keydown",fsEsc,true)});

  function fsPaint(){
    var c=COPY[fsState];
    fsStage.dataset.state=fsState;
    $("#fsH",root).textContent=c.h;$("#fsSub",root).textContent=c.s;$("#fsSwap",root).textContent=c.cta;
    $("#fsBefore",root).inert=fsState!=="before";$("#fsAfter",root).inert=fsState!=="after";
    $("#fsLegend",root).innerHTML=c.legend.map(function(l,i){return '<li><b class="fspin'+(l[0]==="good"?" good":"")+'">'+(i+1)+"</b><span>"+esc(l[1])+"</span></li>"}).join("");
    $("#fsJourney",root).innerHTML=c.journey.map(function(j,i){return (i?"<i></i>":"")+'<span class="'+(j[1]||"")+'">'+esc(j[0])+"</span>"}).join("");
    fsCloseAll();
  }
  $("#fsSwap",root).addEventListener("click",function(){fsState=fsState==="before"?"after":"before";fsPaint()});
  $("#fsNotes",root).addEventListener("change",function(e){
    fsStage.dataset.notes=e.target.checked?"on":"off";$("#fsLegend",root).hidden=!e.target.checked;
  });

  /* BEFORE: Workspace Main */
  var fsTbA=$("#fsTbA",root);
  fsTbA.innerHTML=ROWS.map(function(r,i){return '<tr data-i="'+i+'" tabindex="0"><td>'+esc(r.name)+"</td><td>"+esc(r.size)+"</td></tr>"}).join("");
  function fsShowA(i,tr){var r=ROWS[i];fsMark(fsTbA,tr||fsTbA.rows[i]);
    $("#fsPvA",root).innerHTML='<b class="fspin" style="float:right">1</b><dl><dt>Date:</dt><dd>'+esc(r.date)+"</dd><dt>File Name:</dt><dd>"+esc(r.name)+'</dd></dl><div class="fsdoc">'+esc(r.body)+"</div>"}
  fsWire(fsTbA,fsShowA,null);fsShowA(0);

  /* BEFORE: Raw Data */
  var fsTbB=$("#fsTbB",root);
  fsTbB.innerHTML=ROWS.map(function(r,i){return '<tr data-i="'+i+'" tabindex="0"><td>'+esc(r.name)+"</td><td>"+esc(r.size)+"</td><td>"+esc(r.path)+"</td><td>"+esc(r.date)+"</td></tr>"}).join("");
  fsWire(fsTbB,function(i,tr){fsMark(fsTbB,tr)},function(i){fsOpen($("#fsPopB",root),i)});

  /* bring a window to the front */
  function fsFront(id){["fsWinA","fsWinB"].forEach(function(w){$("#"+w,root).classList.toggle("is-front",w===id)})}
  ["fsWinA","fsWinB"].forEach(function(w){$("#"+w,root).addEventListener("pointerdown",function(){fsFront(w)})});
  root.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){fsFront(b.dataset.go)})});

  /* AFTER: unified File Space */
  var fsTbU=$("#fsTbU",root),fsPicked={},fsSort={k:null,d:1},fsQuery="";
  function fsDrawU(){
    var rows=ROWS.map(function(r,i){return {r:r,i:i}}).filter(function(x){return x.r.name.toLowerCase().indexOf(fsQuery)>-1});
    if(fsSort.k)rows.sort(function(a,b){var x=a.r[fsSort.k],y=b.r[fsSort.k];return (x>y?1:x<y?-1:0)*fsSort.d});
    fsTbU.innerHTML=rows.length?rows.map(function(x){var r=x.r;
      return '<tr data-i="'+x.i+'" tabindex="0"'+(fsPicked[x.i]?' class="is-sel"':"")+'><td><input type="checkbox" aria-label="Select '+esc(r.name)+'"'+(fsPicked[x.i]?" checked":"")+"></td><td>"+esc(r.name)+"</td><td>"+esc(r.owner)+"</td><td>"+esc(r.size)+"</td><td>"+esc(r.path)+"</td><td>"+esc(r.date)+"</td><td>"+fsTags(r)+"</td></tr>"}).join("")
     :'<tr><td colspan="7" class="fshint">No files match that search.</td></tr>';
    var n=Object.keys(fsPicked).length;
    $("#fsCount",root).textContent=TOTAL+" items"+(n?" · "+n+" selected":"");
  }
  fsTbU.addEventListener("change",function(e){
    var tr=e.target.closest("tr[data-i]");if(!tr)return;
    if(e.target.checked)fsPicked[tr.dataset.i]=1;else delete fsPicked[tr.dataset.i];fsDrawU();
  });
  fsWire(fsTbU,null,function(i){fsOpen($("#fsPopU",root),i)});
  $("#fsQ",root).addEventListener("input",function(e){fsQuery=e.target.value.trim().toLowerCase();fsDrawU()});
  root.querySelectorAll("#fsWinU th[data-k]").forEach(function(th){
    th.addEventListener("click",function(){fsSort.d=fsSort.k===th.dataset.k?-fsSort.d:1;fsSort.k=th.dataset.k;fsDrawU()});
  });
  fsDrawU();fsPaint();
},
bookrush:function(root){var d=DATA.project2,f=d.flowShots,n=0;
  var S=[["Order confirmed","The one question from the first search result: can I have this book now, and how fast?","home"],["Preparing your books","Delivery is a tagged union on every book: INSTANT with an ETA, STANDARD or UNAVAILABLE. The unavailable case can't be forgotten.","book-detail"],["Packed with care","One basket can mix speeds. The cart groups by delivery, and instant is offered only when every item qualifies.","cart"],["Picked up","State lives with whoever owns it: Zustand for cart and session, TanStack Query for server data, local state for UI.","profile"],["Out for delivery","Tracking is a six-stage state machine in the order service, polled every 2.5 seconds as it would be against a real endpoint.","tracking"],["Delivered","66 tests, and CI that runs lint, typecheck, tests and an iOS bundle on every push.","community"]];
  root.innerHTML=head(d.eyebrow,d.title,d.timeframe)+
  '<div class="block"><div class="rwrap"><h2>This case study is out for delivery.</h2><p class="lead">It moves through the app\'s real six tracking stages on the app\'s 2.5-second poll. Tap any stage to jump to it.</p><div class="br"><div class="phone"><img alt="BookRush screen" id="brI"></div><div><ol class="stages" id="brS">'+S.map(function(s,k){return '<li><button type="button" data-k="'+k+'"><i></i><span><strong>'+s[0]+"</strong><em>"+esc(s[1])+"</em></span></button></li>"}).join("")+'</ol></div></div></div></div>'+
  '<div class="block"><div class="rwrap"><h2>'+esc(f.title)+" "+esc(f.titleRest)+'</h2><p class="lead">'+esc(f.intro)+"</p>"+f.rows.map(function(r){return '<p class="rowlab">'+esc(r.label)+'</p><div class="shots">'+r.shots.map(function(s){n++;return '<figure class="shot"><img src="'+esc(s.src)+'" alt="BookRush '+esc(s.label)+' screen" loading="lazy"><figcaption><span class="n">'+n+"</span><b>"+esc(s.label)+"</b>"+esc(s.note)+"</figcaption></figure>"}).join("")+"</div>"}).join("")+band(f.band)+"</div></div>"+caseStudy(d)+pager("bookrush");
  var i=0,timer,list=$("#brS",root);
  function show(){list.querySelectorAll("button").forEach(function(b,k){b.classList.toggle("done",k<=i);b.classList.toggle("now",k===i)});$("#brI",root).src="assets/bookrush/"+S[i][2]+".webp"}
  function run(){clearInterval(timer);if(RM)return;timer=setInterval(function(){if(i<S.length-1){i++;show()}else clearInterval(timer)},2500)}
  list.addEventListener("click",function(e){var b=e.target.closest("button");if(b){i=+b.dataset.k;show();clearInterval(timer)}});
    show();run();roomClean.push(function(){clearInterval(timer)});
},
usersync:function(root){var d=DATA.project3,f=d.flowPanels,timer;
  root.innerHTML=head(d.eyebrow,d.title,d.timeframe)+
  '<div class="block"><div class="rwrap"><h2>Why the pool stops at three.</h2><p class="lead">Mail server agents syncing a 100k-user directory. Change the settings and watch what gives out first.</p><div class="sync"><div class="ctl"><label>threads <input id="sT" type="range" min="1" max="8" value="3"><span id="sTv">3</span></label><label><input id="sB" type="checkbox" checked> batched fetch</label><label><input id="sP" type="checkbox" checked> 999 per page</label></div><div class="btns"><button class="btn" id="sBefore" type="button">before</button><button class="btn" id="sBoom" type="button">3 threads, no batching</button><button class="btn" id="sAfter" type="button">after</button></div><div class="lanes" id="sL" aria-hidden="true"></div><div class="meter" id="mM"><span>heap</span><div><i></i></div><span></span></div><div class="meter" id="mD"><span>shared DB</span><div><i></i></div><span></span></div><div class="meter" style="grid-template-columns:90px 1fr"><span>round trips</span><span id="sR"></span></div><div id="sO" aria-live="polite"></div><p class="note">Motion and gauges are illustrative. Round trips are arithmetic.</p></div></div></div>'+
  '<div class="block"><div class="rwrap"><h2>'+esc(f.title)+" "+esc(f.titleRest)+'</h2><p class="lead">'+esc(f.intro)+'</p><div class="panels">'+f.panels.map(function(p){return '<section class="panel"><span class="eyebrow">'+esc(p.label)+"</span><h3>"+esc(p.heading)+'</h3><div class="viz '+(p.viz==="sequence"?"seq":"par")+'">'+p.bars.map(function(b){return '<div class="vz"><span>'+esc(b)+"</span></div>"}).join("")+'</div><p class="ax">'+esc(p.axis)+"</p><ul>"+p.notes.map(function(n){return "<li><strong>"+esc(n.title)+"</strong>"+esc(n.text)+"</li>"}).join("")+"</ul></section>"}).join("")+"</div>"+band(f.band)+"</div></div>"+caseStudy(d)+pager("usersync");
  var T=$("#sT",root),B=$("#sB",root),Pg=$("#sP",root),L=$("#sL",root),O=$("#sO",root),state;
  function meter(el,v,txt,hot){var m=$(el,root);$("i",m).style.width=clamp(v,0,100)+"%";m.lastChild.textContent=txt;m.classList.toggle("hot",!!hot)}
  function reset(){clearInterval(timer);var th=+T.value;$("#sTv",root).textContent=th;var size=Pg.checked?999:100,dur=Pg.checked?12:19;state={th:th,batch:B.checked,dur:dur,q:[0,1,2,3,4,5],run:[],lanes:Array.from({length:th},function(){return ""}),done:0};$("#sR",root).textContent="100,000 ÷ "+size+" = "+Math.ceil(100000/size).toLocaleString("en-US")+" per directory pass";O.innerHTML="";timer=setInterval(step,RM?20:75)}
  function step(){var s=state;for(var l=0;l<s.th;l++){var cur=s.run[l];if(!cur&&s.q.length)cur=s.run[l]={a:s.q.shift(),p:0};if(cur){cur.p++;s.lanes[l]+=String(cur.a+1);if(cur.p>=s.dur){s.run[l]=null;s.done++}}else if(s.done<6&&!s.q.length)s.lanes[l]+=" "}
    var live=s.run.filter(Boolean),mem=live.reduce(function(a,r){return a+(s.batch?12:(r.p/s.dur)*(s.th>1?62:46))},0),db=s.th/3*66;meter("#mM",mem,Math.round(mem)+"%",mem>=100);meter("#mD",db,Math.round(db)+"%",db>100);L.textContent=s.lanes.map(function(x,n){return "lane "+(n+1)+" |"+x}).join("\n");
    if(mem>=100){clearInterval(timer);O.innerHTML='<div class="oom">java.lang.OutOfMemoryError: Java heap space<br><br>This happened in testing. Three agents each held a whole tenant in memory, so the batching fix had to land before the speedup could ship.</div>';headEl.classList.remove("shake");void headEl.offsetWidth;headEl.classList.add("shake");return}
    if(s.done>=6){clearInterval(timer);O.innerHTML=db>100?'<div class="oom">It finished fast, but each task also calls the shared DB and network, so other tenants pay for it. Three gave a real speedup with predictable load.</div>':""}}
  [T,B,Pg].forEach(function(e){e.addEventListener("input",reset)});function pre(t,b,g){T.value=t;B.checked=b;Pg.checked=g;reset()}
  $("#sBefore",root).onclick=function(){pre(1,false,false)};$("#sBoom",root).onclick=function(){pre(3,false,true)};$("#sAfter",root).onclick=function(){pre(3,true,true)};reset();roomClean.push(function(){clearInterval(timer)});
},
uiux:function(root){var U=DATA.sidequests.uxCaseStudies.slice().reverse();
  root.innerHTML=head("Folder","UI/UX")+'<div class="block"><div class="rwrap uxs">'+U.map(function(c){return '<section class="ux"><span class="eyebrow">UX case study</span><h2>'+esc(c.title)+"</h2><p>"+esc(c.blurb)+'</p><a class="linkbtn" target="_blank" rel="noopener" href="'+esc(c.link)+'">View Case Study ↗</a></section>'}).join("")+"</div></div>"+pager("uiux");
},
skills:function(root){
  var C=[["React",3,"FileSpace: the unified workspace, built in React and TypeScript."],["TypeScript",3,"FileSpace and BookRush."],["Java",3,"User Sync: thread pools, batching and retries at 100k+ users."],["JavaScript",2,"ZL Technologies: enterprise UI features and legacy AJAX integration."],["React Native",2,"BookRush: runs on iOS, Android and web through Expo."],["Accessibility",3,"ZL Technologies: WCAG 2.1 refactors, 400+ WAVE issues resolved."],["Multithreading",2,"User Sync: a pool capped at 3 on purpose."],["Figma",2,"FileSpace: the flow was restructured in Figma before any code."],["TanStack Query",1,"FileSpace and BookRush, for anything server-shaped."],["Redux",1,"FileSpace state architecture."],["Zustand",1,"BookRush: cart, session and likes, persisted with AsyncStorage."],["Ext JS",1,"ZL Technologies: legacy components modernized for accessibility."],["SQL",1,"User Sync, and platform data work at ZL."],["Jest",1,"BookRush: 66 tests on pricing, delivery eligibility, stock limits and the order state machine."],["Python",1,"Sign Language Detector: OpenCV, MediaPipe, Scikit-learn."],["User research",2,"I'm Beside You and Messin: real testers, mess staff and students."],["Prototyping",1,"Messin: from empathy research to a working prototype."],["Graph API",1,"User Sync: paging Microsoft 365 directories, tuned from 100 to 999 per page."],["i18n",1,"ZL Technologies: English and Japanese."]];
  var sz=[0,17,27,46],order=[9,4,16,1,12,7,0,5,10,2,14,3,8,6,17,11,15,13,18];
  root.innerHTML=head("Folder","Skills")+'<div class="block"><div class="rwrap"><h2>A tag cloud that shows receipts.</h2><div class="cloudbox"><div class="cloud" id="cl">'+order.map(function(i){var s=C[i];return '<button type="button" data-i="'+i+'" style="font-size:clamp('+Math.round(sz[s[1]]*.68)+'px,4vw,'+sz[s[1]]+'px)">'+s[0]+"</button>"}).join("")+'</div><div class="proof" id="pr" aria-live="polite"><span class="eyebrow">proof</span>Pick a skill to see where I used it.</div></div></div></div>'+
  '<div class="block"><div class="rwrap"><h2>Everything, by group</h2><div class="groups">'+DATA.skills.groups.map(function(g){return "<section><h3>"+esc(g.title)+"</h3>"+techs(g.items)+"</section>"}).join("")+"</div></div></div>"+pager("skills");
  var c=$("#cl",root);function pick(b){c.querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x===b)});var s=C[+b.dataset.i];$("#pr",root).innerHTML='<span class="eyebrow">'+esc(s[0])+"</span>"+esc(s[2])}
  ["pointerover","click","focusin"].forEach(function(n){c.addEventListener(n,function(e){var b=e.target.closest("button");if(b)pick(b)})});
},
experience:function(root){var d=DATA.experience,r=d.roles[0],e=d.education[0];
  var A=[["Now","Still climbing","<p>Software Engineer at ZL Technologies, plus the side quests.</p>"],["2026",DATA.project1.title,"<p>"+esc("Reduced clicks in the core search-to-export path by ~60%.")+'</p><p><a href="#filespace">Open the FileSpace room</a></p>'],["2024–25",DATA.project3.title,"<p>Synchronization bottlenecks reduced by roughly 50%.</p>"+'<p><a href="#usersync">Open the User Sync room</a></p>'],[r.dates,r.role+" — "+r.org,bullets(r.bullets)],["2024",d.achievements[1],""],[e.dates,e.degree,"<p>"+esc(e.org)+"</p>"],["2023",d.achievements[0],""],["Jul 2020","Started at IIT Patna","<p>Ground level.</p>"]];
  root.innerHTML='<div class="climb"><div class="gauge"><span>altitude log: start at the ground, scroll up</span><strong id="ag">2020</strong></div><h1 class="vh" tabindex="-1">Experience / Education</h1><ol class="logs" style="list-style:none">'+A.map(function(a){return '<li class="log" data-y="'+esc(a[0])+'"><time>'+esc(a[0])+"</time><h3>"+esc(a[1])+"</h3>"+a[2]+"</li>"}).join("")+'</ol><p class="ground">ground level</p></div>';
  var logs=root.querySelectorAll(".log"),ag=$("#ag",root);function up(){var mid=roomEl.getBoundingClientRect().top+roomEl.clientHeight*.55,best,bd=1e9;logs.forEach(function(l){var q=l.getBoundingClientRect(),dd=Math.abs(q.top+q.height/2-mid);if(dd<bd){bd=dd;best=l}});var m=best.dataset.y.match(/20\d\d/g);ag.textContent=best.dataset.y==="Now"?"Now":m?m[m.length-1]:best.dataset.y}
  roomEl.addEventListener("scroll",up,{passive:true});
  roomEl._start=function(){roomEl.scrollTop=roomEl.scrollHeight;up()};
},
sidequests:function(root){var d=DATA.sidequests,day=Math.floor((Date.now()-new Date(2026,0,6).getTime())/864e5)+1,pt;
  function lnk(u,l,p){return u?'<a class="linkbtn" target="_blank" rel="noopener" href="'+esc(u)+'">'+l+" ↗</a>":'<p class="pending">'+p+"</p>"}
  var Q=[["ducks","The Ducks","ONGOING · DAY "+day,'<span class="eyebrow">Day '+day+' of a daily ritual</span><h2>The Ducks</h2><div class="pond" id="pd" role="img" aria-label="ASCII pond with four adult ducks and two teenagers"></div><p>'+esc(d.ducks.desc)+'</p><p class="note">Case status: the rabbit theory remains open.</p>'+lnk(d.ducks.drive,"See All Photos","Drive link coming soon")],
   ["art","Art Reveriez","COMPLETE · 55+ ORDERS",'<span class="eyebrow">Co-founder</span><h2>Art Reveriez</h2><div class="polas"><div class="pola"><div>your polaroid</div></div><div class="pola"><div>your bookmark</div></div><div class="pola"><div>your clothing</div></div></div><p>'+esc(d.artReveriez.desc)+"</p>"+lnk(d.artReveriez.instagram,"Instagram","Instagram link coming soon")],
   ["book","IITP Yearbook - Lead Designer","COMPLETE · TEAM OF 5",'<span class="eyebrow">Print</span><h2>IITP Yearbook - Lead Designer</h2><p>'+esc(d.yearbook.desc)+"</p>"+lnk(d.yearbook.drive,"View Glimpses","Drive link coming soon")]];
  root.innerHTML=head("Folder","Side Quests")+'<div class="block"><div class="rwrap qgrid"><ul class="qlist">'+Q.map(function(q,i){return '<li><a href="#sidequests" data-q="'+q[0]+'"'+(i?"":' class="on"')+">"+esc(q[1])+"<small>"+esc(q[2])+"</small></a></li>"}).join("")+"</ul><div>"+Q.map(function(q){return '<section class="quest" id="q-'+q[0]+'">'+q[3]+"</section>"}).join("")+"</div></div></div>"+pager("sidequests");
  var as=root.querySelectorAll(".qlist a");
  $(".qlist",root).addEventListener("click",function(e){var a=e.target.closest("a");if(!a)return;e.preventDefault();$("#q-"+a.dataset.q,root).scrollIntoView({behavior:RM?"auto":"smooth",block:"start"})});
  function sp(){var y=roomEl.getBoundingClientRect().top+150,cur=Q[0][0];Q.forEach(function(q){if($("#q-"+q[0],root).getBoundingClientRect().top<y)cur=q[0]});as.forEach(function(a){a.classList.toggle("on",a.dataset.q===cur)})}
  roomEl.addEventListener("scroll",sp,{passive:true});
  var D=[[3,0,1],[30,1,1],[12,3,1],[42,4,-1],[20,1,-1],[6,3,-1]],pd=$("#pd",root),cols=innerWidth<640?44:62;
  function dr(n){var rows=Array.from({length:5},function(){return Array(cols+1).join(" ").split("")});rows.forEach(function(r,y){for(var x=0;x<cols;x++){var v=(x*3+y*7+n)%23;if(v===0)r[x]="~";else if(v===11)r[x]="-"}});D.forEach(function(k,i){var teen=i>3,g=teen?(k[2]>0?"(.)>":"<(.)"):(k[2]>0?"\\__(')>":"<(')__/"),x=Math.floor((((k[0]+k[2]*n*(teen?.5:.25))%(cols-8))+(cols-8))%(cols-8));for(var c=0;c<g.length;c++)rows[k[1]][x+c]=g[c]});pd.textContent=rows.map(function(r){return r.join("")}).join("\n")}
  var n=0;dr(0);if(!RM)pt=setInterval(function(){dr(++n)},260);roomClean.push(function(){clearInterval(pt)});
},
plain:function(root){
  root.innerHTML=head("Plain version","Medha Singh","Software Engineer at ZL Technologies since September 2024")+'<div class="block"><div class="rwrap story">'+sec("Work",bullets(["FileSpace: unified enterprise workspace in React and TypeScript, about 60% fewer clicks from search to export.","BookRush: React Native quick-commerce app with 66 tests and CI.","User Sync: Java directory sync for 100k+ users, bottlenecks down about 50%.","Accessibility: 400+ WAVE issues resolved across legacy UI."]))+sec("Education","<p>B.Tech, Electrical and Electronics Engineering, IIT Patna, 2024.</p>")+sec("Contact",'<p>hello.medhasingh@gmail.com</p>')+"</div></div>";
}};
function renderRoom(id){
  closeRoomDom();
  var r=document.createElement("div");r.id="room";roomEl=r;
  r.innerHTML='<nav class="rbar" aria-label="Sections"><button class="rback" type="button" id="rBack">← back to the sky</button><div class="rtabs">'+ROOM_ORDER.map(function(x){return '<a class="rtab" href="#'+x[0]+'"'+(x[0]===id?' aria-current="page"':"")+">"+x[1]+"</a>"}).join("")+'</div></nav><div id="roomBody"></div>';
  stage.appendChild(r);ROOMS[id]($("#roomBody",r));
  $("#rBack",r).onclick=function(){setHash("")};
  inRoom=true;document.body.classList.add("in-room");
  if(r._start)requestAnimationFrame(function(){r._start();if(!RM)climbHint(r)});else r.scrollTop=0;
  var cur=$(".rtab[aria-current]",r);if(cur)cur.scrollIntoView({inline:"center",block:"nearest"});
  var h=$("h1",r);if(h)h.focus({preventScroll:true});
}
function climbHint(r){var st=performance.now(),from=r.scrollTop,to=Math.max(0,from-r.clientHeight*.34);(function an(n){var k=clamp((n-st-500)/1100,0,1);r.scrollTop=from+(to-from)*smooth(0,1,k);if(k<1&&roomEl===r)requestAnimationFrame(an)})(st)}
function closeRoomDom(){roomClean.forEach(function(f){f()});roomClean=[];if(roomEl){roomEl.remove();roomEl=null}}
function goHomeView(){closeRoomDom();inRoom=false;document.body.classList.remove("in-room");if(lastFolder&&lastFolder.isConnected)lastFolder.focus({preventScroll:true})}
function setHash(h){try{history.pushState(null,"",h?"#"+h:location.pathname+location.search)}catch(_){location.hash=h}route(false)}
var routing=null;
function route(anim,rect){
  var id=location.hash.slice(1);
  if(ROOMS[id]){if(playing)endIntro();
    if(anim!==false&&rect&&!RM)dive(rect,function(){renderRoom(id)});else renderRoom(id);
  }else if(inRoom)goHomeView();
}
/* The folder you clicked grows into the page: maroon fills the screen, then lifts away. */
function dive(rect,after){
  var w=document.createElement("div");w.className="wipe";stage.appendChild(w);
  var vw=innerWidth,vh=innerHeight,ins="inset("+rect.top+"px "+(vw-rect.right)+"px "+(vh-rect.bottom)+"px "+rect.left+"px round 8px)";
  var a=w.animate([{clipPath:ins},{clipPath:"inset(0px 0px 0px 0px round 0px)"}],{duration:430,easing:"cubic-bezier(.7,0,.25,1)",fill:"forwards"});
  a.onfinish=function(){after();var b=w.animate([{transform:"none"},{transform:"translateY(-100%)"}],{duration:480,easing:"cubic-bezier(.7,0,.25,1)",fill:"forwards"});b.onfinish=function(){w.remove()}};
}
function openSection(id,el){lastFolder=el;var r=el?$(".art",el).getBoundingClientRect():null;history.pushState(null,"","#"+id);route(true,r)}
addEventListener("popstate",function(){route(false)});addEventListener("hashchange",function(){route(false)});
function closeTop(){if(inRoom)setHash("")}
function closeAll(){if(inRoom)setHash("")}
$("#btnPlain").addEventListener("click",function(){setHash("plain")});

/* =================== BOOT =================== */
function boot(){
  resize();
  [IMG.adam,IMG.god].forEach(function(im){if(!im.complete)im.addEventListener("load",buildField,{once:true})});
  if(RM){endIntro()}else{document.body.classList.add("intro");headEl.style.opacity=0}
  placeOrbit();requestAnimationFrame(frame);if(ROOMS[location.hash.slice(1)])route(false);
}
var rz;addEventListener("resize",function(){clearTimeout(rz);rz=setTimeout(resize,160)});
if(photo.complete&&photo.naturalWidth)boot();else{photo.addEventListener("load",boot,{once:true});photo.addEventListener("error",boot,{once:true})}
})();
