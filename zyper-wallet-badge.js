/* =========================================================
   ZYPER DIAMOND STORE
   OLD LOGIN + OLD WALLET BADGE

   GUEST:
   [ login symbol LOGIN ]

   LOGGED:
   [ wallet symbol 7,448.00 LKR ]
========================================================= */


import {
    auth
}
from
"./firebase.js?v=10000";


import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const WORKER_URL =
"https://zyper-order.ameresh20112011.workers.dev";


const BADGE_ID =
"zyperWalletBadge";


let badge =
null;


/* =====================================================
   CSS
===================================================== */

function addStyle() {

    if (
        document.getElementById(
            "zyperOldWalletBadgeStyle"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zyperOldWalletBadgeStyle";


    style.textContent = `

#zyperWalletBadge{

    height:36px !important;

    min-width:108px !important;

    max-width:160px !important;

    padding:0 13px !important;

    margin:0 !important;


    display:inline-flex !important;

    align-items:center !important;

    justify-content:center !important;

    gap:7px !important;


    border-radius:18px !important;


    border:

    1px solid
    rgba(
        255,
        255,
        255,
        .16
    ) !important;


    background:

    linear-gradient(
        135deg,
        #6246d8,
        #784ee7
    ) !important;


    color:#ffffff !important;


    text-decoration:none !important;


    font-family:
    "Poppins",
    "Segoe UI",
    Arial,
    sans-serif !important;


    font-size:11px !important;

    line-height:1 !important;

    font-weight:700 !important;


    white-space:nowrap !important;


    box-shadow:

    0
    6px
    18px
    rgba(
        98,
        70,
        216,
        .30
    ) !important;


    cursor:pointer !important;

    user-select:none !important;

    -webkit-user-select:none !important;

    touch-action:manipulation !important;

    -webkit-tap-highlight-color:
    transparent !important;

}


/* ICON */

#zyperWalletBadge
.zyper-badge-icon{

    width:17px !important;

    height:17px !important;

    min-width:17px !important;

    display:flex !important;

    align-items:center !important;

    justify-content:center !important;

    flex-shrink:0 !important;

}


#zyperWalletBadge
.zyper-badge-icon i{

    color:#ffffff !important;

    font-size:15px !important;

    line-height:1 !important;

}


/* TEXT */

#zyperWalletBadge
.zyper-badge-text{

    display:block !important;

    overflow:hidden !important;

    text-overflow:ellipsis !important;

    white-space:nowrap !important;

}


/* TOUCH */

#zyperWalletBadge:active{

    transform:scale(.95) !important;

}


/* PHONE */

@media(max-width:520px){

    #zyperWalletBadge{

        height:34px !important;

        min-width:95px !important;

        max-width:137px !important;

        padding:0 10px !important;

        gap:6px !important;

        border-radius:17px !important;

        font-size:10px !important;

    }


    #zyperWalletBadge
    .zyper-badge-icon{

        width:15px !important;

        height:15px !important;

        min-width:15px !important;

    }


    #zyperWalletBadge
    .zyper-badge-icon i{

        font-size:14px !important;

    }

}


@media(max-width:350px){

    #zyperWalletBadge{

        min-width:86px !important;

        max-width:118px !important;

        padding:0 8px !important;

        font-size:9px !important;

    }

}

    `;


    document.head.appendChild(
        style
    );

}


/* =====================================================
   CREATE
===================================================== */

function createBadge() {

    const target =
        document.getElementById(
            "zyperTopbarAction"
        );


    if (!target) {

        return false;

    }


    const existing =
        document.getElementById(
            BADGE_ID
        );


    if (existing) {

        badge =
            existing;

    }
    else {

        badge =
            document.createElement(
                "a"
            );


        badge.id =
            BADGE_ID;

    }


    if (
        badge.parentElement !==
        target
    ) {

        target.appendChild(
            badge
        );

    }


    return true;

}


/* =====================================================
   LOGIN UI
===================================================== */

function showLogin() {

    if (!createBadge()) {

        return;

    }


    badge.href =
        "./index.html";


    badge.setAttribute(
        "aria-label",
        "Login"
    );


    badge.innerHTML = `

<span
class="zyper-badge-icon"
>

    <i
    class="fa-solid fa-right-to-bracket"
    ></i>

</span>


<span
class="zyper-badge-text"
>
LOGIN
</span>

    `;

}


/* =====================================================
   WALLET UI
===================================================== */

function showWallet(
    text
) {

    if (!createBadge()) {

        return;

    }


    badge.href =
        "./wallet.html";


    badge.setAttribute(
        "aria-label",
        "Open Wallet"
    );


    badge.innerHTML = `

<span
class="zyper-badge-icon"
>

    <i
    class="fa-solid fa-wallet"
    ></i>

</span>


<span
class="zyper-badge-text"
>
${text}
</span>

    `;

}


/* =====================================================
   MONEY
===================================================== */

function formatMoney(
    value
) {

    const amount =
        Number(
            value || 0
        );


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return "0.00 LKR";

    }


    return (

        amount.toLocaleString(
            "en-LK",
            {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }
        )

        +

        " LKR"

    );

}


/* =====================================================
   LOAD WALLET
===================================================== */

async function loadWallet(
    user
) {

    showWallet(
        "..."
    );


    try {


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
                            "Bearer " +
                            token

                    },


                    body:
                        JSON.stringify({

                            action:
                                "wallet_balance"

                        })

                }

            );


        const data =
            await response.json();


        if (
            !response.ok
            ||
            !data
            ||
            data.success === false
        ) {

            throw new Error(
                data?.message ||
                "Wallet unavailable"
            );

        }


        const wallet =
            data.wallet || {};


        const balance =

            wallet.availableBalance

            ??

            wallet.balance

            ??

            0;


        showWallet(
            formatMoney(
                balance
            )
        );

    }
    catch(error) {


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
   AUTH
===================================================== */

function start() {

    addStyle();


    /*
       Wait until topbar exists.
    */

    let attempts =
        0;


    const timer =
        setInterval(

            function() {


                attempts++;


                if (
                    createBadge()
                ) {

                    clearInterval(
                        timer
                    );


                    onAuthStateChanged(

                        auth,

                        async function(user) {


                            window.zyperCurrentUser =
                                user || null;


                            window.dispatchEvent(

                                new CustomEvent(
                                    "zyper-auth-change",
                                    {
                                        detail:{
                                            user:
                                                user || null
                                        }
                                    }
                                )

                            );


                            if (!user) {

                                showLogin();

                                return;

                            }


                            await loadWallet(
                                user
                            );

                        }

                    );

                }


                if (
                    attempts > 100
                ) {

                    clearInterval(
                        timer
                    );

                }

            },

            50

        );

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
