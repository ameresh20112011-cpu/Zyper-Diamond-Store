```javascript
// ==========================================
// ZYPER DIAMOND STORE
// ADMIN JAVASCRIPT
// ==========================================

import {
    auth,
    db
} from "./firebase.js";


import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const loginButton =
document.getElementById("login");

const ordersTable =
document.getElementById("orders");


// ==========================================
// CHECK ADMIN
// ==========================================

async function checkAdmin(user){

    if(!user){
        return false;
    }

    try{

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
            "Admin check:",
            error
        );

        return false;
    }
}


// ==========================================
// LOGIN
// ==========================================

if(loginButton){

    loginButton.addEventListener(
        "click",
        adminLogin
    );


    document
    .getElementById("password")
    ?.addEventListener(
        "keydown",
        function(event){

            if(event.key === "Enter"){
                adminLogin();
            }

        }
    );

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
        "❌ Enter email and password.";

        return;
    }


    loginButton.disabled = true;

    loginButton.textContent =
    "⏳ Logging in...";


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

            await signOut(auth);

            msg.textContent =
            "❌ Login successful, but this account is not an admin.";

            loginButton.disabled = false;

            loginButton.textContent =
            "LOGIN";

            return;
        }


        window.location.href =
        "admin-dashboard.html";


    }catch(error){

        console.error(
            "Admin login error:",
            error
        );


        let message =
        "❌ Login failed.";


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
            "❌ Invalid email.";

        }
        else if(
            error.code ===
            "auth/too-many-requests"
        ){

            message =
            "❌ Too many attempts. Try again later.";

        }
        else if(
            error.code ===
            "auth/network-request-failed"
        ){

            message =
            "❌ Network error.";

        }
        else{

            message =
            "❌ " +
            error.message;

        }


        msg.textContent =
        message;

        loginButton.disabled = false;

        loginButton.textContent =
        "LOGIN";
    }
}


// ==========================================
// DASHBOARD AUTH
// ==========================================

if(ordersTable){

    onAuthStateChanged(
        auth,
        async function(user){

            const isAdmin =
            await checkAdmin(user);


            if(!isAdmin){

                window.location.href =
                "admin-login.html";

                return;
            }


            document
            .getElementById("app")
            .style.display =
            "block";


            await loadOrders();

        }
    );
}


// ==========================================
// DATA
// ==========================================

let allOrders = [];

let currentFilter =
"all";


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders(){

    if(!ordersTable){
        return;
    }


    ordersTable.innerHTML = `

        <tr>
            <td colspan="11"
            class="loading">
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
            function(item){

                allOrders.push({

                    id:item.id,

                    data:item.data()

                });

            }
        );


        allOrders.sort(
            function(a,b){

                return getTime(
                    b.data.createdAt
                )
                -
                getTime(
                    a.data.createdAt
                );

            }
        );


        applyFilters();


    }catch(error){

        console.error(
            "Orders error:",
            error
        );


        ordersTable.innerHTML = `

            <tr>
                <td colspan="11"
                class="loading">

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
// TIME
// ==========================================

function getTime(timestamp){

    if(!timestamp){
        return 0;
    }


    if(
        typeof timestamp.toDate ===
        "function"
    ){

        return timestamp
        .toDate()
        .getTime();

    }


    if(
        timestamp.seconds != null
    ){

        return Number(
            timestamp.seconds
        ) * 1000;

    }


    return 0;
}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(timestamp){

    const time =
    getTime(timestamp);


    if(!time){
        return "-";
    }


    const date =
    new Date(time);


    return date.toLocaleString(
        "en-LK",
        {
            year:"numeric",
            month:"2-digit",
            day:"2-digit",
            hour:"2-digit",
            minute:"2-digit"
        }
    );
}


// ==========================================
// RENDER
// ==========================================

function renderOrders(list){

    ordersTable.innerHTML = "";


    if(list.length === 0){

        ordersTable.innerHTML = `

            <tr>

                <td colspan="11"
                class="loading">

                    📦 No orders found
                    for the selected filter.

                </td>

            </tr>

        `;

        updateStats([]);

        return;
    }


    list.forEach(
        function(item){

            const order =
            item.data;


            const customer =
            order.customerName ||
            order.playerName ||
            "-";


            const email =
            order.customerEmail ||
            order.email ||
            "-";


            const firebaseUID =
            order.userId ||
            "-";


            const gameUID =
            order.gameUID ||
            order.gameUid ||
            order.uid ||
            "-";


            const product =
            order.productName ||
            order.product ||
            order.package ||
            "-";


            const price =
            Number(
                order.productPrice ||
                order.price ||
                0
            );


            const phone =
            order.phone ||
            "-";


            const status =
            normalizeStatus(
                order.status
            );


            const row =
            document.createElement(
                "tr"
            );


            row.innerHTML = `

                <td>
                    <b>
                    ${escapeHTML(item.id)}
                    </b>
                </td>

                <td>
                    ${escapeHTML(customer)}
                </td>

                <td>
                    ${escapeHTML(email)}
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
                    LKR
                    ${price.toLocaleString("en-US")}
                </td>

                <td>
                    ${escapeHTML(phone)}
                </td>

                <td>
                    ${escapeHTML(
                        formatDate(
                            order.createdAt
                        )
                    )}
                </td>

                <td>
                    ${statusBadge(status)}
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


            ordersTable.appendChild(
                row
            );

        }
    );


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


    updateStats(list);
}


