import {
    auth,
    db
} from "./firebase.js";


import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =====================================================
   SETTINGS
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";

let allOrders = [];
let selectedDate = "";


/* =====================================================
   ADMIN CHECK
===================================================== */

async function checkAdmin(user) {

    if (!user) {
        return false;
    }

    try {

        const adminDoc =
            await getDoc(
                doc(
                    db,
                    "users",
                    user.uid
                )
            );

        if (!adminDoc.exists()) {
            return false;
        }

        return (
            adminDoc.data().role === "admin"
        );

    }
    catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        return false;
    }
}


/* =====================================================
   ADMIN LOGIN
===================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const emailInput =
                document.getElementById(
                    "email"
                );

            const passwordInput =
                document.getElementById(
                    "password"
                );

            const msg =
                document.getElementById(
                    "msg"
                );

            const button =
                document.getElementById(
                    "login"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {
                return;
            }


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                if (msg) {
                    msg.textContent =
                        "Enter email and password.";
                }

                return;
            }


            if (button) {

                button.disabled = true;

                button.textContent =
                    "LOGIN...";
            }


            if (msg) {

                msg.textContent =
                    "Checking admin account...";
            }


            try {

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const admin =
                    await checkAdmin(
                        result.user
                    );


                if (!admin) {

                    await signOut(
                        auth
                    );

                    if (msg) {

                        msg.textContent =
                            "❌ You are not an admin.";
                    }

                    if (button) {

                        button.disabled =
                            false;

                        button.textContent =
                            "LOGIN";
                    }

                    return;
                }


                if (msg) {

                    msg.textContent =
                        "✅ Login successful...";
                }


                window.location.href =
                    "./admin-dashboard.html";

            }
            catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                if (msg) {

                    let message =
                        error.message ||
                        "Login failed.";


                    if (
                        error.code ===
                        "auth/invalid-credential"
                    ) {

                        message =
                            "❌ Incorrect email or password.";
                    }


                    if (
                        error.code ===
                        "auth/user-not-found"
                    ) {

                        message =
                            "❌ Admin account not found.";
                    }


                    if (
                        error.code ===
                        "auth/wrong-password"
                    ) {

                        message =
                            "❌ Incorrect password.";
                    }


                    if (
                        error.code ===
                        "auth/too-many-requests"
                    ) {

                        message =
                            "❌ Too many login attempts. Please try again later.";
                    }


                    msg.textContent =
                        message;
                }


                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        "LOGIN";
                }
            }
        }
    );
}


/* =====================================================
   DASHBOARD AUTH
===================================================== */

const orderTable =
    document.getElementById(
        "orders"
    );


if (orderTable) {

    onAuthStateChanged(
        auth,
        async function (user) {

            if (!user) {

                window.location.href =
                    "./admin-login.html";

                return;
            }


            const admin =
                await checkAdmin(
                    user
                );


            if (!admin) {

                await signOut(
                    auth
                );

                window.location.href =
                    "./admin-login.html";

                return;
            }


            const app =
                document.getElementById(
                    "app"
                );


            if (app) {

                app.style.display =
                    "block";
            }


            const dateInput =
                document.getElementById(
                    "orderDate"
                );


            selectedDate =
                getTodayString();


            if (dateInput) {

                dateInput.value =
                    selectedDate;
            }


            await loadOrders();
        }
    );
}


/* =====================================================
   TODAY STRING
===================================================== */

function getTodayString() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );
}


/* =====================================================
   CONVERT DATE
===================================================== */

function convertToDate(value) {

    if (!value) {
        return null;
    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();
    }


    if (
        value instanceof Date
    ) {

        return value;
    }


    if (
        value.seconds !==
        undefined
    ) {

        return new Date(
            Number(
                value.seconds
            ) * 1000
        );
    }


    const date =
        new Date(
            value
        );


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return date;
    }


    return null;
}


/* =====================================================
   GET DATE STRING
===================================================== */

