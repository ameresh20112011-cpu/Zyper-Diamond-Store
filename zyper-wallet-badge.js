/* =========================================================
   ZYPER DIAMOND STORE
   SHARED LOGIN / LIVE WALLET BADGE
   RESPONSIVE: PC + ANDROID + IPHONE + TABLET
========================================================= */

import { auth }
from "./firebase.js";


import {
  onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
"https://zyper-order.ameresh20112011.workers.dev";


const BADGE_ID =
"zyperWalletBadge";


const STYLE_ID =
"zyperWalletBadgeStyle";


const TOPBAR_SLOT_ID =
"zyperTopbarAction";


let badge =
null;


/* =====================================================
   STYLE
===================================================== */

function ensureStyle(){

  if(
    document.getElementById(
      STYLE_ID
    )
  ){

    return;

  }


  const style =
  document.createElement(
    "style"
  );


  style.id =
  STYLE_ID;


  style.textContent = `

#${BADGE_ID}{

  position:
  relative !important;

  inset:
  auto !important;

  display:
  inline-flex !important;

  align-items:
  center !important;

  justify-content:
  center !important;

  min-width:
  0 !important;

  max-width:
  100% !important;

  height:
  40px !important;

  gap:
  7px !important;

  padding:
  0 14px !important;

  border-radius:
  999px !important;

  border:
  1px solid
  rgba(255,255,255,.14)
  !important;

  color:
  #ffffff !important;

  text-decoration:
  none !important;

  font-family:
  "Poppins",
  Arial,
  sans-serif
  !important;

  font-size:
  12px !important;

  font-weight:
  800 !important;

  line-height:
  1 !important;

  white-space:
  nowrap !important;

  background:
  linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  ) !important;

  box-shadow:
  0 8px 24px
  rgba(79,70,229,.28)
  !important;

  cursor:
  pointer !important;

  pointer-events:
  auto !important;

  touch-action:
  manipulation !important;

  -webkit-tap-highlight-color:
  transparent !important;

  -webkit-user-select:
  none !important;

  user-select:
  none !important;

  z-index:
  2 !important;

}


#${BADGE_ID}:active{

  transform:
  scale(.97) !important;

}


#${BADGE_ID}
.zyper-badge-icon{

  width:
  18px !important;

  height:
  18px !important;

  min-width:
  18px !important;

  display:
  inline-flex !important;

  align-items:
  center !important;

  justify-content:
  center !important;

  flex:
  0 0 auto !important;

}


#${BADGE_ID}
.zyper-badge-icon svg{

  width:
  18px !important;

  height:
  18px !important;

  display:
  block !important;

}


#${BADGE_ID}
.zyper-badge-text{

  display:
  block !important;

  min-width:
  0 !important;

  max-width:
  150px !important;

  overflow:
  hidden !important;

  text-overflow:
  ellipsis !important;

  color:
  #ffffff !important;

}


#${BADGE_ID}
.zyper-badge-loading{

  opacity:
  .88 !important;

}


#${BADGE_ID}
.zyper-badge-login{

  background:
  linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  ) !important;

}


#${BADGE_ID}
.zyper-badge-wallet{

  background:
  linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  ) !important;

}


/* FALLBACK WHEN NO TOPBAR */

body > #${BADGE_ID}{

  position:
  fixed !important;

  top:
  calc(
    12px
    +
    env(
      safe-area-inset-top,
      0px
    )
  ) !important;

  right:
  calc(
    12px
    +
    env(
      safe-area-inset-right,
      0px
    )
  ) !important;

  z-index:
  2147483600 !important;

}


/* =====================================================
   PHONE / TABLET
===================================================== */

@media(max-width:768px){

  #${BADGE_ID}{

    height:
    36px !important;

    padding:
    0 11px !important;

    gap:
    6px !important;

    font-size:
    11px !important;

  }


  #${BADGE_ID}
  .zyper-badge-icon{

    width:
    16px !important;

    height:
    16px !important;

    min-width:
    16px !important;

  }


  #${BADGE_ID}
  .zyper-badge-icon svg{

    width:
    16px !important;

    height:
    16px !important;

  }


  #${BADGE_ID}
  .zyper-badge-text{

    max-width:
    116px !important;

  }

}


/* =====================================================
   SMALL PHONE
===================================================== */

@media(max-width:480px){

  #${BADGE_ID}{

    height:
    34px !important;

    padding:
    0 9px !important;

    gap:
    5px !important;

    font-size:
    10px !important;

  }


  #${BADGE_ID}
  .zyper-badge-text{

    max-width:
    100px !important;

  }

}


/* =====================================================
   VERY SMALL PHONE
===================================================== */

@media(max-width:360px){

  #${BADGE_ID}{

    padding:
    0 8px !important;

    font-size:
    9px !important;

  }


  #${BADGE_ID}
  .zyper-badge-text{

    max-width:
    82px !important;

  }

}


/* =====================================================
   PHONE LANDSCAPE
===================================================== */

@media(
  max-height:520px
)
and
(
  orientation:landscape
){

  #${BADGE_ID}{

    height:
    32px !important;

    font-size:
    10px !important;

  }

}

  `;


  document.head.appendChild(
    style
  );

}


/* =====================================================
   LOGIN ICON
===================================================== */

function loginIcon(){

  return `

  <span
    class="zyper-badge-icon"
  >

    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >

      <path
        d="M10 17l5-5-5-5"
      >
      </path>

      <path
        d="M15 12H3"
      >
      </path>

      <path
        d="M21 19V5a2 2 0 0 0-2-2h-6"
      >
      </path>

    </svg>

  </span>

  `;

}


/* =====================================================
   WALLET ICON
===================================================== */

function walletIcon(){

  return `

  <span
    class="zyper-badge-icon"
  >

    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >

      <path
        d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"
      >
      </path>

      <path
        d="M16 13h4"
      >
      </path>

    </svg>

  </span>

  `;

}


/* =====================================================
   MONEY FORMAT
===================================================== */

function formatMoney(
  amount
){

  const value =
  Number(
    amount || 0
  );


  if(
    !Number.isFinite(
      value
    )
  ){

    return
    "0.00 LKR";

  }


  return (
    value.toLocaleString(
      "en-LK",
      {
        minimumFractionDigits:
        2,

        maximumFractionDigits:
        2
      }
    )
    +
    " LKR"
  );

}


/* =====================================================
   REMOVE OLD BUTTONS
===================================================== */

function removeLegacy(){

  [
    ".top-login-button",
    ".top-wallet-button",
    ".top-account-loading"
  ]

  .forEach(
    function(selector){

      document
      .querySelectorAll(
        selector
      )
      .forEach(
        function(element){

          if(
            element.id !==
            BADGE_ID
          ){

            element.remove();

          }

        }
      );

    }
  );

}


/* =====================================================
   FIND TOPBAR TARGET
===================================================== */

function findTarget(){

  return (
    document.getElementById(
      TOPBAR_SLOT_ID
    )
    ||
    document.body
  );

}


/* =====================================================
   ATTACH BADGE
===================================================== */

function attachBadge(){

  if(
    !badge
  ){

    return;

  }


  const target =
  findTarget();


  if(
    badge.parentElement !==
    target
  ){

    target.appendChild(
      badge
    );

  }

}


/* =====================================================
   CREATE BADGE
===================================================== */

function createBadge(){

  const existing =
  document.getElementById(
    BADGE_ID
  );


  if(existing){

    badge =
    existing;

    attachBadge();

    return badge;

  }


  badge =
  document.createElement(
    "a"
  );


  badge.id =
  BADGE_ID;


  badge.href =
  "./index.html?login=1";


  badge.setAttribute(
    "aria-label",
    "Zyper account"
  );


  badge.className =
  "zyper-badge-loading";


  badge.innerHTML = `

    ${loginIcon()}

    <span
      class="zyper-badge-text"
    >
      CHECKING
    </span>

  `;


  attachBadge();


  return badge;

}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin(){

  createBadge();


  badge.href =
  "./index.html?login=1";


  badge.className =
  "zyper-badge-login";


  badge.setAttribute(
    "aria-label",
    "Login to Zyper"
  );


  badge.innerHTML = `

    ${loginIcon()}

    <span
      class="zyper-badge-text"
    >
      LOGIN
    </span>

  `;

}


/* =====================================================
   SHOW WALLET
===================================================== */

function showWallet(
  text
){

  createBadge();


  badge.href =
  "./wallet.html";


  badge.className =
  "zyper-badge-wallet";


  badge.setAttribute(
    "aria-label",
    "Open Zyper Wallet"
  );


  badge.innerHTML = `

    ${walletIcon()}

    <span
      class="zyper-badge-text"
    >
      ${text}
    </span>

  `;

}


/* =====================================================
   LOAD LIVE WALLET
===================================================== */

async function loadWallet(
  user
){

  showWallet(
    "..."
  );


  try{

    const token =
    await user.getIdToken();


    const response =
    await fetch(
      WORKER_URL,
      {

        method:
        "POST",


        headers:{

          "Content-Type":
          "application/json",


          "Authorization":
          `Bearer ${token}`

        },


        body:
        JSON.stringify({
          action:
          "wallet_balance"
        })

      }
    );


    const result =
    await response.json();


    if(
      !response.ok
      ||
      !result
      ||
      result.success ===
      false
    ){

      throw new Error(
        result?.message
        ||
        "Wallet unavailable."
      );

    }


    const amount =

    result.wallet
    ?.availableBalance

    ??

    result.wallet
    ?.balance

    ??

    0;


    showWallet(
      formatMoney(
        amount
      )
    );

  }
  catch(error){

    console.error(
      "Zyper wallet badge:",
      error
    );


    showWallet(
      "WALLET"
    );

  }

}


/* =====================================================
   OBSERVE TOP BAR
===================================================== */

function observeTopbar(){

  const observer =
  new MutationObserver(
    function(){

      if(
        document.getElementById(
          TOPBAR_SLOT_ID
        )
      ){

        attachBadge();

      }

    }
  );


  observer.observe(
    document.documentElement,
    {

      childList:
      true,

      subtree:
      true

    }
  );

}


/* =====================================================
   START
===================================================== */

function start(){

  ensureStyle();

  removeLegacy();

  createBadge();

  observeTopbar();


  onAuthStateChanged(
    auth,
    async function(user){

      if(!user){

        showLogin();

        return;

      }


      await loadWallet(
        user
      );

    }
  );

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
