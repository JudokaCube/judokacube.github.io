// script.js

// Highlight the nav link for the section in view
const navLinks = document.querySelectorAll(".nav-link");

function activateNavLink() {
  let fromTop = window.scrollY + 60; // add offset for sticky header

  navLinks.forEach(link => {
    const section = document.querySelector(`#${link.dataset.target}`);

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", activateNavLink);
document.addEventListener("DOMContentLoaded", activateNavLink);
