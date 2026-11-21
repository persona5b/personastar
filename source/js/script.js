/* ============================================================
   PERSONA — FIVE FACES. ONE MIND.
   Application logic: authentication, starfield, constellation
   diagram, dossier renderer, J.A. reveal sequence, audio.
   Vanilla JS — no build step. Works from file:// locally.
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   0. SAFE CONFIG ACCESS
   ------------------------------------------------------------ */
const CONFIG = (typeof ARCHIVE_CONFIG !== "undefined" && ARCHIVE_CONFIG)
  ? ARCHIVE_CONFIG
  : { audio: {}, users: [], owner: { name: "OWNER", code: "" } };

const CHARACTER_MAP = (typeof CHARACTERS !== "undefined" && CHARACTERS) ? CHARACTERS : {};
const JA_STAGE_DATA = (typeof JA_STAGES !== "undefined" && JA_STAGES) ? JA_STAGES : [];

const SESSION_KEY = "persona_session_v1";
const JA_STAGE_KEY = "persona_ja_stage_v1";
const SOUND_KEY = "persona_sound";

const reducedMotion = window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   1. DOM REFERENCES
   ------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);

const views = {
  login: $("view-login"),
  welcome: $("view-welcome"),
  archive: $("view-archive"),
  dossier: $("view-dossier")
};

const nobelInput = $("nobel-input");
const toggleEye = $("toggle-eye");
const loginSubmit = $("login-submit");
const loginFeedback = $("login-feedback");
const loginPanel = $("login-panel");
const soundToggle = $("sound-toggle");
const dimOverlay = $("cinematic-dim");
const toast = $("toast");
const sessionChip = $("session-chip");
const constellation = $("constellation");
const lineSvg = $("constellation-lines");
const dossierContent = $("dossier-content");
const dossierCode = $("dossier-code");
const jaFlash = $("ja-flash");

/* ------------------------------------------------------------
   2. SESSION STATE
   ------------------------------------------------------------ */
let session = null;
try {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) session = JSON.parse(raw);
} catch (e) { session = null; }

function saveSession(data) {
  session = data;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch (e) {}
}

function authenticate(code) {
  code = (code || "").trim();
  if (!code) return null;

  if (CONFIG.owner && CONFIG.owner.code && code === String(CONFIG.owner.code)) {
    return { name: CONFIG.owner.name || "OWNER", owner: true };
  }
  const user = (CONFIG.users || []).find((u) => u && u.code && code === String(u.code));
  if (user) return { name: user.name, owner: false };
  return null;
}

/* ------------------------------------------------------------
   3. AUDIO ENGINE (graceful silence when files are missing)
   ------------------------------------------------------------ */
