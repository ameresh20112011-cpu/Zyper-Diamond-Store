/* =========================================================
   ZYPER DIAMOND STORE
   ORIGINAL 6 BUTTON BOTTOM NAVIGATION

   HOME
   SHOP
   WALLET
   HISTORY
   PROFILE
   HELP

   PC + ANDROID + IPHONE + TABLET
========================================================= */

(function () {

    "use strict";


    const NAV_ID =
        "zyper-navigation";


    /* =====================================================
       NAV ITEMS
    ===================================================== */

    const navItems = [

        {
            name: "Home",
            icon: "🏠",
            href: "./home.html",
            pages: [
                "",
                "home.html"
            ]
        },


        {
            name: "Shop",
            icon: "💎",
            href: "./topup.html",
            pages: [
                "topup.html",
                "payment.html",
                "order.html"
            ]
        },


        {
            name: "Wallet",
            icon: "💰",
            href: "./wallet.html",
            pages: [
                "wallet.html",
                "recharge-payment.html"
            ]
        },


        {
            name: "History",
            icon: "📜",
            href: "./history.html",
            pages: [
                "history.html",
                "track.html"
            ]
        },


        {
            name: "Profile",
            icon: "👤",
            href: "./profile.html",
            pages: [
                "profile.html"
            ]
        },


        {
            name: "Help",
            icon: "💬",
            href: "./whatsapp.html",
            pages: [
                "whatsapp.html"
            ]
        }

    ];


    /* =====================================================
       CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        let page =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (!page) {

            page = "";

        }


        return page;

    }


    /* =====================================================
       BUILD NAVIGATION
    ===================================================== */

    function buildNavigation() {

        const holder =
            document.getElementById(
                NAV_ID
            );


        if (!holder) {

            return;

        }


        const currentPage =
            getCurrentPage();


        const nav =
            document.createElement(
                "nav"
            );


        nav.className =
            "zyper-old-nav";


        nav.setAttribute(
            "aria-label",
            "Zyper Navigation"
        );


        navItems.forEach(

            function (item) {


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    item.href;


                link.className =
                    "zyper-old-nav-item";


                if (
                    item.pages.includes(
                        currentPage
                    )
                ) {

                    link.classList.add(
                        "active"
                    );

                }


                link.innerHTML = `

                    <span
                        class="zyper-old-nav-icon"
                    >
                        ${item.icon}
                    </span>

                    <span
                        class="zyper-old-nav-text"
                    >
                        ${item.name}
                    </span>

                `;


                nav.appendChild(
                    link
                );

            }

        );


        holder.innerHTML = "";


        holder.appendChild(
            nav
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            buildNavigation,

            {
                once: true
            }

        );

    }
    else {

        buildNavigation();

    }

})();
