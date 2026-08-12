/* Parkview Medical — Practice Portal (demo by BH Web Solutions)
   All data is generated sample data, stored in localStorage, reseeded daily. */
'use strict';

/* ================= helpers ================= */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const uid = () => 'id' + (uid._n = (uid._n || Date.now() % 1e8) + 1);

const dayKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const todayKey = () => dayKey(new Date());
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOWS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fmtDate = k => { const d = fromKey(k); return MONTHS[d.getMonth()] + ' ' + d.getDate(); };
const fmtDateLong = k => { const d = fromKey(k); return DOWS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); };
const fmtTime = t => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + pad(m) + ' ' + ap; };
const minToTime = min => pad(Math.floor(min / 60)) + ':' + pad(min % 60);
const timeToMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const relDay = k => { const t = todayKey(); if (k === t) return 'Today'; if (k === dayKey(addDays(new Date(), 1))) return 'Tomorrow'; if (k === dayKey(addDays(new Date(), -1))) return 'Yesterday'; return fmtDate(k); };
const fmtTs = ts => { const d = new Date(ts); const k = dayKey(d); const t = fmtTime(pad(d.getHours()) + ':' + pad(d.getMinutes())); return (k === todayKey() ? 'Today' : k === dayKey(addDays(new Date(), -1)) ? 'Yesterday' : fmtDate(k)) + ', ' + t; };
const age = dob => { const b = fromKey(dob), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a; };

function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ================= fixed catalogs ================= */
const PROVIDERS = [
  { id: 'p1', name: 'Dr. A. Lefkowitz', cred: 'MD', spec: 'Family Medicine', color: '#2a78d6' },
  { id: 'p2', name: 'Dr. S. Braun', cred: 'DO', spec: 'Internal Medicine', color: '#eb6834' },
  { id: 'p3', name: 'Faigy Schwartz', cred: 'PA-C', spec: 'Physician Assistant', color: '#1baf7a' }
];
const VTYPES = [
  { id: 't1', name: 'Follow-up', dur: 15 },
  { id: 't2', name: 'Sick visit', dur: 15 },
  { id: 't3', name: 'New patient', dur: 45 },
  { id: 't4', name: 'Annual physical', dur: 30 },
  { id: 't5', name: 'Well-child visit', dur: 30 },
  { id: 't6', name: 'Vaccination', dur: 10 },
  { id: 't7', name: 'Lab review', dur: 15 }
];
const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', 'checked-in': 'Checked in', completed: 'Completed', 'no-show': 'No-show', cancelled: 'Cancelled' };
const HOURS = { 0: ['09:00', '15:00'], 1: ['08:30', '17:00'], 2: ['08:30', '17:00'], 3: ['08:30', '17:00'], 4: ['08:30', '17:00'], 5: ['08:30', '13:00'], 6: null };
const AV_COLORS = ['#0e7490', '#7c3aed', '#b45309', '#0f766e', '#be185d', '#4d7c0f', '#1d4ed8', '#a21caf'];

const P_SEED = [
  ['Yoel', 'Weiss', '1978-03-14', 'Fidelis Care'], ['Malky', 'Gruber', '1991-08-02', 'Healthfirst'],
  ['Chaim', 'Stern', '1965-11-27', 'UnitedHealthcare'], ['Rivky', 'Friedman', '1988-05-19', 'Fidelis Care'],
  ['Shloime', 'Katz', '2016-09-08', 'Fidelis Care'], ['Esty', 'Berger', '1995-01-30', 'Emblem Health'],
  ['Moshe', 'Grunwald', '1955-06-11', 'Medicare'], ['Perl', 'Rosenberg', '1983-12-04', 'Healthfirst'],
  ['Yitty', 'Klein', '2019-04-22', 'Fidelis Care'], ['Mendy', 'Lebowitz', '1972-07-16', 'Empire BCBS'],
  ['Devora', 'Schwimmer', '1990-10-09', 'Healthfirst'], ['Aron', 'Fisher', '1948-02-25', 'Medicare'],
  ['Gitty', 'Landau', '1986-09-17', 'Emblem Health'], ['Naftuli', 'Brach', '2014-01-12', 'Fidelis Care'],
  ['Chany', 'Weber', '1993-06-28', 'Oscar'], ['Shimon', 'Gluck', '1969-04-03', 'UnitedHealthcare'],
  ['Blimy', 'Stein', '2021-11-15', 'Fidelis Care'], ['Usher', 'Green', '1981-08-21', 'Empire BCBS'],
  ['Hendy', 'Kohn', '1997-03-07', 'Healthfirst'], ['Zalmen', 'Roth', '1959-12-19', 'Medicare'],
  ['Fraidy', 'Neuman', '1989-05-05', 'Fidelis Care'], ['Lipa', 'Berkowitz', '1975-10-31', 'Aetna'],
  ['Toby', 'Mandel', '2017-07-24', 'Fidelis Care'], ['Yanky', 'Spitzer', '1984-02-14', 'Healthfirst'],
  ['Sury', 'Feldman', '1992-09-26', 'Emblem Health'], ['Bernard', 'Adler', '1951-01-08', 'Medicare'],
  ['Margaret', 'Doyle', '1963-07-02', 'Aetna'], ['Jose', 'Rivera', '1987-04-18', 'Healthfirst']
];

/* ================= seed / store ================= */
const LS_KEY = 'pvDemoPortal.v1';
let S = null;

