# GATE ECE Hub

A responsive, installable study companion for GATE ECE 2027 preparation. The Vite/React app includes a study dashboard, syllabus tracker, revision-note previews, curated video links, PYQ filters, mock-test flow, and a personal planner.

## Run locally

```powershell
npm install
npm run dev
```

Create a production bundle with `npm run build`; preview it with `npm run preview`.

## App behavior

- Study progress, completed subjects, bookmarks, offline-note selections, mock results, planner goals, and theme are saved in this browser using `localStorage`. Progress resumes when you return on the same browser and device.
- The service worker caches the app shell and same-origin assets for offline access after the first visit. Note content is bundled with the app.
- The PYQ and mock question bank is a small, clearly labelled local preview set. It is not a complete or verified archive of GATE questions; official question-paper and answer-key archives are linked from the app.
- The syllabus page links directly to the official GATE 2027 EC PDF and official syllabus index. Check the PDF for the authoritative topic scope.

## Official references

- [GATE 2027 EC syllabus PDF](https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EC_GATE2027_Syllabus.pdf)
- [GATE 2027 test papers and syllabus index](https://gate2027.iitm.ac.in/exam_papers_and_syllabus)
- [GATE 2026 question papers and answer keys](https://gate2026.iitg.ac.in/QPs-answer-keys.html)
