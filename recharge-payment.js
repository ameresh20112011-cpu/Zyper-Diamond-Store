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


/* =====================================================
   SETTINGS
===================================================== */

const WORKER_URL =
"https://zyper-order.ameresh20112011.workers.dev";


const WHATSAPP_NUMBER =
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


/* =====================================================
   CURRENT USER
===================================================== */

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
   OPEN / CLOSE PAYMENT DETAILS
===================================================== */

if(
    redeemMethod &&
    paymentContent
){

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

}


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
                button.dataset.copy ||
                "";


                if(!value){

                    return;

                }


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


                    /* FALLBACK COPY */

                    const textarea =
                        document.createElement(
                            "textarea"
                        );


                    textarea.value =
                        value;


                    textarea.style.position =
                        "fixed";


                    textarea.style.opacity =
                        "0";


                    document.body.appendChild(
                        textarea
                    );


                    textarea.focus();

                    textarea.select();


                    try{

                        document.execCommand(
                            "copy"
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
                    catch(fallbackError){

                        console.error(
                            "Fallback copy failed:",
                            fallbackError
                        );


                        alert(
                            "Unable to copy. Please copy manually."
                        );

                    }


                    textarea.remove();

                }

            }
        );

    }
);


/* =====================================================
   LOAD LIVE WALLET BALANCE
===================================================== */

async function loadWallet(user){

    if(!walletBalance){

        return;

    }


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


        let result;


        try{

            result =
                await response.json();

        }
        catch{

            throw new Error(
                "Invalid wallet response."
            );

        }


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
   FIREBASE AUTH
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


        if(customerEmail){

            customerEmail.textContent =
                user.email ||
                "Not available";

        }


        if(customerUid){

            customerUid.textContent =
                user.uid;

        }


        await loadWallet(
            user
        );

    }
);


/* =====================================================
   WHATSAPP RECEIPT
===================================================== */

if(whatsappButton){

    whatsappButton.addEventListener(
        "click",
        function(){

            if(!currentUser){

                alert(
                    "Please wait for your account to load."
                );

                return;

            }


            const email =
                currentUser.email ||
                "Not available";


            const uid =
                currentUser.uid;


            const message =

`💎 ZYPER DIAMOND STORE

💰 WALLET RECHARGE REQUEST

Hello Zyper,

I have completed a bank transfer to recharge my Zyper Wallet.

📧 Account Email:
${email}

🆔 Firebase UID:
${uid}

🏦 Bank:
BOC

💳 Account Number:
94946893

👤 Account Name:
Ameresh R

📸 I will attach my successful payment receipt to this WhatsApp message.

Please verify my payment and send me my Zyper Wallet Redeem Code.

Thank you. 💎`;


            const whatsappUrl =

                "https://wa.me/"

                +

                WHATSAPP_NUMBER

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

}
