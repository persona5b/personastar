/* ============================================================
   PERSONA — AUTHENTICATION CONFIGURATION
   ------------------------------------------------------------
   This is the ONLY file you need to edit to assign access codes.

   - Regular personnel: fill each `code` with the 4-digit Nobel
     code assigned to that person. Leave it as "" until the real
     code exists; blank codes are rejected at login.
   - OWNER: the only clearance that can open identity J.A.
     Fill the owner code below. It is never displayed in the UI.

   NOTE ON SECURITY: this file ships with the frontend, so its
   contents are readable in browser DevTools. For a public
   deployment, move the owner check to a small backend endpoint
   (see README.md, section "OWNER security").
   ============================================================ */

const ARCHIVE_CONFIG = {

  /* Audio files are optional. If a file is missing the site
     keeps running silently. Volumes are kept deliberately low. */
  audio: {
    ambient: "audio/ambient1.mp3",
    click:   "audio/click.mp3",
    ja:      "audio/ja_glitch.mp3",
    ambientVolume: 0.32,
    clickVolume:   0.25,
    jaVolume:      0.50
  },

  /* Regular personnel roster — fill the 4-digit Nobel codes. */
  users: [
    { name: "Theo",      code: "" },
    { name: "Evan",      code: "" },   // my Ipin
    { name: "Kikay",     code: "" },
    { name: "Aljepa",    code: "" },
    { name: "Rienn",     code: "" },
    { name: "Darka",     code: "" },
    { name: "Kathrinee", code: "" },
    { name: "Ken",       code: "" },
    { name: "Jane",      code: "" },
    { name: "Sean",      code: "" },
    { name: "Zevran",    code: "" }
  ],

  /* OWNER clearance — sole access to J.A. Do not share this code. */
  owner: {
    name: "OWNER",
    code: ""
  }
};
