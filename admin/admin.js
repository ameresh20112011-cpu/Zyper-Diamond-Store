// ==========================================
// ZYPER ADMIN PANEL
// ==========================================

import {
    auth,
    db
}
from "./firebase.js";


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
// ADMIN CHECK
// ==========================================

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


// ==========================================
// LOGIN
// ==========================================

const loginButton =
document.getElementById("login");


if(loginButton){

    loginButton.onclick =
    async function(){

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


        msg.textContent = "";


        if(!email || !password){

            msg.textContent =
            "Enter email and password.";

            return;

        }


        loginButton.disabled = true;

        loginButton.textContent =
        "LOGINNING...";


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


            location.href =
            "admin-dashboard.html";

        }
        catch(error){

            console.error(error);

            msg.textContent =
            "❌ " +
            getFirebaseError(error);

            loginButton.disabled =
            false;

            loginButton.textContent =
            "LOGIN";

        }

    };

}


// ==========================================
// FIREBASE ERROR
// ==========================================

function getFirebaseError(error){

    if(
        error.code ===
        "auth/invalid-credential"
    ){

        return "Invalid email or password.";

    }


    if(
        error.code ===
        "auth/user-not-found"
    ){

        return "User not found.";

    }


    if(
        error.code ===
        "auth/wrong-password"
    ){

        return "Wrong password.";

    }


    if(
        error.code ===
        "auth/invalid-email"
    ){

        return "Invalid email.";

    }


    return error.message ||
    "Login failed.";

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


            loadOrders();

        }
    );

}


// ==========================================
// DATE
// ==========================================

function formatDate(timestamp){

    if(!timestamp){

        return "-";

    }


    if(
        timestamp.toDate
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

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value){

    return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


// ==========================================
// LOAD ORDERS
// ==========================================

let allOrders = [];


async function loadOrders(){

    const table =
    document.getElementById("orders");


    table.innerHTML =
    `<tr>
        <td colspan="11">
            Loading orders...
        </td>
    </tr>`;


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

                const aTime =
                a.data.createdAt?.seconds ||
                0;


                const bTime =
                b.data.createdAt?.seconds ||
                0;


                return bTime - aTime;

            }
        );


        renderOrders(
            allOrders
        );

    }
    catch(error){

        console.error(error);


        table.innerHTML =
        `<tr>
            <td colspan="11">
                ❌ ${escapeHTML(error.message)}
            </td>
        </tr>`;

    }

}


// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders(orders){

    const table =
    document.getElementById("orders");


    table.innerHTML = "";


    let totalOrders = 0;

    let revenue = 0;

    let pending = 0;

    let success = 0;


    if(orders.length === 0){

        table.innerHTML =
        `<tr>
            <td colspan="11">
                No orders found.
            </td>
        </tr>`;

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
                0
            );


            const payment =
            order.paymentMethod ||
            order.payment ||
            "Receipt";


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


            if(status === "Pending"){

                pending++;

            }


            if(status === "Success"){

                success++;

            }


            table.innerHTML += `

            <tr>

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

            ${
                status === "Pending"

                ?

                `
                <button
                class="action-success"
                onclick="changeStatus('${item.id}','Success')">
                ✔ Success
                </button>

                <button
                class="action-reject"
                onclick="changeStatus('${item.id}','Rejected')">
                ✖ Reject
                </button>
                `

                :

                `<b>${escapeHTML(status)}</b>`

            }

            </td>

            </tr>

            `;

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

                    const data =
                    item.data;


                    const text =
                    [

                        item.id,

                        data.customerName,

                        data.playerName,

                        data.userId,

                        data.gameUID,

                        data.gameUid,

                        data.uid,

                        data.package,

                        data.product,

                        data.status

                    ]
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
// CHANGE STATUS
// ==========================================

window.changeStatus =
async function(id,status){

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


    const message =
    status === "Success"

    ? "Mark this order as SUCCESS?"

    : "Mark this order as REJECTED?";


    if(!confirm(message)){

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

                status:status,

                updatedAt:
                new Date()

            }

        );


        await loadOrders();


    }
    catch(error){

        console.error(error);

        alert(
            "❌ " +
            error.message
        );

    }

};


// ==========================================
// LOGOUT
// ==========================================

const logout =
document.getElementById("logout");


if(logout){

    logout.onclick =
    async function(){

        await signOut(
            auth
        );


        location.href =
        "admin-login.html";

    };

}
