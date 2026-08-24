```javascript
import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =====================================================
// CHECK ADMIN
// =====================================================

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

        return (
            adminDoc.exists() &&
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


// =====================================================
// LOGIN
// =====================================================

const loginButton =
document.getElementById("login");


if (loginButton) {

    loginButton.onclick = async () => {

        const email =
        document.getElementById("email").value.trim();

        const password =
        document.getElementById("password").value;

        const msg =
        document.getElementById("msg");


        if (!email || !password) {

            msg.innerHTML =
            "Enter email and password";

            return;
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


            if (admin) {

                location.href =
                "admin-dashboard.html";

            } else {

                msg.innerHTML =
                "❌ You are not admin";

                await signOut(auth);
            }


        } catch (error) {

            console.error(error);

            msg.innerHTML =
            error.message;
        }

    };

}


// =====================================================
// DASHBOARD PROTECTION
// =====================================================

const orderTable =
document.getElementById("orders");


if (orderTable) {

    onAuthStateChanged(
        auth,
        async (user) => {

            const admin =
            await checkAdmin(user);


            if (!admin) {

                location.href =
                "admin-login.html";

                return;
            }


            const app =
            document.getElementById("app");


            if (app) {

                app.style.display =
                "block";
            }


            loadOrders();

        }
    );

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "-";
    }


    if (timestamp.toDate) {

        const date =
        timestamp.toDate();


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


    return timestamp;
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    const table =
    document.getElementById("orders");


    table.innerHTML = `
        <tr>
            <td colspan="12">
                ⏳ Loading orders...
            </td>
        </tr>
    `;


    let totalOrders = 0;
    let revenue = 0;
    let pending = 0;
    let success = 0;


    try {

        const snapshot =
        await getDocs(
            collection(
                db,
                "orders"
            )
        );


        let orders = [];


        snapshot.forEach(
            (document) => {

                orders.push({

                    id: document.id,

                    data: document.data()

                });

            }
        );


        // =================================================
        // NEWEST FIRST
        // =================================================

        orders.sort(
            (a, b) => {

                const dateA =
                a.data.createdAt;

                const dateB =
                b.data.createdAt;


                if (
                    dateA &&
                    dateB &&
                    dateA.seconds !== undefined &&
                    dateB.seconds !== undefined
                ) {

                    return (
                        dateB.seconds -
                        dateA.seconds
                    );
                }


                return 0;
            }
        );


        table.innerHTML = "";


        if (orders.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="12">
                        No orders found.
                    </td>
                </tr>
            `;

        }


        // =================================================
        // DISPLAY ORDERS
        // =================================================

        orders.forEach(
            (item) => {

                const order =
                item.data;


                // -------------------------------
                // CUSTOMER
                // -------------------------------

                const customer =
                order.customerName ||
                order.playerName ||
                order.name ||
                "-";


                // -------------------------------
                // PHONE
                // -------------------------------

                const phone =
                order.phone ||
                order.customerPhone ||
                order.whatsapp ||
                "-";


                // -------------------------------
                // FIREBASE UID
                // -------------------------------

                const firebaseUID =
                order.userId ||
                order.firebaseUID ||
                "-";


                // -------------------------------
                // GAME UID
                // -------------------------------

                const gameUID =
                order.gameUID ||
                order.gameUid ||
                order.gameId ||
                order.uid ||
                "-";


                // -------------------------------
                // PRODUCT
                // -------------------------------

                const product =
                order.productName ||
                order.product ||
                order.package ||
                order.plan ||
                "-";


                // -------------------------------
                // PRICE
                // -------------------------------

                const price =
                Number(
                    order.productPrice ||
                    order.price ||
                    0
                );


                // -------------------------------
                // PAYMENT
                // -------------------------------

                const payment =
                order.paymentMethod ||
                order.payment ||
                "-";


                // -------------------------------
                // TOTAL
                // -------------------------------

                const total =
                Number(
                    order.total ||
                    order.amount ||
                    price
                );


                // -------------------------------
                // ORDER ID
                // -------------------------------

                const orderId =
                order.orderId ||
                item.id;


                // -------------------------------
                // DATE
                // -------------------------------

                const date =
                formatDate(
                    order.createdAt
                );


                // -------------------------------
                // STATUS
                // -------------------------------

                const status =
                order.status ||
                "Pending";


                // -------------------------------
                // COUNTERS
                // -------------------------------

                totalOrders++;

                revenue += total;


                if (
                    status === "Pending"
                ) {

                    pending++;
                }


                if (
                    status === "Success" ||
                    status === "Successful"
                ) {

                    success++;
                }


                // =================================================
                // ACTION AREA
                // =================================================

                let actionHTML = "";


                if (
                    status === "Pending"
                ) {

                    actionHTML = `

                    <div class="action-box">

                        <div
                            class="receipt-paste"
                            id="paste-${item.id}"
                            data-order-id="${escapeHTML(item.id)}"
                            tabindex="0">

                            📸 Click here and
                            <b>paste receipt</b>

                            <div
                                class="paste-preview"
                                id="preview-${item.id}">
                            </div>

                        </div>


                        <button
                            class="success-btn"
                            onclick="changeStatus('${item.id}','Success')">

                            ✅ DONE / SUCCESS

                        </button>


                        <button
                            class="reject-btn"
                            onclick="changeStatus('${item.id}','Rejected')">

                            ❌ REJECT

                        </button>

                    </div>

                    `;

                } else {

                    actionHTML = `

                    <div class="completed-action">

                        ${
                            status === "Success" ||
                            status === "Successful"

                            ? "✅ Completed"

                            : "❌ Rejected"
                        }

                    </div>

                    `;
                }


                // =================================================
                // TABLE ROW
                // =================================================

                table.innerHTML += `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(orderId)}
                        </strong>

                    </td>


                    <td>
                        ${escapeHTML(customer)}
                    </td>


                    <td>
                        ${escapeHTML(phone)}
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
                        LKR ${price.toLocaleString("en-US")}
                    </td>


                    <td>
                        ${escapeHTML(payment)}
                    </td>


                    <td>
                        ${escapeHTML(date)}
                    </td>


                    <td>
                        LKR ${total.toLocaleString("en-US")}
                    </td>


                    <td
                        class="status-cell
                        ${escapeHTML(status)}">

                        ${escapeHTML(status)}

                    </td>


                    <td>

                        ${actionHTML}

                    </td>

                </tr>

                `;


                // =================================================
                // PASTE RECEIPT HANDLER
                // =================================================

                setTimeout(
                    () => {

                        const pasteBox =
                        document.getElementById(
                            `paste-${item.id}`
                        );


                        if (!pasteBox) {
                            return;
                        }


                        pasteBox.addEventListener(
                            "paste",
                            (event) => {

                                const items =
                                event.clipboardData.items;


                                let foundImage =
                                false;


                                for (
                                    const clipboardItem
                                    of items
                                ) {

                                    if (
                                        clipboardItem.type
                                        .startsWith("image/")
                                    ) {

                                        foundImage =
                                        true;


                                        const file =
                                        clipboardItem.getAsFile();


                                        if (!file) {
                                            return;
                                        }


                                        const preview =
                                        document.getElementById(
                                            `preview-${item.id}`
                                        );


                                        const imageURL =
                                        URL.createObjectURL(
                                            file
                                        );


                                        preview.innerHTML = `

                                            <img
                                                src="${imageURL}"
                                                alt="Receipt"
                                            >

                                            <div>
                                                ✅ Receipt pasted
                                            </div>

                                        `;


                                        pasteBox.classList.add(
                                            "receipt-pasted"
                                        );


                                        event.preventDefault();

                                        break;
                                    }

                                }


                                if (!foundImage) {

                                    alert(
                                        "Please copy a receipt image first, then paste it here."
                                    );

                                }

                            }
                        );

                    },
                    0
                );

            }
        );


        // =================================================
        // UPDATE CARDS
        // =================================================

        document.getElementById(
            "totalOrders"
        ).textContent =
        totalOrders;


        document.getElementById(
            "revenue"
        ).textContent =
        revenue.toLocaleString("en-US");


        document.getElementById(
            "pendingOrders"
        ).textContent =
        pending;


        document.getElementById(
            "successOrders"
        ).textContent =
        success;


        setupSearch();


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="12">

                    ❌ Unable to load orders.

                    <br><br>

                    ${escapeHTML(error.message)}

                </td>

            </tr>

        `;
    }

}


// =====================================================
// CHANGE STATUS
// =====================================================

window.changeStatus =
async function(id, status) {

    const user =
    auth.currentUser;


    const admin =
    await checkAdmin(user);


    if (!admin) {

        alert(
            "❌ Access denied."
        );

        return;
    }


    // =================================================
    // GET ORDER
    // =================================================

    let order;


    try {

        const orderSnapshot =
        await getDoc(
            doc(
                db,
                "orders",
                id
            )
        );


        if (!orderSnapshot.exists()) {

            alert(
                "❌ Order not found."
            );

            return;
        }


        order =
        orderSnapshot.data();


    } catch (error) {

        console.error(error);

        alert(
            "❌ Unable to read order."
        );

        return;
    }


    // =================================================
    // CONFIRM
    // =================================================

    const orderId =
    order.orderId ||
    id;


    const customer =
    order.customerName ||
    order.playerName ||
    order.name ||
    "Customer";


    const phone =
    order.phone ||
    order.customerPhone ||
    order.whatsapp ||
    "";


    const gameUID =
    order.gameUID ||
    order.gameUid ||
    order.gameId ||
    order.uid ||
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
        order.total ||
        order.amount ||
        0
    );


    // =================================================
    // SUCCESS
    // =================================================

    if (
        status === "Success"
    ) {

        const confirmed =
        confirm(
            `Mark Order ${orderId} as SUCCESSFUL?\n\n` +
            `Customer: ${customer}\n` +
            `UID: ${gameUID}\n` +
            `Package: ${product}`
        );


        if (!confirmed) {
            return;
        }

    }


    // =================================================
    // REJECT
    // =================================================

    if (
        status === "Rejected"
    ) {

        const confirmed =
        confirm(
            `Reject Order ${orderId}?\n\n` +
            `Customer: ${customer}\n` +
            `UID: ${gameUID}\n` +
            `Package: ${product}`
        );


        if (!confirmed) {
            return;
        }

    }


    // =================================================
    // UPDATE FIREBASE
    // =================================================

    try {

        await updateDoc(

            doc(
                db,
                "orders",
                id
            ),

            {

                status: status,

                statusUpdatedAt:
                new Date()

            }

        );


        // =================================================
        // WHATSAPP
        // =================================================

        if (phone) {

            openWhatsApp(
                phone,
                {
                    orderId,
                    customer,
                    gameUID,
                    product,
                    price,
                    status
                }
            );

        } else {

            alert(
                `✅ Firebase updated to ${status}.\n\n` +
                `⚠️ No customer phone number was found, so WhatsApp could not be opened.`
            );

        }


        // =================================================
        // RELOAD
        // =================================================

        await loadOrders();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ Failed to update Firebase:\n\n" +
            error.message
        );

    }

};


// =====================================================
// OPEN WHATSAPP WEB
// =====================================================

function openWhatsApp(
    phone,
    order
) {

    // Remove spaces, +, -, brackets etc.
    let cleanPhone =
    String(phone)
        .replace(
            /[\s\-().]/g,
            ""
        );


    // Sri Lankan 07XXXXXXXX
    if (
        cleanPhone.startsWith("0")
    ) {

        cleanPhone =
        "94" +
        cleanPhone.substring(1);

    }


    // Remove leading +
    cleanPhone =
    cleanPhone.replace(
        /^\+/,
        ""
    );


    let message = "";


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

    if (
        order.status === "Success"
    ) {

        message =

`💎 ZYPER DIAMOND STORE

