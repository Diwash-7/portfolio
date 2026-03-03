console.log("Welcome to my website. Stay curious!");

// --- Matrix Rain ---
const canvas = document.createElement("canvas");
canvas.id = "matrixCanvas";
canvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.65;
`;
document.body.insertBefore(canvas, document.body.firstChild);

// Make sure main content is above canvas
document.querySelector(".main-screen").style.position = "relative";
document.querySelector(".main-screen").style.zIndex = "1";
document.querySelector(".taskbar").style.zIndex = "100";

const ctx = canvas.getContext("2d");

// Mix of katakana, latin, digits — classic cmatrix vibe
const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&";

const fontSize = 17;
let columns, drops;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = Math.floor(canvas.width / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * -100);
}

resize();
window.addEventListener("resize", resize);

function draw() {
  // Semi-transparent black fade — creates the trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = fontSize + "px 'Pixelify Sans', monospace";

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    // Head of the stream is bright white, rest is dim green-white
    if (drops[i] * fontSize > 0 && Math.random() > 0.975) {
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#3a3a3a";
    }

    ctx.fillText(char, x, y);

    // Reset drop randomly after it passes the bottom
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i] += 0.5;
  }
}

setInterval(draw, 40);
