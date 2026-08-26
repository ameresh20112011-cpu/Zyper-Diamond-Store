/* =====================================================
   ZYPER DIAMOND STORE
   SMALL LIVE WALLET BALANCE BADGE
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
   CREATE WALLET BADGE
===================================================== */

function createWalletBadge() {

    /*
     * Prevent duplicate wallet badges
     */

    const existing =
        document.getElementById(
            "zyperWalletBadge"
        );

    if (existing) {
        return;
    }


    /* =================================================
       CREATE CSS
    ================================================= */

    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zyperWalletBadgeStyles";


    style.textContent = `

        /* =============================================
           WALLET BADGE
        ============================================= */

        #zyperWalletBadge {

            position: fixed !important;

            top: 7px !important;

            right: 7px !important;

            left: auto !important;
            bottom: auto !important;

            z-index: 999999 !important;


            /* IMPORTANT - SMALL SIZE */

            width: auto !important;

            min-width: 0 !important;

            max-width: none !important;

            height: 26px !important;

            min-height: 26px !important;

            max-height: 26px !important;


            padding:
                0 8px !important;

            margin:
                0 !important;


            display:
                inline-flex !important;

            align-items:
                center !important;

            justify-content:
                center !important;

            flex-direction:
                row !important;

            gap:
                4px !important;


            border-radius:
                999px !important;


            text-decoration:
                none !important;


            color:
                #ffffff !important;


            background:

                linear-gradient(
                    135deg,
                    #a855c7,
                    #8b3aad
                ) !important;


            border:

                1px solid
                rgba(
                    255,
                    255,
                    255,
                    .16
                ) !important;


            box-shadow:

                0 3px 8px
                rgba(
                    0,
                    0,
                    0,
                    .22
                ) !important;


            font-family:

                Arial,
                sans-serif !important;


            line-height:
                1 !important;


            overflow:
                hidden !important;


            cursor:
                pointer !important;


            -webkit-tap-highlight-color:
                transparent;

        }



        /* =============================================
           HOVER
        ============================================= */

        #zyperWalletBadge:hover {

            transform:
                translateY(-1px);

            box-shadow:

                0 4px 10px
                rgba(
                    0,
                    0,
                    0,
                    .28
                ) !important;

        }



        /* =============================================
           CLICK
        ============================================= */

        #zyperWalletBadge:active {

            transform:
                scale(.96);

        }



        /* =============================================
           WALLET ICON
        ============================================= */

        #zyperWalletBadge
        .zyper-wallet-badge-icon {

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


            display:
                inline-flex !important;

            align-items:
                center !important;

            justify-content:
                center !important;


            background:
                transparent !important;


            border:
                none !important;


            box-shadow:
                none !important;


            font-size:
                11px !important;


            line-height:
                1 !important;


            flex:
                none !important;

        }



        /* =============================================
           INFO CONTAINER
        ============================================= */

        #zyperWalletBadge
        .zyper-wallet-badge-info {

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


            display:
                inline-flex !important;

            align-items:
                center !important;

            justify-content:
                center !important;


            flex:
                none !important;

        }



        /* =============================================
           HIDE WALLET TITLE
        ============================================= */

        #zyperWalletBadge
        .zyper-wallet-badge-title {

            display:
                none !important;

        }



        /* =============================================
           BALANCE TEXT
        ============================================= */

        #zyperWalletBalance {

            width:
                auto !important;

            min-width:
                0 !important;


            margin:
                0 !important;

            padding:
                0 !important;


            display:
                inline !important;


            color:
                #ffffff !important;


            background:
                transparent !important;


            border:
                none !important;


            font-family:

                Arial,
                sans-serif !important;


            font-size:
                9px !important;


            font-weight:
                700 !important;


            line-height:
                1 !important;


            letter-spacing:
                0 !important;


            white-space:
                nowrap !important;


            flex:
                none !important;

        }



        /* =============================================
           MOBILE
        ============================================= */

        @media (
            max-width: 500px
        ) {

            #zyperWalletBadge {

                top:
                    6px !important;

                right:
                    6px !important;


                height:
                    24px !important;

                min-height:
                    24px !important;

                max-height:
                    24px !important;


                padding:
                    0 7px !important;


                gap:
                    3px !important;

            }


            #zyperWalletBadge
            .zyper-wallet-badge-icon {

                font-size:
                    10px !important;

            }


            #zyperWalletBalance {

                font-size:
                    8px !important;

            }

        }



        /* =============================================
           VERY SMALL PHONE
        ============================================= */

        @media (
            max-width: 350px
        ) {

            #zyperWalletBadge {

                height:
                    22px !important;

                min-height:
                    22px !important;

                max-height:
                    22px !important;


                padding:
                    0 6px !important;

            }


            #zyperWalletBadge
            .zyper-wallet-badge-icon {

                font-size:
                    9px !important;

            }


            #zyperWalletBalance {

                font-size:
                    7.5px !important;

            }

        }

    `;


    document.head.appendChild(
        style
    );


    /* =================================================
       CREATE WALLET BUTTON
    ================================================= */

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


    badge.setAttribute(
        "aria-label",
        "Open Wallet"
    );


    badge.innerHTML = `

        <span
            class="zyper-wallet-badge-icon">
            👛
        </span>

        <span
            class="zyper-wallet-badge-info">

            <span
                id="zyperWalletBalance"
                class="zyper-wallet-badge-balance">

                0.00 LKR

            </span>

        </span>

    `;


    document.body.appendChild(
        badge
    );

}



/* =====================================================
   FORMAT MONEY
===================================================== */

function formatMoney(
    amount
) {

    const value =
        Number(
            amount || 0
        );


    return value.toLocaleString(
        "en-LK",
        {

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }
    );

}



/* =====================================================
   LOAD WALLET BALANCE
===================================================== */

async function loadWalletBalance(
    user
) {

    const balanceElement =
        document.getElementById(
            "zyperWalletBalance"
        );


    if (!balanceElement) {
        return;
    }


    /*
     * Loading
     */

    balanceElement.textContent =
        "... LKR";


    try {

        /* =============================================
           FIREBASE TOKEN
        ============================================= */

        const token =
            await user.getIdToken();


        /* =============================================
           REQUEST WALLET
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


        /* =============================================
           RESPONSE
        ============================================= */

        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load wallet."
            );

        }


        /* =============================================
           GET BALANCE
        ============================================= */

        const balance =
            Number(
                data.wallet?.balance ||
                0
            );


        /* =============================================
           SHOW BALANCE
        ============================================= */

        balanceElement.textContent =

            formatMoney(
                balance
            )

            +

            " LKR";


    } catch (error) {

        console.error(
            "Zyper Wallet Badge Error:",
            error
        );


        balanceElement.textContent =
            "0.00 LKR";

    }

}



/* =====================================================
   CREATE BADGE
===================================================== */

function startWalletBadge() {

    createWalletBadge();


    /* =================================================
       FIREBASE AUTH
    ================================================= */

    onAuthStateChanged(
        auth,
        async function (
            user
        ) {

            const badge =
                document.getElementById(
                    "zyperWalletBadge"
                );


            if (!badge) {
                return;
            }


            /* =========================================
               NOT LOGGED IN
            ========================================= */

            if (!user) {

                badge.style
                    .setProperty(
                        "display",
                        "none",
                        "important"
                    );

                return;
            }


            /* =========================================
               LOGGED IN
            ========================================= */

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
   START AFTER HTML LOADS
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
