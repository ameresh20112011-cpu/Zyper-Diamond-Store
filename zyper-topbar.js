/* =========================================================
   ZYPER SHARED TOP HEADER

   SAME ON ALL CUSTOMER PAGES
========================================================= */

(function(){

"use strict";


const TOPBAR_ID =
"zyperSharedTopbar";


/* =====================================================
   STYLE
===================================================== */

function addStyle(){

if(
document.getElementById(
"zyperTopbarStyle"
)
){

return;

}


const style =
document.createElement(
"style"
);


style.id =
"zyperTopbarStyle";


style.textContent = `

:root{

--zyper-header-height:
72px;

}


#zyperSharedTopbar{

position:
fixed;

top:
0;

left:
0;

right:
0;


height:

calc(
var(
--zyper-header-height
)
+
env(
safe-area-inset-top,
0px
)
);


padding:

env(
safe-area-inset-top,
0px
)

max(
18px,
env(
safe-area-inset-right,
0px
)
)

0

max(
18px,
env(
safe-area-inset-left,
0px
)
);


display:
flex;


align-items:
center;


justify-content:
space-between;


gap:
10px;


background:

linear-gradient(
180deg,
rgba(1,9,31,.98),
rgba(3,14,43,.96)
);


border-bottom:

1px solid
rgba(
80,
125,
255,
.22
);


box-shadow:

0
8px
30px
rgba(
0,
0,
0,
.35
);


backdrop-filter:
blur(18px);


-webkit-backdrop-filter:
blur(18px);


z-index:
2147483000;

}


/* BRAND */

.zyper-top-brand{

display:
flex;

align-items:
center;

gap:
12px;

min-width:
0;

text-decoration:
none;

}


/* LOGO */

.zyper-top-logo{

width:
48px;

height:
48px;

min-width:
48px;

border-radius:
14px;

overflow:
hidden;

background:
#ffffff;

}


.zyper-top-logo img{

width:
100%;

height:
100%;

object-fit:
cover;

display:
block;

}


/* NAME */

.zyper-top-name{

color:
#ffffff;

font-family:
"Poppins",
Arial,
sans-serif;

font-size:
20px;

font-weight:
800;

letter-spacing:
1px;

white-space:
nowrap;

}


/* RIGHT */

#zyperTopbarAction{

display:
flex;

align-items:
center;

justify-content:
flex-end;

min-width:
0;

}


/* BODY SPACE */

body{

padding-top:

calc(
var(
--zyper-header-height
)
+
env(
safe-area-inset-top,
0px
)
+
10px
)

!important;

}


/* MOBILE */

@media(max-width:480px){

:root{

--zyper-header-height:
64px;

}


#zyperSharedTopbar{

padding-left:
12px;

padding-right:
12px;

}


.zyper-top-logo{

width:
43px;

height:
43px;

min-width:
43px;

border-radius:
13px;

}


.zyper-top-name{

font-size:
18px;

}

}


@media(max-width:360px){

.zyper-top-name{

font-size:
16px;

}

}

`;


document.head.appendChild(
style
);

}


/* =====================================================
   HEADER
===================================================== */

function createHeader(){

if(
document.getElementById(
TOPBAR_ID
)
){

return;

}


const header =
document.createElement(
"header"
);


header.id =
TOPBAR_ID;


header.innerHTML = `

<a
href="./home.html"
class="zyper-top-brand"
>

<span
class="zyper-top-logo"
>

<img
src="./1.jpg"
alt="Zyper"
>

</span>


<span
class="zyper-top-name"
>
ZYPER
</span>

</a>


<div
id="zyperTopbarAction"
>
</div>

`;


document.body.prepend(
header
);

}


/* =====================================================
   LOAD WALLET BADGE
===================================================== */

function loadWalletBadge(){

const existing =

Array.from(
document.scripts
)
.find(
script =>
script.src &&
script.src.includes(
"zyper-wallet-badge.js"
)
);


if(existing){

return;

}


const script =
document.createElement(
"script"
);


script.type =
"module";


script.src =
"./zyper-wallet-badge.js?v=8001";


document.body.appendChild(
script
);

}


/* =====================================================
   START
===================================================== */

function start(){

addStyle();

createHeader();

loadWalletBadge();

}


if(
document.readyState ===
"loading"
){

document.addEventListener(
"DOMContentLoaded",
start,
{
once:true
}
);

}
else{

start();

}

})();
