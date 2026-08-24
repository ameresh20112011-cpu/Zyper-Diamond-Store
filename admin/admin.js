```javascript
// ==========================================
// ZYPER DIAMOND STORE
// ADMIN JAVASCRIPT
// ==========================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// GLOBAL
// ==========================================

let allOrders = [];


// ==========================================
// ADMIN CHECK
// ==========================================

async function checkAdmin(user) {

    try {

        if (!user) {
            return false;
        }

        const adminRef = doc(
            db,
            "users",
            user.uid
        );

        const adminSnapshot =
            await getDoc(adminRef);

        if (!adminSnapshot.exists()) {
            return false;
        }

        const data =
            adminSnapshot.data();

        return data.role === "admin";

    } catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        return false;
    }
}


// ==========================================
// ADMIN LOGIN PAGE
// ==========================================

const loginButton =
    document.getElementById("login");


if (loginButton) {

    loginButton.addEventListener(
        "click",
        adminLogin
    );

    const passwordInput =
        document.getElementById("password");

    if (passwordInput) {

        passwordInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    adminLogin();
                }

            }
        );
    }
}


async function adminLogin() {

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const msg =
        document.getElementById("msg");

    if (!emailInput || !passwordInput) {
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        if (msg) {
            msg.textContent =
                "❌ Enter email and password.";
        }

        return;
    }

    loginButton.disabled = true;
    loginButton.textContent =
        "Logging in...";

    try {

        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const isAdmin =
            await checkAdmin(
                result.user
            );

        if (!isAdmin) {

            if (msg) {
                msg.textContent =
                    "❌ This account is not an admin.";
            }

            await signOut(auth);

            loginButton.disabled = false;

            loginButton.textContent =
                "LOGIN";

            return;
        }

        window.location.href =
            "admin-dashboard.html";

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        let message =
            "❌ Login failed.";

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "❌ Incorrect email or password.";

        } else if (
            error.code ===
            "auth/user-not-found"
        ) {

            message =
                "❌ User account not found.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "❌ Incorrect password.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "❌ Invalid email address.";

        } else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            message =
                "❌ Too many attempts. Try again later.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "❌ Network error. Check your internet.";

        } else {

            message =
                "❌ " +
                error.message;
        }

        if (msg) {
            msg.textContent =
                message;
        }

        loginButton.disabled = false;

        loginButton.textContent =
            "LOGIN";
    }
}


// ==========================================
// DASHBOARD AUTH PROTECTION
// ==========================================

const ordersTable =
    document.getElementById("orders");


if (ordersTable) {

    onAuthStateChanged(
        auth,
        async function (user) {

            const isAdmin =
                await checkAdmin(user);

            if (!isAdmin) {

                window.location.href =
                    "admin-login.html";

                return;
            }

            const app =
                document.getElementById("app");

            if (app) {
                app.style.display =
                    "block";
            }

            await loadOrders();

        }
    );
}


// ==========================================
// FORMAT DATE
// ==========================================

function getDateObject(timestamp) {

    if (!timestamp) {
        return null;
    }

    try {

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp.toDate();
        }

        if (
            timestamp.seconds !==
            undefined
        ) {

            return new Date(
                timestamp.seconds * 1000
            );
        }

        if (
            timestamp instanceof Date
        ) {

            return timestamp;
        }

        if (
            typeof timestamp === "string"
        ) {

            const date =
                new Date(timestamp);

            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        return null;

    } catch {

        return null;
    }
}


function formatDate(timestamp) {

    const date =
        getDateObject(timestamp);

    if (!date) {
        return "-";
    }

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}


// ==========================================
// DATE ONLY
// ==========================================

function formatDateForInput(timestamp) {

    const date =
        getDateObject(timestamp);

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


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const table =
        document.getElementById("orders");

    if (!table) {
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="11" class="empty-row">
                ⏳ Loading orders...
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


        // Newest first

        allOrders.sort(
            function (a, b) {

                const dateA =
                    getDateObject(
                        a.data.createdAt
                    );

                const dateB =
                    getDateObject(
                        b.data.createdAt
                    );

                if (!dateA && !dateB) {
                    return 0;
                }

                if (!dateA) {
                    return 1;
                }

                if (!dateB) {
                    return -1;
                }

                return (
                    dateB.getTime() -
                    dateA.getTime()
                );
            }
        );


        renderOrders(
            allOrders
        );


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="11"
                    class="error-row">

                    ❌ Failed to load orders

                    <br><br>

                    ${escapeHTML(
                        error.message
                    )}

                </td>
            </tr>
        `;
    }
}


// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders(orders) {

    const table =
        document.getElementById("orders");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    let totalOrders = 0;

    let revenue = 0;

    let pending = 0;

    let success = 0;


    if (orders.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="11"
                    class="empty-row">

                    📦 No orders found.

                </td>
            </tr>
        `;

        updateStatistics(
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


            // CUSTOMER NAME

            const customer =
                order.customerName ||
                order.playerName ||
                order.name ||
                "-";


            // CUSTOMER EMAIL

            const email =
                order.email ||
                order.customerEmail ||
                order.userEmail ||
                "-";


            // FIREBASE UID

            const firebaseUID =
                order.userId ||
                order.uid ||
                "-";


            // GAME UID

            const gameUID =
                order.gameUID ||
                order.gameUid ||
                order.gameId ||
                order.freeFireUID ||
                "-";


            // PRODUCT

            const product =
                order.productName ||
                order.product ||
                order.package ||
                order.plan ||
                "-";


            // PRICE

            const price =
                Number(
                    order.productPrice ||
                    order.price ||
                    0
                );


            // PAYMENT

            const payment =
                order.paymentMethod ||
                order.payment ||
                "-";


            // TOTAL

            const total =
                Number(
                    order.total ||
                    order.amount ||
                    price
                );


            // DATE

            const date =
                formatDate(
                    order.createdAt
                );


            // STATUS

            const rawStatus =
                order.status ||
                "Pending";


            const status =
                normalizeStatus(
                    rawStatus
                );


            totalOrders++;

            revenue += total;


            if (
                status === "Pending"
            ) {

                pending++;
            }


            if (
                status === "Success"
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
                        ${escapeHTML(
                            item.id
                        )}
                    </strong>
                </td>


                <td>
                    ${escapeHTML(
                        customer
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        email
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
                    ${escapeHTML(
                        product
                    )}
                </td>


                <td>
                    LKR
                    ${price.toLocaleString(
                        "en-US"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        payment
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        date
                    )}
                </td>


                <td>

                    <span class="
                        status
                        ${status.toLowerCase()}
                    ">

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </td>


                <td>

                    <button
                        class="action-success"
                        data-id="${escapeHTML(
                            item.id
                        )}"
                        data-status="Success"
                        title="Mark Success">

                        ✔

                    </button>


                    <button
                        class="action-rejected"
                        data-id="${escapeHTML(
                            item.id
                        )}"
                        data-status="Rejected"
                        title="Reject Order">

                        ✖

                    </button>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    updateStatistics(
        totalOrders,
        revenue,
        pending,
        success
    );


    attachActionButtons();
}


// ==========================================
// NORMALIZE STATUS
// ==========================================

function normalizeStatus(status) {

    const value =
        String(status)
        .trim()
        .toLowerCase();


    if (
        value === "success" ||
        value === "approved" ||
        value === "complete" ||
        value === "completed"
    ) {

        return "Success";
    }


    if (
        value === "rejected" ||
        value === "reject" ||
        value === "failed"
    ) {

        return "Rejected";
    }


    return "Pending";
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics(
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
            revenue.toLocaleString(
                "en-US"
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


// ==========================================
// ACTION BUTTONS
// ==========================================

function attachActionButtons() {

    document
        .querySelectorAll(
            "[data-status]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        changeStatus(
                            this.dataset.id,
                            this.dataset.status
                        );

                    }
                );

            }
        );
}


// ==========================================
// CHANGE STATUS
// ==========================================

async function changeStatus(
    id,
    status
) {

    try {

        const user =
            auth.currentUser;


        const isAdmin =
            await checkAdmin(
                user
            );


        if (!isAdmin) {

            alert(
                "❌ Access denied."
            );

            return;
        }


        const message =
            status === "Success"
                ? "Mark this order as Success?"
                : "Reject this order?";


        if (!confirm(message)) {
            return;
        }


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

        applyFilters();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ Failed to update status:\n\n" +
            error.message
        );
    }
}


// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "search"
        );

    const dateInput =
        document.getElementById(
            "dateFilter"
        );

    const statusInput =
        document.getElementById(
            "statusFilter"
        );


    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedDate =
        dateInput
            ? dateInput.value
            : "";


    const selectedStatus =
        statusInput
            ? statusInput.value
            : "all";


    const filtered =
        allOrders.filter(
            function (item) {

                const order =
                    item.data;


                // SEARCH

                const searchableText = [

                    item.id,

                    order.customerName,

                    order.playerName,

                    order.name,

                    order.email,

                    order.customerEmail,

                    order.userEmail,

                    order.userId,

                    order.uid,

                    order.gameUID,

                    order.gameUid,

                    order.gameId,

                    order.freeFireUID,

                    order.productName,

                    order.product,

                    order.package,

                    order.plan,

                    order.paymentMethod,

                    order.payment,

                    order.status

                ]
                .filter(
                    value =>
                        value !==
                        undefined &&
                        value !==
                        null
                )
                .join(" ")
                .toLowerCase();


                if (
                    searchValue &&
                    !searchableText.includes(
                        searchValue
                    )
                ) {

                    return false;
                }


                // DATE FILTER

                if (selectedDate) {

                    const orderDate =
                        formatDateForInput(
                            order.createdAt
                        );


                    if (
                        orderDate !==
                        selectedDate
                    ) {

                        return false;
                    }
                }


                // STATUS FILTER

                if (
                    selectedStatus !==
                    "all"
                ) {

                    const currentStatus =
                        normalizeStatus(
                            order.status
                        );


                    if (
                        currentStatus !==
                        selectedStatus
                    ) {

                        return false;
                    }
                }


                return true;

            }
        );


    renderOrders(
        filtered
    );


    updateFilterInfo(
        filtered.length,
        selectedDate,
        selectedStatus,
        searchValue
    );
}


// ==========================================
// FILTER INFORMATION
// ==========================================

function updateFilterInfo(
    count,
    date,
    status,
    search
) {

    const element =
        document.getElementById(
            "filterInfo"
        );


    if (!element) {
        return;
    }


    const parts = [];


    if (date) {

        parts.push(
            "📅 " + date
        );
    }


    if (
        status &&
        status !== "all"
    ) {

        parts.push(
            "📌 " + status
        );
    }


    if (search) {

        parts.push(
            "🔎 " + search
        );
    }


    if (parts.length === 0) {

        element.textContent =
            `All Orders • ${count}`;

    } else {

        element.textContent =
            `${parts.join(" • ")} • ${count}`;
    }
}


// ==========================================
// SEARCH
// ==========================================

const search =
    document.getElementById(
        "search"
    );


if (search) {

    search.addEventListener(
        "input",
        applyFilters
    );
}


// ==========================================
// DATE FILTER
// ==========================================

const dateFilter =
    document.getElementById(
        "dateFilter"
    );


if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        applyFilters
    );
}


// ==========================================
// STATUS FILTER
// ==========================================

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );
}


// ==========================================
// CLEAR FILTER
// ==========================================

const clearFilter =
    document.getElementById(
        "clearFilter"
    );


if (clearFilter) {

    clearFilter.addEventListener(
        "click",
        function () {

            if (search) {
                search.value = "";
            }

            if (dateFilter) {
                dateFilter.value = "";
            }

            if (statusFilter) {
                statusFilter.value =
                    "all";
            }

            renderOrders(
                allOrders
            );

            updateFilterInfo(
                allOrders.length,
                "",
                "all",
                ""
            );

        }
    );
}


// ==========================================
// REFRESH
// ==========================================

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
                "⏳ Loading...";

            try {

                await loadOrders();

                applyFilters();

            } finally {

                refresh.disabled = false;

                refresh.textContent =
                    "🔄 Refresh";
            }

        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

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

                window.location.href =
                    "admin-login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "❌ Logout failed."
                );
            }

        }
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

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
```
