const fmt = (value, digits = 2) => {
  if (typeof value === 'string') return value;
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(digits)));
};

function makeQuestion(template, variant, question, correct, distractors, solution, marks = 1) {
  const choices = [String(correct), ...distractors.map(String).filter((choice) => String(choice) !== String(correct))];
  const fallbacks = ['None of these', 'All of these', 'Insufficient information'];
  fallbacks.forEach((choice) => { if (choices.length < 4 && !choices.includes(choice)) choices.push(choice); });
  const answer = variant % choices.length;
  const shift = (choices.length - answer) % choices.length;
  const options = choices.slice(shift).concat(choices.slice(0, shift));
  return {
    id: `${template.key}-v${variant}`,
    subject: template.subject,
    topic: template.topic,
    difficulty: ['Easy', 'Medium', 'Hard'][variant % 3],
    marks,
    question,
    options,
    answer,
    solution,
  };
}

const templates = [
  {
    key: 'math-eigenvalue', subject: 'Engineering Mathematics', topic: 'Linear Algebra',
    build: (v, t) => { const a = 2 + v % 13; const b = a + 1 + v % 7; const correct = Math.max(a, b); return makeQuestion(t, v, `For A = diag(${a}, ${b}), what is the largest eigenvalue?`, correct, [Math.min(a, b), a + b, a * b], `A diagonal matrix has its diagonal entries as eigenvalues. The largest is ${correct}.`); },
  },
  {
    key: 'math-minimum', subject: 'Engineering Mathematics', topic: 'Calculus',
    build: (v, t) => { const a = 2 + v % 15; return makeQuestion(t, v, `At what x-value does f(x) = x^2 - ${2 * a}x attain its minimum?`, a, [-a, 0, 2 * a], `Set f'(x) = 2x - ${2 * a} = 0. The parabola opens upward, so its minimum is at x = ${a}.`); },
  },
  {
    key: 'math-mean', subject: 'Engineering Mathematics', topic: 'Probability & Statistics',
    build: (v, t) => { const n = 4 + v % 18; const correct = (n + 1) / 2; return makeQuestion(t, v, `An integer is chosen uniformly from 1 through ${n}. What is its expected value?`, fmt(correct), [fmt(n / 2), fmt(n), fmt((n + 3) / 2)], `For a discrete uniform set 1, 2, ..., ${n}, the mean is (1 + ${n})/2 = ${fmt(correct)}.`); },
  },
  {
    key: 'math-newton', subject: 'Engineering Mathematics', topic: 'Numerical Methods',
    build: (v, t) => { const root = 2 + v % 9; const x0 = root + 1; const x1 = (x0 + (root * root) / x0) / 2; return makeQuestion(t, v, `One Newton-Raphson step for f(x) = x^2 - ${root * root}, starting at x0 = ${x0}, gives x1 closest to:`, fmt(x1), [fmt(root), fmt(x0 + 1), fmt(root - 1)], `Use x1 = 0.5(x0 + a/x0), with a = ${root * root}: x1 = ${fmt(x1)}.`); },
  },
  {
    key: 'network-parallel', subject: 'Network Theory', topic: 'Circuit Laws & Equivalents',
    build: (v, t) => { const r1 = 3 + v % 11; const r2 = r1 + 2 + v % 9; const correct = r1 * r2 / (r1 + r2); return makeQuestion(t, v, `${r1} ohm and ${r2} ohm resistors are in parallel. Find their equivalent resistance.`, `${fmt(correct)} ohm`, [`${r1 + r2} ohm`, `${Math.abs(r2 - r1)} ohm`, `${fmt((r1 + r2) / 2)} ohm`], `R_eq = R1 R2/(R1 + R2) = ${r1} x ${r2}/(${r1} + ${r2}) = ${fmt(correct)} ohm.`); },
  },
  {
    key: 'network-max-power', subject: 'Network Theory', topic: 'Network Theorems',
    build: (v, t) => { const r = 2 + v % 30; return makeQuestion(t, v, `A Thevenin source has R_th = ${r} ohm. For maximum power transfer to a resistive load, choose R_L =`, `${r} ohm`, [`${2 * r} ohm`, `${fmt(r / 2)} ohm`, `${r + 1} ohm`], `For a linear Thevenin source and a resistive load, maximum power occurs when R_L = R_th = ${r} ohm.`); },
  },
  {
    key: 'network-rc', subject: 'Network Theory', topic: 'Transient Analysis',
    build: (v, t) => { const r = 1 + v % 12; const c = 2 + (v * 3) % 18; const tau = r * c; return makeQuestion(t, v, `An RC circuit has R_eq = ${r} kohm and C = ${c} microfarad. What is its time constant?`, `${tau} ms`, [`${r + c} ms`, `${fmt(r / c)} ms`, `${2 * tau} ms`], `tau = R C. With kohms and microfarads, the product is in milliseconds: ${r} x ${c} = ${tau} ms.`); },
  },
  {
    key: 'network-divider', subject: 'Network Theory', topic: 'Circuit Analysis',
    build: (v, t) => { const vs = 12 + v % 25; const r1 = 2 + v % 9; const r2 = 3 + (v * 2) % 11; const correct = vs * r2 / (r1 + r2); return makeQuestion(t, v, `A ${vs} V source feeds series resistors ${r1} kohm and ${r2} kohm. What is the voltage across the ${r2} kohm resistor?`, `${fmt(correct)} V`, [`${fmt(vs * r1 / (r1 + r2))} V`, `${vs} V`, `${fmt(vs / 2)} V`], `Apply the divider rule: V_out = V_s R2/(R1 + R2) = ${fmt(correct)} V.`); },
  },
  {
    key: 'signals-nyquist', subject: 'Signals & Systems', topic: 'Sampling',
    build: (v, t) => { const f = 2 + v % 30; return makeQuestion(t, v, `A baseband signal is band-limited to ${f} kHz. What is the minimum ideal Nyquist sampling rate?`, `${2 * f} kHz`, [`${f} kHz`, `${4 * f} kHz`, `${fmt(f / 2)} kHz`], `The ideal Nyquist rate is twice the highest signal frequency: 2 x ${f} = ${2 * f} kHz.`); },
  },
  {
    key: 'signals-stability', subject: 'Signals & Systems', topic: 'LTI Systems',
    build: (v, t) => { const a = [-0.6, 0.4, 1.2, -1.1, 0.8, 1.05][v % 6]; const stable = Math.abs(a) < 1; return makeQuestion(t, v, `For h[n] = (${a})^n u[n], is the discrete-time LTI system BIBO stable?`, stable ? 'Stable' : 'Unstable', [stable ? 'Unstable' : 'Stable', 'Causal but never stable', 'Cannot be determined'], `A geometric impulse response is absolutely summable only when |a| < 1. Here |${a}| ${stable ? '<' : '>='} 1, so the system is ${stable ? 'stable' : 'unstable'}.`); },
  },
  {
    key: 'signals-dft-bin', subject: 'Signals & Systems', topic: 'DFT',
    build: (v, t) => { const fs = 8 + v % 24; const n = 8 * (1 + v % 8); const df = fs / n; return makeQuestion(t, v, `An N-point DFT uses sampling rate ${fs} kHz with N = ${n}. What is the frequency-bin spacing?`, `${fmt(df)} kHz`, [`${fs} kHz`, `${fmt(fs * n)} kHz`, `${fmt(n / fs)} kHz`], `DFT bin spacing is f_s/N = ${fs}/${n} = ${fmt(df)} kHz.`); },
  },
  {
    key: 'signals-z-pole', subject: 'Signals & Systems', topic: 'Z-Transform',
    build: (v, t) => { const p = [0.35, 0.72, 1.1, -0.6, -1.25, 0.92][v % 6]; const stable = Math.abs(p) < 1; return makeQuestion(t, v, `A causal rational discrete-time system has a single pole at z = ${p}. Is it BIBO stable?`, stable ? 'Stable' : 'Unstable', [stable ? 'Unstable' : 'Stable', 'Stable only if p is positive', 'Stability is independent of the pole'], `For a causal system the ROC is outside the pole. The unit circle is included only when |${p}| < 1, so this system is ${stable ? 'stable' : 'unstable'}.`); },
  },
  {
    key: 'devices-mosfet-current', subject: 'Electronic Devices', topic: 'MOSFET Operation',
    build: (v, t) => { const k = 0.5 * (1 + v % 8); const ov = 1 + v % 5; const id = k * ov * ov; return makeQuestion(t, v, `An ideal MOSFET has K = ${fmt(k)} mA/V^2 and overdrive V_GS - V_T = ${ov} V. Find I_D in saturation using I_D = K(V_GS - V_T)^2.`, `${fmt(id)} mA`, [`${fmt(k * ov)} mA`, `${fmt(2 * id)} mA`, `${fmt(id / 2)} mA`], `Substitute into the square-law model: I_D = ${fmt(k)} x ${ov}^2 = ${fmt(id)} mA.`, 2); },
  },
  {
    key: 'devices-mosfet-region', subject: 'Electronic Devices', topic: 'MOSFET Operation',
    build: (v, t) => { const vt = 1 + v % 4; const overdrive = 1 + v % 6; const vds = 1 + (v * 3) % 10; const region = vds >= overdrive ? 'Saturation' : 'Triode'; return makeQuestion(t, v, `An nMOS has V_T = ${vt} V, V_GS = ${vt + overdrive} V and V_DS = ${vds} V. Which region is it in?`, region, [region === 'Saturation' ? 'Triode' : 'Saturation', 'Cutoff', 'Reverse breakdown'], `V_GS > V_T, so a channel exists. Compare V_DS = ${vds} V with V_ov = ${overdrive} V: ${vds >= overdrive ? 'V_DS >= V_ov, so saturation' : 'V_DS < V_ov, so triode'}.`); },
  },
  {
    key: 'devices-bjt-beta', subject: 'Electronic Devices', topic: 'BJT Operation',
    build: (v, t) => { const beta = 40 + v % 10 * 10; const ib = 10 + v % 9 * 5; const ic = beta * ib / 1000; return makeQuestion(t, v, `A BJT operates in forward active mode with beta = ${beta} and I_B = ${ib} microampere. Find I_C.`, `${fmt(ic)} mA`, [`${fmt(ib / beta)} mA`, `${fmt(beta / ib)} mA`, `${fmt(ic * 1000)} mA`], `I_C = beta I_B = ${beta} x ${ib} microampere = ${fmt(ic)} mA.`); },
  },
  {
    key: 'devices-diode', subject: 'Electronic Devices', topic: 'P-N Junctions',
    build: (v, t) => { const vin = 2 + v % 9; const r = 1 + v % 8; const correct = (vin - 0.7) / r; return makeQuestion(t, v, `A ${vin} V source drives a forward-biased silicon diode (0.7 V drop) in series with a ${r} kohm resistor. Find the approximate current.`, `${fmt(correct)} mA`, [`${fmt(vin / r)} mA`, `${fmt(0.7 / r)} mA`, `${fmt((vin + 0.7) / r)} mA`], `I = (V_s - V_D)/R = (${vin} - 0.7)/${r} kohm = ${fmt(correct)} mA.`); },
  },
  {
    key: 'analog-noninverting', subject: 'Analog Circuits', topic: 'Operational Amplifiers',
    build: (v, t) => { const r1 = 1 + v % 12; const rf = r1 * (2 + v % 9); const gain = 1 + rf / r1; return makeQuestion(t, v, `An ideal non-inverting amplifier has R_f = ${rf} kohm and R_1 = ${r1} kohm. What is its closed-loop gain?`, `${fmt(gain)} V/V`, [`${fmt(rf / r1)} V/V`, `${fmt(1 - rf / r1)} V/V`, `${fmt(r1 / rf)} V/V`], `A_v = 1 + R_f/R_1 = 1 + ${rf}/${r1} = ${fmt(gain)} V/V.`); },
  },
  {
    key: 'analog-inverting', subject: 'Analog Circuits', topic: 'Operational Amplifiers',
    build: (v, t) => { const rin = 2 + v % 14; const rf = rin * (2 + v % 7); const gain = -rf / rin; return makeQuestion(t, v, `An ideal inverting amplifier has R_f = ${rf} kohm and R_in = ${rin} kohm. What is its voltage gain?`, `${fmt(gain)} V/V`, [`${fmt(rf / rin)} V/V`, `${fmt(-rin / rf)} V/V`, `${fmt(1 + rf / rin)} V/V`], `A_v = -R_f/R_in = -${rf}/${rin} = ${fmt(gain)} V/V.`); },
  },
  {
    key: 'analog-feedback', subject: 'Analog Circuits', topic: 'Feedback Amplifiers',
    build: (v, t) => { const a = 20 + v % 80 * 5; const beta = 0.01 + (v % 8) * 0.01; const gain = a / (1 + a * beta); return makeQuestion(t, v, `A negative-feedback amplifier has open-loop gain A = ${a} and feedback factor beta = ${fmt(beta)}. Find its closed-loop gain.`, fmt(gain), [fmt(a), fmt(a * beta), fmt(a / (1 - a * beta))], `For negative feedback, A_f = A/(1 + A beta) = ${a}/(1 + ${a} x ${fmt(beta)}) = ${fmt(gain)}.`); },
  },
  {
    key: 'analog-lowpass', subject: 'Analog Circuits', topic: 'Active Filters',
    build: (v, t) => { const r = 2 + v % 12; const c = 2 + (v * 3) % 18; const fc = 159.15 / (r * c); return makeQuestion(t, v, `A first-order RC low-pass filter uses R = ${r} kohm and C = ${c} nF. Estimate its cutoff frequency.`, `${fmt(fc)} kHz`, [`${fmt(fc * 2)} kHz`, `${fmt(1 / (r * c))} kHz`, `${fmt(fc / 2)} kHz`], `f_c = 1/(2 pi R C). With R in kohms and C in nF, f_c = 159.15/(R C) = ${fmt(fc)} kHz.`); },
  },
  {
    key: 'digital-twos-range', subject: 'Digital Circuits', topic: 'Number Systems',
    build: (v, t) => { const n = 4 + v % 9; const min = -(2 ** (n - 1)); const max = 2 ** (n - 1) - 1; return makeQuestion(t, v, `What is the minimum value representable by an ${n}-bit two's-complement number?`, String(min), [String(-max), String(-(2 ** n)), String(0)], `The signed N-bit two's-complement range is -2^(N-1) through 2^(N-1)-1. Here the minimum is ${min}.`); },
  },
  {
    key: 'digital-adc', subject: 'Digital Circuits', topic: 'Data Converters',
    build: (v, t) => { const n = 3 + v % 10; const levels = 2 ** n; return makeQuestion(t, v, `How many distinct output codes are available from an ideal ${n}-bit ADC?`, String(levels), [String(n), String(levels - 1), String(2 * n)], `An N-bit converter has 2^N possible codes. Here 2^${n} = ${levels}.`); },
  },
  {
    key: 'digital-mux', subject: 'Digital Circuits', topic: 'Combinational Circuits',
    build: (v, t) => { const m = 2 + v % 6; const inputs = 2 ** m; return makeQuestion(t, v, `How many data inputs can be selected by a multiplexer with ${m} select lines?`, String(inputs), [String(m), String(inputs - 1), String(2 * m)], `m select bits encode 2^m choices. Thus the multiplexer has ${inputs} data inputs.`); },
  },
  {
    key: 'digital-demorgan', subject: 'Digital Circuits', topic: 'Boolean Algebra',
    build: (v, t) => { const a = String.fromCharCode(65 + v % 4); const b = String.fromCharCode(69 + v % 4); return makeQuestion(t, v, `By De Morgan's law, what is the complement of (${a} + ${b})?`, `${a}'${b}'`, [`${a}' + ${b}'`, `${a}${b}`, `${a} + ${b}`], `The complement of an OR is the AND of the complemented inputs: (${a} + ${b})' = ${a}'${b}'.`); },
  },
  {
    key: 'control-feedback', subject: 'Control Systems', topic: 'Feedback & Transfer Functions',
    build: (v, t) => { const g = 2 + v % 18; const h = 0.05 * (1 + v % 8); const closed = g / (1 + g * h); return makeQuestion(t, v, `A negative-feedback loop has G = ${g} and H = ${fmt(h)}. What is the closed-loop transfer ratio?`, fmt(closed), [fmt(g), fmt(g / (1 - g * h)), fmt(g * h)], `T = G/(1 + GH) = ${g}/(1 + ${g} x ${fmt(h)}) = ${fmt(closed)}.`); },
  },
  {
    key: 'control-damping', subject: 'Control Systems', topic: 'Transient Response',
    build: (v, t) => { const z = [0, 0.25, 0.7, 1, 1.4][v % 5]; const type = z === 0 ? 'Undamped' : z < 1 ? 'Underdamped' : z === 1 ? 'Critically damped' : 'Overdamped'; return makeQuestion(t, v, `A standard second-order system has damping ratio zeta = ${z}. How is its natural response classified?`, type, ['Unstable', 'Marginally stable', type === 'Underdamped' ? 'Overdamped' : 'Underdamped'], `For a standard second-order system: zeta = 0 is undamped, 0 < zeta < 1 underdamped, zeta = 1 critical, and zeta > 1 overdamped. Here it is ${type.toLowerCase()}.`); },
  },
  {
    key: 'control-ramp-error', subject: 'Control Systems', topic: 'Steady-State Error',
    build: (v, t) => { const kv = 2 + v % 20; const error = 1 / kv; return makeQuestion(t, v, `A unity-feedback type-1 system has velocity error constant K_v = ${kv}. What is the steady-state error for a unit ramp?`, fmt(error), ['0', '1', fmt(1 / (kv * kv))], `For a unit ramp, e_ss = 1/K_v = 1/${kv} = ${fmt(error)}.`); },
  },
  {
    key: 'control-routh', subject: 'Control Systems', topic: 'Stability Analysis',
    build: (v, t) => { const k = 0.5 + (v % 12) * 0.5; const stable = k < 4; return makeQuestion(t, v, `For s^3 + 2s^2 + 2s + K = 0 with K = ${fmt(k)}, is the system asymptotically stable?`, stable ? 'Yes' : 'No', [stable ? 'No' : 'Yes', 'Only if K = 0', 'Cannot be determined from the polynomial'], `The Routh first column is 1, 2, (4 - K)/2, K. All entries are positive when 0 < K < 4, so this system is ${stable ? 'stable' : 'unstable'}.`); },
  },
  {
    key: 'comm-am-power', subject: 'Communication Systems', topic: 'Amplitude Modulation',
    build: (v, t) => { const m = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8][v % 6]; const ratio = m * m / 2 * 100; return makeQuestion(t, v, `A single-tone AM signal has modulation index m = ${m}. What is total sideband power as a percentage of carrier power?`, `${fmt(ratio)}%`, [`${fmt(m * 100)}%`, `${fmt(m * m * 100)}%`, `${fmt(ratio * 2)}%`], `For conventional single-tone AM, P_sidebands/P_carrier = m^2/2 = ${fmt(ratio)}%.`, 2); },
  },
  {
    key: 'comm-capacity', subject: 'Communication Systems', topic: 'Information Theory',
    build: (v, t) => { const snr = [1, 3, 7, 15, 31, 63][v % 6]; const bits = Math.log2(1 + snr); return makeQuestion(t, v, `A channel has bandwidth B and linear SNR = ${snr}. What is its Shannon capacity?`, `${fmt(bits)}B bits/s`, [`${fmt(Math.log2(snr))}B bits/s`, `${snr}B bits/s`, `${fmt(bits / 2)}B bits/s`], `C = B log2(1 + S/N) = B log2(${1 + snr}) = ${fmt(bits)}B bits/s.`); },
  },
  {
    key: 'comm-hamming', subject: 'Communication Systems', topic: 'Error-Correcting Codes',
    build: (v, t) => { const d = 3 + 2 * (v % 6); const correct = Math.floor((d - 1) / 2); return makeQuestion(t, v, `A block code has minimum Hamming distance d_min = ${d}. How many errors can it guarantee correcting?`, String(correct), [String(d - 1), String(d + 1), '0'], `Guaranteed correction is t = floor((d_min - 1)/2) = floor((${d} - 1)/2) = ${correct}.`); },
  },
  {
    key: 'comm-carson', subject: 'Communication Systems', topic: 'Frequency Modulation',
    build: (v, t) => { const deviation = 5 + v % 26; const fm = 1 + v % 9; const bw = 2 * (deviation + fm); return makeQuestion(t, v, `An FM signal has peak deviation ${deviation} kHz and highest message frequency ${fm} kHz. Estimate its bandwidth using Carson's rule.`, `${bw} kHz`, [`${deviation + fm} kHz`, `${2 * deviation} kHz`, `${2 * fm} kHz`], `Carson's estimate is B_T ~= 2(Delta f + f_m) = 2(${deviation} + ${fm}) = ${bw} kHz.`); },
  },
  {
    key: 'em-reflection', subject: 'Electromagnetics', topic: 'Transmission Lines',
    build: (v, t) => { const z0 = 50; const zl = z0 * (1.2 + (v % 8) * 0.1); const gamma = (zl - z0) / (zl + z0); return makeQuestion(t, v, `A load Z_L = ${fmt(zl)} ohm is connected to a line with Z_0 = ${z0} ohm. Find the voltage reflection coefficient at the load.`, fmt(gamma), [fmt(-gamma), fmt((zl + z0) / (zl - z0)), fmt(1 - gamma)], `Gamma = (Z_L - Z_0)/(Z_L + Z_0) = (${fmt(zl)} - ${z0})/(${fmt(zl)} + ${z0}) = ${fmt(gamma)}.`); },
  },
  {
    key: 'em-vswr', subject: 'Electromagnetics', topic: 'Transmission Lines',
    build: (v, t) => { const gamma = [0.1, 0.2, 0.25, 1 / 3, 0.4, 0.5][v % 6]; const vswr = (1 + gamma) / (1 - gamma); return makeQuestion(t, v, `A line has |Gamma| = ${fmt(gamma)}. What is its voltage standing-wave ratio?`, fmt(vswr), [fmt((1 - gamma) / (1 + gamma)), fmt(1 / gamma), fmt(1 + gamma)], `VSWR = (1 + |Gamma|)/(1 - |Gamma|) = (1 + ${fmt(gamma)})/(1 - ${fmt(gamma)}) = ${fmt(vswr)}.`); },
  },
  {
    key: 'em-radar-range', subject: 'Electromagnetics', topic: 'Radar',
    build: (v, t) => { const time = 2 + v % 30; const range = 150 * time; return makeQuestion(t, v, `A monostatic radar echo returns after ${time} microseconds. What is the target range in free space?`, `${range} m`, [`${2 * range} m`, `${fmt(range / 2)} m`, `${time * 300} m`], `The echo time is round-trip. R = c t/2 = 150 m per microsecond x ${time} = ${range} m.`); },
  },
  {
    key: 'em-guide-cutoff', subject: 'Electromagnetics', topic: 'Waveguides',
    build: (v, t) => { const a = 5 + v % 16; const fc = 15 / a; return makeQuestion(t, v, `A rectangular air-filled waveguide has broad dimension a = ${a} cm. What is the TE10 cutoff frequency?`, `${fmt(fc)} GHz`, [`${fmt(30 / a)} GHz`, `${fmt(a / 15)} GHz`, `${fmt(fc / 2)} GHz`], `For TE10, f_c = c/(2a). With a in cm, f_c = 15/a GHz = ${fmt(fc)} GHz.`); },
  },
];

const subjectByTestName = [
  ['Digital Electronics', 'Digital Circuits'],
  ['Analog Circuits', 'Analog Circuits'],
  ['Signals & Systems', 'Signals & Systems'],
  ['Communication Systems', 'Communication Systems'],
  ['Control Systems', 'Control Systems'],
  ['Network Theory', 'Network Theory'],
  ['Electronic Devices', 'Electronic Devices'],
  ['Engineering Mathematics', 'Engineering Mathematics'],
];

export function generateMockQuestionSet(testName, { sequence = 0, variantStart = 0 } = {}) {
  const fullLength = testName.includes('Full-length');
  const total = fullLength ? 65 : 10;
  const matchedSubject = subjectByTestName.find(([label]) => testName.includes(label))?.[1];
  const bank = matchedSubject ? templates.filter((item) => item.subject === matchedSubject) : templates;
  const questions = Array.from({ length: total }, (_, position) => {
    const template = bank[(position + sequence) % bank.length];
    const variant = variantStart + position + 1;
    return { ...template.build(variant, template), id: `${template.key}-set${sequence + 1}-q${position + 1}-v${variant}` };
  });
  return { questions, total, fullLength };
}
