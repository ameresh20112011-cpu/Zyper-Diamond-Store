/* =========================================================
   ZYPER DIAMOND STORE
   OLD TOP-RIGHT LOGIN / WALLET

   GUEST:
   [ login icon  LOGIN ]

   LOGGED:
   [ wallet icon  7,448.00 LKR ]
========================================================= */


import {
    auth
}
from
"./firebase.js?v=9001";


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
   STYLE
===================================================== */

function addStyle(){

    if(
        document.getElementById(
            "zyperWalletOldStyle"
        )
    ){
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zyperWalletOldStyle";


    style.textContent = `

#zyperWalletBadge{

    height:36px !important;

    min-width:105px !important;

    max-width:155px !important;

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
        .14
    )
    !important;


    background:

    linear-gradient(
        135deg,
        #6945d8,
        #8055e8
    )
    !important;


    color:#ffffff !important;


    text-decoration:none !important;


    font-family:
    "Poppins",
    Arial,
    sans-serif
    !important;


    font-size:11px !important;

    line-height:1 !important;

    font-weight:700 !important;


    white-space:nowrap !important;


    box-shadow:

    0
    5px
    18px
    rgba(
        105,
        69,
        216,
        .27
    )
    !important;


    cursor:pointer !important;


    touch-action:
    manipulation !important;


    -webkit-tap-highlight-color:
    transparent !important;

}


/* OLD ICON */

#zyperWalletBadge
.zyper-badge-icon{

    width:17px;

    height:17px;

    display:flex;

    align-items:center;

    justify-content:center;

    flex-shrink:0;

}


#zyperWalletBadge
.zyper-badge-icon i{

    color:#ffffff;

    font-size:15px;

    line-height:1;

}


/* TEXT */

#zyperWalletBadge
.zyper-badge-text{

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}


/* PRESS */

#zyperWalletBadge:active{

    transform:
    scale(.96);

}


/* PHONE */

@media(max-width:480px){

    #zyperWalletBadge{

        height:34px !important;

        min-width:96px !important;

        max-width:135px !important;

        padding:
        0 10px !important;

        gap:6px !important;

        font-size:10px !important;

        border-radius:
        17px !important;

    }


    #zyperWalletBadge
    .zyper-badge-icon{

        width:15px;

        height:15px;

    }


    #zyperWalletBadge
    .zyper-badge-icon i{

        font-size:14px;

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

function createBadge(){

    const old =
        document.getElementById(
            BADGE_ID
        );


    if(old){

        badge =
            old;

    }
    else{

        badge =
            document.createElement(
                "a"
            );


        badge.id =
            BADGE_ID;

    }


    const target =

        document.getElementById(
            "zyperTopbarAction"
        )

        ||

        document.body;


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
   LOGIN
===================================================== */

function showLogin(){

    createBadge();


    badge.href =
        "./index.html";


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
   WALLET
===================================================== */

function showWallet(
    text
){

    createBadge();


    badge.href =
        "./wallet.html";


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
   MONEY FORMAT
===================================================== */

function money(
    value
){

    const amount =
        Number(
            value || 0
        );


    if(
        !Number.isFinite(
            amount
        )
    ){

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


        const result =
            await response.json();


        if(
            !response.ok
            ||
            !result
            ||
            result.success === false
        ){

            throw new Error(
                result?.message ||
                "Wallet unavailable"
            );

        }


        const balance =

            result.wallet
            ?.availableBalance

            ??

            result.wallet
            ?.balance

            ??

            0;


        showWallet(
            money(
                balance
            )
        );

    }
    catch(error){


        console.error(
            "Wallet badge:",
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

function start(){

    addStyle();

    createBadge();


    onAuthStateChanged(

        auth,

        async function(user){


            window.zyperCurrentUser =
                user || null;


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



/* =====================================================
   START
===================================================== */

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
