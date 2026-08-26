/* =====================================================
   ZYPER NAVIGATION SYSTEM
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


        if (!file) {
            return "home";
        }


        if (file === "index.html") {
            return "home";
        }


        if (file === "home.html") {
            return "home";
        }


        if (file === "topup.html") {
            return "topup";
        }


        if (file === "payment.html") {
            return "payment";
        }


        if (file === "wallet.html") {
            return "wallet";
        }


        if (file === "history.html") {
            return "history";
        }


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


        items.forEach(function (item) {

            item.classList.remove("active");


            const page =
                item.getAttribute(
                    "data-page"
                );


            if (
                page === currentPage
            ) {

                item.classList.add("active");

            }

        });

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
           If navigation already exists
           do not create another one.
        */

        if (oldNav) {

            setActiveNavigation();

            return;

        }


        fetch("zyper-nav.html")

            .then(function (response) {

                if (!response.ok) {

                    throw new Error(
                        "Navigation file not found"
                    );

                }

                return response.text();

            })

            .then(function (html) {

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


                document.body.appendChild(
                    navigation
                );


                setActiveNavigation();

            })

            .catch(function (error) {

                console.error(
                    "Zyper Navigation Error:",
                    error
                );

            });

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
