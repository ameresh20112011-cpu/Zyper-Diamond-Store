// ========================================
// FIREBASE
// ========================================

import {
    auth,
    db
}
from "./firebase.js";


// ========================================
// FIREBASE AUTH
// ========================================

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// ========================================
// FIRESTORE
// ========================================

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ========================================
// GLOBAL ORDERS
// ========================================

let allOrders = [];


// ========================================
// CHECK ADMIN
// users/{uid}
// role: "admin"
// ========================================

async function checkAdmin(user){

    if(!user){

        return false;

    }


    try{

        const adminDoc =
            await getDoc(

                doc(
                    db,
                    "users",
                    user.uid
                )

            );


        if(!adminDoc.exists()){

            return false;

        }


        const data =
            adminDoc.data();


        return data.role === "admin";

    }

    catch(error){

        console.error(
            "Admin check error:",
            error
        );

        return false;

    }

}


// ========================================
// LOGIN
// ========================================

const loginButton =
    document.getElementById("login");


if(loginButton){

    loginButton.addEventListener(
        "click",
        loginAdmin
    );


    const passwordInput =
        document.getElementById("password");


    if(passwordInput){

        passwordInput.addEventListener(
            "keydown",
            function(event){

                if(event.key === "Enter"){

                    loginAdmin();

                }

            }
        );

    }

}


