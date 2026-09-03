const startButton=document.getElementById("startButton");
const introScreen=document.getElementById("introScreen");
const gameScreen=document.getElementById("gameScreen");
const backgroundMusic=document.getElementById("backgroundMusic");
const arrowSound=document.getElementById("arrowSound");
const heartOpenSound=document.getElementById("heartOpenSound");
const musicButton=document.getElementById("musicButton");
const bowArea=document.getElementById("bowArea");
const dragHandle=document.getElementById("dragHandle");
const arrow=document.getElementById("arrow");
const stringTop=document.getElementById("stringTop");
const stringBottom=document.getElementById("stringBottom");
const heartTarget=document.getElementById("heartTarget");
const impactFlash=document.getElementById("impactFlash");
const loveMessage=document.getElementById("loveMessage");
const brokenHeart=document.getElementById("brokenHeart");
const photoReveal=document.getElementById("photoReveal");
const hitCounter=document.getElementById("hitCounter");
const shotStatus=document.getElementById("shotStatus");
const aimHint=document.getElementById("aimHint");

const messages=[
"I love your smile, I love your voice, I love the tiny little noises you make randomly, I love your laugh",
"I love how you look at me with those big cutie eyes of yours and quickly turn them away",
"I love your dead stares, I love when you zone out, how cute you look",
"I love everything about you."
];

let started=false,dragging=false,shooting=false,hits=0;
const rest={x:88,y:110};let pull={...rest};

function playSound(sound,volume=1){
  sound.pause();sound.currentTime=0;sound.volume=volume;
  sound.play().catch(()=>{});
}

startButton.addEventListener("click",()=>{
  backgroundMusic.volume=.35;
  backgroundMusic.play().then(()=>{musicButton.textContent="🔊";musicButton.classList.add("playing");}).catch(()=>{musicButton.textContent="🔇";});
  introScreen.style.opacity="0";introScreen.style.transform="scale(1.04)";
  setTimeout(()=>{introScreen.classList.add("hidden");gameScreen.classList.remove("hidden");started=true;},650);
});

musicButton.addEventListener("click",()=>{
  if(backgroundMusic.paused){
    backgroundMusic.play().then(()=>{musicButton.textContent="🔊";musicButton.classList.add("playing");}).catch(()=>{});
  }else{
    backgroundMusic.pause();musicButton.textContent="🔇";musicButton.classList.remove("playing");
  }
});

function getBowPoint(e){const r=bowArea.getBoundingClientRect();return{x:((e.clientX-r.left)/r.width)*180,y:((e.clientY-r.top)/r.height)*220};}
function updatePull(e){
  if(!dragging||shooting)return;
  const p=getBowPoint(e);pull={x:Math.max(18,Math.min(88,p.x)),y:Math.max(55,Math.min(165,p.y))};
  stringTop.setAttribute("x2",pull.x);stringTop.setAttribute("y2",pull.y);
  stringBottom.setAttribute("x2",pull.x);stringBottom.setAttribute("y2",pull.y);
  dragHandle.style.left=`${pull.x+10}px`;dragHandle.style.bottom=`${220-pull.y-3}px`;
  const angle=Math.atan2(-(110-pull.y),135-pull.x)*180/Math.PI;
  arrow.style.transform=`translate(${pull.x-88}px,${pull.y-110}px) rotate(${angle}deg)`;
  aimHint.style.opacity="0";
}
function beginDrag(e){if(!started||shooting||hits>=5)return;e.preventDefault();dragging=true;dragHandle.classList.add("dragging");dragHandle.setPointerCapture?.(e.pointerId);shotStatus.textContent="Aim for my heart... ❤️";}
function endDrag(){
  if(!dragging||shooting)return;dragging=false;dragHandle.classList.remove("dragging");
  if(Math.hypot(rest.x-pull.x,rest.y-pull.y)<12){resetBow();shotStatus.textContent="Pull a little further 🏹";return;}
  shootArrow();
}
dragHandle.addEventListener("pointerdown",beginDrag);window.addEventListener("pointermove",updatePull);window.addEventListener("pointerup",endDrag);window.addEventListener("pointercancel",endDrag);