const audio = {
  enabled: false,
  ambient: $("audio-ambient"),
  click: $("audio-click"),
  ja: $("audio-ja"),
  missing: { ambient: false, click: false, ja: false },
  init() {
    try {
      this.enabled = localStorage.getItem(SOUND_KEY) === "on";
    } catch (e) { this.enabled = false; }

    const a = CONFIG.audio || {};
    this.ambient.volume = a.ambientVolume || 0.32;
    this.click.volume = a.clickVolume || 0.25;
    this.ja.volume = a.jaVolume || 0.5;

    this.ambient.addEventListener("error", () => { this.missing.ambient = true; });
    this.click.addEventListener("error", () => { this.missing.click = true; });
    this.ja.addEventListener("error", () => { this.missing.ja = true; });

    this.syncToggle();

    // Audio may only start after a user gesture.
    document.addEventListener("pointerdown", () => {
      if (this.enabled) this.playAmbient();
    }, { once: false });
  },
  syncToggle() {
    soundToggle.setAttribute("aria-checked", this.enabled ? "true" : "false");
    soundToggle.querySelector(".sound-label").textContent = this.enabled ? "SOUND ON" : "SOUND OFF";
  },
  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem(SOUND_KEY, this.enabled ? "on" : "off"); } catch (e) {}
    this.syncToggle();
    if (this.enabled) {
      this.playAmbient();
      this.playClick();
    } else {
      this.ambient.pause();
    }
  },
  playAmbient() {
    if (!this.enabled || this.missing.ambient) return;
    try {
      const p = this.ambient.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  },
  playClick() {
    if (!this.enabled || this.missing.click) return;
    try {
      this.click.currentTime = 0;
      const p = this.click.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  },
  playJA() {
    if (!this.enabled || this.missing.ja) return;
    try {
      this.ja.currentTime = 0;
      const p = this.ja.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
};

/* ------------------------------------------------------------
   4. STARFIELD — layered parallax canvas with independent twinkle
   ------------------------------------------------------------ */
const starfield = {
  canvas: null,
  ctx: null,
  stars: [],
  dpr: 1,
  w: 0,
  h: 0,
  layers: [
    { factor: 0.04, count: 90, rMin: 0.4, rMax: 0.9, base: 0.28, amp: 0.22, speedMin: 0.3, speedMax: 0.8 },
    { factor: 0.10, count: 60, rMin: 0.7, rMax: 1.3, base: 0.38, amp: 0.28, speedMin: 0.5, speedMax: 1.1 },
    { factor: 0.18, count: 34, rMin: 1.0, rMax: 1.8, base: 0.5,  amp: 0.32, speedMin: 0.7, speedMax: 1.5 }
  ],
  init() {
    this.canvas = $("starfield");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    if (reducedMotion) {
      this.drawStatic();
    } else {
      this.loop(0);
    }
  },
  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.buildStars();
    if (reducedMotion) this.drawStatic();
  },
  buildStars() {
    this.stars = [];
    const mobile = this.w < 640;
    this.layers.forEach((layer, li) => {
      const count = Math.round(layer.count * (mobile ? 0.62 : 1));
      for (let i = 0; i < count; i++) {
        this.stars.push({
          layer: li,
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          r: layer.rMin + Math.random() * (layer.rMax - layer.rMin),
          phase: Math.random() * Math.PI * 2,
          speed: layer.speedMin + Math.random() * (layer.speedMax - layer.speedMin),
          bright: Math.random() < 0.08
        });
      }
    });
  },
  drawStatic() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    this.stars.forEach((s) => {
      const layer = this.layers[s.layer];
      ctx.globalAlpha = layer.base + 0.12;
      ctx.fillStyle = "#cfe0ff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  },
  loop(t) {
    const ctx = this.ctx;
    const scrollY = window.scrollY || 0;
    ctx.clearRect(0, 0, this.w, this.h);
    this.stars.forEach((s) => {
      const layer = this.layers[s.layer];
      const twinkle = layer.base + layer.amp * Math.sin(t * 0.001 * s.speed + s.phase);
      const yRaw = s.y + scrollY * layer.factor;
      const y = ((yRaw % (this.h + 40)) + (this.h + 40)) % (this.h + 40) - 20;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, twinkle));
      ctx.fillStyle = s.bright ? "#e8f1ff" : "#b9cdf2";
      if (s.bright) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(180,210,255,0.7)";
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    requestAnimationFrame((tt) => this.loop(tt));
  }
};

/* ------------------------------------------------------------
   5. VIEW MANAGER
   ------------------------------------------------------------ */
function showView(name) {
  Object.keys(views).forEach((key) => {
    views[key].classList.toggle("hidden", key !== name);
  });
  if (name === "archive") {
    requestAnimationFrame(() => drawLines());
  }
  window.scrollTo(0, 0);
}

function cinematicTo(callback) {
  dimOverlay.classList.add("active");
  setTimeout(() => {
    callback();
    setTimeout(() => dimOverlay.classList.remove("active"), 120);
  }, 380);
}

/* ------------------------------------------------------------
   6. LOGIN
   ------------------------------------------------------------ */
function initLogin() {
  loginSubmit.addEventListener("click", handleLogin);
  nobelInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  toggleEye.addEventListener("click", () => {
    const revealed = nobelInput.type === "text";
    nobelInput.style.opacity = "0.15";
    setTimeout(() => {
      nobelInput.type = revealed ? "password" : "text";
      nobelInput.style.opacity = "1";
    }, 130);
    toggleEye.classList.toggle("revealed", !revealed);
    toggleEye.setAttribute("aria-pressed", revealed ? "false" : "true");
    nobelInput.focus();
  });
}

function handleLogin() {
  if (loginSubmit.classList.contains("loading")) return;

  audio.playClick();
  loginFeedback.className = "login-feedback";
  loginFeedback.textContent = "";
  loginSubmit.classList.add("loading");
  loginSubmit.disabled = true;

  setTimeout(() => {
    const result = authenticate(nobelInput.value);
    loginSubmit.classList.remove("loading");
    loginSubmit.disabled = false;

    if (!result) {
      loginPanel.classList.remove("shake");
      void loginPanel.offsetWidth; // restart animation
      loginPanel.classList.add("shake");
      loginFeedback.classList.add("denied");
      loginFeedback.textContent = "ACCESS DENIED — INVALID NOBEL SIGNATURE";
      nobelInput.value = "";
      nobelInput.focus();
      return;
    }

    loginFeedback.classList.add("granted");
    loginFeedback.textContent = "ACCESS GRANTED";
    saveSession(result);

    setTimeout(() => {
      showWelcome(result);
    }, 750);
  }, 1100);
}

/* ------------------------------------------------------------
   7. WELCOME SEQUENCE
   ------------------------------------------------------------ */
function showWelcome(result) {
  showView("welcome");
  $("welcome-granted").textContent = "ACCESS GRANTED";
  $("welcome-name").textContent = "WELCOME, " + result.name.toUpperCase() + ".";
  $("welcome-line").textContent = "Your presence has been acknowledged.";
  spawnWelcomeParticles();

  setTimeout(() => {
    enterArchive();
  }, 2700);
}

function spawnWelcomeParticles() {
  const host = $("welcome-particles");
  host.innerHTML = "";
  if (reducedMotion) return;
  const count = 26;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 70 + Math.random() * 150;
    p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    p.style.animationDelay = (Math.random() * 0.35) + "s";
    host.appendChild(p);
  }
}

function enterArchive() {
  sessionChip.textContent = "CLEARANCE: " + (session ? session.name.toUpperCase() : "—");
  if (session && session.owner) sessionChip.style.color = "#e08a97";

  const jaOrb = document.querySelector(".orb-ja");
  if (session && session.owner) jaOrb.classList.add("unlocked");

  showView("archive");
}

/* ------------------------------------------------------------
   8. CONSTELLATION DIAGRAM
   J.A. (top) connects DIRECTLY to all four children.
   No parent-child links between the four children.
   ------------------------------------------------------------ */
const ORB_LAYOUT = {
  desktop: {
    ja: { x: 50, y: 15 },
    fd: { x: 23, y: 63 },
    oa: { x: 39, y: 63 },
    mm: { x: 61, y: 63 },
    ak: { x: 77, y: 63 }
  },
  mobile: {
    ja: { x: 50, y: 10 },
    fd: { x: 28, y: 42 },
    oa: { x: 28, y: 76 },
    mm: { x: 72, y: 42 },
    ak: { x: 72, y: 76 }
  }
};

function applyOrbLayout() {
  const layout = window.innerWidth <= 900 ? ORB_LAYOUT.mobile : ORB_LAYOUT.desktop;
  Object.keys(layout).forEach((id) => {
    const orb = document.querySelector('.orb[data-id="' + id + '"]');
    if (!orb) return;
    orb.style.left = layout[id].x + "%";
    orb.style.top = layout[id].y + "%";
  });
}

function drawLines() {
  if (views.archive.classList.contains("hidden")) return;
  applyOrbLayout();

  const rect = constellation.getBoundingClientRect();
  lineSvg.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);
  lineSvg.innerHTML = "";

  const jaOrb = document.querySelector('.orb[data-id="ja"]');
  if (!jaOrb) return;
  const jaCenter = orbCenter(jaOrb, rect);
  const jaR = jaOrb.offsetWidth / 2;

  const children = ["fd", "oa", "mm", "ak"];
  children.forEach((id) => {
    const orb = document.querySelector('.orb[data-id="' + id + '"]');
    if (!orb) return;
    const c = orbCenter(orb, rect);
    const r = orb.offsetWidth / 2;

    const sx = jaCenter.x;
    const sy = jaCenter.y - jaR * 0.85;
    const ex = c.x;
    const ey = c.y - r * 0.85;
    const c1y = sy + (ey - sy) * 0.45;
    const c2y = ey - (ey - sy) * 0.45;
    const d = "M " + sx + " " + sy +
              " C " + sx + " " + c1y + ", " + ex + " " + c2y + ", " + ex + " " + ey;

    const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
    base.setAttribute("class", "line-base");
    base.setAttribute("d", d);
    lineSvg.appendChild(base);

    const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    flow.setAttribute("class", "line-flow" + (session && session.owner ? " red" : ""));
    flow.setAttribute("d", d);
    lineSvg.appendChild(flow);
  });
}

function orbCenter(orb, containerRect) {
  const r = orb.getBoundingClientRect();
  return {
    x: r.left - containerRect.left + r.width / 2,
    y: r.top - containerRect.top + r.height / 2
  };
}

/* ------------------------------------------------------------
   9. DOSSIER RENDERER
   ------------------------------------------------------------ */
function initOrbs() {
  document.querySelectorAll(".orb").forEach((orb) => {
    orb.addEventListener("click", () => {
      const id = orb.getAttribute("data-id");
      audio.playClick();

      if (id === "ja" && !(session && session.owner)) {
        showToast("ACCESS RESTRICTED — OWNER CLEARANCE REQUIRED.");
        orb.classList.remove("shake");
        void orb.offsetWidth;
        orb.classList.add("shake");
        setTimeout(() => orb.classList.remove("shake"), 500);
        return;
      }
      openDossier(id);
    });
  });

  $("btn-back").addEventListener("click", () => {
    audio.playClick();
    exitDossier();
  });
}

function openDossier(id) {
  cinematicTo(() => {
    if (id === "ja") {
      renderJADossier();
    } else {
      renderCharacterDossier(CHARACTER_MAP[id]);
    }
    showView("dossier");
  });
}

function exitDossier() {
  document.body.classList.remove("ja-mode");
  cinematicTo(() => showView("archive"));
}

function portraitBlock(ch) {
  return (
    '<div class="portrait-col">' +
      '<div class="portrait">' +
        '<img src="' + ch.image + '" alt="' + ch.code + ' portrait" onerror="this.style.display=\'none\'">' +
        '<div class="portrait-fallback">' +
          '<div class="initials">' + ch.initials + "</div>" +
          '<div class="placeholder-note">PORTRAIT AWAITING ARCHIVE ENTRY</div>' +
        "</div>" +
      "</div>" +
      '<div class="portrait-caption">' + ch.caption + "</div>" +
    "</div>"
  );
}

function metaRow(label, value, extraClass) {
  return (
    '<div class="meta-item">' +
      '<div class="meta-label">' + label + "</div>" +
      '<div class="meta-value">' + (extraClass
        ? '<span class="status-tag ' + extraClass + '">' + value + "</span>"
        : value) + "</div>" +
    "</div>"
  );
}

function traitChips(traits) {
  return '<div class="trait-chips">' +
    traits.map((t) => '<span class="trait-chip">' + t + "</span>").join("") +
    "</div>";
}

function renderCharacterDossier(ch) {
  if (!ch) return;
  document.body.classList.remove("ja-mode");
  dossierCode.textContent = ch.caption;

  const aboutHtml = ch.about.map((p) => "<p>" + p + "</p>").join("");

  dossierContent.innerHTML =
    '<div class="dossier-body">' +
      portraitBlock(ch) +
      '<div class="dossier-info">' +
        '<h2 class="dossier-name">' + ch.code + "</h2>" +
        '<p class="dossier-title">' + ch.title + "</p>" +
        '<div class="dossier-meta">' +
          metaRow("STATUS", ch.status, ch.statusClass) +
          metaRow("DESIGNATION", ch.designation) +
          metaRow("PERSONALITY", ch.personality) +
          metaRow("ARCHIVE ENTRY", ch.caption) +
        "</div>" +
        '<div class="dossier-section-label">RECORD</div>' +
        '<div class="dossier-about">' + aboutHtml + "</div>" +
        '<div class="dossier-section-label">TRAITS</div>' +
        traitChips(ch.traits) +
      "</div>" +
    "</div>";
}

/* ------------------------------------------------------------
   10. J.A. OWNER-ONLY REVEAL SEQUENCE
   ------------------------------------------------------------ */
function getJAStageIndex() {
  let idx = 0;
  try { idx = parseInt(sessionStorage.getItem(JA_STAGE_KEY) || "0", 10) || 0; } catch (e) { idx = 0; }
  return Math.max(0, Math.min(JA_STAGE_DATA.length - 1, idx));
}

function setJAStageIndex(idx) {
  try { sessionStorage.setItem(JA_STAGE_KEY, String(idx)); } catch (e) {}
}

function renderJADossier() {
  document.body.classList.add("ja-mode");
  dossierCode.textContent = CHARACTER_MAP.ja.caption;

  // Dramatic entry effects for the owner only.
  jaFlash.classList.remove("active");
  void jaFlash.offsetWidth;
  jaFlash.classList.add("active");
  audio.playJA();

  const idx = getJAStageIndex();
  const stage = JA_STAGE_DATA[idx];

  if (stage.final) {
    renderJAFinal(stage);
    return;
  }

  const aboutHtml = stage.about.map((p) => "<p>" + p + "</p>").join("");

  dossierContent.innerHTML =
    '<div class="dossier-body">' +
      '<div class="portrait-col">' +
        '<div class="portrait" style="border-color:rgba(224,69,95,.35)">' +
          '<img src="' + CHARACTER_MAP.ja.image + '" alt="J.A portrait" onerror="this.style.display=\'none\'">' +
          '<div class="portrait-fallback">' +
            '<div class="ja-eye" aria-hidden="true"></div>' +
            '<div class="placeholder-note">SUBJECT OUTSIDE THE SYSTEM</div>' +
          "</div>" +
        "</div>" +
        '<div class="portrait-caption">' + CHARACTER_MAP.ja.caption + "</div>" +
      "</div>" +
      '<div class="dossier-info">' +
        '<span class="ja-stage-tag">CLEARANCE ATTEMPT ' + (idx + 1) + " / " + JA_STAGE_DATA.length + "</span>" +
        '<h2 class="dossier-name" style="color:#f0c9d1">J.A</h2>' +
        '<p class="dossier-title" style="color:rgba(224,138,151,.8)">THE AUTHOR</p>' +
        '<div class="dossier-meta">' +
          metaRow("STATUS", stage.status, "s-redacted") +
          metaRow("DESIGNATION", stage.designation, "s-redacted") +
          metaRow("PERSONALITY", stage.personality, "s-redacted") +
          metaRow("ARCHIVE ENTRY", CHARACTER_MAP.ja.caption) +
        "</div>" +
        '<div class="dossier-section-label">RECORD</div>' +
        '<div class="dossier-about">' + aboutHtml + "</div>" +
        '<div class="dossier-section-label">TRAITS</div>' +
        traitChips(stage.traits) +
        '<button class="ja-retry" id="ja-retry" type="button">RETRY ACCESS // ATTEMPT ' + (idx + 2) + "</button>" +
      "</div>" +
    "</div>";

  $("ja-retry").addEventListener("click", () => {
    audio.playClick();
    setJAStageIndex(idx + 1);
    jaFlash.classList.remove("active");
    void jaFlash.offsetWidth;
    jaFlash.classList.add("active");
    audio.playJA();
    renderJADossier();
  });
}

function renderJAFinal(stage) {
  const aboutHtml = stage.about.map((p) => "<p>" + p + "</p>").join("");
  const closingHtml = stage.closing.map((line) => "<p>" + line + "</p>").join("");

  dossierContent.innerHTML =
    '<div class="dossier-body ja-final-reveal">' +
      '<div class="portrait-col">' +
        '<div class="portrait" style="border-color:rgba(224,69,95,.45)">' +
          '<img src="' + CHARACTER_MAP.ja.image + '" alt="J.A portrait" onerror="this.style.display=\'none\'">' +
          '<div class="portrait-fallback">' +
            '<div class="ja-eye" aria-hidden="true"></div>' +
            '<div class="placeholder-note">SUBJECT OUTSIDE THE SYSTEM</div>' +
          "</div>" +
        "</div>" +
        '<div class="portrait-caption">' + CHARACTER_MAP.ja.caption + "</div>" +
      "</div>" +
      '<div class="dossier-info">' +
        '<span class="ja-stage-tag">FINAL RECORD // UNSEALED</span>' +
        '<h2 class="dossier-name" style="color:#f0c9d1">' + stage.title + "</h2>" +
        '<p class="dossier-title" style="color:rgba(224,138,151,.8)">NOT A PERSONA — THE CREATOR</p>' +
        '<div class="dossier-meta">' +
          metaRow("STATUS", stage.status, "s-redacted") +
          metaRow("DESIGNATION", stage.designation, "s-redacted") +
          metaRow("PERSONALITY", stage.personality) +
          metaRow("ARCHIVE ENTRY", CHARACTER_MAP.ja.caption) +
        "</div>" +
        '<div class="dossier-section-label">RECORD</div>' +
        '<div class="dossier-about">' + aboutHtml + "</div>" +
        '<div class="dossier-section-label">TRAITS</div>' +
        traitChips(stage.traits) +
        '<p class="reveal-line">' + stage.revealLine + "</p>" +
        '<div class="closing-lines">' + closingHtml + "</div>" +
      "</div>" +
    "</div>";
}

/* ------------------------------------------------------------
   11. TOAST
   ------------------------------------------------------------ */
let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

/* ------------------------------------------------------------
   12. INIT
   ------------------------------------------------------------ */
function init() {
  audio.init();
  starfield.init();
  initLogin();
  initOrbs();

  soundToggle.addEventListener("click", () => audio.toggle());

  window.addEventListener("resize", () => {
    applyOrbLayout();
    drawLines();
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => drawLines(), 250);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => drawLines());
  }

  if (session && session.name) {
    enterArchive();
  } else {
    showView("login");
    nobelInput.focus();
  }
}

document.addEventListener("DOMContentLoaded", init);