function seed() {
  const rnd = mulberry32(Math.floor(fromKey(todayKey()).getTime() / 86400000));
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const patients = P_SEED.map((p, i) => ({
    id: 'pt' + (i + 1), first: p[0], last: p[1], dob: p[2], ins: p[3],
    phone: '(845) 555-0' + (110 + i), email: (p[0] + '.' + p[1]).toLowerCase() + '@example.com',
    channel: p[3] === 'Medicare' && rnd() < 0.6 ? 'Voice' : rnd() < 0.75 ? 'SMS' : 'Email',
    color: AV_COLORS[i % AV_COLORS.length],
    notes: i === 2 ? 'Prefers early morning appointments.' : i === 11 ? 'Landline only — call to confirm.' : i === 6 ? 'Bring updated medication list each visit.' : ''
  }));

  const wProv = () => { const r = rnd(); return r < 0.4 ? 'p1' : r < 0.75 ? 'p2' : 'p3'; };
  const wType = () => { const r = rnd(); return r < 0.30 ? 't1' : r < 0.50 ? 't2' : r < 0.58 ? 't3' : r < 0.70 ? 't4' : r < 0.80 ? 't5' : r < 0.88 ? 't6' : 't7'; };
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const appts = [];

  for (let off = -28; off <= 14; off++) {
    const d = addDays(now, off);
    const hrs = HOURS[d.getDay()];
    if (!hrs) continue;
    const openM = timeToMin(hrs[0]), closeM = timeToMin(hrs[1]);
    const target = d.getDay() === 5 ? 6 + Math.floor(rnd() * 3) : d.getDay() === 0 ? 7 + Math.floor(rnd() * 3) : 11 + Math.floor(rnd() * 5);
    const busy = { p1: new Set(), p2: new Set(), p3: new Set() };
    const usedPt = new Set();
    for (let i = 0; i < target; i++) {
      const prov = wProv(), typeId = wType();
      const dur = VTYPES.find(t => t.id === typeId).dur;
      let placed = null;
      for (let tries = 0; tries < 14 && !placed; tries++) {
        const slotCount = Math.floor((closeM - openM - dur) / 15);
        if (slotCount < 1) break;
        const start = openM + 15 * Math.floor(rnd() * (slotCount + 1));
        let ok = true;
        for (let m = start; m < start + dur; m += 15) if (busy[prov].has(m)) { ok = false; break; }
        if (ok) placed = start;
      }
      if (placed == null) continue;
      for (let m = placed; m < placed + dur; m += 15) busy[prov].add(m);
      let pt = pick(patients);
      for (let tries = 0; tries < 8 && usedPt.has(pt.id); tries++) pt = pick(patients);
      usedPt.add(pt.id);
      const k = dayKey(d);
      let status;
      if (off < 0) { const r = rnd(); status = r < 0.86 ? 'completed' : r < 0.93 ? 'no-show' : 'cancelled'; }
      else if (off === 0) {
        if (placed + dur <= nowMin) status = rnd() < 0.9 ? 'completed' : 'no-show';
        else if (placed <= nowMin + 30) status = rnd() < 0.7 ? 'checked-in' : 'confirmed';
        else status = rnd() < 0.72 ? 'confirmed' : 'pending';
      } else if (off <= 3) status = rnd() < 0.62 ? 'confirmed' : 'pending';
      else status = rnd() < 0.42 ? 'confirmed' : 'pending';
      appts.push({ id: uid(), patientId: pt.id, providerId: prov, typeId, date: k, time: minToTime(placed), dur, status, notes: '' });
    }
  }
  appts.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const rules = [
    { id: 'r1', on: true, channel: 'sms', name: 'Text message — day before', timing: '24 hours before the appointment', template: 'Hi {first_name}, this is Parkview Medical. Reminder: {type} with {provider} on {date} at {time}. Reply Y to confirm, or call (845) 555-0100 to reschedule.' },
    { id: 'r2', on: true, channel: 'email', name: 'Email — 3 days before', timing: '3 days before the appointment', template: 'Dear {first_name}, this is a reminder of your upcoming {type} with {provider} on {date} at {time} at Parkview Medical, 12 Forest Ave. Please bring your insurance card. To reschedule, call (845) 555-0100.' },
    { id: 'r3', on: false, channel: 'sms', name: 'Text message — 2 hours before', timing: '2 hours before, same day', template: 'Hi {first_name}, see you today at {time} for your {type} with {provider}. Parkview Medical, 12 Forest Ave.' },
    { id: 'r4', on: true, channel: 'voice', name: 'Call list — unconfirmed', timing: 'Every day at 9:00 AM, for tomorrow’s unconfirmed appointments', template: 'The portal prepares a call list each morning of every appointment for tomorrow that is still unconfirmed, so the front desk only calls the people who need it.' },
    { id: 'r5', on: true, channel: 'sms', name: 'Annual physical recall', timing: '11 months after the last annual physical', template: 'Hi {first_name}, it’s time to schedule your yearly physical at Parkview Medical. Call (845) 555-0100 and we’ll find a time that works for you.' }
  ];

  const log = [];
  const nowTs = now.getTime();
  appts.forEach(a => {
    const d = fromKey(a.date); d.setHours(...a.time.split(':').map(Number));
    const apptTs = d.getTime();
    const offMs = apptTs - nowTs;
    if (offMs < -3 * 86400000 || offMs > 4 * 86400000) return;
    const pt = patients.find(p => p.id === a.patientId);
    if (a.status === 'cancelled') return;
    const smsTs = apptTs - 24 * 3600000;
    if (smsTs > nowTs - 3 * 86400000 && smsTs < nowTs + 2.5 * 86400000 && pt.channel !== 'Voice') {
      const sent = smsTs <= nowTs;
      const fail = sent && rnd() < 0.05;
      log.push({ id: uid(), ts: smsTs, patientId: pt.id, channel: 'sms', rule: 'Text — day before', apptId: a.id, status: sent ? (fail ? 'failed' : 'delivered') : 'queued', reason: fail ? 'Number cannot receive texts' : '', reply: sent && !fail && a.status !== 'pending' && rnd() < 0.7 ? 'Y' : '' });
    }
    const emTs = apptTs - 3 * 86400000;
    if (emTs > nowTs - 3 * 86400000 && emTs < nowTs + 86400000 && rnd() < 0.8) {
      log.push({ id: uid(), ts: emTs, patientId: pt.id, channel: 'email', rule: 'Email — 3 days before', apptId: a.id, status: emTs <= nowTs ? 'delivered' : 'queued', reason: '', reply: '' });
    }
    if (pt.channel === 'Voice' && offMs > 0 && offMs < 2 * 86400000 && a.status === 'pending') {
      log.push({ id: uid(), ts: nowTs - Math.floor(rnd() * 5 * 3600000), patientId: pt.id, channel: 'voice', rule: 'Call list — unconfirmed', apptId: a.id, status: 'queued', reason: '', reply: '' });
    }
  });
  [['pt7', -26], ['pt20', -50]].forEach(([pid, hrs]) => {
    log.push({ id: uid(), ts: nowTs + hrs * 3600000, patientId: pid, channel: 'sms', rule: 'Annual physical recall', status: 'delivered', reason: '', reply: '' });
  });
  log.sort((a, b) => b.ts - a.ts);

  return {
    seedDay: todayKey(), patients, appts, rules, log,
    settings: {
      practice: 'Parkview Medical', phone: '(845) 555-0100', address: '12 Forest Ave, Suite 201, Monroe NY 10950',
      smsFrom: '(845) 555-0100', emailFrom: 'office@parkviewmedical.com'
    }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const d = JSON.parse(raw); if (d.seedDay === todayKey() && d.appts && d.patients) { S = d; return; } }
  } catch (e) { /* reseed */ }
  S = seed(); save();
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }

/* lookups */
const P = id => S.patients.find(p => p.id === id);
const PR = id => PROVIDERS.find(p => p.id === id);
const VT = id => VTYPES.find(t => t.id === id);
const ptName = id => { const p = P(id); return p ? p.first + ' ' + p.last : '—'; };
const avatar = (p, cls) => '<span class="avatar ' + (cls || '') + '" style="background:' + p.color + '">' + esc(p.first[0] + p.last[0]) + '</span>';
const badge = st => '<span class="badge ' + st + '"><span class="dot"></span>' + STATUS_LABEL[st] + '</span>';
const provChip = id => { const pr = PR(id); return '<span class="prov"><span class="pdot" style="background:' + pr.color + '"></span>' + esc(pr.name) + '</span>'; };

function renderTemplate(tpl, appt) {
  const pt = appt ? P(appt.patientId) : S.patients[0];
  const pr = appt ? PR(appt.providerId) : PROVIDERS[0];
  const vt = appt ? VT(appt.typeId) : VTYPES[3];
  return tpl.replace('{first_name}', pt.first).replace('{provider}', pr.name).replace('{type}', vt.name.toLowerCase())
    .replace('{date}', appt ? fmtDateLong(appt.date) : 'Tuesday, ' + fmtDate(dayKey(addDays(new Date(), 1)))).replace('{time}', appt ? fmtTime(appt.time) : '10:30 AM');
}

/* ================= global UI ================= */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' + msg;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3200);
}

function openModal(html) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = html;
  $('#modal-root').appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  $$('[data-close]', ov).forEach(b => b.addEventListener('click', close));
  const esch = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esch); } };
  document.addEventListener('keydown', esch);
  ov.close = close;
  return ov;
}
const modalShell = (title, body, foot) =>
  '<div class="modal"><div class="modal-h"><h3>' + title + '</h3><button class="x-btn" data-close><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="modal-b">' + body + '</div>' + (foot ? '<div class="modal-f">' + foot + '</div>' : '') + '</div>';

let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
function openMenu(anchor, items) {
  closeMenu();
  menuEl = document.createElement('div');
  menuEl.className = 'menu';
  menuEl.innerHTML = items.map(it => it === '-' ? '<hr>' : '<button data-mi="' + it.id + '" class="' + (it.danger ? 'danger' : '') + '">' + it.label + '</button>').join('');
  document.body.appendChild(menuEl);
  const r = anchor.getBoundingClientRect();
  const mw = menuEl.offsetWidth, mh = menuEl.offsetHeight;
  let x = Math.min(r.right - mw + 8, window.innerWidth - mw - 8);
  let y = r.bottom + 6; if (y + mh > window.innerHeight - 8) y = r.top - mh - 6;
  menuEl.style.left = Math.max(8, x) + 'px'; menuEl.style.top = y + 'px';
  menuEl.addEventListener('click', e => {
    const b = e.target.closest('[data-mi]'); if (!b) return;
    const it = items.find(i => i !== '-' && i.id === b.dataset.mi);
    closeMenu(); if (it && it.fn) it.fn();
  });
  setTimeout(() => document.addEventListener('mousedown', function h(e) { if (menuEl && !menuEl.contains(e.target)) { closeMenu(); document.removeEventListener('mousedown', h); } }), 0);
}

/* ================= actions ================= */
function setStatus(apptId, status) {
  const a = S.appts.find(x => x.id === apptId); if (!a) return;
  a.status = status; save();
  toast(ptName(a.patientId) + ' — ' + STATUS_LABEL[status].toLowerCase());
  refresh();
}

function apptActions(a) {
  const acts = [];
  if (a.status === 'pending') acts.push({ id: 'c', label: 'Mark confirmed', fn: () => setStatus(a.id, 'confirmed') });
  if (a.date === todayKey() && ['pending', 'confirmed'].includes(a.status)) acts.push({ id: 'ci', label: 'Check in', fn: () => setStatus(a.id, 'checked-in') });
  if (['checked-in', 'confirmed'].includes(a.status) && a.date <= todayKey()) acts.push({ id: 'done', label: 'Mark completed', fn: () => setStatus(a.id, 'completed') });
  acts.push({ id: 'rem', label: 'Send reminder now', fn: () => sendReminderNow(a) });
  acts.push({ id: 'ed', label: 'Edit / reschedule', fn: () => apptModal(a) });
  if (!['cancelled', 'completed'].includes(a.status)) {
    acts.push('-');
    if (a.date <= todayKey()) acts.push({ id: 'ns', label: 'Mark no-show', danger: true, fn: () => setStatus(a.id, 'no-show') });
    acts.push({ id: 'x', label: 'Cancel appointment', danger: true, fn: () => setStatus(a.id, 'cancelled') });
  }
  return acts;
}

