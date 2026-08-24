```javascript
// ==========================================
// ZYPER DIAMOND STORE
// ADMIN LOGIN + DASHBOARD
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


console.log("✅ admin.js loaded");
console.log("Firebase Auth:", auth);
console.log("Firebase DB:", db);


// ==========================================
// ELEMENTS
// ==========================================

const loginButton =
    document.getElementById("login");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const message =
    document.getElementById("msg");


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text, success = false) {

    if (!message) {
        alert(text);
        return;
    }

    message.textContent = text;

    message.style.color =
        success ? "#86efac" : "#fca5a5";
}


// ==========================================
// CHECK ADMIN
// ==========================================

async function checkAdmin(user) {

    if (!user) {
        return false;
    }

    try {

        console.log(
            "Checking admin UID:",
            user.uid
        );

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const userSnap =
            await getDoc(userRef);

        console.log(
            "Admin document exists:",
            userSnap.exists()
        );

        if (!userSnap.exists()) {
            return false;
        }

        const data =
            userSnap.data();

        console.log(
            "User document:",
            data
        );

        return data.role === "admin";

    } catch (error) {

        console.error(
            "ADMIN CHECK ERROR:",
            error
        );

        throw error;
    }
}


// ==========================================
// LOGIN
// ==========================================

async function adminLogin() {

    console.log("LOGIN BUTTON CLICKED");


    if (!emailInput) {

        alert(
            "ERROR: Email input not found."
        );

        return;
    }


    if (!passwordInput) {

        alert(
            "ERROR: Password input not found."
        );

        return;
    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email) {

        showMessage(
            "❌ Enter your admin email."
        );

        emailInput.focus();

        return;
    }


    if (!password) {

        showMessage(
            "❌ Enter your password."
        );

        passwordInput.focus();

        return;
    }


    loginButton.disabled = true;

    loginButton.textContent =
        "⏳ LOGIN...";


    showMessage(
        "Checking login...",
        true
    );


    try {

        console.log(
            "Signing in:",
            email
        );


        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "Firebase login successful:",
            result.user.uid
        );


        const admin =
            await checkAdmin(
                result.user
            );


        if (!admin) {

            await signOut(auth);

            showMessage(
                "❌ Login successful, but this account is NOT an admin."
            );

            loginButton.disabled =
                false;

            loginButton.textContent =
                "LOGIN";

            return;
        }


        showMessage(
            "✅ Admin verified. Opening dashboard...",
            true
        );


        setTimeout(
            function () {

                window.location.href =
                    "admin-dashboard.html";

            },
            500
        );


    } catch (error) {

        console.error(
            "🔥 LOGIN ERROR:",
            error
        );


        let text =
            "❌ Login failed.";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            text =
                "❌ Incorrect email or password.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            text =
                "❌ Invalid email address.";

        } else if (
            error.code ===
            "auth/user-not-found"
        ) {

            text =
                "❌ Admin account not found.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            text =
                "❌ Incorrect password.";

        } else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            text =
                "❌ Too many login attempts. Try again later.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            text =
                "❌ Internet/network error.";

        } else if (
            error.code ===
            "permission-denied"
        ) {

            text =
                "❌ Firebase permission denied.";

        } else {

            text =
                "❌ " +
                (
                    error.message ||
                    "Unknown error."
                );
        }


        showMessage(text);


        loginButton.disabled =
            false;

        loginButton.textContent =
            "LOGIN";
    }
}


// ==========================================
// CLICK
// ==========================================

if (loginButton) {

    loginButton.addEventListener(
        "click",
        adminLogin
    );

} else {

    console.error(
        "❌ LOGIN BUTTON NOT FOUND"
    );
}


// ==========================================
// ENTER KEY
// ==========================================

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                adminLogin();
            }
        }
    );
}


// ==========================================
// DASHBOARD
// ==========================================

const ordersTable =
    document.getElementById("orders");


if (ordersTable) {

    console.log(
        "Dashboard detected."
    );


    onAuthStateChanged(
        auth,
        async function (user) {

            console.log(
                "Dashboard auth:",
                user
            );


            if (!user) {

                window.location.href =
                    "admin-login.html";

                return;
            }


            try {

                const admin =
                    await checkAdmin(
                        user
                    );


                if (!admin) {

                    await signOut(auth);

                    window.location.href =
                        "admin-login.html";

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


                await loadOrders();


            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

                alert(
                    "Dashboard error:\n" +
                    error.message
                );
            }

        }
    );
}


// ==========================================
// LOAD ORDERS
// ==========================================

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


        table.innerHTML = "";


        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="11">
                        📦 No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach(
            function (item) {

                const order =
                    item.data();


                const row =
                    document.createElement(
                        "tr"
                    );


                const status =
                    order.status ||
                    "Pending";


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            item.id
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.customerName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.email ||
                            order.customerEmail ||
                            order.userEmail ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.userId ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.gameUID ||
                            order.gameUid ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.productName ||
                            order.package ||
                            "-"
                        )}
                    </td>

                    <td>
                        LKR
                        ${Number(
                            order.price ||
                            order.productPrice ||
                            0
                        ).toLocaleString()}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.paymentMethod ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            order.createdAt
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            status
                        )}
                    </td>

                    <td>

                        <button
                            class="action-success"
                            data-id="${escapeHTML(
                                item.id
                            )}"
                            data-status="Success">

                            ✔

                        </button>

                        <button
                            class="action-rejected"
                            data-id="${escapeHTML(
                                item.id
                            )}"
                            data-status="Rejected">

                            ✖

                        </button>

                    </td>

                `;


                table.appendChild(
                    row
                );
            }
        );


        attachStatusButtons();


    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="11">

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
// STATUS BUTTONS
// ==========================================

function attachStatusButtons() {

    document
        .querySelectorAll(
            "[data-status]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const id =
                            this.dataset.id;

                        const status =
                            this.dataset.status;


                        if (
                            !confirm(
                                `Change order to ${status}?`
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
                                "STATUS ERROR:",
                                error
                            );

                            alert(
                                "❌ Failed:\n" +
                                error.message
                            );
                        }

                    }
                );

            }
        );
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "-";
    }


    try {

        let date;


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            date =
                timestamp.toDate();

        } else if (
            timestamp.seconds !==
            undefined
        ) {

            date =
                new Date(
                    timestamp.seconds *
                    1000
                );

        } else {

            date =
                new Date(timestamp);
        }


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "-";
        }


        return date.toLocaleString(
            "en-GB"
        );


    } catch {

        return "-";
    }
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutExists()) {

    document
        .getElementById("logout")
        .addEventListener(
            "click",
            async function () {

                await signOut(
                    auth
                );

                window.location.href =
                    "admin-login.html";

            }
        );
}


function logoutExists() {

    return Boolean(
        document.getElementById(
            "logout"
        )
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
