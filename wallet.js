/* =========================================================
   ZYPER DIAMOND STORE
   WALLET JS

   GUEST:
   - Full wallet page visible
   - All options visible
   - NO automatic redirect
   - Click wallet actions -> Login to use wallet

   LOGGED USER:
   - Real wallet balance
   - Recharge
   - Redeem
   - Transactions
========================================================= */


import {
    auth
}
from "./firebase.js?v=10000";


import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



/* =====================================================
   WORKER
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


let currentUser =
    null;



/* =====================================================
   ELEMENTS
===================================================== */

const walletBalance =
    document.getElementById(
        "walletBalance"
    );


const totalDeposited =
    document.getElementById(
        "totalDeposited"
    );


const totalSpent =
    document.getElementById(
        "totalSpent"
    );


const redeemInput =
    document.getElementById(
        "redeemCode"
    );


const redeemButton =
    document.getElementById(
        "redeemButton"
    );


const redeemMessage =
    document.getElementById(
        "redeemMessage"
    );


const transactionsBox =
    document.getElementById(
        "transactions"
    );


const refreshWallet =
    document.getElementById(
        "refreshWallet"
    );


const refreshTransactions =
    document.getElementById(
        "refreshTransactions"
    );


const rechargeButton =
    document.getElementById(
        "rechargeWalletButton"
    )
    ||
    document.querySelector(
        ".wallet-recharge-button"
    );



/* =====================================================
   GUEST LOGIN UI STYLE
===================================================== */

