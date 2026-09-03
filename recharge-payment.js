/* =====================================================
   ZYPER RECHARGE PAYMENT

   GUEST:
   - Full page visible
   - Bank details visible
   - Copy buttons work
   - No automatic redirect
   - WhatsApp action requires login

   LOGGED USER:
   - Live wallet
   - Email + UID
   - WhatsApp recharge request
===================================================== */


import {
    auth
}
from "./firebase.js?v=10000";


import {
    onAuthStateChanged
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


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
   MONEY
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
   LOGIN POPUP STYLE
===================================================== */

function addLoginStyle(){

    if(
        document.getElementById(
            "zyperRechargeLoginStyle"
        )
    ){
        return;
    }


    const style =
    document.createElement(
        "style"
    );


    style.id =
    "zyperRechargeLoginStyle";


    style.textContent = `

#zyperRechargeLoginModal{

    position:fixed;

    inset:0;

    display:none;

    align-items:center;

    justify-content:center;

    padding:20px;

    background:
    rgba(2,6,23,.76);

    backdrop-filter:
    blur(8px);

    -webkit-backdrop-filter:
    blur(8px);

    z-index:2147483640;

}


#zyperRechargeLoginModal.show{

    display:flex;

}


.zyper-recharge-login-card{

    width:100%;

    max-width:360px;

    padding:25px 20px;

    border-radius:22px;

    text-align:center;

    color:white;

    background:
    linear-gradient(
        145deg,
        #111827,
        #1e1b4b
    );

    border:
    1px solid
    rgba(255,255,255,.12);

    box-shadow:
    0 20px 60px
    rgba(0,0,0,.5);

}


.zyper-recharge-login-icon{

    width:58px;

    height:58px;

    margin:
    0 auto 14px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:18px;

    font-size:27px;

    background:
    rgba(124,58,237,.18);

}


.zyper-recharge-login-card h3{

    margin:0;

    font-size:20px;

}


.zyper-recharge-login-card p{

    margin:
    9px 0 18px;

    color:#94a3b8;

    font-size:12px;

    line-height:1.6;

}


.zyper-recharge-login-button{

    width:100%;

    min-height:45px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:12px;

    color:white;

    text-decoration:none;

    font-size:13px;

    font-weight:700;

    background:
    linear-gradient(
        135deg,
        #2563eb,
        #7c3aed
    );

}


.zyper-recharge-login-cancel{

    width:100%;

    min-height:42px;

    margin-top:9px;

    border:
    1px solid
    rgba(255,255,255,.11);

    border-radius:11px;

    color:#cbd5e1;

    background:
    rgba(255,255,255,.05);

    cursor:pointer;

}

    `;


    document.head.appendChild(
        style
    );

}


/* =====================================================
   CREATE LOGIN POPUP
===================================================== */

function createLoginPopup(){

    if(
        document.getElementById(
            "zyperRechargeLoginModal"
        )
    ){
        return;
    }


    const modal =
    document.createElement(
        "div"
    );


    modal.id =
    "zyperRechargeLoginModal";


    modal.innerHTML = `

<div class="zyper-recharge-login-card">

    <div class="zyper-recharge-login-icon">
        🔐
    </div>

    <h3>
        Login Required
    </h3>

    <p>
        Please login to use
        Zyper Wallet Recharge.
        <br>
        You can continue viewing
        the bank details without login.
    </p>

    <a
    href="./index.html"
    class="zyper-recharge-login-button"
    >
        LOGIN
    </a>

    <button
    type="button"
    id="zyperRechargeLoginCancel"
    class="zyper-recharge-login-cancel"
    >
        Continue Browsing
    </button>

</div>

    `;


    document.body.appendChild(
        modal
    );


    const cancelButton =
    document.getElementById(
        "zyperRechargeLoginCancel"
    );


    if(cancelButton){

        cancelButton
        .addEventListener(
            "click",
            hideLoginPopup
        );

    }


    modal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                modal
            ){

                hideLoginPopup();

            }

        }
    );

}


/* =====================================================
   SHOW LOGIN POPUP
===================================================== */

