// ================= UI EFFECTS (SAFE) =================
document.addEventListener('DOMContentLoaded', () => {

  // Hover effect
  document.querySelectorAll('.neu-icon, .neu-checkbox, .neu-social').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.05)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
  });

  // Card shadow effect
  const card = document.querySelector('.login-card');

  if (card) {
    document.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();

      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      card.style.boxShadow =
        `${x * 20}px ${y * 20}px 40px #bec3cf, ${-x * 20}px ${-y * 20}px 40px #ffffff`;
    });
  }

});


// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 உன் config வை
const firebaseConfig = {
  apiKey: "AIzaSyCd_2LplLOl4TOGjbWQqndwHNGzPh2PEHM",
  authDomain: "zyper-d-iamond-store.firebaseapp.com",
  projectId: "zyper-d-iamond-store",
  storageBucket: "zyper-d-iamond-store.firebasestorage.app",
  messagingSenderId: "892467477866",
  appId: "1:892467477866:web:61e9b6ff9435798da23913",
  measurementId: "G-RLJFR6F2GC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ================= LOGIN =================
const form = document.querySelector("form");

if(form){
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    if(!email || !password){
      alert("Fill all fields");
      return;
    }

    if(password.length < 6){
      alert("Password must be 6+ characters");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {

        // ✅ login save
        localStorage.setItem("loggedIn", "true");

        // ✅ redirect
        window.location.href = "home.html";

      })
      .catch((error) => {
        alert(error.message);
      });

  });
}


// ================= PAGE CHECK =================

// 👉 index.html
window.checkLogin = function(){
  if(localStorage.getItem("loggedIn") === "true"){
    window.location.href = "home.html";
  }
};

// 👉 home.html
window.checkHome = function(){
  if(localStorage.getItem("loggedIn") !== "true"){
    window.location.href = "index.html";
  }
};


// ================= LOGOUT =================
window.logout = function(){
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
};