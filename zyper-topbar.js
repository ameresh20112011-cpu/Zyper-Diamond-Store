/* =========================================================
   ZYPER DIAMOND STORE
   SHARED TOP BAR

   ZYPER
   DIAMOND STORE

   OLD LOGIN / WALLET STYLE
========================================================= */

(function(){

"use strict";


const TOPBAR_ID =
"zyperSharedTopbar";


/* =====================================================
   FONT AWESOME
===================================================== */

function loadFontAwesome(){

    const exists =
        document.querySelector(
            'link[href*="font-awesome"], link[href*="fontawesome"]'
        );


    if(exists){
        return;
    }


    const link =
        document.createElement(
            "link"
        );


    link.rel =
        "stylesheet";


    link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";


    document.head.appendChild(
        link
    );

}


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

    position:fixed;

    top:0;
    left:0;
    right:0;

    height:

    calc(
        var(--zyper-header-height)
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
        16px,
        env(
            safe-area-inset-right,
            0px
        )
    )

    0

    max(
        16px,
        env(
            safe-area-inset-left,
            0px
        )
    );


    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:12px;


    background:

    linear-gradient(
        180deg,
        rgba(1,9,31,.98),
        rgba(3,14,43,.96)
    );


    border-bottom:

    1px solid
    rgba(
        76,
        108,
        255,
        .20
    );


    box-shadow:

    0
    8px
    30px
    rgba(
        0,
        0,
        0,
        .32
    );


    backdrop-filter:
    blur(18px);


    -webkit-backdrop-filter:
    blur(18px);


    z-index:
    2147483000;

}


/* =====================================================
   BRAND
===================================================== */

.zyper-top-brand{

    display:flex;

    align-items:center;

    gap:11px;

    min-width:0;

    text-decoration:none;

}


/* LOGO */

.zyper-top-logo{

    width:48px;
    height:48px;

    min-width:48px;

    border-radius:14px;

    overflow:hidden;

    background:#ffffff;

    box-shadow:

    0
    5px
    18px
    rgba(
        0,
        0,
        0,
        .25
    );

}


.zyper-top-logo img{

    width:100%;
    height:100%;

    display:block;

    object-fit:cover;

}


/* TEXT AREA */

.zyper-brand-text{

    display:flex;

    flex-direction:column;

    justify-content:center;

    min-width:0;

}


/* ZYPER */

.zyper-top-name{

    color:#ffffff;

    font-family:
    "Poppins",
    Arial,
    sans-serif;

    font-size:20px;

    line-height:1.05;

    font-weight:800;

    letter-spacing:1px;

    white-space:nowrap;

}


/* DIAMOND STORE */

.zyper-top-subtitle{

    margin-top:3px;

    color:
    #929bb4;

    font-family:
    "Poppins",
    Arial,
    sans-serif;

    font-size:8px;

    line-height:1;

    font-weight:600;

    letter-spacing:1.6px;

    white-space:nowrap;

}


/* =====================================================
   RIGHT AREA
===================================================== */

#zyperTopbarAction{

    display:flex;

    align-items:center;

    justify-content:flex-end;

    min-width:0;

}


/* =====================================================
   BODY TOP SPACE
===================================================== */

body{

    padding-top:

    calc(
        var(--zyper-header-height)
        +
        env(
            safe-area-inset-top,
            0px
        )
        +
        8px
    )

    !important;

}


/* =====================================================
   PHONE
===================================================== */

@media(max-width:480px){

    :root{

        --zyper-header-height:
        64px;

    }


    #zyperSharedTopbar{

        padding-left:
        11px;

        padding-right:
        11px;

    }


    .zyper-top-logo{

        width:43px;
        height:43px;

        min-width:43px;

        border-radius:12px;

    }


    .zyper-top-brand{

        gap:9px;

    }


    .zyper-top-name{

        font-size:17px;

    }


    .zyper-top-subtitle{

        font-size:6.7px;

        letter-spacing:1.35px;

        margin-top:3px;

    }

}


@media(max-width:360px){

    .zyper-top-name{

        font-size:15px;

    }


    .zyper-top-subtitle{

        font-size:6px;

        letter-spacing:1px;

    }


    .zyper-top-logo{

        width:40px;
        height:40px;

        min-width:40px;

    }

}

    `;


    document.head.appendChild(
        style
    );

}


/* =====================================================
   CREATE HEADER
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
                alt="Zyper Diamond Store"
                >

            </span>


            <span
            class="zyper-brand-text"
            >

                <span
                class="zyper-top-name"
                >
                    ZYPER
                </span>

                <span
                class="zyper-top-subtitle"
                >
                    DIAMOND STORE
                </span>

            </span>

        </a>


        <div
        id="zyperTopbarAction"
        ></div>

    `;


    document.body.prepend(
        header
    );

}


/* =====================================================
   LOAD WALLET BADGE
===================================================== */

function loadWalletBadge(){

    const exists =

        Array.from(
            document.scripts
        )

        .some(
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


    if(exists){
        return;
    }


    const script =
        document.createElement(
            "script"
        );


    script.type =
        "module";


    script.src =
        "./zyper-wallet-badge.js?v=9100";


    document.body.appendChild(
        script
    );

}


/* =====================================================
   START
===================================================== */

function start(){

    loadFontAwesome();

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
