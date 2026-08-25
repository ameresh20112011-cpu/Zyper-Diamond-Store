import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
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
   CLOUDFLARE WORKER
===================================================== */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


/*
   IMPORTANT:

   DO NOT put ADMIN_SECRET inside this JavaScript file.

   The secret must stay in Cloudflare Worker secrets.

   admin.js only sends the secret if you have created
   a secure way to provide it.

   For now the wallet/redeem admin functions below
   will use the Cloudflare endpoint normally.
*/


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
            doc(db, "users", user.uid)
        );

        if (!adminDoc.exists()) {
            return false;
        }

        return adminDoc.data().role === "admin";

    } catch (error) {

        console.error("Admin check error:", error);

        return false;
    }
}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const email =
                document.getElementById("email")
                    ?.value.trim();

            const password =
                document.getElementById("password")
                    ?.value;

            const msg =
                document.getElementById("msg");

            const button =
                document.getElementById("login");


            if (!email || !password) {

                if (msg) {
                    msg.textContent =
                        "Enter email and password";
                }

                return;
            }


            if (button) {
                button.disabled = true;
                button.textContent = "LOGIN...";
            }


            try {

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const admin =
                    await checkAdmin(result.user);


                if (!admin) {

                    await signOut(auth);

                    if (msg) {
                        msg.textContent =
                            "❌ You are not admin";
                    }

                    if (button) {
                        button.disabled = false;
                        button.textContent = "LOGIN";
                    }

                    return;
                }


                window.location.href =
                    "./admin-dashboard.html";


            } catch (error) {

                console.error(error);

                if (msg) {
                    msg.textContent =
                        error.message ||
                        "Login failed.";
                }

                if (button) {
                    button.disabled = false;
                    button.textContent = "LOGIN";
                }
            }

        }
    );
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


            selectedDate =
                getTodayString();


            const dateInput =
                document.getElementById("orderDate");


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
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

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
        !isNaN(date.getTime())
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
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");


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
        String(date.getHours())
            .padStart(2, "0");

    const minute =
        String(date.getMinutes())
            .padStart(2, "0");

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");


    return `${hour}:${minute} , ${year}/${month}/${day}`;
}


/* =====================================================
   GET TIME
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
        document.getElementById("orders");


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
                collection(db, "orders")
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
                    getTime(b.data.createdAt) -
                    getTime(a.data.createdAt)
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
                    ) === selectedDate
                );

            }
        );


    renderOrders(filtered);
}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(orders) {

    const table =
        document.getElementById("orders");


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
                    order.productPrice ??
                    order.price ??
                    0
                );


            const payment =
                order.paymentMethod ||
                order.payment ||
                "-";


            const amount =
                Number(
                    order.total ??
                    order.amount ??
                    price ??
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


            const lowerStatus =
                String(status)
                    .toLowerCase();


            if (
                lowerStatus === "pending"
            ) {

                pending++;
            }


            if (
                lowerStatus === "success" ||
                lowerStatus === "completed"
            ) {

                success++;
            }


            const row =
                document.createElement("tr");


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
                    Rs. ${Number(price)
                        .toLocaleString("en-LK")}
                </td>

                <td>
                    ${escapeHTML(payment)}
                </td>

                <td>
                    ${escapeHTML(date)}
                </td>

                <td>
                    Rs. ${Number(amount)
                        .toLocaleString("en-LK")}
                </td>

                <td class="${getStatusClass(status)}">
                    ${escapeHTML(status)}
                </td>

                <td>

                    <button
                        class="action-btn success-btn"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Success"
                    >
                        ✔
                    </button>

                    <button
                        class="action-btn reject-btn"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Rejected"
                    >
                        ✖
                    </button>

                </td>
            `;


            table.appendChild(row);

        }
    );


    updateCards(
        total,
        revenue,
        pending,
        success
    );


    table
        .querySelectorAll(".action-btn")
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
   STATUS CLASS
===================================================== */

function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase();

    if (value === "success") {
        return "Success";
    }

    if (value === "rejected") {
        return "Rejected";
    }

    return "Pending";
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
            Number(revenue)
                .toLocaleString("en-LK");
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
                    "Please select a date"
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
   TODAY
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
                            ) === selectedDate
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


            renderOrders(filtered);

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

                await signOut(auth);

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
        await checkAdmin(user);


    if (!admin) {

        alert(
            "Access denied"
        );

        return;
    }


    const confirmed =
        confirm(
            `Change order status to ${status}?`
        );


    if (!confirmed) {
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
                status: status
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
   GET CURRENT FIREBASE USER TOKEN
===================================================== */

async function getFirebaseToken() {

    const user =
        auth.currentUser;


    if (!user) {
        throw new Error(
            "Admin login required."
        );
    }


    return await user.getIdToken();
}


/* =====================================================
   CALL CLOUDFLARE WORKER
===================================================== */

async function callWorker(
    data,
    adminKey = ""
) {

    const headers = {
        "Content-Type":
            "application/json"
    };


    /*
     * IMPORTANT:
     *
     * If you later create a secure admin
     * authentication method, the key can be
     * added here.
     *
     * DO NOT hard-code your real ADMIN_SECRET
     * into this public GitHub JavaScript file.
     */

    if (adminKey) {

        headers["X-Admin-Key"] =
            adminKey;
    }


    const response =
        await fetch(
            WORKER_URL,
            {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            }
        );


    let result;


    try {

        result =
            await response.json();

    } catch {

        throw new Error(
            `Worker returned HTTP ${response.status}`
        );
    }


    if (!response.ok || !result.success) {

        throw new Error(
            result.message ||
            `Worker error ${response.status}`
        );
    }


    return result;
}


/* =====================================================
   GET WALLET BALANCE
===================================================== */

export async function getMyWallet() {

    const token =
        await getFirebaseToken();


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

                body: JSON.stringify({
                    action:
                        "wallet_balance"
                })
            }
        );


    const result =
        await response.json();


    if (!response.ok || !result.success) {

        throw new Error(
            result.message ||
            "Unable to get wallet."
        );
    }


    return result.wallet;
}


/* =====================================================
   GET WALLET TRANSACTIONS
===================================================== */

export async function getWalletTransactions() {

    const token =
        await getFirebaseToken();


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

                body: JSON.stringify({
                    action:
                        "wallet_transactions"
                })
            }
        );


    const result =
        await response.json();


    if (!response.ok || !result.success) {

        throw new Error(
            result.message ||
            "Unable to get transactions."
        );
    }


    return result.transactions || [];
}


/* =====================================================
   CHECK REDEEM CODE
===================================================== */

export async function checkRedeemCode(
    code,
    adminKey = ""
) {

    return await callWorker(
        {
            action:
                "admin_redeem_info",

            code:
                String(code)
                    .trim()
                    .toUpperCase()

        },
        adminKey
    );
}


/* =====================================================
   CREATE REDEEM CODE
===================================================== */

export async function createRedeemCode(
    amount,
    userId,
    email = "",
    adminKey = ""
) {

    return await callWorker(
        {
            action:
                "create_redeem_code",

            amount:
                Number(amount),

            userId:
                String(userId)
                    .trim(),

            email:
                String(email)
                    .trim()

        },
        adminKey
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


/* =====================================================
   WORKER CONNECTION TEST
===================================================== */

async function testWorker() {

    try {

        const response =
            await fetch(
                WORKER_URL,
                {
                    method: "GET"
                }
            );


        console.log(
            "Cloudflare Worker status:",
            response.status
        );


    } catch (error) {

        console.error(
            "Cloudflare Worker connection error:",
            error
        );
    }
}


testWorker();
