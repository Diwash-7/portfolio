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

// Inject styles directly into the page — bypasses any CSS caching issues
const style = document.createElement("style");
style.textContent = `
  #floatingTexts {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .float-text {
    position: absolute !important;
    display: block !important;
    font-family: 'Pixelify Sans', cursive;
    font-size: 0.85rem;
    color: #ffffff;
    opacity: 0;
    white-space: nowrap;
    text-shadow: 0 0 8px rgba(255,255,255,0.3);
    animation: floatFlicker 2s ease-in-out forwards;
  }
  @keyframes floatFlicker {
    0%   { opacity: 0; }
    10%  { opacity: 0.6; }
    15%  { opacity: 0.1; }
    20%  { opacity: 0.55; }
    25%  { opacity: 0.05; }
    35%  { opacity: 0.5; }
    50%  { opacity: 0.4; }
    70%  { opacity: 0.35; }
    85%  { opacity: 0.15; }
    95%  { opacity: 0.3; }
    100% { opacity: 0; }
  }
`;
document.head.appendChild(style);

const container = document.getElementById("floatingTexts");

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnText() {
  const el = document.createElement("span");
  el.classList.add("float-text");
  el.textContent = phrases[Math.floor(Math.random() * phrases.length)];

  // Set position via inline styles — guaranteed to work
  el.style.position = "absolute";
  el.style.display = "block";
  el.style.left = randomBetween(3, 85) + "vw";
  el.style.top = randomBetween(8, 85) + "vh";
  el.style.transform = "rotate(" + randomBetween(-15, 15) + "deg)";

  const duration = randomBetween(1.5, 3.5);
  el.style.animationDuration = duration + "s";

  container.appendChild(el);

  setTimeout(() => el.remove(), duration * 1000 * 3);
}

function scheduleNext() {
  const delay = randomBetween(400, 1400);
  setTimeout(() => {
    spawnText();
    scheduleNext();
  }, delay);
}

scheduleNext();
