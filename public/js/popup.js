function createPopup(id){
  let popupNode = document.querySelector(id);
  let overlay = popupNode.querySelector(".overlay");
  let lukk = popupNode.querySelector(".lukk-btn");
  function openPopup() {
    popupNode.classList.add("active");
    lukk.focus();
  }
  
  function closePopup(){
    popupNode.classList.remove("active");

  }
  overlay.addEventListener("click", closePopup)
  lukk.addEventListener("click", closePopup)
  return openPopup;
}

if (document.querySelector("#popup")) {
  const openPopup = createPopup("#popup");

  document.querySelectorAll(".tile[data-status]").forEach((tile) => {
    tile.addEventListener("click", (e) => {
      e.preventDefault();
      openPopup();
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPopup();
      }
    });
  });
}