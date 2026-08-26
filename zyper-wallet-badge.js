import { auth }
from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
"https://zyper-order.ameresh20112011.workers.dev";


/* =====================================================
   GLOBAL WALLET SIZE
   CHANGE ONLY THESE VALUES
===================================================== */

const WALLET_SIZE = {

    mobile: {
        height: 34,
        paddingX: 10,
        icon: 18,
        font: 11,
        gap: 7,
        top: 10,
        right: 10
    },

    desktop: {
        height: 38,
        paddingX: 12,
        icon: 18,
        font: 12,
        gap: 7,
        top: 12,
        right: 12
    }

};


/* =====================================================
   MONEY
===================================================== */

function formatMoney(amount){

    return Number(
        amount || 0
    ).toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =====================================================
   REMOVE EVERY OLD WALLET BADGE
===================================================== */

function removeOldWalletBadges(){

    document
    .querySelectorAll(
        `
        #zyperWalletBadge,
        .zyper-wallet-badge,
        .wallet-page-balance
        `
    )
    .forEach(
        function(element){

            element.remove();

        }
    );

}


/* =====================================================
   CREATE ONE GLOBAL WALLET BADGE
===================================================== */

function createWalletBadge(){

    removeOldWalletBadges();


    const badge =
    document.createElement(
        "a"
    );


    badge.id =
    "zyperWalletBadge";


    badge.className =
    "zyper-wallet-badge";


    badge.href =
    "./wallet.html";


    badge.innerHTML = `

        <svg
            id="zyperWalletBadgeIcon"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <path
                d="M6 9.5H24.5C26.4 9.5 28 11.1 28 13V24C28 25.9 26.4 27.5 24.5 27.5H7.5C5.6 27.5 4 25.9 4 24V10.5C4 8.6 5.4 7.1 7.2 6.7L21.5 3.5C22.5 3.3 23.5 4 23.7 5L24.6 9.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

        </svg>

        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    document.body.appendChild(
        badge
    );


    applyWalletStyle();


    return badge;

}


/* =====================================================
   ONE STYLE FOR EVERY PAGE
===================================================== */

function applyWalletStyle(){

    const badge =
    document.getElementById(
        "zyperWalletBadge"
    );


    const icon =
    document.getElementById(
        "zyperWalletBadgeIcon"
    );


    const balance =
    document.getElementById(
        "zyperWalletBalance"
    );


    if(
        !badge ||
        !icon ||
        !balance
    ){
        return;
    }


    const isMobile =
    window.innerWidth <= 500;


    const size =
    isMobile
    ? WALLET_SIZE.mobile
    : WALLET_SIZE.desktop;


    /* BADGE */

    badge.style.cssText = `

        position:fixed !important;

        top:${size.top}px !important;

        right:${size.right}px !important;

        left:auto !important;

        bottom:auto !important;

        width:auto !important;

        min-width:0 !important;

        max-width:none !important;

        height:${size.height}px !important;

        min-height:${size.height}px !important;

        max-height:${size.height}px !important;

        padding:0 ${size.paddingX}px !important;

        margin:0 !important;

        display:inline-flex !important;

        align-items:center !important;

        justify-content:center !important;

        gap:${size.gap}px !important;

        box-sizing:border-box !important;

        border-radius:999px !important;

        border:1px solid rgba(255,255,255,.14) !important;

        background:
        linear-gradient(
            135deg,
            #a64fc4,
            #8f37ae
        ) !important;

        color:#ffffff !important;

        text-decoration:none !important;

        white-space:nowrap !important;

        font-family:
        Arial,
        sans-serif !important;

        box-shadow:
        0 4px 14px
        rgba(115,45,145,.28) !important;

        z-index:2147483647 !important;

        -webkit-tap-highlight-color:
        transparent !important;

    `;


    /* ICON */

    icon.style.cssText = `

        width:${size.icon}px !important;

        height:${size.icon}px !important;

        min-width:${size.icon}px !important;

        max-width:${size.icon}px !important;

        min-height:${size.icon}px !important;

        max-height:${size.icon}px !important;

        flex:0 0 ${size.icon}px !important;

        display:block !important;

        margin:0 !important;

        padding:0 !important;

    `;


    /* BALANCE */

    balance.style.cssText = `

        display:block !important;

        margin:0 !important;

        padding:0 !important;

        font-size:${size.font}px !important;

        font-weight:600 !important;

        line-height:1 !important;

        color:#ffffff !important;

        white-space:nowrap !important;

        font-family:
        Arial,
        sans-serif !important;

    `;

}


/* =====================================================
   LOAD LIVE WALLET BALANCE
===================================================== */

async function loadWalletBalance(user){

    const balanceElement =
    document.getElementById(
        "zyperWalletBalance"
    );


    if(!balanceElement){
        return;
    }


    balanceElement.textContent =
    "... LKR";


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
            !response.ok ||
            !result.success
        ){

            throw new Error(
                result.message ||
                "Unable to load wallet."
            );

        }


        const amount =
        Number(
            result.wallet?.balance ||
            0
        );


        balanceElement.textContent =
        formatMoney(amount)
        +
        " LKR";


        applyWalletStyle();

    }
    catch(error){

        console.error(
            "Wallet Badge Error:",
            error
        );


        balanceElement.textContent =
        "0.00 LKR";


        applyWalletStyle();

    }

}


/* =====================================================
   START
===================================================== */

function startWalletBadge(){

    const badge =
    createWalletBadge();


    onAuthStateChanged(
        auth,
        async function(user){

            if(!user){

                badge.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

                return;

            }


            badge.style.setProperty(
                "display",
                "inline-flex",
                "important"
            );


            applyWalletStyle();


            await loadWalletBalance(
                user
            );

        }
    );

}


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    applyWalletStyle
);


/* =====================================================
   INIT
===================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        startWalletBadge
    );

}
else{

    startWalletBadge();

}