function sendReminderNow(appt) {
  const pt = P(appt.patientId);
  const rule = S.rules.find(r => r.id === 'r1');
  const msg = renderTemplate(rule.template, appt);
  const ov = openModal(modalShell('Send reminder — ' + esc(pt.first + ' ' + pt.last),
    '<div class="phone"><div class="screen"><div class="ph-top"><div class="av">PM</div><b>Parkview Medical</b></div>' +
    '<div class="msgs"><div class="bubble">' + esc(msg) + '</div><div class="bubble-meta">Text message · to ' + esc(pt.phone) + '</div><div id="ph-status"></div></div></div></div>',
    '<button class="btn" data-close>Close</button><button class="btn btn-primary" id="send-now">Send text now</button>'));
  $('#send-now', ov).addEventListener('click', () => {
    const b = $('#send-now', ov); b.disabled = true; b.textContent = 'Sending…';
    setTimeout(() => {
      $('#ph-status', ov).innerHTML = '<div class="deliv"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Delivered just now</div>';
      b.textContent = 'Sent ✓';
      S.log.unshift({ id: uid(), ts: Date.now(), patientId: pt.id, channel: 'sms', rule: 'Manual reminder', apptId: appt.id, status: 'delivered', reason: '', reply: '' });
      save(); toast('Reminder texted to ' + pt.first + ' ' + pt.last);
    }, 900);
  });
}

