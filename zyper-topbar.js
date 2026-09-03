/* =========================================================
   ZYPER DIAMOND STORE
   SHARED TOP BAR
   SAME HEADER FOR EVERY PAGE
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       SETTINGS
    ===================================================== */

    const TOPBAR_ID =
        "zyperSharedTopbar";


    const STYLE_ID =
        "zyperSharedTopbarStyle";


    const WALLET_SCRIPT_ID =
        "zyperSharedWalletScript";


    const WALLET_SCRIPT =
        "./zyper-wallet-badge.js?v=6000";


    /* =====================================================
       REMOVE OLD SHARED TOPBAR
    ===================================================== */

    function removeOldTopbar() {

        const old =
            document.getElementById(
                TOPBAR_ID
            );


        if (old) {

            old.remove();

        }

    }


    /* =====================================================
       CREATE CSS
    ===================================================== */

    function createStyle() {

        if (
            document.getElementById(
                STYLE_ID
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            STYLE_ID;


        style.textContent = `


/* =====================================================
   ZYPER SHARED TOP BAR
===================================================== */

#${TOPBAR_ID}{

    position:fixed !important;

    top:0 !important;
    left:0 !important;
    right:0 !important;

    width:100% !important;

    height:72px !important;

    display:flex !important;

    align-items:center !important;

    justify-content:space-between !important;

    padding:
        0 165px
        0 16px !important;

    box-sizing:border-box !important;

    background:
        linear-gradient(
            180deg,
            rgba(2,6,23,.97),
            rgba(15,23,42,.94)
        ) !important;

    border-bottom:
        1px solid
        rgba(255,255,255,.08) !important;

    box-shadow:
        0 10px 35px
        rgba(0,0,0,.32) !important;

    backdrop-filter:
        blur(18px) !important;

    -webkit-backdrop-filter:
        blur(18px) !important;

    z-index:
        2147483000 !important;

}


/* =====================================================
   BRAND
===================================================== */

#${TOPBAR_ID}
.zyper-topbar-brand{

    display:flex !important;

    align-items:center !important;

    gap:11px !important;

    min-width:0 !important;

    text-decoration:none !important;

    color:#ffffff !important;

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

    border-radius:13px !important;

    overflow:hidden !important;

    background:#ffffff !important;

    display:flex !important;

    align-items:center !important;

    justify-content:center !important;

    box-shadow:
        0 6px 18px
        rgba(59,130,246,.22) !important;

}


#${TOPBAR_ID}
.zyper-topbar-logo img{

    width:100% !important;
    height:100% !important;

    display:block !important;

    object-fit:cover !important;

}


/* =====================================================
   BRAND TEXT
===================================================== */

#${TOPBAR_ID}
.zyper-topbar-text{

    display:flex !important;

    flex-direction:column !important;

    justify-content:center !important;

    min-width:0 !important;

}


#${TOPBAR_ID}
.zyper-topbar-name{

    font-family:
        "Orbitron",
        "Poppins",
        Arial,
        sans-serif !important;

    font-size:19px !important;

    font-weight:800 !important;

    line-height:1.05 !important;

    letter-spacing:.8px !important;

    color:#ffffff !important;

    white-space:nowrap !important;

}


#${TOPBAR_ID}
.zyper-topbar-sub{

    margin-top:4px !important;

    font-family:
        "Poppins",
        Arial,
        sans-serif !important;

    font-size:9px !important;

    font-weight:600 !important;

    letter-spacing:2px !important;

    color:#94a3b8 !important;

    white-space:nowrap !important;

}


/* =====================================================
   GLOW
===================================================== */

#${TOPBAR_ID}::after{

    content:"";

    position:absolute !important;

    left:10% !important;
    right:10% !important;
    bottom:-1px !important;

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
   PAGE SPACE
===================================================== */

html{

    scroll-padding-top:
        82px !important;

}


body{

    padding-top:
        82px !important;

}


/* =====================================================
   MOBILE
===================================================== */

@media(max-width:600px){

    #${TOPBAR_ID}{

        height:
            64px !important;

        padding:
            0 122px
            0 10px !important;

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
            1.3px !important;

    }


    body{

        padding-top:
            72px !important;

    }

}


/* =====================================================
   SMALL PHONE
===================================================== */

@media(max-width:360px){

    #${TOPBAR_ID}{

        padding-right:
            112px !important;

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

    }


    #${TOPBAR_ID}
    .zyper-topbar-name{

        font-size:
            13px !important;

    }


    #${TOPBAR_ID}
    .zyper-topbar-sub{

        display:none !important;

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

    function createTopbar() {

        removeOldTopbar();


        const header =
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

        `;


        document.body.prepend(
            header
        );

    }


    /* =====================================================
       LOAD GOOGLE FONT
    ===================================================== */

    function loadFonts() {

        if (
            document.getElementById(
                "zyperTopbarFont"
            )
        ) {

            return;

        }


        const link =
            document.createElement(
                "link"
            );


        link.id =
            "zyperTopbarFont";


        link.rel =
            "stylesheet";


        link.href =
            "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap";


        document.head.appendChild(
            link
        );

    }


    /* =====================================================
       LOAD SHARED WALLET / LOGIN CONTROL
    ===================================================== */

    function loadWalletControl() {

        /*
           If wallet badge already exists,
           do not load another copy.
        */

        if (
            document.getElementById(
                "zyperWalletBadge"
            )
        ) {

            return;

        }


        if (
            document.getElementById(
                WALLET_SCRIPT_ID
            )
        ) {

            return;

        }


        /*
           Check if page already loaded
           zyper-wallet-badge.js.
        */

        const existingScript =
            Array.from(
                document.scripts
            )
            .find(
                function(script) {

                    return (
                        script.src &&
                        script.src.includes(
                            "zyper-wallet-badge.js"
                        )
                    );

                }
            );


        if (existingScript) {

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

    function start() {

        loadFonts();

        createStyle();

        createTopbar();

        loadWalletControl();

    }


    /* =====================================================
       DOM READY
    ===================================================== */

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
