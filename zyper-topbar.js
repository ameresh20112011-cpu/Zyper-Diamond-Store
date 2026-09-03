/* =========================================================
   ZYPER DIAMOND STORE
   SHARED RESPONSIVE TOP BAR
   PC + ANDROID + IPHONE + TABLET + LANDSCAPE
========================================================= */

(function(){

  "use strict";

  const TOPBAR_ID =
  "zyperSharedTopbar";

  const STYLE_ID =
  "zyperSharedTopbarStyle";

  const WALLET_SCRIPT_ID =
  "zyperSharedWalletScript";

  const WALLET_SCRIPT =
  "./zyper-wallet-badge.js?v=7000";


  /* =====================================================
     VIEWPORT
  ===================================================== */

  function ensureViewport(){

    let viewport =
    document.querySelector(
      'meta[name="viewport"]'
    );

    const content =
    "width=device-width, initial-scale=1.0, viewport-fit=cover";

    if(!viewport){

      viewport =
      document.createElement(
        "meta"
      );

      viewport.name =
      "viewport";

      document.head.prepend(
        viewport
      );
    }

    viewport.setAttribute(
      "content",
      content
    );
  }


  /* =====================================================
     FONT
  ===================================================== */

  function loadFont(){

    if(
      document.getElementById(
        "zyperSharedTopbarFont"
      )
    ){
      return;
    }

    const link =
    document.createElement(
      "link"
    );

    link.id =
    "zyperSharedTopbarFont";

    link.rel =
    "stylesheet";

    link.href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap";

    document.head.appendChild(
      link
    );
  }


  /* =====================================================
     STYLE
  ===================================================== */

  function createStyle(){

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

:root{
  --zyper-topbar-height:72px;
}

#${TOPBAR_ID}{

  position:fixed !important;

  top:0 !important;
  left:0 !important;
  right:0 !important;

  width:100% !important;

  height:
  calc(
    var(--zyper-topbar-height)
    +
    env(safe-area-inset-top, 0px)
  ) !important;

  padding:
  env(safe-area-inset-top, 0px)
  max(16px, env(safe-area-inset-right, 0px))
  0
  max(16px, env(safe-area-inset-left, 0px))
  !important;

  margin:0 !important;

  display:flex !important;

  align-items:center !important;

  justify-content:
  space-between !important;

  gap:10px !important;

  box-sizing:
  border-box !important;

  background:
  linear-gradient(
    180deg,
    rgba(2,6,23,.98),
    rgba(15,23,42,.95)
  ) !important;

  border-bottom:
  1px solid
  rgba(255,255,255,.08)
  !important;

  box-shadow:
  0 10px 35px
  rgba(0,0,0,.32)
  !important;

  backdrop-filter:
  blur(18px) !important;

  -webkit-backdrop-filter:
  blur(18px) !important;

  z-index:
  2147483000 !important;

  isolation:isolate !important;

  pointer-events:auto !important;

  -webkit-tap-highlight-color:
  transparent !important;

}


/* GLOW LINE */

#${TOPBAR_ID}::after{

  content:"";

  position:absolute !important;

  left:10% !important;
  right:10% !important;
  bottom:0 !important;

  height:1px !important;

  background:
  linear-gradient(
    90deg,
    transparent,
    rgba(59,130,246,.65),
    rgba(124,58,237,.65),
    transparent
  ) !important;

  pointer-events:none !important;

}


/* =====================================================
   BRAND
===================================================== */

#${TOPBAR_ID}
.zyper-topbar-brand{

  min-width:0 !important;

  display:flex !important;

  align-items:center !important;

  gap:10px !important;

  flex:
  1 1 auto !important;

  overflow:hidden !important;

  color:#fff !important;

  text-decoration:none !important;

  pointer-events:auto !important;

  touch-action:
  manipulation !important;

  -webkit-tap-highlight-color:
  transparent !important;

}


/* =====================================================
   LOGO
===================================================== */

#${TOPBAR_ID}
.zyper-topbar-logo{

  width:46px !important;

  height:46px !important;

  min-width:46px !important;

  min-height:46px !important;

  flex:
  0 0 46px !important;

  border-radius:
  13px !important;

  overflow:hidden !important;

  display:flex !important;

  align-items:center !important;

  justify-content:center !important;

  background:
  #ffffff !important;

  box-shadow:
  0 6px 18px
  rgba(59,130,246,.22)
  !important;

}


#${TOPBAR_ID}
.zyper-topbar-logo img{

  display:block !important;

  width:100% !important;

  height:100% !important;

  object-fit:cover !important;

  border:0 !important;

}


/* =====================================================
   BRAND TEXT
===================================================== */

#${TOPBAR_ID}
.zyper-topbar-text{

  min-width:0 !important;

  display:flex !important;

  flex-direction:
  column !important;

  justify-content:
  center !important;

  overflow:hidden !important;

}


#${TOPBAR_ID}
.zyper-topbar-name{

  max-width:100% !important;

  overflow:hidden !important;

  text-overflow:
  ellipsis !important;

  font-family:
  "Orbitron",
  "Poppins",
  Arial,
  sans-serif
  !important;

  font-size:
  19px !important;

  font-weight:
  800 !important;

  line-height:
  1.05 !important;

  letter-spacing:
  .8px !important;

  color:#ffffff !important;

  white-space:
  nowrap !important;

}


#${TOPBAR_ID}
.zyper-topbar-sub{

  max-width:100% !important;

  margin-top:
  4px !important;

  overflow:hidden !important;

  text-overflow:
  ellipsis !important;

  font-family:
  "Poppins",
  Arial,
  sans-serif
  !important;

  font-size:
  9px !important;

  font-weight:
  600 !important;

  line-height:
  1 !important;

  letter-spacing:
  1.8px !important;

  color:
  #94a3b8 !important;

  white-space:
  nowrap !important;

}


/* =====================================================
   RIGHT LOGIN / WALLET AREA
===================================================== */

#${TOPBAR_ID}
#zyperTopbarAction{

  min-width:0 !important;

  display:flex !important;

  align-items:center !important;

  justify-content:
  flex-end !important;

  flex:
  0 1 auto !important;

  pointer-events:
  auto !important;

  position:relative !important;

  z-index:3 !important;

}


