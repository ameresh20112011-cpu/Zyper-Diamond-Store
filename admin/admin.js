import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
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

        const adminDoc = await getDoc(
            doc(
                db,
                "users",
                user.uid
            )
        );

        if (!adminDoc.exists()) {
            return false;
        }

        return adminDoc.data().role === "admin";

    } catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        return false;
    }
}


/* =====================================================
   DASHBOARD AUTH
===================================================== */

const orderTable =
    document.getElementById("orders");


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
                await checkAdmin(user);


            if (!admin) {

                await signOut(auth);

                window.location.href =
                    "./admin-login.html";

                return;
            }


            const app =
                document.getElementById("app");


            if (app) {
                app.style.display = "block";
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
   GET TODAY
===================================================== */

function getTodayString() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/* =====================================================
   FIREBASE TIMESTAMP → DATE
===================================================== */

function convertToDate(value) {

    if (!value) {
        return null;
    }


    if (
        typeof value.toDate === "function"
    ) {

        return value.toDate();

    }


    if (value instanceof Date) {

        return value;

    }


    if (
        value.seconds !== undefined
    ) {

        return new Date(
            Number(value.seconds) * 1000
        );

    }


    const date =
        new Date(value);


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
        convertToDate(value);


    if (!date) {
        return "";
    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(timestamp) {

    const date =
        convertToDate(timestamp);


    if (!date) {
        return "-";
    }


    const hour =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minute =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${hour}:${minute} , ${year}/${month}/${day}`;
}


/* =====================================================
   SORT TIME
===================================================== */

function getTime(timestamp) {

    const date =
        convertToDate(timestamp);


    if (!date) {
        return 0;
    }


    return date.getTime();
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
            <td colspan="11">
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

                    id: item.id,

                    data: item.data()

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

    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="11">
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


    table.innerHTML = "";


    if (orders.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="11">
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


            const orderId =
                order.orderId ||
                order.orderID ||
                order.orderNumber ||
                item.id;


            const customer =
                order.customerName ||
                order.name ||
                "-";


            const firebaseUID =
                order.userId ||
                order.uid ||
                "-";


            const gameUID =
                order.gameUID ||
                order.gameUid ||
                order.gameId ||
                "-";


            const product =
                order.productName ||
                order.product ||
                order.package ||
                order.plan ||
                "-";


            const price =
                Number(
                    order.productPrice ||
                    order.price ||
                    0
                );


            const payment =
                order.paymentMethod ||
                order.payment ||
                "-";


            const amount =
                Number(
                    order.total ||
                    order.amount ||
                    price ||
                    0
                );


            const date =
                formatDate(
                    order.createdAt
                );


            const status =
                order.status ||
                "Pending";


            total++;

            revenue += amount;


            if (
                String(status).toLowerCase()
                === "pending"
            ) {

                pending++;

            }


            if (
                String(status).toLowerCase()
                === "success"
            ) {

                success++;

            }


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
                    ${escapeHTML(product)}
                </td>

                <td>
                    Rs.
                    ${price.toLocaleString("en-LK")}
                </td>

                <td>
                    ${escapeHTML(payment)}
                </td>

                <td>
                    ${escapeHTML(date)}
                </td>

                <td>
                    Rs.
                    ${amount.toLocaleString("en-LK")}
                </td>

                <td class="${escapeHTML(status)}">
                    ${escapeHTML(status)}
                </td>

                <td>

                    <button
                        class="action-btn success-btn"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Success"
                        type="button">
                        ✔
                    </button>

                    <button
                        class="action-btn reject-btn"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Rejected"
                        type="button">
                        ✖
                    </button>

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


    table
        .querySelectorAll(
            ".action-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        changeStatus(
                            button.dataset.id,
                            button.dataset.status
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


            if (!input || !input.value) {

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
   TEXT SEARCH
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
                                order.orderId ||
                                order.orderID ||
                                order.orderNumber ||
                                item.id;


                            const values = [

                                orderId,

                                order.customerName,

                                order.name,

                                order.userId,

                                order.uid,

                                order.gameUID,

                                order.gameUid,

                                order.gameId,

                                order.productName,

                                order.product,

                                order.package,

                                order.plan,

                                order.paymentMethod,

                                order.payment,

                                order.status

                            ];


                            return values.some(
                                function (value) {

                                    return (
                                        value !== undefined &&
                                        value !== null &&
                                        String(value)
                                            .toLowerCase()
                                            .includes(text)
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

            refresh.disabled = true;

            refresh.textContent =
                "Loading...";


            await loadOrders();


            refresh.disabled = false;

            refresh.textContent =
                "↻ Refresh";

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

            } finally {

                window.location.href =
                    "./admin-login.html";

            }

        }
    );
}


/* =====================================================
   CHANGE ORDER STATUS
===================================================== */

async function changeStatus(
    id,
    status
) {

    const user =
        auth.currentUser;


    const admin =
        await checkAdmin(
            user
        );


    if (!admin) {

        alert(
            "Access denied."
        );

        return;
    }


    if (
        !confirm(
            "Change status to " +
            status +
            "?"
        )
    ) {

        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "orders",
                id
            ),
            {
                status:
                    status
            }
        );


        await loadOrders();

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Failed to update order."
        );
    }
}


/* =====================================================
   CREATE WALLET REDEEM CODE
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


            if (!secretInput) {
                return;
            }


            if (!amountInput) {
                return;
            }


            const secret =
                secretInput.value.trim();


            const amount =
                Number(
                    amountInput.value
                );


            if (!secret) {

                alert(
                    "Please enter your Admin Secret Key."
                );

                secretInput.focus();

                return;
            }


            if (
                !Number.isFinite(amount) ||
                amount <= 0 ||
                amount > 1000000
            ) {

                alert(
                    "Enter a valid amount between LKR 1 and LKR 1,000,000."
                );

                amountInput.focus();

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


            try {

                const response =
                    await fetch(
                        WORKER_URL,
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "X-Admin-Key":
                                    secret

                            },

                            body:
                                JSON.stringify({

                                    action:
                                        "create_redeem_code",

                                    amount:
                                        amount

                                })

                        }
                    );


                let data = null;


                try {

                    data =
                        await response.json();

                } catch {

                    data = null;

                }


                if (
                    !response.ok ||
                    !data ||
                    !data.success
                ) {

                    const message =
                        data &&
                        data.message
                            ? data.message
                            : `Server error (${response.status})`;


                    throw new Error(
                        message
                    );
                }


                if (!data.code) {

                    throw new Error(
                        "Server did not return a redeem code."
                    );
                }


                if (codeBox) {

                    codeBox.textContent =
                        data.code;

                }


                if (valueBox) {

                    valueBox.textContent =
                        `Wallet Value: LKR ${Number(
                            data.amount
                        ).toLocaleString("en-LK")}`;

                }


                if (resultBox) {

                    resultBox.style.display =
                        "block";

                }


                /*
                 * Clear sensitive secret
                 * from the input after success.
                 */

                secretInput.value =
                    "";


                amountInput.value =
                    "";


            } catch (error) {

                console.error(
                    "Redeem creation error:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to create redeem code."
                );

            } finally {

                createRedeem.disabled =
                    false;

                createRedeem.textContent =
                    "💎 Create Redeem Code";

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
                codeBox.textContent.trim();


            if (!code) {

                alert(
                    "No redeem code available."
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    code
                );


                const oldText =
                    copyRedeem.textContent;


                copyRedeem.textContent =
                    "✅ Copied!";


                setTimeout(
                    function () {

                        copyRedeem.textContent =
                            oldText;

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Copy error:",
                    error
                );


                /*
                 * Fallback for browsers
                 * that block clipboard API.
                 */

                const textarea =
                    document.createElement(
                        "textarea"
                    );


                textarea.value =
                    code;


                textarea.style.position =
                    "fixed";

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

                } catch {

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
