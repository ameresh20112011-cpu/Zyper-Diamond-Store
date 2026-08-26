/* =====================================================
   ZYPER DIAMOND STORE
   RESPONSIVE WALLET BALANCE BADGE

   PC:
   - Height: 42px
   - Text: 14px
   - Icon: 19px

   MOBILE:
   - Height: 34px
   - Text: 11px
   - Icon: 15px
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
   REMOVE OLD / DUPLICATE BADGES
===================================================== */

function removeOldWalletBadges() {

    document
        .querySelectorAll(
            "#zyperWalletBadge, .zyper-wallet-badge"
        )
        .forEach(
            function (element) {

                element.remove();

            }
        );
}


/* =====================================================
   RESPONSIVE SIZE
===================================================== */

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


    if (
        !badge ||
        !icon ||
        !balance
    ) {

        return;

    }


    /* =================================================
       MOBILE
       600px AND BELOW
    ================================================= */

    if (window.innerWidth <= 600) {

        badge.style.setProperty(
            "height",
            "34px",
            "important"
        );

        badge.style.setProperty(
            "min-height",
            "34px",
            "important"
        );

        badge.style.setProperty(
            "max-height",
            "34px",
            "important"
        );

        badge.style.setProperty(
            "min-width",
            "112px",
            "important"
        );

        badge.style.setProperty(
            "padding",
            "0 10px",
            "important"
        );

        badge.style.setProperty(
            "gap",
            "5px",
            "important"
        );

        badge.style.setProperty(
            "top",
            "9px",
            "important"
        );

        badge.style.setProperty(
            "right",
            "9px",
            "important"
        );

        icon.style.setProperty(
            "font-size",
            "15px",
            "important"
        );

        balance.style.setProperty(
            "font-size",
            "11px",
            "important"
        );

    }


    /* =================================================
       PC / TABLET
       ABOVE 600px
    ================================================= */

    else {

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
            "145px",
            "important"
        );

        badge.style.setProperty(
            "padding",
            "0 15px",
            "important"
        );

        badge.style.setProperty(
            "gap",
            "8px",
            "important"
        );

        badge.style.setProperty(
            "top",
            "12px",
            "important"
        );

        badge.style.setProperty(
            "right",
            "14px",
            "important"
        );

        icon.style.setProperty(
            "font-size",
            "19px",
            "important"
        );

        balance.style.setProperty(
            "font-size",
            "14px",
            "important"
        );

    }

}


/* =====================================================
   CREATE WALLET BADGE
===================================================== */

function createWalletBadge() {

    removeOldWalletBadges();


    const badge =
        document.createElement(
            "a"
        );


    badge.id =
        "zyperWalletBadge";


    badge.href =
        "./wallet.html";


    badge.setAttribute(
        "aria-label",
        "Open Wallet"
    );


    badge.innerHTML = `

        <span id="zyperWalletBadgeIcon">
            👛
        </span>

        <span id="zyperWalletBalance">
            ... LKR
        </span>

    `;


    /* =================================================
       MAIN BADGE STYLE
    ================================================= */

    badge.style.setProperty(
        "position",
        "fixed",
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
        "max-width",
        "none",
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
        "flex-direction",
        "row",
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
        "1px solid rgba(255,255,255,.22)",
        "important"
    );

    badge.style.setProperty(
        "box-shadow",
        "0 5px 16px rgba(113,40,150,.35)",
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
        "font-weight",
        "700",
        "important"
    );

    badge.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

    badge.style.setProperty(
        "white-space",
        "nowrap",
        "important"
    );

    badge.style.setProperty(
        "overflow",
        "hidden",
        "important"
    );

    badge.style.setProperty(
        "cursor",
        "pointer",
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

    badge.style.setProperty(
        "transition",
        "transform .2s ease, box-shadow .2s ease",
        "important"
    );


    document.body.appendChild(
        badge
    );


    /* =================================================
       ICON STYLE
    ================================================= */

    const icon =
        document.getElementById(
            "zyperWalletBadgeIcon"
        );


    icon.style.setProperty(
        "display",
        "inline-flex",
        "important"
    );

    icon.style.setProperty(
        "align-items",
        "center",
        "important"
    );

    icon.style.setProperty(
        "justify-content",
        "center",
        "important"
    );

    icon.style.setProperty(
        "width",
        "auto",
        "important"
    );

    icon.style.setProperty(
        "height",
        "auto",
        "important"
    );

    icon.style.setProperty(
        "padding",
        "0",
        "important"
    );

    icon.style.setProperty(
        "margin",
        "0",
        "important"
    );

    icon.style.setProperty(
        "line-height",
        "1",
        "important"
    );

    icon.style.setProperty(
        "background",
        "transparent",
        "important"
    );

    icon.style.setProperty(
        "border",
        "none",
        "important"
    );

    icon.style.setProperty(
        "box-shadow",
        "none",
        "important"
    );

    icon.style.setProperty(
        "flex",
        "none",
        "important"
    );


    /* =================================================
       BALANCE STYLE
    ================================================= */

    const balance =
        document.getElementById(
            "zyperWalletBalance"
        );


    balance.style.setProperty(
        "display",
        "inline-block",
        "important"
    );

    balance.style.setProperty(
        "font-family",
        "Arial, sans-serif",
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
        "padding",
        "0",
        "important"
    );

    balance.style.setProperty(
        "margin",
        "0",
        "important"
    );

    balance.style.setProperty(
        "background",
        "transparent",
        "important"
    );

    balance.style.setProperty(
        "border",
        "none",
        "important"
    );


    /* =================================================
       APPLY PC / MOBILE SIZE
    ================================================= */

    applyResponsiveSize();


    /* =================================================
       HOVER
    ================================================= */

    badge.addEventListener(
        "mouseenter",
        function () {

            badge.style.setProperty(
                "transform",
                "translateY(-1px)",
                "important"
            );

            badge.style.setProperty(
                "box-shadow",
                "0 7px 20px rgba(113,40,150,.45)",
                "important"
            );

        }
    );


    badge.addEventListener(
        "mouseleave",
        function () {

            badge.style.setProperty(
                "transform",
                "none",
                "important"
            );

            badge.style.setProperty(
                "box-shadow",
                "0 5px 16px rgba(113,40,150,.35)",
                "important"
            );

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


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load wallet balance."
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


/* =====================================================
   START WALLET BADGE
===================================================== */

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


/* =====================================================
   RESIZE AUTOMATICALLY

   Example:
   PC browser becomes smaller -> mobile size
   Browser becomes bigger -> PC size
===================================================== */

window.addEventListener(
    "resize",
    function () {

        applyResponsiveSize();

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

} else {

    startWalletBadge();

}
