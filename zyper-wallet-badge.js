/* =====================================================
   ZYPER DIAMOND STORE
   MEDIUM WALLET BALANCE BADGE
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
   CREATE WALLET BADGE
===================================================== */

function createWalletBadge() {

    const oldBadge =
        document.getElementById(
            "zyperWalletBadge"
        );


    if (oldBadge) {

        oldBadge.remove();

    }


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
       MEDIUM SIZE
    ================================================= */

    badge.style.cssText = `

        position: fixed !important;

        top: 9px !important;

        right: 9px !important;

        left: auto !important;

        bottom: auto !important;


        width: auto !important;

        min-width: 0 !important;

        max-width: max-content !important;


        height: 32px !important;

        min-height: 32px !important;

        max-height: 32px !important;


        padding: 0 11px !important;

        margin: 0 !important;


        display: inline-flex !important;

        flex-direction: row !important;

        align-items: center !important;

        justify-content: center !important;


        gap: 6px !important;


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

            0 4px 12px
            rgba(108,45,145,.28)

            !important;


        color: white !important;


        text-decoration: none !important;


        font-family:

            Arial,
            sans-serif

            !important;


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


        transition:

            transform .2s ease,
            box-shadow .2s ease

            !important;


        -webkit-tap-highlight-color:
            transparent !important;

    `;


    /* =================================================
       CONTENT
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
       ICON SIZE
    ================================================= */

    const icon =
        document.getElementById(
            "zyperWalletMiniIcon"
        );


    if (icon) {

        icon.style.cssText = `

            display:
                inline-flex !important;

            align-items:
                center !important;

            justify-content:
                center !important;


            width:
                auto !important;

            min-width:
                0 !important;


            height:
                auto !important;

            min-height:
                0 !important;


            margin:
                0 !important;

            padding:
                0 !important;


            background:
                transparent !important;


            border:
                none !important;


            box-shadow:
                none !important;


            font-size:
                14px !important;


            line-height:
                1 !important;


            flex:
                none !important;

        `;

    }


    /* =================================================
       BALANCE TEXT SIZE
    ================================================= */

    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    if (balance) {

        balance.style.cssText = `

            display:
                inline-block !important;


            width:
                auto !important;

            min-width:
                0 !important;


            height:
                auto !important;


            margin:
                0 !important;

            padding:
                0 !important;


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
                11px !important;


            font-weight:
                700 !important;


            line-height:
                1 !important;


            letter-spacing:
                .1px !important;


            white-space:
                nowrap !important;

        `;

    }


    /* =================================================
       HOVER
    ================================================= */

    badge.addEventListener(
        "mouseenter",
        function () {

            badge.style.transform =
                "translateY(-1px)";

            badge.style.boxShadow =
                "0 6px 16px rgba(108,45,145,.34)";

        }
    );


    badge.addEventListener(
        "mouseleave",
        function () {

            badge.style.transform =
                "none";

            badge.style.boxShadow =
                "0 4px 12px rgba(108,45,145,.28)";

        }
    );


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


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||

                "Unable to load wallet balance."

            );

        }


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


            if (!user) {

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
