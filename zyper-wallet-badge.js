/* =====================================================
   ZYPER DIAMOND STORE
   MINI WALLET BALANCE BADGE
===================================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* =====================================================
   CLOUDFLARE WORKER
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


/* =====================================================
   MONEY FORMAT
===================================================== */

function formatMoney(amount) {

    const value =
        Number(amount || 0);

    return value.toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* =====================================================
   CREATE MINI WALLET BADGE
===================================================== */

function createWalletBadge() {

    /*
     * Remove old badge if one already exists
     */

    const oldBadge =
        document.getElementById(
            "zyperWalletBadge"
        );

    if (oldBadge) {

        oldBadge.remove();

    }


    /*
     * Create wallet link
     */

    const badge =
        document.createElement("a");


    badge.id =
        "zyperWalletBadge";


    badge.href =
        "./wallet.html";


    badge.setAttribute(
        "aria-label",
        "Open Wallet"
    );


    /* =================================================
       FORCE SMALL SIZE
    ================================================= */

    badge.style.cssText = `

        position: fixed !important;

        top: 7px !important;

        right: 7px !important;

        left: auto !important;

        bottom: auto !important;


        width: auto !important;

        min-width: 0 !important;

        max-width: max-content !important;


        height: 20px !important;

        min-height: 20px !important;

        max-height: 20px !important;


        padding: 0 6px !important;

        margin: 0 !important;


        display: inline-flex !important;

        flex-direction: row !important;

        align-items: center !important;

        justify-content: center !important;


        gap: 3px !important;


        border-radius: 999px !important;


        border:

            1px solid
            rgba(255,255,255,.18)

            !important;


        background:

            linear-gradient(
                135deg,
                #a855c7,
                #8434a8
            )

            !important;


        box-shadow:

            0 2px 5px
            rgba(0,0,0,.20)

            !important;


        color: white !important;


        text-decoration: none !important;


        font-family:

            Arial,
            sans-serif

            !important;


        font-size: 7px !important;

        font-weight: 700 !important;

        line-height: 1 !important;


        box-sizing:
            border-box !important;


        overflow:
            hidden !important;


        white-space:
            nowrap !important;


        cursor:
            pointer !important;


        z-index:
            2147483647 !important;


        -webkit-tap-highlight-color:
            transparent !important;

    `;


    /* =================================================
       BADGE HTML
    ================================================= */

    badge.innerHTML = `

        <span
            id="zyperWalletMiniIcon">

            👛

        </span>


        <span
            id="zyperWalletBalance">

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
            "zyperWalletMiniIcon"
        );


    if (icon) {

        icon.style.cssText = `

            display: inline-block !important;


            width: auto !important;

            min-width: 0 !important;

            max-width: none !important;


            height: auto !important;

            min-height: 0 !important;

            max-height: none !important;


            padding: 0 !important;

            margin: 0 !important;


            border: none !important;

            border-radius: 0 !important;


            background:
                transparent !important;


            box-shadow:
                none !important;


            font-size:
                8px !important;


            font-weight:
                normal !important;


            line-height:
                1 !important;


            transform:
                none !important;


            box-sizing:
                border-box !important;

        `;

    }


    /* =================================================
       FORCE BALANCE SIZE
    ================================================= */

    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    if (balance) {

        balance.style.cssText = `

            display: inline-block !important;


            width: auto !important;

            min-width: 0 !important;

            max-width: none !important;


            height: auto !important;

            min-height: 0 !important;

            max-height: none !important;


            padding: 0 !important;

            margin: 0 !important;


            color:
                #ffffff !important;


            background:
                transparent !important;


            border:
                none !important;


            box-shadow:
                none !important;


            font-family:

                Arial,
                sans-serif

                !important;


            font-size:
                7px !important;


            font-weight:
                700 !important;


            line-height:
                1 !important;


            letter-spacing:
                0 !important;


            white-space:
                nowrap !important;


            box-sizing:
                border-box !important;

        `;

    }


    return badge;
}


/* =====================================================
   LOAD CUSTOMER WALLET BALANCE
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

        /* =============================================
           FIREBASE ID TOKEN
        ============================================= */

        const token =
            await user.getIdToken();


        /* =============================================
           GET WALLET FROM WORKER
        ============================================= */

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


        const data =
            await response.json();


        /* =============================================
           CHECK RESPONSE
        ============================================= */

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||

                "Unable to load wallet balance."

            );

        }


        /* =============================================
           BALANCE
        ============================================= */

        const walletBalance =
            Number(
                data.wallet?.balance ||
                0
            );


        balanceElement.textContent =

            formatMoney(
                walletBalance
            )

            +

            " LKR";


    } catch (error) {

        console.error(
            "Wallet balance error:",
            error
        );


        balanceElement.textContent =
            "0.00 LKR";

    }

}


/* =====================================================
   START WALLET BADGE
===================================================== */

function startWalletBadge() {

    const badge =
        createWalletBadge();


    onAuthStateChanged(
        auth,
        async function(user) {


            /* =========================================
               USER NOT LOGGED IN
            ========================================= */

            if (!user) {

                badge.style.setProperty(
                    "display",
                    "none",
                    "important"
                );

                return;

            }


            /* =========================================
               USER LOGGED IN
            ========================================= */

            badge.style.setProperty(
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
   START
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