/* -------- new / edit appointment modal -------- */
function apptModal(existing, prefill) {
  const pf = prefill || {};
  const isEdit = !!existing;
  const a = existing || { patientId: pf.patientId || '', providerId: pf.providerId || 'p1', typeId: 't1', date: pf.date || todayKey(), time: pf.time || '', notes: '' };
  const ptOpts = S.patients.slice().sort((x, y) => (x.last + x.first).localeCompare(y.last + y.first))
    .map(p => '<option value="' + p.id + '"' + (p.id === a.patientId ? ' selected' : '') + '>' + esc(p.last + ', ' + p.first) + ' (' + fmtDate(p.dob) + ' ' + fromKey(p.dob).getFullYear() + ')</option>').join('');
  const ov = openModal(modalShell(isEdit ? 'Edit appointment' : 'New appointment',
    '<form id="appt-form"><div class="form-grid">' +
    '<div class="field full"><label>Patient</label><select id="af-pt" required><option value="">Select patient…</option>' + ptOpts + '</select></div>' +
    '<div class="field"><label>Provider</label><select id="af-prov">' + PROVIDERS.map(p => '<option value="' + p.id + '"' + (p.id === a.providerId ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>Visit type</label><select id="af-type">' + VTYPES.map(t => '<option value="' + t.id + '"' + (t.id === a.typeId ? ' selected' : '') + '>' + esc(t.name) + ' · ' + t.dur + ' min</option>').join('') + '</select></div>' +
    '<div class="field"><label>Date</label><input id="af-date" type="date" value="' + a.date + '" required></div>' +
    '<div class="field"><label>Time</label><select id="af-time" required></select></div>' +
    '<div class="field full"><label>Notes (optional)</label><input id="af-notes" type="text" value="' + esc(a.notes || '') + '" placeholder="e.g. needs school form"></div>' +
    (isEdit ? '' : '<label class="check full"><input type="checkbox" id="af-sms" checked> Text the patient to confirm this appointment</label>') +
    '</div></form>',
    '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="af-save">' + (isEdit ? 'Save changes' : 'Book appointment') + '</button>'));

  const timeSel = $('#af-time', ov);
  function fillTimes() {
    const date = $('#af-date', ov).value, prov = $('#af-prov', ov).value;
    const dur = VT($('#af-type', ov).value).dur;
    const hrs = date ? HOURS[fromKey(date).getDay()] : null;
    if (!hrs) { timeSel.innerHTML = '<option value="">Office closed</option>'; return; }
    const openM = timeToMin(hrs[0]), closeM = timeToMin(hrs[1]);
    const taken = new Set();
    S.appts.forEach(x => { if (x.date === date && x.providerId === prov && x.status !== 'cancelled' && x.id !== (existing && existing.id)) for (let m = timeToMin(x.time); m < timeToMin(x.time) + x.dur; m += 15) taken.add(m); });
    let html = '';
    for (let m = openM; m + dur <= closeM; m += 15) {
      let free = true; for (let q = m; q < m + dur; q += 15) if (taken.has(q)) { free = false; break; }
      if (free) html += '<option value="' + minToTime(m) + '"' + (minToTime(m) === a.time ? ' selected' : '') + '>' + fmtTime(minToTime(m)) + '</option>';
    }
    timeSel.innerHTML = html || '<option value="">No open times — pick another day</option>';
  }
  ['af-date', 'af-prov', 'af-type'].forEach(id => $('#' + id, ov).addEventListener('change', fillTimes));
  fillTimes();

  $('#af-save', ov).addEventListener('click', () => {
    const ptId = $('#af-pt', ov).value, date = $('#af-date', ov).value, time = timeSel.value;
    if (!ptId || !date || !time) { toast('Please choose a patient, date and time'); return; }
    const typeId = $('#af-type', ov).value;
    if (isEdit) {
      Object.assign(existing, { patientId: ptId, providerId: $('#af-prov', ov).value, typeId, date, time, dur: VT(typeId).dur, notes: $('#af-notes', ov).value });
      save(); ov.close(); toast('Appointment updated'); refresh();
    } else {
      const wantsSms = $('#af-sms', ov) && $('#af-sms', ov).checked;
      const na = { id: uid(), patientId: ptId, providerId: $('#af-prov', ov).value, typeId, date, time, dur: VT(typeId).dur, status: wantsSms ? 'pending' : 'confirmed', notes: $('#af-notes', ov).value };
      S.appts.push(na);
      S.appts.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
      if (wantsSms) S.log.unshift({ id: uid(), ts: Date.now(), patientId: ptId, channel: 'sms', rule: 'Booking confirmation', apptId: na.id, status: 'delivered', reason: '', reply: '' });
      save(); ov.close(); toast('Appointment booked for ' + ptName(ptId)); refresh();
    }
  });
}

function patientModal() {
  const ov = openModal(modalShell('Add patient',
    '<div class="form-grid">' +
    '<div class="field"><label>First name</label><input id="pf-first" type="text" required></div>' +
    '<div class="field"><label>Last name</label><input id="pf-last" type="text" required></div>' +
    '<div class="field"><label>Date of birth</label><input id="pf-dob" type="date"></div>' +
    '<div class="field"><label>Phone</label><input id="pf-phone" type="tel" placeholder="(845) 555-0000"></div>' +
    '<div class="field"><label>Insurance</label><select id="pf-ins">' + ['Fidelis Care', 'Healthfirst', 'UnitedHealthcare', 'Emblem Health', 'Empire BCBS', 'Aetna', 'Oscar', 'Medicare', 'Medicaid', 'Self-pay'].map(i => '<option>' + i + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>Reminders by</label><select id="pf-ch"><option>SMS</option><option>Email</option><option>Voice</option></select></div>' +
    '<div class="field full"><label>Email (optional)</label><input id="pf-email" type="email"></div>' +
    '</div>',
    '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="pf-save">Add patient</button>'));
  $('#pf-save', ov).addEventListener('click', () => {
    const first = $('#pf-first', ov).value.trim(), last = $('#pf-last', ov).value.trim();
    if (!first || !last) { toast('First and last name are required'); return; }
    const p = { id: uid(), first, last, dob: $('#pf-dob', ov).value || '1990-01-01', ins: $('#pf-ins', ov).value, phone: $('#pf-phone', ov).value || '—', email: $('#pf-email', ov).value, channel: $('#pf-ch', ov).value, color: AV_COLORS[S.patients.length % AV_COLORS.length], notes: '' };
    S.patients.push(p); save(); ov.close(); toast('Patient added: ' + first + ' ' + last); refresh();
  });
}

/* -------- patient drawer -------- */
function openPatient(id) {
  const p = P(id); if (!p) return;
  const upcoming = S.appts.filter(a => a.patientId === id && a.date >= todayKey() && !['cancelled', 'completed', 'no-show'].includes(a.status)).slice(0, 4);
  const past = S.appts.filter(a => a.patientId === id && (a.date < todayKey() || a.status === 'completed')).slice(-6).reverse();
  const wrap = document.createElement('div');
  wrap.className = 'drawer-wrap';
  wrap.innerHTML = '<div class="scrim"></div><div class="drawer">' +
    '<div class="drawer-h">' + avatar(p) + '<div><h3>' + esc(p.first + ' ' + p.last) + '</h3><div class="sub">' + age(p.dob) + ' yrs · DOB ' + fmtDate(p.dob) + ', ' + fromKey(p.dob).getFullYear() + '</div></div>' +
    '<button class="x-btn" style="margin-left:auto" data-x><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
    '<div class="drawer-b">' +
    '<div class="drawer-actions"><button class="btn btn-primary" data-book><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Book appointment</button><button class="btn" data-rem>Send reminder</button></div>' +
    '<div class="sec-t">Details</div><div class="info-grid">' +
    '<div><div class="ig-l">Phone</div><div class="ig-v">' + esc(p.phone) + '</div></div>' +
    '<div><div class="ig-l">Reminders by</div><div class="ig-v">' + p.channel + '</div></div>' +
    '<div><div class="ig-l">Insurance</div><div class="ig-v">' + esc(p.ins) + '</div></div>' +
    '<div><div class="ig-l">Email</div><div class="ig-v">' + esc(p.email || '—') + '</div></div>' +
    '</div>' +
    (p.notes ? '<div class="sec-t">Notes</div><div style="font-size:13px;color:var(--ink-2);background:#f6f8f9;border:1px solid var(--line);border-radius:10px;padding:10px 12px">' + esc(p.notes) + '</div>' : '') +
    '<div class="sec-t">Upcoming</div>' +
    (upcoming.length ? '<ul class="mini-list">' + upcoming.map(a => '<li><span class="ml-t">' + relDay(a.date) + ' · ' + fmtTime(a.time) + '</span><span class="ml-s">' + esc(VT(a.typeId).name) + ' · ' + esc(PR(a.providerId).name) + '</span>' + badge(a.status) + '</li>').join('') + '</ul>' : '<div class="empty" style="padding:14px"><b>No upcoming appointments</b></div>') +
    '<div class="sec-t">Visit history</div>' +
    (past.length ? '<ul class="mini-list">' + past.map(a => '<li><span class="ml-t">' + fmtDate(a.date) + '</span><span class="ml-s">' + esc(VT(a.typeId).name) + ' · ' + esc(PR(a.providerId).name) + '</span>' + badge(a.status) + '</li>').join('') + '</ul>' : '<div class="empty" style="padding:14px"><b>No past visits</b></div>') +
    '</div></div>';
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  $('.scrim', wrap).addEventListener('click', close);
  $('[data-x]', wrap).addEventListener('click', close);
  $('[data-book]', wrap).addEventListener('click', () => { close(); apptModal(null, { patientId: id }); });
  $('[data-rem]', wrap).addEventListener('click', () => {
    const next = upcoming[0] || S.appts.filter(a => a.patientId === id).slice(-1)[0];
    if (next) { close(); sendReminderNow(next); } else toast('No appointment to remind about');
  });
}

/* ================= charts ================= */
let tipEl = null;
function showTip(x, y, html) {
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'chart-tip'; document.body.appendChild(tipEl); }
  tipEl.innerHTML = html; tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px'; tipEl.style.display = 'block';
}
function hideTip() { if (tipEl) tipEl.style.display = 'none'; }

function roundTopRect(x, y, w, h, r) {
  r = Math.min(r, h, w / 2);
  return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'h' + (w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'V' + (y + h) + 'Z';
}

function barChartSVG(data, opts) {
  const W = 640, H = 230, padL = 34, padR = 8, padT = 12, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxRaw = Math.max(1, ...data.map(d => d.v));
  const step = maxRaw <= 8 ? 2 : maxRaw <= 16 ? 4 : maxRaw <= 24 ? 6 : 8;
  const maxV = Math.ceil(maxRaw / step) * step;
  const n = data.length;
  const slot = plotW / n;
  const bw = Math.min(16, slot * 0.62);
  let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria) + '">';
  for (let g = 0; g <= maxV; g += step) {
    const y = padT + plotH - plotH * g / maxV;
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="' + (g === 0 ? '#c3c2b7' : '#e1e0d9') + '" stroke-width="1"/>';
    s += '<text x="' + (padL - 7) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="10.5" fill="#898781" style="font-variant-numeric:tabular-nums">' + g + '</text>';
  }
  data.forEach((d, i) => {
    const x = padL + slot * i + (slot - bw) / 2;
    const h = plotH * d.v / maxV;
    const y = padT + plotH - h;
    if (d.v > 0) s += '<path d="' + roundTopRect(x, y, bw, h, 4) + '" fill="#2a78d6" data-i="' + i + '"/>';
    if (d.lbl) s += '<text x="' + (padL + slot * i + slot / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10.5" fill="#898781">' + esc(d.lbl) + '</text>';
    s += '<rect class="bar-hit" data-i="' + i + '" x="' + (padL + slot * i) + '" y="' + padT + '" width="' + slot + '" height="' + plotH + '"/>';
  });
  s += '</svg>';
  return s;
}

function lineChartSVG(data, opts) {
  const W = 640, H = 210, padL = 40, padR = 14, padT = 14, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxV = Math.max(opts.maxMin || 4, Math.ceil(Math.max(...data.map(d => d.v)) * 1.25));
  const n = data.length;
  const px = i => padL + (n === 1 ? plotW / 2 : plotW * i / (n - 1));
  const py = v => padT + plotH - plotH * v / maxV;
  let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria) + '">';
  const steps = 4;
  for (let g = 0; g <= steps; g++) {
    const v = maxV * g / steps, y = py(v);
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="' + (g === 0 ? '#c3c2b7' : '#e1e0d9') + '" stroke-width="1"/>';
    s += '<text x="' + (padL - 7) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="10.5" fill="#898781">' + (Math.round(v * 10) / 10) + (opts.pct ? '%' : '') + '</text>';
  }
  s += '<polyline fill="none" stroke="#2a78d6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' + data.map((d, i) => px(i) + ',' + py(d.v)).join(' ') + '"/>';
  data.forEach((d, i) => {
    s += '<circle cx="' + px(i) + '" cy="' + py(d.v) + '" r="3.5" fill="#2a78d6"/>';
    s += '<text x="' + px(i) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="10.5" fill="#898781">' + esc(d.lbl) + '</text>';
    s += '<rect class="bar-hit" data-i="' + i + '" x="' + (px(i) - plotW / n / 2) + '" y="' + padT + '" width="' + (plotW / n) + '" height="' + plotH + '"/>';
  });
  s += '</svg>';
  return s;
}

function bindChartTips(root, data, fmt) {
  $$('.bar-hit', root).forEach(r => {
    r.addEventListener('mousemove', e => { const d = data[+r.dataset.i]; showTip(e.clientX, e.clientY, fmt(d)); });
    r.addEventListener('mouseleave', hideTip);
  });
}

/* ================= views ================= */
const view = () => $('#view');
let current = 'dashboard';
let schedDate = todayKey();

function refresh() { render(current, true); updateBadges(); }

function updateBadges() {
  const pend = S.appts.filter(a => a.status === 'pending' && a.date >= todayKey() && a.date <= dayKey(addDays(new Date(), 7))).length;
  const nb = $('#nav-pending');
  nb.hidden = !pend; nb.textContent = pend;
  const soon = notifItems().length;
  const nc = $('#notif-count');
  nc.hidden = !soon; nc.textContent = soon;
}
const notifItems = () => S.appts.filter(a => a.status === 'pending' && a.date >= todayKey() && a.date <= dayKey(addDays(new Date(), 2))).slice(0, 8);

/* -------- dashboard -------- */
function vDashboard() {
  const tk = todayKey();
  const todays = S.appts.filter(a => a.date === tk && a.status !== 'cancelled');
  const confToday = todays.filter(a => ['confirmed', 'checked-in', 'completed'].includes(a.status)).length;
  const remToday = S.log.filter(l => dayKey(new Date(l.ts)) === tk && l.status !== 'failed').length;
  const wkAgo = dayKey(addDays(new Date(), -7));
  const nsWeek = S.appts.filter(a => a.date >= wkAgo && a.date <= tk && a.status === 'no-show').length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const upNext = todays.filter(a => !['completed', 'no-show'].includes(a.status));
  const done = todays.filter(a => ['completed', 'no-show'].includes(a.status));

  const li = a => {
    const p = P(a.patientId);
    let action = '';
    if (a.status === 'pending') action = '<button class="btn btn-sm" data-act="confirm" data-id="' + a.id + '">Confirm</button>';
    else if (a.status === 'confirmed' && timeToMin(a.time) <= nowMin + 45) action = '<button class="btn btn-sm" data-act="checkin" data-id="' + a.id + '">Check in</button>';
    else if (a.status === 'checked-in') action = '<button class="btn btn-sm" data-act="complete" data-id="' + a.id + '">Complete</button>';
    return '<li><span class="time">' + fmtTime(a.time) + '</span>' + avatar(p) + '<span class="who"><b>' + esc(p.first + ' ' + p.last) + '</b><span>' + esc(VT(a.typeId).name) + '</span></span>' + provChip(a.providerId) + badge(a.status) + action + '</li>';
  };

  view().innerHTML =
    '<div class="page-head"><div><h2>' + greet + ', Rivky</h2><div class="sub">' + fmtDateLong(tk) + ' · here’s how the day looks.</div></div>' +
    '<div class="head-actions"><button class="btn" onclick="location.hash=\'#/schedule\'">Open schedule</button></div></div>' +
    '<div class="stat-grid">' +
    '<div class="stat"><div class="lbl">Today’s appointments</div><div class="val">' + todays.length + '</div><div class="sub">' + upNext.length + ' still to come</div></div>' +
    '<div class="stat"><div class="lbl">Confirmed for today</div><div class="val">' + confToday + '<span style="font-size:15px;color:var(--muted)"> / ' + todays.length + '</span></div><div class="sub">' + (todays.length - confToday) + ' awaiting confirmation</div></div>' +
    '<div class="stat"><div class="lbl">Reminders sent today</div><div class="val">' + remToday + '</div><div class="sub">texts, emails &amp; calls</div></div>' +
    '<div class="stat"><div class="lbl">No-shows this week</div><div class="val">' + nsWeek + '</div><div class="sub"><span class="up">↓ reminders working</span></div></div>' +
    '</div>' +
    '<div class="dash-grid"><div class="col">' +
    '<div class="card"><div class="card-h"><h3>Today’s schedule</h3><span class="sub">' + upNext.length + ' upcoming · ' + done.length + ' seen</span></div>' +
    (todays.length ? '<ul class="tl">' + upNext.map(li).join('') + (done.length ? done.map(li).join('') : '') + '</ul>' : '<div class="empty"><b>No appointments today</b>Enjoy the quiet — or book someone in.</div>') +
    '</div></div>' +
    '<div class="col">' +
    '<div class="card"><div class="card-h"><h3>Needs attention</h3></div>' + needsAttentionHTML() + '</div>' +
    '<div class="card"><div class="card-h"><h3>Reminder activity</h3><a href="#/reminders" style="font-size:12.5px;font-weight:600">View all</a></div>' + feedHTML(S.log.slice(0, 7)) + '</div>' +
    '</div></div>';

  $$('#view [data-act]').forEach(b => b.addEventListener('click', () => {
    const map = { confirm: 'confirmed', checkin: 'checked-in', complete: 'completed' };
    setStatus(b.dataset.id, map[b.dataset.act]);
  }));
  bindNeedsAttention();
}

function needsAttentionHTML() {
  const items = notifItems();
  const fails = S.log.filter(l => l.status === 'failed').slice(0, 2);
  if (!items.length && !fails.length) return '<div class="empty" style="padding:20px"><b>All clear</b>Nothing needs your attention right now.</div>';
  let h = '<ul class="feed">';
  items.slice(0, 4).forEach(a => {
    h += '<li><span class="ic voice"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></span><span class="tx"><b>' + esc(ptName(a.patientId)) + '</b> is unconfirmed<span class="meta" style="display:block">' + relDay(a.date) + ' at ' + fmtTime(a.time) + ' · ' + esc(PR(a.providerId).name) + '</span></span><button class="btn btn-sm" data-na-confirm="' + a.id + '">Confirm</button></li>';
  });
  fails.forEach(l => {
    h += '<li><span class="ic voice"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17.2" r=".5" fill="currentColor"/></svg></span><span class="tx"><b>Text failed</b> — ' + esc(ptName(l.patientId)) + '<span class="meta" style="display:block">' + esc(l.reason || 'Could not deliver') + ' · call instead</span></span></li>';
  });
  return h + '</ul>';
}
function bindNeedsAttention() {
  $$('#view [data-na-confirm]').forEach(b => b.addEventListener('click', () => setStatus(b.dataset.naConfirm, 'confirmed')));
}

const chanIcon = ch => ch === 'sms'
  ? '<span class="ic sms"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.9A8 8 0 1 1 21 12z"/></svg></span>'
  : ch === 'email'
    ? '<span class="ic email"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>'
    : '<span class="ic voice"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.27a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z"/></svg></span>';

function feedHTML(entries) {
  if (!entries.length) return '<div class="empty" style="padding:20px"><b>No activity yet</b></div>';
  return '<ul class="feed">' + entries.map(l => {
    const st = l.status === 'delivered' ? '<span class="st ok">Delivered</span>' : l.status === 'queued' ? '<span class="st q">Scheduled</span>' : '<span class="st bad">Failed</span>';
    return '<li>' + chanIcon(l.channel) + '<span class="tx"><b>' + esc(ptName(l.patientId)) + '</b> · ' + esc(l.rule) + '<span class="meta" style="display:block">' + fmtTs(l.ts) + (l.reply ? ' · replied “' + esc(l.reply) + '” — auto-confirmed' : '') + (l.reason ? ' · ' + esc(l.reason) : '') + '</span></span>' + st + '</li>';
  }).join('') + '</ul>';
}

/* -------- schedule -------- */
function vSchedule() {
  const d = fromKey(schedDate);
  const hrs = HOURS[d.getDay()];
  const START = 8 * 60, END = 17.5 * 60, PXH = 88;
  const pxPerMin = PXH / 60;
  const colH = (END - START) * pxPerMin;
  const weekStart = addDays(d, -d.getDay());
  const dayAppts = S.appts.filter(a => a.date === schedDate);

  let strip = '';
  for (let i = 0; i < 7; i++) {
    const wd = addDays(weekStart, i), wk = dayKey(wd);
    const cnt = S.appts.filter(a => a.date === wk && a.status !== 'cancelled').length;
    const off = !HOURS[wd.getDay()];
    strip += '<button class="wday' + (wk === schedDate ? ' sel' : '') + (off ? ' off' : '') + '" data-day="' + wk + '"><div class="d">' + DOWS[wd.getDay()].slice(0, 3) + '</div><div class="n">' + wd.getDate() + '</div><div class="c">' + (off ? 'Closed' : cnt + ' appts') + '</div></button>';
  }

  let grid = '';
  if (!hrs) {
    grid = '<div class="closed-msg"><b>The office is closed on ' + DOWS[d.getDay()] + 's.</b><br>Pick another day to view the schedule.</div>';
  } else {
    let timecol = '';
    let lines = '';
    for (let m = START; m <= END; m += 30) {
      const y = (m - START) * pxPerMin;
      if (m % 60 === 0) timecol += '<div class="t" style="top:' + y + 'px">' + fmtTime(minToTime(m)).replace(':00', '') + '</div>';
      lines += '<div class="hline' + (m % 60 ? ' half' : '') + '" style="top:' + y + 'px"></div>';
    }
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const nowLine = (schedDate === todayKey() && nowMin > START && nowMin < END) ? '<div class="nowline" style="top:' + ((nowMin - START) * pxPerMin) + 'px"></div>' : '';
    let cols = '';
    PROVIDERS.forEach(pr => {
      const blocks = dayAppts.filter(a => a.providerId === pr.id).map(a => {
        const top = (timeToMin(a.time) - START) * pxPerMin;
        const h = Math.max(20, a.dur * pxPerMin - 3);
        return '<div class="appt-block' + (a.status === 'cancelled' ? ' cancelled' : '') + '" data-appt="' + a.id + '" style="--pc:' + pr.color + ';top:' + top + 'px;height:' + h + 'px;background:' + pr.color + '18;border-color:' + pr.color + '55"><b>' + esc(ptName(a.patientId)) + '</b><span>' + fmtTime(a.time) + ' · ' + esc(VT(a.typeId).name) + '</span></div>';
      }).join('');
      cols += '<div class="pcol" data-prov="' + pr.id + '" style="height:' + colH + 'px">' + lines + nowLine + blocks + '</div>';
    });
    grid = '<div class="sched-scroll"><div class="sched">' +
      '<div class="corner"></div>' + PROVIDERS.map(pr => { const c = dayAppts.filter(a => a.providerId === pr.id && a.status !== 'cancelled').length; return '<div class="ph"><span class="pdot" style="background:' + pr.color + '"></span>' + esc(pr.name) + ' <span>· ' + c + '</span></div>'; }).join('') +
      '<div class="timecol" style="height:' + colH + 'px">' + timecol + '</div>' + cols +
      '</div></div>';
  }

  view().innerHTML =
    '<div class="page-head"><div><h2>Schedule</h2><div class="sub">Click an open slot to book it. Click an appointment for actions.</div></div></div>' +
    '<div class="card"><div class="card-b" style="padding-bottom:0">' +
    '<div class="sched-head"><div class="dnav">' +
    '<button class="btn btn-sm" id="sd-prev">‹</button><button class="btn btn-sm" id="sd-today">Today</button><button class="btn btn-sm" id="sd-next">›</button></div>' +
    '<h3>' + fmtDateLong(schedDate) + (hrs ? ' <span style="color:var(--muted);font-weight:500;font-size:13px">· ' + fmtTime(hrs[0]) + ' – ' + fmtTime(hrs[1]) + '</span>' : '') + '</h3>' +
    '<div class="week-strip">' + strip + '</div></div></div>' + grid + '</div>';

  $('#sd-prev').addEventListener('click', () => { schedDate = dayKey(addDays(fromKey(schedDate), -1)); render('schedule', true); });
  $('#sd-next').addEventListener('click', () => { schedDate = dayKey(addDays(fromKey(schedDate), 1)); render('schedule', true); });
  $('#sd-today').addEventListener('click', () => { schedDate = todayKey(); render('schedule', true); });
  $$('#view .wday').forEach(b => b.addEventListener('click', () => { schedDate = b.dataset.day; render('schedule', true); }));
  $$('#view .appt-block').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const a = S.appts.find(x => x.id === b.dataset.appt);
    if (a) openMenu(b, [{ id: 'h', label: '<b>' + esc(ptName(a.patientId)) + '</b> · ' + fmtTime(a.time), fn: () => apptModal(a) }, '-', ...apptActions(a)]);
  }));
  if (hrs) $$('#view .pcol').forEach(col => col.addEventListener('click', e => {
    if (e.target.closest('.appt-block')) return;
    const rect = col.getBoundingClientRect();
    let m = START + (e.clientY - rect.top) / pxPerMin;
    m = Math.round(m / 15) * 15;
    m = Math.max(timeToMin(hrs[0]), Math.min(m, timeToMin(hrs[1]) - 15));
    apptModal(null, { providerId: col.dataset.prov, date: schedDate, time: minToTime(m) });
  }));
}

