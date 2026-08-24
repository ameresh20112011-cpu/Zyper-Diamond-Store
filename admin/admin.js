// ==========================================
// ZYPER DIAMOND STORE
// ADMIN JAVASCRIPT
// ==========================================

import { auth, db } from "./firebase.js";


import {

    signInWithEmailAndPassword,

    onAuthStateChanged,

    signOut

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    collection,

    getDocs,

    doc,

    getDoc,

    updateDoc

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// CHECK ADMIN
// ==========================================

async function checkAdmin(user){

    try{

        if(!user){

            return false;

        }


        const adminRef =
        doc(
            db,
            "users",
            user.uid
        );


        const adminDoc =
        await getDoc(adminRef);


        if(!adminDoc.exists()){

            return false;

        }


        const data =
        adminDoc.data();


        return data.role === "admin";


    }catch(error){

        console.error(
            "Admin check error:",
            error
        );

        return false;

    }

}


// ==========================================
// ADMIN LOGIN
// ==========================================

const loginButton =
document.getElementById("login");


if(loginButton){

    loginButton.addEventListener(
        "click",
        adminLogin
    );


    const passwordInput =
    document.getElementById("password");


    if(passwordInput){

        passwordInput.addEventListener(
            "keydown",
            function(event){

                if(event.key === "Enter"){

                    adminLogin();

                }

            }
        );

    }

}


async function adminLogin(){

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


    if(!email || !password){

        msg.textContent =
        "Enter email and password.";

        return;

    }


    loginButton.disabled =
    true;

    loginButton.textContent =
    "Logging in...";


    try{

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


        if(!admin){

            msg.textContent =
            "❌ This account is not an admin.";

            await signOut(auth);

            loginButton.disabled =
            false;

            loginButton.textContent =
            "LOGIN";

            return;

        }


        window.location.href =
        "admin-dashboard.html";


    }catch(error){

        console.error(
            "Login error:",
            error
        );


        let message =
        "Login failed.";


        if(error.code ===
        "auth/invalid-credential"){

            message =
            "❌ Incorrect email or password.";

        }

        else if(error.code ===
        "auth/user-not-found"){

            message =
            "❌ User account not found.";

        }

        else if(error.code ===
        "auth/wrong-password"){

            message =
            "❌ Incorrect password.";

        }

        else if(error.code ===
        "auth/invalid-email"){

            message =
            "❌ Invalid email address.";

        }

        else if(error.code ===
        "auth/network-request-failed"){

            message =
            "❌ Network error. Check your internet.";

        }

        else{

            message =
            "❌ " +
            error.message;

        }


        msg.textContent =
        message;


        loginButton.disabled =
        false;

        loginButton.textContent =
        "LOGIN";

    }

}


// ==========================================
// DASHBOARD PROTECTION
// ==========================================

const orderTable =
document.getElementById("orders");


if(orderTable){

    onAuthStateChanged(
        auth,
        async function(user){

            const admin =
            await checkAdmin(user);


            if(!admin){

                window.location.href =
                "admin-login.html";

                return;

            }


            const app =
            document.getElementById("app");


            if(app){

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

function formatDate(timestamp){

    if(!timestamp){

        return "-";

    }


    try{

        if(
            typeof timestamp.toDate ===
            "function"
        ){

            const date =
            timestamp.toDate();


            const hour =
            String(
                date.getHours()
            ).padStart(2,"0");


            const minute =
            String(
                date.getMinutes()
            ).padStart(2,"0");


            const year =
            date.getFullYear();


            const month =
            String(
                date.getMonth()+1
            ).padStart(2,"0");


            const day =
            String(
                date.getDate()
            ).padStart(2,"0");


            return `${hour}:${minute} , ${year}/${month}/${day}`;

        }


        return String(timestamp);

    }catch{

        return "-";

    }

}


// ==========================================
// LOAD ORDERS
// ==========================================

let allOrders = [];


async function loadOrders(){

    const table =
    document.getElementById("orders");


    if(!table){

        return;

    }


    table.innerHTML = `

        <tr>

            <td colspan="11">
                ⏳ Loading orders...
            </td>

        </tr>

    `;


    try{

        const snapshot =
        await getDocs(
            collection(
                db,
                "orders"
            )
        );


        allOrders = [];


        snapshot.forEach(
            function(document){

                allOrders.push({

                    id:document.id,

                    data:document.data()

                });

            }
        );


        allOrders.sort(
            function(a,b){

                const dateA =
                a.data.createdAt;


                const dateB =
                b.data.createdAt;


                if(
                    dateA &&
                    dateB &&
                    dateA.seconds != null &&
                    dateB.seconds != null
                ){

                    return (
                        dateB.seconds -
                        dateA.seconds
                    );

                }


                return 0;

            }
        );


        renderOrders(allOrders);


    }catch(error){

        console.error(
            "Load orders error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="11">

                    ❌ Failed to load orders

                    <br><br>

                    ${escapeHTML(error.message)}

                </td>

            </tr>

        `;

    }

}


// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders(orders){

    const table =
    document.getElementById("orders");


    if(!table){

        return;

    }


    table.innerHTML = "";


    let totalOrders = 0;

    let revenue = 0;

    let pending = 0;

    let success = 0;


    if(orders.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="11">

                    📦 No orders found.

                </td>

            </tr>

        `;

    }


    orders.forEach(
        function(item){

            const order =
            item.data;


            const customer =
            order.customerName ||
            order.playerName ||
            order.name ||
            "-";


            const firebaseUID =
            order.userId ||
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


            const total =
            Number(
                order.total ||
                order.amount ||
                price
            );


            const date =
            formatDate(
                order.createdAt
            );


            const status =
            order.status ||
            "Pending";


            totalOrders++;


            revenue += total;


            if(
                status.toLowerCase() ===
                "pending"
            ){

                pending++;

            }


            if(
                status.toLowerCase() ===
                "success" ||
                status.toLowerCase() ===
                "approved"
            ){

                success++;

            }


            const row =
            document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(item.id)}
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

                <td class="${escapeHTML(status)}">
                    ${escapeHTML(status)}
                </td>

                <td>

                    <button
                        class="action-success"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Success">
                        ✔
                    </button>

                    <button
                        class="action-rejected"
                        data-id="${escapeHTML(item.id)}"
                        data-status="Rejected">
                        ✖
                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );


    document
    .getElementById("totalOrders")
    .textContent =
    totalOrders;


    document
    .getElementById("revenue")
    .textContent =
    revenue.toLocaleString("en-US");


    document
    .getElementById("pendingOrders")
    .textContent =
    pending;


    document
    .getElementById("successOrders")
    .textContent =
    success;


    // Action buttons

    document
    .querySelectorAll(
        "[data-status]"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                function(){

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
){

    try{

        const user =
        auth.currentUser;


        const admin =
        await checkAdmin(user);


        if(!admin){

            alert(
                "❌ Access denied."
            );

            return;

        }


        await updateDoc(

            doc(
                db,
                "orders",
                id
            ),

            {

                status:status

            }

        );


        await loadOrders();


    }catch(error){

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ Failed to update status:\n" +
            error.message
        );

    }

}


// ==========================================
// SEARCH
// ==========================================

const search =
document.getElementById("search");


if(search){

    search.addEventListener(
        "input",
        function(){

            const value =
            this.value
            .trim()
            .toLowerCase();


            if(!value){

                renderOrders(
                    allOrders
                );

                return;

            }


            const filtered =
            allOrders.filter(
                function(item){

                    const order =
                    item.data;


                    const text = [

                        item.id,

                        order.customerName,

                        order.playerName,

                        order.name,

                        order.userId,

                        order.gameUID,

                        order.gameUid,

                        order.gameId,

                        order.productName,

                        order.product,

                        order.package,

                        order.paymentMethod,

                        order.payment,

                        order.status

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                    return text.includes(
                        value
                    );

                }
            );


            renderOrders(
                filtered
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

const logout =
document.getElementById("logout");


if(logout){

    logout.addEventListener(
        "click",
        async function(){

            try{

                await signOut(auth);

                window.location.href =
                "admin-login.html";

            }catch(error){

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value){

    if(value === null ||
       value === undefined){

        return "";

    }


    return String(value)

        .replaceAll("&","&amp;")

        .replaceAll("<","&lt;")

        .replaceAll(">","&gt;")

        .replaceAll('"',"&quot;")

        .replaceAll("'","&#039;");

}
