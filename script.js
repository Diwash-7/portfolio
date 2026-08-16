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

// ---- Matrix Color Easter Egg ----
// Same key bindings as the real `cmatrix` terminal program:
// press ! @ # $ % ^ while on the page to switch rain color, 0 to reset.
const MATRIX_THEMES = {
  "!": { name: "red", head: "#ff5c5c", trail: "#3a1010" },
  "@": { name: "green", head: "#5cff8a", trail: "#0f2b17" },
  "#": { name: "yellow", head: "#ffe45c", trail: "#3a3210" },
  "$": { name: "blue", head: "#5c9fff", trail: "#101c3a" },
  "%": { name: "magenta", head: "#ff5cf0", trail: "#3a1038" },
  "^": { name: "cyan", head: "#5cf9ff", trail: "#0f3a3a" },
  "0": { name: "default", head: "#ffffff", trail: "#3a3a3a" }
};

const DEFAULT_THEME = { name: "default", head: "#ffffff", trail: "#3a3a3a" };
let currentTheme = DEFAULT_THEME;
let rainbowMode = false;

// Remember the choice across visits
try {
  const saved = localStorage.getItem("matrixTheme");
  if (saved && MATRIX_THEMES[saved]) currentTheme = MATRIX_THEMES[saved];
  if (localStorage.getItem("matrixRainbow") === "1") rainbowMode = true;
} catch (e) {
  // localStorage unavailable (private mode etc) — just use the default
}

// Any element using var(--accent-color) in CSS (e.g. the "github
// activity" heading) follows the matrix rain color automatically.
document.documentElement.style.setProperty("--accent-color", currentTheme.head);

window.addEventListener("keydown", (e) => {
  // ignore while typing in an input/textarea, just in case
  const tag = (document.activeElement && document.activeElement.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key === "r" || e.key === "R") {
    rainbowMode = !rainbowMode;
    try { localStorage.setItem("matrixRainbow", rainbowMode ? "1" : "0"); } catch (e) {}
    if (!rainbowMode) {
      document.documentElement.style.setProperty("--accent-color", currentTheme.head);
    }
    return;
  }

  const theme = MATRIX_THEMES[e.key];
  if (theme) {
    currentTheme = theme;
    rainbowMode = false;
    document.documentElement.style.setProperty("--accent-color", theme.head);
    try {
      localStorage.setItem("matrixTheme", e.key);
      localStorage.setItem("matrixRainbow", "0");
    } catch (e) {}
  }
});

function rainbowColors(offset) {
  // Slower hue drift, and a proper dim "trail" version at the same hue —
  // matches how every other theme dims its trail instead of staying bright.
  const hue = (Date.now() / 60 + offset * 8) % 360;
  return {
    head: `hsl(${hue}, 100%, 70%)`,
    trail: `hsl(${hue}, 65%, 15%)`
  };
}

function draw() {
  // Semi-transparent black fade — creates the trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = fontSize + "px 'Pixelify Sans', monospace";

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    const theme = rainbowMode ? rainbowColors(i) : currentTheme;
    const isHead = drops[i] * fontSize > 0 && Math.random() > 0.975;
    ctx.fillStyle = isHead ? theme.head : theme.trail;

    ctx.fillText(char, x, y);

    // Reset drop randomly after it passes the bottom
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i] += 0.5;
  }

  // Keep the accent color (e.g. the "github activity" heading) drifting
  // along with the rain while rainbow mode is on. One cheap style write
  // per tick (~25/sec) — negligible, and it's skipped entirely otherwise.
  if (rainbowMode) {
    document.documentElement.style.setProperty("--accent-color", rainbowColors(0).head);
  }
}

setInterval(draw, 40);

// ---- Horizontal Snap Navigation (GNOME-workspace style) ----
// The snapping/animation itself is handled entirely by native CSS
// scroll-snap on #snapContainer — GPU accelerated, no JS animation
// loop, so this costs almost nothing. This just redirects normal
// vertical wheel/trackpad scrolling into horizontal movement (since
// scroll-snap only reacts to horizontal input by default), and adds
// left/right arrow key support.
const snapContainer = document.getElementById("snapContainer");

if (snapContainer) {
  snapContainer.addEventListener("wheel", (e) => {
    // Only take over when the gesture is more vertical than horizontal,
    // so a genuine horizontal trackpad swipe still passes through natively.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      snapContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    if (e.key === "ArrowRight") {
      snapContainer.scrollLeft += window.innerWidth;
    } else if (e.key === "ArrowLeft") {
      snapContainer.scrollLeft -= window.innerWidth;
    }
  });
}

// ---- Discord Live Status (via Lanyard) ----
const DISCORD_USER_ID = "692999678219911209";

