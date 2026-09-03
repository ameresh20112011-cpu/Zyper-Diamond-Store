/* =========================================================
   ZYPER BOTTOM NAVIGATION
   RESPONSIVE + TOUCH FRIENDLY
========================================================= */

(function(){

  "use strict";


  const NAV_ID =
  "zyper-navigation";


  const items = [

    {

      label:
      "Home",

      href:
      "./home.html",

      pages:[
        "home.html",
        ""
      ],

      icon:`

        <path
          d="M3 10.5 12 3l9 7.5">
        </path>

        <path
          d="M5 9.5V21h14V9.5">
        </path>

        <path
          d="M9 21v-7h6v7">
        </path>

      `

    },


    {

      label:
      "Shop",

      href:
      "./topup.html",

      pages:[
        "topup.html"
      ],

      icon:`

        <path
          d="M6 2l1 4h10l1-4">
        </path>

        <path
          d="M4 6h16l-1 15H5L4 6z">
        </path>

        <path
          d="M9 10v1">
        </path>

        <path
          d="M15 10v1">
        </path>

      `

    },


    {

      label:
      "Payment",

      href:
      "./payment.html",

      pages:[
        "payment.html",
        "recharge-payment.html",
        "order.html"
      ],

      icon:`

        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2">
        </rect>

        <path
          d="M3 10h18">
        </path>

        <path
          d="M7 15h3">
        </path>

      `

    },


    {

      label:
      "History",

      href:
      "./history.html",

      pages:[
        "history.html",
        "track.html"
      ],

      icon:`

        <path
          d="M3 12a9 9 0 1 0 3-6.7">
        </path>

        <path
          d="M3 4v5h5">
        </path>

        <path
          d="M12 7v5l3 2">
        </path>

      `

    },


    {

      label:
      "Profile",

      href:
      "./profile.html",

      pages:[
        "profile.html",
        "wallet.html"
      ],

      icon:`

        <circle
          cx="12"
          cy="8"
          r="4">
        </circle>

        <path
          d="M4 21a8 8 0 0 1 16 0">
        </path>

      `

    }

  ];


/* =====================================================
   CURRENT PAGE
===================================================== */

function currentPage(){

  let page =

  window.location
  .pathname
  .split("/")
  .pop()
  .toLowerCase();


  if(
    !page
  ){

    page =
    "";

  }


  return page;

}


/* =====================================================
   SVG
===================================================== */

function iconSvg(
  content
){

  return `

    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >

      ${content}

    </svg>

  `;

}


/* =====================================================
   BUILD
===================================================== */

function build(){

  const host =
  document.getElementById(
    NAV_ID
  );


  if(
    !host
  ){

    return;

  }


  const page =
  currentPage();


  const shell =
  document.createElement(
    "nav"
  );


  shell.className =
  "zyper-nav-shell";


  shell.setAttribute(
    "aria-label",
    "Zyper navigation"
  );


  items.forEach(
    function(item){

      const link =
      document.createElement(
        "a"
      );


      link.className =
      "zyper-nav-item";


      link.href =
      item.href;


      const active =
      item.pages.includes(
        page
      );


      if(
        active
      ){

        link.classList.add(
          "active"
        );


        link.setAttribute(
          "aria-current",
          "page"
        );

      }


      link.innerHTML = `

        <span
          class="zyper-nav-icon"
        >

          ${iconSvg(
            item.icon
          )}

        </span>


        <span
          class="zyper-nav-label"
        >

          ${item.label}

        </span>

      `;


      shell.appendChild(
        link
      );

    }
  );


  host.replaceChildren(
    shell
  );

}


/* =====================================================
   START
===================================================== */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    build,
    {
      once:true
    }
  );

}
else{

  build();

}

})();
