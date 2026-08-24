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



/* =====================================
   ADMIN CHECK
===================================== */

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

return (

adminDoc.exists() &&
adminDoc.data().role === "admin"

);

}catch(error){

console.error(
"Admin check:",
error
);

return false;

}

}



/* =====================================
   LOGIN
===================================== */

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


if(!email || !password){

msg.textContent =
"Enter email and password.";

return;

}


loginButton.disabled =
true;

loginButton.textContent =
"LOGIN...";


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


if(admin){

location.href =
"admin-dashboard.html";

}else{

msg.textContent =
"❌ You are not admin.";

await signOut(auth);

}


}catch(error){

console.error(error);

msg.textContent =
"❌ " +
error.message;

}finally{

loginButton.disabled =
false;

loginButton.textContent =
"LOGIN";

}

};

}



/* =====================================
   DASHBOARD PROTECTION
===================================== */

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



/* =====================================
   DATE
===================================== */

function formatDate(timestamp){

if(!timestamp){

return "-";

}


if(timestamp.toDate){

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


return timestamp;

}



/* =====================================
   LOAD ORDERS
===================================== */

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


let orders = [];


snapshot.forEach(
(document)=>{

orders.push({

id:document.id,

data:document.data()

});

});


/* NEWEST FIRST */

orders.sort(
(a,b)=>{

const aDate =
a.data.createdAt;

const bDate =
b.data.createdAt;


if(
aDate &&
bDate &&
aDate.seconds !== undefined &&
bDate.seconds !== undefined
){

return (
bDate.seconds -
aDate.seconds
);

}


return 0;

});


let totalOrders = 0;

let revenue = 0;

let pending = 0;

let success = 0;


table.innerHTML = "";


if(orders.length === 0){

table.innerHTML = `

<tr>

<td colspan="11">

📦 No orders found.

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
(item)=>{

const order =
item.data;


/* CUSTOMER */

const customer =
order.customerName ||
order.playerName ||
order.name ||
"-";


/* FIREBASE UID */

const firebaseUID =
order.userId ||
"-";


/* GAME UID */

const gameUID =
order.gameUID ||
order.gameUid ||
order.gameId ||
order.uid ||
"-";


/* PRODUCT */

const product =
order.productName ||
order.product ||
order.package ||
order.plan ||
"-";


/* PRICE */

const price =
Number(

order.productPrice ||
order.price ||
0

);


/* PHONE */

const phone =
order.phone ||
order.customerPhone ||
order.whatsapp ||
"-";


/* PAYMENT */

const payment =
order.paymentMethod ||
order.payment ||
"-";


/* TOTAL */

const total =
Number(

order.total ||
order.amount ||
price ||
0

);


/* DATE */

const date =
formatDate(
order.createdAt
);


/* STATUS */

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


/* ROW */

const row =
document.createElement("tr");


row.innerHTML = `

<td>

<b>${item.id}</b>

<br>

<button
class="copy-btn"
data-copy="${item.id}">

📋 Copy

</button>

</td>


<td>

${customer}

</td>


<td>

${firebaseUID}

<br>

<button
class="copy-btn"
data-copy="${firebaseUID}">

📋

</button>

</td>


<td>

${gameUID}

<br>

<button
class="copy-btn"
data-copy="${gameUID}">

📋

</button>

</td>


<td>

${product}

</td>


<td>

LKR ${price.toLocaleString("en-US")}

</td>


<td>

${payment}

<br>

${phone}

</td>


<td>

${date}

</td>


<td>

LKR ${total.toLocaleString("en-US")}

</td>


<td class="${status}">

${status}

</td>


<td>


<button
class="success-btn"
data-success>

✔

</button>


<button
class="reject-btn"
data-reject>

✖

</button>


<button
class="whatsapp-btn"
data-whatsapp>

💬

</button>


</td>

`;


/* BUTTONS */

const successButton =
row.querySelector(
"[data-success]"
);


const rejectButton =
row.querySelector(
"[data-reject]"
);


const whatsappButton =
row.querySelector(
"[data-whatsapp]"
);


/* ALREADY SUCCESS */

if(status === "Success"){

successButton.disabled =
true;

}


/* ALREADY REJECTED */

if(status === "Rejected"){

rejectButton.disabled =
true;

}


/* SUCCESS */

successButton.onclick =
function(){

changeStatus(

item.id,

"Success",

order

);

};


/* REJECT */

rejectButton.onclick =
function(){

changeStatus(

item.id,

"Rejected",

order

);

};


/* WHATSAPP */

whatsappButton.onclick =
function(){

openWhatsApp(

order,

item.id,

status

);

};


table.appendChild(row);

}

);


/* UPDATE CARDS */

updateCards(

totalOrders,
revenue,
pending,
success

);


}catch(error){

console.error(error);

table.innerHTML = `

<tr>

<td colspan="11">

❌ Error loading orders

<br><br>

${error.message}

</td>

</tr>

`;

}

}



/* =====================================
   DASHBOARD CARDS
===================================== */

function updateCards(

total,
revenue,
pending,
success

){

document
.getElementById("totalOrders")
.textContent =
total;


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



/* =====================================
   CHANGE STATUS
===================================== */

window.changeStatus =
async function(

orderId,
newStatus,
order

){

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


let question;


if(newStatus === "Success"){

question =
"Are you sure you want to mark this order as SUCCESS?";

}else{

question =
"Are you sure you want to REJECT this order?";

}


if(!confirm(question)){

return;

}


try{

/* FIREBASE UPDATE */

await updateDoc(

doc(
db,
"orders",
orderId
),

{

status:newStatus,

statusUpdatedAt:
new Date(),

statusUpdatedBy:
user.uid

}

);


alert(
"✅ Firebase updated successfully."
);


/* WHATSAPP */

openWhatsApp(

order,
orderId,
newStatus

);


/* REFRESH */

await loadOrders();


}catch(error){

console.error(error);

alert(

"❌ Firebase update failed.\n\n" +
error.message

);

}

};



/* =====================================
   WHATSAPP
===================================== */

function openWhatsApp(

order,
orderId,
status

){

let phone =
order.phone ||
order.customerPhone ||
order.whatsapp ||
"";


/* REMOVE SYMBOLS */

phone =
String(phone)
.replace(
/[\s\-().]/g,
""
);


/* SRI LANKA 07XXXXXXXX */

if(phone.startsWith("0")){

phone =
"94" +
phone.substring(1);

}


/* REMOVE + */

if(phone.startsWith("+")){

phone =
phone.substring(1);

}


if(!phone){

alert(
"❌ Customer WhatsApp number not found."
);

return;

}


/* DATA */

const customer =
order.customerName ||
order.playerName ||
order.name ||
"Customer";


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
order.amount ||
order.total ||
0

);


/* MESSAGE */

let message;


if(status === "Success"){

message =

`💎 ZYPER DIAMOND STORE

━━━━━━━━━━━━━━━━

🧾 Order ID: ${orderId}

👤 Customer: ${customer}

🎮 UID: ${gameUID}

📦 Package: ${product}

💰 Amount: LKR ${price.toLocaleString("en-US")}

✅ Status: SUCCESS

Your order has been successfully completed.

Thank you for ordering from Zyper Diamond Store 💎

━━━━━━━━━━━━━━━━`;

}else if(status === "Rejected"){

message =

`💎 ZYPER DIAMOND STORE

━━━━━━━━━━━━━━━━

🧾 Order ID: ${orderId}

👤 Customer: ${customer}

🎮 UID: ${gameUID}

📦 Package: ${product}

💰 Amount: LKR ${price.toLocaleString("en-US")}

❌ Status: REJECTED

Unfortunately, your order/payment could not be approved.

Please contact Zyper Diamond Store for assistance.

━━━━━━━━━━━━━━━━`;

}else{

message =

`💎 ZYPER DIAMOND STORE

━━━━━━━━━━━━━━━━

🧾 Order ID: ${orderId}

👤 Customer: ${customer}

🎮 UID: ${gameUID}

📦 Package: ${product}

💰 Amount: LKR ${price.toLocaleString("en-US")}

⏳ Status: PENDING

━━━━━━━━━━━━━━━━`;

}


/* OPEN NORMAL WHATSAPP */

const url =
"https://wa.me/" +
phone +
"?text=" +
encodeURIComponent(message);


window.open(
url,
"_blank"
);

}



/* =====================================
   COPY
===================================== */

document.addEventListener(

"click",

async function(event){

const button =
event.target.closest(
"[data-copy]"
);


if(!button){

return;

}


const value =
button.getAttribute(
"data-copy"
);


try{

await navigator.clipboard.writeText(
value
);


const old =
button.textContent;


button.textContent =
"✅";


setTimeout(
function(){

button.textContent =
old;

},
1000
);


}catch(error){

alert(
"Copy failed. Please copy manually."
);

}

});



/* =====================================
   SEARCH
===================================== */

const search =
document.getElementById("search");


if(search){

search.addEventListener(

"input",

function(){

const text =
search.value
.toLowerCase()
.trim();


const rows =
document.querySelectorAll(
"#orders tr"
);


rows.forEach(
function(row){

const content =
row.textContent
.toLowerCase();


if(
content.includes(text)
){

row.style.display =
"";

}else{

row.style.display =
"none";

}

});

});

}



/* =====================================
   LOGOUT
===================================== */

const logout =
document.getElementById("logout");


if(logout){

logout.onclick =
async function(){

await signOut(auth);

location.href =
"admin-login.html";

};

}
