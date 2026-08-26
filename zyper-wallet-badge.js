/* =====================================================
   ZYPER DIAMOND STORE
   WALLET BALANCE BADGE
===================================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* =====================================================
   SETTINGS
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


/*
   CHANGE ONLY THESE IF YOU WANT SIZE DIFFERENT
*/

const BADGE_HEIGHT = 30;

const BADGE_FONT_SIZE = 10;

const ICON_SIZE = 13;



/* =====================================================
   MONEY FORMAT
===================================================== */

function formatMoney(amount) {

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
   REMOVE OLD / DUPLICATE BADGES
===================================================== */

function removeOldBadges() {

    document
        .querySelectorAll(
            "#zyperWalletBadge, .zyper-wallet-badge"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );

}



/* =====================================================
   CREATE BADGE
===================================================== */

function createWalletBadge() {

    removeOldBadges();


    const badge =
        document.createElement(
            "a"
        );


    badge.id =
        "zyperWalletBadge";


    badge.href =
        "./wallet.html";


    badge.setAttribute(
        "aria-label",
        "Open Wallet"
    );


    /*
       INLINE STYLE
       This overrides other CSS.
    */

    badge.style.cssText = `

        position: fixed !important;

        top: 10px !important;

        right: 10px !important;

        left: auto !important;

        bottom: auto !important;


        width: auto !important;

        min-width: 0 !important;

        max-width: fit-content !important;


        height: ${BADGE_HEIGHT}px !important;

        min-height: ${BADGE_HEIGHT}px !important;

        max-height: ${BADGE_HEIGHT}px !important;


        padding: 0 10px !important;

        margin: 0 !important;


        display: inline-flex !important;

        flex-direction: row !important;

        align-items: center !important;

        justify-content: center !important;


        gap: 5px !important;


        border-radius: 999px !important;


        border:
            1px solid
            rgba(255,255,255,.18)
            !important;


        background:
            linear-gradient(
                135deg,
                #a855c7,
                #8b3daf
            )
            !important;


        box-shadow:
            0 4px 12px
            rgba(0,0,0,.22)
            !important;


        color: #ffffff !important;


        text-decoration: none !important;


        font-family:
            Arial,
            sans-serif
            !important;


        font-size:
            ${BADGE_FONT_SIZE}px
            !important;


        font-weight:
            700 !important;


        line-height:
            1 !important;


        white-space:
            nowrap !important;


        box-sizing:
            border-box !important;


        overflow:
            hidden !important;


        z-index:
            2147483647 !important;


        cursor:
            pointer !important;


        -webkit-tap-highlight-color:
            transparent !important;

    `;


    badge.innerHTML = `

        <span
            id="zyperWalletBadgeIcon"
        >
            👛
        </span>


        <span
            id="zyperWalletBalance"
        >
            ... LKR
        </span>

    `;


    document.body.appendChild(
        badge
    );


    /* =================================================
       FORCE ICON SIZE
    ================================================= */

    const icon =
        document.getElementById(
            "zyperWalletBadgeIcon"
        );


    icon.style.cssText = `

        display: inline-flex !important;

        align-items: center !important;

        justify-content: center !important;


        width: auto !important;

        height: auto !important;


        min-width: 0 !important;

        min-height: 0 !important;


        padding: 0 !important;

        margin: 0 !important;


        background: transparent !important;

        border: none !important;

        box-shadow: none !important;


        font-size:
            ${ICON_SIZE}px
            !important;


        line-height:
            1 !important;


        flex:
            none !important;

    `;



    /* =================================================
       FORCE BALANCE SIZE
    ================================================= */

    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    balance.style.cssText = `

        display: inline-block !important;


        width: auto !important;

        min-width: 0 !important;


        height: auto !important;


        padding: 0 !important;

        margin: 0 !important;


        color: #ffffff !important;


        background:
            transparent !important;


        border:
            none !important;


        font-size:
            ${BADGE_FONT_SIZE}px
            !important;


        font-weight:
            700 !important;


        line-height:
            1 !important;


        letter-spacing:
            0 !important;


        white-space:
            nowrap !important;

    `;


    return badge;

}



/* =====================================================
   LOAD WALLET BALANCE
===================================================== */

async function loadWalletBalance(user) {

    const balanceElement =
        document.getElementById(
            "zyperWalletBalance"
        );


    if (!balanceElement) {

        return;

    }


    balanceElement.textContent =
        "... LKR";


    try {

        const token =
            await user.getIdToken();


        const response =
            await fetch(
                WORKER_URL,
                {

                    method:
                        "POST",


                    headers: {

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


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load wallet."
            );

        }


        const balance =
            Number(
                result.wallet?.balance ||
                0
            );


        balanceElement.textContent =

            formatMoney(
                balance
            )

            +

            " LKR";


    } catch(error) {

        console.error(
            "Wallet Badge Error:",
            error
        );


        balanceElement.textContent =
            "0.00 LKR";

    }

}



/* =====================================================
   START
===================================================== */

function startWalletBadge() {

    const badge =
        createWalletBadge();


    onAuthStateChanged(
        auth,
        async function(user) {


            if (!user) {

                badge.style
                    .setProperty(
                        "display",
                        "none",
                        "important"
                    );

                return;

            }


            badge.style
                .setProperty(
                    "display",
                    "inline-flex",
                    "important"
                );


            await loadWalletBalance(
                user
            );

        }
    );

}



/* =====================================================
   START AFTER PAGE LOAD
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startWalletBadge
    );

} else {

    startWalletBadge();

}

