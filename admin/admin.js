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

                console.error(
                    "Login form inputs not found."
                );

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

                /* -----------------------------------------
                   FIREBASE LOGIN
                ----------------------------------------- */

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                /* -----------------------------------------
                   ADMIN ROLE CHECK
                ----------------------------------------- */

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


                /* -----------------------------------------
                   GO TO DASHBOARD
                ----------------------------------------- */

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
   TODAY
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
   DATE CONVERSION
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
   DATE STRING
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
        `${year}-${month}-${day} ${hour}:${minute}`
    );
}


/* =====================================================
   NORMALIZE STATUS
===================================================== */

function normalizeStatus(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
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
            function (documentSnapshot) {

                allOrders.push({

                    id:
                        documentSnapshot.id,

                    data:
                        documentSnapshot.data()

                });

            }
        );


        /* -----------------------------------------
           NEWEST FIRST
        ----------------------------------------- */

        allOrders.sort(
            function (a, b) {

                const dateA =
                    convertToDate(
                        a.data.createdAt
                    );


                const dateB =
                    convertToDate(
                        b.data.createdAt
                    );


                const timeA =
                    dateA
                        ? dateA.getTime()
                        : 0;


                const timeB =
                    dateB
                        ? dateB.getTime()
                        : 0;


                return (
                    timeB -
                    timeA
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

        renderOrders([]);

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
       SUCCESS AFTER MONEY RELEASED

       Supplier later confirmed Success, but admin
       already returned the customer's wallet money.

       Never show this as normal completed.
    ================================================= */

    const lateSuccess =

        order.lateSuccessAfterRelease ===
            true

        ||

        (
            status ===
                "success"
            &&
            walletState ===
                "released"
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
       NORMAL SUCCESS
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
       MONEY ALREADY RELEASED
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
       FAILED / PENDING REVIEW + MONEY HELD
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
       PROCESSING + MONEY HELD
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

function renderOrders(
    orders
) {

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


    /* =================================================
       NO ORDERS
    ================================================= */

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


    /* =================================================
       LOOP ORDERS
    ================================================= */

    orders.forEach(
        function (item) {

            const order =
                item.data || {};


            /* =============================================
               ORDER ID
            ============================================= */

            const orderId =

                order.orderId
                ||
                order.orderID
                ||
                order.orderNumber
                ||
                item.id
                ||
                "-";


            /* =============================================
               CUSTOMER NAME
            ============================================= */

            const customer =

                order.customerName
                ||
                order.name
                ||
                "-";


            /* =============================================
               FIREBASE UID
            ============================================= */

            const firebaseUID =

                order.userId
                ||
                order.uid
                ||
                "-";


            /* =============================================
               FREE FIRE UID
            ============================================= */

            const gameUID =

                order.gameUID
                ||
                order.gameUid
                ||
                order.gameId
                ||
                "-";


            /* =============================================
               STATUS
            ============================================= */

            const status =
                String(
                    order.status ||
                    "Processing"
                );


            const statusLower =
                normalizeStatus(
                    status
                );


            /* =============================================
               WALLET STATE
            ============================================= */

            const walletState =
                String(
                    order.walletState ||
                    ""
                );


            const walletLower =
                normalizeWalletState(
                    walletState
                );


            /* =============================================
               VERIFIED FREE FIRE NAME

               Do NOT use the customer-entered name unless
               the provider marked it as verified.
            ============================================= */

            const providerVerified =

                order.playerVerified ===
                    true

                ||

                String(
                    order.playerNameSource ||
                    ""
                )
                    .trim()
                    .toLowerCase()
                    ===
                    "provider";


            let verifiedFFName =
                "-";


            if (
                order.verifiedFFName
            ) {

                verifiedFFName =
                    order.verifiedFFName;

            }

            else if (
                order.verifiedPlayerName
            ) {

                verifiedFFName =
                    order.verifiedPlayerName;

            }

            else if (
                order.providerPlayerName
            ) {

                verifiedFFName =
                    order.providerPlayerName;

            }

            else if (
                providerVerified
                &&
                order.playerName
            ) {

                verifiedFFName =
                    order.playerName;

            }

            else if (
                order.ffName
            ) {

                verifiedFFName =
                    order.ffName;

            }

            else if (
                statusLower ===
                    "processing"
                ||
                statusLower ===
                    "pending"
            ) {

                verifiedFFName =
                    "Processing...";

            }


            /* =============================================
               PRODUCT
            ============================================= */

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


            /* =============================================
               QUANTITY
            ============================================= */

            let quantity =
                Number(
                    order.quantity ??
                    order.qty ??
                    1
                );


            if (
                !Number.isFinite(
                    quantity
                )
                ||
                quantity < 1
            ) {

                quantity = 1;

            }


            quantity =
                Math.floor(
                    quantity
                );


            /* =============================================
               TOTAL
            ============================================= */

            let totalAmount =
                Number(
                    order.total ??
                    order.amount ??
                    0
                );


            if (
                !Number.isFinite(
                    totalAmount
                )
            ) {

                totalAmount = 0;

            }


            /* =============================================
               UNIT PRICE
            ============================================= */

            let unitPrice =
                Number(

                    order.unitPrice
                    ??
                    order.productPrice
                    ??
                    0

                );


            if (
                !Number.isFinite(
                    unitPrice
                )
            ) {

                unitPrice = 0;

            }


            /*
             * Older orders may have only total + quantity.
             * Derive unit price from them.
             */

            if (
                unitPrice <= 0
                &&
                totalAmount > 0
                &&
                quantity > 0
            ) {

                unitPrice =
                    totalAmount /
                    quantity;

            }


            /*
             * Older single-quantity orders may have
             * price only.
             */

            if (
                unitPrice <= 0
            ) {

                const oldPrice =
                    Number(
                        order.price ??
                        0
                    );


                if (
                    Number.isFinite(
                        oldPrice
                    )
                ) {

                    unitPrice =
                        oldPrice;

                }

            }


            /*
             * If total was not stored, calculate it.
             */

            if (
                totalAmount <= 0
            ) {

                totalAmount =
                    unitPrice *
                    quantity;

            }


            /* =============================================
               PAYMENT
            ============================================= */

            const payment =

                order.paymentMethod
                ||
                order.payment
                ||
                "Wallet";


            /* =============================================
               ORDER DATE
            ============================================= */

            const orderedValue =

                order.orderedAt
                ||
                order.createdAt
                ||
                null;


            const orderedDate =

                orderedValue

                    ? formatDate(
                        orderedValue
                    )

                    : "-";


            /* =============================================
               COMPLETED DATE
            ============================================= */

            const completedValue =

                order.completedAt
                ||
                order.providerSuccessAt
                ||
                order.completedTime
                ||
                order.successAt
                ||
                null;


            const completedDate =

                (
                    statusLower ===
                        "success"
                    &&
                    completedValue
                )

                    ? formatDate(
                        completedValue
                    )

                    : "-";


            /* =============================================
               PROVIDER STATUS
            ============================================= */

            const providerStatus =
                String(

                    order.providerStatus

                    ||

                    (
                        statusLower ===
                            "success"

                            ? "success"

                            : "-"
                    )

                );


            const providerOrderId =

                order.providerOrderId
                ||
                "";


            /* =============================================
               DASHBOARD COUNTERS
            ============================================= */

            total++;


            if (
                statusLower ===
                    "pending"
                ||
                statusLower ===
                    "processing"
                ||
                statusLower ===
                    "pending review"
            ) {

                pending++;

            }


            if (
                statusLower ===
                "success"
            ) {

                success++;


                /*
                 * Revenue = ONLY wallet money that was
                 * really deducted.
                 *
                 * A late Success after money release
                 * MUST NOT be counted.
                 */

                if (
                    walletLower ===
                    "deducted"
                ) {

                    revenue +=
                        totalAmount;

                }

            }


            /* =============================================
               ORDER STATUS STYLE
            ============================================= */

            let statusClass =
                "state-neutral";


            if (
                statusLower ===
                "success"
            ) {

                statusClass =
                    "state-success";

            }

            else if (
                statusLower ===
                    "failed"
                ||
                statusLower ===
                    "rejected"
            ) {

                statusClass =
                    "state-failed";

            }

            else if (
                statusLower ===
                "pending review"
            ) {

                statusClass =
                    "state-review";

            }

            else if (
                statusLower ===
                    "processing"
                ||
                statusLower ===
                    "pending"
            ) {

                statusClass =
                    "state-processing";

            }
            /* =============================================
               WALLET BADGE
            ============================================= */

            let walletHTML = `

                <span
                    class="
                        admin-state-badge
                        state-neutral
                    "
                >
                    —
                </span>

            `;


            if (
                walletLower ===
                "held"
            ) {

                walletHTML = `

                    <span
                        class="
                            admin-state-badge
                            state-processing
                        "
                    >
                        🔒 HELD
                    </span>

                `;

            }

            else if (
                walletLower ===
                "deducted"
            ) {

                walletHTML = `

                    <span
                        class="
                            admin-state-badge
                            state-success
                        "
                    >
                        ✓ DEDUCTED
                    </span>

                `;

            }

            else if (
                walletLower ===
                "released"
            ) {

                walletHTML = `

                    <span
                        class="
                            admin-state-badge
                            state-review
                        "
                    >
                        ↩ RELEASED
                    </span>

                `;

            }


            /* =============================================
               PROVIDER STATUS STYLE
            ============================================= */

            const providerLower =
                providerStatus
                    .trim()
                    .toLowerCase();


            let providerClass =
                "state-neutral";


            if (
                providerLower ===
                "success"
            ) {

                providerClass =
                    "state-success";

            }

            else if (
                providerLower ===
                "failed"
            ) {

                providerClass =
                    "state-failed";

            }

            else if (
                providerLower ===
                    "pending_review"
                ||
                providerLower ===
                    "send_unknown"
                ||
                providerLower ===
                    "unsupported"
            ) {

                providerClass =
                    "state-review";

            }

            else if (
                providerLower ===
                    "processing"
                ||
                providerLower ===
                    "waiting"
            ) {

                providerClass =
                    "state-processing";

            }


            let providerText =
                providerStatus;


            if (
                providerOrderId
            ) {

                providerText +=
                    ` #${providerOrderId}`;

            }


            /* =============================================
               ACTION
            ============================================= */

            const actionHTML =
                buildOrderAction(
                    order,
                    orderId,
                    totalAmount
                );


            /* =============================================
               TABLE ROW
            ============================================= */

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

                    ${escapeHTML(
                        customer
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        firebaseUID
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        gameUID
                    )}

                </td>


                <td>

                    <span
                        class="
                            ff-name-verified
                        "
                    >
                        ${escapeHTML(
                            verifiedFFName
                        )}
                    </span>

                </td>


                <td>

                    ${escapeHTML(
                        product
                    )}

                </td>


                <td>

                    <span
                        class="
                            qty-badge
                        "
                    >
                        x${quantity}
                    </span>

                </td>


                <td>

                    LKR
                    ${unitPrice.toLocaleString(
                        "en-LK"
                    )}

                </td>


                <td>

                    <strong>

                        LKR
                        ${totalAmount.toLocaleString(
                            "en-LK"
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        payment
                    )}

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
                            status
                        )}
                    </span>

                </td>


                <td>

                    ${walletHTML}

                </td>


                <td>

                    <span
                        class="
                            admin-state-badge
                            ${providerClass}
                        "
                    >
                        ${escapeHTML(
                            providerText
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


    /* =================================================
       UPDATE DASHBOARD CARDS
    ================================================= */

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
                            button.dataset.orderId;


                        const amount =
                            Number(
                                button.dataset.amount ||
                                0
                            );


                        if (!orderId) {

                            alert(
                                "Order ID not found."
                            );

                            return;
                        }


                        const confirmRelease =
                            confirm(

                                `Release LKR ${amount.toLocaleString(
                                    "en-LK"
                                )} back to the customer's wallet?\n\nOrder ID: ${orderId}`

                            );


                        if (
                            !confirmRelease
                        ) {

                            return;
                        }


                        button.disabled =
                            true;


                        const oldText =
                            button.textContent;


                        button.textContent =
                            "RELEASING...";


                        try {

                            await releaseOrderMoney(
                                orderId
                            );


                            alert(
                                "✅ Money released successfully."
                            );


                            await loadOrders();

                        }
                        catch (error) {

                            console.error(
                                "Release money error:",
                                error
                            );


                            alert(
                                "❌ " +
                                (
                                    error.message ||
                                    "Failed to release money."
                                )
                            );


                            button.disabled =
                                false;


                            button.textContent =
                                oldText;

                        }

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
   DATE SEARCH BUTTON
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
                !input
                ||
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


            const dateInput =
                document.getElementById(
                    "orderDate"
                );


            if (dateInput) {

                dateInput.value =
                    today;

            }


            selectedDate =
                today;


            filterOrders();

        }
    );

}


/* =====================================================
   TEXT SEARCH
===================================================== */

const searchInput =
    document.getElementById(
        "search"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const text =
                searchInput.value
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
                                item.data || {};


                            const verifiedFFName =

                                order.verifiedFFName
                                ||
                                order.verifiedPlayerName
                                ||
                                order.providerPlayerName
                                ||
                                (
                                    (
                                        order.playerVerified ===
                                        true
                                        ||
                                        String(
                                            order.playerNameSource ||
                                            ""
                                        )
                                            .trim()
                                            .toLowerCase()
                                            ===
                                            "provider"
                                    )

                                        ? order.playerName

                                        : ""
                                )
                                ||
                                order.ffName
                                ||
                                "";


                            const values = [

                                order.orderId,

                                order.orderID,

                                order.orderNumber,

                                order.customerName,

                                order.name,

                                order.userId,

                                order.uid,

                                order.gameUID,

                                order.gameUid,

                                order.gameId,

                                verifiedFFName,

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

                                order.quantity

                            ];


                            return values.some(
                                function (value) {

                                    if (
                                        value ===
                                        undefined
                                        ||
                                        value ===
                                        null
                                    ) {

                                        return false;
                                    }


                                    return String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            text
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
   REFRESH BUTTON
===================================================== */

const refreshButton =
    document.getElementById(
        "refreshButton"
    )
    ||
    document.getElementById(
        "refresh"
    );


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async function () {

            const oldText =
                refreshButton.textContent;


            refreshButton.disabled =
                true;


            refreshButton.textContent =
                "REFRESHING...";


            try {

                await loadOrders();

            }
            catch (error) {

                console.error(
                    "Refresh error:",
                    error
                );

            }
            finally {

                refreshButton.disabled =
                    false;


                refreshButton.textContent =
                    oldText;

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutButton =
    document.getElementById(
        "logout"
    )
    ||
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "./admin-login.html";

            }
            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Logout failed."
                );

            }

        }
    );

}
/* =====================================================
   GET ADMIN SECRET
===================================================== */

function getAdminSecret() {

    /*
     * IMPORTANT:
     * Never hard-code ADMIN_SECRET inside admin.js.
     *
     * This asks the admin for it only when a protected
     * Worker action is required.
     */

    let secret =
        sessionStorage.getItem(
            "zyper_admin_secret"
        );


    if (secret) {
        return secret;
    }


    secret =
        prompt(
            "Enter Admin Security Key:"
        );


    if (!secret) {
        return "";
    }


    secret =
        secret.trim();


    if (!secret) {
        return "";
    }


    sessionStorage.setItem(
        "zyper_admin_secret",
        secret
    );


    return secret;
}


/* =====================================================
   CLEAR ADMIN SECRET
===================================================== */

function clearAdminSecret() {

    sessionStorage.removeItem(
        "zyper_admin_secret"
    );

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
            "Admin login is required."
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
            `Bearer ${token}`

    };


    /* -----------------------------------------
       PROTECTED ADMIN ACTION
    ----------------------------------------- */

    if (
        requireAdminSecret
    ) {

        const adminSecret =
            getAdminSecret();


        if (!adminSecret) {

            throw new Error(
                "Admin Security Key is required."
            );

        }


        headers["X-Admin-Key"] =
            adminSecret;

    }


    let response;


    try {

        response =
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

    }
    catch (error) {

        throw new Error(
            "Could not connect to Zyper server."
        );

    }


    let result = {};


    try {

        result =
            await response.json();

    }
    catch (error) {

        result = {};

    }


    /* -----------------------------------------
       INVALID ADMIN SECRET
    ----------------------------------------- */

    if (
        response.status === 401
        ||
        response.status === 403
    ) {

        if (
            requireAdminSecret
        ) {

            clearAdminSecret();

        }


        throw new Error(
            result.message
            ||
            result.error
            ||
            "Unauthorized request."
        );

    }


    if (
        !response.ok
        ||
        result.success === false
    ) {

        throw new Error(
            result.message
            ||
            result.error
            ||
            `Server error (${response.status})`
        );

    }


    return result;
}


/* =====================================================
   RELEASE ORDER MONEY
===================================================== */

async function releaseOrderMoney(
    orderId
) {

    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );

    }


    return await workerRequest(
        {

            action:
                "release_order_hold",

            orderId:
                orderId

        },
        true
    );

}


