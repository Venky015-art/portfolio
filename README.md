# Venky015-art — Portfolio (Fresh Start)

This repository now contains a minimal portfolio starter site.

Files included:
- `index.html` — root page for the portfolio
- `styles.css` — minimal styling
- `script.js` — tiny script that renders example projects

Run locally:

PowerShell (simple static server using Node's http-server):
```powershell
npx http-server -c-1 -p 8000
# then open http://localhost:8000
```

Deploy:
- Push to GitHub and use GitHub Pages, or connect this repository to Netlify/Vercel.

Replace placeholder content in `index.html`, `styles.css`, and `script.js` with your real portfolio content.# Portfolio To‑Do App

This folder contains a small To‑Do web app integrated into the portfolio site (`todo.html`). It is mobile-first and optimized for Android as a Progressive Web App (PWA).

Files added:
- `todo.html` — To‑Do UI (mobile-first)
- `todo.css` — Styles
- `todo.js` — App logic (localStorage-backed)
- `manifest.json` — Web app manifest for install-to-home
- `sw.js` — Service worker for offline caching

New features:
- Due date & time: when adding a task you can set a date and optional time. Dates are shown under each task.
- Calendar view: tap the calendar button in the top-right to view a month calendar. Dates with tasks are highlighted. Click a day to filter tasks for that date.
- Settings: time format (12/24-hour) and option to show completed tasks in the calendar. Settings persist in `localStorage`.

How to test locally

1. Start a local HTTP server from `c:\gpt\portfolio` (required for service worker and manifest):

```powershell
cd c:\gpt\portfolio
# If Node.js is installed
npx http-server -p 8000
# Or, if Python is available
python -m http.server 8000
```

2. Open `http://localhost:8000/todo.html` in Chrome (or an Android device via network).
3. Try adding, editing (double-click/tap text), completing, and deleting tasks. Tasks are saved in `localStorage`.
4. To test PWA install behavior on Android: open the page in Chrome on Android, then use the install prompt or browser menu -> Install app (or tap the provided "Install" button if it appears).

Deploying

- Host with Netlify, Vercel, or GitHub Pages. Ensure `todo.html`, `manifest.json`, and `sw.js` are served from the root.

GitHub Pages Setup

1. Push your repository to GitHub (main branch).
2. In your GitHub repo settings → Pages, select:
   - Source: Deploy from a branch
   - Branch: gh-pages, folder: / (root)
3. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy on each push to `main`.
4. Your site will be live at: `https://<username>.github.io/<repo-name>/`

To enable PWA features on GitHub Pages:
- Ensure the domain is HTTPS (GitHub Pages provides this by default).
- The service worker will register and cache assets for offline use.
- Android users can install the app via Chrome menu → Install app (or the Install button on `todo.html`).

Notes

- The service worker caches the main assets for offline usage.
- The manifest uses PNG icons (192/512) for better Android install experience.
- All data (tasks, settings) is stored in localStorage and persists across sessions.