function getDateString(value) {

    const date =
        convertToDate(
            value
        );


    if (!date) {
        return "";
    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(timestamp) {

    const date =
        convertToDate(
            timestamp
        );


    if (!date) {
        return "-";
    }


    const hour =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minute =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${hour}:${minute} , ${year}/${month}/${day}`
    );
}


/* =====================================================
   SORT TIME
===================================================== */

function getTime(timestamp) {

    const date =
        convertToDate(
            timestamp
        );


    if (!date) {
        return 0;
    }


    return date.getTime();
}


/* =====================================================
   NORMALIZE STATUS
===================================================== */

function normalizeStatus(value) {

    const status =
        String(
            value || ""
        )
            .trim()
            .toLowerCase();


    if (
        status === "success" ||
        status === "successful" ||
        status === "completed"
    ) {

        return "success";
    }


    if (
        status === "failed" ||
        status === "failure" ||
        status === "rejected"
    ) {

        return "failed";
    }


    if (
        status === "pending review" ||
        status === "pending_review" ||
        status === "review"
    ) {

        return "pending review";
    }


    if (
        status === "processing"
    ) {

        return "processing";
    }


    if (
        status === "pending"
    ) {

        return "pending";
    }


    return status;
}


/* =====================================================
   NORMALIZE WALLET STATE
===================================================== */

function normalizeWalletState(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
}


/* =====================================================
   LOAD ORDERS
===================================================== */

async function loadOrders() {

    const table =
        document.getElementById(
            "orders"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>
            <td colspan="16">
                Loading orders...
            </td>
        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        allOrders = [];


        snapshot.forEach(
            function (item) {

                allOrders.push({

                    id:
                        item.id,

                    data:
                        item.data()
                });
            }
        );


        allOrders.sort(
            function (a, b) {

                return (
                    getTime(
                        b.data.createdAt
                    )
                    -
                    getTime(
                        a.data.createdAt
                    )
                );
            }
        );


        filterOrders();

    }
    catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        table.innerHTML = `

            <tr>
                <td colspan="16">
                    ❌ Failed to load orders
                </td>
            </tr>

        `;
    }
}


/* =====================================================
   FILTER ORDERS
===================================================== */

function filterOrders() {

    const dateInput =
        document.getElementById(
            "orderDate"
        );


    if (!dateInput) {
        return;
    }


    selectedDate =
        dateInput.value;


    if (!selectedDate) {

        renderOrders(
            []
        );

        return;
    }


    const filtered =
        allOrders.filter(
            function (item) {

                return (
                    getDateString(
                        item.data.createdAt
                    )
                    ===
                    selectedDate
                );
            }
        );


    renderOrders(
        filtered
    );
}


/* =====================================================
   GET VERIFIED FF NAME
===================================================== */

function getVerifiedFFName(order) {

    const source =
        String(
            order.playerNameSource || ""
        )
            .trim()
            .toLowerCase();


    if (
        order.verifiedFFName
    ) {

        return String(
            order.verifiedFFName
        );
    }


    if (
        order.verifiedPlayerName
    ) {

        return String(
            order.verifiedPlayerName
        );
    }


    if (
        order.providerPlayerName
    ) {

        return String(
            order.providerPlayerName
        );
    }


    if (
        source === "provider" &&
        order.playerName
    ) {

        return String(
            order.playerName
        );
    }


    if (order.ffName) {

        return String(
            order.ffName
        );
    }


    return "-";
}


/* =====================================================
   BUILD ORDER ACTION
===================================================== */

function buildOrderAction(
    order,
    orderId,
    amount
) {

    const status =
        normalizeStatus(
            order.status
        );


    const walletState =
        normalizeWalletState(
            order.walletState
        );


    const heldAmount =
        Number(
            order.heldAmount ??
            amount ??
            0
        );


    /* =================================================
       LATE SUCCESS AFTER RELEASE
    ================================================= */

    const lateSuccess =
        order.lateSuccessAfterRelease ===
        true
        ||
        (
            status === "success"
            &&
            walletState === "released"
        );


    if (lateSuccess) {

        return `

            <span
                class="
                    order-action-state
                    review-required
                "
            >
                ⚠ REVIEW
            </span>

        `;
    }


    /* =================================================
       SUCCESS
    ================================================= */

    if (
        status ===
        "success"
    ) {

        return `

            <span
                class="
                    order-action-state
                    order-completed
                "
            >
                ✓ COMPLETED
            </span>

        `;
    }


    /* =================================================
       RELEASED
    ================================================= */

    if (
        walletState ===
        "released"
    ) {

        return `

            <span
                class="
                    order-action-state
                    money-released
                "
            >
                ✓ MONEY RELEASED
            </span>

        `;
    }


    /* =================================================
       FAILED / REVIEW + HELD
    ================================================= */

    if (
        walletState ===
        "held"
        &&
        (
            status ===
            "failed"
            ||
            status ===
            "pending review"
        )
    ) {

        return `

            <button
                type="button"
                class="release-money-btn"
                data-order-id="${escapeHTML(orderId)}"
                data-amount="${heldAmount}"
            >
                🔓 RELEASE MONEY
            </button>

        `;
    }


    /* =================================================
       PROCESSING + HELD
    ================================================= */

    if (
        walletState ===
        "held"
    ) {

        return `

            <span
                class="
                    order-action-state
                    money-held
                "
            >
                🔒 MONEY HELD
            </span>

        `;
    }


    return `

        <span
            class="
                order-action-state
                no-action
            "
        >
            —
        </span>

    `;
}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(orders) {

    const table =
        document.getElementById(
            "orders"
        );


    if (!table) {
        return;
    }


    let total = 0;
    let revenue = 0;
    let pending = 0;
    let success = 0;


    table.innerHTML =
        "";


    if (
        orders.length ===
        0
    ) {

        table.innerHTML = `

            <tr>

                <td colspan="16">
                    No orders found
                </td>

            </tr>

        `;


        updateCards(
            0,
            0,
            0,
            0
        );

        return;
    }


    orders.forEach(
        function (item) {

            const order =
                item.data;


            /* -----------------------------------------
               ORDER ID
            ----------------------------------------- */

            const orderId =

                order.orderId
                ||
                order.orderID
                ||
                order.orderNumber
                ||
                item.id;


            /* -----------------------------------------
               CUSTOMER
            ----------------------------------------- */

            const customer =

                order.customerName
                ||
                order.name
                ||
                "-";


            /* -----------------------------------------
               FIREBASE UID
            ----------------------------------------- */

            const firebaseUID =

                order.userId
                ||
                order.uid
                ||
                "-";


            /* -----------------------------------------
               GAME UID
            ----------------------------------------- */

            const gameUID =

                order.gameUID
                ||
                order.gameUid
                ||
                order.gameId
                ||
                "-";


            /* -----------------------------------------
               VERIFIED FF NAME
            ----------------------------------------- */

            const verifiedFFName =
                getVerifiedFFName(
                    order
                );


            /* -----------------------------------------
               PRODUCT
            ----------------------------------------- */

            const product =

                order.productName
                ||
                order.product
                ||
                order.package
                ||
                order.plan
                ||
                "-";


            /* -----------------------------------------
               QUANTITY
            ----------------------------------------- */

            let quantity =
                Number(
                    order.quantity ??
                    order.qty ??
                    1
                );


            if (
                !Number.isFinite(quantity)
                ||
                quantity < 1
            ) {

                quantity = 1;
            }


            quantity =
                Math.floor(
                    quantity
                );


            /* -----------------------------------------
               UNIT PRICE
            ----------------------------------------- */

            let unitPrice =
                Number(
                    order.unitPrice ??
                    order.productPrice ??
                    order.price ??
                    0
                );


            /* -----------------------------------------
               TOTAL
            ----------------------------------------- */

            let totalAmount =
                Number(
                    order.total ??
                    order.amount ??
                    0
                );


            if (
                (
                    !Number.isFinite(totalAmount)
                    ||
                    totalAmount <= 0
                )
                &&
                Number.isFinite(unitPrice)
                &&
                unitPrice > 0
            ) {

                totalAmount =
                    unitPrice *
                    quantity;
            }


            if (
                (
                    !Number.isFinite(unitPrice)
                    ||
                    unitPrice <= 0
                )
                &&
                Number.isFinite(totalAmount)
                &&
                totalAmount > 0
                &&
                quantity > 0
            ) {

                unitPrice =
                    totalAmount /
                    quantity;
            }


            if (
                !Number.isFinite(unitPrice)
            ) {

                unitPrice = 0;
            }


            if (
                !Number.isFinite(totalAmount)
            ) {

                totalAmount = 0;
            }


            /* -----------------------------------------
               PAYMENT
            ----------------------------------------- */

            const payment =

                order.paymentMethod
                ||
                order.payment
                ||
                "Wallet";


            /* -----------------------------------------
               ORDERED DATE
            ----------------------------------------- */

            const orderedDate =
                formatDate(
                    order.createdAt
                );


            /* -----------------------------------------
               COMPLETED DATE
            ----------------------------------------- */

            const completedDate =
                formatDate(
                    order.completedAt
                    ||
                    order.providerSuccessAt
                    ||
                    order.completedTime
                    ||
                    order.successAt
                );


            /* -----------------------------------------
               STATUS
            ----------------------------------------- */

            const rawStatus =
                order.status ||
                "Pending";


            const status =
                normalizeStatus(
                    rawStatus
                );


            /* -----------------------------------------
               WALLET
            ----------------------------------------- */

            const walletState =
                normalizeWalletState(
                    order.walletState
                );


            /* -----------------------------------------
               PROVIDER
            ----------------------------------------- */

            const providerStatus =
                String(
                    order.providerStatus ||
                    "-"
                )
                    .trim();


            /* -----------------------------------------
               COUNTERS
            ----------------------------------------- */

            total++;


            if (
                status === "pending"
                ||
                status === "processing"
                ||
                status === "pending review"
            ) {

                pending++;
            }


            if (
                status === "success"
            ) {

                success++;


                /*
                 Revenue only counts orders where
                 wallet money was actually deducted.

                 Late success after released money
                 must NOT count as revenue.
                */

                if (
                    walletState ===
                    "deducted"
                ) {

                    revenue +=
                        totalAmount;
                }
            }


            /* -----------------------------------------
               STATUS CLASS
            ----------------------------------------- */

            let statusClass =
                "state-neutral";


            if (
                status === "processing"
                ||
                status === "pending"
            ) {

                statusClass =
                    "state-processing";
            }


            if (
                status === "pending review"
            ) {

                statusClass =
                    "state-review";
            }


            if (
                status === "failed"
            ) {

                statusClass =
                    "state-failed";
            }


            if (
                status === "success"
            ) {

                statusClass =
                    "state-success";
            }


            /* -----------------------------------------
               WALLET CLASS
            ----------------------------------------- */

            let walletClass =
                "state-neutral";


            if (
                walletState ===
                "held"
            ) {

                walletClass =
                    "state-processing";
            }


            if (
                walletState ===
                "deducted"
            ) {

                walletClass =
                    "state-success";
            }


            if (
                walletState ===
                "released"
            ) {

                walletClass =
                    "state-review";
            }


            /* -----------------------------------------
               PROVIDER CLASS
            ----------------------------------------- */

            const providerLower =
                providerStatus
                    .toLowerCase();


            let providerClass =
                "state-neutral";


            if (
                providerLower.includes(
                    "process"
                )
                ||
                providerLower.includes(
                    "pending"
                )
            ) {

                providerClass =
                    "state-processing";
            }


            if (
                providerLower.includes(
                    "success"
                )
                ||
                providerLower.includes(
                    "completed"
                )
            ) {

                providerClass =
                    "state-success";
            }


            if (
                providerLower.includes(
                    "fail"
                )
                ||
                providerLower.includes(
                    "error"
                )
            ) {

                providerClass =
                    "state-failed";
            }


            if (
                providerLower.includes(
                    "review"
                )
                ||
                providerLower.includes(
                    "unknown"
                )
            ) {

                providerClass =
                    "state-review";
            }


            /* -----------------------------------------
               ACTION
            ----------------------------------------- */

            const actionHTML =
                buildOrderAction(
                    order,
                    orderId,
                    totalAmount
                );


            /* -----------------------------------------
               ROW
            ----------------------------------------- */

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(orderId)}
                    </strong>

                </td>


                <td>

                    ${escapeHTML(customer)}

                </td>


                <td>

                    ${escapeHTML(firebaseUID)}

                </td>


                <td>

                    ${escapeHTML(gameUID)}

                </td>


                <td>

                    <span class="ff-name-verified">

                        ${escapeHTML(
                            verifiedFFName
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHTML(product)}

                </td>


                <td>

                    <span class="qty-badge">

                        ${escapeHTML(
                            quantity
                        )}

                    </span>

                </td>


                <td>

                    Rs.
                    ${Number(
                        unitPrice
                    ).toLocaleString(
                        "en-LK"
                    )}

                </td>


                <td>

                    <strong>

                        Rs.
                        ${Number(
                            totalAmount
                        ).toLocaleString(
                            "en-LK"
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(payment)}

                </td>


                <td>

                    ${escapeHTML(
                        orderedDate
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        completedDate
                    )}

                </td>


                <td>

                    <span
                        class="
                            admin-state-badge
                            ${statusClass}
                        "
                    >

                        ${escapeHTML(
                            rawStatus
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="
                            admin-state-badge
                            ${walletClass}
                        "
                    >

                        ${
                            walletState
                            ?
                            escapeHTML(
                                walletState.toUpperCase()
                            )
                            :
                            "-"
                        }

                    </span>

                </td>


                <td>

                    <span
                        class="
                            admin-state-badge
                            ${providerClass}
                        "
                    >

                        ${escapeHTML(
                            providerStatus
                        )}

                    </span>

                </td>


                <td>

                    ${actionHTML}

                </td>

            `;


            table.appendChild(
                row
            );
        }
    );


    updateCards(
        total,
        revenue,
        pending,
        success
    );


    /* =================================================
       RELEASE MONEY BUTTON EVENTS
    ================================================= */

    table
        .querySelectorAll(
            ".release-money-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const orderId =
                            String(
                                button.dataset.orderId ||
                                ""
                            )
                                .trim();


                        const amount =
                            Number(
                                button.dataset.amount ||
                                0
                            );


                        await releaseOrderMoney(
                            orderId,
                            amount,
                            button
                        );
                    }
                );
            }
        );
}


