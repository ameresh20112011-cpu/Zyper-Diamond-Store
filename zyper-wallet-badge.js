import { auth } from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


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


function removeOldWalletBadges() {

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


function createWalletBadge() {

    removeOldWalletBadges();


    const badge =
        document.createElement("a");


    badge.id =
        "zyperWalletBadge";


    badge.href =
        "./wallet.html";


    badge.innerHTML = `

        <span id="zyperWalletBadgeIcon">
            👛
        </span>

        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    badge.style.setProperty(
        "position",
        "fixed",
        "important"
    );

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
        "width",
        "auto",
        "important"
    );

    badge.style.setProperty(
        "min-width",
        "165px",
        "important"
    );

    badge.style.setProperty(
        "height",
        "48px",
        "important"
    );

    badge.style.setProperty(
        "min-height",
        "48px",
        "important"
    );

    badge.style.setProperty(
        "max-height",
        "48px",
        "important"
    );

    badge.style.setProperty(
        "padding",
        "0 18px",
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
        "9px",
        "important"
    );

    badge.style.setProperty(
        "border-radius",
        "999px",
        "important"
    );

    badge.style.setProperty(
        "background",
        "linear-gradient(135deg,#a855c7,#8535ad)",
        "important"
    );

    badge.style.setProperty(
        "border",
        "1px solid rgba(255,255,255,.20)",
        "important"
    );

    badge.style.setProperty(
        "box-shadow",
        "0 6px 18px rgba(113,40,150,.35)",
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
        "font-family",
        "Arial, sans-serif",
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


    document.body.appendChild(
        badge
    );


    const icon =
        document.getElementById(
            "zyperWalletBadgeIcon"
        );


    icon.style.setProperty(
        "font-size",
        "21px",
        "important"
    );

    icon.style.setProperty(
        "line-height",
        "1",
        "important"
    );

    icon.style.setProperty(
        "margin",
        "0",
        "important"
    );

    icon.style.setProperty(
        "padding",
        "0",
        "important"
    );


    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    balance.style.setProperty(
        "font-size",
        "16px",
        "important"
    );

    balance.style.setProperty(
        "font-weight",
        "700",
        "important"
    );

    balance.style.setProperty(
        "line-height",
        "1",
        "important"
    );

    balance.style.setProperty(
        "color",
        "#ffffff",
        "important"
    );

    balance.style.setProperty(
        "white-space",
        "nowrap",
        "important"
    );

    balance.style.setProperty(
        "margin",
        "0",
        "important"
    );

    balance.style.setProperty(
        "padding",
        "0",
        "important"
    );


    return badge;

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


        const walletBalance =
            Number(
                result.wallet?.balance ||
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


            await loadWalletBalance(
                user
            );

        }
    );

}


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
