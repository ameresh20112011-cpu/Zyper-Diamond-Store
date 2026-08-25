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


/* =========================================
   CLOUDFLARE WORKER
========================================= */

const WORKER_URL =
    "https://zyper-order.ameresh20112011.workers.dev";


let allOrders = [];
let selectedDate = "";


/* =========================================
   ADMIN CHECK
========================================= */

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

    } catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        return false;
    }
}


/* =========================================
   LOGIN
========================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const email =
                document
                .getElementById("email")
                .value
                .trim();

            const password =
                document
                .getElementById("password")
                .value;

            const msg =
                document
                .getElementById("msg");

            const button =
                document
                .getElementById("login");


            if (!email || !password) {

                msg.textContent =
                    "Enter email and password";

                return;
            }


            button.disabled = true;
            button.textContent = "LOGIN...";


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

                    await signOut(auth);

                    msg.textContent =
                        "❌ You are not admin";

                    button.disabled = false;
                    button.textContent = "LOGIN";

                    return;
                }


                window.location.href =
                    "./admin-dashboard.html";


            } catch(error) {

                console.error(error);

                msg.textContent =
                    error.message;

                button.disabled = false;
                button.textContent = "LOGIN";
            }

        }
    );

}


/* =========================================
   DASHBOARD AUTH
========================================= */

const orderTable =
    document.getElementById("orders");


if (orderTable) {

    onAuthStateChanged(
        auth,
        async function(user) {

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


            document
                .getElementById("app")
                .style.display = "block";


            selectedDate =
                getTodayString();


            document
                .getElementById("orderDate")
                .value =
                selectedDate;


            await loadOrders();

        }
    );

}


/* =========================================
   TODAY
========================================= */

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


/* =========================================
   FIRESTORE DATE
========================================= */

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


/* =========================================
   DATE STRING
========================================= */

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


/* =========================================
   FORMAT DATE
========================================= */

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


/* =========================================
   TIME
========================================= */

function getTime(timestamp) {

    const date =
        convertToDate(timestamp);


    if (!date) {
        return 0;
    }


    return date.getTime();
}