/* =====================================================
   UPDATE DASHBOARD CARDS
===================================================== */

function updateCards(
    total,
    revenue,
    pending,
    success
) {

    const totalElement =
        document.getElementById(
            "totalOrders"
        );

    const revenueElement =
        document.getElementById(
            "revenue"
        );

    const pendingElement =
        document.getElementById(
            "pendingOrders"
        );

    const successElement =
        document.getElementById(
            "successOrders"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (revenueElement) {

        revenueElement.textContent =
            Number(
                revenue
            ).toLocaleString(
                "en-LK"
            );
    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;
    }


    if (successElement) {

        successElement.textContent =
            success;
    }
}


/* =====================================================
   GET ADMIN SECRET FROM VISIBLE BOX
===================================================== */

function getAdminSecret() {

    const secretInput =
        document.getElementById(
            "adminSecret"
        );


    if (!secretInput) {

        alert(
            "Admin Secret Key box not found."
        );

        return "";
    }


    const secret =
        secretInput.value
            .trim();


    if (!secret) {

        alert(
            "Please enter your Admin Secret Key first."
        );

        secretInput.focus();

        return "";
    }


    return secret;
}


/* =====================================================
   WORKER REQUEST
===================================================== */

async function workerRequest(
    body,
    requireAdminSecret = false
) {

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "Admin login required."
        );
    }


    const admin =
        await checkAdmin(
            user
        );


    if (!admin) {

        throw new Error(
            "Access denied."
        );
    }


    const token =
        await user.getIdToken(
            true
        );


    const headers = {

        "Content-Type":
            "application/json",

        "Authorization":
            "Bearer " +
            token
    };


    if (requireAdminSecret) {

        const secret =
            getAdminSecret();


        if (!secret) {

            throw new Error(
                "Admin Secret Key is required."
            );
        }


        headers["X-Admin-Key"] =
            secret;
    }


    const response =
        await fetch(
            WORKER_URL,
            {

                method:
                    "POST",

                headers:
                    headers,

                body:
                    JSON.stringify(
                        body
                    )
            }
        );


    let data = null;


    try {

        data =
            await response.json();
    }
    catch {

        data = null;
    }


    if (
        !response.ok
        ||
        !data
        ||
        data.success === false
    ) {

        throw new Error(

            data?.message
            ||
            `Server error (${response.status})`

        );
    }


    return data;
}


