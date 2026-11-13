const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const NAMES = [
  "Top left",
  "Top center",
  "Top right",
  "Middle left",
  "Center",
  "Middle right",
  "Bottom left",
  "Bottom center",
  "Bottom right",
];

const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restart");
const cells = [...boardEl.querySelectorAll("[data-cell]")];

let board = Array(9).fill(null);
let current = "X";
let locked = false;

function winnerOf(squares) {
  for (const line of LINES) {
    const [a, b, c] = line;
    const mark = squares[a];
    if (mark && mark === squares[b] && mark === squares[c]) {
      return { player: mark, line };
    }
  }
  return null;
}

function labelFor(index, mark) {
  return `${NAMES[index]}, ${mark || "empty"}`;
}

function render() {
  const result = winnerOf(board);
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
    cell.setAttribute("aria-label", labelFor(index, mark));
  });

  boardEl.classList.toggle("is-won", Boolean(result));
  boardEl.classList.toggle("is-draw", draw);
  statusEl.classList.toggle("is-win", Boolean(result));
  statusEl.classList.toggle("is-draw", draw);

  if (result) statusEl.textContent = `${result.player} wins`;
  else if (draw) statusEl.textContent = "Draw";
  else statusEl.textContent = `${current} to move`;
}

function play(index) {
  if (locked || board[index]) return;
  board[index] = current;
  const result = winnerOf(board);
  const draw = !result && board.every(Boolean);
  if (!result && !draw) current = current === "X" ? "O" : "X";
  render();
}

function restart() {
  board = Array(9).fill(null);
  current = "X";
  locked = false;
  render();
  cells[0].focus();
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => play(index));
});

restartBtn.addEventListener("click", restart);
render();
