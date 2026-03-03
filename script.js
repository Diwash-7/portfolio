console.log("Welcome to my website. Stay curious!");

const phrases = [
  "i like to draw",
  "i like to code",
  "creating bugs since 2024",
  "pixel art enjoyer",
  "still learning :)",
  "git push --force",
  "it works on my machine",
  "undefined is not a function",
  "i should be sleeping",
  "ctrl + z everything",
];

const container = document.getElementById("floatingTexts");

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnText() {
  const el = document.createElement("span");
  el.classList.add("float-text");
  el.textContent = phrases[Math.floor(Math.random() * phrases.length)];

  // Random position — avoid edges a bit
  const x = randomBetween(3, 88); // vw
  const y = randomBetween(8, 88); // vh

  el.style.left = x + "vw";
  el.style.top = y + "vh";

  // Random rotation
  const rotate = randomBetween(-15, 15);
  el.style.transform = `rotate(${rotate}deg)`;

  // Random flicker duration
  const duration = randomBetween(1.5, 3.5);
  el.style.animationDuration = duration + "s";

  container.appendChild(el);

  // Remove after a few cycles so DOM doesn't bloat
  setTimeout(() => {
    el.remove();
  }, duration * 1000 * 3);
}

// Spawn texts at random intervals
function scheduleNext() {
  const delay = randomBetween(400, 1400);
  setTimeout(() => {
    spawnText();
    scheduleNext();
  }, delay);
}

scheduleNext();