function showLoginPopup(){

    createLoginPopup();


    const modal =
    document.getElementById(
        "zyperRechargeLoginModal"
    );


    if(modal){

        modal
        .classList
        .add(
            "show"
        );

    }

}


/* =====================================================
   HIDE LOGIN POPUP
===================================================== */

function hideLoginPopup(){

    const modal =
    document.getElementById(
        "zyperRechargeLoginModal"
    );


    if(modal){

        modal
        .classList
        .remove(
            "show"
        );

    }

}


/* =====================================================
   PAYMENT DETAILS
   PUBLIC FOR GUEST + LOGIN USER
===================================================== */

if(
    redeemMethod &&
    paymentContent
){

    redeemMethod
    .addEventListener(
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
   WORKS WITHOUT LOGIN
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


                const oldText =
                button.textContent;


                try{


                    if(
                        navigator.clipboard &&
                        window.isSecureContext
                    ){

                        await navigator
                        .clipboard
                        .writeText(
                            value
                        );

                    }
                    else{

                        throw new Error(
                            "Clipboard fallback"
                        );

                    }


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


                    try{


                        const textarea =
                        document.createElement(
                            "textarea"
                        );


                        textarea.value =
                        value;


                        textarea.style.position =
                        "fixed";


                        textarea.style.left =
                        "-9999px";


                        textarea.style.top =
                        "-9999px";


                        document.body
                        .appendChild(
                            textarea
                        );


                        textarea.focus();

                        textarea.select();


                        document.execCommand(
                            "copy"
                        );


                        textarea.remove();


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
                            "Copy failed:",
                            fallbackError
                        );


                        alert(
                            "Unable to copy. Please copy manually."
                        );

                    }

                }

            }
        );

    }
);


/* =====================================================
   GUEST VIEW
===================================================== */

function showGuestView(){

    currentUser =
    null;


    if(customerEmail){

        customerEmail.textContent =
        "Login to view";

    }


    if(customerUid){

        customerUid.textContent =
        "Login to view";

    }


    if(walletBalance){

        walletBalance.textContent =
        "LOGIN";

    }

}


/* =====================================================
   LOGGED USER VIEW
===================================================== */

function showLoggedUser(
    user
){

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

}


/* =====================================================
   LOAD LIVE WALLET
===================================================== */

async function loadWallet(
    user
){

    if(
        !walletBalance ||
        !user
    ){

        return;

    }


    walletBalance.textContent =
    "... LKR";


    try{


        const token =
        await user
        .getIdToken();


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
            !result ||
            result.success === false
        ){

            throw new Error(
                result?.message ||
                "Unable to load wallet."
            );

        }


        const wallet =
        result.wallet ||
        {};


        const balance =

        wallet.availableBalance

        ??

        wallet.balance

        ??

        0;


        walletBalance.textContent =

        formatMoney(
            balance
        )

        +

        " LKR";


    }
    catch(error){


        console.error(
            "Recharge wallet error:",
            error
        );


        if(currentUser){

            walletBalance.textContent =
            "WALLET";

        }

    }

}


/* =====================================================
   FIREBASE AUTH
===================================================== */

onAuthStateChanged(

    auth,

    async function(user){


        /*
         IMPORTANT:
         Guest must NOT redirect.
        */


        if(!user){

            showGuestView();

            return;

        }


        showLoggedUser(
            user
        );


        hideLoginPopup();


        await loadWallet(
            user
        );

    }

);


/* =====================================================
   WHATSAPP RECEIPT
===================================================== */

if(whatsappButton){

    whatsappButton
    .addEventListener(
        "click",
        function(){


            /*
             GUEST:
             Show login popup.
             Do NOT redirect automatically.
            */

            if(!currentUser){

                showLoginPopup();

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


/* =====================================================
   HEADER WALLET CLICK
===================================================== */

const headerWallet =
document.querySelector(
    ".header-wallet"
);


if(headerWallet){

    headerWallet
    .addEventListener(
        "click",
        function(event){


            /*
             Wallet page itself is public,
             so guest is allowed to open it.
            */

            window.location.href =
            "./wallet.html";


            event.preventDefault();

        }
    );

}


/* =====================================================
   START
===================================================== */

addLoginStyle();

createLoginPopup();
