```javascript
import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

console.log("admin.js loaded");


const loginButton = document.getElementById("login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("msg");


function showMessage(text, success = false) {

    if (!message) {
        alert(text);
        return;
    }

    message.textContent = text;
    message.style.color = success
        ? "#86efac"
        : "#fca5a5";
}


async function checkAdmin(user) {

    const adminRef = doc(
        db,
        "users",
        user.uid
    );

    const adminDoc = await getDoc(
        adminRef
    );

    if (!adminDoc.exists()) {
        return false;
    }

    const data = adminDoc.data();

    return data.role === "admin";
}


async function login() {

    const email = emailInput.value.trim();
    const password = passwordInput.value;


    if (!email) {
        showMessage("Enter your admin email.");
        return;
    }


    if (!password) {
        showMessage("Enter your password.");
        return;
    }


    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";


    try {

        console.log("Trying Firebase login...");


        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "Firebase login successful:",
            result.user.uid
        );


        const admin =
            await checkAdmin(
                result.user
            );


        if (!admin) {

            await signOut(auth);

            showMessage(
                "Login successful, but this account is not an admin."
            );

            loginButton.disabled = false;
            loginButton.textContent = "LOGIN";

            return;
        }


        showMessage(
            "Admin verified. Opening dashboard...",
            true
        );


        window.location.href =
            "admin-dashboard.html";


    } catch (error) {

        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );


        let text =
            "Login failed.";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            text =
                "Incorrect email or password.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            text =
                "Invalid email address.";

        } else if (
            error.code ===
            "auth/user-not-found"
        ) {

            text =
                "User account not found.";

        } else if (
            error.code ===
            "auth/wrong-password"
        ) {

            text =
                "Incorrect password.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            text =
                "Network error. Check your internet.";

        } else {

            text =
                error.message ||
                "Unknown Firebase error.";
        }


        showMessage(
            "❌ " + text
        );


        loginButton.disabled = false;
        loginButton.textContent = "LOGIN";
    }
}


if (loginButton) {

    loginButton.addEventListener(
        "click",
        login
    );

}


if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                login();
            }

        }
    );

}
```