function resetBow(){
  pull={...rest};stringTop.setAttribute("x2",rest.x);stringTop.setAttribute("y2",rest.y);stringBottom.setAttribute("x2",rest.x);stringBottom.setAttribute("y2",rest.y);
  dragHandle.style.left="98px";dragHandle.style.bottom="107px";arrow.style.transition="none";arrow.style.transform="translate(0,0) rotate(0deg)";arrow.style.opacity="1";
  requestAnimationFrame(()=>arrow.style.transition="");
}

function shootArrow(){
  shooting=true;shotStatus.textContent="Whoosh! 🏹";
  playSound(arrowSound,.7); // Sound effect exactly when the arrow is released.
  const a=arrow.getBoundingClientRect(),h=heartTarget.getBoundingClientRect();
  const sx=a.left+a.width,sy=a.top+a.height/2,tx=h.left+h.width/2,ty=h.top+h.height/2;
  animateArrowTo(sx,sy,tx,ty,Math.atan2(ty-sy,tx-sx));
}

function animateArrowTo(sx,sy,tx,ty,angle){
  const duration=520,start=performance.now();
  arrow.style.position="fixed";arrow.style.left=`${sx-arrow.offsetWidth}px`;arrow.style.top=`${sy-arrow.offsetHeight/2}px`;arrow.style.bottom="auto";arrow.style.transform=`rotate(${angle*180/Math.PI}deg)`;
  function frame(now){
    const t=Math.min((now-start)/duration,1),eased=1-Math.pow(1-t,3);
    const x=sx+(tx-sx)*eased,y=sy+(ty-sy)*eased+Math.sin(Math.PI*eased)*-55;
    arrow.style.left=`${x-arrow.offsetWidth}px`;arrow.style.top=`${y-arrow.offsetHeight/2}px`;
    if(t<1){requestAnimationFrame(frame);return;}
    checkCollision()?handleHit():handleMiss();
  }requestAnimationFrame(frame);
}

function checkCollision(){
  const a=arrow.getBoundingClientRect(),h=heartTarget.getBoundingClientRect();
  const tipX=a.right,tipY=a.top+a.height/2,cx=h.left+h.width/2,cy=h.top+h.height/2;
  return Math.hypot(tipX-cx,tipY-cy)<=Math.max(h.width,h.height)*.65;
}

function handleHit(){
  hits++;hitCounter.textContent=`${hits} / 5`;impactFlash.classList.remove("show");void impactFlash.offsetWidth;impactFlash.classList.add("show");
  heartTarget.classList.remove("hit");void heartTarget.offsetWidth;heartTarget.classList.add("hit");
  if(hits<=4){
    heartTarget.classList.add(`damage-${hits}`);
    loveMessage.classList.remove("show");void loveMessage.offsetWidth;loveMessage.textContent=messages[hits-1];loveMessage.classList.add("show");
    shotStatus.textContent=hits===4?"One last arrow... ❤️":"You hit it ❤️ Shoot again!";
    setTimeout(()=>{arrow.style.position="absolute";arrow.style.left="";arrow.style.top="";arrow.style.bottom="";arrow.style.opacity="0";},650);
    setTimeout(()=>{resetBow();shooting=false;arrow.style.opacity="1";},1250);
  }else finalReveal();
}
function handleMiss(){shotStatus.textContent="Almost! Try again ❤️";setTimeout(()=>{arrow.style.position="absolute";arrow.style.left="";arrow.style.top="";arrow.style.bottom="";resetBow();shooting=false;},500);}

function finalReveal(){
  shotStatus.textContent="You broke through to my heart ❤️";
  loveMessage.classList.remove("show");
  setTimeout(()=>{
    heartTarget.style.display="none";arrow.style.opacity="0";
    playSound(heartOpenSound,.85); // Heart-opening sound starts with the dramatic break.
    brokenHeart.classList.add("breaking");
    setTimeout(()=>{brokenHeart.style.display="none";photoReveal.classList.remove("hidden");aimHint.style.display="none";},1150);
  },250);
}
window.addEventListener("resize",()=>{if(!dragging&&!shooting)resetBow();});
resetBow();
