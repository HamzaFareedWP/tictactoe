const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restart");
const themeBtn = document.querySelector("#theme");
const themeLabel = themeBtn.querySelector(".theme-label");
const nameX = document.querySelector("#name-x");
const nameO = document.querySelector("#name-o");
const cardX = document.querySelector("#card-x");
const cardO = document.querySelector("#card-o");
const sizeButtons = [...document.querySelectorAll("[data-size]")];

const scoreEls = {
  x: document.querySelector("#score-x"),
  o: document.querySelector("#score-o"),
  draws: document.querySelector("#score-draws"),
  total: document.querySelector("#score-total"),
  nameX: document.querySelector("#score-name-x"),
  nameO: document.querySelector("#score-name-o"),
  cardX: document.querySelector("#score-card-x"),
  cardO: document.querySelector("#score-card-o"),
  history: document.querySelector("#history"),
  reset: document.querySelector("#reset-scores"),
};

const MAX_HISTORY = 8;

let size = 3;
let board = [];
let current = "X";
let locked = false;
let cells = [];
let scores = loadJSON("ttt-scores", { X: 0, O: 0, draws: 0 });
let history = loadJSON("ttt-history", []);

function loadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: the game still works, it just won't be saved
  }
}

function linesFor(n) {
  const lines = [];

  for (let row = 0; row < n; row += 1) {
    const line = [];
    for (let col = 0; col < n; col += 1) line.push(row * n + col);
    lines.push(line);
  }

  for (let col = 0; col < n; col += 1) {
    const line = [];
    for (let row = 0; row < n; row += 1) line.push(row * n + col);
    lines.push(line);
  }

  const main = [];
  const anti = [];
  for (let i = 0; i < n; i += 1) {
    main.push(i * n + i);
    anti.push(i * n + (n - 1 - i));
  }
  lines.push(main, anti);
  return lines;
}

function winnerOf(squares, n) {
  for (const line of linesFor(n)) {
    const mark = squares[line[0]];
    if (mark && line.every((index) => squares[index] === mark)) {
      return { player: mark, line };
    }
  }
  return null;
}

function displayName(mark) {
  const typed = (mark === "X" ? nameX.value : nameO.value).trim();
  return typed || (mark === "X" ? "Player 1" : "Player 2");
}

function cellLabel(index, mark) {
  const row = Math.floor(index / size) + 1;
  const col = (index % size) + 1;
  return `Row ${row}, column ${col}, ${mark || "empty"}`;
}

function saveGame() {
  saveJSON("ttt-game", { size, board, current });
}

function loadGame() {
  const saved = loadJSON("ttt-game", null);
  if (!saved || saved.size !== size) return null;
  if (!Array.isArray(saved.board) || saved.board.length !== size * size) return null;
  if (!saved.board.every((c) => c === null || c === "X" || c === "O")) return null;
  if (saved.current !== "X" && saved.current !== "O") return null;
  return saved;
}

function recordMatch(outcome) {
  if (outcome === "draw") scores.draws += 1;
  else scores[outcome] += 1;

  history.unshift({
    outcome,
    name: outcome === "draw" ? "" : displayName(outcome),
    size,
    moves: board.filter(Boolean).length,
  });
  history = history.slice(0, MAX_HISTORY);

  saveJSON("ttt-scores", scores);
  saveJSON("ttt-history", history);
}

function renderScore() {
  scoreEls.nameX.textContent = displayName("X");
  scoreEls.nameO.textContent = displayName("O");
  scoreEls.x.textContent = String(scores.X);
  scoreEls.o.textContent = String(scores.O);
  scoreEls.draws.textContent = String(scores.draws);
  scoreEls.total.textContent = String(scores.X + scores.O + scores.draws);
  scoreEls.cardX.classList.toggle("is-leading", scores.X > scores.O);
  scoreEls.cardO.classList.toggle("is-leading", scores.O > scores.X);

  scoreEls.history.replaceChildren();
  if (history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "No matches yet";
    scoreEls.history.append(empty);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("li");
    const left = document.createElement("span");
    left.textContent = entry.outcome === "draw" ? "Draw" : `${entry.name} won`;
    const right = document.createElement("span");
    right.className = "history-meta";
    right.textContent = `${entry.size}×${entry.size} · ${entry.moves} moves`;
    item.append(left, right);
    scoreEls.history.append(item);
  });
}

