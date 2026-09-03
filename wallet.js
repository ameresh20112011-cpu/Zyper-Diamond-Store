import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* =====================================================
   WORKER
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


let currentUser = null;


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


/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            window.location.href =
                "./index.html";

            return;
        }


        currentUser =
            user;


        await loadWallet();

        await loadTransactions();

    }
);


/* =====================================================
   GET TOKEN
===================================================== */

async function getToken() {

    if (!currentUser) {

        throw new Error(
            "Login required."
        );

    }


    return await currentUser
        .getIdToken();

}


/* =====================================================
   API
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
                    JSON.stringify(body)

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
            result.wallet;


        walletBalance.textContent =
            Number(
                wallet.balance || 0
            ).toLocaleString(
                "en-LK"
            );


        totalDeposited.textContent =
            "LKR " +
            Number(
                wallet.totalDeposited || 0
            ).toLocaleString(
                "en-LK"
            );


        totalSpent.textContent =
            "LKR " +
            Number(
                wallet.totalSpent || 0
            ).toLocaleString(
                "en-LK"
            );


    }
    catch(error) {

        console.error(
            "Wallet error:",
            error
        );


        walletBalance.textContent =
            "0";


        showMessage(
            error.message,
            "error"
        );

    }

}


/* =====================================================
   REDEEM
===================================================== */

if (redeemButton) {

    redeemButton.addEventListener(
        "click",
        redeemCode
    );

}


async function redeemCode() {

    const code =
        redeemInput.value
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


        await loadWallet();

        await loadTransactions();


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
                event.key === "Enter"
            ) {

                event.preventDefault();

                redeemCode();

            }

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
                redeemInput.value
                    .toUpperCase()
                    .replace(
                        /[^A-Z0-9-]/g,
                        ""
                    );

        }
    );

}


/* =====================================================
   TRANSACTIONS
===================================================== */

async function loadTransactions() {

    if (!transactionsBox) {
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
        transactions.length === 0
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
                type === "DEPOSIT";


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
                    }">

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
   DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


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

    redeemMessage.textContent =
        text;


    redeemMessage.className =
        "redeem-message " +
        type;


    redeemMessage.style.display =
        "block";

}


function hideMessage() {

    redeemMessage.style.display =
        "none";

}


/* =====================================================
   REFRESH
===================================================== */

if (refreshWallet) {

    refreshWallet.addEventListener(
        "click",
        async function() {

            refreshWallet.disabled =
                true;


            await loadWallet();


            refreshWallet.disabled =
                false;

        }
    );

}


if (refreshTransactions) {

    refreshTransactions.addEventListener(
        "click",
        async function() {

            refreshTransactions.disabled =
                true;


            await loadTransactions();


            refreshTransactions.disabled =
                false;

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


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
