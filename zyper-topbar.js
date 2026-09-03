/* =========================================================
   ZYPER DIAMOND STORE
   SHARED OLD TOP HEADER
   PC + PHONE
========================================================= */

(function () {

    "use strict";

    const VERSION = "10000";

    const TOPBAR_ID =
        "zyperSharedTopbar";


    /* =====================================================
       FONT AWESOME
    ===================================================== */

    function loadFontAwesome() {

        if (
            document.querySelector(
                'link[href*="font-awesome"], link[href*="fontawesome"]'
            )
        ) {
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
       CSS
    ===================================================== */

    function addStyle() {

        if (
            document.getElementById(
                "zyperSharedTopbarStyle"
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "zyperSharedTopbarStyle";


        style.textContent = `

:root{

    --zyper-topbar-height:72px;

}


#zyperSharedTopbar{

    position:fixed !important;

    top:0 !important;
    left:0 !important;
    right:0 !important;

    height:
    calc(
        var(--zyper-topbar-height)
        +
        env(
            safe-area-inset-top,
            0px
        )
    ) !important;


    padding:

    env(
        safe-area-inset-top,
        0px
    )

    max(
        15px,
        env(
            safe-area-inset-right,
            0px
        )
    )

    0

    max(
        15px,
        env(
            safe-area-inset-left,
            0px
        )
    )

    !important;


    display:flex !important;

    align-items:center !important;

    justify-content:space-between !important;

    gap:10px !important;


    background:

    linear-gradient(
        180deg,
        rgba(2,8,28,.99),
        rgba(4,13,41,.97)
    ) !important;


    border-bottom:

    1px solid
    rgba(
        77,
        105,
        255,
        .20
    ) !important;


    box-shadow:

    0 8px 28px
    rgba(
        0,
        0,
        0,
        .35
    ) !important;


    backdrop-filter:
    blur(18px) !important;


    -webkit-backdrop-filter:
    blur(18px) !important;


    z-index:2147483000 !important;

}


/* =====================================================
   LEFT BRAND
===================================================== */

.zyper-top-brand{

    display:flex !important;

    align-items:center !important;

    gap:10px !important;

    min-width:0 !important;

    text-decoration:none !important;

}


.zyper-top-logo{

    width:46px !important;

    height:46px !important;

    min-width:46px !important;

    border-radius:13px !important;

    overflow:hidden !important;

    display:block !important;

    background:#ffffff !important;


    box-shadow:

    0 5px 18px
    rgba(
        0,
        0,
        0,
        .28
    ) !important;

}


.zyper-top-logo img{

    width:100% !important;

    height:100% !important;

    display:block !important;

    object-fit:cover !important;

}


.zyper-brand-text{

    display:flex !important;

    flex-direction:column !important;

    justify-content:center !important;

    min-width:0 !important;

}


/* ZYPER */

.zyper-top-name{

    color:#ffffff !important;

    font-family:
    "Poppins",
    "Segoe UI",
    Arial,
    sans-serif !important;

    font-size:20px !important;

    line-height:1 !important;

    font-weight:800 !important;

    letter-spacing:1px !important;

    white-space:nowrap !important;

}


/* DIAMOND STORE */

.zyper-top-subtitle{

    margin-top:4px !important;

    color:#9ca6c1 !important;

    font-family:
    "Poppins",
    "Segoe UI",
    Arial,
    sans-serif !important;

    font-size:7px !important;

    line-height:1 !important;

    font-weight:600 !important;

    letter-spacing:1.6px !important;

    white-space:nowrap !important;

}


/* =====================================================
   RIGHT SIDE
===================================================== */

#zyperTopbarAction{

    display:flex !important;

    align-items:center !important;

    justify-content:flex-end !important;

    min-width:0 !important;

    flex-shrink:1 !important;

}


/* =====================================================
   PAGE SPACE
===================================================== */

body{

    padding-top:

    calc(
        var(--zyper-topbar-height)
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

@media(max-width:520px){

    :root{

        --zyper-topbar-height:64px;

    }


    #zyperSharedTopbar{

        padding-left:10px !important;

        padding-right:10px !important;

    }


    .zyper-top-brand{

        gap:8px !important;

    }


    .zyper-top-logo{

        width:42px !important;

        height:42px !important;

        min-width:42px !important;

        border-radius:12px !important;

    }


    .zyper-top-name{

        font-size:17px !important;

    }


    .zyper-top-subtitle{

        font-size:6px !important;

        letter-spacing:1.25px !important;

        margin-top:3px !important;

    }

}


@media(max-width:350px){

    .zyper-top-logo{

        width:38px !important;

        height:38px !important;

        min-width:38px !important;

    }


    .zyper-top-name{

        font-size:15px !important;

    }


    .zyper-top-subtitle{

        font-size:5.5px !important;

        letter-spacing:1px !important;

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

    function createTopbar() {

        if (
            document.getElementById(
                TOPBAR_ID
            )
        ) {
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
aria-label="Zyper Diamond Store Home"
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
       LOAD WALLET / LOGIN BADGE
    ===================================================== */

    function loadBadge() {

        /*
           Remove old duplicate wallet scripts.
           Only one shared badge should control top-right.
        */

        const existingBadge =
            document.getElementById(
                "zyperWalletBadge"
            );


        if (
            existingBadge
            &&
            !document.getElementById(
                "zyperTopbarAction"
            )
                ?.contains(existingBadge)
        ) {

            existingBadge.remove();

        }


        const script =
            document.createElement(
                "script"
            );


        script.type =
            "module";


        script.src =
            `./zyper-wallet-badge.js?v=${VERSION}`;


        script.dataset.zyperSharedBadge =
            "1";


        document.body.appendChild(
            script
        );

    }


    /* =====================================================
       START
    ===================================================== */

    function start() {

        loadFontAwesome();

        addStyle();

        createTopbar();


        const alreadyLoaded =
            document.querySelector(
                'script[data-zyper-shared-badge="1"]'
            );


        if (!alreadyLoaded) {

            loadBadge();

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once:true
            }
        );

    }
    else {

        start();

    }

})();
