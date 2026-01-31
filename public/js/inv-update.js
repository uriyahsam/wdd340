'use strict'
const form = document.querySelector("#updateForm")

if (form) {
  const updateBtn = form.querySelector("button[type='submit'], input[type='submit']")
  if (updateBtn) {
    // Enable the update button only after a change is detected
    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled")
    })
  }
}
