document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.createElement("nav");
    navbar.className = "navbar navbar-expand-lg custom-nav";
    navbar.style = "width: 100%; height: 100%;";

    // Botón de toggle para pantallas pequeñas
    const btn = document.createElement("button");
    btn.className = "navbar-toggler";
    btn.type = "button";
    btn.setAttribute("data-bs-toggle", "collapse");
    btn.setAttribute("data-bs-target", "#navbarNav");

    const menuIcon = document.createElement("div");
    menuIcon.className = "menu-icon";
    btn.appendChild(menuIcon);
    // const span = document.createElement("span");
    // span.className = "navbar-toggler-icon";
    // btn.appendChild(span);

    navbar.appendChild(btn);

    const navDiv = document.createElement("div");
    navDiv.className = "collapse navbar-collapse";
    navDiv.id = "navbarNav";  // Añade este ID para que funcione el toggle

    const ul = document.createElement("ul");
    ul.className = "navbar-nav";

    const navItems = [
        { text: "Inicio", link: "index.html" },
        { text: "Buscador", link: "search.html" },
        { text: "Subir CSV", link: "upload.html" },
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
