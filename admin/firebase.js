// =========================================
// FIREBASE APP
// =========================================

import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";


// =========================================
// FIREBASE AUTH
// =========================================

import {
    getAuth,
    signInAnonymously
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// =========================================
// FIRESTORE
// =========================================

import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =========================================
// FIREBASE APP CHECK
// =========================================

import {
    initializeAppCheck,
    ReCaptchaV3Provider
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCd_2LplLOl4TOGjbWQqndwHNGzPh2PEHM",

    authDomain:
        "zyper-d-iamond-store.firebaseapp.com",

    projectId:
        "zyper-d-iamond-store",

    storageBucket:
        "zyper-d-iamond-store.firebasestorage.app",

    messagingSenderId:
        "892467477866",

    appId:
        "1:892467477866:web:61e9b6ff9435798da23913",

    measurementId:
        "G-RLJFR6F2GC"

};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app =
    initializeApp(firebaseConfig);


// =========================================
// APP CHECK
// =========================================

initializeAppCheck(app, {

    provider:
        new ReCaptchaV3Provider(
            "6LfBe2QtAAAAAJsp-crpLwMXkhPn1QhvRSVWzB8P"
        ),

    isTokenAutoRefreshEnabled:
        true

});


// =========================================
// FIREBASE SERVICES
// =========================================

export const auth =
    getAuth(app);

export const db =
    getFirestore(app);


// =========================================
// ANONYMOUS LOGIN
// =========================================

export async function loginCustomer() {

    // Already logged in
    if (auth.currentUser) {

        return auth.currentUser;

    }


    const result =
        await signInAnonymously(auth);


    return result.user;

}