/* =====================================================
   CREATE REDEEM CODE ELEMENTS
===================================================== */

const createRedeemButton =

    document.getElementById(
        "createRedeem"
    )

    ||

    document.getElementById(
        "createRedeemButton"
    );


const redeemAmountInput =

    document.getElementById(
        "redeemAmount"
    );


const redeemResult =

    document.getElementById(
        "redeemResult"
    );


/* =====================================================
   CREATE REDEEM CODE
===================================================== */

if (
    createRedeemButton
) {

    createRedeemButton.addEventListener(
        "click",
        async function () {

            /* -----------------------------------------
               GET AMOUNT
            ----------------------------------------- */

            if (
                !redeemAmountInput
            ) {

                alert(
                    "Redeem amount input not found."
                );

                return;
            }


            const amount =
                Number(
                    redeemAmountInput.value
                );


            /* -----------------------------------------
               VALIDATE AMOUNT
            ----------------------------------------- */

            if (
                !Number.isFinite(
                    amount
                )
                ||
                amount <= 0
            ) {

                alert(
                    "Enter a valid redeem amount."
                );

                redeemAmountInput.focus();

                return;
            }


            if (
                !Number.isInteger(
                    amount
                )
            ) {

                alert(
                    "Redeem amount must be a whole number."
                );

                redeemAmountInput.focus();

                return;
            }


            const confirmed =
                confirm(

                    `Create a redeem code for LKR ${amount.toLocaleString(
                        "en-LK"
                    )}?`

                );


            if (!confirmed) {
                return;
            }


            /* -----------------------------------------
               BUTTON LOADING
            ----------------------------------------- */

            const oldText =
                createRedeemButton.textContent;


            createRedeemButton.disabled =
                true;


            createRedeemButton.textContent =
                "CREATING...";


            if (
                redeemResult
            ) {

                redeemResult.innerHTML = `

                    <div
                        class="
                            redeem-result-message
                        "
                    >
                        Creating redeem code...
                    </div>

                `;

            }


            try {

                /* -----------------------------------------
                   CREATE CODE THROUGH WORKER
                ----------------------------------------- */

                const result =
                    await workerRequest(
                        {

                            action:
                                "create_redeem_code",

                            amount:
                                amount

                        },
                        true
                    );


                /* -----------------------------------------
                   GET GENERATED CODE
                ----------------------------------------- */

                const code =

                    result.code
                    ||
                    result.redeemCode
                    ||
                    result.data?.code
                    ||
                    "";


                if (!code) {

                    throw new Error(
                        "Server did not return the redeem code."
                    );

                }


                const returnedAmount =
                    Number(

                        result.amount
                        ??
                        result.data?.amount
                        ??
                        amount

                    );


                /* -----------------------------------------
                   SHOW RESULT
                ----------------------------------------- */

                if (
                    redeemResult
                ) {

                    redeemResult.innerHTML = `

                        <div
                            class="
                                redeem-created-card
                            "
                        >

                            <div
                                class="
                                    redeem-created-title
                                "
                            >
                                ✅ Redeem Code Created
                            </div>


                            <div
                                class="
                                    redeem-created-amount
                                "
                            >
                                LKR
                                ${returnedAmount.toLocaleString(
                                    "en-LK"
                                )}
                            </div>


                            <div
                                class="
                                    redeem-code-box
                                "
                            >

                                <span
                                    id="
                                        generatedRedeemCode
                                    "
                                >
                                    ${escapeHTML(
                                        code
                                    )}
                                </span>

                            </div>


                            <button
                                type="button"
                                class="
                                    copy-redeem-code-btn
                                "
                                id="
                                    copyRedeemCode
                                "
                            >
                                📋 COPY CODE
                            </button>

                        </div>

                    `;


                    /* -----------------------------------------
                       COPY BUTTON
                    ----------------------------------------- */

                    const copyButton =
                        document.getElementById(
                            "copyRedeemCode"
                        );


                    if (
                        copyButton
                    ) {

                        copyButton.addEventListener(
                            "click",
                            async function () {

                                await copyRedeemCode(
                                    code,
                                    copyButton
                                );

                            }
                        );

                    }

                }


                redeemAmountInput.value =
                    "";

            }
            catch (error) {

                console.error(
                    "Create redeem code error:",
                    error
                );


                if (
                    redeemResult
                ) {

                    redeemResult.innerHTML = `

                        <div
                            class="
                                redeem-result-error
                            "
                        >
                            ❌
                            ${escapeHTML(
                                error.message ||
                                "Failed to create redeem code."
                            )}
                        </div>

                    `;

                }
                else {

                    alert(
                        "❌ " +
                        (
                            error.message ||
                            "Failed to create redeem code."
                        )
                    );

                }

            }
            finally {

                createRedeemButton.disabled =
                    false;


                createRedeemButton.textContent =
                    oldText;

            }

        }
    );

}


