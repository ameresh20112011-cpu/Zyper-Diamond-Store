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

/* =====================================================
GLOBAL DATA
===================================================== */

let allOrders = [];

let selectedDate = "";

let searchValue = "";

/* =====================================================
ADMIN CHECK
===================================================== */

async function checkAdmin(user){

```
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
```

}

/* =====================================================
LOGIN
===================================================== */

const loginButton =
document.getElementById("login");

if(loginButton){

```
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
```

}

async function adminLogin(){

```
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


loginButton.disabled = true;

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

        loginButton.disabled = false;

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
```

}

/* =====================================================
DASHBOARD PROTECTION
===================================================== */

const orderTable =
document.getElementById("orders");

if(orderTable){

```
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
```

}

/* =====================================================
FIRESTORE DATE CONVERTER
===================================================== */

function getOrderDate(timestamp){

```
if(!timestamp){
    return null;
}


try{

    if(
        timestamp &&
        typeof timestamp.toDate === "function"
    ){

        return timestamp.toDate();

    }


    if(
        timestamp instanceof Date
    ){

        return timestamp;

    }


    if(
        typeof timestamp === "number"
    ){

        return new Date(timestamp);

    }


    if(
        typeof timestamp === "string"
    ){

        const date =
            new Date(timestamp);

        if(!isNaN(date.getTime())){
            return date;
        }

    }


    if(
        timestamp.seconds !== undefined
    ){

        return new Date(
            timestamp.seconds * 1000
        );

    }


    return null;

}catch{

    return null;

}
```

}

/* =====================================================
DATE KEY
===================================================== */

function getDateKey(date){

```
if(!date){
    return "";
}


const year =
    date.getFullYear();


const month =
    String(
        date.getMonth() + 1
    ).padStart(2,"0");


const day =
    String(
        date.getDate()
    ).padStart(2,"0");


return (
    year +
    "-" +
    month +
    "-" +
    day
);
```

}

/* =====================================================
FORMAT DATE
===================================================== */

function formatDate(timestamp){

```
const date =
    getOrderDate(timestamp);


if(!date){
    return "-";
}


const year =
    date.getFullYear();


const month =
    String(
        date.getMonth() + 1
    ).padStart(2,"0");


const day =
    String(
        date.getDate()
    ).padStart(2,"0");


const hour =
    String(
        date.getHours()
    ).padStart(2,"0");


const minute =
    String(
        date.getMinutes()
    ).padStart(2,"0");


const second =
    String(
        date.getSeconds()
    ).padStart(2,"0");


return (
    year +
    "/" +
    month +
    "/" +
    day +
    " " +
    hour +
    ":" +
    minute +
    ":" +
    second
);
```

}

/* =====================================================
LOAD ORDERS
===================================================== */

async function loadOrders(){

```
const table =
    document.getElementById("orders");


if(!table){
    return;
}


table.innerHTML = `

    <tr>
        <td
            colspan="12"
            class="loading-cell">

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

                id:
                    document.id,

                data:
                    document.data()

            });

        }
    );


    /* newest first */

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


            return (
                dateB.getTime() -
                dateA.getTime()
            );

        }
    );


    renderFilteredOrders();


}catch(error){

    console.error(
        "Load orders error:",
        error
    );


    table.innerHTML = `

        <tr>

            <td
                colspan="12"
                class="loading-cell">

                ❌ Failed to load orders

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </td>

        </tr>

    `;

}
```

}

/* =====================================================
FILTER ORDERS
===================================================== */

function renderFilteredOrders(){

```
let filtered =
    [...allOrders];


/* DATE FILTER */

if(selectedDate){

    filtered =
        filtered.filter(
            function(item){

                const date =
                    getOrderDate(
                        item.data.createdAt
                    );


                if(!date){
                    return false;
                }


                return (
                    getDateKey(date) ===
                    selectedDate
                );

            }
        );

}


/* SEARCH */

if(searchValue){

    filtered =
        filtered.filter(
            function(item){

                const order =
                    item.data;


                const text = [

                    item.id,

                    order.customerName,

                    order.playerName,

                    order.name,

                    order.email,

                    order.customerEmail,

                    order.userEmail,

                    order.userId,

                    order.gameUID,

                    order.gameUid,

                    order.gameId,

                    order.uid,

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
                        value !== null
                )
                .join(" ")
                .toLowerCase();


                return text.includes(
                    searchValue
                );

            }
        );

}


renderOrders(filtered);
```

}

/* =====================================================
RENDER ORDERS
===================================================== */

function renderOrders(orders){

```
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


/* =================================================
   NO ORDERS
================================================= */