/* =========================================
   LOAD ORDERS
========================================= */

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
                collection(
                    db,
                    "orders"
                )
            );


        allOrders = [];


        snapshot.forEach(
            function(item) {

                allOrders.push({

                    id: item.id,

                    data: item.data()

                });

            }
        );


        allOrders.sort(
            function(a,b) {

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

    } catch(error) {

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


/* =========================================
   FILTER ORDERS
========================================= */

function filterOrders() {

    const input =
        document.getElementById(
            "orderDate"
        );


    if (!input) {
        return;
    }


    selectedDate =
        input.value;


    if (!selectedDate) {

        renderOrders([]);

        return;
    }


    const filtered =
        allOrders.filter(
            function(item) {

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


/* =========================================
   RENDER ORDERS
========================================= */

function renderOrders(orders) {

    const table =
        document.getElementById(
            "orders"
        );


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
        function(item) {

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
                String(status)
                .toLowerCase()
                ===
                "pending"
            ) {

                pending++;

            }


            if (
                String(status)
                .toLowerCase()
                ===
                "success"
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

                <td>
                    <strong>
                        ${escapeHTML(status)}
                    </strong>
                </td>

                <td>

                    <button
                        class="action-btn success-btn"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Success">
                        ✔
                    </button>

                    <button
                        class="action-btn reject-btn"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Rejected">
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
        .querySelectorAll(
            ".action-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        changeStatus(
                            button.dataset.id,
                            button.dataset.status
                        );

                    }
                );

            }
        );
}


/* =========================================
   CARDS
========================================= */

function updateCards(
    total,
    revenue,
    pending,
    success
) {

    document
        .getElementById(
            "totalOrders"
        )
        .textContent =
        total;


    document
        .getElementById(
            "revenue"
        )
        .textContent =
        Number(revenue)
        .toLocaleString("en-LK");


    document
        .getElementById(
            "pendingOrders"
        )
        .textContent =
        pending;


    document
        .getElementById(
            "successOrders"
        )
        .textContent =
        success;
}


/* =========================================
   CREATE REDEEM CODE
========================================= */

const createRedeem =
    document.getElementById(
        "createRedeem"
    );


if (createRedeem) {

    createRedeem.addEventListener(
        "click",
        async function() {

            const userId =
                document
                .getElementById(
                    "walletUserId"
                )
                .value
                .trim();


            const email =
                document
                .getElementById(
                    "walletEmail"
                )
                .value
                .trim();


            const amount =
                Number(
                    document
                    .getElementById(
                        "walletAmount"
                    )
                    .value
                );


            const resultBox =
                document
                .getElementById(
                    "redeemResult"
                );


            if (!userId) {

                alert(
                    "Enter customer Firebase UID."
                );

                return;
            }


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                alert(
                    "Enter a valid amount."
                );

                return;
            }


            createRedeem.disabled =
                true;

            createRedeem.textContent =
                "Creating...";


            try {

                const response =
                    await workerRequest(
                        {
                            action:
                                "create_redeem_code",

                            amount:
                                amount,

                            userId:
                                userId,

                            email:
                                email
                        },
                        true
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to create code."
                    );

                }


                resultBox.style.display =
                    "block";


                resultBox.innerHTML = `

                    <div>
                        ✅ Redeem code created
                        successfully.
                    </div>

                    <div class="redeem-code-display">
                        ${escapeHTML(response.code)}
                    </div>

                    <div>
                        💰 Amount:
                        <strong>
                            LKR
                            ${Number(response.amount)
                              .toLocaleString("en-LK")}
                        </strong>
                    </div>

                    <div>
                        👤 Customer:
                        ${escapeHTML(response.userId)}
                    </div>

                    <br>

                    <button
                        class="wallet-button copy-code"
                        id="copyRedeemCode">
                        📋 Copy Code
                    </button>

                `;


                document
                    .getElementById(
                        "copyRedeemCode"
                    )
                    .addEventListener(
                        "click",
                        async function() {

                            await navigator
                                .clipboard
                                .writeText(
                                    response.code
                                );

                            this.textContent =
                                "✅ Copied";

                        }
                    );


                document
                    .getElementById(
                        "walletAmount"
                    )
                    .value = "";


            } catch(error) {

                console.error(error);

                resultBox.style.display =
                    "block";

                resultBox.innerHTML =
                    `❌ ${escapeHTML(error.message)}`;

            } finally {

                createRedeem.disabled =
                    false;

                createRedeem.textContent =
                    "🎟️ Create Code";

            }

        }
    );

}


/* =========================================
   CHECK REDEEM
========================================= */

const checkRedeem =
    document.getElementById(
        "checkRedeem"
    );


if (checkRedeem) {

    checkRedeem.addEventListener(
        "click",
        async function() {

            const code =
                document
                .getElementById(
                    "checkCode"
                )
                .value
                .trim()
                .toUpperCase();


            const resultBox =
                document
                .getElementById(
                    "checkResult"
                );


            if (!code) {

                alert(
                    "Enter redeem code."
                );

                return;
            }


            checkRedeem.disabled =
                true;

            checkRedeem.textContent =
                "Checking...";


            try {

                const response =
                    await workerRequest(
                        {
                            action:
                                "admin_redeem_info",

                            code:
                                code
                        },
                        true
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Code not found."
                    );

                }


                const redeem =
                    response.redeem;


                resultBox.style.display =
                    "block";


                resultBox.innerHTML = `

                    <strong>
                        ${redeem.status === "AVAILABLE"
                            ? "🟢 AVAILABLE"
                            : "🔴 USED"}
                    </strong>

                    <br><br>

                    🎟️ Code:
                    ${escapeHTML(redeem.code)}

                    <br>

                    💰 Amount:
                    LKR
                    ${Number(redeem.amount)
                      .toLocaleString("en-LK")}

                    <br>

                    👤 Firebase UID:
                    ${escapeHTML(redeem.userId)}

                    <br>

                    📧 Email:
                    ${escapeHTML(redeem.email || "-")}

                    <br>

                    📅 Created:
                    ${escapeHTML(redeem.createdAt || "-")}

                    ${
                        redeem.usedAt
                        ? `<br>
                           🕒 Used:
                           ${escapeHTML(redeem.usedAt)}`
                        : ""
                    }

                `;


            } catch(error) {

                console.error(error);

                resultBox.style.display =
                    "block";

                resultBox.innerHTML =
                    `❌ ${escapeHTML(error.message)}`;

            } finally {

                checkRedeem.disabled =
                    false;

                checkRedeem.textContent =
                    "🔎 Check Code";

            }

        }
    );

}


