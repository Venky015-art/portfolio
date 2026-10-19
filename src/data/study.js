export const officialLinks = {
  syllabus: 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EC_GATE2027_Syllabus.pdf',
  syllabusPage: 'https://gate2027.iitm.ac.in/exam_papers_and_syllabus',
  papers2026: 'https://gate2026.iitg.ac.in/QPs-answer-keys.html',
  archive: 'https://gate2026.iitg.ac.in/download.html',
  papers2025: 'https://gate2025.iitr.ac.in/download.html',
  pyqPdfArchive: 'https://pdf.questions.examgoal.com/past-years/year-wise/gate/gate-ece',
};

const paperSets = {
  2017: ['Set 2', 'Set 1'],
  2016: ['Set 2', 'Set 1', 'Set 3'],
  2015: ['Set 3', 'Set 2', 'Set 1'],
  2014: ['Set 1', 'Set 4', 'Set 2', 'Set 3'],
};

export const pyqYears = Array.from({ length: 20 }, (_, index) => String(2026 - index));

export function pyqPdfUrl(year, paperSet = '') {
  const slug = `gate-ece-${year}${paperSet ? `-${paperSet.toLowerCase().replaceAll(' ', '-')}` : ''}`;
  const pdf = `https://pdf.questions.examgoal.com/download/paper/gate/gate-ece/${slug}/en.pdf`;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(pdf)}&embedded=true`;
}

export function pyqPaperSets(year) {
  return paperSets[year] || ['Main paper'];
}

export const subjects = [
  { id:'maths', name:'Engineering Mathematics', short:'Maths', symbol:'∫', tone:'blue', progress:42, weight:'13–15 marks', description:'The mathematical toolkit behind every strong ECE solution.', summary:'Build fluency in linear algebra, calculus, differential equations, probability, and numerical methods.', formula:'A x = λ x  ·  det(A − λI) = 0', topics:['Linear Algebra','Calculus','Differential Equations','Probability & Statistics','Numerical Methods'] },
  { id:'aptitude', name:'General Aptitude', short:'Aptitude', symbol:'Aa', tone:'orange', progress:34, weight:'15 marks', description:'A reliable way to pick up marks across the whole paper.', summary:'Practice verbal ability, numerical aptitude, reasoning, and spatial aptitude in short, regular sets.', formula:'Speed = Distance ÷ Time  ·  % change = Δ ÷ original × 100', topics:['Verbal Aptitude','Numerical Aptitude','Analytical Aptitude','Spatial Aptitude'] },
  { id:'network', name:'Network Theory', short:'Network', symbol:'⌁', tone:'green', progress:56, weight:'8–10 marks', description:'Connect circuit laws, network theorems, and frequency response.', summary:'Move from circuit analysis and theorems to two-port networks and network functions.', formula:'Zₚ = Z₁Z₂ ÷ (Z₁ + Z₂)  ·  τ = RC', topics:['Circuit Elements & Laws','Network Theorems','Transient Analysis','Sinusoidal Steady State','Resonance & Two-Port Networks'] },
  { id:'signals', name:'Signals & Systems', short:'Signals', symbol:'∿', tone:'purple', progress:31, weight:'8–10 marks', description:'Understand signals in time and frequency, and how systems respond.', summary:'Review continuous and discrete signals, transforms, sampling, and linear time-invariant systems.', formula:'x[n] ↔ X(eʲω)  ·  fₛ ≥ 2 fₘ', topics:['Signal Classification','LTI Systems','Fourier Series & Transform','Laplace & Z-Transform','Sampling'] },
  { id:'devices', name:'Electronic Devices', short:'Devices', symbol:'◒', tone:'pink', progress:48, weight:'8–10 marks', description:'Semiconductor fundamentals through diode and transistor behaviour.', summary:'Build intuition for semiconductor physics, pn junctions, and MOSFET/BJT operation.', formula:'Iᴅ ≈ ½ μₙ Cₒₓ (W/L)(Vɢₛ − Vᴛ)²', topics:['Semiconductor Physics','P-N Junctions','Diode Circuits','BJT Operation','MOSFET Operation'] },
  { id:'analog', name:'Analog Circuits', short:'Analog', symbol:'∿', tone:'orange', progress:37, weight:'8–10 marks', description:'Analyse amplifiers, feedback, and practical analogue building blocks.', summary:'Study single- and multi-stage amplifiers, feedback, op-amps, oscillators, and filters.', formula:'Aᶠ = A ÷ (1 + Aβ)  ·  Aᵥ(non-inv) = 1 + Rᶠ/R₁', topics:['Diode Applications','BJT & MOSFET Amplifiers','Feedback Amplifiers','Operational Amplifiers','Oscillators & Filters'] },
  { id:'digital', name:'Digital Circuits', short:'Digital', symbol:'⊞', tone:'blue', progress:64, weight:'8–10 marks', description:'From Boolean algebra to sequential logic and data conversion.', summary:'Make digital logic systematic: simplify, implement, and reason about state and timing.', formula:'NAND / NOR are universal gates  ·  fₘₐₓ ≈ 1 ÷ Tclk', topics:['Number Systems & Codes','Boolean Algebra','Combinational Circuits','Sequential Circuits','ADC & DAC'] },
  { id:'control', name:'Control Systems', short:'Control', symbol:'⟳', tone:'green', progress:27, weight:'6–8 marks', description:'Link mathematical models to stability and system performance.', summary:'Work through transfer functions, time and frequency response, stability, and compensation.', formula:'ζ = −ln(Mₚ) ÷ √(π² + ln²(Mₚ))', topics:['System Modelling','Time Response','Stability Analysis','Frequency Response','Compensation & Controllers'] },
  { id:'communication', name:'Communication Systems', short:'Comm', symbol:'〰', tone:'purple', progress:19, weight:'8–10 marks', description:'Follow the path from modulation to noise and digital communication.', summary:'Review analogue and digital modulation, information theory, and receiver performance.', formula:'C = B log₂(1 + S/N)  ·  fₛ ≥ 2B', topics:['Amplitude Modulation','Angle Modulation','Random Processes & Noise','Digital Modulation','Information Theory'] },
  { id:'electromagnetics', name:'Electromagnetics', short:'EM', symbol:'ϟ', tone:'pink', progress:12, weight:'6–8 marks', description:'Field theory and wave propagation for communication and devices.', summary:'Develop the field fundamentals needed for electrostatics, waves, and transmission lines.', formula:'∇ × E = −∂B/∂t  ·  η₀ ≈ 377 Ω', topics:['Electrostatics','Magnetostatics','Maxwell’s Equations','Plane Waves','Transmission Lines & Waveguides'] },
];

export const noteKinds = [
  { id:'handwritten', label:'Handwritten notes', symbol:'✎', title:(s)=>`${s} concept notes`, description:'A visual, easy-to-follow walkthrough for your core concepts.', meta:'5 concept briefs', duration:'18 min' },
  { id:'short', label:'Short notes', symbol:'≡', title:(s)=>`${s} at a glance`, description:'The key ideas, condensed for a focused revision session.', meta:'5 topic summaries', duration:'8 min' },
  { id:'formula', label:'Formula sheet', symbol:'ƒx', title:(s)=>`${s} formula sheet`, description:'Important relationships and quick reminders in one place.', meta:'4 key formulas', duration:'5 min' },
  { id:'important', label:'Important questions', symbol:'?', title:(s)=>`${s} practice set`, description:'High-value question patterns to help test your understanding.', meta:'3 questions', duration:'10 min' },
  { id:'revision', label:'Revision notes', symbol:'↻', title:(s)=>`${s} final revision`, description:'A calm, structured review for your next practice session.', meta:'4 checkpoints', duration:'10 min' },
];

const youtube = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
export const resources = [
  { subject:'Engineering Mathematics', channel:'GATE Wallah English', brand:'pw', note:'GATE-focused concept lessons', url:youtube('GATE Wallah English Engineering Mathematics GATE') },
  { subject:'Engineering Mathematics', channel:'Unacademy GATE', brand:'unacademy', note:'Free topic-wise lectures', url:youtube('Unacademy GATE Engineering Mathematics English') },
  { subject:'Engineering Mathematics', channel:'Neso Academy', brand:'neso', note:'Clear engineering fundamentals', url:'https://www.youtube.com/@nesoacademy' },
  { subject:'Digital Electronics', channel:'Neso Academy', brand:'neso', note:'Digital logic & circuit design', url:'https://www.youtube.com/@nesoacademy' },
  { subject:'Digital Electronics', channel:'GATE Wallah English', brand:'pw', note:'GATE-focused concept lessons', url:youtube('GATE Wallah English Digital Electronics GATE') },
  { subject:'Analog Electronics', channel:'All About Electronics', brand:'allabout', note:'Analog & device tutorials', url:'https://www.youtube.com/@ALLABOUTELECTRONICS' },
  { subject:'Analog Electronics', channel:'Neso Academy', brand:'neso', note:'Circuit concepts & examples', url:'https://www.youtube.com/@nesoacademy' },
  { subject:'Signals & Systems', channel:'NPTEL', brand:'nptel', note:'University-level course lectures', url:'https://www.youtube.com/@nptelhrd' },
  { subject:'Signals & Systems', channel:'GATE Wallah English', brand:'pw', note:'GATE-focused concept lessons', url:youtube('GATE Wallah English Signals Systems GATE') },
  { subject:'Communication Systems', channel:'NPTEL', brand:'nptel', note:'Communication systems courses', url:'https://www.youtube.com/@nptelhrd' },
  { subject:'Communication Systems', channel:'All About Electronics', brand:'allabout', note:'Wireless & communication basics', url:'https://www.youtube.com/@ALLABOUTELECTRONICS' },
  { subject:'Control Systems', channel:'NPTEL', brand:'nptel', note:'Control theory lecture series', url:'https://www.youtube.com/@nptelhrd' },
  { subject:'Control Systems', channel:'GATE Academy', brand:'academy', note:'GATE-oriented practice lessons', url:youtube('GATE Academy Control Systems English') },
  { subject:'Network Theory', channel:'Neso Academy', brand:'neso', note:'Network theorems & circuit analysis', url:'https://www.youtube.com/@nesoacademy' },
  { subject:'Network Theory', channel:'GATE Wallah English', brand:'pw', note:'GATE-focused concept lessons', url:youtube('GATE Wallah English Network Theory GATE') },
  { subject:'Electronic Devices', channel:'All About Electronics', brand:'allabout', note:'Semiconductors & devices', url:'https://www.youtube.com/@ALLABOUTELECTRONICS' },
  { subject:'Electronic Devices', channel:'Neso Academy', brand:'neso', note:'Device physics & transistor basics', url:'https://www.youtube.com/@nesoacademy' },
];

// Local preview questions are original practice examples; they are not represented as official GATE PYQs.
export const questions = [
  { id:'q-mosfet-1', subject:'Electronic Devices', topic:'MOSFET Operation', difficulty:'Medium', year:2024, marks:1, question:'An n-channel MOSFET is in saturation. If its overdrive voltage is doubled while all other parameters remain fixed, its drain current ideally becomes:', options:['Two times larger','Four times larger','Half as large','Unchanged'], answer:1, solution:'In the long-channel square-law model, Iᴅ is proportional to (Vɢₛ − Vᴛ)². Doubling overdrive voltage therefore multiplies the current by four.' },
  { id:'q-mosfet-2', subject:'Electronic Devices', topic:'MOSFET Operation', difficulty:'Easy', year:2021, marks:1, question:'For an enhancement-mode nMOS transistor, the channel begins to form when:', options:['VGS exceeds the threshold voltage','VDS is zero','The body terminal is open','VGS is negative'], answer:0, solution:'An inversion channel forms once the gate-to-source voltage exceeds the threshold voltage, Vᴛ.' },
  { id:'q-mosfet-3', subject:'Electronic Devices', topic:'MOSFET Operation', difficulty:'Hard', year:2018, marks:2, question:'A MOSFET has μₙCₒₓ(W/L) = 2 mA/V² and VGS − VT = 1 V. Neglect channel-length modulation. What is ID in saturation?', options:['0.5 mA','1 mA','2 mA','4 mA'], answer:1, solution:'Using ID = ½ μₙCₒₓ(W/L)(VGS − VT)² gives ID = ½ × 2 × 1² = 1 mA.' },
  { id:'q-network-1', subject:'Network Theory', topic:'Network Theorems', difficulty:'Easy', year:2023, marks:1, question:'Two resistors, 6 Ω and 3 Ω, are connected in parallel. Their equivalent resistance is:', options:['9 Ω','3 Ω','2 Ω','1 Ω'], answer:2, solution:'For two parallel resistors, Req = R1R2/(R1 + R2) = 18/9 = 2 Ω.' },
  { id:'q-signals-1', subject:'Signals & Systems', topic:'Sampling', difficulty:'Medium', year:2022, marks:1, question:'A band-limited signal has highest frequency 4 kHz. The minimum Nyquist sampling frequency is:', options:['2 kHz','4 kHz','8 kHz','16 kHz'], answer:2, solution:'The Nyquist criterion requires a sampling frequency at least twice the highest signal frequency: fs ≥ 2 × 4 kHz = 8 kHz.' },
  { id:'q-analog-1', subject:'Analog Circuits', topic:'Operational Amplifiers', difficulty:'Easy', year:2020, marks:1, question:'An ideal non-inverting op-amp has Rf = 9 kΩ and R1 = 1 kΩ. Its closed-loop voltage gain is:', options:['9','10','−9','1'], answer:1, solution:'For a non-inverting amplifier, Av = 1 + Rf/R1 = 1 + 9/1 = 10.' },
  { id:'q-digital-1', subject:'Digital Circuits', topic:'Boolean Algebra', difficulty:'Easy', year:2019, marks:1, question:'Which logic gate produces an output of 1 only when both its inputs are 1?', options:['XOR','NOR','AND','NAND'], answer:2, solution:'An AND gate is high only when all inputs are high.' },
  { id:'q-control-1', subject:'Control Systems', topic:'Stability Analysis', difficulty:'Medium', year:2017, marks:2, question:'For a second-order system with damping ratio ζ = 1, the system is described as:', options:['Underdamped','Critically damped','Undamped','Unstable'], answer:1, solution:'A second-order system is critically damped at ζ = 1.' },
  { id:'q-math-1', subject:'Engineering Mathematics', topic:'Linear Algebra', difficulty:'Medium', year:2025, marks:2, question:'The eigenvalues of a 2 × 2 identity matrix are:', options:['0 and 1','1 and 1','−1 and 1','0 and 0'], answer:1, solution:'Every vector is an eigenvector of the identity matrix with eigenvalue 1; both eigenvalues are 1.' },
  { id:'q-comm-1', subject:'Communication Systems', topic:'Amplitude Modulation', difficulty:'Hard', year:2016, marks:2, question:'In conventional AM with a single-tone message and modulation index m = 0.5, the total sideband power as a fraction of carrier power is:', options:['6.25%','12.5%','25%','50%'], answer:1, solution:'Total sideband power divided by carrier power is m²/2. For m = 0.5, this is 0.25/2 = 0.125 or 12.5%.' },
  { id:'q-em-1', subject:'Electromagnetics', topic:'Plane Waves', difficulty:'Medium', year:2015, marks:1, question:'The intrinsic impedance of free space is approximately:', options:['50 Ω','120π Ω','1 kΩ','0 Ω'], answer:1, solution:'The intrinsic impedance of free space is η₀ = √(μ₀/ε₀) ≈ 120π Ω ≈ 377 Ω.' },
];
