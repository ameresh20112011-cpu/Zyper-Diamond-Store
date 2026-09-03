/* =========================================================
   ZYPER LOGIN / LIVE WALLET BADGE

   GUEST:
   LOGIN

   LOGGED IN:
   LIVE WALLET BALANCE
========================================================= */

import {
    auth
}
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


let badge =
null;


/* =====================================================
   STYLE
===================================================== */

function addStyle(){

    if(
        document.getElementById(
            "zyperWalletBadgeStyle"
        )
    ){

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zyperWalletBadgeStyle";


    style.textContent = `

#zyperWalletBadge{

    height:42px;

    min-width:110px;

    max-width:180px;

    padding:0 15px;

    display:inline-flex;

    align-items:center;

    justify-content:center;

    gap:8px;

    border-radius:24px;

    color:#ffffff;

    text-decoration:none;

    font-family:
    "Poppins",
    Arial,
    sans-serif;

    font-size:13px;

    font-weight:700;

    white-space:nowrap;

    background:

    linear-gradient(
        135deg,
        #2876ff,
        #7c3aed
    );

    border:

    1px solid
    rgba(
        255,
        255,
        255,
        .15
    );

    box-shadow:

    0 8px 22px
    rgba(
        79,
        70,
        229,
        .25
    );

    cursor:pointer;

    pointer-events:auto;

    touch-action:manipulation;

    -webkit-tap-highlight-color:
    transparent;

}


#zyperWalletBadge:active{

    transform:
    scale(.96);

}


.zyper-wallet-badge-icon{

    font-size:18px;

}


.zyper-wallet-badge-text{

    overflow:hidden;

    text-overflow:ellipsis;

}


@media(max-width:480px){

    #zyperWalletBadge{

        height:38px;

        min-width:100px;

        max-width:145px;

        padding:0 12px;

        font-size:12px;

        border-radius:21px;

    }


    .zyper-wallet-badge-icon{

        font-size:16px;

    }

}


@media(max-width:360px){

    #zyperWalletBadge{

        min-width:88px;

        max-width:125px;

        padding:0 9px;

        font-size:10px;

    }

}

    `;


    document.head.appendChild(
        style
    );

}


/* =====================================================
   TARGET
===================================================== */

function getTarget(){

    return (
        document.getElementById(
            "zyperTopbarAction"
        )
        ||
        document.body
    );

}


/* =====================================================
   CREATE
===================================================== */

function createBadge(){

    const existing =
        document.getElementById(
            BADGE_ID
        );


    if(existing){

        badge =
            existing;

        return;

    }


    badge =
        document.createElement(
            "a"
        );


    badge.id =
        BADGE_ID;


    getTarget()
    .appendChild(
        badge
    );

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
            class="zyper-wallet-badge-icon"
        >
            ⇥
        </span>

        <span
            class="zyper-wallet-badge-text"
        >
            LOGIN
        </span>

    `;

}


/* =====================================================
   WALLET
===================================================== */

function showWallet(
    balance
){

    createBadge();


    badge.href =
        "./wallet.html";


    badge.innerHTML = `

        <span
            class="zyper-wallet-badge-icon"
        >
            💰
        </span>

        <span
            class="zyper-wallet-badge-text"
        >
            ${balance}
        </span>

    `;

}


/* =====================================================
   MONEY
===================================================== */

function money(
    value
){

    const number =
        Number(
            value || 0
        );


    return (

        number.toLocaleString(
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
            await user.getIdToken(
                true
            );


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
