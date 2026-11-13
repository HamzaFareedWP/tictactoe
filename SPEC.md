# Tic-Tac-Toe visual theme

The playable game is already in place: a 3×3 board, alternating X and O, wins on every row, column, and diagonal, and a restart that clears the board and returns the turn to X. This spec is only the look and motion.

Theme: **After hours**. A bar-top board under a warm lamp. Dark walnut, chalk-white X, lacquer-red O, gold for a win. Type is Fraunces for the title and marks, Outfit for the interface.

## Checklist

- [x] Center a single board on a dark walnut page with a warm lamp glow at the top and a faint gold wash at the bottom.
- [x] Set the title in Fraunces, with a small gold “After hours” kicker above it and an Outfit status line under it.
- [x] Style the board as a felt tray of nine raised tiles. X is chalk, O is lacquer red.
- [x] Animate a mark as it lands, and lift an empty tile on hover. Honor `prefers-reduced-motion`.
- [x] When someone wins, light the three winning tiles in gold. On a draw, fade both marks.
- [x] Style Restart as a quiet pill button that picks up the gold accent on hover and keyboard focus.