/* -------- appointments -------- */
let apFilter = { status: 'all', range: 'upcoming', q: '' };
function vAppointments() {
  const tk = todayKey();
  let list = S.appts.slice();
  if (apFilter.range === 'upcoming') list = list.filter(a => a.date >= tk);
  else if (apFilter.range === 'today') list = list.filter(a => a.date === tk);
  else if (apFilter.range === 'past') { list = list.filter(a => a.date < tk).reverse(); }
  if (apFilter.status !== 'all') list = list.filter(a => a.status === apFilter.status);
  if (apFilter.q) { const q = apFilter.q.toLowerCase(); list = list.filter(a => ptName(a.patientId).toLowerCase().includes(q)); }
  const shown = list.slice(0, 60);

  const chips = [['all', 'All'], ['pending', 'Pending'], ['confirmed', 'Confirmed'], ['checked-in', 'Checked in'], ['completed', 'Completed'], ['no-show', 'No-show'], ['cancelled', 'Cancelled']]
    .map(([v, l]) => '<button class="chip' + (apFilter.status === v ? ' on' : '') + '" data-st="' + v + '">' + l + '</button>').join('');

  const rows = shown.map(a => {
    const p = P(a.patientId);
    const rem = S.log.filter(l => l.apptId === a.id);
    const smsSent = rem.some(l => l.channel === 'sms' && l.status === 'delivered');
    const emSent = rem.some(l => l.channel === 'email' && l.status === 'delivered');
    return '<tr><td class="num" style="white-space:nowrap"><b>' + relDay(a.date) + '</b> · ' + fmtTime(a.time) + '</td>' +
      '<td><span class="pt row-link" data-pt="' + p.id + '">' + avatar(p) + '<span><b>' + esc(p.first + ' ' + p.last) + '</b><span>' + esc(p.phone) + '</span></span></span></td>' +
      '<td>' + esc(VT(a.typeId).name) + '</td><td>' + provChip(a.providerId) + '</td><td>' + badge(a.status) + '</td>' +
      '<td><span class="rem-ics" title="Reminders">' +
      '<svg class="' + (smsSent ? 'sent' : '') + '" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.9A8 8 0 1 1 21 12z"/></svg>' +
      '<svg class="' + (emSent ? 'sent' : '') + '" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span></td>' +
      '<td style="text-align:right"><button class="icon-btn" data-menu="' + a.id + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button></td></tr>';
  }).join('');

  view().innerHTML =
    '<div class="page-head"><div><h2>Appointments</h2><div class="sub">' + list.length + ' appointment' + (list.length === 1 ? '' : 's') + (list.length > 60 ? ' · showing first 60' : '') + '</div></div>' +
    '<div class="head-actions"><select id="ap-range" class="btn" style="padding-right:8px">' +
    '<option value="upcoming"' + (apFilter.range === 'upcoming' ? ' selected' : '') + '>Upcoming</option>' +
    '<option value="today"' + (apFilter.range === 'today' ? ' selected' : '') + '>Today</option>' +
    '<option value="past"' + (apFilter.range === 'past' ? ' selected' : '') + '>Past</option>' +
    '<option value="all"' + (apFilter.range === 'all' ? ' selected' : '') + '>All</option></select>' +
    '<button class="btn btn-primary" id="ap-new">+ New appointment</button></div></div>' +
    '<div class="chip-row" style="margin-bottom:14px">' + chips + '</div>' +
    '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>When</th><th>Patient</th><th>Type</th><th>Provider</th><th>Status</th><th>Reminders</th><th></th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="7"><div class="empty"><b>Nothing here</b>Try a different filter.</div></td></tr>') +
    '</tbody></table></div></div>';

  $$('#view [data-st]').forEach(c => c.addEventListener('click', () => { apFilter.status = c.dataset.st; render('appointments', true); }));
  $('#ap-range').addEventListener('change', e => { apFilter.range = e.target.value; render('appointments', true); });
  $('#ap-new').addEventListener('click', () => apptModal());
  $$('#view [data-menu]').forEach(b => b.addEventListener('click', () => { const a = S.appts.find(x => x.id === b.dataset.menu); if (a) openMenu(b, apptActions(a)); }));
  $$('#view [data-pt]').forEach(el => el.addEventListener('click', () => openPatient(el.dataset.pt)));
}