/* =====================================================
   RELEASE ORDER MONEY
===================================================== */

async function releaseOrderMoney(
    orderId,
    amount,
    button
) {

    if (!orderId) {

        alert(
            "Order ID missing."
        );

        return;
    }


    const formattedAmount =
        Number(
            amount || 0
        ).toLocaleString(
            "en-LK"
        );


    const confirmed =
        confirm(

            `Release LKR ${formattedAmount} back to this customer's wallet?`

        );


    if (!confirmed) {
        return;
    }


    /*
     Use the SAME visible Admin Secret box.
     No second secret prompt.
    */

    const secret =
        getAdminSecret();


    if (!secret) {
        return;
    }


    const originalText =
        button
            ?
            button.textContent
            :
            "";


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ RELEASING...";
    }


    try {

        const data =
            await workerRequest(
                {

                    action:
                        "release_order_hold",

                    orderId:
                        orderId

                },
                true
            );


        if (
            data.alreadyReleased
        ) {

            alert(
                "✓ Money was already released."
            );
        }
        else {

            alert(

                `✓ LKR ${formattedAmount} released back to the customer's wallet.`

            );
        }


        await loadOrders();

    }
    catch (error) {

        console.error(
            "Release money error:",
            error
        );


        alert(

            error.message
            ||
            "Failed to release money."

        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                originalText;
        }
    }
}