function buildBoard() {
  boardEl.replaceChildren();
  boardEl.dataset.size = String(size);
  boardEl.style.setProperty("--size", String(size));
  cells = [];

  for (let index = 0; index < size * size; index += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.cell = String(index);
    button.addEventListener("click", () => play(index));
    boardEl.append(button);
    cells.push(button);
  }
}

function render() {
  const result = winnerOf(board, size);
  const draw = !result && board.every(Boolean);
  locked = Boolean(result || draw);

  cells.forEach((cell, index) => {
    const mark = board[index] || "";
    if (cell.dataset.mark !== mark) {
      cell.dataset.mark = mark;
      cell.textContent = mark;
    }
    cell.classList.toggle("is-win", Boolean(result && result.line.includes(index)));
    cell.disabled = locked || Boolean(mark);
    cell.setAttribute("aria-label", cellLabel(index, mark));
  });

  boardEl.classList.toggle("is-won", Boolean(result));
  boardEl.classList.toggle("is-draw", draw);
  cardX.classList.toggle("is-turn", !locked && current === "X");
  cardO.classList.toggle("is-turn", !locked && current === "O");
  cardX.classList.toggle("is-winner", result?.player === "X");
  cardO.classList.toggle("is-winner", result?.player === "O");

  statusEl.className = "status";
  statusEl.replaceChildren();

  if (result) {
    statusEl.classList.add("is-win");
    const name = document.createElement("span");
    name.className = "winner-name";
    name.textContent = displayName(result.player);
    statusEl.append(name, " wins");
  } else if (draw) {
    statusEl.classList.add("is-draw");
    statusEl.textContent = "Draw";
  } else {
    const name = document.createElement("span");
    name.className = "turn-name";
    name.textContent = displayName(current);
    statusEl.append(name, " to move");
  }

  renderScore();
  saveGame();
}

function play(index) {
  if (locked || board[index]) return;
  board[index] = current;
  const result = winnerOf(board, size);
  const draw = !result && board.every(Boolean);

  if (result) recordMatch(result.player);
  else if (draw) recordMatch("draw");
  else current = current === "X" ? "O" : "X";

  render();
}

function restart(options = {}) {
  board = Array(size * size).fill(null);
  current = "X";
  locked = false;
  buildBoard();
  render();
  if (options.focus && cells[0]) cells[0].focus();
}

function setSize(next) {
  if (![3, 4, 5].includes(next) || next === size) return;
  size = next;
  sizeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.size) === size));
  });
  localStorage.setItem("ttt-size", String(size));
  restart();
}

function applyTheme(theme) {
  const dark = theme !== "light";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeBtn.setAttribute("aria-pressed", String(dark));
  themeLabel.textContent = dark ? "Dark" : "Light";
  localStorage.setItem("ttt-theme", dark ? "dark" : "light");
}

themeBtn.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

nameX.addEventListener("input", () => {
  localStorage.setItem("ttt-name-x", nameX.value);
  render();
});

nameO.addEventListener("input", () => {
  localStorage.setItem("ttt-name-o", nameO.value);
  render();
});

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => setSize(Number(button.dataset.size)));
});

restartBtn.addEventListener("click", () => restart({ focus: true }));

scoreEls.reset.addEventListener("click", () => {
  if (!confirm("Reset all scores and match history?")) return;
  scores = { X: 0, O: 0, draws: 0 };
  history = [];
  saveJSON("ttt-scores", scores);
  saveJSON("ttt-history", history);
  renderScore();
});

const savedSize = Number(localStorage.getItem("ttt-size"));
if ([3, 4, 5].includes(savedSize)) size = savedSize;
nameX.value = localStorage.getItem("ttt-name-x") ?? "Player 1";
nameO.value = localStorage.getItem("ttt-name-o") ?? "Player 2";
sizeButtons.forEach((button) => {
  button.setAttribute("aria-pressed", String(Number(button.dataset.size) === size));
});
applyTheme(localStorage.getItem("ttt-theme") === "light" ? "light" : "dark");

const savedGame = loadGame();
if (savedGame) {
  board = savedGame.board;
  current = savedGame.current;
  buildBoard();
  render();
} else {
  restart();
}