/* -------- patients -------- */
let ptQuery = '';
function vPatients() {
  const q = ptQuery.toLowerCase();
  const list = S.patients.slice().sort((a, b) => (a.last + a.first).localeCompare(b.last + b.first))
    .filter(p => !q || (p.first + ' ' + p.last).toLowerCase().includes(q) || p.phone.includes(q));
  const tk = todayKey();
  const rows = list.map(p => {
    const next = S.appts.find(a => a.patientId === p.id && a.date >= tk && !['cancelled', 'no-show'].includes(a.status));
    const lastV = S.appts.slice().reverse().find(a => a.patientId === p.id && a.status === 'completed');
    return '<tr class="row-link" data-pt="' + p.id + '"><td><span class="pt">' + avatar(p) + '<span><b>' + esc(p.first + ' ' + p.last) + '</b><span>' + age(p.dob) + ' yrs</span></span></span></td>' +
      '<td class="num">' + esc(p.phone) + '</td><td>' + esc(p.ins) + '</td><td>' + p.channel + '</td>' +
      '<td>' + (lastV ? fmtDate(lastV.date) : '—') + '</td>' +
      '<td>' + (next ? '<b>' + relDay(next.date) + '</b> · ' + fmtTime(next.time) : '<span style="color:var(--faint)">none</span>') + '</td></tr>';
  }).join('');

  view().innerHTML =
    '<div class="page-head"><div><h2>Patients</h2><div class="sub">' + list.length + ' of ' + S.patients.length + ' patients</div></div>' +
    '<div class="head-actions"><input id="pt-q" type="text" class="btn" style="font-weight:500;min-width:200px" placeholder="Search name or phone…" value="' + esc(ptQuery) + '">' +
    '<button class="btn btn-primary" id="pt-new">+ Add patient</button></div></div>' +
    '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Patient</th><th>Phone</th><th>Insurance</th><th>Reminders by</th><th>Last visit</th><th>Next appointment</th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="6"><div class="empty"><b>No matches</b></div></td></tr>') + '</tbody></table></div></div>';

  const qi = $('#pt-q');
  qi.addEventListener('input', () => { ptQuery = qi.value; const pos = qi.selectionStart; render('patients', true); const nq = $('#pt-q'); nq.focus(); nq.setSelectionRange(pos, pos); });
  $('#pt-new').addEventListener('click', patientModal);
  $$('#view [data-pt]').forEach(r => r.addEventListener('click', () => openPatient(r.dataset.pt)));
}

