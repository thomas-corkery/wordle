/* ============ CONFIGURATION ============ */
const CONFIG = {
  title: "Worlde",          // shown at the top of the page
  startDate: "2026-11-11",  // day 1 of the game (YYYY-MM-DD)
  maxGuesses: 6,
  wordLength: 5,
  allowAnyGuess: true,      // true = any 5-letter combination is accepted as a guess
  feedbackUrl: "https://formspree.io/f/moedawwr",

  // Game goes through these in order, one per day, then loops.
  words: [
    "crane", "pilot", "water", "lemon", "ghost", "river", "tiger", "bacon", "chair", "dream",
    "flame", "grape", "happy", "juice", "knife", "lucky", "mango", "night", "ocean", "piano",
    "queen", "robot", "smile", "table", "uncle", "vivid", "waltz", "young", "zebra", "brave",
    "candy", "dance", "eagle", "fresh", "giant", "honey", "ivory", "jolly", "kayak", "light"
  ]
};
/* ======================================= */
