/* =====================================================
   ZYPER WALLET BADGE
   SCREENSHOT-LIKE SIZE
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


function removeOldBadge() {

    document
        .querySelectorAll(
            "#zyperWalletBadge, .zyper-wallet-badge"
        )
        .forEach(
            element => element.remove()
        );

}


function createWalletBadge() {

    removeOldBadge();


    const badge =
        document.createElement("a");


    badge.id =
        "zyperWalletBadge";


    badge.href =
        "./wallet.html";


    badge.innerHTML = `

        <span id="zyperWalletBadgeIcon">
            <i class="fa-regular fa-wallet"></i>
        </span>

        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    badge.style.cssText = `

        position: fixed !important;

        top: 22px !important;

        right: 28px !important;

        z-index: 2147483647 !important;

        height: 52px !important;

        min-height: 52px !important;

        max-height: 52px !important;

        min-width: 190px !important;

        padding: 0 22px !important;

        display: inline-flex !important;

        align-items: center !important;

        justify-content: center !important;

        gap: 12px !important;

        border-radius: 999px !important;

        background:
            linear-gradient(
                135deg,
                #a94fc8,
                #9640b7
            ) !important;

        border:
            none !important;

        box-shadow:
            0 5px 14px
            rgba(134, 54, 171, .24) !important;

        color: #ffffff !important;

        text-decoration: none !important;

        font-family:
            "Poppins",
            Arial,
            sans-serif !important;

        white-space: nowrap !important;

        box-sizing: border-box !important;

        cursor: pointer !important;

    `;


    document.body.appendChild(
        badge
    );


    const icon =
        document.getElementById(
            "zyperWalletBadgeIcon"
        );


    icon.style.cssText = `

        display: inline-flex !important;

        align-items: center !important;

        justify-content: center !important;

        width: 25px !important;

        height: 25px !important;

        padding: 0 !important;

        margin: 0 !important;

        font-size: 22px !important;

        line-height: 1 !important;

        color: white !important;

        background: transparent !important;

    `;


    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    balance.style.cssText = `

        display: inline-block !important;

        padding: 0 !important;

        margin: 0 !important;

        color: #ffffff !important;

        font-size: 17px !important;

        font-weight: 500 !important;

        line-height: 1 !important;

        letter-spacing: 0 !important;

        white-space: nowrap !important;

    `;


    applyResponsiveSize();


    return badge;

}


function applyResponsiveSize() {

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


    if (!badge || !icon || !balance) {
        return;
    }


    /* =========================
       MOBILE
    ========================= */

    if (window.innerWidth <= 600) {

        badge.style.setProperty(
            "top",
            "12px",
            "important"
        );

        badge.style.setProperty(
            "right",
            "12px",
            "important"
        );

        badge.style.setProperty(
            "height",
            "42px",
            "important"
        );

        badge.style.setProperty(
            "min-height",
            "42px",
            "important"
        );

        badge.style.setProperty(
            "max-height",
            "42px",
            "important"
        );

        badge.style.setProperty(
            "min-width",
            "150px",
            "important"
        );

        badge.style.setProperty(
            "padding",
            "0 16px",
            "important"
        );

        badge.style.setProperty(
            "gap",
            "9px",
            "important"
        );


        icon.style.setProperty(
            "font-size",
            "18px",
            "important"
        );

        icon.style.setProperty(
            "width",
            "21px",
            "important"
        );

        icon.style.setProperty(
            "height",
            "21px",
            "important"
        );


        balance.style.setProperty(
            "font-size",
            "14px",
            "important"
        );

    }


    /* =========================
       PC / TABLET
    ========================= */

    else {

        badge.style.setProperty(
            "top",
            "22px",
            "important"
        );

        badge.style.setProperty(
            "right",
            "28px",
            "important"
        );

        badge.style.setProperty(
            "height",
            "52px",
            "important"
        );

        badge.style.setProperty(
            "min-height",
            "52px",
            "important"
        );

        badge.style.setProperty(
            "max-height",
            "52px",
            "important"
        );

        badge.style.setProperty(
            "min-width",
            "190px",
            "important"
        );

        badge.style.setProperty(
            "padding",
            "0 22px",
            "important"
        );

        badge.style.setProperty(
            "gap",
            "12px",
            "important"
        );


        icon.style.setProperty(
            "font-size",
            "22px",
            "important"
        );

        icon.style.setProperty(
            "width",
            "25px",
            "important"
        );

        icon.style.setProperty(
            "height",
            "25px",
            "important"
        );


        balance.style.setProperty(
            "font-size",
            "17px",
            "important"
        );

    }

}


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
                "Wallet unavailable."
            );

        }


        const walletBalance =
            Number(
                data.wallet?.balance || 0
            );


        balanceElement.textContent =
            formatMoney(
                walletBalance
            ) +
            " LKR";


    } catch (error) {

        console.error(
            "Wallet Badge Error:",
            error
        );


        balanceElement.textContent =
            "0.00 LKR";

    }

}


function startWalletBadge() {

    const badge =
        createWalletBadge();


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


            applyResponsiveSize();


            await loadWalletBalance(
                user
            );

        }
    );

}


window.addEventListener(
    "resize",
    applyResponsiveSize
);


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startWalletBadge
    );

} else {

    startWalletBadge();

}
