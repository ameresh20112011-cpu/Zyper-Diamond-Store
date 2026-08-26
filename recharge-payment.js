/* =====================================================
   ZYPER RECHARGE PAYMENT
===================================================== */

import { auth }
from "./firebase.js";


import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const WORKER_URL =
"https://zyper-order.ameresh20112011.workers.dev";


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


const customerEmail =
document.getElementById(
    "customerEmail"
);


const customerUid =
document.getElementById(
    "customerUid"
);


const walletBalance =
document.getElementById(
    "headerWalletBalance"
);


const whatsappButton =
document.getElementById(
    "whatsappButton"
);


let currentUser =
null;


/* =====================================================
   MONEY FORMAT
===================================================== */

function formatMoney(amount){

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
   OPEN PAYMENT DETAILS
===================================================== */

redeemMethod.addEventListener(
    "click",
    function(){

        const opened =
        paymentContent
        .classList
        .contains(
            "show"
        );


        if(opened){

            paymentContent
            .classList
            .remove(
                "show"
            );


            redeemMethod
            .classList
            .remove(
                "active"
            );

        }
        else{

            paymentContent
            .classList
            .add(
                "show"
            );


            redeemMethod
            .classList
            .add(
                "active"
            );

        }

    }
);


/* =====================================================
   COPY BUTTONS
===================================================== */

document
.querySelectorAll(
    ".copy-btn"
)
.forEach(
    function(button){

        button.addEventListener(
            "click",
            async function(){

                const value =
                button.dataset.copy;


                try{

                    await navigator
                    .clipboard
                    .writeText(
                        value
                    );


                    const oldText =
                    button.textContent;


                    button.textContent =
                    "✓";


                    setTimeout(
                        function(){

                            button.textContent =
                            oldText;

                        },
                        1200
                    );

                }
                catch(error){

                    console.error(
                        "Copy failed:",
                        error
                    );


                    alert(
                        "Copy failed. Please copy manually."
                    );

                }

            }
        );

    }
);


/* =====================================================
   LOAD WALLET
===================================================== */

async function loadWallet(user){

    walletBalance.textContent =
    "... LKR";


    try{

        const token =
        await user.getIdToken();


        const response =
        await fetch(
            WORKER_URL,
            {

                method:
                "POST",

                headers:{

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


        if(
            !response.ok ||
            !result.success
        ){

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


        walletBalance.textContent =
        formatMoney(
            balance
        )
        +
        " LKR";

    }
    catch(error){

        console.error(
            "Wallet error:",
            error
        );


        walletBalance.textContent =
        "0.00 LKR";

    }

}


/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        if(!user){

            window.location.href =
            "./index.html";

            return;

        }


        currentUser =
        user;


        customerEmail.textContent =
        user.email ||
        "Not available";


        customerUid.textContent =
        user.uid;


        await loadWallet(
            user
        );

    }
);


/* =====================================================
   WHATSAPP
===================================================== */

whatsappButton.addEventListener(
    "click",
    function(){

        if(!currentUser){

            alert(
                "Please login first."
            );

            return;

        }


        /*
         IMPORTANT:
         Put your WhatsApp number below.

         Sri Lanka example:
         947XXXXXXXX

         Do NOT use:
         +94
         spaces
         dashes
        */

        const whatsappNumber =
        "947XXXXXXXX";


        const message =

`Hello Zyper Diamond Store 👋

I have made a bank transfer to recharge my Zyper Wallet.

📧 Account Email:
${currentUser.email || "Not available"}

🆔 Firebase UID:
${currentUser.uid}

🏦 Bank:
BOC

💳 Account Number:
94946893

👤 Account Name:
Ameresh R

I will attach my payment receipt here.

Please verify my payment and send me the Zyper Redeem Code.

Thank you. 💎`;


        const url =
        "https://wa.me/"
        +
        whatsappNumber
        +
        "?text="
        +
        encodeURIComponent(
            message
        );


        window.location.href =
        url;

    }
);
