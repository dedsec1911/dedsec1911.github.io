const projectList = document.querySelector("#project-list");
const projects = Array.from(projectList.querySelectorAll(".project"));
const controls = document.querySelector(".project-controls");
const dots = document.querySelector(".project-dots");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;

const projectButtons = projects.map((project, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Show " + project.querySelector("h3").textContent);
  button.addEventListener("click", () => selectProject(index, index < current ? -1 : 1));
  dots.append(button);
  return button;
});

function selectProject(index, direction = 0) {
  current = (index + projects.length) % projects.length;
  projects.forEach((project, i) => {
    project.hidden = i !== current;
    project.classList.remove("project-animate");
    if (i === current) projectButtons[i].setAttribute("aria-current", "true");
    else projectButtons[i].removeAttribute("aria-current");
  });
  if (direction && !reducedMotion.matches) {
    const selected = projects[current];
    selected.style.setProperty("--slide", direction * 18 + "px");
    requestAnimationFrame(() => {
      if (!selected.hidden) selected.classList.add("project-animate");
    });
  }
}

controls.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    const step = Number(button.dataset.step);
    selectProject(current + step, step);
  });
});
selectProject(0);
controls.hidden = false;
dots.hidden = false;

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (!isIntersecting) return;
      target.classList.add("reveal");
      reveal.unobserve(target);
    });
  }, {threshold: 0.15});
  document.querySelectorAll(".credential, .timeline li, .contact h2").forEach(element => reveal.observe(element));
}