/* -------- reminders -------- */
function vReminders() {
  const wkAgo = Date.now() - 7 * 86400000;
  const wk = S.log.filter(l => l.ts >= wkAgo && l.ts <= Date.now());
  const delivered = wk.filter(l => l.status === 'delivered').length;
  const failed = wk.filter(l => l.status === 'failed').length;
  const rate = delivered + failed ? Math.round(100 * delivered / (delivered + failed)) : 100;
  const confirms = wk.filter(l => l.reply).length;

  const ruleCard = r =>
    '<div class="rule' + (r.on ? '' : ' off') + '">' + chanIcon(r.channel).replace('class="ic', 'class="ic ' + r.channel) +
    '<div class="bd"><b>' + esc(r.name) + '</b><div class="tm">' + esc(r.timing) + '</div>' +
    '<div class="tpl">' + esc(r.template) + '</div>' +
    '<div class="lnk"><a href="#" data-edit="' + r.id + '">Edit</a>' + (r.channel === 'sms' ? '<a href="#" data-prev="' + r.id + '">Preview text</a>' : '') + '</div></div>' +
    '<label class="switch"><input type="checkbox" data-rule="' + r.id + '"' + (r.on ? ' checked' : '') + '><span class="tr"></span><span class="th"></span></label></div>';

  view().innerHTML =
    '<div class="page-head"><div><h2>Reminders</h2><div class="sub">Rules run automatically — no one has to remember to send anything.</div></div></div>' +
    '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">' +
    '<div class="stat"><div class="lbl">Sent this week</div><div class="val">' + wk.length + '</div><div class="sub">across text, email &amp; phone</div></div>' +
    '<div class="stat"><div class="lbl">Delivery rate</div><div class="val">' + rate + '%</div><div class="sub">' + failed + ' failed → moved to call list</div></div>' +
    '<div class="stat"><div class="lbl">Confirmed by reply</div><div class="val">' + confirms + '</div><div class="sub">patients texted back “Y”</div></div></div>' +
    '<div class="rule-grid">' + S.rules.map(ruleCard).join('') + '</div>' +
    '<div class="card"><div class="card-h"><h3>Activity log</h3><span class="sub">most recent first</span></div>' + feedHTML(S.log.slice(0, 18)) + '</div>';

  $$('#view [data-rule]').forEach(sw => sw.addEventListener('change', () => {
    const r = S.rules.find(x => x.id === sw.dataset.rule);
    r.on = sw.checked; save();
    toast('“' + r.name + '” turned ' + (r.on ? 'on' : 'off'));
    render('reminders', true);
  }));
  $$('#view [data-edit]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); ruleModal(a.dataset.edit); }));
  $$('#view [data-prev]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const r = S.rules.find(x => x.id === a.dataset.prev);
    const sample = S.appts.find(x => x.date >= todayKey() && x.status !== 'cancelled');
    openModal(modalShell('Preview — ' + esc(r.name),
      '<div class="phone"><div class="screen"><div class="ph-top"><div class="av">PM</div><b>Parkview Medical</b></div><div class="msgs"><div class="bubble">' + esc(renderTemplate(r.template, sample)) + '</div><div class="bubble me">Y</div><div class="bubble-meta" style="justify-self:end">Auto-confirmed ✓</div></div></div></div>',
      '<button class="btn" data-close>Close</button>'));
  }));
}

function ruleModal(id) {
  const r = S.rules.find(x => x.id === id);
  const ov = openModal(modalShell('Edit rule — ' + esc(r.name),
    '<div class="field"><label>When it sends</label><input id="rm-tm" type="text" value="' + esc(r.timing) + '"></div>' +
    '<div class="field"><label>Message template</label><textarea id="rm-tpl">' + esc(r.template) + '</textarea></div>' +
    '<div style="font-size:12px;color:var(--muted)">You can use <b>{first_name}</b>, <b>{provider}</b>, <b>{type}</b>, <b>{date}</b> and <b>{time}</b> — they fill in automatically for each patient.</div>',
    '<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="rm-save">Save rule</button>'));
  $('#rm-save', ov).addEventListener('click', () => {
    r.timing = $('#rm-tm', ov).value; r.template = $('#rm-tpl', ov).value;
    save(); ov.close(); toast('Rule updated'); render('reminders', true);
  });
}

/* -------- reports -------- */
function vReports() {
  const tk = todayKey();
  const days = [];
  for (let off = -27; off <= 0; off++) {
    const d = addDays(new Date(), off), k = dayKey(d);
    const v = S.appts.filter(a => a.date === k && !['cancelled'].includes(a.status)).length;
    days.push({ k, v, lbl: (d.getDay() === 0 || off === -27) ? fmtDate(k) : '' });
  }
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const from = dayKey(addDays(new Date(), -(w * 7 + 6))), to = dayKey(addDays(new Date(), -w * 7));
    const inWk = S.appts.filter(a => a.date >= from && a.date <= to);
    const seen = inWk.filter(a => a.status === 'completed').length, ns = inWk.filter(a => a.status === 'no-show').length;
    weeks.push({ lbl: w === 0 ? 'This wk' : w + ' wk' + (w > 1 ? 's' : '') + ' ago', v: seen + ns ? Math.round(1000 * ns / (seen + ns)) / 10 : 0, seen, ns });
  }
  const mFrom = dayKey(addDays(new Date(), -29));
  const month = S.appts.filter(a => a.date >= mFrom && a.date <= tk);
  const seenM = month.filter(a => a.status === 'completed').length;
  const nsM = month.filter(a => a.status === 'no-show').length;
  const newPt = month.filter(a => a.typeId === 't3' && a.status === 'completed').length;
  const byProv = PROVIDERS.map(pr => ({ pr, v: month.filter(a => a.providerId === pr.id && a.status === 'completed').length }));
  const maxProv = Math.max(1, ...byProv.map(b => b.v));

  view().innerHTML =
    '<div class="page-head"><div><h2>Reports</h2><div class="sub">Last 30 days at a glance.</div></div></div>' +
    '<div class="stat-grid">' +
    '<div class="stat"><div class="lbl">Visits completed</div><div class="val">' + seenM + '</div><div class="sub">last 30 days</div></div>' +
    '<div class="stat"><div class="lbl">No-show rate</div><div class="val">' + (seenM + nsM ? Math.round(1000 * nsM / (seenM + nsM)) / 10 : 0) + '%</div><div class="sub">' + nsM + ' missed visits</div></div>' +
    '<div class="stat"><div class="lbl">New patients</div><div class="val">' + newPt + '</div><div class="sub">completed first visits</div></div>' +
    '<div class="stat"><div class="lbl">Reminders sent</div><div class="val">' + S.log.length + '</div><div class="sub">recent period</div></div></div>' +
    '<div class="col">' +
    '<div class="card chart-card"><div class="card-h"><h3>Appointments per day</h3><span class="sub">last 4 weeks</span></div><div class="card-b"><div class="chart-wrap" id="ch1">' + barChartSVG(days, { aria: 'Appointments per day, last 4 weeks' }) + '</div><button class="data-toggle" data-tgl="tb1">View data</button><div id="tb1" hidden class="tbl-wrap data-tbl"><table class="tbl"><thead><tr><th>Date</th><th>Appointments</th></tr></thead><tbody>' + days.filter(d => d.v).map(d => '<tr><td>' + fmtDate(d.k) + '</td><td class="num">' + d.v + '</td></tr>').join('') + '</tbody></table></div></div></div>' +
    '<div class="card chart-card"><div class="card-h"><h3>No-show rate by week</h3><span class="sub">seen vs missed</span></div><div class="card-b"><div class="chart-wrap" id="ch2">' + lineChartSVG(weeks, { aria: 'No-show rate by week', pct: true, maxMin: 8 }) + '</div><button class="data-toggle" data-tgl="tb2">View data</button><div id="tb2" hidden class="tbl-wrap data-tbl"><table class="tbl"><thead><tr><th>Week</th><th>Seen</th><th>No-shows</th><th>Rate</th></tr></thead><tbody>' + weeks.map(w => '<tr><td>' + w.lbl + '</td><td class="num">' + w.seen + '</td><td class="num">' + w.ns + '</td><td class="num">' + w.v + '%</td></tr>').join('') + '</tbody></table></div></div></div>' +
    '<div class="card"><div class="card-h"><h3>Completed visits by provider</h3><span class="sub">last 30 days</span></div><div class="card-b">' +
    byProv.map(b => '<div class="hbar-row"><span class="nm"><span class="pdot" style="background:' + b.pr.color + '"></span>' + esc(b.pr.name) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:' + (100 * b.v / maxProv) + '%;background:' + b.pr.color + '"></div></div><span class="v">' + b.v + '</span></div>').join('') +
    '</div></div></div>';

  bindChartTips($('#ch1'), days, d => '<b>' + d.v + ' appointment' + (d.v === 1 ? '' : 's') + '</b><span>' + fmtDateLong(d.k) + '</span>');
  bindChartTips($('#ch2'), weeks, w => '<b>' + w.v + '% no-show</b><span>' + w.lbl + ' · ' + w.seen + ' seen, ' + w.ns + ' missed</span>');
  $$('#view [data-tgl]').forEach(b => b.addEventListener('click', () => { const t = $('#' + b.dataset.tgl); t.hidden = !t.hidden; b.textContent = t.hidden ? 'View data' : 'Hide data'; }));
}

