document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.createElement("nav");
    navbar.className = "navbar navbar-expand-lg custom-nav";
    navbar.style = "width: 100%; height: 100%;";

    // Toggle button for small screens
    const btn = document.createElement("button");
    btn.className = "navbar-toggler";
    btn.type = "button";
    btn.setAttribute("data-bs-toggle", "collapse");
    btn.setAttribute("data-bs-target", "#navbarNav");

    const menuIcon = document.createElement("div");
    menuIcon.className = "menu-icon";
    btn.appendChild(menuIcon);

    navbar.appendChild(btn);

    const navDiv = document.createElement("div");
    navDiv.className = "collapse navbar-collapse";
    navDiv.id = "navbarNav";  // Add this ID for the toggle to work

    const ul = document.createElement("ul");
    ul.className = "navbar-nav";

    const navItems = [
        { text: "Home", link: "index.html" },
        { text: "Search", link: "search.html" },
        { text: "Upload CSV", link: "upload.html" },
    ];

    navItems.forEach(item => {
        const li = document.createElement("li");
        li.className = "nav-item";

        const a = document.createElement("a");
        a.className = "nav-link full-height";
        a.href = item.link;
        a.textContent = item.text;

        li.appendChild(a);
        ul.appendChild(li);
    });

    navDiv.appendChild(ul);
    navbar.appendChild(navDiv);

    document.getElementById("navbar").appendChild(navbar);
});
