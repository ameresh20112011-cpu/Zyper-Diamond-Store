import { auth }
from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
"https://zyper-order.ameresh20112011.workers.dev";


/* =====================================================
   ONE GLOBAL WALLET STYLE

   CHANGE ONLY THESE VALUES.
   ALL CONNECTED PAGES WILL CHANGE.
===================================================== */

const WALLET_STYLE = {

    mobile: {
        height: 35,
        paddingX: 10,
        icon: 17,
        font: 11,
        fontWeight: 700,
        gap: 5,
        top: 8,
        right: 10
    },

    desktop: {
        height: 40,
        paddingX: 13,
        icon: 18,
        font: 12,
        fontWeight: 700,
        gap: 7,
        top: 12,
        right: 12
    }

};


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
   REMOVE OLD PAGE-SPECIFIC WALLET UI
===================================================== */

function removeLegacyWalletUI() {

    document
        .querySelectorAll(
            ".wallet-page-balance, .wallet-page-balance-box"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );

}


/* =====================================================
   REMOVE OLD SHARED BADGE
===================================================== */

function removeOldWalletBadge() {

    const oldBadge =
        document.getElementById(
            "zyperWalletBadge"
        );


    if (oldBadge) {

        oldBadge.remove();

    }

}


/* =====================================================
   CREATE WALLET BADGE
===================================================== */

function createWalletBadge() {

    removeOldWalletBadge();


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
        "Open Zyper Wallet"
    );


    badge.innerHTML = `

        <svg
            id="zyperWalletBadgeIcon"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <path
                d="M6 9.5H24.5C26.4 9.5 28 11.1 28 13V24C28 25.9 26.4 27.5 24.5 27.5H7.5C5.6 27.5 4 25.9 4 24V10.5C4 8.6 5.4 7.1 7.2 6.7L21.5 3.5C22.5 3.3 23.5 4 23.7 5L24.6 9.5"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

        </svg>


        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    document.body.appendChild(
        badge
    );


    applyWalletStyle();


    return badge;

}


/* =====================================================
   APPLY SAME STYLE TO EVERY PAGE
===================================================== */

function applyWalletStyle() {

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


    if (
        !badge ||
        !icon ||
        !balance
    ) {

        return;

    }


    const isMobile =
        window.innerWidth <= 500;


    const style =
        isMobile
            ? WALLET_STYLE.mobile
            : WALLET_STYLE.desktop;


    /* =================================================
       WALLET BADGE
    ================================================= */

    badge.style.setProperty(
        "position",
        "fixed",
        "important"
    );


    badge.style.setProperty(
        "top",
        `${style.top}px`,
        "important"
    );


    badge.style.setProperty(
        "right",
        `${style.right}px`,
        "important"
    );


    badge.style.setProperty(
        "left",
        "auto",
        "important"
    );


    badge.style.setProperty(
        "bottom",
        "auto",
        "important"
    );


    badge.style.setProperty(
        "width",
        "auto",
        "important"
    );


    badge.style.setProperty(
        "min-width",
        "0",
        "important"
    );


    badge.style.setProperty(
        "max-width",
        "none",
        "important"
    );


    badge.style.setProperty(
        "height",
        `${style.height}px`,
        "important"
    );


    badge.style.setProperty(
        "min-height",
        `${style.height}px`,
        "important"
    );


    badge.style.setProperty(
        "max-height",
        `${style.height}px`,
        "important"
    );


    badge.style.setProperty(
        "padding",
        `0 ${style.paddingX}px`,
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
        `${style.gap}px`,
        "important"
    );


    badge.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );


    badge.style.setProperty(
        "border-radius",
        "999px",
        "important"
    );


    badge.style.setProperty(
        "border",
        "1px solid rgba(255,255,255,.14)",
        "important"
    );


    badge.style.setProperty(
        "background",
        "linear-gradient(135deg,#a64fc4,#8f37ae)",
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
        "white-space",
        "nowrap",
        "important"
    );


    badge.style.setProperty(
        "box-shadow",
        "0 4px 14px rgba(115,45,145,.28)",
        "important"
    );


    badge.style.setProperty(
        "z-index",
        "2147483647",
        "important"
    );


    badge.style.setProperty(
        "-webkit-tap-highlight-color",
        "transparent",
        "important"
    );


    /* =================================================
       WALLET ICON
    ================================================= */

    icon.style.setProperty(
        "width",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "height",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "min-width",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "max-width",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "min-height",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "max-height",
        `${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "flex",
        `0 0 ${style.icon}px`,
        "important"
    );


    icon.style.setProperty(
        "display",
        "block",
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


    icon.style.setProperty(
        "color",
        "#ffffff",
        "important"
    );


    /* =================================================
       PROFESSIONAL BOLD BALANCE TEXT
       700 = BOLD, BUT NOT TOO THICK
    ================================================= */

    balance.style.setProperty(
        "display",
        "block",
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


    balance.style.setProperty(
        "font-family",
        "Arial, sans-serif",
        "important"
    );


    balance.style.setProperty(
        "font-size",
        `${style.font}px`,
        "important"
    );


    balance.style.setProperty(
        "font-weight",
        `${style.fontWeight}`,
        "important"
    );


    balance.style.setProperty(
        "font-style",
        "normal",
        "important"
    );


    balance.style.setProperty(
        "line-height",
        "1",
        "important"
    );


    balance.style.setProperty(
        "letter-spacing",
        "0",
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


    /* REMOVE OLD EXTRA-BOLD EFFECT */

    balance.style.setProperty(
        "text-shadow",
        "none",
        "important"
    );

}


/* =====================================================
   LOAD LIVE WALLET BALANCE
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
                        JSON.stringify(
                            {
                                action:
                                    "wallet_balance"
                            }
                        )

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


        const amount =
            Number(
                result.wallet?.balance ||
                0
            );


        balanceElement.textContent =
            formatMoney(
                amount
            ) +
            " LKR";


        applyWalletStyle();

    }
    catch (error) {

        console.error(
            "Wallet Badge Error:",
            error
        );


        balanceElement.textContent =
            "0.00 LKR";


        applyWalletStyle();

    }

}


/* =====================================================
   START
===================================================== */

function startWalletBadge() {

    /*
       Removes old page-specific wallet displays.
       This prevents Home / Topup / other pages
       from having different wallet styles.
    */

    removeLegacyWalletUI();


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


            applyWalletStyle();


            await loadWalletBalance(
                user
            );

        }
    );

}


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    function() {

        applyWalletStyle();

    }
);


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

}
else {

    startWalletBadge();

}