/* =====================================================
   COPY REDEEM CODE
===================================================== */

async function copyRedeemCode(
    code,
    button = null
) {

    if (!code) {
        return;
    }


    const oldText =
        button
            ? button.textContent
            : "";


    try {

        /* -----------------------------------------
           MODERN CLIPBOARD
        ----------------------------------------- */

        if (
            navigator.clipboard
            &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                code
            );

        }
        else {

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


            textarea.style.top =
                "-9999px";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();


            document.execCommand(
                "copy"
            );


            textarea.remove();

        }


        if (
            button
        ) {

            button.textContent =
                "✅ COPIED";


            setTimeout(
                function () {

                    button.textContent =
                        oldText;

                },
                1800
            );

        }

    }
    catch (error) {

        console.error(
            "Copy redeem code error:",
            error
        );


        if (
            button
        ) {

            button.textContent =
                "❌ COPY FAILED";


            setTimeout(
                function () {

                    button.textContent =
                        oldText;

                },
                1800
            );

        }
        else {

            alert(
                "Could not copy redeem code."
            );

        }

    }

}


/* =====================================================
   ENTER KEY - CREATE REDEEM
===================================================== */

if (
    redeemAmountInput
    &&
    createRedeemButton
) {

    redeemAmountInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                createRedeemButton.click();

            }

        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
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
   ADMIN.JS READY
===================================================== */

console.log(
    "Zyper Admin Dashboard loaded."
);
