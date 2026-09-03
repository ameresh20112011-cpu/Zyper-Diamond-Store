import { auth }
from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* =====================================================
   ZYPER SHARED ACCOUNT / WALLET CONTROL
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


let currentUser = null;


/* =====================================================
   LOAD FONT
===================================================== */

function loadWalletFont(){

    if(
        document.getElementById(
            "zyperWalletFont"
        )
    ){
        return;
    }


    const link =
        document.createElement(
            "link"
        );


    link.id =
        "zyperWalletFont";


    link.rel =
        "stylesheet";


    link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap";


    document.head.appendChild(
        link
    );

}


loadWalletFont();


/* =====================================================
   SETTINGS
===================================================== */

const WALLET_STYLE = {

    mobile: {

        height:35,

        paddingX:11,

        icon:17,

        font:11,

        gap:6,

        top:10,

        right:10

    },


    desktop: {

        height:40,

        paddingX:14,

        icon:18,

        font:12,

        gap:7,

        top:14,

        right:14

    }

};


/* =====================================================
   MONEY FORMAT
===================================================== */

function formatMoney(amount){

    const number =
        Number(
            amount || 0
        );


    return number.toLocaleString(
        "en-LK",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


/* =====================================================
   REMOVE OLD PAGE WALLET CONTROLS
===================================================== */

function removeLegacyWalletUI(){

    document
        .querySelectorAll(
            [
                ".wallet-page-balance",
                ".wallet-page-balance-box",
                ".top-wallet-button"
            ].join(",")
        )
        .forEach(
            function(element){

                element.remove();

            }
        );

}


/* =====================================================
   REMOVE OLD SHARED BADGE
===================================================== */

function removeOldBadge(){

    const oldBadge =
        document.getElementById(
            "zyperWalletBadge"
        );


    if(oldBadge){

        oldBadge.remove();

    }

}


/* =====================================================
   CREATE SHARED CONTROL
===================================================== */

function createBadge(){

    removeOldBadge();


    const badge =
        document.createElement(
            "a"
        );


    badge.id =
        "zyperWalletBadge";


    badge.className =
        "zyper-wallet-badge";


    badge.href =
        "./index.html";


    badge.setAttribute(
        "aria-label",
        "Login to Zyper"
    );


    document.body.appendChild(
        badge
    );


    return badge;

}


/* =====================================================
   WALLET ICON
===================================================== */

function walletIcon(){

    return `

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

    `;

}


/* =====================================================
   LOGIN ICON
===================================================== */

function loginIcon(){

    return `

        <svg
            id="zyperWalletBadgeIcon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <path
                d="M10 17L15 12L10 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M15 12H3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />

            <path
                d="M14 4H19C20.1 4 21 4.9 21 6V18C21 19.1 20.1 20 19 20H14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />

        </svg>

    `;

}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin(){

    const badge =
        document.getElementById(
            "zyperWalletBadge"
        );


    if(!badge){
        return;
    }


    badge.href =
        "./index.html";


    badge.setAttribute(
        "aria-label",
        "Login to Zyper"
    );


    badge.dataset.mode =
        "login";


    badge.innerHTML = `

        ${loginIcon()}

        <span id="zyperWalletBalance">
            LOGIN
        </span>

    `;


    applyWalletStyle();

}


/* =====================================================
   SHOW WALLET
===================================================== */

function showWallet(text){

    const badge =
        document.getElementById(
            "zyperWalletBadge"
        );


    if(!badge){
        return;
    }


    badge.href =
        "./wallet.html";


    badge.setAttribute(
        "aria-label",
        "Open Zyper Wallet"
    );


    badge.dataset.mode =
        "wallet";


    badge.innerHTML = `

        ${walletIcon()}

        <span id="zyperWalletBalance">
            ${text}
        </span>

    `;


    applyWalletStyle();

}


/* =====================================================
   APPLY SAME STYLE EVERY PAGE
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


    const text =
        document.getElementById(
            "zyperWalletBalance"
        );


    if(
        !badge ||
        !icon ||
        !text
    ){
        return;
    }


    const isMobile =
        window.innerWidth <= 500;


    const style =
        isMobile
        ?
        WALLET_STYLE.mobile
        :
        WALLET_STYLE.desktop;


    /* BADGE */

    badge.style.setProperty(
        "position",
        "fixed",
        "important"
    );


    badge.style.setProperty(
        "top",
        `${style.top}px`,
        "important"
    );


    badge.style.setProperty(
        "right",
        `${style.right}px`,
        "important"
    );


    badge.style.setProperty(
        "left",
        "auto",
        "important"
    );


    badge.style.setProperty(
        "bottom",
        "auto",
        "important"
    );


    badge.style.setProperty(
        "height",
        `${style.height}px`,
        "important"
    );


    badge.style.setProperty(
        "min-height",
        `${style.height}px`,
        "important"
    );


    badge.style.setProperty(
        "width",
        "auto",
        "important"
    );


    badge.style.setProperty(
        "padding",
        `0 ${style.paddingX}px`,
        "important"
    );


    badge.style.setProperty(
        "margin",
        "0",
        "important"
    );


    badge.style.setProperty(
        "display",
        "inline-flex",
        "important"
    );


    badge.style.setProperty(
        "align-items",
        "center",
        "important"
    );


    badge.style.setProperty(
        "justify-content",
        "center",
        "important"
    );


    badge.style.setProperty(
        "gap",
        `${style.gap}px`,
        "important"
    );


    badge.style.setProperty(
        "border-radius",
        "999px",
        "important"
    );


    badge.style.setProperty(
        "border",
        "1px solid rgba(129,140,248,.32)",
        "important"
    );


    badge.style.setProperty(
        "background",
        "linear-gradient(135deg,#2563eb,#7c3aed)",
        "important"
    );


    badge.style.setProperty(
        "color",
        "#ffffff",
        "important"
    );


    badge.style.setProperty(
        "text-decoration",
        "none",
        "important"
    );


    badge.style.setProperty(
        "white-space",
        "nowrap",
        "important"
    );


    badge.style.setProperty(
        "box-shadow",
        "0 8px 24px rgba(79,70,229,.28)",
        "important"
    );


    badge.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );


    badge.style.setProperty(
        "z-index",
        "2147483647",
        "important"
    );


    badge.style.setProperty(
        "-webkit-tap-highlight-color",
        "transparent",
        "important"
    );


    badge.style.setProperty(
        "transition",
        "transform .18s ease, box-shadow .18s ease",
        "important"
    );


    /* ICON */

    icon.style.setProperty(
        "width",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "height",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "min-width",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "flex",
        `0 0 ${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "display",
        "block",
        "important"
    );


    icon.style.setProperty(
        "color",
        "#ffffff",
        "important"
    );


    /* TEXT */

    text.style.setProperty(
        "font-family",
        '"Poppins",sans-serif',
        "important"
    );


    text.style.setProperty(
        "font-size",
        `${style.font}px`,
        "important"
    );


    text.style.setProperty(
        "font-weight",
        "600",
        "important"
    );


    text.style.setProperty(
        "line-height",
        "1",
        "important"
    );


    text.style.setProperty(
        "color",
        "#ffffff",
        "important"
    );


    text.style.setProperty(
        "margin",
        "0",
        "important"
    );


    text.style.setProperty(
        "padding",
        "0",
        "important"
    );


    text.style.setProperty(
        "white-space",
        "nowrap",
        "important"
    );

}


/* =====================================================
   LOAD LIVE WALLET
===================================================== */

async function loadWalletBalance(user){

    showWallet(
        "... LKR"
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
                        JSON.stringify(
                            {
                                action:
                                    "wallet_balance"
                            }
                        )

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

                result.wallet?.availableBalance
                ??
                result.wallet?.balance
                ??
                0

            );


        showWallet(

            formatMoney(
                amount
            ) +

            " LKR"

        );

    }
    catch(error){

        console.error(
            "Wallet Badge Error:",
            error
        );


        showWallet(
            "WALLET"
        );

    }

}


/* =====================================================
   START
===================================================== */

function startWalletBadge(){

    removeLegacyWalletUI();


    createBadge();


    onAuthStateChanged(
        auth,
        async function(user){

            currentUser =
                user || null;


            if(!user){

                showLogin();

                return;

            }


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
    function(){

        applyWalletStyle();

    }
);


/* =====================================================
   START AFTER HTML READY
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
