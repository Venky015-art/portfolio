# GATE ECE Hub

A responsive, installable study companion for GATE ECE 2027 preparation. The Vite/React app includes a study dashboard, syllabus tracker, revision-note previews, curated video links, PYQ filters, mock-test flow, and a personal planner.

## Run locally

```powershell
npm install
npm run dev
```

Create a production bundle with `npm run build`; preview it with `npm run preview`.

## App behavior

- Guest study progress, completed subjects, bookmarks, offline-note selections, mock results, planner goals, and theme are stored in this browser using `localStorage`.
- Firebase accounts sync study progress through Cloud Firestore. A first-time account starts with existing guest progress when it has no cloud save yet; each account's local cache is kept separate.
- The service worker caches the app shell and same-origin assets for offline access after the first visit. Note content is bundled with the app.
- The PYQ and mock question bank is a small, clearly labelled local preview set. It is not a complete or verified archive of GATE questions; official question-paper and answer-key archives are linked from the app.
- The syllabus page links directly to the official GATE 2027 EC PDF and official syllabus index. Check the PDF for the authoritative topic scope.

## Enable account sign-in and cloud sync

1. Create a Firebase project and add a Web app in the [Firebase Console](https://console.firebase.google.com/).
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. Create a **Cloud Firestore** database. Paste the contents of [`firestore.rules`](firestore.rules) into the Firestore Rules tab and publish them. These rules restrict each signed-in user to their own progress document.
4. Copy the Web app configuration values into the environment variables shown in [`.env.example`](.env.example). For local work, save them in `.env.local`. In Netlify, add the same variables under **Project configuration → Environment variables**.
5. Redeploy the Netlify site so Vite can include the Firebase web configuration. Then use **Sign in** in the app to create an account or log in.

The `VITE_FIREBASE_*` values are Firebase's public web-app configuration. Do not put a Firebase service-account key or other private server credentials in the frontend or Netlify's `VITE_` variables.

Without these values, the app remains usable as a guest and keeps progress on the current device. Guest progress is copied into a newly created account on its first successful sync.

## Official references

- [GATE 2027 EC syllabus PDF](https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EC_GATE2027_Syllabus.pdf)
- [GATE 2027 test papers and syllabus index](https://gate2027.iitm.ac.in/exam_papers_and_syllabus)
- [GATE 2026 question papers and answer keys](https://gate2026.iitg.ac.in/QPs-answer-keys.html)
