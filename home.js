/* ==================================================
   ZYPER DIAMOND STORE
   HOME PAGE JAVASCRIPT
================================================== */


/* ==================================================
   PAGE NAVIGATION
================================================== */

window.goTopup = function(){

window.location.href = "topup.html";

};


window.goPayment = function(){

window.location.href = "payment.html";

};


window.goHistory = function(){

window.location.href = "history.html";

};


window.goWhatsApp = function(){

window.location.href = "whatsapp.html";

};



/* ==================================================
   BACKGROUND VIDEO
================================================== */

document.addEventListener(
"DOMContentLoaded",
function(){

const video =
document.getElementById("heroVideo");


if(video){

video.muted = true;


const playVideo = () => {

video.play()
.catch(() => {

console.log(
"Background video autoplay was blocked."
);

});

};


playVideo();


/*
Some mobile browsers pause
video automatically.
Try again when page becomes visible.
*/

document.addEventListener(
"visibilitychange",
function(){

if(
document.visibilityState === "visible"
){

playVideo();

}

});

}

});



/* ==================================================
   CARD TOUCH EFFECT
================================================== */

const cards =
document.querySelectorAll(
".service-card"
);


cards.forEach(card => {

card.addEventListener(
"touchstart",
function(){

this.classList.add("touch-active");

},
{passive:true}
);


card.addEventListener(
"touchend",
function(){

setTimeout(
() => {

this.classList.remove(
"touch-active"
);

},
150
);

});

});



/* ==================================================
   SCROLL REVEAL
================================================== */

const revealElements =
document.querySelectorAll(
".service-card, .stat, .ff-banner"
);


const revealObserver =
new IntersectionObserver(
(entries) => {

entries.forEach(
entry => {

if(entry.isIntersecting){

entry.target.classList.add(
"visible"
);

}

});

},
{
threshold:0.12
}
);


revealElements.forEach(
element => {

element.classList.add(
"reveal"
);

revealObserver.observe(
element
);

});


/* ==================================================
   BUTTON RIPPLE
================================================== */

document
.querySelectorAll(
"button"
)
.forEach(button => {


button.addEventListener(
"click",
function(event){

const ripple =
document.createElement(
"span"
);


ripple.className =
"button-ripple";


const rect =
this.getBoundingClientRect();


ripple.style.left =
(event.clientX - rect.left) + "px";


ripple.style.top =
(event.clientY - rect.top) + "px";


this.appendChild(
ripple
);


setTimeout(
() => {

ripple.remove();

},
600
);

});

});



/* ==================================================
   VIDEO FALLBACK
================================================== */

const backgroundVideo =
document.getElementById(
"heroVideo"
);


if(backgroundVideo){

backgroundVideo.addEventListener(
"error",
function(){

console.warn(
"Background video could not be loaded."
);

});

}
