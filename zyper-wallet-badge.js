import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


function createWalletBadge() {

    if (
        document.getElementById(
            "zyperWalletBadge"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.textContent = `

        .zyper-wallet-badge {

            position: fixed;

            top: 18px;

            right: 18px;

            z-index: 999998;

            height: 54px;

            min-width: 165px;

            padding: 0 22px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 11px;

            border-radius: 999px;

            text-decoration: none;

            color: white;

            background:
                linear-gradient(
                    135deg,
                    #a855c7,
                    #933fb5
                );

            border:
                1px solid
                rgba(255,255,255,.12);

            box-shadow:
                0 5px 15px
                rgba(120,50,160,.25);

            transition:
                transform .2s ease,
                box-shadow .2s ease;

            -webkit-tap-highlight-color:
                transparent;

        }


        .zyper-wallet-badge:hover {

            transform:
                translateY(-2px);

            box-shadow:
                0 8px 22px
                rgba(120,50,160,.32);

        }


        .zyper-wallet-badge-icon {

            width: auto;

            height: auto;

            display: flex;

            align-items: center;

            justify-content: center;

            background: transparent;

            font-size: 23px;

            color: white;

        }


        .zyper-wallet-badge-info {

            display: flex;

            align-items: center;

        }


        .zyper-wallet-badge-balance {

            margin: 0;

            color: white;

            font-size: 16px;

            font-weight: 700;

            white-space: nowrap;

        }


        @media(max-width:600px) {

            .zyper-wallet-badge {

                top: 10px;

                right: 10px;

                height: 46px;

                min-width: 138px;

                padding: 0 16px;

                gap: 8px;

            }


            .zyper-wallet-badge-icon {

                font-size: 19px;

            }


            .zyper-wallet-badge-balance {

                font-size: 14px;

            }

        }

    `;


    document.head.appendChild(
        style
    );


    const badge =
        document.createElement("a");


    badge.id =
        "zyperWalletBadge";


    badge.className =
        "zyper-wallet-badge";


    badge.href =
        "./wallet.html";


    badge.innerHTML = `

        <div class="zyper-wallet-badge-icon">
            👛
        </div>

        <div class="zyper-wallet-badge-info">

            <span
                id="zyperWalletBalance"
                class="zyper-wallet-badge-balance"
            >
                0.00 LKR
            </span>

        </div>

    `;


    document.body.appendChild(
        badge
    );

}


async function loadWalletBalance(
    user
) {

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
            ) +
            " LKR";


    } catch(error) {

        console.error(
            "Wallet badge error:",
            error
        );


        element.textContent =
            "0.00 LKR";

    }

}


createWalletBadge();


onAuthStateChanged(
    auth,
    function(user) {

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


        loadWalletBalance(
            user
        );

    }
);
