/* =====================================================
   ZYPER WALLET BALANCE BADGE
===================================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


function formatMoney(amount) {

    return Number(amount || 0).toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =====================================================
   CREATE BADGE
===================================================== */

function createBadge() {

    const old =
        document.getElementById(
            "zyperWalletBadge"
        );

    if (old) {
        old.remove();
    }


    const badge =
        document.createElement("a");


    badge.id =
        "zyperWalletBadge";

    badge.href =
        "wallet.html";


    /*
       Screenshot-style outline wallet icon.
       No emoji.
    */

    badge.innerHTML = `

        <svg
            id="zyperWalletIcon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

            <path
                d="M4 7.5H19C20.1 7.5 21 8.4 21 9.5V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V7C3 5.9 3.9 5 5 5H17"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M5 5L16.5 2.5V7.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

        </svg>


        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    badge.style.cssText = `

        position: fixed !important;

        top: 12px !important;
        right: 12px !important;

        z-index: 2147483647 !important;


        width: auto !important;
        min-width: 0 !important;

        height: 42px !important;

        padding: 0 14px !important;


        display: inline-flex !important;

        align-items: center !important;

        justify-content: center !important;

        gap: 8px !important;


        border-radius: 999px !important;


        background:
        linear-gradient(
            135deg,
            #a64fc4,
            #963db5
        ) !important;


        border: none !important;


        box-shadow:
        0 5px 14px
        rgba(115,45,145,.25) !important;


        color: #ffffff !important;


        text-decoration: none !important;


        font-family:
        "Poppins",
        Arial,
        sans-serif !important;


        box-sizing:
        border-box !important;


        white-space:
        nowrap !important;

    `;


    document.body.appendChild(
        badge
    );


    const icon =
        document.getElementById(
            "zyperWalletIcon"
        );


    icon.style.cssText = `

        width: 23px !important;

        height: 23px !important;

        min-width: 23px !important;

        display: block !important;

        color: white !important;

    `;


    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    balance.style.cssText = `

        margin: 0 !important;

        padding: 0 !important;

        font-size: 14px !important;

        font-weight: 500 !important;

        line-height: 1 !important;

        color: white !important;

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
                "Wallet unavailable"
            );

        }


        const amount =
            Number(
                result.wallet?.balance ||
                0
            );


        balance.textContent =
            formatMoney(amount)
            +
            " LKR";


    }

    catch(error) {

        console.error(
            "Wallet Badge:",
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
        async function(user) {

            if (!user) {

                badge.style.display =
                    "none";

                return;

            }


            badge.style.display =
                "inline-flex";


            await loadBalance(user);

        }
    );

}


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
