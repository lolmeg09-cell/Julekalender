
// const btnEl = document  .querySelector(".btn_nav")

// btnEl.addEventListener("click", () => {
//   btnEl.classList.add("aktiv");
// });

// const btnElList = document.querySelectorAll(".btn_nav");

// btnElList.forEach(btnEl => {
//   btnEl.addevEntListner("click", () => {
//     btnEl.querySelector(".aktiv")?.classList.remove("aktiv");     
//     btnEl.classList.add("aktiv")
//   })
// })


//aktiv knapp funksjon

const currentPath = window.location.pathname;

document.querySelectorAll(".btn_nav").forEach(link => {
  const href = link.getAttribute("href");

  const erAktiv = href === "/"
    ? currentPath === "/"
    : currentPath.startsWith(href);

  if (erAktiv) link.setAttribute("aria-current", "page");
});


const currentPathSide = window.location.pathname;

document.querySelectorAll(".btn-side").forEach(link => {
  const href = link.getAttribute("href");

  const erAktiv = href === "/admin"
    ? currentPathSide === "/admin"
    : currentPathSide.startsWith(href);

  if (erAktiv) link.setAttribute("aria-current", "page");
});



//Snøfnugg

const zone = document.querySelector(".snow-zone");


if (zone) {

  zone.style.setProperty("--fall-height", zone.offsetHeight + 40 + "px");

  for (let i = 0; i < 50; i++) {
    const flake = document.createElement("div");
    flake.className = "flake";
    flake.textContent = "❄";
    flake.style.left = Math.random() * 100 + "%";
    flake.style.fontSize = 10 + Math.random() * 14 + "px";
    flake.style.opacity = 0.4 + Math.random() * 0.6;
    flake.style.animationDuration = 8 + Math.random() * 12 + "s";
    flake.style.animationDelay = Math.random() * -14 + "s";  
    zone.appendChild(flake);
  }
};

