// ==========================================
// ZYPER DIAMOND STORE
// ADMIN FIREBASE CONFIGURATION
// ==========================================

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// YOUR FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCd_2LplLOl4TOGJQWqndwHNGzPh2PEHM",

    authDomain:
        "zyper-d-iamond-store.firebaseapp.com",

    projectId:
        "zyper-d-iamond-store",

    messagingSenderId:
        "892467477866",

    appId:
        "1:892467477866:web:61e9b6ff9435798da23913"

};


// ==========================================
// INITIALIZE
// ==========================================

const app =
    getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig);


// ==========================================
// EXPORT
// ==========================================

const auth =
    getAuth(app);

const db =
    getFirestore(app);


export {
    app,
    auth,
    db
};