/* =====================================================
   DATE SEARCH
===================================================== */

const dateSearch =
    document.getElementById(
        "dateSearch"
    );


if (dateSearch) {

    dateSearch.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "orderDate"
                );


            if (
                !input ||
                !input.value
            ) {

                alert(
                    "Please select a date."
                );

                return;
            }


            selectedDate =
                input.value;


            filterOrders();
        }
    );
}


/* =====================================================
   DATE CHANGE
===================================================== */

const orderDate =
    document.getElementById(
        "orderDate"
    );


if (orderDate) {

    orderDate.addEventListener(
        "change",
        function () {

            selectedDate =
                orderDate.value;


            filterOrders();
        }
    );
}


/* =====================================================
   TODAY BUTTON
===================================================== */

const todayButton =
    document.getElementById(
        "todayButton"
    );


if (todayButton) {

    todayButton.addEventListener(
        "click",
        function () {

            const today =
                getTodayString();


            const input =
                document.getElementById(
                    "orderDate"
                );


            if (input) {

                input.value =
                    today;
            }


            selectedDate =
                today;


            filterOrders();
        }
    );
}


/* =====================================================
   ORDER SEARCH
===================================================== */

const search =
    document.getElementById(
        "search"
    );


if (search) {

    search.addEventListener(
        "input",
        function () {

            const text =
                search.value
                    .trim()
                    .toLowerCase();


            let filtered =
                allOrders.filter(
                    function (item) {

                        return (

                            getDateString(
                                item.data.createdAt
                            )
                            ===
                            selectedDate

                        );
                    }
                );


            if (text) {

                filtered =
                    filtered.filter(
                        function (item) {

                            const order =
                                item.data;


                            const orderId =

                                order.orderId
                                ||
                                order.orderID
                                ||
                                order.orderNumber
                                ||
                                item.id;


                            const verifiedName =
                                getVerifiedFFName(
                                    order
                                );


                            const values = [

                                orderId,

                                order.customerName,

                                order.name,

                                order.userId,

                                order.uid,

                                order.gameUID,

                                order.gameUid,

                                order.gameId,

                                verifiedName,

                                order.productName,

                                order.product,

                                order.package,

                                order.plan,

                                order.paymentMethod,

                                order.payment,

                                order.status,

                                order.walletState,

                                order.providerStatus,

                                order.providerOrderId,

                                order.quantity,

                                order.qty

                            ];


                            return values.some(
                                function (value) {

                                    return (

                                        value !== undefined
                                        &&
                                        value !== null
                                        &&
                                        String(
                                            value
                                        )
                                            .toLowerCase()
                                            .includes(
                                                text
                                            )

                                    );
                                }
                            );
                        }
                    );
            }


            renderOrders(
                filtered
            );
        }
    );
}


