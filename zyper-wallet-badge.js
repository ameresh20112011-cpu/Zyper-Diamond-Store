import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


/* =====================================================
   CREATE SMALL WALLET BADGE
===================================================== */

function createWalletBadge() {

    if (document.getElementById("zyperWalletBadge")) {
        return;
    }


    const style =
        document.createElement("style");


    style.textContent = `

        /* ==============================
           SMALL WALLET BUTTON
        ============================== */

        .zyper-wallet-badge {

            position: fixed;

            top: 10px;
            right: 10px;

            z-index: 999998;

            height: 36px;

            min-width: 112px;

            padding: 0 12px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 6px;

            border-radius: 999px;

            text-decoration: none;

            color: white;

            background:
                linear-gradient(
                    135deg,
                    #a855c7,
                    #8b3db0
                );

            border:
                1px solid
                rgba(255,255,255,.14);

            box-shadow:
                0 4px 12px
                rgba(0,0,0,.20);

            transition:
                transform .2s ease,
                box-shadow .2s ease;

            -webkit-tap-highlight-color:
                transparent;

        }


        .zyper-wallet-badge:hover {

            transform:
                translateY(-1px);

            box-shadow:
                0 6px 16px
                rgba(0,0,0,.25);

        }


        /* ==============================
           WALLET ICON
        ============================== */

        .zyper-wallet-badge-icon {

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 15px;

            line-height: 1;

        }


        /* ==============================
           BALANCE
        ============================== */

        .zyper-wallet-badge-info {

            display: flex;

            align-items: center;

        }


        .zyper-wallet-badge-balance {

            color: white;

            font-size: 11px;

            font-weight: 700;

            line-height: 1;

            white-space: nowrap;

        }


        /* ==============================
           MOBILE
        ============================== */

        @media(max-width:500px) {

            .zyper-wallet-badge {

                top: 8px;
                right: 8px;

                height: 32px;

                min-width: 100px;

                padding: 0 10px;

                gap: 5px;

            }


            .zyper-wallet-badge-icon {

                font-size: 13px;

            }


            .zyper-wallet-badge-balance {

                font-size: 10px;

            }

        }


        /* ==============================
           VERY SMALL PHONES
        ============================== */

        @media(max-width:350px) {

            .zyper-wallet-badge {

                height: 30px;

                min-width: 94px;

                padding: 0 8px;

            }


            .zyper-wallet-badge-balance {

                font-size: 9px;

            }

        }

    `;


    document.head.appendChild(style);


    /* =================================================
       CREATE BUTTON
    ================================================= */

    const badge =
        document.createElement("a");


    badge.id =
        "zyperWalletBadge";


    badge.className =
        "zyper-wallet-badge";


    badge.href =
        "./wallet.html";


    badge.innerHTML = `

        <span class="zyper-wallet-badge-icon">
            👛
        </span>

        <span
            id="zyperWalletBalance"
            class="zyper-wallet-badge-balance">
            0.00 LKR
        </span>

    `;


    document.body.appendChild(badge);

}



/* =====================================================
   LOAD WALLET BALANCE
===================================================== */

async function loadWalletBalance(user) {

    const element =
        document.getElementById(
            "zyperWalletBalance"
        );


    if (!element) {
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


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Wallet unavailable"
            );

        }


        const balance =
            Number(
                data.wallet?.balance || 0
            );


        element.textContent =

            balance.toLocaleString(
                "en-LK",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )

            + " LKR";


    } catch (error) {

        console.error(
            "Wallet balance error:",
            error
        );


        element.textContent =
            "0.00 LKR";

    }

}



/* =====================================================
   START
===================================================== */

createWalletBadge();


onAuthStateChanged(
    auth,
    function (user) {

        const badge =
            document.getElementById(
                "zyperWalletBadge"
            );


        if (!user) {

            if (badge) {

                badge.style.display =
                    "none";

            }

            return;

        }


        if (badge) {

            badge.style.display =
                "flex";

        }


        loadWalletBalance(user);

    }
);