/* -------- settings -------- */
function vSettings() {
  const st = S.settings;
  const hoursRows = DOWS.map((d, i) => {
    const h = HOURS[i];
    return '<div class="hours-row"><span class="dy">' + d.slice(0, 3) + '</span>' +
      (h ? '<input type="time" value="' + h[0] + '" disabled><span style="text-align:center;color:var(--faint)">–</span><input type="time" value="' + h[1] + '" disabled><span></span>'
        : '<span class="closed-l" style="grid-column:2/-1">Closed</span>') + '</div>';
  }).join('');

  view().innerHTML =
    '<div class="page-head"><div><h2>Settings</h2><div class="sub">Practice details, hours and reminder sending.</div></div></div>' +
    '<div class="set-grid">' +
    '<div class="col"><div class="card"><div class="card-h"><h3>Practice details</h3></div><div class="card-b">' +
    '<div class="field"><label>Practice name</label><input id="st-name" value="' + esc(st.practice) + '"></div>' +
    '<div class="field"><label>Phone</label><input id="st-phone" value="' + esc(st.phone) + '"></div>' +
    '<div class="field"><label>Address</label><input id="st-addr" value="' + esc(st.address) + '"></div>' +
    '<button class="btn btn-primary" id="st-save">Save details</button></div></div>' +
    '<div class="card"><div class="card-h"><h3>Reminder sending</h3></div><div class="card-b">' +
    '<div class="field"><label>Texts &amp; calls come from</label><input id="st-sms" value="' + esc(st.smsFrom) + '"></div>' +
    '<div class="field"><label>Emails come from</label><input id="st-em" value="' + esc(st.emailFrom) + '"></div>' +
    '<button class="btn btn-primary" id="st-save2">Save sending</button></div></div></div>' +
    '<div class="col"><div class="card"><div class="card-h"><h3>Office hours</h3><span class="sub">sample schedule</span></div><div class="card-b">' + hoursRows + '</div></div>' +
    '<div class="card"><div class="card-h"><h3>Providers</h3></div><div class="card-b">' +
    PROVIDERS.map(p => '<div class="prov-row"><span class="pdot" style="background:' + p.color + '"></span><span><b>' + esc(p.name) + ', ' + p.cred + '</b> <span>· ' + esc(p.spec) + '</span></span></div>').join('') + '</div></div>' +
    '<div class="card"><div class="card-h"><h3>Visit types</h3></div><div class="card-b">' +
    VTYPES.map(t => '<div class="vt-row">' + esc(t.name) + '<span class="dur">' + t.dur + ' min</span></div>').join('') + '</div></div>' +
    '<div class="card"><div class="card-h"><h3>Demo data</h3></div><div class="card-b" style="display:flex;gap:12px;align-items:center;justify-content:space-between"><span style="font-size:13px;color:var(--muted)">Put everything back the way it started.</span><button class="btn btn-danger" id="st-reset">Reset demo</button></div></div>' +
    '</div></div>';

  const saveDetails = () => {
    st.practice = $('#st-name').value; st.phone = $('#st-phone').value; st.address = $('#st-addr').value;
    st.smsFrom = $('#st-sms').value; st.emailFrom = $('#st-em').value;
    save(); toast('Settings saved');
  };
  $('#st-save').addEventListener('click', saveDetails);
  $('#st-save2').addEventListener('click', saveDetails);
  $('#st-reset').addEventListener('click', () => {
    const ov = openModal(modalShell('Reset demo data?', '<p style="font-size:13.5px;color:var(--ink-2)">This clears everything you changed and regenerates fresh sample data. Nothing real is affected — it’s all demo.</p>', '<button class="btn" data-close>Keep my changes</button><button class="btn btn-danger" id="rs-yes">Yes, reset</button>'));
    $('#rs-yes', ov).addEventListener('click', () => { localStorage.removeItem(LS_KEY); location.reload(); });
  });
}

/* ================= router ================= */
const ROUTES = { dashboard: vDashboard, schedule: vSchedule, appointments: vAppointments, patients: vPatients, reminders: vReminders, reports: vReports, settings: vSettings };
function render(route, force) {
  if (!ROUTES[route]) route = 'dashboard';
  current = route;
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.r === route));
  ROUTES[route]();
  $('#app').classList.remove('nav-open');
  if (!force) view().scrollTop = 0;
}
window.addEventListener('hashchange', () => { render(location.hash.replace('#/', '') || 'dashboard'); closeMenu(); });

/* ================= boot & shell wiring ================= */
function enterApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  sessionStorage.setItem('pvAuth', '1');
  if (!location.hash || location.hash === '#/') location.hash = '#/dashboard';
  render(location.hash.replace('#/', '') || 'dashboard');
  updateBadges();
}

load();

$('#login-form').addEventListener('submit', e => {
  e.preventDefault();
  const b = $('#lg-btn');
  b.disabled = true; b.textContent = 'Signing in…';
  setTimeout(() => { enterApp(); b.disabled = false; b.textContent = 'Sign in'; }, 650);
});

if (sessionStorage.getItem('pvAuth') === '1') enterApp();

$('#hamburger').addEventListener('click', () => $('#app').classList.toggle('nav-open'));
$('#new-appt-btn').addEventListener('click', () => apptModal());
$('#user-chip').addEventListener('click', e => openMenu(e.currentTarget, [
  { id: 'so', label: 'Sign out', fn: () => { sessionStorage.removeItem('pvAuth'); $('#app').hidden = true; $('#login').hidden = false; } }
]));

/* notifications */
$('#notif-btn').addEventListener('click', () => {
  const existing = $('.notif-drop');
  if (existing) { existing.remove(); return; }
  const items = notifItems();
  const drop = document.createElement('div');
  drop.className = 'notif-drop';
  drop.innerHTML = '<div class="nd-h">Awaiting confirmation</div>' +
    (items.length ? '<ul>' + items.map(a => '<li>' + avatar(P(a.patientId)) + '<span class="nb"><b>' + esc(ptName(a.patientId)) + '</b><div class="m">' + relDay(a.date) + ' at ' + fmtTime(a.time) + ' · ' + esc(PR(a.providerId).name) + '</div></span><button class="btn btn-sm" data-cf="' + a.id + '">Confirm</button></li>').join('') + '</ul>'
      : '<div class="empty" style="padding:22px"><b>All confirmed</b>No appointments waiting.</div>');
  $('#notif-wrap').appendChild(drop);
  $$('[data-cf]', drop).forEach(b => b.addEventListener('click', () => { setStatus(b.dataset.cf, 'confirmed'); drop.remove(); }));
  setTimeout(() => document.addEventListener('mousedown', function h(e) { if (!drop.contains(e.target) && e.target.id !== 'notif-btn' && !e.target.closest('#notif-btn')) { drop.remove(); document.removeEventListener('mousedown', h); } }), 0);
});

/* global search */
const gs = $('#global-search');
gs.addEventListener('input', () => {
  const q = gs.value.trim().toLowerCase();
  const old = $('.search-drop'); if (old) old.remove();
  if (q.length < 2) return;
  const pts = S.patients.filter(p => (p.first + ' ' + p.last).toLowerCase().includes(q) || p.phone.includes(q)).slice(0, 5);
  const aps = S.appts.filter(a => a.date >= todayKey() && ptName(a.patientId).toLowerCase().includes(q)).slice(0, 4);
  if (!pts.length && !aps.length) return;
  const drop = document.createElement('div');
  drop.className = 'search-drop';
  drop.innerHTML =
    (pts.length ? '<div class="sd-head">Patients</div>' + pts.map(p => '<button data-spt="' + p.id + '">' + avatar(p) + '<b>' + esc(p.first + ' ' + p.last) + '</b><span class="sd-sub">' + esc(p.phone) + '</span></button>').join('') : '') +
    (aps.length ? '<div class="sd-head">Upcoming appointments</div>' + aps.map(a => '<button data-sap="' + a.id + '"><b>' + esc(ptName(a.patientId)) + '</b><span class="sd-sub">' + relDay(a.date) + ' · ' + fmtTime(a.time) + '</span></button>').join('') : '');
  $('#searchbox').appendChild(drop);
  $$('[data-spt]', drop).forEach(b => b.addEventListener('click', () => { drop.remove(); gs.value = ''; openPatient(b.dataset.spt); }));
  $$('[data-sap]', drop).forEach(b => b.addEventListener('click', () => { drop.remove(); gs.value = ''; const a = S.appts.find(x => x.id === b.dataset.sap); if (a) { schedDate = a.date; location.hash = '#/schedule'; render('schedule', true); } }));
});
document.addEventListener('mousedown', e => { const d = $('.search-drop'); if (d && !d.contains(e.target) && e.target !== gs) d.remove(); });
