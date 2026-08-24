// ============================================
// ZYPER DIAMOND STORE - ADMIN SYSTEM
// ============================================

import {
    auth,
    db
} from "./firebase.js";


import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
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


// ============================================
// CHECK ADMIN
// ============================================

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


        return (
            adminDoc.data().role === "admin"
        );

    }

    catch(error){

        console.error(
            "Admin check error:",
            error
        );

        return false;

    }

}


// ============================================
// ADMIN LOGIN
// ============================================

const loginForm =
    document.getElementById(
        "adminLoginForm"
    );


if(loginForm){

    loginForm.addEventListener(
        "submit",
        async function(e){

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


            if(!email || !password){

                msg.textContent =
                    "Enter email and password.";

                return;

            }


            msg.textContent =
                "Checking...";


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

                    return;

                }


                msg.style.color =
                    "#22c55e";

                msg.textContent =
                    "Login successful. Opening dashboard...";


                setTimeout(
                    ()=>{
                        window.location.href =
                            "admin-dashboard.html";
                    },
                    500
                );

            }

            catch(error){

                console.error(error);


                msg.style.color =
                    "#f87171";


                if(
                    error.code ===
                    "auth/invalid-credential"
                ){

                    msg.textContent =
                        "❌ Invalid email or password.";

                }

                else if(
                    error.code ===
                    "auth/too-many-requests"
                ){

                    msg.textContent =
                        "Too many attempts. Try again later.";

                }

                else if(
                    error.code ===
                    "auth/invalid-email"
                ){

                    msg.textContent =
                        "Please enter a valid email.";

                }

                else{

                    msg.textContent =
                        error.message;

                }

            }

        }
    );

}


// ============================================
// FORGOT PASSWORD
// ============================================

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if(forgotPassword){

    forgotPassword.addEventListener(
        "click",
        async function(){

            const email =
                document
                .getElementById("email")
                .value
                .trim();


            const msg =
                document
                .getElementById("msg");


            if(!email){

                msg.style.color =
                    "#f59e0b";

                msg.textContent =
                    "Enter your admin email first.";

                document
                .getElementById("email")
                .focus();

                return;

            }


            forgotPassword.disabled =
                true;


            forgotPassword.textContent =
                "Sending...";


            try{

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                msg.style.color =
                    "#22c55e";


                msg.textContent =
                    "✅ Password reset email sent. Check Inbox or Spam.";

            }

            catch(error){

                console.error(
                    "Password reset:",
                    error
                );


                msg.style.color =
                    "#f87171";


                if(
                    error.code ===
                    "auth/user-not-found"
                ){

                    msg.textContent =
                        "No account found with this email.";

                }

                else if(
                    error.code ===
                    "auth/invalid-email"
                ){

                    msg.textContent =
                        "Invalid email address.";

                }

                else if(
                    error.code ===
                    "auth/too-many-requests"
                ){

                    msg.textContent =
                        "Too many requests. Try again later.";

                }

                else{

                    msg.textContent =
                        error.message;

                }

            }


            forgotPassword.disabled =
                false;


            forgotPassword.textContent =
                "Forgot Password?";

        }
    );

}


// ============================================
// DASHBOARD PROTECTION
// ============================================

const orderTable =
    document.getElementById(
        "orders"
    );


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
                document.getElementById(
                    "app"
                );


            if(app){

                app.style.display =
                    "block";

            }


            loadOrders();

        }
    );

}


// ============================================
// DATE FORMAT
// ============================================

function formatDate(timestamp){

    if(!timestamp){

        return "-";

    }


    if(
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


        return `${hour}:${minute} , ${year}/${month}/${day}`;

    }


    return String(timestamp);

}


// ============================================
// LOAD ORDERS
// ============================================

let allOrders = [];


