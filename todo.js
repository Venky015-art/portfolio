/* To‑Do app script: localStorage-backed, accessible, mobile-first */
(function(){
  const STORAGE_KEY = 'portfolio_todo_tasks_v1';
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const filters = document.querySelectorAll('.filter');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const installBtn = document.getElementById('installBtn');

  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let currentFilter = 'all';
  let currentDateFilter = null; // YYYY-MM-DD when calendar day selected
  let deferredPrompt = null;

  // Settings
  const SETTINGS_KEY = 'portfolio_todo_settings_v1';
  const defaultSettings = { timeFormat: '12', calendarShowCompleted: false };
  let settings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));

  // Icon picker state (explicit icon choice when creating a task)
  const iconPickerEl = document.querySelector('.icon-picker');
  let selectedIcon = null;
  if(iconPickerEl){
    iconPickerEl.querySelectorAll('.icon-option').forEach(btn => {
      btn.addEventListener('click', () => {
        iconPickerEl.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
        const icon = btn.dataset.icon || null;
        if(icon){ btn.classList.add('selected'); selectedIcon = icon; }
        else { selectedIcon = null; }
      });
    });
  }

  // Render
  function render(){
    taskList.innerHTML = '';
    const visible = tasks.filter(t => {
      if(currentFilter==='active') if(t.done) return false;
      if(currentFilter==='completed') if(!t.done) return false;
      if(currentDateFilter){
        if(!t.due) return false;
        const d = new Date(t.due);
        if(!isSameDateISO(d, currentDateFilter)) return false;
      }
      return true;
    });

    if(visible.length===0){
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
    }

    visible.forEach(task => {
      const el = document.createElement('article');
      el.className = 'task' + (task.done? ' completed':'');
      el.setAttribute('data-id', task.id);

      // prefer explicit icon stored with the task, otherwise detect by keyword
      const iconPath = task.icon || getEventIcon(task.text || '');
      if(iconPath){
        const img = document.createElement('img');
        img.className = 'event-icon';
        img.src = iconPath;
        img.alt = '';
        el.appendChild(img);
      }

      const checkbox = document.createElement('button');
      checkbox.className = 'icon-btn';
      checkbox.setAttribute('aria-label', task.done? 'Mark as active' : 'Mark as done');
      checkbox.innerHTML = task.done? '✔' : '○';
      checkbox.addEventListener('click', () => toggleDone(task.id));

      const textWrap = document.createElement('div');
      textWrap.className = 'text';
      const p = document.createElement('p');
      p.textContent = task.text;
      if(task.due){
        const due = document.createElement('small');
        due.style.display='block';
        due.style.marginTop='6px';
        due.style.color='var(--muted)';
        due.textContent = formatDue(task.due);
        p.appendChild(due);
      }
      p.contentEditable = false;
      p.setAttribute('role','textbox');
      p.setAttribute('tabindex','0');
      p.addEventListener('dblclick', () => startEdit(task.id, p));

      textWrap.appendChild(p);

      const meta = document.createElement('div');
      meta.className = 'meta';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.innerHTML = '✎';
      editBtn.setAttribute('aria-label','Edit task');
      editBtn.addEventListener('click', () => startEdit(task.id, p));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.innerHTML = '🗑';
      delBtn.setAttribute('aria-label','Delete task');
      delBtn.addEventListener('click', () => removeTask(task.id));

      meta.appendChild(editBtn);
      meta.appendChild(delBtn);

      el.appendChild(checkbox);
      el.appendChild(textWrap);
      el.appendChild(meta);

      taskList.appendChild(el);
    });
  }

  function persist(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    render();
  }

  function addTask(text){
    const dateVal = document.getElementById('taskDate').value;
    const timeVal = document.getElementById('taskTime').value;
    let due = null;
    if(dateVal){
      // create ISO from date and optional time in local timezone
      if(timeVal) due = new Date(dateVal + 'T' + timeVal);
      else due = new Date(dateVal + 'T00:00');
      // store ISO string
      due = due.toISOString();
    }
    const t = { id: Date.now().toString(36), text: text.trim(), done: false, due, icon: selectedIcon || null };
    tasks.unshift(t);
    persist();
    // reset icon picker selection after adding
    if(iconPickerEl){ iconPickerEl.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected')); selectedIcon = null; }
  }

  function removeTask(id){
    tasks = tasks.filter(t=>t.id!==id);
    persist();
  }

  function toggleDone(id){
    tasks = tasks.map(t => t.id===id ? {...t, done: !t.done} : t);
    persist();
  }

  function startEdit(id, p){
    const original = p.textContent;
    p.contentEditable = true;
    p.focus();
    document.execCommand('selectAll', false, null);

    function finish(){
      p.contentEditable = false;
      const updated = p.textContent.trim();
      if(!updated){
        // revert
        p.textContent = original;
      } else {
        tasks = tasks.map(t => t.id===id ? {...t, text: updated} : t);
        persist();
      }
      p.removeEventListener('blur', finish);
      p.removeEventListener('keydown', onKey);
    }

    function onKey(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        p.blur();
      } else if(e.key === 'Escape'){
        p.textContent = original;
        p.blur();
      }
    }

    p.addEventListener('blur', finish);
    p.addEventListener('keydown', onKey);
  }

  // Utilities
  function formatDue(iso){
    try{
      const d = new Date(iso);
      const options = { month: 'short', day: 'numeric' };
      const datePart = d.toLocaleDateString(undefined, options);
      let timePart = '';
      if(d.getHours() || d.getMinutes()){
        if(settings.timeFormat === '24'){
          timePart = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        } else {
          timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      }
      return timePart? `${datePart} • ${timePart}` : datePart;
    }catch(e){ return '' }
  }

  function isSameDateISO(dateObj, isoYMD){
    const y = dateObj.getFullYear();
    const m = (dateObj.getMonth()+1).toString().padStart(2,'0');
    const d = dateObj.getDate().toString().padStart(2,'0');
    return `${y}-${m}-${d}` === isoYMD;
  }

  // Event icon detection
  function getEventIcon(text){
    const s = (text || '').toLowerCase();
    const map = [
      { icons: ['bed','bedtime','sleep','nap'], path: 'icons/bed.svg' },
      { icons: ['write','writing','journal','compose','essay'], path: 'icons/writing.svg' },
      { icons: ['exercise','workout','run','gym','yoga'], path: 'icons/exercise.svg' }
    ];
    for(const item of map){
      for(const kw of item.icons){
        if(s.includes(kw)) return item.path;
      }
    }
    return null;
  }

  // Calendar
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarSection = document.getElementById('calendarSection');
  const calendarEl = document.getElementById('calendar');
  const calendarTitle = document.getElementById('calendarTitle');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  let calDate = new Date(); // current month shown

  function buildCalendar(date){
    calendarEl.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();
    calendarTitle.textContent = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    // weekdays header
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    weekdays.forEach(w => { const el = document.createElement('div'); el.className='weekday'; el.textContent = w; calendarEl.appendChild(el); });
    // first day of month
    const first = new Date(year, month, 1);
    const last = new Date(year, month+1, 0);
    const startDay = first.getDay();
    // fill blanks
    for(let i=0;i<startDay;i++){ const b = document.createElement('div'); b.className='day'; calendarEl.appendChild(b); }
    // days
    for(let d=1; d<=last.getDate(); d++){
      const day = new Date(year, month, d);
      const isoYMD = `${year}-${(month+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
      const cell = document.createElement('button');
      cell.className = 'day';
      cell.setAttribute('role','gridcell');
      cell.textContent = d;
      if(isToday(day)) cell.classList.add('today');
      // mark if tasks
      const has = tasks.some(t => t.due && isSameDateISO(new Date(t.due), isoYMD) && (settings.calendarShowCompleted || !t.done));
      if(has) cell.classList.add('hasTask');
      if(currentDateFilter === isoYMD) cell.classList.add('selected');
      cell.addEventListener('click', ()=>{
        if(currentDateFilter === isoYMD) currentDateFilter = null; else currentDateFilter = isoYMD;
        render(); buildCalendar(calDate);
      });
      calendarEl.appendChild(cell);
    }
  }

  function isToday(d){ const t = new Date(); return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate(); }

  calendarToggle.addEventListener('click', ()=>{ calendarSection.hidden = !calendarSection.hidden; if(!calendarSection.hidden) buildCalendar(calDate); });
  prevMonthBtn.addEventListener('click', ()=>{ calDate = new Date(calDate.getFullYear(), calDate.getMonth()-1, 1); buildCalendar(calDate); });
  nextMonthBtn.addEventListener('click', ()=>{ calDate = new Date(calDate.getFullYear(), calDate.getMonth()+1, 1); buildCalendar(calDate); });

  // Settings modal
  const settingsModal = document.getElementById('settingsModal');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettings = document.getElementById('closeSettings');
  const saveSettings = document.getElementById('saveSettings');
  const timeFormatSelect = document.getElementById('timeFormat');
  const calendarShowCompleted = document.getElementById('calendarShowCompleted');

  function openSettings(){
    timeFormatSelect.value = settings.timeFormat; calendarShowCompleted.checked = !!settings.calendarShowCompleted; settingsModal.hidden = false;
  }
  function closeSettingsModal(){ settingsModal.hidden = true; }
  settingsBtn.addEventListener('click', openSettings);
  closeSettings.addEventListener('click', closeSettingsModal);
  saveSettings.addEventListener('click', ()=>{
    settings.timeFormat = timeFormatSelect.value;
    settings.calendarShowCompleted = calendarShowCompleted.checked;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    closeSettingsModal();
    render(); buildCalendar(calDate);
  });


  // Form handling
  taskForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = taskInput.value;
    if(!val || !val.trim()) return;
    addTask(val);
    taskInput.value='';
    taskInput.focus();
  });

  // Filters
  filters.forEach(btn => btn.addEventListener('click', ()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  }));

  clearCompletedBtn.addEventListener('click', ()=>{
    tasks = tasks.filter(t=>!t.done);
    persist();
  });

  // Init
  render();

  // Service worker registration (only when served over http(s) or localhost)
  if(('serviceWorker' in navigator) && (location.protocol === 'http:' || location.protocol === 'https:' || location.hostname === 'localhost')){
    navigator.serviceWorker.register('sw.js').then(()=>{
      console.log('SW registered');
    }).catch((err)=>{ console.warn('SW registration failed', err); });
  } else {
    console.log('Service worker not registered (file:// or unsupported protocol)');
  }

  // Install prompt for PWA
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
  });

  installBtn.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if(choice.outcome === 'accepted'){
      installBtn.style.display='none';
    }
    deferredPrompt = null;
  });

})();
