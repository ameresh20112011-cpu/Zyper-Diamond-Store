import { auth }
from "./firebase.js";


import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";



/* =====================================================
   ZYPER SHARED WALLET / LOGIN CONTROL
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";



/* =====================================================
   LOAD FONT
===================================================== */

function loadFont(){

    if(
        document.getElementById(
            "zyperWalletFont"
        )
    ){

        return;

    }


    const link =
        document.createElement(
            "link"
        );


    link.id =
        "zyperWalletFont";


    link.rel =
        "stylesheet";


    link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap";


    document.head.appendChild(
        link
    );

}


loadFont();



/* =====================================================
   STYLE SETTINGS
===================================================== */

const BADGE_STYLE = {

    mobile:{

        height:35,

        paddingX:11,

        icon:17,

        font:11,

        gap:6,

        top:10,

        right:10

    },


    desktop:{

        height:40,

        paddingX:14,

        icon:18,

        font:12,

        gap:7,

        top:14,

        right:14

    }

};



/* =====================================================
   FORMAT MONEY
===================================================== */

function formatMoney(
    amount
){

    return Number(
        amount || 0
    ).toLocaleString(
        "en-LK",
        {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        }
    );

}



/* =====================================================
   REMOVE OLD WALLET UI
===================================================== */

function removeOldWalletUI(){

    document
        .querySelectorAll(
            [
                ".wallet-page-balance",
                ".wallet-page-balance-box",
                ".top-wallet-button",
                ".top-login-button"
            ].join(",")
        )
        .forEach(
            function(element){

                element.remove();

            }
        );


    const oldBadge =
        document.getElementById(
            "zyperWalletBadge"
        );


    if(oldBadge){

        oldBadge.remove();

    }

}



/* =====================================================
   CREATE BADGE
===================================================== */

function createBadge(){

    const badge =
        document.createElement(
            "a"
        );


    badge.id =
        "zyperWalletBadge";


    badge.href =
        "./index.html?login=1";


    badge.setAttribute(
        "aria-label",
        "Login to Zyper"
    );


    document.body.appendChild(
        badge
    );


    return badge;

}



/* =====================================================
   LOGIN ICON
===================================================== */

function loginIcon(){

    return `

        <svg
            id="zyperWalletBadgeIcon"
            viewBox="0 0 24 24"
            fill="none"
        >

            <path
                d="M10 17L15 12L10 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M15 12H3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />

            <