/* =====================================================
   REMOVE OLD HOME HEADER
===================================================== */

body > .top-header,
body > header.top-header{

  display:none !important;

}


/* =====================================================
   PAGE SPACE
===================================================== */

html{

  scroll-padding-top:
  calc(
    var(--zyper-topbar-height)
    +
    env(safe-area-inset-top, 0px)
    +
    8px
  ) !important;

}


body{

  padding-top:
  calc(
    var(--zyper-topbar-height)
    +
    env(safe-area-inset-top, 0px)
    +
    10px
  ) !important;

}


/* =====================================================
   TABLET / PHONE
===================================================== */

@media(max-width:768px){

  :root{

    --zyper-topbar-height:
    64px;

  }


  #${TOPBAR_ID}{

    padding-left:
    max(
      11px,
      env(safe-area-inset-left, 0px)
    ) !important;

    padding-right:
    max(
      10px,
      env(safe-area-inset-right, 0px)
    ) !important;

    gap:
    8px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-brand{

    gap:
    8px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-logo{

    width:
    42px !important;

    height:
    42px !important;

    min-width:
    42px !important;

    min-height:
    42px !important;

    flex-basis:
    42px !important;

    border-radius:
    11px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-name{

    font-size:
    15px !important;

    letter-spacing:
    .4px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-sub{

    margin-top:
    3px !important;

    font-size:
    7px !important;

    letter-spacing:
    1.2px !important;

  }

}


/* =====================================================
   SMALL PHONE
===================================================== */

@media(max-width:480px){

  :root{

    --zyper-topbar-height:
    62px;

  }


  #${TOPBAR_ID}{

    padding-left:
    max(
      9px,
      env(safe-area-inset-left, 0px)
    ) !important;

    padding-right:
    max(
      8px,
      env(safe-area-inset-right, 0px)
    ) !important;

    gap:
    6px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-logo{

    width:
    38px !important;

    height:
    38px !important;

    min-width:
    38px !important;

    min-height:
    38px !important;

    flex-basis:
    38px !important;

    border-radius:
    10px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-name{

    font-size:
    13px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-sub{

    font-size:
    6.5px !important;

    letter-spacing:
    .9px !important;

  }

}


/* =====================================================
   VERY SMALL PHONE
===================================================== */

@media(max-width:360px){

  :root{

    --zyper-topbar-height:
    60px;

  }


  #${TOPBAR_ID}
  .zyper-topbar-logo{

    width:
    36px !important;

    height:
    36px !important;

    min-width:
    36px !important;

    min-height:
    36px !important;

    flex-basis:
    36px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-name{

    font-size:
    12px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-sub{

    display:
    none !important;

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

  :root{

    --zyper-topbar-height:
    56px;

  }


  #${TOPBAR_ID}
  .zyper-topbar-logo{

    width:
    36px !important;

    height:
    36px !important;

    min-width:
    36px !important;

    min-height:
    36px !important;

    flex-basis:
    36px !important;

  }


  #${TOPBAR_ID}
  .zyper-topbar-sub{

    display:
    none !important;

  }

}

    `;


    document.head.appendChild(
      style
    );

  }


  /* =====================================================
     CREATE TOP BAR
  ===================================================== */

  function createTopbar(){

    let header =
    document.getElementById(
      TOPBAR_ID
    );


    if(header){

      return header;

    }


    header =
    document.createElement(
      "header"
    );


    header.id =
    TOPBAR_ID;


    header.innerHTML = `

      <a
        href="./home.html"
        class="zyper-topbar-brand"
        aria-label="Zyper Diamond Store Home"
      >

        <span
          class="zyper-topbar-logo"
        >

          <img
            src="./1.jpg"
            alt="Zyper Diamond Store"
          >

        </span>


        <span
          class="zyper-topbar-text"
        >

          <span
            class="zyper-topbar-name"
          >
            ZYPER
          </span>


          <span
            class="zyper-topbar-sub"
          >
            DIAMOND STORE
          </span>

        </span>

      </a>


      <div
        id="zyperTopbarAction"
        aria-live="polite"
      >
      </div>

    `;


    document.body.prepend(
      header
    );


    return header;

  }


  /* =====================================================
     LOAD WALLET / LOGIN BADGE
  ===================================================== */

  function loadWallet(){

    const existing =
    Array.from(
      document.scripts
    )
    .find(
      function(script){

        return (
          script.src
          &&
          script.src.includes(
            "zyper-wallet-badge.js"
          )
        );

      }
    );


    if(existing){

      return;

    }


    if(
      document.getElementById(
        WALLET_SCRIPT_ID
      )
    ){

      return;

    }


    const script =
    document.createElement(
      "script"
    );


    script.id =
    WALLET_SCRIPT_ID;


    script.type =
    "module";


    script.src =
    WALLET_SCRIPT;


    document.body.appendChild(
      script
    );

  }


  /* =====================================================
     START
  ===================================================== */

  function start(){

    ensureViewport();

    loadFont();

    createStyle();

    createTopbar();

    loadWallet();

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
