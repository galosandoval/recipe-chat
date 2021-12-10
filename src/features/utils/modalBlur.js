const modal = document.querySelector("body");
export function addBlur() {
  console.log("ADD BLUR");
  modal.classList.add("modal-blur");
}
export function removeBlur() {
  console.log("REMOVE BLUR");
  modal.classList.remove("modal-blur");
}