/* =========================================
   WORKER REQUEST
========================================= */

async function workerRequest(
    data,
    adminRequest = false
) {

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "Admin login required."
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


    /*
     * IMPORTANT:
     *
     * Do NOT put ADMIN_SECRET
     * inside this JavaScript.
     *
     * Your Cloudflare Worker should
     * authenticate admin requests
     * using Firebase admin verification
     * or another secure server-side method.
     */


    const response =
        await fetch(
            WORKER_URL,
            {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data)
            }
        );


    let result;


    try {

        result =
            await response.json();

    } catch {

        throw new Error(
            "Worker returned invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(
            result.message ||
            `Worker error ${response.status}`
        );

    }


    return result;
}


/* =========================================
   DATE SEARCH
========================================= */

const dateSearch =
    document.getElementById(
        "dateSearch"
    );


if (dateSearch) {

    dateSearch.addEventListener(
        "click",
        function() {

            const input =
                document.getElementById(
                    "orderDate"
                );


            if (!input.value) {

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


/* =========================================
   DATE CHANGE
========================================= */

const orderDate =
    document.getElementById(
        "orderDate"
    );


if (orderDate) {

    orderDate.addEventListener(
        "change",
        function() {

            selectedDate =
                orderDate.value;

        }
    );

}


/* =========================================
   TODAY
========================================= */

const todayButton =
    document.getElementById(
        "todayButton"
    );


if (todayButton) {

    todayButton.addEventListener(
        "click",
        function() {

            const today =
                getTodayString();


            document
                .getElementById(
                    "orderDate"
                )
                .value =
                today;


            selectedDate =
                today;


            filterOrders();

        }
    );

}


/* =========================================
   SEARCH
========================================= */

const search =
    document.getElementById(
        "search"
    );


if (search) {

    search.addEventListener(
        "input",
        function() {

            const text =
                search.value
                .trim()
                .toLowerCase();


            let filtered =
                allOrders.filter(
                    function(item) {

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
                        function(item) {

                            const order =
                                item.data;


                            const values = [

                                item.id,

                                order.orderId,

                                order.orderID,

                                order.customerName,

                                order.name,

                                order.userId,

                                order.uid,

                                order.gameUID,

                                order.gameUid,

                                order.productName,

                                order.product,

                                order.package,

                                order.paymentMethod,

                                order.payment,

                                order.status

                            ];


                            return values.some(
                                function(value) {

                                    return (
                                        value !==
                                        undefined &&
                                        value !==
                                        null &&
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


/* =========================================
   REFRESH
========================================= */

const refresh =
    document.getElementById(
        "refresh"
    );


if (refresh) {

    refresh.addEventListener(
        "click",
        async function() {

            refresh.disabled =
                true;

            refresh.textContent =
                "Loading...";


            await loadOrders();


            refresh.disabled =
                false;

            refresh.textContent =
                "↻ Refresh";

        }
    );

}


/* =========================================
   LOGOUT
========================================= */

const logout =
    document.getElementById(
        "logout"
    );


if (logout) {

    logout.addEventListener(
        "click",
        async function() {

            await signOut(auth);

            window.location.href =
                "./admin-login.html";

        }
    );

}


/* =========================================
   CHANGE ORDER STATUS
========================================= */

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
            "Access denied."
        );

        return;
    }


    if (
        !confirm(
            `Change status to ${status}?`
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


    } catch(error) {

        console.error(error);

        alert(
            "Failed to update order."
        );

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

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
