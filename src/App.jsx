import { useEffect, useRef, useState } from 'react';
import { subjects, resources, questions, officialLinks, noteKinds, pyqYears, pyqPaperSets, pyqPdfUrl } from './data/study';
import { noteMaterials } from './data/notes';
import { generateMockQuestionSet } from './data/mockTests';

const NAV_GROUPS = [
  { label: 'Workspace', items: [{ id: 'home', label: 'Overview', icon: 'grid' }, { id: 'syllabus', label: 'Syllabus', icon: 'book' }, { id: 'notes', label: 'Free notes', icon: 'file' }, { id: 'resources', label: 'Video library', icon: 'play' }] },
  { label: 'Practice', items: [{ id: 'pyq', label: 'PYQ explorer', icon: 'search' }, { id: 'tests', label: 'Mock tests', icon: 'timer' }, { id: 'planner', label: 'Study planner', icon: 'calendar' }, { id: 'progress', label: 'My progress', icon: 'chart' }] },
];

const INITIAL_STATE = {
  studiedMinutes: 0,
  studySessions: [],
  completedSubjects: [],
  bookmarks: [],
  offlineNotes: [],
  answeredQuestions: [],
  tests: [],
  mockSetSequence: 0,
  mockVariantCursor: 0,
  targetRank: 'AIR <500',
  dailyGoal: 4,
};

const GUEST_STORAGE_KEY = 'ece-hub-state:guest';

function normalizeSavedState(state) {
  return { ...INITIAL_STATE, ...state };
}

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function getStudyStreak(sessions = []) {
  const studiedDays = new Set(sessions.map((session) => session.date));
  const cursor = new Date();
  if (!studiedDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate()-1);
  let streak = 0;
  while (studiedDays.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate()-1); }
  return streak;
}

function getWeekStudyMinutes(sessions = []) {
  const now = new Date();
  const monday = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  const totals = Array(7).fill(0);
  sessions.forEach((session) => {
    const [year,month,date] = session.date.split('-').map(Number);
    const studiedAt = new Date(year,month-1,date);
    const offset = Math.round((studiedAt-monday)/86400000);
    if (offset>=0 && offset<7) totals[offset] += session.minutes;
  });
  return totals;
}

function readSavedState(storageKey = GUEST_STORAGE_KEY) {
  try {
    const stored = localStorage.getItem(storageKey)
      ?? (storageKey === GUEST_STORAGE_KEY ? localStorage.getItem('ece-hub-state') : null)
      ?? '{}';
    return normalizeSavedState(JSON.parse(stored));
  } catch {
    return { ...INITIAL_STATE };
  }
}

function readSavedTheme() {
  try { return localStorage.getItem('ece-hub-theme') === 'dark'; }
  catch { return false; }
}

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    play: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 5V2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 5-6"/><path d="M16 7h3v3"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.6 8.6 8.6 0 1 0 20.5 14.5Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    bolt: <path d="m13 2-3 9h7l-6 11 2-9H6z"/>,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>;
}

function usePersistentState() {
  const [state, setState] = useState(() => readSavedState(GUEST_STORAGE_KEY));
  useEffect(() => { try { localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage can be unavailable in private browsing. */ } }, [state]);
  return [state, setState];
}

function App() {
  const [saved, setSaved] = usePersistentState();
  const [view, setView] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState('maths');
  const [dark, setDark] = useState(readSavedTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111b19' : '#f7f8f7');
    try { localStorage.setItem('ece-hub-theme', dark ? 'dark' : 'light'); } catch { /* Keep the chosen theme for this page session. */ }
  }, [dark]);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const handler = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const subject = subjects.find((item) => item.id === selectedSubject) || subjects[0];
  const navigate = (next) => { setView(next); setSidebarOpen(false); setModal(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openSubject = (id, next = 'syllabus') => { setSelectedSubject(id); navigate(next); };
  const startStudying = (id = selectedSubject) => {
    setSelectedSubject(id);
    setModal({ type: 'study', subjectId: id });
  };
  const setTarget = (targetRank) => setSaved((current) => ({ ...current, targetRank }));
  const setDailyGoal = (dailyGoal) => setSaved((current) => ({ ...current, dailyGoal: Math.max(1, Math.min(12, dailyGoal)) }));
  const startTest = (test = 'Quick diagnostic') => setModal({ type: 'test', test, startedAt: Date.now(), index: 0, answers: {} });
  const markSubjectComplete = (id) => {
    setSaved((current) => ({ ...current, completedSubjects: current.completedSubjects.includes(id) ? current.completedSubjects.filter((x) => x !== id) : [...current.completedSubjects, id] }));
  };
  const toggleBookmark = (id) => setSaved((current) => ({ ...current, bookmarks: current.bookmarks.includes(id) ? current.bookmarks.filter((x) => x !== id) : [...current.bookmarks, id] }));
  const toggleOffline = (id) => setSaved((current) => ({ ...current, offlineNotes: current.offlineNotes.includes(id) ? current.offlineNotes.filter((x) => x !== id) : [...current.offlineNotes, id] }));
  const submitSearch = (event) => { event.preventDefault(); setView('pyq'); setSidebarOpen(false); };

  return (
    <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
      <Sidebar view={view} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} saved={saved} onInstall={installPrompt ? async () => { await installPrompt.prompt(); setInstallPrompt(null); } : null} />
      <main className="main-shell">
        <header className="topbar">
          <button className="mobile-menu icon-action" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <form className="global-search" onSubmit={submitSearch} role="search">
            <Icon name="search" size={17} />
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects, topics, questions..." aria-label="Search study content" />
            <kbd>⌘ K</kbd>
          </form>
          <div className="top-actions">
            <button className="icon-action theme-toggle" aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} onClick={() => setDark((current) => !current)}><Icon name={dark ? 'sun' : 'moon'} /></button>
            <button className="icon-action notification-action" aria-label="Notifications" onClick={() => setNotice('You’re all caught up. New GATE updates will appear here.')}><Icon name="bell" /><span /></button>
          </div>
        </header>

        <div className="page-content">
          {view === 'home' && <HomeView saved={saved} onNavigate={navigate} onStudy={startStudying} onSubject={openSubject} onNotice={setNotice} />}
          {view === 'syllabus' && <SyllabusView saved={saved} subject={subject} onSelect={setSelectedSubject} onComplete={markSubjectComplete} onStudy={startStudying} />}
          {view === 'notes' && <NotesView saved={saved} subject={subject} onSelect={setSelectedSubject} onRead={(kind) => setModal({ type: 'note', subject, kind })} onOffline={toggleOffline} onBookmark={toggleBookmark} />}
          {view === 'resources' && <ResourcesView onPlay={(video) => setModal({ type: 'video', video })} />}
          {view === 'pyq' && <PyqView saved={saved} initialQuery={query} onBookmark={toggleBookmark} onTest={startTest} />}
          {view === 'tests' && <TestsView saved={saved} onStart={startTest} />}
          {view === 'planner' && <PlannerView saved={saved} onTarget={setTarget} onDailyGoal={setDailyGoal} onNavigate={navigate} onSubject={(id) => openSubject(id,'syllabus')} />}
          {view === 'progress' && <ProgressView saved={saved} onNavigate={navigate} onSubject={(id) => openSubject(id,'syllabus')} />}
        </div>
        <footer className="app-footer"><span>Made for focused, free GATE ECE prep.</span><a href={officialLinks.syllabus} target="_blank" rel="noreferrer">Official GATE 2027 source <Icon name="external" size={13} /></a></footer>
      </main>
      <MobileNav view={view} onNavigate={navigate} />
      {modal && <Modal modal={modal} saved={saved} onClose={() => setModal(null)} onStudyDone={(minutes) => { setSaved((current) => ({ ...current, studiedMinutes: current.studiedMinutes + minutes, studySessions: [...current.studySessions, { date: dayKey(new Date()), minutes }] })); setNotice(`${minutes} focused minutes added to your progress.`); setModal(null); }} onTestDone={(result) => { setSaved((current) => ({ ...current, tests: [result, ...current.tests].slice(0, 20), mockSetSequence: (current.mockSetSequence || 0) + 1, mockVariantCursor: (current.mockVariantCursor || 0) + result.total })); setModal({ type: 'result', result }); }} onNextTest={(test) => setModal({ type: 'test', test })} />}
      {notice && <div className="toast" role="status"><span className="toast-dot" />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><Icon name="close" size={15} /></button></div>}
    </div>
  );
}

