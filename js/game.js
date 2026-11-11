/* ============ SETUP ============ */
const L = CONFIG.wordLength, N = CONFIG.maxGuesses;
const [y, m, d] = CONFIG.startDate.split("-").map(Number);
const today = new Date();
const dayNum = Math.max(0, Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(y, m - 1, d)) / 864e5));

// Shuffle the answers once (same order for everyone), then use one per day.
function shuffle(arr, seed) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const answerList = shuffle(ANSWERS.slice(), CONFIG.shuffleSeed);
const validGuesses = new Set(GUESSES);
ANSWERS.forEach(w => validGuesses.add(w)); // answers are always valid guesses
const answer = answerList[dayNum % answerList.length];
const KEY = "wordgame-" + dayNum;

document.title = CONFIG.title;
document.getElementById("title").textContent = CONFIG.title;

let guesses = [], current = "", over = false;
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) guesses = s; } catch (e) { }

/* ============ BOARD ============ */
const board = document.getElementById("board"), msg = document.getElementById("msg");
const rows = [];
for (let i = 0; i < N; i++) {
  const r = document.createElement("div");
  r.className = "row"; r.style.gridTemplateColumns = "repeat(" + L + ",auto)";
  for (let j = 0; j < L; j++) { const t = document.createElement("div"); t.className = "t"; r.appendChild(t); }
  board.appendChild(r); rows.push(r);
}

function score(g) {
  const res = Array(L).fill("miss"), left = {};
  for (let i = 0; i < L; i++) {
    if (g[i] === answer[i]) res[i] = "hit"; else left[answer[i]] = (left[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < L; i++) {
    if (res[i] !== "hit" && left[g[i]] > 0) { res[i] = "near"; left[g[i]]--; }
  }
  return res;
}

function draw() {
  rows.forEach((r, i) => {
    const t = r.children;
    for (let j = 0; j < L; j++) {
      t[j].className = "t"; t[j].textContent = "";
      if (i < guesses.length) {
        t[j].textContent = guesses[i][j]; t[j].classList.add(score(guesses[i])[j]);
      } else if (i === guesses.length && !over) {
        t[j].textContent = current[j] || ""; if (current[j]) t[j].classList.add("f");
      }
    }
  });
}

/* ============ KEYBOARD ============ */
const keys = {};
const layout = ["qwertyuiop", "asdfghjkl", "+zxcvbnm-"];
const kb = document.getElementById("kb");
layout.forEach(row => {
  const kr = document.createElement("div"); kr.className = "kr";
  [...row].forEach(c => {
    const b = document.createElement("button"); b.className = "k";
    if (c === "+") { b.textContent = "Enter"; b.classList.add("w"); b.onclick = () => press("Enter"); }
    else if (c === "-") { b.textContent = "⌫"; b.setAttribute("aria-label", "Delete"); b.classList.add("w"); b.onclick = () => press("Backspace"); }    else { b.textContent = c; keys[c] = b; b.onclick = () => press(c); }
    kr.appendChild(b);
  });
  kb.appendChild(kr);
});

const rank = { miss: 1, near: 2, hit: 3 };
function paintKey(c, s) {
  const b = keys[c]; if (!b) return;
  const cur = ["miss", "near", "hit"].find(x => b.classList.contains(x));
  if (cur && rank[cur] >= rank[s]) return;
  b.classList.remove("miss", "near", "hit"); b.classList.add(s);
}

/* ============ GAME FLOW ============ */
function finish() {
  over = true;
  const won = guesses[guesses.length - 1] === answer;
  msg.textContent = won ? "Solved in " + guesses.length + "/" + N + "!" : "The word was " + answer.toUpperCase() + ".";
  document.getElementById("share").style.display = "block";
}

function flash(t) {
  msg.textContent = t;
  const r = rows[guesses.length]; r.classList.remove("shake"); void r.offsetWidth; r.classList.add("shake");
}

function press(k) {
  if (over) return;
  if (k === "Enter") {
    if (current.length < L) return flash("Not enough letters");
    if (!validGuesses.has(current)) return flash("Not in word list");
    guesses.push(current); current = "";
    try { localStorage.setItem(KEY, JSON.stringify(guesses)); } catch (e) { }
    const last = guesses[guesses.length - 1], sc = score(last);
    [...last].forEach((c, i) => paintKey(c, sc[i]));
    if (last === answer || guesses.length >= N) finish(); else msg.textContent = "";
  } else if (k === "Backspace") { current = current.slice(0, -1); }
  else if (/^[a-z]$/i.test(k) && current.length < L) { current += k.toLowerCase(); }
  draw();
}

document.addEventListener("keydown", e => {
  // Ignore typing in the feedback form
  if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Enter" && document.activeElement && document.activeElement.tagName === "BUTTON") return;
  press(e.key);
});

/* ============ SHARE ============ */
document.getElementById("share").onclick = () => {
  const em = { hit: "🟩", near: "🟨", miss: "⬛" };
  const text = guesses.map(g => score(g).map(s => em[s]).join("")).join("\n");
  const done = () => { msg.textContent = "Result copied!"; };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => { msg.textContent = text; });
  else msg.textContent = text;
};

/* ============ START ============ */
guesses.forEach(g => { const sc = score(g); [...g].forEach((c, i) => paintKey(c, sc[i])); });
if (guesses.length && (guesses[guesses.length - 1] === answer || guesses.length >= N)) finish();
draw();