function addGuestStyle() {

    if (
        document.getElementById(
            "zyperWalletGuestStyle"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zyperWalletGuestStyle";


    style.textContent = `

/* =========================================
   LOGIN REQUIRED MESSAGE
========================================= */

.zyper-wallet-login-box{

    width:100%;

    margin:0 0 18px;

    padding:17px;

    border-radius:16px;

    text-align:center;

    background:
    linear-gradient(
        135deg,
        rgba(37,99,235,.14),
        rgba(124,58,237,.14)
    );

    border:
    1px solid
    rgba(96,165,250,.25);

    box-shadow:
    0 8px 25px
    rgba(0,0,0,.18);

}


.zyper-wallet-login-box
.login-icon{

    font-size:24px;

    margin-bottom:7px;

}


.zyper-wallet-login-box
.login-title{

    color:#ffffff;

    font-size:15px;

    font-weight:700;

}


.zyper-wallet-login-box
.login-text{

    margin-top:5px;

    color:#94a3b8;

    font-size:11px;

}


.zyper-wallet-login-box
.login-button{

    min-width:120px;

    margin-top:12px;

    padding:10px 18px;

    display:inline-block;

    border-radius:10px;

    color:#ffffff;

    text-decoration:none;

    font-size:12px;

    font-weight:700;

    background:
    linear-gradient(
        135deg,
        #2563eb,
        #7c3aed
    );

}


/* =========================================
   POPUP
========================================= */

#zyperWalletLoginModal{

    position:fixed;

    inset:0;

    padding:20px;

    display:none;

    align-items:center;

    justify-content:center;

    background:
    rgba(2,6,23,.72);

    backdrop-filter:
    blur(8px);

    -webkit-backdrop-filter:
    blur(8px);

    z-index:2147483640;

}


#zyperWalletLoginModal.show{

    display:flex;

}


.zyper-wallet-modal-card{

    width:100%;

    max-width:360px;

    padding:25px 20px;

    text-align:center;

    border-radius:22px;

    color:#ffffff;

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
    rgba(0,0,0,.45);

}


.zyper-wallet-modal-icon{

    width:55px;

    height:55px;

    margin:0 auto 14px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:17px;

    font-size:26px;

    background:
    rgba(124,58,237,.18);

}


.zyper-wallet-modal-card h3{

    margin:0;

    font-size:20px;

}


.zyper-wallet-modal-card p{

    margin:
    9px 0 18px;

    color:#94a3b8;

    font-size:12px;

    line-height:1.6;

}


.zyper-wallet-modal-login{

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


.zyper-wallet-modal-cancel{

    width:100%;

    min-height:42px;

    margin-top:9px;

    border:
    1px solid
    rgba(255,255,255,.10);

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
   CREATE LOGIN MODAL
===================================================== */

function createLoginModal() {

    if (
        document.getElementById(
            "zyperWalletLoginModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "zyperWalletLoginModal";


    modal.innerHTML = `

<div class="zyper-wallet-modal-card">

    <div class="zyper-wallet-modal-icon">
        🔐
    </div>

    <h3>
        Login Required
    </h3>

    <p>
        Please login to use your
        Zyper Wallet.
    </p>

    <a
    href="./index.html"
    class="zyper-wallet-modal-login"
    >
        LOGIN
    </a>

    <button
    type="button"
    class="zyper-wallet-modal-cancel"
    id="zyperWalletModalCancel"
    >
        Continue Browsing
    </button>

</div>

    `;


    document.body.appendChild(
        modal
    );


    const cancel =
        document.getElementById(
            "zyperWalletModalCancel"
        );


    if (cancel) {

        cancel.addEventListener(
            "click",
            hideLoginPopup
        );

    }


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                hideLoginPopup();

            }

        }
    );

}



/* =====================================================
   SHOW LOGIN POPUP
===================================================== */

function showLoginPopup() {

    createLoginModal();


    const modal =
        document.getElementById(
            "zyperWalletLoginModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}



/* =====================================================
   HIDE LOGIN POPUP
===================================================== */

function hideLoginPopup() {

    const modal =
        document.getElementById(
            "zyperWalletLoginModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}



/* =====================================================
   CREATE GUEST NOTICE
===================================================== */

function showGuestNotice() {

    const walletPage =
        document.querySelector(
            ".wallet-page"
        );


    if (!walletPage) {
        return;
    }


    if (
        document.getElementById(
            "zyperWalletGuestNotice"
        )
    ) {
        return;
    }


    const notice =
        document.createElement(
            "div"
        );


    notice.id =
        "zyperWalletGuestNotice";


    notice.className =
        "zyper-wallet-login-box";


    notice.innerHTML = `

<div class="login-icon">
    🔐
</div>

<div class="login-title">
    Login to use Zyper Wallet
</div>

<div class="login-text">
    You can view all wallet options.
    Login is required to use them.
</div>

<a
href="./index.html"
class="login-button"
>
    LOGIN
</a>

    `;


    /*
       Keep whole wallet page visible.
       Just place login notice near the top.
    */

    const firstSection =
        walletPage.querySelector(
            ".balance-card"
        );


    if (firstSection) {

        walletPage.insertBefore(
            notice,
            firstSection
        );

    }
    else {

        walletPage.prepend(
            notice
        );

    }

}



/* =====================================================
   REMOVE GUEST NOTICE AFTER LOGIN
===================================================== */

function removeGuestNotice() {

    const notice =
        document.getElementById(
            "zyperWalletGuestNotice"
        );


    if (notice) {

        notice.remove();

    }


    hideLoginPopup();

}



/* =====================================================
   SHOW GUEST WALLET STATE
===================================================== */

function showGuestWallet() {

    /*
       IMPORTANT:
       DO NOT hide wallet page.
       DO NOT redirect.
    */

    currentUser =
        null;


    if (walletBalance) {

        walletBalance.textContent =
            "--";

    }


    if (totalDeposited) {

        totalDeposited.textContent =
            "LKR --";

    }


    if (totalSpent) {

        totalSpent.textContent =
            "LKR --";

    }


    if (transactionsBox) {

        transactionsBox.innerHTML = `

<div class="empty">

    🔐 Login to view your
    wallet history.

</div>

        `;

    }


    if (redeemMessage) {

        redeemMessage.style.display =
            "none";

    }


    /*
       Do NOT disable buttons.
       User can see/click them.
       Clicking will show Login popup.
    */

    if (redeemInput) {

        redeemInput.disabled =
            false;

    }


    if (redeemButton) {

        redeemButton.disabled =
            false;

        redeemButton.textContent =
            "Redeem";

    }


    if (refreshWallet) {

        refreshWallet.disabled =
            false;

    }


    if (refreshTransactions) {

        refreshTransactions.disabled =
            false;

    }


    showGuestNotice();

}



/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(

    auth,

    async function(user) {


        if (!user) {

            showGuestWallet();

            return;

        }


        currentUser =
            user;


        removeGuestNotice();


        if (redeemInput) {

            redeemInput.disabled =
                false;

        }


        if (redeemButton) {

            redeemButton.disabled =
                false;

        }


        await Promise.all([

            loadWallet(),

            loadTransactions()

        ]);

    }

);



/* =====================================================
   GET TOKEN
===================================================== */

async function getToken() {

    if (!currentUser) {

        showLoginPopup();

        throw new Error(
            "Login required."
        );

    }


    return await currentUser
        .getIdToken();

}



/* =====================================================
   WORKER REQUEST
===================================================== */

async function workerRequest(
    body
) {

    const token =
        await getToken();


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
                        body
                    )

            }

        );


    let result;


    try {

        result =
            await response.json();

    }
    catch {

        throw new Error(
            "Invalid server response."
        );

    }


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            "Server request failed."
        );

    }


    return result;

}



/* =====================================================
   LOAD WALLET
===================================================== */

async function loadWallet() {

    if (!currentUser) {

        showLoginPopup();

        return;

    }


    if (walletBalance) {

        walletBalance.textContent =
            "...";

    }


    try {


        const result =
            await workerRequest({

                action:
                    "wallet_balance"

            });


        const wallet =
            result.wallet || {};


        const availableBalance =

            wallet.availableBalance

            ??

            wallet.balance

            ??

            0;


        if (walletBalance) {

            walletBalance.textContent =
                Number(
                    availableBalance
                ).toLocaleString(
                    "en-LK"
                );

        }


        if (totalDeposited) {

            totalDeposited.textContent =
                "LKR " +
                Number(
                    wallet.totalDeposited || 0
                ).toLocaleString(
                    "en-LK"
                );

        }


        if (totalSpent) {

            totalSpent.textContent =
                "LKR " +
                Number(
                    wallet.totalSpent || 0
                ).toLocaleString(
                    "en-LK"
                );

        }


    }
    catch(error) {


        console.error(
            "Wallet error:",
            error
        );


        if (!currentUser) {
            return;
        }


        if (walletBalance) {

            walletBalance.textContent =
                "--";

        }


        showMessage(
            error.message,
            "error"
        );

    }

}



/* =====================================================
   REDEEM BUTTON
===================================================== */

if (redeemButton) {

    redeemButton.addEventListener(

        "click",

        function() {


            if (!currentUser) {

                showLoginPopup();

                return;

            }


            redeemCode();

        }

    );

}



/* =====================================================
   REDEEM CODE
===================================================== */

async function redeemCode() {

    if (!currentUser) {

        showLoginPopup();

        return;

    }


    const code =
        redeemInput
            .value
            .trim()
            .toUpperCase();


    if (!code) {

        showMessage(
            "Please enter your redeem code.",
            "error"
        );

        return;

    }


    if (
        !/^ZYPER-[A-Z0-9]{4}-[A-Z0-9]{4}$/
        .test(code)
    ) {

        showMessage(
            "Invalid Zyper redeem code format.",
            "error"
        );

        return;

    }


    redeemButton.disabled =
        true;


    redeemButton.textContent =
        "Redeeming...";


    hideMessage();


    try {


        const result =
            await workerRequest({

                action:
                    "redeem_code",

                code:
                    code

            });


        showMessage(

            `✅ LKR ${Number(
                result.amount
            ).toLocaleString(
                "en-LK"
            )} added to your wallet successfully.`,

            "success"

        );


        redeemInput.value =
            "";


        await Promise.all([

            loadWallet(),

            loadTransactions()

        ]);


    }
    catch(error) {


        console.error(
            "Redeem error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );

    }
    finally {


        redeemButton.disabled =
            false;


        redeemButton.textContent =
            "Redeem";

    }

}



/* =====================================================
   ENTER KEY
===================================================== */

if (redeemInput) {

    redeemInput.addEventListener(

        "keydown",

        function(event) {


            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            event.preventDefault();


            if (!currentUser) {

                showLoginPopup();

                return;

            }


            redeemCode();

        }

    );

}



/* =====================================================
   AUTO FORMAT
===================================================== */

if (redeemInput) {

    redeemInput.addEventListener(

        "input",

        function() {


            redeemInput.value =

                redeemInput
                    .value
                    .toUpperCase()
                    .replace(
                        /[^A-Z0-9-]/g,
                        ""
                    );

        }

    );

}



/* =====================================================
   RECHARGE WALLET
===================================================== */

if (rechargeButton) {

    rechargeButton.addEventListener(

        "click",

        function(event) {


            if (!currentUser) {

                event.preventDefault();

                showLoginPopup();

            }

        }

    );

}



/* =====================================================
   LOAD TRANSACTIONS
===================================================== */

async function loadTransactions() {

    if (!transactionsBox) {

        return;

    }


    if (!currentUser) {

        transactionsBox.innerHTML = `

<div class="empty">

    🔐 Login to view your
    wallet history.

</div>

        `;

        return;

    }


    transactionsBox.innerHTML = `

<div class="loading">
    Loading transactions...
</div>

    `;


    try {


        const result =
            await workerRequest({

                action:
                    "wallet_transactions"

            });


        const transactions =
            result.transactions ||
            [];


        renderTransactions(
            transactions
        );


    }
    catch(error) {


        console.error(
            "Transactions error:",
            error
        );


        transactionsBox.innerHTML = `

<div class="empty">

    Unable to load wallet history.

</div>

        `;

    }

}



/* =====================================================
   RENDER TRANSACTIONS
===================================================== */

function renderTransactions(
    transactions
) {

    transactionsBox.innerHTML =
        "";


    if (
        transactions.length ===
        0
    ) {

        transactionsBox.innerHTML = `

<div class="empty">

    No wallet transactions yet.

</div>

        `;

        return;

    }


    transactions.forEach(

        function(transaction) {


            const type =
                String(
                    transaction.type ||
                    ""
                ).toUpperCase();


            const amount =
                Number(
                    transaction.amount ||
                    0
                );


            const isDeposit =
                type ===
                "DEPOSIT";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction";


            const date =
                formatDate(
                    transaction.createdAt
                );


            const code =
                transaction.redeemCode ||
                "";


            item.innerHTML = `

<div class="transaction-left">

    <div class="transaction-icon">

        ${
            isDeposit
            ? "💰"
            : "🛒"
        }

    </div>


    <div>

        <div class="transaction-title">

            ${
                isDeposit
                ? "Wallet Top Up"
                : "Wallet Payment"
            }

        </div>


        <div class="transaction-date">

            ${escapeHTML(date)}

        </div>


        ${
            code
            ?

            `<div class="transaction-code">
                ${escapeHTML(code)}
            </div>`

            :

            ""
        }

    </div>

</div>


<div
class="transaction-amount ${
    isDeposit
    ? "deposit"
    : "spend"
}"
>

    ${
        isDeposit
        ? "+"
        : "-"
    }

    LKR
    ${amount.toLocaleString("en-LK")}

</div>

            `;


            transactionsBox.appendChild(
                item
            );

        }

    );

}



/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    let date;


    /*
       Firestore timestamp support
    */

    if (
        typeof value ===
        "object"
        &&
        value.seconds
    ) {

        date =
            new Date(
                Number(
                    value.seconds
                ) * 1000
            );

    }
    else {

        date =
            new Date(
                value
            );

    }


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(

        "en-LK",

        {

            year:
                "numeric",

            month:
                "short",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }

    );

}



/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    text,
    type
) {

    if (!redeemMessage) {
        return;
    }


    redeemMessage.textContent =
        text;


    redeemMessage.className =
        "redeem-message " +
        type;


    redeemMessage.style.display =
        "block";

}



/* =====================================================
   HIDE MESSAGE
===================================================== */

function hideMessage() {

    if (!redeemMessage) {
        return;
    }


    redeemMessage.style.display =
        "none";

}



/* =====================================================
   REFRESH WALLET
===================================================== */

if (refreshWallet) {

    refreshWallet.addEventListener(

        "click",

        async function() {


            if (!currentUser) {

                showLoginPopup();

                return;

            }


            refreshWallet.disabled =
                true;


            try {

                await loadWallet();

            }
            finally {

                refreshWallet.disabled =
                    false;

            }

        }

    );

}



/* =====================================================
   REFRESH TRANSACTIONS
===================================================== */

if (refreshTransactions) {

    refreshTransactions.addEventListener(

        "click",

        async function() {


            if (!currentUser) {

                showLoginPopup();

                return;

            }


            refreshTransactions.disabled =
                true;


            try {

                await loadTransactions();

            }
            finally {

                refreshTransactions.disabled =
                    false;

            }

        }

    );

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}



/* =====================================================
   START GUEST UI SUPPORT
===================================================== */

addGuestStyle();

createLoginModal();