function updateDiscordStatus(data) {
  const dot = document.getElementById("status-dot");
  const text = document.getElementById("status-text");
  const activityEl = document.getElementById("discord-activity");

  if (!dot || !text || !activityEl) return;

  const status = data.discord_status || "offline";
  dot.className = "status-dot " + status;

  const statusLabels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline"
  };
  text.textContent = statusLabels[status] || "Offline";

  const activity = (data.activities || []).find(a => a.type !== 4);
  if (data.listening_to_spotify && data.spotify) {
    activityEl.textContent = `listening to ${data.spotify.song} — ${data.spotify.artist}`;
  } else if (activity) {
    activityEl.textContent = `playing ${activity.name}`;
  } else {
    activityEl.textContent = "";
  }
}

async function fetchDiscordStatus() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    const json = await res.json();
    if (json.success) updateDiscordStatus(json.data);
  } catch (err) {
    console.error("Discord status fetch failed:", err);
  }
}

fetchDiscordStatus();

const discordSocket = new WebSocket("wss://api.lanyard.rest/socket");
let discordHeartbeat;

discordSocket.onmessage = (event) => {
  const { op, t, d } = JSON.parse(event.data);

  if (op === 1) {
    discordHeartbeat = setInterval(() => {
      discordSocket.send(JSON.stringify({ op: 3 }));
    }, d.heartbeat_interval);

    discordSocket.send(JSON.stringify({
      op: 2,
      d: { subscribe_to_id: DISCORD_USER_ID }
    }));
  }

  if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
    updateDiscordStatus(d);
  }
};

discordSocket.onclose = () => clearInterval(discordHeartbeat);

// ---- GitHub Activity Heatmap ----
// Rendered ourselves from real contribution data instead of an
// external image, for two reasons found while testing:
// 1. ghchart.rshah.org draws GitHub's light-mode empty-cell color,
//    which is nearly invisible against a black background — on this
//    page it read as "all white squares" with no real contrast.
// 2. It also can't be recolored to follow the matrix theme easter
//    egg, since it's a flat image with the color baked in server-side.
// Rendering our own SVG (rounded cells, fill="currentColor") fixes
// both, using a free public JSON API for the real per-day data.
function buildHeatmapSVG(contributions) {
  const cell = 11, gap = 3, step = cell + gap;
  const opacityByLevel = { 0: 0.08, 1: 0.28, 2: 0.5, 3: 0.72, 4: 1.0 };

  const days = [...contributions].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (days.length === 0) return "";

  const firstWeekday = new Date(days[0].date + "T00:00:00Z").getUTCDay(); // 0 = Sunday
  let rects = "";
  let maxWeek = 0;

  days.forEach((day, i) => {
    const weekday = (firstWeekday + i) % 7;
    const week = Math.floor((firstWeekday + i) / 7);
    maxWeek = Math.max(maxWeek, week);
    const opacity = opacityByLevel[day.level] ?? 0.08;
    rects += `<rect x="${week * step}" y="${weekday * step}" width="${cell}" height="${cell}" rx="2" fill="currentColor" fill-opacity="${opacity}"/>`;
  });

  const svgWidth = (maxWeek + 1) * step;
  const svgHeight = 7 * step;
  return `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

async function renderGithubHeatmap() {
  const container = document.getElementById("github-heatmap");
  if (!container) return;
  try {
    const res = await fetch("https://github-contributions-api.jogruber.de/v4/Diwash-7?y=last");
    const data = await res.json();
    if (!data.contributions) throw new Error("unexpected response shape");
    container.innerHTML = buildHeatmapSVG(data.contributions);
  } catch (err) {
    console.error("GitHub heatmap fetch failed:", err);
    container.innerHTML = '<span class="heatmap-loading">couldn\'t load — view on GitHub</span>';
  }
}

renderGithubHeatmap();

// ---- MonkeyType Typing Stats ----
// Public profile endpoint, no token needed — same safe pattern as
// the Discord and GitHub widgets above. Picks the single highest-WPM
// run across all standard time-based tests, and reports the accuracy
// FROM THAT SAME RUN (not an average across all tests), so the two
// numbers always describe one result together.
function getBestRun(profile) {
  const timePBs = (profile && profile.personalBests && profile.personalBests.time) || {};
  let best = null;
  Object.values(timePBs).forEach((entries) => {
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      if (!best || entry.wpm > best.wpm) best = entry;
    });
  });
  return best;
}

async function renderTypingStats() {
  const el = document.getElementById("typing-stat");
  if (!el) return;
  try {
    const res = await fetch("https://api.monkeytype.com/users/Diwash_7/profile?isUid=false");
    const json = await res.json();
    const best = getBestRun(json.data);
    if (!best) throw new Error("no personal best data found");
    el.textContent = `${Math.round(best.wpm)} wpm run · ${Math.round(best.acc)}% acc`;
  } catch (err) {
    console.error("MonkeyType fetch failed:", err);
    el.textContent = "couldn't load — view on monkeytype";
  }
}

renderTypingStats();
