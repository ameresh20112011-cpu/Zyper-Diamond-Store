import { auth, db } from "./firebase.js";


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




// ==========================
// CHECK IF USER IS ADMIN
// ==========================

async function checkAdmin(user){

    if(!user){
        return false;
    }


    const adminDoc = await getDoc(
        doc(
            db,
            "users",
            user.uid
        )
    );


    return (
        adminDoc.exists()
        &&
        adminDoc.data().role === "admin"
    );

}




// ==========================
// ADMIN LOGIN
// ==========================


let loginButton =
document.getElementById("login");



if(loginButton){


loginButton.onclick = async()=>{


let email =
document.getElementById("email").value;


let password =
document.getElementById("password").value;


let msg =
document.getElementById("msg");



if(!email || !password){

msg.innerHTML =
"Enter email and password";

return;

}



try{


let result =
await signInWithEmailAndPassword(
auth,
email,
password
);



let admin =
await checkAdmin(
result.user
);



if(admin){


location.href =
"admin-dashboard.html";


}

else{


msg.innerHTML =
"❌ You are not admin";


await signOut(auth);


}



}

catch(error){


msg.innerHTML =
error.message;


}



}



}








// ==========================
// PROTECT DASHBOARD
// ==========================


let orderTable =
document.getElementById("orders");



if(orderTable){


onAuthStateChanged(
auth,
async(user)=>{


let admin =
await checkAdmin(user);



if(!admin){


location.href =
"admin-login.html";


return;


}



// SHOW DASHBOARD

let app =
document.getElementById("app");


if(app){

app.style.display =
"block";

}



loadOrders();



});


}










// ==========================
// DATE FORMAT
// ==========================


function formatDate(timestamp){


if(!timestamp)
return "-";



if(timestamp.toDate){


let date =
timestamp.toDate();



let hour =
String(
date.getHours()
)
.padStart(2,"0");



let minute =
String(
date.getMinutes()
)
.padStart(2,"0");



let year =
date.getFullYear();



let month =
String(
date.getMonth()+1
)
.padStart(2,"0");



let day =
String(
date.getDate()
)
.padStart(2,"0");



return `${hour}:${minute} , ${year}/${month}/${day}`;


}



return timestamp;


}










// ==========================
// LOAD ORDERS
// ==========================


async function loadOrders(){



let table =
document.getElementById("orders");


table.innerHTML =
"Loading...";



let totalOrders = 0;

let revenue = 0;

let pending = 0;

let success = 0;



let snapshot =
await getDocs(
collection(
db,
"orders"
)
);



let orders=[];



snapshot.forEach((document)=>{


orders.push({

id:document.id,

data:document.data()

});


});





// NEWEST FIRST

orders.sort((a,b)=>{


let dateA =
a.data.createdAt;


let dateB =
b.data.createdAt;



if(dateA && dateB){

return (
dateB.seconds -
dateA.seconds
);

}


return 0;


});




table.innerHTML="";




orders.forEach((item)=>{


let order =
item.data;



let customer =
order.customerName ||
order.name ||
"-";



let uid =
order.userId ||
"-";



let gameUID =
order.gameUID ||
order.gameUid ||
order.gameId ||
"-";



let product =
order.productName ||
order.product ||
order.package ||
order.plan ||
"-";



let price =
order.productPrice ||
order.price ||
0;



let payment =
order.paymentMethod ||
order.payment ||
"-";



let total =
order.total ||
order.amount ||
price;



let date =
formatDate(
order.createdAt
);



let status =
order.status ||
"Pending";





totalOrders++;

revenue += Number(total);



if(status==="Pending")
pending++;


if(status==="Success")
success++;





table.innerHTML += `


<tr>

<td>${item.id}</td>

<td>${customer}</td>

<td>${uid}</td>

<td>${gameUID}</td>

<td>${product}</td>

<td>${price}</td>

<td>${payment}</td>

<td>${date}</td>

<td>${total}</td>

<td class="${status}">
${status}
</td>

<td>

<button onclick="changeStatus('${item.id}','Success')">
✔
</button>


<button onclick="changeStatus('${item.id}','Rejected')">
✖
</button>


</td>


</tr>


`;



});





document.getElementById("totalOrders").innerHTML =
totalOrders;


document.getElementById("revenue").innerHTML =
revenue;


document.getElementById("pendingOrders").innerHTML =
pending;


document.getElementById("successOrders").innerHTML =
success;



}









// ==========================
// CHANGE STATUS SECURE
// ==========================


window.changeStatus =
async function(id,status){



let user =
auth.currentUser;



let admin =
await checkAdmin(user);



if(!admin){

alert("Access denied");

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



loadOrders();



};









// ==========================
// LOGOUT
// ==========================


let logout =
document.getElementById("logout");



if(logout){


logout.onclick =
async()=>{


await signOut(auth);


location.href =
"admin-login.html";


};


}