function Sidebar({ view, onNavigate, open, onClose, saved, onInstall }) {
  return <><div className={`sidebar-scrim ${open ? 'is-visible' : ''}`} onClick={onClose} />
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => onNavigate('home')}><span className="brand-mark"><span /><span /><span /><span /></span><span><strong>GATE ECE</strong><small>STUDY HUB</small></span></button>
      <div className="exam-chip"><span className="live-dot" /><span>PREPARING FOR</span><strong>GATE 2027</strong><span className="chip-arrow">↗</span></div>
      <nav className="side-nav" aria-label="Main navigation">{NAV_GROUPS.map((group) => <div className="nav-group" key={group.label}><p className="nav-group-label">{group.label}</p>{group.items.map((item) => <button key={item.id} className={`side-nav-item ${view === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'pyq' && <span className="nav-badge">NEW</span>}</button>)}</div>)}</nav>
      <div className="sidebar-spacer" />
      <div className="offline-card"><div className="offline-icon"><Icon name="download" size={16} /></div><div><strong>Study anywhere</strong><span>{saved.offlineNotes.length ? `${saved.offlineNotes.length} note${saved.offlineNotes.length === 1 ? '' : 's'} saved offline` : 'Save notes for offline'}</span></div>{onInstall && <button onClick={onInstall} aria-label="Install app"><Icon name="arrow" size={15} /></button>}</div>
      <div className="sidebar-quote"><span>✳</span><p>Little progress each day adds up to big results.</p><small>YOUR STUDY COMPANION</small></div>
      <div className="sidebar-bottom"><span className="sidebar-save-mark"><Icon name="check" size={15} /></span><span className="sidebar-status-copy"><strong>Local progress</strong><small>Saved on this device</small></span></div>
    </aside>
  </>;
}

function PageHeading({ eyebrow, title, copy, action }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="heading-copy">{copy}</p>}</div>{action}</div>;
}

function HomeView({ saved, onNavigate, onStudy, onSubject, onNotice }) {
  const doneCount = saved.completedSubjects.length;
  const streak = getStudyStreak(saved.studySessions);
  const subjectProgress = Math.round((doneCount / subjects.length) * 100);
  const day = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  return <>
    <div className="welcome-line"><span>{day}</span><span className="welcome-message">Your next rank starts with today.</span></div>
    <section className="hero-banner">
      <div className="hero-copy-block"><div className="hero-label"><span className="live-dot" /> GATE 2027 · ECE PREP</div><h1>Make every<br /><em>concept count.</em></h1><p>A focused place to learn, practise, and track your GATE ECE preparation — completely free.</p><div className="hero-ctas"><button className="button button-primary" onClick={() => onStudy('maths')}>Start preparing free <Icon name="arrow" size={17} /></button><button className="button button-quiet" onClick={() => onNavigate('syllabus')}>Explore syllabus</button></div><div className="hero-trust"><span className="avatar-stack"><i>A</i><i>R</i><i>S</i></span><span>Built for the long game</span><span className="trust-star">✳</span><span>100% free, always</span></div></div>
      <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="atom atom-a">∿<small>EC</small></div><div className="atom atom-b">π<small>EM</small></div><div className="atom atom-c">ƒ<small>SS</small></div><div className="hero-score-card"><span className="score-kicker">YOUR PREP SCORE</span><div className="score-value">{subjectProgress}<small>%</small><span className="score-trend">↗ 4.8%</span></div><div className="score-bars"><i style={{height:'32%'}}/><i style={{height:'47%'}}/><i style={{height:'39%'}}/><i style={{height:'66%'}}/><i style={{height:'58%'}}/><i style={{height:'78%'}}/><i style={{height:'95%'}}/></div><span className="score-caption">Keep your momentum going</span></div><span className="visual-caption">ONE SESSION AT A TIME</span></div>
      <div className="hero-watermark">ECE</div>
    </section>

    <div className="stats-grid"><StatCard icon="bolt" label="Study streak" value={`${streak} days`} note={streak ? 'Keep your daily rhythm' : 'Start a streak today'} tone="orange"/><StatCard icon="timer" label="Hours studied" value={`${Math.floor(saved.studiedMinutes / 60)}h ${saved.studiedMinutes % 60}m`} note={`This week · goal ${saved.dailyGoal*7}h`} tone="blue"/><StatCard icon="book" label="Subjects covered" value={`${doneCount} / ${subjects.length}`} note="Keep ticking them off" tone="purple"/><StatCard icon="chart" label="Mock accuracy" value={`${saved.tests[0]?.score ?? '—'}${saved.tests.length ? '%' : ''}`} note={saved.tests.length ? `${saved.tests.length} tests completed` : 'Take your first mock'} tone="green"/></div>

    <div className="home-columns">
      <section className="content-card continue-card"><div className="section-heading"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Continue learning</h2></div><button className="text-link" onClick={() => onNavigate('syllabus')}>All subjects <Icon name="arrow" size={14} /></button></div><div className="continue-subject"><div className="subject-orb orb-math">∫</div><div className="continue-copy"><span className="subject-kicker">ENGINEERING MATHEMATICS · 8 TOPICS</span><h3>Linear Algebra</h3><div className="progress-track"><i style={{width:'58%'}}/></div><small>58% complete <span>·</span> 22 min left</small></div><button className="round-arrow" onClick={() => onSubject('maths','syllabus')} aria-label="Continue Engineering Mathematics"><Icon name="arrow" size={17}/></button></div><div className="subject-shortcuts">{subjects.slice(1,4).map((item) => <button key={item.id} onClick={() => onSubject(item.id,'syllabus')}><span className={`mini-subject-icon tone-${item.tone}`}>{item.symbol}</span><span>{item.short}</span><span className="shortcut-progress">{item.progress}%</span></button>)}</div></section>
      <DailyQuestion onNotice={onNotice} />
    </div>

    <div className="home-columns lower-columns"><section className="content-card syllabus-card"><div className="section-heading"><div><p className="eyebrow">THE ROADMAP</p><h2>Your syllabus</h2></div><button className="icon-link" aria-label="Open syllabus" onClick={() => onNavigate('syllabus')}><Icon name="arrow" size={16}/></button></div><div className="syllabus-overview"><div className="progress-ring" style={{'--progress': `${subjectProgress}%`}}><div><strong>{subjectProgress}%</strong><small>covered</small></div></div><div><strong>{doneCount} of {subjects.length} subjects completed</strong><p>Small, steady sessions make the syllabus feel lighter.</p><button className="text-link" onClick={() => onNavigate('syllabus')}>View your roadmap <Icon name="arrow" size={14}/></button></div></div><div className="subject-mini-grid">{subjects.slice(0,6).map((item) => <button key={item.id} onClick={() => onSubject(item.id,'syllabus')} className={saved.completedSubjects.includes(item.id) ? 'is-done' : ''}><i className={`subject-dot tone-${item.tone}`}>{saved.completedSubjects.includes(item.id) ? <Icon name="check" size={11}/> : item.symbol}</i><span>{item.short}</span><small>{item.progress}%</small></button>)}</div></section>
      <section className="content-card updates-card"><div className="section-heading"><div><p className="eyebrow">STAY IN THE LOOP</p><h2>Latest updates</h2></div><span className="new-pill">2 new</span></div><a href={officialLinks.syllabus} target="_blank" rel="noreferrer" className="update-row"><span className="update-badge badge-violet">✳</span><span><strong>GATE 2027 syllabus has been revised</strong><small>Check the official EC syllabus before planning · 12 Oct</small></span><Icon name="external" size={14}/></a><a href={officialLinks.papers2026} target="_blank" rel="noreferrer" className="update-row"><span className="update-badge badge-green">↗</span><span><strong>GATE 2026 papers & answer keys are out</strong><small>Open the official archive to download · 18 Mar</small></span><Icon name="external" size={14}/></a><button className="text-link all-updates" onClick={() => onNotice('You are viewing the latest official GATE links.')}>All notifications <Icon name="arrow" size={14}/></button></section></div>

    <section className="video-strip"><div><span className="video-strip-icon"><Icon name="play" size={18}/></span><div><p className="eyebrow">CURATED, FREE & IN ENGLISH</p><h2>Good teachers. Zero paywall.</h2><p>Reputed channels, organised by subject so you can spend less time searching.</p></div></div><button className="button button-light" onClick={() => onNavigate('resources')}>Explore video library <Icon name="arrow" size={15}/></button></section>
  </>;
}

function StatCard({ icon, label, value, note, tone }) { return <article className="stat-card"><div className={`stat-icon tone-bg-${tone}`}><Icon name={icon} size={17}/></div><div className="stat-main"><span>{label}</span><strong>{value}</strong><small>{note}</small></div><span className={`stat-spark spark-${tone}`}><i/><i/><i/><i/><i/><i/></span></article>; }

function SyllabusView({ saved, subject, onSelect, onComplete, onStudy }) {
  return <><PageHeading eyebrow="YOUR ROADMAP" title="Current GATE 2027 syllabus" copy="Stay aligned with the revised official syllabus. Track your coverage, one topic at a time." action={<a className="button button-outline" href={officialLinks.syllabus} target="_blank" rel="noreferrer">Official syllabus <Icon name="external" size={14}/></a>} />
    <div className="official-callout"><span className="callout-icon">✳</span><div><strong>Always in sync with the official source</strong><p>The GATE 2027 organizing institute has revised the test paper syllabi. This page links directly to the latest EC syllabus PDF.</p></div><span className="source-chip">IIT MADRAS · OFFICIAL</span></div>
    <div className="syllabus-layout"><div className="subject-list-card content-card"><div className="list-card-head"><span>SUBJECTS <small>({subjects.length})</small></span><span>{saved.completedSubjects.length} done</span></div>{subjects.map((item,index) => <button className={`subject-list-row ${subject.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => onSelect(item.id)}><span className={`subject-list-symbol tone-${item.tone}`}>{item.symbol}</span><span className="subject-row-info"><strong>{item.name}</strong><small>{item.topics.length} topics · {item.weight}</small><i className="subject-row-track"><b style={{width:`${item.progress}%`}}/></i></span><span className="subject-row-percent">{saved.completedSubjects.includes(item.id) ? <Icon name="check" size={14}/> : `${item.progress}%`}</span></button>)}</div>
      <section className="subject-detail content-card"><div className={`subject-detail-banner tone-bg-${subject.tone}`}><span className="detail-symbol">{subject.symbol}</span><div><span className="eyebrow">SUBJECT {String(subjects.findIndex((item)=>item.id===subject.id)+1).padStart(2,'0')} · {subject.weight.toUpperCase()}</span><h2>{subject.name}</h2><p>{subject.description}</p></div><span className="detail-progress">{saved.completedSubjects.includes(subject.id) ? 'Complete' : `${subject.progress}% covered`}</span></div><div className="detail-section-head"><div><p className="eyebrow">TOPIC CHECKLIST</p><h3>What you’ll cover</h3></div><span className="topic-count">{subject.topics.length} topics</span></div><div className="topic-grid">{subject.topics.map((topic,index) => <button key={topic} className={`topic-row ${(saved.completedSubjects.includes(subject.id) && index < Math.ceil(subject.topics.length*.62)) ? 'topic-done' : ''}`} onClick={() => onStudy(subject.id)}><span className="topic-checkbox">{saved.completedSubjects.includes(subject.id) && index < Math.ceil(subject.topics.length*.62) ? <Icon name="check" size={12}/> : null}</span><span>{topic}</span><Icon name="arrow" size={13}/></button>)}</div><div className="detail-footer"><a href={officialLinks.syllabus} target="_blank" rel="noreferrer" className="text-link">Open official EC syllabus PDF <Icon name="external" size={13}/></a><button className={`button ${saved.completedSubjects.includes(subject.id) ? 'button-success' : 'button-primary'}`} onClick={() => onComplete(subject.id)}>{saved.completedSubjects.includes(subject.id) ? <><Icon name="check" size={15}/> Mark as in progress</> : <>Mark subject complete <Icon name="check" size={15}/></>}</button></div></section></div>
    <div className="disclaimer-line"><Icon name="bolt" size={14}/> Subject topics are a study outline. Always confirm exact scope with the official PDF.</div>
  </>;
}

function NotesView({ saved, subject, onSelect, onRead, onOffline, onBookmark }) {
  const selectedOffline = noteKinds.filter((kind) => saved.offlineNotes.includes(`${subject.id}-${kind.id}`)).length;
  return <><PageHeading eyebrow="THE STUDY LIBRARY" title="Free notes, made useful." copy="A tidy shelf for every subject. Find the right format for the way you study." action={<span className="offline-status"><Icon name="download" size={15}/> {selectedOffline} saved offline</span>} />
    <div className="subject-filter-row">{subjects.map((item)=><button key={item.id} className={`filter-chip ${subject.id===item.id?'active':''}`} onClick={()=>onSelect(item.id)}><span className={`chip-symbol tone-${item.tone}`}>{item.symbol}</span>{item.short}</button>)}</div>
    <div className="notes-subject-head"><div className={`subject-symbol-large tone-bg-${subject.tone}`}>{subject.symbol}</div><div><span className="eyebrow">{subject.weight.toUpperCase()} · {subject.topics.length} CORE TOPICS</span><h2>{subject.name}</h2><p>{subject.description}</p></div><button className="button button-outline" onClick={()=>onRead('short')}>Start revising <Icon name="arrow" size={14}/></button></div>
    <div className="notes-grid">{noteKinds.map((kind,index)=>{const id=`${subject.id}-${kind.id}`;const isOffline=saved.offlineNotes.includes(id);const isBookmarked=saved.bookmarks.includes(id);return <article className={`note-card note-accent-${index}`} key={kind.id}><div className="note-card-top"><span className={`note-icon note-icon-${index}`}>{kind.symbol}</span><button className={`bookmark-button ${isBookmarked?'is-bookmarked':''}`} aria-label={isBookmarked?'Remove bookmark':'Bookmark note'} onClick={()=>onBookmark(id)}><Icon name="bookmark" size={16}/></button></div><span className="eyebrow">{kind.label}</span><h3>{kind.title(subject.short)}</h3><p>{kind.description}</p><div className="note-card-meta"><span><Icon name="file" size={13}/>{kind.meta}</span><span>{kind.duration}</span></div><div className="note-card-actions"><button className="button button-outline" onClick={()=>onRead(kind.id)}>Read notes <Icon name="arrow" size={13}/></button><button className={`offline-save ${isOffline?'saved':''}`} onClick={()=>onOffline(id)} aria-label={isOffline?'Remove offline copy':'Save offline'}><Icon name={isOffline?'check':'download'} size={15}/>{isOffline?'Saved':'Offline'}</button></div></article>;})}</div>
    {saved.offlineNotes.length>0&&<div className="offline-note-banner"><span><Icon name="download" size={16}/></span><p><strong>{saved.offlineNotes.length} note{saved.offlineNotes.length===1?'':'s'} ready for offline study.</strong> Your saved reading list stays on this device.</p><span className="local-only-label">ON THIS DEVICE</span></div>}
  </>;
}

function getYouTubeVideo(input) {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) return null;
    const videoId = host === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
    if (videoId && /^[\w-]{11}$/.test(videoId)) return { id: videoId, kind: 'video', title: 'YouTube video', fallbackUrl: `https://www.youtube.com/watch?v=${videoId}` };
    const playlistId = url.searchParams.get('list');
    if (playlistId && /^[\w-]{10,128}$/.test(playlistId)) return { id: playlistId, kind: 'playlist', title: 'YouTube playlist', fallbackUrl: `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}` };
  } catch { /* Invalid links are reported in the form. */ }
  return null;
}