async function loadOrders(){

    const table =
        document.getElementById(
            "orders"
        );


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
            function(document){

                allOrders.push({

                    id: document.id,

                    data: document.data()

                });

            }
        );


        // ====================================
        // NEWEST FIRST
        // ====================================

        allOrders.sort(
            function(a,b){

                const dateA =
                    a.data.createdAt;

                const dateB =
                    b.data.createdAt;


                if(
                    dateA &&
                    dateB &&
                    dateA.seconds !== undefined &&
                    dateB.seconds !== undefined
                ){

                    return (
                        dateB.seconds -
                        dateA.seconds
                    );

                }


                return 0;

            }
        );


        renderOrders(
            allOrders
        );

    }

    catch(error){

        console.error(
            "Orders error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="11">
                    ❌ Failed to load orders.
                    <br>
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


// ============================================
// RENDER ORDERS
// ============================================

function renderOrders(
    orders
){

    const table =
        document.getElementById(
            "orders"
        );


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
                    No orders found.
                </td>
            </tr>
        `;

    }


    orders.forEach(
        function(item,index){

            const order =
                item.data;


            const customer =
                order.customerName ||
                order.name ||
                order.email ||
                "-";


            const uid =
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


            totalOrders++;


            if(
                status !== "Rejected"
            ){

                revenue += total;

            }


            if(
                status === "Pending"
            ){

                pending++;

            }


            if(
                status === "Success"
            ){

                success++;

            }


            // =================================
            // DISPLAY ID
            // Newest order = highest number
            // =================================

            const displayNumber =
                String(
                    orders.length - index
                )
                .padStart(4,"0");


            const escapedCustomer =
                escapeHTML(customer);


            const escapedUID =
                escapeHTML(uid);


            const escapedGameUID =
                escapeHTML(gameUID);


            const escapedProduct =
                escapeHTML(product);


            const escapedPayment =
                escapeHTML(payment);


            const safeStatus =
                escapeHTML(status);


            table.innerHTML += `

                <tr>

                    <td>
                        <strong>
                            ${displayNumber}
                        </strong>
                    </td>

                    <td>
                        ${escapedCustomer}
                    </td>

                    <td>
                        ${escapedUID}
                    </td>

                    <td>
                        ${escapedGameUID}
                    </td>

                    <td>
                        ${escapedProduct}
                    </td>

                    <td>
                        Rs. ${price}
                    </td>

                    <td>
                        ${escapedPayment}
                    </td>

                    <td>
                        ${date}
                    </td>

                    <td>
                        Rs. ${total}
                    </td>

                    <td class="${safeStatus}">
                        ${safeStatus}
                    </td>

                    <td>

                        <button
                            class="action-btn success-btn"
                            data-id="${item.id}"
                            data-status="Success"
                        >
                            ✔
                        </button>

                        <button
                            class="action-btn reject-btn"
                            data-id="${item.id}"
                            data-status="Rejected"
                        >
                            ✖
                        </button>

                    </td>

                </tr>

            `;

        }
    );


    document.getElementById(
        "totalOrders"
    ).textContent =
        totalOrders;


    document.getElementById(
        "revenue"
    ).textContent =
        revenue;


    document.getElementById(
        "pendingOrders"
    ).textContent =
        pending;


    document.getElementById(
        "successOrders"
    ).textContent =
        success;


    // =================================
    // ACTION BUTTONS
    // =================================

    table
    .querySelectorAll(
        ".action-btn"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                function(){

                    const id =
                        button.dataset.id;

                    const status =
                        button.dataset.status;


                    changeStatus(
                        id,
                        status
                    );

                }
            );

        }
    );

}


// ============================================
// SEARCH
// ============================================

const search =
    document.getElementById(
        "search"
    );


if(search){

    search.addEventListener(
        "input",
        function(){

            const query =
                search.value
                .trim()
                .toLowerCase();


            if(!query){

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


                        const values = [

                            item.id,

                            order.customerName,

                            order.name,

                            order.email,

                            order.userId,

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

                                return String(
                                    value || ""
                                )
                                .toLowerCase()
                                .includes(query);

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


// ============================================
// CHANGE STATUS
// ============================================

async function changeStatus(
    id,
    status
){

    const user =
        auth.currentUser;


    const admin =
        await checkAdmin(
            user
        );


    if(!admin){

        alert(
            "Access denied."
        );

        window.location.href =
            "admin-login.html";

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
                status: status
            }

        );


        await loadOrders();

    }

    catch(error){

        console.error(
            "Status update:",
            error
        );


        alert(
            "Failed to update order:\n" +
            error.message
        );

    }

}


// ============================================
// LOGOUT
// ============================================

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


                window.location.href =
                    "admin-login.html";

            }

            catch(error){

                alert(
                    error.message
                );

            }

        }
    );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(
    value
){

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}
