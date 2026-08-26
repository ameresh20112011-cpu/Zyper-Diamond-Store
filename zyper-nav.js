/* =====================================================
   ZYPER NAVIGATION SYSTEM

   Pages:
   Home
   Shop
   Wallet
   History
   Profile
===================================================== */

(function () {

    "use strict";


    /* =================================================
       FIND CURRENT PAGE
    ================================================= */

    function getCurrentPage() {

        let file =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        /*
         * Website root
         */

        if (!file) {

            return "home";

        }


        /*
         * Login / index
         */

        if (file === "index.html") {

            return "home";

        }


        /*
         * Home
         */

        if (file === "home.html") {

            return "home";

        }


        /*
         * Shop
         */

        if (file === "topup.html") {

            return "topup";

        }


        /*
         * Payment / Order
         *
         * Keep Shop active while customer
         * is completing an order.
         */

        if (
            file === "payment.html" ||
            file === "order.html"
        ) {

            return "topup";

        }


        /*
         * Wallet
         */

        if (file === "wallet.html") {

            return "wallet";

        }


        /*
         * History
         */

        if (
            file === "history.html" ||
            file === "track.html"
        ) {

            return "history";

        }


        /*
         * Profile
         */

        if (file === "profile.html") {

            return "profile";

        }


        return "";

    }



    /* =================================================
       SET ACTIVE BUTTON
    ================================================= */

    function setActiveNavigation() {

        const currentPage =
            getCurrentPage();


        const items =
            document.querySelectorAll(
                ".zyper-nav-item"
            );


        items.forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );


                const page =
                    item.getAttribute(
                        "data-page"
                    );


                if (
                    page === currentPage
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );

    }



    /* =================================================
       CREATE FALLBACK NAVIGATION

       This is used only if zyper-nav.html
       cannot be loaded.
    ================================================= */

    function createFallbackNavigation() {

        const nav =
            document.createElement(
                "nav"
            );


        nav.id =
            "zyperNavigation";


        nav.className =
            "zyper-nav";


        nav.innerHTML = `

            <a
                href="./home.html"
                class="zyper-nav-item"
                data-page="home"
            >

                <span class="zyper-icon">
                    🏠
                </span>

                <span class="zyper-label">
                    Home
                </span>

            </a>


            <a
                href="./topup.html"
                class="zyper-nav-item"
                data-page="topup"
            >

                <span class="zyper-icon">
                    💎
                </span>

                <span class="zyper-label">
                    Shop
                </span>

            </a>


            <a
                href="./wallet.html"
                class="zyper-nav-item"
                data-page="wallet"
            >

                <span class="zyper-icon">
                    💰
                </span>

                <span class="zyper-label">
                    Wallet
                </span>

            </a>


            <a
                href="./history.html"
                class="zyper-nav-item"
                data-page="history"
            >

                <span class="zyper-icon">
                    📜
                </span>

                <span class="zyper-label">
                    History
                </span>

            </a>


            <a
                href="./profile.html"
                class="zyper-nav-item"
                data-page="profile"
            >

                <span class="zyper-icon">
                    👤
                </span>

                <span class="zyper-label">
                    Profile
                </span>

            </a>

        `;


        document.body.appendChild(
            nav
        );


        setActiveNavigation();

    }



    /* =================================================
       LOAD NAVIGATION HTML
    ================================================= */

    function loadNavigation() {

        const oldNav =
            document.getElementById(
                "zyperNavigation"
            );


        /*
         * Navigation already exists
         */

        if (oldNav) {

            setActiveNavigation();

            return;

        }


        fetch("./zyper-nav.html", {

            cache: "no-cache"

        })

        .then(
            function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Navigation file not found"
                    );

                }


                return response.text();

            }
        )

        .then(
            function (html) {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.innerHTML =
                    html;


                const navigation =
                    wrapper.querySelector(
                        ".zyper-nav"
                    );


                if (!navigation) {

                    throw new Error(
                        "Navigation HTML missing"
                    );

                }


                /*
                 * Make sure it has an ID
                 */

                navigation.id =
                    "zyperNavigation";


                document.body.appendChild(
                    navigation
                );


                setActiveNavigation();

            }
        )

        .catch(
            function (error) {

                console.error(
                    "Zyper Navigation Error:",
                    error
                );


                /*
                 * If zyper-nav.html fails,
                 * still show navigation.
                 */

                createFallbackNavigation();

            }
        );

    }



    /* =================================================
       START
    ================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadNavigation
        );

    } else {

        loadNavigation();

    }


})();