function ResourcesView({ onPlay }) {
  const groups = [...new Set(resources.map((item) => item.subject))];
  const [videoLink, setVideoLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const submitLink = (event) => {
    event.preventDefault();
    const video = getYouTubeVideo(videoLink);
    if (!video) { setLinkError('Paste a valid YouTube video or playlist URL.'); return; }
    setLinkError('');
    onPlay(video);
  };
  return <><PageHeading eyebrow="THE GOOD STUFF, WITHOUT THE SCROLL" title="Learn from the best." copy="Free English resources from trusted creators, organised around your GATE ECE subjects." action={<span className="free-badge">✳ 100% FREE</span>} />
    <div className="resource-feature"><div className="resource-feature-orbit">▶</div><div><span className="eyebrow">YOUR FREE VIDEO LIBRARY</span><h2>Quality learning,<br/>without the noise.</h2><p>Hand-picked channels. Clear explanations. No paid-course detours.</p></div><div className="resource-stats"><span><strong>08</strong><small>SUBJECTS</small></span><i/><span><strong>06</strong><small>CHANNELS</small></span><i/><span><strong>FREE</strong><small>ALWAYS</small></span></div></div>
    <form className="resource-player-form" onSubmit={submitLink}>
      <div className="resource-player-copy"><span className="eyebrow">WATCH WITHOUT LEAVING</span><strong>Play a YouTube video or playlist here</strong><small>Paste a link to keep studying in the hub.</small></div>
      <div className="resource-player-input"><input type="url" value={videoLink} onChange={(event) => { setVideoLink(event.target.value); setLinkError(''); }} placeholder="https://youtube.com/watch?v=…" aria-label="YouTube video or playlist URL" aria-invalid={Boolean(linkError)} /><button className="button button-primary" type="submit"><Icon name="play" size={14}/> Play here</button></div>
      {linkError && <span className="resource-player-error" role="alert">{linkError}</span>}
    </form>
    <div className="resource-subject-grid">{groups.map((group,index)=><article className="resource-card" key={group}><div className="resource-card-head"><span className={`resource-number rn-${index}`}>{String(index+1).padStart(2,'0')}</span><div><span className="eyebrow">SUBJECT {String(index+1).padStart(2,'0')}</span><h3>{group}</h3></div><span className="resource-count">{resources.filter((x)=>x.subject===group).length} channels</span></div><div className="channel-list">{resources.filter((x)=>x.subject===group).map((resource)=>resource.videoId ? <button key={resource.channel} type="button" className="channel-row channel-row-playable" onClick={()=>onPlay({id:resource.videoId,kind:'video',title:resource.videoTitle,channel:resource.channel,fallbackUrl:`https://www.youtube.com/watch?v=${resource.videoId}`})}><span className={`channel-avatar channel-${resource.brand}`}>{resource.channel.charAt(0)}</span><span><strong>{resource.channel}</strong><small>{resource.videoTitle}</small></span><span className="language-pill">EN</span><span className="watch-here-label"><Icon name="play" size={13}/> PLAY</span></button> : <a key={resource.channel} href={resource.url} target="_blank" rel="noreferrer" className="channel-row"><span className={`channel-avatar channel-${resource.brand}`}>{resource.channel.charAt(0)}</span><span><strong>{resource.channel}</strong><small>{resource.note}</small></span><span className="language-pill">EN</span><Icon name="external" size={14}/></a>)}</div><div className="resource-card-foot"><span><i className="verified-dot"/> ENGLISH · FREE TO WATCH</span><Icon name="play" size={14}/></div></article>)}</div>
    <div className="resource-note"><span>ⓘ</span><p>Embedded playback is provided by YouTube. Some videos may require YouTube or have embedding disabled by the creator.</p></div>
  </>;
}

function PyqView({ saved, initialQuery, onBookmark, onTest }) {
  const [subjectFilter,setSubjectFilter]=useState('All subjects');
  const [topicFilter,setTopicFilter]=useState('All topics');
  const [difficultyFilter,setDifficultyFilter]=useState('All levels');
  const [yearFilter,setYearFilter]=useState('All years');
  const [marksFilter,setMarksFilter]=useState('Any marks');
  const [archiveYear,setArchiveYear]=useState('2026');
  const [paperSet,setPaperSet]=useState('Main paper');
  const [search,setSearch]=useState(initialQuery);
  useEffect(()=>setSearch(initialQuery),[initialQuery]);
  const topics = subjectFilter==='All subjects' ? [...new Set(questions.map((q)=>q.topic))] : [...new Set(questions.filter((q)=>q.subject===subjectFilter).map((q)=>q.topic))];
  const filtered = questions.filter((q)=> (subjectFilter==='All subjects'||q.subject===subjectFilter)&&(topicFilter==='All topics'||q.topic===topicFilter)&&(difficultyFilter==='All levels'||q.difficulty===difficultyFilter)&&(yearFilter==='All years'||String(q.year)===yearFilter)&&(marksFilter==='Any marks'||String(q.marks)===marksFilter)&&(!search||`${q.subject} ${q.topic} ${q.question} ${q.year}`.toLowerCase().includes(search.toLowerCase())));
  const paperSets=pyqPaperSets(archiveYear);
  const pdfUrl=pyqPdfUrl(archiveYear,paperSet==='Main paper'?'':paperSet);
  const example = () => { setSearch('MOSFET');setSubjectFilter('Electronic Devices');setTopicFilter('All topics');setYearFilter('All years'); };
  return <><PageHeading eyebrow="SMARTER PRACTICE STARTS HERE" title="Find your next question." copy="Choose a year and open its full paper with the answer key in the viewer. Topic filters below are a separate practice preview." action={<span className="free-badge">2007–2026 · KEY INCLUDED</span>} />
    <div className="pyq-banner"><span className="pyq-spark">⌕</span><div><strong>Ask a better question.</strong><p>Try <button onClick={example}>“Show all MOSFET questions from 2015–2026.”</button> to see the topic filters in action.</p></div><span className="demo-tag">PRACTICE PREVIEW</span></div>
    <section className="content-card paper-library"><div className="paper-library-heading"><div><p className="eyebrow">FULL PAPER ARCHIVE</p><h2>Questions and answers, together.</h2><p>Choose any year from 2007–2026. The answer key is included at the end of each free PDF.</p></div><span className="paper-library-count"><strong>20</strong><small>YEARS</small></span></div><div className="paper-library-controls"><label>Exam year<select value={archiveYear} onChange={(event)=>{setArchiveYear(event.target.value);setPaperSet(pyqPaperSets(event.target.value)[0]);}}>{pyqYears.map((year)=><option key={year} value={year}>{year}</option>)}</select></label><label>Paper set<select value={paperSet} onChange={(event)=>setPaperSet(event.target.value)}>{paperSets.map((set)=><option key={set}>{set}</option>)}</select></label><div className="paper-answer-note"><span className="answer-check"><Icon name="check" size={12}/></span><span><strong>Answer key included</strong><small>Scroll to the last pages in the PDF</small></span></div></div><div className="paper-viewer-heading"><span><strong>GATE ECE {archiveYear}</strong><small>{paperSet==='Main paper'?'Question paper':paperSet} · Answer key at end</small></span><span className="paper-viewer-source">FREE PDF · EMBEDDED</span></div><div className="paper-viewer"><iframe key={pdfUrl} src={pdfUrl} title={`GATE ECE ${archiveYear} ${paperSet} question paper and answer key`} loading="lazy" referrerPolicy="no-referrer" /></div><div className="paper-library-foot"><span>PDF provided by <a href={officialLinks.pyqPdfArchive} target="_blank" rel="noreferrer">ExamGOAL’s free GATE ECE archive</a>.</span><span>For years with multiple sets, select a set above.</span></div></section>
    <section className="content-card filters-card"><div className="filter-heading"><div><span className="eyebrow">BUILD YOUR QUESTION SET</span><h2>Filter practice questions</h2></div><button className="clear-filters" onClick={()=>{setSubjectFilter('All subjects');setTopicFilter('All topics');setDifficultyFilter('All levels');setYearFilter('All years');setMarksFilter('Any marks');setSearch('');}}>Clear filters <Icon name="close" size={13}/></button></div><div className="filter-controls"><label>Subject<select value={subjectFilter} onChange={(e)=>{setSubjectFilter(e.target.value);setTopicFilter('All topics');}}><option>All subjects</option>{subjects.map((s)=><option key={s.id}>{s.name}</option>)}</select></label><label>Topic<select value={topicFilter} onChange={(e)=>setTopicFilter(e.target.value)}><option>All topics</option>{topics.map((topic)=><option key={topic}>{topic}</option>)}</select></label><label>Difficulty<select value={difficultyFilter} onChange={(e)=>setDifficultyFilter(e.target.value)}><option>All levels</option>{['Easy','Medium','Hard'].map((x)=><option key={x}>{x}</option>)}</select></label><label>Year<select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)}><option>All years</option>{pyqYears.map((year)=><option key={year}>{year}</option>)}</select></label><label>Marks<select value={marksFilter} onChange={(e)=>setMarksFilter(e.target.value)}><option>Any marks</option><option value="1">1 mark</option><option value="2">2 marks</option></select></label><label className="filter-search">Search<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="MOSFET, bandwidth..."/></label></div><div className="results-summary"><span><strong>{filtered.length}</strong> sample questions</span><span className="small-dot"/> <span>From the local preview bank</span><span className="results-spacer"/><button onClick={()=>onTest('Filtered practice set')} className="text-link">Practice this set <Icon name="arrow" size={14}/></button></div></section>
    <div className="question-list">{filtered.map((item,index)=><article className="question-card" key={item.id}><div className="question-number">{String(index+1).padStart(2,'0')}</div><div className="question-content"><div className="question-tags"><span>{item.subject}</span><span>{item.topic}</span><span className={`difficulty-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span></div><p>{item.question}</p><div className="question-options">{item.options.map((option,optionIndex)=><span key={optionIndex}><i>{String.fromCharCode(65+optionIndex)}</i>{option}</span>)}</div><details className="solution-details"><summary>View solution</summary><p>{item.solution}</p></details></div><div className="question-side"><span>{item.marks} MARK{item.marks===1?'':'S'}</span><small>{item.year} · Practice preview</small><button className={`bookmark-button ${saved.bookmarks.includes(item.id)?'is-bookmarked':''}`} onClick={()=>onBookmark(item.id)} aria-label="Bookmark question"><Icon name="bookmark" size={16}/></button></div></article>)}{filtered.length===0&&<div className="empty-state"><span className="empty-search"><Icon name="search" size={22}/></span><h3>No tagged questions in this preview yet.</h3><p>The PDF viewer above contains the complete year-wise paper and answer key. This smaller bank adds searchable topic and difficulty filters.</p></div>}</div>
  </>;
}
function TestsView({ saved, onStart }) {
  const testSubjects=['Digital Electronics','Analog Circuits','Signals & Systems','Communication Systems','Control Systems','Network Theory','Electronic Devices','Engineering Mathematics'];
  const latest=saved.tests[0];
  return <><PageHeading eyebrow="BUILT FOR EXAM DAY" title="Practice with a purpose." copy="Choose a subject or full-length test built from recurring PYQ topics. Each completed attempt unlocks a fresh set." action={<span className="free-badge">✳ NO PAYWALL. EVER.</span>} />
    <section className="full-mock-banner"><div className="mock-banner-art"><span>65</span><i>Q</i></div><div className="mock-banner-content"><span className="eyebrow">THE FULL EXPERIENCE</span><h2>Full-length GATE mock</h2><p>Three hours. Sixty-five questions. A calm, focused exam environment.</p><div className="mock-specs"><span><Icon name="timer" size={14}/> 3 hours</span><span><Icon name="bolt" size={14}/> Negative marking</span><span><Icon name="chart" size={14}/> Detailed analysis</span><span><Icon name="check" size={14}/> Auto-submit</span></div></div><button className="button button-primary" onClick={()=>onStart('Full-length mock')}>Start full mock <Icon name="arrow" size={15}/></button><div className="mock-banner-grid"/></section>
    <div className="tests-layout"><section className="content-card subject-tests-card"><div className="section-heading"><div><p className="eyebrow">SHORT ON TIME?</p><h2>Subject tests</h2></div><span className="test-duration-label">10 QUESTIONS · 20 MIN</span></div><p className="section-intro">Zero in on one subject, build confidence, and get quick feedback.</p><div className="test-subject-grid">{testSubjects.map((name,index)=>{const item=subjects.find((x)=>x.name===name)||subjects.find((x)=>x.short.startsWith(name.split(' ')[0].slice(0,2).toUpperCase()));return <button className="test-subject" key={name} onClick={()=>onStart(`${name} subject test`)}><span className={`mini-subject-icon tone-${item?.tone||'blue'}`}>{item?.symbol||'∿'}</span><span><strong>{name}</strong><small>10 questions · mixed difficulty</small></span><span className="test-arrow"><Icon name="arrow" size={14}/></span></button>;})}</div></section>
      <aside className="content-card recent-test-card"><div className="section-heading"><div><p className="eyebrow">KEEP YOUR EDGE</p><h2>Recent attempts</h2></div><span className="history-icon"><Icon name="chart" size={16}/></span></div>{saved.tests.length===0?<div className="no-attempts"><span className="empty-ring"><Icon name="timer" size={20}/></span><strong>Your first score is a starting point.</strong><p>Take a quick diagnostic to see where you are today.</p><button className="text-link" onClick={()=>onStart('Quick diagnostic')}>Start a quick test <Icon name="arrow" size={13}/></button></div>:<div className="recent-test-content"><div className="recent-score"><strong>{latest.score}%</strong><span>latest accuracy</span><small>{latest.name} · {latest.date}</small></div><div className="recent-insights"><span><b>{latest.correct}</b> correct</span><span><b>{latest.wrong}</b> to review</span><span><b>{latest.duration}</b> used</span></div><button className="button button-outline full-button" onClick={()=>onStart('Quick diagnostic')}>Take another test <Icon name="arrow" size={14}/></button></div>}</aside></div>
    <div className="test-analysis-note"><span><Icon name="chart" size={16}/></span><p><strong>Fresh sets, recurring PYQ concepts.</strong> Each attempt uses original question variants with new values and wording; these are not copied past-paper questions.</p><button className="text-link" onClick={()=>onStart('Quick diagnostic')}>Try a sample <Icon name="arrow" size={13}/></button></div>
  </>;
}

function PlannerView({ saved, onTarget, onDailyGoal, onNavigate, onSubject }) {
  const week = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const monday = new Date();
  monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
  const weekLabel = new Intl.DateTimeFormat('en-IN',{month:'long',day:'numeric',year:'numeric'}).format(monday);
  const tasks = [{day:'Mon',subject:'Network Theory',task:'Nodal analysis + 10 PYQs',time:'2h'}, {day:'Tue',subject:'Engineering Mathematics',task:'Eigenvalues & eigenvectors',time:'2h'}, {day:'Wed',subject:'Analog Circuits',task:'BJT biasing · revise notes',time:'2.5h'}, {day:'Thu',subject:'Signals & Systems',task:'Fourier transform practice',time:'2h'}, {day:'Fri',subject:'Digital Circuits',task:'Sequential logic · subject test',time:'2.5h'}, {day:'Sat',subject:'Communication Systems',task:'AM / FM problem set',time:'3h'}, {day:'Sun',subject:'Weekly review',task:'Mock test + weak topic review',time:'3h'}];
  const rankPlan = saved.targetRank === 'AIR <100' ? 'intensive' : saved.targetRank === 'AIR <1000' ? 'balanced' : 'focused';
  return <><PageHeading eyebrow="A PLAN YOU CAN ACTUALLY FOLLOW" title="Your study plan." copy="A realistic weekly rhythm, tuned to your target rank and your daily study goal." action={<span className="plan-live"><i/> GENERATED FOR YOU</span>} />
    <div className="planner-layout"><section className="content-card planner-controls"><span className="eyebrow">FIRST, SET YOUR TARGET</span><h2>What are you aiming for?</h2><p>A target gives your plan a useful pace. You can change it anytime.</p><div className="rank-options">{[{rank:'AIR <100',tag:'AMBITIOUS',pace:'32 hrs / week'},{rank:'AIR <500',tag:'STEADY',pace:'28 hrs / week'},{rank:'AIR <1000',tag:'BALANCED',pace:'22 hrs / week'}].map((option)=><button className={`rank-option ${saved.targetRank===option.rank?'selected':''}`} key={option.rank} onClick={()=>onTarget(option.rank)}><span className="radio"><i/></span><span><strong>{option.rank}</strong><small>{option.tag}</small></span><span className="rank-pace">{option.pace}</span></button>)}</div><div className="goal-setting"><span><strong>Daily study goal</strong><small>Keep the pace sustainable.</small></span><div className="goal-stepper"><button onClick={()=>onDailyGoal(saved.dailyGoal-1)} aria-label="Decrease daily study goal" disabled={saved.dailyGoal<=1}>−</button><strong>{saved.dailyGoal}h</strong><button onClick={()=>onDailyGoal(saved.dailyGoal+1)} aria-label="Increase daily study goal" disabled={saved.dailyGoal>=12}>+</button></div></div><div className="planner-footnote"><span>✳</span><p>This is a suggested plan. Move sessions around to fit your week.</p></div></section>
    <section className="content-card week-plan-card"><div className="week-plan-header"><div><span className="eyebrow">YOUR PERSONAL ROADMAP</span><h2>This week at a glance</h2><p>Week of {weekLabel} <span>·</span> {rankPlan} pace</p></div><button className="button button-primary" onClick={()=>onNavigate('progress')}>View progress <Icon name="arrow" size={14}/></button></div><div className="week-days">{week.map((day,index)=><div className={`week-day ${index===0?'today':''}`} key={day}><span>{day}</span><i className={index<2?'day-done':''}>{index<2?<Icon name="check" size={11}/>:index+1}</i><small>{index===6?'3h':index===5?'3h':index===2?'2.5h':'2h'}</small></div>)}</div><div className="plan-task-list">{tasks.slice(0,rankPlan==='intensive'?7:rankPlan==='balanced'?5:6).map((task,index)=><div className={`plan-task ${index===0?'current':''}`} key={task.day}><span className="task-day">{task.day}</span><span className="task-rail"><i/></span><span className="task-copy"><strong>{task.subject}</strong><small>{task.task}</small></span><span className="task-time"><Icon name="timer" size={13}/>{task.time}</span><button className="task-action" aria-label={`Open ${task.subject}`} onClick={()=>onNavigate('syllabus')}><Icon name="arrow" size={14}/></button></div>)}</div><div className="plan-summary"><span><Icon name="bolt" size={15}/></span><p><strong>One week at a time.</strong> Your plan includes focused study, practice, and time to review.</p><span className="week-hours">18.5 <small>hrs scheduled</small></span></div></section></div>
  </>;
}

function ProgressView({ saved, onNavigate, onSubject }) {
  const done = saved.completedSubjects.length;
  const accuracy = saved.tests.length ? saved.tests.reduce((sum,test)=>sum+test.score,0)/saved.tests.length : 0;
  const weeklyMinutes = getWeekStudyMinutes(saved.studySessions);
  const weekTotal = weeklyMinutes.reduce((sum,minutes)=>sum+minutes,0);
  const goalMinutes = saved.dailyGoal*60;
  const chartMax = Math.max(goalMinutes,...weeklyMinutes,60);
  const streak = getStudyStreak(saved.studySessions);
  return <><PageHeading eyebrow="YOUR WORK, ADDING UP" title="Look how far you’ve come." copy="A clear view of your consistency, study hours, and the topics that deserve another look." action={<button className="button button-outline" onClick={()=>onNavigate('planner')}>Open study plan <Icon name="arrow" size={14}/></button>} />
    <div className="progress-kpis"><article><span className="kpi-top"><span className="stat-icon tone-bg-orange"><Icon name="bolt" size={16}/></span>Study streak</span><strong>{streak} <small>days</small></strong><p>{streak?'One session keeps it going.':'Study today to start a streak.'}</p><SparkBars tone="orange"/></article><article><span className="kpi-top"><span className="stat-icon tone-bg-blue"><Icon name="timer" size={16}/></span>Total focus time</span><strong>{Math.floor(saved.studiedMinutes/60)}<small>h</small> {saved.studiedMinutes%60}<small>m</small></strong><p>{saved.tests.length} mock tests completed</p><SparkBars tone="blue"/></article><article><span className="kpi-top"><span className="stat-icon tone-bg-green"><Icon name="book" size={16}/></span>Subjects covered</span><strong>{done}<small> / {subjects.length}</small></strong><p>{Math.round(done/subjects.length*100)}% syllabus coverage</p><SparkBars tone="green"/></article><article><span className="kpi-top"><span className="stat-icon tone-bg-purple"><Icon name="chart" size={16}/></span>Mock accuracy</span><strong>{saved.tests.length?Math.round(accuracy):'—'}<small>{saved.tests.length?'%':' '}</small></strong><p>{saved.tests.length?'Average across attempts':'Take a test to begin'}</p><SparkBars tone="purple"/></article></div>
    <div className="progress-two-col"><section className="content-card study-chart-card"><div className="section-heading"><div><span className="eyebrow">CONSISTENCY BEATS CRAMMING</span><h2>Study hours</h2></div><span className="chart-range">THIS WEEK</span></div><div className="hours-chart"><div className="chart-y"><span>{saved.dailyGoal}h</span><span>{Math.ceil(saved.dailyGoal*.75)}h</span><span>{Math.ceil(saved.dailyGoal*.5)}h</span><span>{Math.ceil(saved.dailyGoal*.25)}h</span><span>0</span></div><div className="chart-columns">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,index)=><div className="chart-day" key={day}><div className="bar-pair"><i style={{height:`${Math.min(100,Math.max(2,weeklyMinutes[index]/chartMax*100))}%`}}/><i style={{height:`${Math.min(100,goalMinutes/chartMax*100)}%`}}/></div><span>{day}</span></div>)}</div></div><div className="chart-legend"><span><i/> Study time</span><span><i/> Daily goal</span><strong>{Math.floor(weekTotal/60)}h {weekTotal%60}m <small>of {saved.dailyGoal*7}h goal</small></strong></div></section>
      <section className="content-card weak-topics-card"><div className="section-heading"><div><span className="eyebrow">WHERE TO FOCUS NEXT</span><h2>Suggested review</h2></div><span className="focus-chip">FOCUS</span></div><p className="weak-intro">Your unmarked topics are a good place to start. Keep your revision focused.</p>{subjects.filter((s)=>!saved.completedSubjects.includes(s.id)).slice(0,4).map((item,index)=><div className="weak-topic-row" key={item.id}><span className={`weak-icon tone-${item.tone}`}>{item.symbol}</span><span><strong>{item.name}</strong><small>{item.topics[index%item.topics.length]}</small></span><span className="weak-bar"><i style={{width:`${[34,48,56,62][index]}%`}}/></span><button aria-label={`Study ${item.name}`} onClick={()=>onNavigate('syllabus')}><Icon name="arrow" size={13}/></button></div>)}<button className="text-link full-focus-link" onClick={()=>onNavigate('syllabus')}>View full syllabus <Icon name="arrow" size={13}/></button></section></div>
    <div className="progress-bottom-row"><div className="content-card streak-card"><div className="streak-flame">✦</div><div><span className="eyebrow">YOUR CURRENT STREAK</span><strong>{streak} {streak===1?'day':'days'} in a row</strong><p>{streak?'Come back tomorrow and keep it going.':'Study for 25 minutes to begin.'}</p></div><div className="streak-days">{['M','T','W','T','F','S','S'].map((day,index)=><i className={weeklyMinutes[index]>0?'filled':''} key={`${day}${index}`}>{weeklyMinutes[index]>0?<Icon name="check" size={11}/>:day}</i>)}</div></div><div className="content-card goal-card"><span className="goal-icon">◎</span><div><span className="eyebrow">THIS WEEK’S GOAL</span><strong>Build your rhythm</strong><p>Targeting {saved.targetRank} · {saved.dailyGoal}h daily</p></div><button className="text-link" onClick={()=>onNavigate('planner')}>Adjust <Icon name="arrow" size={13}/></button></div></div>
  </>;
}

function SparkBars({tone}) { return <div className={`kpi-spark ${tone}`}>{[24,40,32,61,48,78,66,100,78,87,62,96,71,88,77].map((h,index)=><i key={index} style={{height:`${h}%`}}/>)}</div>; }

function DailyQuestion({onNotice}) {
  const [answer,setAnswer]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const today=new Date();
  const monthLabel=new Intl.DateTimeFormat('en-IN',{month:'short'}).format(today).toUpperCase();
  const options=['Its real part is negative for all ω','Its real part is non-negative for Re(s) > 0'];
  const handleSubmit=()=>{if(answer===null){onNotice('Choose an answer first.');return;}setSubmitted(true);};
  return <section className="content-card daily-card"><div className="section-heading"><div><p className="eyebrow">A LITTLE PRACTICE, EVERY DAY</p><h2>Question of the day</h2></div><span className="date-stamp"><span>{monthLabel}</span><strong>{today.getDate()}</strong></span></div><div className="question-meta"><span>NETWORK THEORY</span><span>1 MARK</span><span>MCQ</span></div><p className="daily-question">For a passive two-terminal network, the driving-point impedance is a positive real function. Which property must it satisfy?</p><div className="daily-options">{options.map((option,index)=><button key={index} className={`daily-option ${answer===index?'selected':''} ${submitted&&index===1?'correct':''} ${submitted&&answer===index&&index!==1?'incorrect':''}`} onClick={()=>{if(!submitted)setAnswer(index);}}><span>{String.fromCharCode(65+index)}</span>{option}</button>)}</div>{submitted&&<p className={`daily-feedback ${answer===1?'correct':'incorrect'}`}>{answer===1?'That’s right.':'Not quite.'} A positive real function has non-negative real part when Re(s) &gt; 0.</p>}<button className="button button-primary full-button" onClick={submitted?()=>{setAnswer(null);setSubmitted(false);}:handleSubmit}>{submitted?'Try again':'Check answer'} <Icon name={submitted?'check':'arrow'} size={15}/></button></section>;
}

function MobileNav({view,onNavigate}) { return <nav className="mobile-bottom-nav">{[{id:'home',label:'Home',icon:'grid'},{id:'syllabus',label:'Study',icon:'book'},{id:'pyq',label:'Practice',icon:'search'},{id:'progress',label:'Progress',icon:'chart'}].map((item)=><button key={item.id} className={(view===item.id||(item.id==='pyq'&&view==='tests'))?'active':''} onClick={()=>onNavigate(item.id)}><Icon name={item.icon} size={18}/><span>{item.label}</span></button>)}</nav>; }

function Modal({ modal, saved, onClose, onStudyDone, onTestDone, onNextTest }) {
  if (modal.type==='video') return <VideoModal video={modal.video} onClose={onClose} />;
  if (modal.type==='note') return <PopulatedNoteModal {...modal} saved={saved} onClose={onClose} />;
  if (modal.type==='study') return <StudyModal subject={subjects.find((item)=>item.id===modal.subjectId)||subjects[0]} onClose={onClose} onDone={onStudyDone}/>;
  if (modal.type==='test') return <TestModal modal={modal} saved={saved} onClose={onClose} onDone={onTestDone}/>;
  if (modal.type==='result') return <ResultModal result={modal.result} onClose={onClose} onNextTest={onNextTest}/>;
  return null;
}

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  const isPlaylist = video.kind === 'playlist';
  const embedUrl = isPlaylist
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(video.id)}&rel=0`
    : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?rel=0&playsinline=1`;
  return <div className="modal-backdrop video-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}><section className="modal video-modal" role="dialog" aria-modal="true" aria-labelledby="video-title"><div className="modal-top"><span className="modal-brand"><i><Icon name="play" size={13}/></i> WATCH IN GATE ECE HUB</span><button className="icon-action" onClick={onClose} aria-label="Close video player"><Icon name="close"/></button></div><div className="video-player-frame"><iframe src={embedUrl} title={`${video.title || 'YouTube video'} — embedded player`} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy" /></div><div className="video-modal-details"><div><span className="eyebrow">{video.channel || (isPlaylist ? 'YOUTUBE PLAYLIST' : 'YOUTUBE VIDEO')}</span><h2 id="video-title">{video.title || (isPlaylist ? 'Watch playlist' : 'Watch video')}</h2><p>Playback stays in this window. YouTube serves the video, so availability and ads follow the creator’s settings.</p></div><a className="button button-outline" href={video.fallbackUrl} target="_blank" rel="noreferrer">Open on YouTube <Icon name="external" size={13}/></a></div></section></div>;
}

function PopulatedNoteModal({subject,kind,saved,onClose}) {
  const info=noteKinds.find((item)=>item.id===kind)||noteKinds[0];
  const material=noteMaterials[subject.id]||noteMaterials.maths;
  const key=`${subject.id}-${kind}`;
  const showConcepts=kind==='handwritten'||kind==='short';
  return <div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}><section className="modal note-reader" role="dialog" aria-modal="true" aria-labelledby="note-title"><div className="modal-top"><span className="modal-brand"><i>ECE</i> STUDY NOTES</span><button className="icon-action" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div><div className="note-reader-body"><span className="eyebrow">{subject.name.toUpperCase()} · {info.label.toUpperCase()}</span><h2 id="note-title">{info.title(subject.short)}</h2><p className="note-lede">{material.overview}</p><div className="note-callout"><span><Icon name="book" size={15}/></span><p><strong>Reference coverage · {material.source}</strong><br/>{material.sourceTopics}</p></div><div className="note-source-caption">{material.source.includes('Supplemental')?'This extra guide is original and covers a topic outside the uploaded book.':'Original study summaries aligned to the uploaded Wiley book syllabus and chapter topics. PDF page numbers refer to pages in the uploaded file.'}</div>
    {showConcepts&&<section className="note-material-section"><div className="note-section-heading"><span className="eyebrow">{kind==='short'?'QUICK REVIEW':'CONCEPT WALKTHROUGH'}</span><h3>{kind==='short'?'Five ideas to recall':'Build the topic from the basics'}</h3></div><div className="note-concept-list">{material.concepts.map((item,index)=><article className="note-concept" key={item.title}><span className="note-concept-number">{String(index+1).padStart(2,'0')}</span><div><h4>{item.title}</h4><p>{kind==='short'?item.summary:item.detail}</p>{kind==='short'&&<small>{item.detail}</small>}</div></article>)}</div></section>}
    {kind==='formula'&&<section className="note-material-section"><div className="note-section-heading"><span className="eyebrow">FORMULA SHEET</span><h3>Core relationships</h3></div><div className="note-formula-list">{material.formulas.map((item)=><article className="note-formula-row" key={item.label}><span>{item.label}</span><code>{item.formula}</code><p>{item.note}</p></article>)}</div></section>}
    {kind==='important'&&<section className="note-material-section"><div className="note-section-heading"><span className="eyebrow">ACTIVE RECALL</span><h3>Try each question before revealing its answer</h3></div><div className="note-question-list">{material.questions.map((item,index)=><details className="note-question" key={item.prompt}><summary><span>{String(index+1).padStart(2,'0')}</span>{item.prompt}</summary><p>{item.answer}</p></details>)}</div></section>}
    {kind==='revision'&&<section className="note-material-section"><div className="note-section-heading"><span className="eyebrow">FINAL PASS</span><h3>Revision checklist</h3></div><ul className="note-checklist">{material.revision.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,'0')}</span>{item}</li>)}</ul><div className="note-traps"><strong>Common traps</strong><ul>{material.traps.map((item)=><li key={item}>{item}</li>)}</ul></div></section>}
    <div className="note-reader-topics"><span>SYLLABUS TOPICS</span><p>{subject.topics.join(' · ')}</p></div></div><div className="modal-footer"><span className="local-only-label">{saved.offlineNotes.includes(key)?'SAVED ON THIS DEVICE':'READING PREVIEW'}</span><button className="button button-primary" onClick={onClose}>Done revising <Icon name="check" size={14}/></button></div></section></div>;
}

function StudyModal({subject,onClose,onDone}) {
  const [seconds,setSeconds]=useState(25*60);
  const [running,setRunning]=useState(false);
  useEffect(()=>{if(!running)return undefined;const timer=window.setInterval(()=>setSeconds((value)=>{if(value<=1){setRunning(false);return 0;}return value-1;}),1000);return()=>window.clearInterval(timer);},[running]);
  const mm=String(Math.floor(seconds/60)).padStart(2,'0');const ss=String(seconds%60).padStart(2,'0');
  const elapsedMinutes=Math.floor((25*60-seconds)/60);
  return <div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}><section className="modal study-modal" role="dialog" aria-modal="true" aria-labelledby="study-title"><div className="modal-top"><span className="modal-brand"><i>✳</i> FOCUS SESSION</span><button className="icon-action" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div><div className="study-modal-body"><span className={`subject-symbol-large tone-bg-${subject.tone}`}>{subject.symbol}</span><span className="eyebrow">25 MIN · ONE FOCUSED SESSION</span><h2 id="study-title">Study {subject.name}</h2><p>Start with one topic. No pressure to finish the whole subject today.</p><div className="focus-timer"><strong>{mm}:{ss}</strong><span>{seconds===0?'SESSION COMPLETE':running?'FOCUS IN PROGRESS':'READY WHEN YOU ARE'}</span></div><div className="focus-topic"><span>UP NEXT</span><strong>{subject.topics[0]}</strong><p>{subject.summary}</p></div></div><div className="modal-footer"><button className="button button-outline" onClick={()=>{if(seconds===0){setSeconds(25*60);setRunning(false);}else setRunning((value)=>!value);}}>{running?'Pause session':seconds===0?'Restart session':'Start focus timer'}</button><button className="button button-primary" disabled={elapsedMinutes===0} onClick={()=>onDone(elapsedMinutes)}>Save session <Icon name="check" size={14}/></button></div></section></div>;
}

function TestModal({modal,saved,onClose,onDone}) {
  const sequence=saved.mockSetSequence||0;
  const {questions:testQuestions,total,fullLength:full}=generateMockQuestionSet(modal.test,{sequence,variantStart:saved.mockVariantCursor||0});
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState({});
  const [elapsed,setElapsed]=useState(0);
  const [remaining,setRemaining]=useState(full?3*60*60:20*60);
  const [confirmSubmit,setConfirmSubmit]=useState(false);
  const submittedRef=useRef(false);
  useEffect(()=>{const interval=window.setInterval(()=>{setElapsed((time)=>time+1);setRemaining((time)=>Math.max(0,time-1));},1000);return()=>window.clearInterval(interval);},[]);
  const timeLabel=full?`${String(Math.floor(remaining/3600)).padStart(2,'0')}:${String(Math.floor((remaining%3600)/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`:`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  const current=testQuestions[index];
  const submit=()=>{if(submittedRef.current)return;submittedRef.current=true;const attempted=Object.entries(answers);const correct=attempted.filter(([qId,option])=>{const q=testQuestions.find((item)=>item.id===qId);return q&&q.answer===option;}).length;const wrong=attempted.length-correct;const incorrectTopics=[...new Set(attempted.filter(([qId,option])=>{const q=testQuestions.find((item)=>item.id===qId);return q&&q.answer!==option;}).map(([qId])=>testQuestions.find((item)=>item.id===qId)?.topic).filter(Boolean))];const maxMarks=attempted.reduce((sum,[qId])=>sum+(testQuestions.find((item)=>item.id===qId)?.marks||1),0);const netMarks=attempted.reduce((sum,[qId,option])=>{const q=testQuestions.find((item)=>item.id===qId);if(!q)return sum;return sum+(q.answer===option?q.marks:-(q.marks===1?1/3:2/3));},0);const result={name:modal.test,score:attempted.length?Math.round((correct/attempted.length)*100):0,correct,wrong,attempted:attempted.length,total,duration:`${Math.floor(elapsed/60)}m ${elapsed%60}s`,timePerQuestion:attempted.length?Math.round(elapsed/attempted.length):0,weakTopics:incorrectTopics,netMarks:Number(netMarks.toFixed(2)),maxMarks,date:new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short'}).format(new Date()),setNumber:sequence+1,questionIds:testQuestions.map((item)=>item.id),preview:true};onDone(result);};
  useEffect(()=>{if(remaining===0)submit();},[remaining]);
  return <div className="modal-backdrop test-backdrop"><section className="modal test-modal" role="dialog" aria-modal="true" aria-labelledby="test-title"><header className="test-topbar"><div><span className="modal-brand"><i>✳</i> GATE ECE MOCK</span><h2 id="test-title">{modal.test}</h2><small className="mock-origin">PYQ PATTERN SET {sequence+1} · FRESH VARIANTS</small></div><span className="test-live-time"><Icon name="timer" size={15}/>{timeLabel}</span><button className="icon-action" onClick={()=>setConfirmSubmit(true)} aria-label="Submit test"><Icon name="close"/></button></header><div className="test-progress-line"><i style={{width:`${(index+1)/total*100}%`}}/></div><div className="test-body"><aside className="test-question-nav"><span>QUESTION PALETTE</span><div>{Array.from({length:total},(_,num)=><button key={num} className={`${num===index?'current':''} ${answers[testQuestions[num]?.id]!==undefined?'answered':''}`} onClick={()=>setIndex(num)}>{num+1}</button>)}</div><p><i className="palette-answered"/> Answered <i className="palette-current"/> Current</p><span className="negative-note"><Icon name="bolt" size={13}/> Negative marking: −⅓</span></aside><article className="test-question"><div className="test-question-meta"><span>QUESTION {String(index+1).padStart(2,'0')} OF {total}</span><span>{current.subject.toUpperCase()} · {current.marks} MARK{current.marks===1?'':'S'}</span></div><h3>{current.question}</h3><div className="test-answer-options">{current.options.map((option,optionIndex)=><button key={optionIndex} className={answers[current.id]===optionIndex?'selected':''} onClick={()=>setAnswers((value)=>({...value,[current.id]:optionIndex}))}><span>{String.fromCharCode(65+optionIndex)}</span>{option}</button>)}</div><div className="test-bottom-controls"><button className="button button-outline" onClick={()=>setIndex((value)=>Math.max(0,value-1))} disabled={index===0}>Previous</button><button className="button button-primary" onClick={()=>{if(index+1>=total){setConfirmSubmit(true);}else setIndex((value)=>value+1);}}>{index+1>=total?'Submit mock':'Save & next'} <Icon name="arrow" size={14}/></button></div></article></div>{confirmSubmit&&<div className="confirm-overlay"><div><span className="eyebrow">READY TO FINISH?</span><h3>Submit your test?</h3><p>{Object.keys(answers).length} of {total} questions answered. Your result and time will be saved to your progress.</p><div><button className="button button-outline" onClick={()=>setConfirmSubmit(false)}>Keep going</button><button className="button button-primary" onClick={submit}>Submit test <Icon name="check" size={14}/></button></div></div></div>}</section></div>;
}

function ResultModal({result,onClose,onNextTest}) {
  return <div className="modal-backdrop"><section className="modal result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title"><div className="modal-top"><span className="modal-brand"><i>✳</i> TEST COMPLETE · {result.date.toUpperCase()}</span><button className="icon-action" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div><div className="result-body"><div className="result-score-ring" style={{'--score':`${result.score}%`}}><div><strong>{result.score}<small>%</small></strong><span>ACCURACY</span></div></div><span className="eyebrow">NICE WORK · {result.name.toUpperCase()}</span><h2 id="result-title">Every attempt is progress.</h2><p className="result-description">You answered {result.attempted} of {result.total} questions in {result.duration}.</p><div className="result-metrics"><div><strong>{result.correct}</strong><span>Correct</span></div><div><strong>{result.wrong}</strong><span>Review</span></div><div><strong>{result.netMarks}/{result.maxMarks}</strong><span>Net marks</span></div><div><strong>{result.timePerQuestion}s</strong><span>Avg. / question</span></div></div><div className="result-review"><div><span className="eyebrow">YOUR REVIEW LIST</span><span className="local-only-label">PYQ PATTERN PRACTICE</span></div>{result.weakTopics?.length?result.weakTopics.map((topic)=><span className="review-topic" key={topic}><Icon name="book" size={13}/>{topic}<Icon name="arrow" size={12}/></span>):<p>You got every attempted question right. Try another subject to keep practising.</p>}</div><p className="result-footnote">Question wording and values are generated from recurring topics; use PYQ Explorer for official papers.</p></div><div className="modal-footer"><span className="local-only-label">SAVED ON THIS DEVICE</span><div className="result-actions"><button className="button button-outline" onClick={onClose}>Back to study hub</button><button className="button button-primary" onClick={()=>onNextTest(result.name)}>Generate next set <Icon name="arrow" size={14}/></button></div></div></section></div>;
}

export default App;