/* =====================================================
   REFRESH
===================================================== */

const refresh =
    document.getElementById(
        "refresh"
    );


if (refresh) {

    refresh.addEventListener(
        "click",
        async function () {

            refresh.disabled =
                true;

            refresh.textContent =
                "Loading...";


            try {

                await loadOrders();
            }
            finally {

                refresh.disabled =
                    false;

                refresh.textContent =
                    "↻ Refresh";
            }
        }
    );
}


/* =====================================================
   LOGOUT
===================================================== */

const logout =
    document.getElementById(
        "logout"
    );


if (logout) {

    logout.addEventListener(
        "click",
        async function () {

            try {

                await signOut(
                    auth
                );
            }
            finally {

                window.location.href =
                    "./admin-login.html";
            }
        }
    );
}


/* =====================================================
   CREATE REDEEM CODE
===================================================== */

const createRedeem =
    document.getElementById(
        "createRedeem"
    );


if (createRedeem) {

    createRedeem.addEventListener(
        "click",
        async function () {

            const secretInput =
                document.getElementById(
                    "adminSecret"
                );

            const amountInput =
                document.getElementById(
                    "redeemAmount"
                );

            const resultBox =
                document.getElementById(
                    "redeemResult"
                );

            const codeBox =
                document.getElementById(
                    "redeemCode"
                );

            const valueBox =
                document.getElementById(
                    "redeemValue"
                );

            const statusBox =
                document.getElementById(
                    "redeemStatus"
                );

            const timeBox =
                document.getElementById(
                    "redeemGeneratedTime"
                );


            if (
                !secretInput ||
                !amountInput
            ) {

                return;
            }


            const secret =
                secretInput.value
                    .trim();


            const amount =
                Number(
                    amountInput.value
                );


            /* -----------------------------------------
               SECRET VALIDATION
            ----------------------------------------- */

            if (!secret) {

                alert(
                    "Please enter your Admin Secret Key."
                );

                secretInput.focus();

                return;
            }


            /* -----------------------------------------
               AMOUNT VALIDATION
            ----------------------------------------- */

            if (
                !Number.isFinite(
                    amount
                )
                ||
                !Number.isInteger(
                    amount
                )
                ||
                amount <= 0
                ||
                amount > 1000000
            ) {

                alert(
                    "Enter a valid amount between LKR 1 and LKR 1,000,000."
                );

                amountInput.focus();

                return;
            }


            const confirmed =
                confirm(

                    `Create a wallet redeem code worth LKR ${amount.toLocaleString("en-LK")}?`

                );


            if (!confirmed) {
                return;
            }


            createRedeem.disabled =
                true;


            createRedeem.textContent =
                "⏳ Creating...";


            if (resultBox) {

                resultBox.style.display =
                    "none";
            }


            if (statusBox) {

                statusBox.textContent =
                    "🔐 Creating secure redeem code...";
            }


            try {

                /*
                 workerRequest() automatically sends:

                 Authorization: Bearer Firebase token
                 X-Admin-Key: value from visible Admin Secret box
                */

                const data =
                    await workerRequest(
                        {

                            action:
                                "create_redeem_code",

                            amount:
                                amount

                        },
                        true
                    );


                if (!data.code) {

                    throw new Error(
                        "Server did not return a redeem code."
                    );
                }


                /* -----------------------------------------
                   SHOW CODE
                ----------------------------------------- */

                if (codeBox) {

                    codeBox.textContent =
                        data.code;
                }


                /* -----------------------------------------
                   SHOW VALUE
                ----------------------------------------- */

                if (valueBox) {

                    valueBox.textContent =
                        "LKR " +
                        Number(
                            data.amount ??
                            amount
                        ).toLocaleString(
                            "en-LK"
                        );
                }


                /* -----------------------------------------
                   SHOW GENERATED TIME
                ----------------------------------------- */

                if (timeBox) {

                    timeBox.textContent =
                        new Date()
                            .toLocaleString(
                                "en-LK"
                            );
                }


                /* -----------------------------------------
                   DISPLAY RESULT PANEL
                ----------------------------------------- */

                if (resultBox) {

                    resultBox.style.display =
                        "block";
                }


                if (statusBox) {

                    statusBox.textContent =
                        "✅ Redeem code created successfully.";
                }


                /*
                 Keep Admin Secret in the box.

                 This allows the same entered key to be
                 used for Release Money without asking
                 for the key again.

                 We DO NOT store it in localStorage,
                 sessionStorage or the HTML source.
                */


                amountInput.value =
                    "";

            }
            catch (error) {

                console.error(
                    "Redeem creation error:",
                    error
                );


                if (statusBox) {

                    statusBox.textContent =
                        "❌ " +
                        (
                            error.message
                            ||
                            "Failed to create code."
                        );
                }


                alert(

                    error.message
                    ||
                    "Failed to create redeem code."

                );
            }
            finally {

                createRedeem.disabled =
                    false;


                createRedeem.textContent =
                    "💎 Create Code";
            }
        }
    );
}


