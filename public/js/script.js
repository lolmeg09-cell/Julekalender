
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
const adminPaths = ["/admin", "/sporsmal", "/svar", "/trekning"];

document.querySelectorAll(".btn_nav").forEach(link => {
  const href = link.getAttribute("href");

  const erAktiv = href === "/admin"
    ? adminPaths.some(p => currentPath.startsWith(p))
    : currentPath === href;

  if (erAktiv) link.setAttribute("aria-current", "page");
});





//Snøfnugg

const zone = document.querySelector(".snow-zone");
if (zone) {
  const MIN_SPEED = 35;   
  const MAX_SPEED = 90;   
  const COUNT = window.innerWidth < 700 ? 30 : 50;

  const flakes = [];

  function update() {
    const height = zone.offsetHeight + 40;
    zone.style.setProperty("--fall-height", height + "px");

    flakes.forEach((f) => {
      const duration = height / f.speed;                   
      f.el.style.animationDuration = duration + "s";
      f.el.style.animationDelay = -f.offset * duration + "s";  
    });
  }

  for (let i = 0; i < COUNT; i++){
    const depth = Math.random();

    const el = document.createElement("div");
    el.className = "flake";
    el.style.left = Math.random() * 100 + "%";
    el.style.fontSize = 8 + depth * 16 + "px";         
    el.style.opacity = 0.3 + depth * 0.7;                

    const inner = document.createElement("span");
    inner.textContent = "❄";
    inner.style.setProperty("--sway", 10 + depth * 30 + "px");        
    inner.style.animationDuration = 2.5 + Math.random() * 3.5 + "s";  
    inner.style.animationDelay = -Math.random() * 6 + "s";           

    el.appendChild(inner);
    zone.appendChild(el);

    flakes.push({
      el,
      speed: MIN_SPEED + depth * (MAX_SPEED - MIN_SPEED),   
      offset: Math.random(),
    });
  }

  update();
  new ResizeObserver(update).observe(zone);
}


