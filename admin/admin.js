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


let allOrders = [];
let selectedDate = "";


/* =====================================
   ADMIN CHECK
===================================== */

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

        console.error("Admin check error:", error);

        return false;
    }
}


/* =====================================
   LOGIN
===================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const msg =
            document.getElementById("msg");

        const button =
            document.getElementById("login");


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
                await checkAdmin(result.user);


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


        } catch (error) {

            console.error(error);

            msg.textContent =
                error.message;

            button.disabled = false;
            button.textContent = "LOGIN";
        }

    });

}


/* =====================================
   DASHBOARD AUTH
===================================== */

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


            document.getElementById("app")
                .style.display = "block";


            /*
             * AUTOMATICALLY SELECT TODAY
             */

            selectedDate =
                getTodayString();


            document.getElementById("orderDate")
                .value = selectedDate;


            await loadOrders();

        }
    );

}


/* =====================================
   GET TODAY
===================================== */

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


/* =====================================
   FIREBASE TIMESTAMP → DATE
===================================== */

function convertToDate(value) {

    if (!value) {
        return null;
    }


    /*
     * Firebase Timestamp
     */

    if (
        typeof value.toDate === "function"
    ) {

        return value.toDate();

    }


    /*
     * JavaScript Date
     */

    if (value instanceof Date) {

        return value;

    }


    /*
     * Firestore timestamp object
     */

    if (
        value.seconds !== undefined
    ) {

        return new Date(
            Number(value.seconds) * 1000
        );

    }


    /*
     * String / number
     */

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


/* =====================================
   GET DATE YYYY-MM-DD
===================================== */

function getDateString(value) {

    const date =
        convertToDate(value);


    if (!date) {
        return "";
    }


    /*
     * IMPORTANT:
     * Uses local Sri Lankan time.
     */

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


/* =====================================
   FORMAT DATE
===================================== */

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


/* =====================================
   SORT TIME
===================================== */

function getTime(timestamp) {

    const date =
        convertToDate(timestamp);


    if (!date) {
        return 0;
    }


    return date.getTime();
}


/* =====================================
   LOAD ALL ORDERS
===================================== */

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
            function (item) {

                allOrders.push({

                    id: item.id,

                    data: item.data()

                });

            }
        );


        /*
         * NEWEST FIRST
         */

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


        /*
         * SHOW SELECTED DATE
         */

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


/* =====================================
   FILTER BY DATE
===================================== */

function filterOrders() {

    /*
     * Always read the date directly
     * from the date input.
     */

    const dateInput =
        document.getElementById(
            "orderDate"
        );


    if (!dateInput) {
        return;
    }


    selectedDate =
        dateInput.value;


    console.log(
        "Selected date:",
        selectedDate
    );


    if (!selectedDate) {

        renderOrders([]);

        return;
    }


    const filtered =
        allOrders.filter(
            function (item) {

                const orderDate =
                    getDateString(
                        item.data.createdAt
                    );


                console.log(
                    "Order:",
                    item.id,
                    "Date:",
                    orderDate
                );


                return (
                    orderDate ===
                    selectedDate
                );

            }
        );


    console.log(
        "Orders found:",
        filtered.length
    );


    renderOrders(
        filtered
    );
}


/* =====================================
   RENDER ORDERS
===================================== */

function renderOrders(orders) {

    const table =
        document.getElementById("orders");


    let total = 0;

    let revenue = 0;

    let pending = 0;

    let success = 0;


    table.innerHTML = "";


    /*
     * NO ORDERS
     */

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


            /*
             * ORDER ID
             */

            const orderId =
                order.orderId ||
                order.orderID ||
                order.orderNumber ||
                item.id;


            /*
             * CUSTOMER
             */

            const customer =
                order.customerName ||
                order.name ||
                "-";


            /*
             * FIREBASE UID
             */

            const uid =
                order.userId ||
                order.uid ||
                "-";


            /*
             * GAME UID
             */

            const gameUID =
                order.gameUID ||
                order.gameUid ||
                order.gameId ||
                "-";


            /*
             * PRODUCT
             */

            const product =
                order.productName ||
                order.product ||
                order.package ||
                order.plan ||
                "-";


            /*
             * PRICE
             */

            const price =
                Number(
                    order.productPrice ||
                    order.price ||
                    0
                );


            /*
             * PAYMENT
             */

            const payment =
                order.paymentMethod ||
                order.payment ||
                "-";


            /*
             * TOTAL
             */

            const amount =
                Number(
                    order.total ||
                    order.amount ||
                    price ||
                    0
                );


            /*
             * DATE
             */

            const date =
                formatDate(
                    order.createdAt
                );


            /*
             * STATUS
             */

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
                    ${escapeHTML(uid)}
                </td>


                <td>
                    ${escapeHTML(gameUID)}
                </td>


                <td>
                    ${escapeHTML(product)}
                </td>


                <td>
                    Rs. ${price}
                </td>


                <td>
                    ${escapeHTML(payment)}
                </td>


                <td>
                    ${escapeHTML(date)}
                </td>


                <td>
                    Rs. ${amount}
                </td>


                <td class="${escapeHTML(status)}">
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


    /*
     * STATUS BUTTONS
     */

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


/* =====================================
   UPDATE CARDS
===================================== */

function updateCards(
    total,
    revenue,
    pending,
    success
) {

    document.getElementById(
        "totalOrders"
    ).textContent = total;


    document.getElementById(
        "revenue"
    ).textContent =
        Number(revenue)
        .toLocaleString("en-LK");


    document.getElementById(
        "pendingOrders"
    ).textContent = pending;


    document.getElementById(
        "successOrders"
    ).textContent = success;
}


/* =====================================
   DATE SEARCH BUTTON
===================================== */

const dateSearch =
    document.getElementById(
        "dateSearch"
    );


if (dateSearch) {

    dateSearch.addEventListener(
        "click",
        function () {

            console.log(
                "DATE SEARCH CLICKED"
            );


            const input =
                document.getElementById(
                    "orderDate"
                );


            if (!input) {

                alert(
                    "Date input not found"
                );

                return;
            }


            if (!input.value) {

                alert(
                    "Please select a date"
                );

                return;
            }


            selectedDate =
                input.value;


            /*
             * Search immediately.
             */

            filterOrders();

        }
    );
}


/* =====================================
   DATE CHANGE
===================================== */

const orderDate =
    document.getElementById(
        "orderDate"
    );


if (orderDate) {

    orderDate.addEventListener(
        "change",
        function () {

            console.log(
                "Date selected:",
                orderDate.value
            );

        }
    );
}


/* =====================================
   TODAY BUTTON
===================================== */

const todayButton =
    document.getElementById(
        "todayButton"
    );


if (todayButton) {

    todayButton.addEventListener(
        "click",
        async function () {

            const today =
                getTodayString();


            document.getElementById(
                "orderDate"
            ).value =
                today;


            selectedDate =
                today;


            /*
             * Use existing loaded orders.
             */

            filterOrders();

        }
    );
}


/* =====================================
   TEXT SEARCH
===================================== */

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


            /*
             * FIRST DATE FILTER
             */

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


            /*
             * THEN TEXT FILTER
             */

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


/* =====================================
   REFRESH
===================================== */

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


/* =====================================
   LOGOUT
===================================== */

const logout =
    document.getElementById(
        "logout"
    );


if (logout) {

    logout.addEventListener(
        "click",
        async function () {

            await signOut(auth);

            window.location.href =
                "./admin-login.html";

        }
    );
}


/* =====================================
   STATUS CHANGE
===================================== */

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
                status: status
            }
        );


        await loadOrders();

    } catch (error) {

        console.error(error);

        alert(
            "Failed to update order"
        );
    }
}


/* =====================================
   ESCAPE HTML
===================================== */

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