/* =====================================================
   ENTER KEY CREATE CODE
===================================================== */

const redeemAmountInput =
    document.getElementById(
        "redeemAmount"
    );


if (redeemAmountInput) {

    redeemAmountInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                if (createRedeem) {

                    createRedeem.click();
                }
            }
        }
    );
}


/* =====================================================
   COPY REDEEM CODE
===================================================== */

const copyRedeem =
    document.getElementById(
        "copyRedeem"
    );


if (copyRedeem) {

    copyRedeem.addEventListener(
        "click",
        async function () {

            const codeBox =
                document.getElementById(
                    "redeemCode"
                );


            if (!codeBox) {
                return;
            }


            const code =
                codeBox.textContent
                    .trim();


            if (!code) {

                alert(
                    "No redeem code available."
                );

                return;
            }


            try {

                await navigator.clipboard
                    .writeText(
                        code
                    );


                copyRedeem.textContent =
                    "✅ Copied!";


                setTimeout(
                    function () {

                        copyRedeem.textContent =
                            "📋 Copy Code";

                    },
                    1500
                );

            }
            catch (error) {

                console.error(
                    "Clipboard error:",
                    error
                );


                /* -----------------------------------------
                   FALLBACK COPY
                ----------------------------------------- */

                const textarea =
                    document.createElement(
                        "textarea"
                    );


                textarea.value =
                    code;


                textarea.style.position =
                    "fixed";

                textarea.style.left =
                    "-9999px";

                textarea.style.opacity =
                    "0";


                document.body.appendChild(
                    textarea
                );


                textarea.focus();

                textarea.select();


                try {

                    document.execCommand(
                        "copy"
                    );


                    copyRedeem.textContent =
                        "✅ Copied!";


                    setTimeout(
                        function () {

                            copyRedeem.textContent =
                                "📋 Copy Code";

                        },
                        1500
                    );

                }
                catch (copyError) {

                    alert(
                        "Copy failed. Please copy the code manually."
                    );
                }


                textarea.remove();
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


console.log(
    "Zyper Admin Dashboard ready."
);
