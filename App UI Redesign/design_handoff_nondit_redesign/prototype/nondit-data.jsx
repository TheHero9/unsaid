// nondit-data.jsx — sample content for the Nondit prototype
// A startup pitch competition / demo day (N>1) so the pitch-switcher has work to do.

const EVENT = {
  name: "Founder Forum '26",
  date: "Thursday, 11 June 2026",
  eventCode: "ED2NWR",
  url: "nondit.app/e/ED2NWR",
};

// Organizer-defined chips. sentiment: 'pos' | 'neg' | 'neu'
const CHIPS = [
  { id: "clear-problem",   label: "clear problem",    s: "pos" },
  { id: "big-market",      label: "big market",       s: "pos" },
  { id: "strong-traction", label: "strong traction",  s: "pos" },
  { id: "great-team",      label: "great team",       s: "pos" },
  { id: "compelling-demo", label: "compelling demo",  s: "pos" },
  { id: "bold-claim",      label: "bold claim",       s: "neu" },
  { id: "memorable",       label: "memorable",        s: "neu" },
  { id: "needs-focus",     label: "needs focus",      s: "neu" },
  { id: "unclear-ask",     label: "unclear ask",      s: "neg" },
  { id: "weak-market",     label: "weak market size", s: "neg" },
  { id: "crowded-market",  label: "crowded market",   s: "neg" },
  { id: "shaky-numbers",   label: "shaky numbers",    s: "neg" },
  { id: "too-much-jargon", label: "too much jargon",  s: "neg" },
  { id: "rushed-delivery", label: "rushed delivery",  s: "neg" },
];

const CRITERIA = [
  { id: "problem",   label: "problem & solution" },
  { id: "market",    label: "market opportunity" },
  { id: "team",      label: "team" },
  { id: "traction",  label: "traction" },
];

// Pitches in running order. `live` marks the one happening now.
const PITCHES = [
  { id: "p1", name: "Northwind",  founder: "Maya Okafor",    one: "Carbon accounting that closes the books itself", priv: "zwPk1rP2bPzB" },
  { id: "p2", name: "Haloform",   founder: "Dev Patel",      one: "Synthetic MRI contrast without the injection",   priv: "a7Qm4kLpZ1cR" },
  { id: "p3", name: "Tasspoon",   founder: "Lena Sørensen",  one: "Robotic line cook for ghost kitchens",           priv: "k9Vd2nWxY3eT" },
  { id: "p4", name: "Cobalt Rye", founder: "Idris Bello",    one: "Underwriting for freelancers, in 90 seconds",    priv: "m3Bf6hJqL8sN" },
  { id: "p5", name: "Glimmer",    founder: "Priya Nair",     one: "On-device video search for security teams",      priv: "p5Cg8dKrM2vQ" },
  { id: "p6", name: "Outpost",    founder: "Tomas Vega",     one: "Field-service scheduling for solar installers",  priv: "r1Dh0fLsN4wX" },
  { id: "p7", name: "Mirable",    founder: "Hana Yoshida",   one: "Clinical-trial recruiting from EHR signals",     priv: "t8Ej3gMtP6yZ" },
  { id: "p8", name: "Driftless",  founder: "Sam Reyes",      one: "Inventory financing for indie hardware",         priv: "v4Fk7hNuQ9aB" },
];
PITCHES.forEach((p, i) => { p.order = i + 1; });
const LIVE_INDEX = 2; // Tasspoon (p3) is on stage now

// Pre-seeded aggregate feedback (what other jurors already gave) for the founder page.
// chip id -> count ; criteria id -> [scores] ; notes[]
const SEED = {
  p1: {
    jurors: 7,
    chips: { "clear-problem": 6, "big-market": 5, "strong-traction": 4, "great-team": 3, "compelling-demo": 4, "needs-focus": 2, "crowded-market": 2, "too-much-jargon": 1 },
    scores: { problem: [5,4,5,4,5,4,5], market: [5,5,4,5,4,5,4], team: [4,4,3,4,5,4,4], traction: [4,3,4,4,3,4,5] },
    notes: [
      { t: "The self-closing books demo landed. I'd buy it.", ago: "2 hours ago" },
      { t: "Market is crowded but their wedge is sharp.", ago: "3 hours ago" },
      { t: "Wanted one more proof point on retention.", ago: "3 hours ago" },
    ],
    custom: [{ label: "real customers", s: "pos" }],
  },
  p2: {
    jurors: 6,
    chips: { "bold-claim": 5, "great-team": 4, "compelling-demo": 3, "big-market": 4, "shaky-numbers": 3, "too-much-jargon": 4, "unclear-ask": 2 },
    scores: { problem: [4,5,4,4,5,4], market: [5,4,5,4,4,5], team: [5,5,4,5,4,5], traction: [2,3,2,3,2,3] },
    notes: [
      { t: "Science is genuinely impressive. Regulatory path was hand-waved.", ago: "1 hour ago" },
      { t: "Too much jargon in the first two minutes.", ago: "2 hours ago" },
    ],
    custom: [{ label: "deep tech moat", s: "neu" }],
  },
  // p3 (live) starts mostly empty — this is the one the demo juror fills in
  p3: { jurors: 1, chips: { "compelling-demo": 1 }, scores: { team: [4] }, notes: [], custom: [] },
  p4: {
    jurors: 5,
    chips: { "clear-problem": 5, "strong-traction": 4, "memorable": 3, "weak-market": 2, "needs-focus": 2 },
    scores: { problem: [5,4,5,5,4], market: [3,3,2,3,3], team: [4,4,4,3,4], traction: [4,5,4,4,5] },
    notes: [{ t: "90-second underwriting is a real unlock for gig workers.", ago: "40 minutes ago" }],
    custom: [],
  },
  p5: { jurors: 4, chips: { "compelling-demo": 4, "great-team": 2, "bold-claim": 2, "crowded-market": 3 }, scores: { problem: [4,4,3,4], market: [4,3,4,4], team: [5,4,5,4], traction: [3,3,4,3] }, notes: [], custom: [] },
  p6: { jurors: 3, chips: { "clear-problem": 3, "big-market": 2, "needs-focus": 2 }, scores: { problem: [4,4,5], market: [4,4,3], team: [3,4,3], traction: [3,3,4] }, notes: [], custom: [] },
  p7: { jurors: 0, chips: {}, scores: {}, notes: [], custom: [] },
  p8: { jurors: 0, chips: {}, scores: {}, notes: [], custom: [] },
};

Object.assign(window, { EVENT, CHIPS, CRITERIA, PITCHES, LIVE_INDEX, SEED });
