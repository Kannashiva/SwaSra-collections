// ==========================================
// SWASRA COLLECTIONS
// ADMIN LOGIN
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SwaSra admin login script loaded."
        );


        const adminLoginForm =
            document.getElementById(
                "adminLoginForm"
            );

        const adminEmail =
            document.getElementById(
                "adminEmail"
            );

        const adminPassword =
            document.getElementById(
                "adminPassword"
            );

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        // ==========================================
        // SAFETY CHECK
        // ==========================================

        if (
            !adminLoginForm ||
            !adminEmail ||
            !adminPassword ||
            !loginMessage
        ) {

            console.error(
                "Admin login form elements not found."
            );

            return;

        }


        // ==========================================
        // LOGIN FORM
        // ==========================================

        adminLoginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                console.log(
                    "Login form submitted."
                );


                loginMessage.textContent =
                    "Logging in...";


                const email =
                    adminEmail.value
                        .trim()
                        .toLowerCase();


                const password =
                    adminPassword.value;


                try {

                    const {
                        data,
                        error
                    } =
                        await window
                            .supabaseClient
                            .auth
                            .signInWithPassword({
                                email: email,
                                password: password
                            });


                    if (error) {

                        console.error(
                            "Supabase login error:",
                            error
                        );


                        loginMessage.textContent =
                            `Login failed: ${error.message}`;

                        return;

                    }


                    if (
                        data &&
                        data.session
                    ) {

                        console.log(
                            "Login successful:",
                            data.user.email
                        );


                        loginMessage.textContent =
                            "Login successful...";


                        window.location.href =
                            "/admin/dashboard.html";

                        return;

                    }


                    loginMessage.textContent =
                        "Unable to create login session.";

                } catch (error) {

                    console.error(
                        "Unexpected login error:",
                        error
                    );


                    loginMessage.textContent =
                        "Something went wrong while logging in.";

                }

            }
        );

    }
);