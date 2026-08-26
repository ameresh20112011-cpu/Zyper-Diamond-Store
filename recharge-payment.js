/* =====================================================
   ZYPER WALLET RECHARGE
===================================================== */

import { auth }
from "./firebase.js";


import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* =====================================================
   SETTINGS
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


/* YOUR WHATSAPP NUMBER */

const ZYPER_WHATSAPP_NUMBER =
    "94751483909";


/* =====================================================
   ELEMENTS
===================================================== */

const redeemMethod =
    document.getElementById(
        "redeemMethod"
    );


const paymentContent =
    document.getElementById(
        "paymentContent"
    );


const headerWalletBalance =
    document.getElementById(
        "headerWalletBalance"
    );


const customerEmail =
    document.getElementById(
        "customerEmail"
    );


const customerUid =
    document.getElementById(
        "customerUid"
    );


const whatsappButton =
    document.getElementById(
        "whatsappButton"
    );


const toast =
    document.getElementById(
        "toast"
    );


let currentUser = null;


/* =====================================================
   OPEN / CLOSE PAYMENT DETAILS
===================================================== */

redeemMethod.addEventListener(
    "click",
    function () {

        const isOpen =
            paymentContent.classList.contains(
                "show"
            );


        if (isOpen) {

            paymentContent.classList.remove(
                "show"
            );


            redeemMethod.classList.remove(
                "active"
            );

        }

        else {

            paymentContent.classList.add(
                "show"
            );


            redeemMethod.classList.add(
                "active"
            );

        }

    }
);


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
   LOAD LIVE WALLET BALANCE
===================================================== */

async function loadWalletBalance(user) {

    headerWalletBalance.textContent =
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


        const balance =
            Number(
                result.wallet?.balance ||
                0
            );


        headerWalletBalance.textContent =
            formatMoney(balance)
            +
            " LKR";

    }

    catch (error) {

        console.error(
            "Wallet Balance Error:",
            error
        );


        headerWalletBalance.textContent =
            "0.00 LKR";

    }

}


/* =====================================================
   FIREBASE AUTH
===================================================== */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "./index.html";

            return;

        }


        currentUser =
            user;


        customerEmail.textContent =
            user.email ||
            "No email";


        customerUid.textContent =
            user.uid;


        whatsappButton.disabled =
            false;


        await loadWalletBalance(
            user
        );

    }
);


/* =====================================================
   COPY BANK DETAILS
===================================================== */

document
    .querySelectorAll(
        ".copy-btn"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const value =
                        button.dataset.copy ||
                        "";


                    if (!value) {

                        return;

                    }


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                value
                            );


                        showToast(
                            "Copied: " +
                            value
                        );

                    }

                    catch (error) {

                        console.error(
                            "Copy Error:",
                            error
                        );


                        showToast(
                            "Unable to copy"
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   TOAST MESSAGE
===================================================== */

let toastTimer = null;


function showToast(message) {

    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            1800
        );

}


/* =====================================================
   WHATSAPP RECEIPT MESSAGE
===================================================== */

whatsappButton.addEventListener(
    "click",
    function () {

        if (!currentUser) {

            alert(
                "Please wait for your account to load."
            );

            return;

        }


        const email =
            currentUser.email ||
            "No email";


        const uid =
            currentUser.uid;


        const message =

`💎 ZYPER DIAMOND STORE

💰 WALLET RECHARGE REQUEST

Hello Zyper,

I have completed the bank transfer for my Zyper Wallet recharge.

📧 Account Email:
${email}

🆔 Firebase UID:
${uid}

🏦 Bank:
BOC

📸 I will attach my successful payment receipt to this message.

Please verify my payment and send me my Zyper Wallet Redeem Code.

Thank you 💎`;


        const whatsappUrl =
            "https://wa.me/"
            +
            ZYPER_WHATSAPP_NUMBER
            +
            "?text="
            +
            encodeURIComponent(
                message
            );


        window.location.href =
            whatsappUrl;

    }
);
