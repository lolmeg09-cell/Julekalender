
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

const currentPath = window.location.pathname;

document.querySelectorAll(".btn_nav").forEach(link => {
  const href = link.getAttribute("href");

  const erAktiv = href === "/"
    ? currentPath === "/"
    : currentPath.startsWith(href);

  if (erAktiv) link.setAttribute("aria-current", "page");
});
