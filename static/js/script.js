document.addEventListener("DOMContentLoaded", () => {

  const hamburger   = document.querySelector(".hamburger");
  const userMenu    = document.querySelector(".user-menu");
  const dropdown    = document.querySelector(".dropdown-menu");
  const chevron     = document.querySelector(".chevron");
  const bellWrap    = document.querySelector(".bell-wrap");
  const notifPanel  = document.querySelector(".notif-panel");
  const exportBtn   = document.querySelector(".btn-outline");
  const addBtn      = document.querySelector(".btn-primary");
  const toast       = document.querySelector(".toast");

  let toastTimer;
  function showToast(message){
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function closeAllPanels(){
    dropdown.classList.remove("show");
    notifPanel.classList.remove("show");
    chevron.classList.remove("open");
  }

  // Hamburger toggle (visual state only)
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
  });

  // User menu dropdown
  userMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("show");
    closeAllPanels();
    if (!isOpen){
      dropdown.classList.add("show");
      chevron.classList.add("open");
    }
  });

  // Notification bell
  bellWrap.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = notifPanel.classList.contains("show");
    closeAllPanels();
    if (!isOpen){
      notifPanel.classList.add("show");
    }
  });

  // Close panels when clicking outside
  document.addEventListener("click", closeAllPanels);

  // Prevent panel clicks from closing themselves
  dropdown.addEventListener("click", (e) => e.stopPropagation());
  notifPanel.addEventListener("click", (e) => e.stopPropagation());

  // Dropdown menu item actions
  dropdown.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      showToast(btn.textContent + " clicked");
      closeAllPanels();
    });
  });

  // Export / Add Vehicle buttons
  exportBtn.addEventListener("click", () => showToast("Export started"));
  addBtn.addEventListener("click", () => showToast("Add Vehicle form opened"));

});