async function loginAdmin(){

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
        document.getElementById("msg");


    if(!email || !password){

        msg.textContent =
            "Enter email and password";

        return;

    }


    loginButton.disabled =
        true;


    loginButton.textContent =
        "LOGINNING...";


    msg.textContent =
        "";


    try{

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


        if(!isAdmin){

            msg.textContent =
                "❌ You are not an admin";


            await signOut(auth);


            loginButton.disabled =
                false;


            loginButton.textContent =
                "LOGIN";

            return;

        }


        location.href =
            "admin-dashboard.html";

    }

    catch(error){

        console.error(error);


        let message =
            "Login failed";


        if(
            error.code ===
            "auth/invalid-credential"
        ){

            message =
                "❌ Invalid email or password";

        }

        else if(
            error.code ===
            "auth/user-not-found"
        ){

            message =
                "❌ Admin account not found";

        }

        else if(
            error.code ===
            "auth/wrong-password"
        ){

            message =
                "❌ Wrong password";

        }

        else if(
            error.code ===
            "auth/too-many-requests"
        ){

            message =
                "❌ Too many attempts. Try again later";

        }

        else{

            message =
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


// ========================================
// DASHBOARD AUTH PROTECTION
// ========================================

const orderTable =
    document.getElementById("orders");


if(orderTable){

    onAuthStateChanged(

        auth,

        async function(user){

            if(!user){

                location.href =
                    "admin-login.html";

                return;

            }


            const isAdmin =
                await checkAdmin(user);


            if(!isAdmin){

                await signOut(auth);

                location.href =
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


// ========================================
// DATE FORMAT
// ========================================

function formatDate(timestamp){

    if(!timestamp){

        return "-";

    }


    try{

        if(
            timestamp.toDate
            &&
            typeof timestamp.toDate ===
            "function"
        ){

            const date =
                timestamp.toDate();


            const hour =
                String(
                    date.getHours()
                )
                .padStart(2,"0");


            const minute =
                String(
                    date.getMinutes()
                )
                .padStart(2,"0");


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth()+1
                )
                .padStart(2,"0");


            const day =
                String(
                    date.getDate()
                )
                .padStart(2,"0");


            return (
                `${hour}:${minute} , ${year}/${month}/${day}`
            );

        }


        if(timestamp instanceof Date){

            return timestamp.toLocaleString();

        }


        return String(timestamp);

    }

    catch(error){

        return "-";

    }

}


// ========================================
// GET TIMESTAMP VALUE FOR SORTING
// ========================================

function getTimeValue(timestamp){

    if(!timestamp){

        return 0;

    }


    if(
        timestamp.toMillis
        &&
        typeof timestamp.toMillis ===
        "function"
    ){

        return timestamp.toMillis();

    }


    if(
        timestamp.seconds !== undefined
    ){

        return Number(
            timestamp.seconds
        ) * 1000;

    }


    if(timestamp instanceof Date){

        return timestamp.getTime();

    }


    return 0;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value){

    if(value === null || value === undefined){

        return "";

    }


    return String(value)

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


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders(){

    const table =
        document.getElementById("orders");


    if(!table){

        return;

    }


    table.innerHTML = `

        <tr>

            <td colspan="11">

                Loading orders...

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

            function(documentSnapshot){

                allOrders.push({

                    id:
                        documentSnapshot.id,

                    data:
                        documentSnapshot.data()

                });

            }

        );


        // =================================
        // NEWEST FIRST
        // =================================

        allOrders.sort(

            function(a,b){

                return (

                    getTimeValue(
                        b.data.createdAt
                    )

                    -

                    getTimeValue(
                        a.data.createdAt
                    )

                );

            }

        );


        renderOrders(allOrders);

    }

    catch(error){

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


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders(orders){

    const table =
        document.getElementById("orders");


    if(!table){

        return;

    }


    let totalOrders =
        0;


    let revenue =
        0;


    let pending =
        0;


    let success =
        0;


    table.innerHTML =
        "";


    if(orders.length === 0){

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

        function(item){

            const order =
                item.data;


            // =================================
            // CUSTOMER
            // =================================

            const customer =
                order.customerName ||
                order.name ||
                "-";


            // =================================
            // PHONE
            // =================================

            const phone =
                order.phoneNumber ||
                order.phone ||
                order.mobile ||
                "";


            // =================================
            // FIREBASE UID
            // =================================

            const uid =
                order.userId ||
                order.uid ||
                "-";


            // =================================
            // GAME UID
            // =================================

            const gameUID =
                order.gameUID ||
                order.gameUid ||
                order.gameId ||
                "-";


            // =================================
            // PRODUCT
            // =================================

            const product =
                order.productName ||
                order.product ||
                order.package ||
                order.plan ||
                "-";


            // =================================
            // PRICE
            // =================================

            const price =
                Number(
                    order.productPrice ||
                    order.price ||
                    0
                );


            // =================================
            // PAYMENT
            // =================================

            const payment =
                order.paymentMethod ||
                order.payment ||
                "-";


            // =================================
            // TOTAL
            // =================================

            const total =
                Number(
                    order.total ||
                    order.amount ||
                    price ||
                    0
                );


            // =================================
            // ORDER ID
            // =================================
            //
            // Cloudflare Worker should save:
            //
            // orderId: "0001"
            //
            // If old orders don't have it,
            // use Firestore document ID.
            // =================================

            const orderID =
                order.orderId ||
                order.orderID ||
                order.orderNumber ||
                item.id;


            // =================================
            // DATE
            // =================================

            const date =
                formatDate(
                    order.createdAt
                );


            // =================================
            // STATUS
            // =================================

            const status =
                order.status ||
                "Pending";


            // =================================
            // COUNTERS
            // =================================

            totalOrders++;

            revenue += total;


            if(
                String(status).toLowerCase()
                ===
                "pending"
            ){

                pending++;

            }


            if(
                String(status).toLowerCase()
                ===
                "success"
            ){

                success++;

            }


            // =================================
            // ROW
            // =================================

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(orderID)}
                    </strong>

                </td>


                <td>

                    ${escapeHTML(customer)}

                    ${
                        phone
                        ?
                        `<br>
                        <small>
                            ${escapeHTML(phone)}
                        </small>`
                        :
                        ""
                    }

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

                    Rs. ${escapeHTML(price)}

                </td>


                <td>

                    ${escapeHTML(payment)}

                </td>


                <td>

                    ${escapeHTML(date)}

                </td>


                <td>

                    Rs. ${escapeHTML(total)}

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

        totalOrders,

        revenue,

        pending,

        success

    );


    // =================================
    // ACTION BUTTONS
    // =================================

    const buttons =
        table.querySelectorAll(
            ".action-btn"
        );


    buttons.forEach(

        function(button){

            button.addEventListener(

                "click",

                async function(){

                    const id =
                        button.dataset.id;


                    const status =
                        button.dataset.status;


                    await changeStatus(
                        id,
                        status
                    );

                }

            );

        }

    );

}


// ========================================
// UPDATE DASHBOARD CARDS
// ========================================

function updateCards(
    totalOrders,
    revenue,
    pending,
    success
){

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


    if(totalElement){

        totalElement.textContent =
            totalOrders;

    }


    if(revenueElement){

        revenueElement.textContent =
            Number(revenue)
            .toLocaleString(
                "en-LK"
            );

    }


    if(pendingElement){

        pendingElement.textContent =
            pending;

    }


    if(successElement){

        successElement.textContent =
            success;

    }

}


// ========================================
// CHANGE STATUS
// ========================================

async function changeStatus(
    id,
    status
){

    const user =
        auth.currentUser;


    if(!user){

        alert(
            "Please login again."
        );

        location.href =
            "admin-login.html";

        return;

    }


    const isAdmin =
        await checkAdmin(user);


    if(!isAdmin){

        alert(
            "Access denied"
        );

        return;

    }


    const confirmation =
        confirm(
            `Change order status to ${status}?`
        );


    if(!confirmation){

        return;

    }


    try{

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

    }

    catch(error){

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ Failed to update order status"
        );

    }

}


// ========================================
// SEARCH
// ========================================

const searchInput =
    document.getElementById(
        "search"
    );


if(searchInput){

    searchInput.addEventListener(

        "input",

        function(){

            const search =
                searchInput.value
                .trim()
                .toLowerCase();


            if(!search){

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


                        const orderID =
                            order.orderId ||
                            order.orderID ||
                            order.orderNumber ||
                            item.id;


                        const values = [

                            orderID,

                            order.customerName,

                            order.name,

                            order.phoneNumber,

                            order.phone,

                            order.mobile,

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

                            function(value){

                                return (

                                    value !==
                                    undefined
                                    &&
                                    value !==
                                    null
                                    &&
                                    String(value)
                                    .toLowerCase()
                                    .includes(search)

                                );

                            }

                        );

                    }

                );


            renderOrders(
                filtered
            );

        }

    );

}


// ========================================
// REFRESH
// ========================================

const refreshButton =
    document.getElementById(
        "refresh"
    );


if(refreshButton){

    refreshButton.addEventListener(

        "click",

        async function(){

            refreshButton.disabled =
                true;


            refreshButton.textContent =
                "Loading...";


            await loadOrders();


            refreshButton.disabled =
                false;


            refreshButton.textContent =
                "↻ Refresh";

        }

    );

}


// ========================================
// LOGOUT
// ========================================

const logout =
    document.getElementById(
        "logout"
    );


if(logout){

    logout.addEventListener(

        "click",

        async function(){

            try{

                await signOut(
                    auth
                );

                location.href =
                    "admin-login.html";

            }

            catch(error){

                console.error(error);

                alert(
                    "Logout failed"
                );

            }

        }

    );

}
