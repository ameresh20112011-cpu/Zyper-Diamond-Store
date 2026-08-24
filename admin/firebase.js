// ==========================================
// ZYPER DIAMOND STORE
// Firebase Configuration
// ==========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyCd_2LplLOl4TOGjbWQqndwHNGzPh2PEHM",

    authDomain: "zyper-d-iamond-store.firebaseapp.com",

    projectId: "zyper-d-iamond-store",

    storageBucket: "zyper-d-iamond-store.firebasestorage.app",

    messagingSenderId: "892467477866",

    appId: "1:892467477866:web:61e9b6ff9435798da23913",

    measurementId: "G-RLJFR6F2GC"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// FIREBASE SERVICES
// ==========================================

export const auth = getAuth(app);

export const db = getFirestore(app);