━━━━━━━━━━━━━━━━━━

🧾 ORDER ID: ${order.orderId}

📦 Package: ${order.product}

💰 Price: LKR ${order.price.toLocaleString("en-US")}

🎮 UID: ${order.gameUID}

👤 Customer: ${order.customer}

━━━━━━━━━━━━━━━━━━

✅ PAYMENT SUCCESSFUL

Your payment has been verified.

🎉 Your order has been completed successfully.

Thank you for ordering with Zyper Diamond Store ❤️

━━━━━━━━━━━━━━━━━━`;

    }


    // =================================================
    // REJECT MESSAGE
    // =================================================

    else if (
        order.status === "Rejected"
    ) {

        message =

`💎 ZYPER DIAMOND STORE

━━━━━━━━━━━━━━━━━━

🧾 ORDER ID: ${order.orderId}

📦 Package: ${order.product}

💰 Price: LKR ${order.price.toLocaleString("en-US")}

🎮 UID: ${order.gameUID}

👤 Customer: ${order.customer}

━━━━━━━━━━━━━━━━━━

❌ PAYMENT REJECTED

Your payment receipt could not be verified.

Please contact Zyper Diamond Store support.

━━━━━━━━━━━━━━━━━━`;

    }


    if (!message) {
        return;
    }


    // =================================================
    // WHATSAPP WEB URL
    // =================================================

    const whatsappURL =
    `https://web.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;


    // =================================================
    // OPEN WHATSAPP
    // =================================================

    window.open(
        whatsappURL,
        "_blank"
    );

}


// =====================================================
// SEARCH
// =====================================================

let searchReady =
false;


function setupSearch() {

    if (searchReady) {
        return;
    }


    const search =
    document.getElementById("search");


    if (!search) {
        return;
    }


    searchReady =
    true;


    search.addEventListener(
        "input",
        function() {

            const query =
            this.value
                .toLowerCase()
                .trim();


            const rows =
            document.querySelectorAll(
                "#orders tr"
            );


            rows.forEach(
                (row) => {

                    const text =
                    row.textContent
                        .toLowerCase();


                    row.style.display =
                    text.includes(query)
                    ? ""
                    : "none";

                }
            );

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

const logout =
document.getElementById("logout");


if (logout) {

    logout.onclick =
    async () => {

        await signOut(auth);

        location.href =
        "admin-login.html";

    };

}
```
