/* ============================================================
   PERSONA — CHARACTER ARCHIVE DATA
   Story text is preserved verbatim from the archive source.
   Do not summarize, rename, or rewrite these entries.
   ============================================================ */

const CHARACTERS = {

  fd: {
    id: "fd",
    code: "F.D",
    title: "THE RESOLVE",
    status: "DEAD",
    statusClass: "s-dead",
    designation: "The Resolve",
    personality: "resolute / guarded / quietly gentle",
    about: [
      "F.D does not bend. He meets every storm head-on and refuses to let the world see him flinch.",
      "His surface is hard, unforgiving — built that way on purpose.",
      "But the part of him that still cares is the part he protects the most."
    ],
    traits: ["RESOLUTE", "GUARDED", "DISCIPLINED", "QUIETLY GENTLE"],
    image: "images/fd.jpg",
    caption: "SUBJECT 01 // SYNCHRONIZED",
    initials: "FD"
  },

  oa: {
    id: "oa",
    code: "O.A",
    title: "THE SCHOLAR",
    status: "INACTIVE",
    statusClass: "s-inactive",
    designation: "The Scholar",
    personality: "formal / logical / critical / evidence-driven",
    about: [
      "O.A accepts nothing without proof. He reads every word twice, questions every source, and trusts only what can be verified.",
      "To him, belief is a conclusion — never a starting point."
    ],
    traits: ["FORMAL", "LOGICAL", "CRITICAL", "SKEPTICAL"],
    image: "images/oa.jpg",
    caption: "SUBJECT 02 // SYNCHRONIZED",
    initials: "OA"
  },

  ak: {
    id: "ak",
    code: "A.K",
    title: "THE WANDERER",
    status: "ACTIVE",
    statusClass: "s-active",
    designation: "The Wanderer",
    personality: "free / spontaneous / careless / slow to open up",
    about: [
      "A.K moves where the wind takes him. New places, new faces, new mistakes — he collects them all without apology.",
      "He will let you in, but only when he is ready. Rushing him only makes him wander further."
    ],
    traits: ["FREE", "SPONTANEOUS", "CARELESS", "CURIOUS"],
    image: "images/ak.jpg",
    caption: "SUBJECT 03 // SYNCHRONIZED",
    initials: "AK"
  },

  mm: {
    id: "mm",
    code: "M.M",
    title: "THE KING",
    status: "MISSING",
    statusClass: "s-missing",
    designation: "The Sovereign",
    personality: "cold / elegant / composed / quietly kind",
    about: [
      "M.M carries the stillness of a throne room. He speaks little, moves with deliberate grace, and never raises his voice — yet the room quiets when he enters.",
      "His coldness is not cruelty. It is the distance of someone who has learned that kindness must be earned."
    ],
    traits: ["COMPOSED", "ELEGANT", "REGAL", "QUIETLY KIND"],
    image: "images/mm.jpg",
    caption: "SUBJECT 04 // SYNCHRONIZED",
    initials: "MM"
  },

  ja: {
    id: "ja",
    code: "J.A",
    title: "THE AUTHOR",
    status: "UNKNOWN",
    statusClass: "s-unknown",
    designation: "REDACTED",
    personality: "UNKNOWN",
    about: [
      "No complete record exists.",
      "No confirmed personality.",
      "No verified history.",
      "Every attempt to access this identity returns the same result."
    ],
    traits: ["REDACTED", "REDACTED", "REDACTED"],
    image: "images/ja.jpg",
    caption: "SUBJECT - // OUTSIDE THE SYSTEM",
    initials: "JA",
    restricted: true
  }
};

/* ============================================================
   J.A. — OWNER-ONLY REVEAL SEQUENCE
   Stages 1–5 are denial layers; stage 6 is the final reveal.
   Regular personnel never advance this sequence.
   ============================================================ */

const JA_STAGES = [
  {
    stage: 1,
    status: "ACCESS DENIED",
    designation: "REDACTED",
    personality: "UNKNOWN",
    about: [
      "You do not have clearance for this file.",
      "Every attempt to access this identity returns the same result."
    ],
    traits: ["REDACTED", "REDACTED", "REDACTED"]
  },
  {
    stage: 2,
    status: "IDENTITY UNKNOWN",
    designation: "REDACTED",
    personality: "UNKNOWN",
    about: [
      "No complete record exists.",
      "No confirmed personality.",
      "No verified history."
    ],
    traits: ["REDACTED", "REDACTED", "REDACTED"]
  },
  {
    stage: 3,
    status: "RECORD NOT FOUND",
    designation: "REDACTED",
    personality: "UNKNOWN",
    about: [
      "The system keeps looking.",
      "The system keeps failing.",
      "Every attempt to access this identity returns the same result."
    ],
    traits: ["REDACTED", "REDACTED", "REDACTED"]
  },
  {
    stage: 4,
    status: "ACCESS DENIED",
    designation: "REDACTED",
    personality: "UNKNOWN",
    about: [
      "lu penasaran banget tentang gua?, oke.",
      "You are not supposed to find this file.",
      "You are not supposed to find HIM."
    ],
    traits: ["REDACTED", "REDACTED", "REDACTED"]
  },
  {
    stage: 5,
    status: "...",
    designation: "...",
    personality: "...",
    about: ["...", "...", "..."],
    traits: ["...", "...", "..."]
  },
  {
    stage: 6,
    final: true,
    title: "THE AUTHOR",
    status: "OUTSIDE THE SYSTEM",
    statusClass: "s-redacted",
    designation: "NOT A PERSONA — THE CREATOR",
    personality: "observer / creator / omnipresent",
    about: [
      "oke gua nyerah...",
      "you kept asking who i am.",
      "i am the one writing this. i am the one watching you read it.",
      "every face you have met — I gave them their lines."
    ],
    traits: ["THE AUTHOR", "THE CREATOR", "OUTSIDE", "OBSERVER"],
    revealLine: "oke gua nyerah, sekarang tutup.",
    closing: ["FIVE FACES.", "ONE MIND.", "ONE AUTHOR."]
  }
];
