/* =====================================================
   ZYPER DIAMOND STORE
   COMPACT WALLET BALANCE BADGE
===================================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


/* =====================================================
   FORMAT MONEY
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
   REMOVE OLD BADGE
===================================================== */

function removeOldBadge() {

    document
        .querySelectorAll(
            "#zyperWalletBadge, .zyper-wallet-badge"
        )
        .forEach(
            function (item) {

                item.remove();

            }
        );

}


/* =====================================================
   CREATE BADGE
===================================================== */

function createBadge() {

    removeOldBadge();


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
       REAL SVG WALLET ICON
       NO FONT AWESOME
    ================================================= */

    badge.innerHTML = `

        <svg
            id="zyperWalletIcon"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >

            <path
                d="
                M6 9.5
                H24.5
                C26.4 9.5 28 11.1 28 13
                V24
                C28 25.9 26.4 27.5 24.5 27.5
                H7.5
                C5.6 27.5 4 25.9 4 24
                V10.5
                C4 8.6 5.4 7.1 7.2 6.7
                L21.5 3.5
                C22.5 3.3 23.5 4 23.7 5
                L24.6 9.5
                "
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="
                M4.5 10
                H24
                "
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />

        </svg>


        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    /* =================================================
       BADGE STYLE
    ================================================= */

    badge.style.cssText = `

        position: fixed !important;

        top: 12px !important;

        right: 12px !important;

        z-index: 2147483647 !important;


        width: fit-content !important;

        min-width: 0 !important;

        max-width: none !important;


        height: 42px !important;

        min-height: 42px !important;

        max-height: 42px !important;


        padding: 0 12px !important;

        margin: 0 !important;


        display: inline-flex !important;

        align-items: center !important;

        justify-content: center !important;

        flex-direction: row !important;


        gap: 7px !important;


        border-radius: 999px !important;


        background:
            linear-gradient(
                135deg,
                #ad4fca,
                #973db7
            )
            !important;


        border:
            none !important;


        box-shadow:
            0 4px 12px
            rgba(125, 48, 160, .28)
            !important;


        color: white !important;


        text-decoration: none !important;


        font-family:
            "Poppins",
            Arial,
            sans-serif
            !important;


        box-sizing: border-box !important;


        white-space: nowrap !important;


        overflow: visible !important;


        -webkit-tap-highlight-color:
            transparent !important;

    `;


    document.body.appendChild(
        badge
    );


    /* =================================================
       SVG ICON STYLE
    ================================================= */

    const icon =
        document.getElementById(
            "zyperWalletIcon"
        );


    icon.style.cssText = `

        width: 22px !important;

        height: 22px !important;

        min-width: 22px !important;

        max-width: 22px !important;

        flex: 0 0 22px !important;

        display: block !important;

        padding: 0 !important;

        margin: 0 !important;

        color: #ffffff !important;

        overflow: visible !important;

    `;


    /* =================================================
       BALANCE STYLE
    ================================================= */

    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    balance.style.cssText = `

        display: inline-block !important;

        width: auto !important;

        min-width: 0 !important;


        margin: 0 !important;

        padding: 0 !important;


        color: #ffffff !important;


        font-family:
            "Poppins",
            Arial,
            sans-serif
            !important;


        font-size: 14px !important;

        font-weight: 500 !important;

        line-height: 1 !important;


        letter-spacing: 0 !important;


        white-space: nowrap !important;

    `;


    return badge;

}


/* =====================================================
   LOAD BALANCE
===================================================== */

async function loadBalance(user) {

    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    if (!balance) {

        return;

    }


    balance.textContent =
        "... LKR";


    try {

        const token =
            await user.getIdToken();


        const response =
            await fetch(
                WORKER_URL,
                {

                    method: "POST",

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
                "Wallet unavailable."
            );

        }


        const amount =
            Number(
                result.wallet?.balance ||
                0
            );


        balance.textContent =

            formatMoney(
                amount
            )

            +

            " LKR";


    } catch (error) {

        console.error(
            "Wallet Badge Error:",
            error
        );


        balance.textContent =
            "0.00 LKR";

    }

}


/* =====================================================
   START
===================================================== */

function start() {

    const badge =
        createBadge();


    onAuthStateChanged(
        auth,
        async function (user) {

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


            await loadBalance(
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
        start
    );

} else {

    start();

}
