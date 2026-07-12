// =====================================================
// TransitOps Dashboard
// script.js
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Elements
    // ==========================

    const hamburger = document.getElementById("hamburgerBtn");

    const notificationBtn = document.getElementById("notificationBtn");
    const notificationPanel = document.getElementById("notificationPanel");

    const userMenu = document.getElementById("userMenu");
    const userDropdown = document.getElementById("userDropdown");
    const userChevron = document.getElementById("userChevron");

    const toast = document.getElementById("toast");

    const exportBtn = document.getElementById("exportBtn");
    const addVehicleBtn = document.getElementById("addVehicleBtn");

    // ==========================
    // Toast Function
    // ==========================

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toast.timer);

        toast.timer = setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

    }

    // Make available globally if needed
    window.showToast = showToast;

    // ==========================
    // Hamburger
    // ==========================

    if (hamburger) {

        hamburger.addEventListener("click", () => {

            hamburger.classList.toggle("active");

            const expanded =
                hamburger.getAttribute("aria-expanded") === "true";

            hamburger.setAttribute(
                "aria-expanded",
                !expanded
            );

        });

    }

    // ==========================
    // User Dropdown
    // ==========================

    function closeUserDropdown() {

        if (!userDropdown) return;

        userDropdown.classList.remove("show");

        if (userChevron)
            userChevron.classList.remove("open");

        if (userMenu)
            userMenu.setAttribute("aria-expanded", "false");

    }

    function toggleUserDropdown() {

        if (!userDropdown) return;

        const open =
            userDropdown.classList.contains("show");

        closeNotification();

        if (open) {

            closeUserDropdown();

        } else {

            userDropdown.classList.add("show");

            if (userChevron)
                userChevron.classList.add("open");

            if (userMenu)
                userMenu.setAttribute("aria-expanded", "true");

        }

    }

    if (userMenu) {

        userMenu.addEventListener("click", (e) => {

            e.stopPropagation();

            toggleUserDropdown();

        });

    }

    // ==========================
    // Notifications
    // ==========================

    function closeNotification() {

        if (!notificationPanel) return;

        notificationPanel.classList.remove("show");

    }

    function toggleNotification() {

        if (!notificationPanel) return;

        closeUserDropdown();

        notificationPanel.classList.toggle("show");

    }

    if (notificationBtn) {

        notificationBtn.addEventListener("click", (e) => {

            e.stopPropagation();

            toggleNotification();

        });

    }

    // ==========================
    // Click Outside
    // ==========================

    document.addEventListener("click", () => {

        closeUserDropdown();

        closeNotification();

    });

    // ==========================
    // ESC Key
    // ==========================

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeUserDropdown();

            closeNotification();

        }

    });

    // ==========================
    // Keyboard Support
    // ==========================

    function keyboardClick(element, callback) {

        if (!element) return;

        element.addEventListener("keydown", (e) => {

            if (
                e.key === "Enter" ||
                e.key === " "
            ) {

                e.preventDefault();

                callback();

            }

        });

    }

    keyboardClick(userMenu, toggleUserDropdown);

    keyboardClick(notificationBtn, toggleNotification);

    // ==========================
    // Dashboard Buttons
    // ==========================

    if (exportBtn) {

        exportBtn.addEventListener("click", () => {

            showToast("Export started.");

        });

    }

    if (addVehicleBtn) {

        addVehicleBtn.addEventListener("click", () => {

            showToast("Opening Add Vehicle...");

        });

    }

    // ==========================
    // Dropdown Buttons
    // ==========================

    if (userDropdown) {

        const buttons =
            userDropdown.querySelectorAll("button");

        buttons.forEach(button => {

            button.addEventListener("click", (e) => {

                e.stopPropagation();

                const text =
                    button.textContent.trim();

                closeUserDropdown();

                switch (text) {

                    case "My Profile":
                        showToast("Profile clicked");
                        break;

                    case "Settings":
                        showToast("Settings clicked");
                        break;

                    case "Log Out":
                        showToast("Logging out...");
                        break;

                    default:
                        showToast(text);

                }

            });

        });

    }

});