if(orders.length === 0){

    let message =
        "📦 No orders found.";


    if(selectedDate){

        message =
            "📅 No orders on " +
            formatSelectedDate(
                selectedDate
            );

    }


    if(searchValue){

        message +=
            "<br><br>🔎 No matching orders.";

    }


    table.innerHTML = `

        <tr>

            <td
                colspan="12"
                class="loading-cell">

                ${message}

            </td>

        </tr>

    `;


    updateStats(
        0,
        0,
        0,
        0
    );


    updateDailyInfo(
        orders
    );


    return;

}


/* =================================================
   BUILD TABLE
================================================= */

orders.forEach(
    function(item){

        const order =
            item.data;


        const customer =
            order.customerName ||
            order.playerName ||
            order.name ||
            "-";


        /* EMAIL FIX */

        const email =
            order.email ||
            order.customerEmail ||
            order.userEmail ||
            order.user_email ||
            "-";


        const firebaseUID =
            order.userId ||
            order.uid ||
            "-";


        const gameUID =
            order.gameUID ||
            order.gameUid ||
            order.gameId ||
            order.game_uid ||
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


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>

                <span class="order-id">

                    ${escapeHTML(
                        item.id
                    )}

                </span>

            </td>


            <td>

                <span class="customer-name">

                    ${escapeHTML(
                        customer
                    )}

                </span>

            </td>


            <td>

                <span class="email-cell">

                    ${escapeHTML(
                        email
                    )}

                </span>

            </td>


            <td>

                <span class="uid">

                    ${escapeHTML(
                        firebaseUID
                    )}

                </span>

            </td>


            <td>

                <span class="uid">

                    ${escapeHTML(
                        gameUID
                    )}

                </span>

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


            <td
                class="${escapeHTML(
                    status
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

                    ✔ Success

                </button>


                <button

                    class="action-rejected"

                    data-id="${escapeHTML(
                        item.id
                    )}"

                    data-status="Rejected">

                    ✖ Reject

                </button>

            </td>

        `;


        table.appendChild(
            row
        );

    }
);


updateStats(
    totalOrders,
    revenue,
    pending,
    success
);


updateDailyInfo(
    orders
);


/* =================================================
   BUTTON EVENTS
================================================= */

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
```

}

/* =====================================================
UPDATE STATS
===================================================== */

function updateStats(
total,
revenue,
pending,
success
){

```
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
        total;

}


if(revenueElement){

    revenueElement.textContent =
        revenue.toLocaleString(
            "en-US"
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
```

}

/* =====================================================
DAILY INFO
===================================================== */

function updateDailyInfo(orders){

```
const info =
    document.getElementById(
        "dailyInfo"
    );


if(!info){
    return;
}


if(selectedDate){

    info.innerHTML =
        "📅 Showing orders for <b>" +
        escapeHTML(
            formatSelectedDate(
                selectedDate
            )
        ) +
        "</b> — " +
        orders.length +
        " order(s)";

    return;

}


info.textContent =
    "📦 Showing all orders — " +
    orders.length +
    " order(s)";
```

}

/* =====================================================
FORMAT SELECTED DATE
===================================================== */

function formatSelectedDate(value){

```
if(!value){
    return "";
}


const parts =
    value.split("-");


if(parts.length !== 3){
    return value;
}


return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
);
```

}

/* =====================================================
CHANGE STATUS
===================================================== */

async function changeStatus(
id,
status
){

```
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
            status:
                status
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
```

}

/* =====================================================
SEARCH
===================================================== */

const search =
document.getElementById(
"search"
);

if(search){

```
search.addEventListener(
    "input",
    function(){

        searchValue =
            this.value
            .trim()
            .toLowerCase();


        renderFilteredOrders();

    }
);
```

}

/* =====================================================
DATE FILTER
===================================================== */

const dateFilter =
document.getElementById(
"dateFilter"
);

if(dateFilter){

```
dateFilter.addEventListener(
    "change",
    function(){

        selectedDate =
            this.value;


        renderFilteredOrders();

    }
);
```

}

/* =====================================================
TODAY BUTTON
===================================================== */

const todayBtn =
document.getElementById(
"todayBtn"
);

if(todayBtn){

```
todayBtn.addEventListener(
    "click",
    function(){

        const today =
            new Date();


        selectedDate =
            getDateKey(
                today
            );


        if(dateFilter){

            dateFilter.value =
                selectedDate;

        }


        renderFilteredOrders();

    }
);
```

}

/* =====================================================
ALL ORDERS BUTTON
===================================================== */

const allBtn =
document.getElementById(
"allBtn"
);

if(allBtn){

```
allBtn.addEventListener(
    "click",
    function(){

        selectedDate =
            "";


        if(dateFilter){

            dateFilter.value =
                "";

        }


        renderFilteredOrders();

    }
);
```

}

/* =====================================================
LOGOUT
===================================================== */

const logout =
document.getElementById(
"logout"
);

if(logout){

```
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
```

}

/* =====================================================
ESCAPE HTML
===================================================== */

function escapeHTML(value){

```
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
```

}
