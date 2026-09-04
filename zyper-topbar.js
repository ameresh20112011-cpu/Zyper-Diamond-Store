/* =========================================================
   ZYPER DIAMOND STORE
   SHARED TOP BAR
   PC + PHONE
========================================================= */

(function () {

    "use strict";

    var TOPBAR_ID = "zyperSharedTopbar";
    var STYLE_ID = "zyperSharedTopbarStyle";


    /* =====================================================
       LOAD FONT AWESOME
    ===================================================== */

    function loadFontAwesome() {

        var links =
            document.getElementsByTagName("link");

        var i;

        for (i = 0; i < links.length; i++) {

            var href =
                links[i].getAttribute("href") || "";

            if (
                href.indexOf("font-awesome") !== -1 ||
                href.indexOf("fontawesome") !== -1
            ) {

                return;
            }
        }


        var link =
            document.createElement("link");

        link.rel =
            "stylesheet";

        link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";

        document.head.appendChild(link);
    }


    /* =====================================================
       STYLE
    ===================================================== */

    function addStyle() {

        if (
            document.getElementById(STYLE_ID)
        ) {

            return;
        }


        var style =
            document.createElement("style");

        style.id =
            STYLE_ID;


        style.textContent = `

:root{
    --zyper-topbar-height:72px;
}


/* =====================================================
   TOP BAR
===================================================== */

#zyperSharedTopbar{

    position:fixed !important;

    top:0 !important;
    left:0 !important;
    right:0 !important;

    height:
    calc(
        var(--zyper-topbar-height)
        +
        env(safe-area-inset-top,0px)
    ) !important;

    padding:

    env(safe-area-inset-top,0px)

    max(
        15px,
        env(safe-area-inset-right,0px)
    )

    0

    max(
        15px,
        env(safe-area-inset-left,0px)
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
        rgba(4,13,41,.98)
    ) !important;


    border-bottom:
    1px solid
    rgba(80,110,255,.20) !important;


    box-shadow:
    0 7px 25px
    rgba(0,0,0,.35) !important;


    z-index:999999 !important;
}


/* =====================================================
   BRAND
===================================================== */

.zyper-top-brand{

    display:flex !important;

    align-items:center !important;

    gap:10px !important;

    text-decoration:none !important;

    min-width:0 !important;
}


/* LOGO */

.zyper-top-logo{

    width:46px !important;

    height:46px !important;

    min-width:46px !important;

    overflow:hidden !important;

    border-radius:13px !important;

    background:#ffffff !important;
}


.zyper-top-logo img{

    width:100% !important;

    height:100% !important;

    display:block !important;

    object-fit:cover !important;
}


/* BRAND TEXT */

.zyper-brand-text{

    display:flex !important;

    flex-direction:column !important;

    justify-content:center !important;
}


/* ZYPER */

.zyper-top-name{

    color:#ffffff !important;

    font-family:
    Poppins,
    Arial,
    sans-serif !important;

    font-size:20px !important;

    line-height:1 !important;

    font-weight:800 !important;

    letter-spacing:1px !important;

    white-space:nowrap !important;
}


/* SMALL DIAMOND STORE */

.zyper-top-subtitle{

    margin-top:4px !important;

    color:#919bb5 !important;

    font-family:
    Poppins,
    Arial,
    sans-serif !important;

    font-size:7px !important;

    line-height:1 !important;

    font-weight:600 !important;

    letter-spacing:1.6px !important;

    white-space:nowrap !important;
}


/* =====================================================
   RIGHT LOGIN / WALLET AREA
===================================================== */

#zyperTopbarAction{

    display:flex !important;

    align-items:center !important;

    justify-content:flex-end !important;

    min-width:0 !important;
}


/* =====================================================
   PAGE TOP SPACE
===================================================== */

body{

    padding-top:
    calc(
        var(--zyper-topbar-height)
        +
        env(safe-area-inset-top,0px)
        +
        8px
    ) !important;
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


    .zyper-top-logo{

        width:42px !important;

        height:42px !important;

        min-width:42px !important;

        border-radius:12px !important;
    }


    .zyper-top-brand{

        gap:8px !important;
    }


    .zyper-top-name{

        font-size:17px !important;
    }


    .zyper-top-subtitle{

        margin-top:3px !important;

        font-size:6px !important;

        letter-spacing:1.2px !important;
    }

}


/* =====================================================
   SMALL PHONE
===================================================== */

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


        document.head.appendChild(style);
    }


    /* =====================================================
       CREATE TOP BAR
    ===================================================== */

    function createTopbar() {

        if (
            document.getElementById(TOPBAR_ID)
        ) {

            return;
        }


        var header =
            document.createElement("header");


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


        document.body.insertBefore(
            header,
            document.body.firstChild
        );
    }


    /* =====================================================
       CHECK WALLET BADGE SCRIPT
    ===================================================== */

    function walletBadgeAlreadyLoaded() {

        var scripts =
            document.getElementsByTagName("script");

        var i;


        for (
            i = 0;
            i < scripts.length;
            i++
        ) {

            var src =
                scripts[i].getAttribute("src") || "";


            if (
                src.indexOf(
                    "zyper-wallet-badge.js"
                ) !== -1
            ) {

                return true;
            }
        }


        return false;
    }


    /* =====================================================
       LOAD WALLET BADGE
    ===================================================== */

    function loadWalletBadge() {

        if (
            walletBadgeAlreadyLoaded()
        ) {

            return;
        }


        var script =
            document.createElement("script");


        script.type =
            "module";


        script.src =
            "./zyper-wallet-badge.js?v=10001";


        document.body.appendChild(script);
    }


    /* =====================================================
       START
    ===================================================== */

    function start() {

        loadFontAwesome();

        addStyle();

        createTopbar();

        loadWalletBadge();
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    }
    else {

        start();
    }

})();
