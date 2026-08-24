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
// GLOBAL
// ==========================================

let allOrders = [];

let currentDateFilter = "all";

let currentStatusFilter = "all";

let customDate = "";


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


        if(
            error.code ===
            "auth/invalid-credential"
        ){

            message =
            "❌ Incorrect email or password.";

        }

        else if(
            error.code ===
            "auth/user-not-found"
        ){

            message =
            "❌ User account not found.";

        }

        else if(
            error.code ===
            "auth/wrong-password"
        ){

            message =
            "❌ Incorrect password.";

        }

        else if(
            error.code ===
            "auth/invalid-email"
        ){

            message =
            "❌ Invalid email address.";

        }

        else if(
            error.code ===
            "auth/network-request-failed"
        ){

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
// DASHBOARD
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


            createFilters();

            await loadOrders();

        }
    );

}


// ==========================================
// CREATE FILTER AREA
// ==========================================

function createFilters(){

    if(
        document.getElementById(
            "adminFilters"
        )
    ){
        return;
    }


    const table =
    document.getElementById("orders");


    if(!table){
        return;
    }


    const container =
    table.closest("table");


    if(!container){
        return;
    }


    const wrapper =
    document.createElement("div");


    wrapper.id =
    "adminFilters";


    wrapper.style.cssText = `
        display:flex;
        flex-wrap:wrap;
        gap:10px;
        margin:15px 0;
        padding:15px;
        background:rgba(255,255,255,.06);
        border-radius:15px;
    `;


    wrapper.innerHTML = `

        <select id="dateFilter"
        style="
        padding:12px;
        border-radius:10px;
        background:#1e293b;
        color:white;
        border:1px solid #475569;
        ">

            <option value="all">
                📋 All Orders
            </option>

            <option value="today">
                📅 Today
            </option>

            <option value="yesterday">
                📅 Yesterday
            </option>

            <option value="7days">
                📅 Last 7 Days
            </option>

            <option value="month">
                📅 This Month
            </option>

            <option value="custom">
                📅 Custom Date
            </option>

        </select>


        <select id="statusFilter"
        style="
        padding:12px;
        border-radius:10px;
        background:#1e293b;
        color:white;
        border:1px solid #475569;
        ">

            <option value="all">
                📦 All Status
            </option>

            <option value="Pending">
                ⏳ Pending
            </option>

            <option value="Success">
                ✅ Success
            </option>

            <option value="Rejected">
                ❌ Rejected
            </option>

        </select>


        <input
        type="date"
        id="customDate"
        style="
        display:none;
        padding:12px;
        border-radius:10px;
        background:#1e293b;
        color:white;
        border:1px solid #475569;
        ">


        <button
        id="clearFilters"
        type="button"
        style="
        padding:12px 18px;
        border:none;
        border-radius:10px;
        background:#475569;
        color:white;
        font-weight:bold;
        cursor:pointer;
        ">

            🔄 Reset

        </button>

    `;


    container.parentNode.insertBefore(
        wrapper,
        container
    );


    const dateFilter =
    document.getElementById(
        "dateFilter"
    );


    const statusFilter =
    document.getElementById(
        "statusFilter"
    );


    const customDateInput =
    document.getElementById(
        "customDate"
    );


    dateFilter.addEventListener(
        "change",
        function(){

            currentDateFilter =
            this.value;


            if(
                this.value ===
                "custom"
            ){

                customDateInput.style.display =
                "block";

            }else{

                customDateInput.style.display =
                "none";

                customDate = "";

            }


            applyFilters();

        }
    );


    statusFilter.addEventListener(
        "change",
        function(){

            currentStatusFilter =
            this.value;

            applyFilters();

        }
    );


    customDateInput.addEventListener(
        "change",
        function(){

            customDate =
            this.value;

            applyFilters();

        }
    );


    document
    .getElementById(
        "clearFilters"
    )
    .addEventListener(
        "click",
        function(){

            currentDateFilter =
            "all";

            currentStatusFilter =
            "all";

            customDate = "";

            dateFilter.value =
            "all";

            statusFilter.value =
            "all";

            customDateInput.value =
            "";

            customDateInput.style.display =
            "none";

            applyFilters();

        }
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function getOrderDate(timestamp){

    if(!timestamp){
        return null;
    }


    try{

        if(
            typeof timestamp.toDate ===
            "function"
        ){

            return timestamp.toDate();

        }


        if(
            timestamp.seconds != null
        ){

            return new Date(
                timestamp.seconds * 1000
            );

        }


        if(
            timestamp instanceof Date
        ){

            return timestamp;

        }


        return new Date(timestamp);

    }catch{

        return null;

    }

}


function formatDate(timestamp){

    const date =
    getOrderDate(timestamp);


    if(!date){
        return "-";
    }


    try{

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

    }catch{

        return "-";

    }

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders(){

    const table =
    document.getElementById("orders");


    if(!table){
        return;
    }


    table.innerHTML = `

        <tr>

            <td colspan="12">

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
                getOrderDate(
                    a.data.createdAt
                );


                const dateB =
                getOrderDate(
                    b.data.createdAt
                );


                if(!dateA && !dateB){
                    return 0;
                }

                if(!dateA){
                    return 1;
                }

                if(!dateB){
                    return -1;
                }


                return dateB - dateA;

            }
        );


        applyFilters();


    }catch(error){

        console.error(
            "Load orders error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="12">

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
// DATE FILTER
// ==========================================

function sameDay(
    date,
    target
){

    return(
        date.getFullYear() ===
        target.getFullYear() &&

        date.getMonth() ===
        target.getMonth() &&

        date.getDate() ===
        target.getDate()
    );

}


function isDateMatch(
    orderDate
){

    if(
        currentDateFilter ===
        "all"
    ){

        return true;

    }


    if(!orderDate){

        return false;

    }


    const now =
    new Date();


    if(
        currentDateFilter ===
        "today"
    ){

        return sameDay(
            orderDate,
            now
        );

    }


    if(
        currentDateFilter ===
        "yesterday"
    ){

        const yesterday =
        new Date(now);

        yesterday.setDate(
            yesterday.getDate() - 1
        );


        return sameDay(
            orderDate,
            yesterday
        );

    }


    if(
        currentDateFilter ===
        "7days"
    ){

        const start =
        new Date(now);

        start.setHours(
            0,0,0,0
        );

        start.setDate(
            start.getDate() - 6
        );


        const end =
        new Date(now);

        end.setHours(
            23,59,59,999
        );


        return(
            orderDate >= start &&
            orderDate <= end
        );

    }


    if(
        currentDateFilter ===
        "month"
    ){

        return(
            orderDate.getFullYear() ===
            now.getFullYear() &&

            orderDate.getMonth() ===
            now.getMonth()
        );

    }


    if(
        currentDateFilter ===
        "custom"
    ){

        if(!customDate){
            return true;
        }


        const selectedDate =
        new Date(
            customDate +
            "T00:00:00"
        );


        return sameDay(
            orderDate,
            selectedDate
        );

    }


    return true;

}


// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters(){

    let filtered =
    allOrders.filter(
        function(item){

            const order =
            item.data;


            const date =
            getOrderDate(
                order.createdAt
            );


            if(
                !isDateMatch(date)
            ){

                return false;

            }


            if(
                currentStatusFilter !==
                "all"
            ){

                const status =
                String(
                    order.status ||
                    "Pending"
                ).toLowerCase();


                if(
                    status !==
                    currentStatusFilter.toLowerCase()
                ){

                    return false;

                }

            }


            return true;

        }
    );


    renderOrders(
        filtered
    );

}


// ==========================================
// RENDER ORDERS
// ==========================================

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

    let rejected = 0;


    if(orders.length === 0){

        table.innerHTML = `

            <tr>

                <td colspan="12">

                    📦 No orders found
                    for this selection.

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


            const email =
            order.email ||
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


            const lowerStatus =
            String(status)
            .toLowerCase();


            if(
                lowerStatus ===
                "pending"
            ){

                pending++;

            }


            if(
                lowerStatus ===
                "success"
            ){

                success++;

            }


            if(
                lowerStatus ===
                "rejected"
            ){

                rejected++;

            }


            const row =
            document.createElement(
                "tr"
            );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        item.id
                    )}
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
                    LKR
                    ${total.toLocaleString(
                        "en-US"
                    )}
                </td>

                <td class="${escapeHTML(
                    lowerStatus
                )}">

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


    const totalElement =
    document.getElementById(
        "totalOrders"
    );


    if(totalElement){

        totalElement.textContent =
        totalOrders;

    }


    const revenueElement =
    document.getElementById(
        "revenue"
    );


    if(revenueElement){

        revenueElement.textContent =
        revenue.toLocaleString(
            "en-US"
        );

    }


    const pendingElement =
    document.getElementById(
        "pendingOrders"
    );


    if(pendingElement){

        pendingElement.textContent =
        pending;

    }


    const successElement =
    document.getElementById(
        "successOrders"
    );


    if(successElement){

        successElement.textContent =
        success;

    }


    const rejectedElement =
    document.getElementById(
        "rejectedOrders"
    );


    if(rejectedElement){

        rejectedElement.textContent =
        rejected;

    }


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
        await checkAdmin(
            user
        );


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
document.getElementById(
    "search"
);


if(search){

    search.addEventListener(
        "input",
        function(){

            const value =
            this.value
            .trim()
            .toLowerCase();


            let filtered =
            allOrders;


            if(value){

                filtered =
                allOrders.filter(
                    function(item){

                        const order =
                        item.data;


                        const text = [

                            item.id,

                            order.customerName,

                            order.playerName,

                            order.name,

                            order.email,

                            order.userId,

                            order.gameUID,

                            order.gameUid,

                            order.gameId,

                            order.productName,

                            order.product,

                            order.package,

                            order.paymentMethod,

                            order.payment,

                            order.phone,

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

            }


            filtered =
            filtered.filter(
                function(item){

                    const order =
                    item.data;

                    const date =
                    getOrderDate(
                        order.createdAt
                    );


                    if(
                        !isDateMatch(
                            date
                        )
                    ){

                        return false;

                    }


                    if(
                        currentStatusFilter !==
                        "all"
                    ){

                        return String(
                            order.status ||
                            "Pending"
                        ).toLowerCase()
                        ===
                        currentStatusFilter.toLowerCase();

                    }


                    return true;

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

function escapeHTML(
    value
){

    if(
        value === null ||
        value === undefined
    ){

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
