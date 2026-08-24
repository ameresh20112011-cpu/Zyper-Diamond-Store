import {
    auth,
    db
} from "./firebase.js";


import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


let allOrders = [];

let selectedDate = "";


/* =========================
   ADMIN CHECK
========================= */

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

        console.error(error);

        return false;

    }

}


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");


if(loginForm){

    loginForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


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


            const button =
                document.getElementById("login");


            if(!email || !password){

                msg.textContent =
                    "Enter email and password";

                return;

            }


            button.disabled = true;

            button.textContent =
                "LOGIN...";


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
                        "❌ You are not admin";

                    button.disabled = false;

                    button.textContent =
                        "LOGIN";

                    return;

                }


                window.location.href =
                    "./admin-dashboard.html";

            }

            catch(error){

                console.error(error);

                msg.textContent =
                    error.message;

                button.disabled = false;

                button.textContent =
                    "LOGIN";

            }

        }
    );

}


/* =========================
   DASHBOARD AUTH
========================= */

const orderTable =
    document.getElementById("orders");


if(orderTable){

    onAuthStateChanged(
        auth,
        async function(user){

            if(!user){

                window.location.href =
                    "./admin-login.html";

                return;

            }


            const isAdmin =
                await checkAdmin(user);


            if(!isAdmin){

                await signOut(auth);

                window.location.href =
                    "./admin-login.html";

                return;

            }


            document
            .getElementById("app")
            .style.display =
                "block";


            /*
             * DEFAULT = TODAY
             */

            const today =
                getTodayString();


            selectedDate =
                today;


            document
            .getElementById("orderDate")
            .value =
                today;


            await loadOrders();

        }
    );

}


/* =========================
   TODAY STRING
========================= */

function getTodayString(){

    const date =
        new Date();


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

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(timestamp){

    if(!timestamp){

        return "-";

    }


    try{

        const date =
            timestamp.toDate
            ?
            timestamp.toDate()
            :
            new Date(timestamp);


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


        return (
            `${hour}:${minute} , ${year}/${month}/${day}`
        );

    }

    catch{

        return "-";

    }

}


/* =========================
   GET TIME
========================= */

function getTime(timestamp){

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
        timestamp.seconds !==
        undefined
    ){

        return (
            Number(
                timestamp.seconds
            ) * 1000
        );

    }


    return 0;

}


/* =========================
   CHECK SAME DATE
========================= */

function isSameDate(
    timestamp,
    dateString
){

    if(!timestamp){

        return false;

    }


    try{

        const date =
            timestamp.toDate
            ?
            timestamp.toDate()
            :
            new Date(timestamp);


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


        const result =
            `${year}-${month}-${day}`;


        return result === dateString;

    }

    catch{

        return false;

    }

}


/* =========================
   LOAD ORDERS
========================= */

async function loadOrders(){

    const table =
        document.getElementById(
            "orders"
        );


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
            function(item){

                allOrders.push({

                    id:item.id,

                    data:item.data()

                });

            }
        );


        allOrders.sort(
            function(a,b){

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
         * SHOW SELECTED DATE ONLY
         */

        const filtered =
            allOrders.filter(
                function(item){

                    return isSameDate(
                        item.data.createdAt,
                        selectedDate
                    );

                }
            );


        renderOrders(
            filtered
        );

    }

    catch(error){

        console.error(error);


        table.innerHTML = `

            <tr>

                <td colspan="11">

                    ❌ Failed to load orders

                </td>

            </tr>

        `;

    }

}


/* =========================
   RENDER ORDERS
========================= */

function renderOrders(orders){

    const table =
        document.getElementById(
            "orders"
        );


    let total = 0;

    let revenue = 0;

    let pending = 0;

    let success = 0;


    table.innerHTML = "";


    /*
     * NO ORDER
     */

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


            const orderId =
                order.orderId ||
                order.orderID ||
                order.orderNumber ||
                item.id;


            const customer =
                order.customerName ||
                order.name ||
                "-";


            const uid =
                order.userId ||
                order.uid ||
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


            const amount =
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


            total++;

            revenue += amount;


            if(
                status.toLowerCase()
                ===
                "pending"
            ){

                pending++;

            }


            if(
                status.toLowerCase()
                ===
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


    table
    .querySelectorAll(
        ".action-btn"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                function(){

                    changeStatus(
                        button.dataset.id,
                        button.dataset.status
                    );

                }
            );

        }
    );

}


/* =========================
   CARDS
========================= */

function updateCards(
    total,
    revenue,
    pending,
    success
){

    document.getElementById(
        "totalOrders"
    ).textContent =
        total;


    document.getElementById(
        "revenue"
    ).textContent =
        revenue.toLocaleString(
            "en-LK"
        );


    document.getElementById(
        "pendingOrders"
    ).textContent =
        pending;


    document.getElementById(
        "successOrders"
    ).textContent =
        success;

}


/* =========================
   DATE SEARCH BUTTON
========================= */

const dateSearch =
    document.getElementById(
        "dateSearch"
    );


if(dateSearch){

    dateSearch.addEventListener(
        "click",
        async function(){

            const date =
                document.getElementById(
                    "orderDate"
                ).value;


            if(!date){

                alert(
                    "Please select a date"
                );

                return;

            }


            selectedDate =
                date;


            await loadOrders();

        }
    );

}


/* =========================
   TODAY BUTTON
========================= */

const todayButton =
    document.getElementById(
        "todayButton"
    );


if(todayButton){

    todayButton.addEventListener(
        "click",
        async function(){

            const today =
                getTodayString();


            selectedDate =
                today;


            document.getElementById(
                "orderDate"
            ).value =
                today;


            await loadOrders();

        }
    );

}


/* =========================
   TEXT SEARCH
========================= */

const search =
    document.getElementById(
        "search"
    );


if(search){

    search.addEventListener(
        "input",
        function(){

            const value =
                search.value
                .toLowerCase()
                .trim();


            /*
             * FIRST FILTER BY DATE
             */

            let filtered =
                allOrders.filter(
                    function(item){

                        return isSameDate(
                            item.data.createdAt,
                            selectedDate
                        );

                    }
                );


            /*
             * THEN SEARCH
             */

            if(value){

                filtered =
                    filtered.filter(
                        function(item){

                            const order =
                                item.data;


                            const orderId =
                                order.orderId ||
                                order.orderID ||
                                order.orderNumber ||
                                item.id;


                            const fields = [

                                orderId,

                                order.customerName,

                                order.name,

                                order.userId,

                                order.uid,

                                order.gameUID,

                                order.gameUid,

                                order.productName,

                                order.product,

                                order.package,

                                order.paymentMethod,

                                order.payment,

                                order.status

                            ];


                            return fields.some(
                                function(field){

                                    return (
                                        field &&
                                        String(field)
                                        .toLowerCase()
                                        .includes(value)
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


/* =========================
   REFRESH
========================= */

const refresh =
    document.getElementById(
        "refresh"
    );


if(refresh){

    refresh.addEventListener(
        "click",
        async function(){

            refresh.disabled =
                true;


            refresh.textContent =
                "Loading...";


            await loadOrders();


            refresh.disabled =
                false;


            refresh.textContent =
                "↻ Refresh";

        }
    );

}


/* =========================
   LOGOUT
========================= */

const logout =
    document.getElementById(
        "logout"
    );


if(logout){

    logout.addEventListener(
        "click",
        async function(){

            await signOut(
                auth
            );


            window.location.href =
                "./admin-login.html";

        }
    );

}


/* =========================
   ESCAPE HTML
========================= */

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