// ==========================================
// STATUS
// ==========================================

function normalizeStatus(status){

    if(!status){
        return "Pending";
    }


    const value =
    String(status)
    .toLowerCase();


    if(value === "success"){
        return "Success";
    }


    if(value === "approved"){
        return "Success";
    }


    if(value === "rejected"){
        return "Rejected";
    }


    return "Pending";
}


function statusBadge(status){

    if(status === "Success"){

        return `
        <span class="status-badge status-success">
            ✅ Success
        </span>
        `;

    }


    if(status === "Rejected"){

        return `
        <span class="status-badge status-rejected">
            ❌ Rejected
        </span>
        `;

    }


    return `
    <span class="status-badge status-pending">
        ⏳ Pending
    </span>
    `;
}


// ==========================================
// STATS
// ==========================================

function updateStats(list){

    let total = 0;

    let revenue = 0;

    let pending = 0;

    let success = 0;


    list.forEach(
        function(item){

            const order =
            item.data;


            total++;


            const amount =
            Number(
                order.total ||
                order.price ||
                order.productPrice ||
                0
            );


            if(
                normalizeStatus(
                    order.status
                ) === "Success"
            ){

                revenue += amount;

                success++;

            }


            if(
                normalizeStatus(
                    order.status
                ) === "Pending"
            ){

                pending++;

            }

        }
    );


    document
    .getElementById("totalOrders")
    .textContent =
    total;


    document
    .getElementById("revenue")
    .textContent =
    revenue.toLocaleString(
        "en-US"
    );


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
// CHANGE STATUS
// ==========================================

async function changeStatus(
    id,
    status
){

    try{

        const user =
        auth.currentUser;


        if(
            !(await checkAdmin(user))
        ){

            alert(
                "❌ Admin access required."
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
            error
        );


        alert(
            "❌ Failed to update order:\n\n" +
            error.message
        );
    }
}


// ==========================================
// FILTER
// ==========================================

function applyFilters(){

    const search =
    document
    .getElementById("search")
    ?.value
    .trim()
    .toLowerCase() || "";


    const fromDate =
    document
    .getElementById("fromDate")
    ?.value || "";


    const toDate =
    document
    .getElementById("toDate")
    ?.value || "";


    const status =
    document
    .getElementById("statusFilter")
    ?.value || "all";


    let filtered =
    allOrders.filter(
        function(item){

            const order =
            item.data;


            /* SEARCH */

            const searchText = [

                item.id,

                order.customerName,

                order.playerName,

                order.customerEmail,

                order.email,

                order.userId,

                order.gameUID,

                order.gameUid,

                order.uid,

                order.productName,

                order.product,

                order.package,

                order.phone,

                order.status

            ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


            if(
                search &&
                !searchText.includes(search)
            ){

                return false;
            }


            /* STATUS */

            if(
                status !== "all" &&
                normalizeStatus(
                    order.status
                ) !== status
            ){

                return false;
            }


            /* DATE */

            const time =
            getTime(
                order.createdAt
            );


            if(fromDate){

                const start =
                new Date(
                    fromDate +
                    "T00:00:00"
                ).getTime();


                if(
                    time < start
                ){

                    return false;
                }
            }


            if(toDate){

                const end =
                new Date(
                    toDate +
                    "T23:59:59.999"
                ).getTime();


                if(
                    time > end
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


    updateFilterInfo(
        filtered.length,
        fromDate,
        toDate,
        status,
        search
    );
}


// ==========================================
// FILTER INFO
// ==========================================

function updateFilterInfo(
    count,
    fromDate,
    toDate,
    status,
    search
){

    const info =
    document.getElementById(
        "filterInfo"
    );


    if(!info){
        return;
    }


    let text =
    `Showing ${count} order${count === 1 ? "" : "s"}`;


    if(fromDate || toDate){

        text += " • Date filter";

    }


    if(status !== "all"){

        text +=
        " • " +
        status;

    }


    if(search){

        text +=
        " • Search: " +
        search;

    }


    info.textContent =
    text;
}


// ==========================================
// SEARCH
// ==========================================

document
.getElementById("search")
?.addEventListener(
    "input",
    applyFilters
);


// ==========================================
// DATE FILTER
// ==========================================

document
.getElementById("fromDate")
?.addEventListener(
    "change",
    applyFilters
);


document
.getElementById("toDate")
?.addEventListener(
    "change",
    applyFilters
);


// ==========================================
// STATUS FILTER
// ==========================================

document
.getElementById("statusFilter")
?.addEventListener(
    "change",
    applyFilters
);


// ==========================================
// CLEAR FILTER
// ==========================================

document
.getElementById("clearFilter")
?.addEventListener(
    "click",
    function(){

        document
        .getElementById("search")
        .value = "";

        document
        .getElementById("fromDate")
        .value = "";

        document
        .getElementById("toDate")
        .value = "";

        document
        .getElementById("statusFilter")
        .value = "all";

        applyFilters();

    }
);


// ==========================================
// SIDEBAR FILTERS
// ==========================================

document
.getElementById("allOrdersBtn")
?.addEventListener(
    "click",
    function(){

        document
        .getElementById("statusFilter")
        .value = "all";

        applyFilters();

    }
);


document
.getElementById("pendingBtn")
?.addEventListener(
    "click",
    function(){

        document
        .getElementById("statusFilter")
        .value = "Pending";

        applyFilters();

    }
);


document
.getElementById("successBtn")
?.addEventListener(
    "click",
    function(){

        document
        .getElementById("statusFilter")
        .value = "Success";

        applyFilters();

    }
);


document
.getElementById("rejectedBtn")
?.addEventListener(
    "click",
    function(){

        document
        .getElementById("statusFilter")
        .value = "Rejected";

        applyFilters();

    }
);


// ==========================================
// REFRESH
// ==========================================

document
.getElementById("refresh")
?.addEventListener(
    "click",
    loadOrders
);


// ==========================================
// LOGOUT
// ==========================================

document
.getElementById("logout")
?.addEventListener(
    "click",
    async function(){

        try{

            await signOut(auth);

            window.location.href =
            "admin-login.html";

        }catch(error){

            alert(
                "Logout failed: " +
                error.message
            );

        }

    }
);


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value){

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
```
