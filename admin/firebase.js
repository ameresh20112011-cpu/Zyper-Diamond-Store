// Firebase App
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";


// Firebase Authentication
import { getAuth }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// Firestore Database
import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Firebase App Check
import {
initializeAppCheck,
ReCaptchaV3Provider
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";




// YOUR FIREBASE CONFIG

const firebaseConfig = {

apiKey: "AIzaSyCd_2LplLOl4TOGjbWQqndwHNGzPh2PEHM",

authDomain: "zyper-d-iamond-store.firebaseapp.com",

projectId: "zyper-d-iamond-store",

storageBucket: "zyper-d-iamond-store.firebasestorage.app",

messagingSenderId: "892467477866",

appId: "1:892467477866:web:61e9b6ff9435798da23913",

measurementId: "G-RLJFR6F2GC"

};




// Initialize Firebase

const app = initializeApp(firebaseConfig);




// Enable Firebase App Check

initializeAppCheck(app, {

provider:

new ReCaptchaV3Provider(

"6LfBe2QtAAAAAJsp-crpLwMXkhPn1QhvRSVWzB8P"

),


isTokenAutoRefreshEnabled:true

});




// Export Firebase Services

export const auth = getAuth(app);

export const db = getFirestore(app);