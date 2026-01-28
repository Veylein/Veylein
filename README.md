## Veylein | Chaotic Wonderland

Interactive GitHub Pages–ready site with:
- Click-to-enter glitch entrance
- About section with playful pastel/glitch aesthetic
- Hidden easter-egg button that opens a mini canvas shooter
- Shooter: move (WASD/Arrows), shoot (Space), power-ups (Mulan Sword arc, AI Laser pierce), score + localStorage high score

### Structure
- `index.html` — main page
- `css/style.css` — styling
- `js/main.js` — entrance + interactions
- `js/game.js` — mini shooter
- `assets/` — drop your own images/sounds (optional)

### Run locally
Open `index.html` in a browser (no build step).

### Deploy to GitHub Pages
1. Push this repo.
2. In GitHub, Settings → Pages → Deploy from branch → `main` (or your branch), `/ (root)`.
3. Save — GitHub Pages will serve `index.html`.

### Customizing
- Update About content in `index.html`.
- Tweak colors in `css/style.css` (`--accent` etc.).
- Game tuning in `js/game.js` (speeds, spawn timing, power-ups).
