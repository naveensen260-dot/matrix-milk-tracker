/* MATRIX Milk Tracker \u2014 app logic (runs inside the Android WebView) */
(() => {
"use strict";

/* Admin can put the Apps Script Web app URL here before building the APK,
   so field staff never see the setup screen. Leave "" to ask on first launch. */
const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbyGZq0pBVsh9l-kBsVw4sJDXnXYd4dvmW-Lm3TvwJYYkJ_j3KaFoIdzpJbCNprrqMfS/exec";

/* WEB mode: the same page is served by Apps Script itself (open the /exec link in Chrome).
   Then calls go through google.script.run and models load from the CDN. */
const WEB = !!(window.google && google.script && google.script.run);
const MODEL_URL = WEB ? "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model" : "models";

/* Simdega Sadar AWC list: [sector, AWC name, AWC code] */
let AWC = [
  ["Sector-1", "Kullukera 1", "20367060101"],
  ["Sector-1", "Kullukera 2", "20367060102"],
  ["Sector-1", "Hathabadi", "20367060103"],
  ["Sector-1", "Diya Patthal Kullukera", "20367060104"],
  ["Sector-1", "Derda", "20367060105"],
  ["Sector-1", "Banabira 1", "20367060106"],
  ["Sector-1", "Banabira 2", "20367060107"],
  ["Sector-1", "Karamtoli", "20367060108"],
  ["Sector-1", "Chandtanger", "20367060109"],
  ["Sector-1", "Pakarkachhar", "20367060110"],
  ["Sector-1", "Banmara", "20367060111"],
  ["Sector-1", "Kumbalata", "20367060112"],
  ["Sector-1", "Jadatoli", "20367060113"],
  ["Sector-1", "Kolbahar", "20367060114"],
  ["Sector-1", "Masekera", "20367060115"],
  ["Sector-1", "Kadopani", "20367060116"],
  ["Sector-1", "Ghusrutoli", "20367060117"],
  ["Sector-1", "Chhuritanger", "20367060118"],
  ["Sector-1", "Patiyapani", "20367060119"],
  ["Sector-1", "Mangarpani", "20367060120"],
  ["Sector-1", "Longepani", "20367060121"],
  ["Sector-1", "Tainsera Dumardih", "20367060122"],
  ["Sector-1", "Kinderdega 1", "20367060123"],
  ["Sector-1", "Kinderdega 2", "20367060124"],
  ["Sector-1", "Kinbira 1", "20367060125"],
  ["Sector-1", "Kinbira 2", "20367060126"],
  ["Sector-1", "Tainsera 1", "20367060127"],
  ["Sector-1", "Tainsera 2", "20367060128"],
  ["Sector-1", "Chiyaarikaani", "20367060129"],
  ["Sector-1", "Bakrikona", "20367060130"],
  ["Sector-1", "Sahighutra", "20367060131"],
  ["Sector-1", "Bhumbhu", "20367060132"],
  ["Sector-1", "Jharaindeepa", "20367060133"],
  ["Sector-1", "Diya Pathhal Pahartoli", "20367060134"],
  ["Sector-2", "Sewai Khuntitoli", "20367060201"],
  ["Sector-2", "Sewai Chirotoli", "20367060202"],
  ["Sector-2", "Sewai Nawatoil", "20367060203"],
  ["Sector-2", "Sewai Khass", "20367060204"],
  ["Sector-2", "Sewai Pakritoli", "20367060205"],
  ["Sector-2", "Goreyabahar", "20367060206"],
  ["Sector-2", "Sansewai Choytatoli", "20367060207"],
  ["Sector-2", "Sansewai Bhadratoli 1", "20367060208"],
  ["Sector-2", "Khapratoli", "20367060209"],
  ["Sector-2", "Sansewai Bhadratoli 2", "20367060210"],
  ["Sector-2", "Bhadratoli Nawakhoir", "20367060211"],
  ["Sector-2", "Rigdi Khass", "20367060212"],
  ["Sector-2", "Meromloya", "20367060213"],
  ["Sector-2", "Jamunakhair", "20367060214"],
  ["Sector-2", "Tumdegi", "20367060215"],
  ["Sector-2", "Gulda", "20367060216"],
  ["Sector-2", "Badkichhapar", "20367060217"],
  ["Sector-2", "Pithra Mahkurtoli", "20367060218"],
  ["Sector-2", "Pithra Tetartoli", "20367060219"],
  ["Sector-2", "Dhawthatoli", "20367060220"],
  ["Sector-2", "Pithra Bandhartoli + Dukhnatoli", "20367060221"],
  ["Sector-2", "Pithra Bandhtoli", "20367060222"],
  ["Sector-2", "Pithra Nawatoli", "20367060223"],
  ["Sector-2", "Dukhnatoli", "20367060224"],
  ["Sector-2", "Jakutoli", "20367060225"],
  ["Sector-2", "Rigdi Kaseratoli", "20367060226"],
  ["Sector-2", "SEWAI", "20367060227"],
  ["Sector-3", "Birkera Ambatoli", "20367060301"],
  ["Sector-3", "Bendojor", "20367060302"],
  ["Sector-3", "Kochedega Bhandartoli", "20367060303"],
  ["Sector-3", "Kochedega Khass", "20367060304"],
  ["Sector-3", "Kochedega Mahuaa Toli", "20367060305"],
  ["Sector-3", "Lukibahaar", "20367060306"],
  ["Sector-3", "Banspahar", "20367060307"],
  ["Sector-3", "Kochedega Nawatoli", "20367060308"],
  ["Sector-3", "Bendojor Karanjtoli", "20367060309"],
  ["Sector-3", "Charkapathar", "20367060310"],
  ["Sector-3", "Maniramtoli", "20367060311"],
  ["Sector-3", "Garja Jhimotoli", "20367060312"],
  ["Sector-3", "Garja Dipatoli", "20367060313"],
  ["Sector-3", "Garja Bhandartoli", "20367060314"],
  ["Sector-3", "Garja Branham Toli", "20367060315"],
  ["Sector-3", "Tilga Meda Toli", "20367060316"],
  ["Sector-3", "Jamadohar", "20367060317"],
  ["Sector-3", "Tirra Bhandartoli", "20367060318"],
  ["Sector-3", "Kasaidohar", "20367060319"],
  ["Sector-3", "Katukona 1", "20367060320"],
  ["Sector-3", "Tirra Jam Toli", "20367060321"],
  ["Sector-3", "Katukona-2", "20367060322"],
  ["Sector-3", "Khijari Nawa Toli", "20367060323"],
  ["Sector-3", "Sainpur 2", "20367060324"],
  ["Sector-3", "Khijri Khaas", "20367060325"],
  ["Sector-3", "Saamtoli", "20367060326"],
  ["Sector-3", "Saipour Khas", "20367060327"],
  ["Sector-3", "Purnapani", "20367060328"],
  ["Sector-3", "Mahto Toli", "20367060329"],
  ["Sector-3", "Munj Beda", "20367060330"],
  ["Sector-3", "Gada Toli", "20367060331"],
  ["Sector-4", "Gadra Bahar", "20367060401"],
  ["Sector-4", "Sladega-1", "20367060402"],
  ["Sector-4", "Saldega-2", "20367060403"],
  ["Sector-4", "Ramjanki Mandir", "20367060404"],
  ["Sector-4", "Prince Chauk", "20367060405"],
  ["Sector-4", "Saldega Bartoli", "20367060406"],
  ["Sector-4", "Tongri Toli", "20367060407"],
  ["Sector-4", "Kelaghagh", "20367060408"],
  ["Sector-4", "Budhra Toli", "20367060409"],
  ["Sector-4", "Dumber Toli", "20367060410"],
  ["Sector-4", "Khairan Toli", "20367060411"],
  ["Sector-4", "Bajar Toli", "20367060412"],
  ["Sector-4", "Ghocho Toli", "20367060413"],
  ["Sector-4", "Bhatthi Toli", "20367060414"],
  ["Sector-4", "Gosain Toli", "20367060415"],
  ["Sector-4", "Kharwa Toli", "20367060416"],
  ["Sector-4", "Idgah Muhalla", "20367060417"],
  ["Sector-4", "Talab Muhalla", "20367060418"],
  ["Sector-4", "Maina Beda", "20367060419"],
  ["Sector-4", "Kubitoli", "20367060420"],
  ["Sector-4", "Thakur Toli", "20367060421"],
  ["Sector-4", "Dipti Toli-1", "20367060422"],
  ["Sector-4", "Dhebar Gram", "20367060423"],
  ["Sector-4", "Sunder Pur", "20367060424"],
  ["Sector-4", "Sonar Toli", "20367060425"],
  ["Sector-4", "Gotra Nawa Toli", "20367060426"],
  ["Sector-4", "Dipti Toli-2", "20367060427"],
  ["Sector-4", "Farsabeda-1", "20367060428"],
  ["Sector-4", "Farsabeda-2", "20367060429"],
  ["Sector-4", "Khunti Toli-1", "20367060430"],
  ["Sector-4", "Khunti Toli-2", "20367060431"],
  ["Sector-4", "Bangru-1", "20367060432"],
  ["Sector-4", "Bangru-2", "20367060433"],
  ["Sector-4", "Madhuban", "20367060434"],
  ["Sector-5", "Tamra Kumhartoli", "20367060501"],
  ["Sector-5", "Tamra Khass", "20367060502"],
  ["Sector-5", "Darji Muhallah", "20367060503"],
  ["Sector-5", "Kamtara", "20367060504"],
  ["Sector-5", "Tabhadih 1", "20367060505"],
  ["Sector-5", "Tabhadih 2", "20367060506"],
  ["Sector-5", "Chiksura", "20367060507"],
  ["Sector-5", "Konsera", "20367060508"],
  ["Sector-5", "Budhikutain", "20367060509"],
  ["Sector-5", "Harindhara", "20367060510"],
  ["Sector-5", "Biru Brahmantoli", "20367060511"],
  ["Sector-5", "Biru Lohratoli", "20367060512"],
  ["Sector-5", "Biru Patratoli", "20367060513"],
  ["Sector-5", "Bhedikudar 1", "20367060514"],
  ["Sector-5", "Bhedikudar 2", "20367060515"],
  ["Sector-5", "Pindatanger", "20367060516"],
  ["Sector-5", "Ghosra", "20367060517"],
  ["Sector-5", "Fulwartangar", "20367060518"],
  ["Sector-5", "Araani", "20367060519"],
  ["Sector-5", "Bindhaintoli", "20367060520"],
  ["Sector-5", "Birkera", "20367060521"],
  ["Sector-5", "Fulwartanger Nawatoli", "20367060522"],
  ["Sector-5", "Saraipani", "20367060523"],
  ["Sector-5", "Bakratangar", "20367060524"],
  ["Sector-5", "Londraropa", "20367060525"],
  ["Sector-5", "Chikdera", "20367060526"],
  ["Sector-5", "Pandripani", "20367060527"],
  ["Sector-5", "Jharitoli", "20367060528"],
  ["Sector-5", "Bhuskitangar", "20367060529"],
  ["Sector-5", "Saraitoli", "20367060530"],
  ["Sector-5", "Jhariyadeepa", "20367060531"],
  ["Sector-6", "Kudrum Purabtoli", "20367060601"],
  ["Sector-6", "Kudrum Pahantoli", "20367060602"],
  ["Sector-6", "Bhawarpani Kathaltoli", "20367060603"],
  ["Sector-6", "Barabarpani", "20367060604"],
  ["Sector-6", "Bernibeda", "20367060605"],
  ["Sector-6", "Belgarh", "20367060606"],
  ["Sector-6", "Bhawarpani Bhandartoli", "20367060607"],
  ["Sector-6", "Jokpani", "20367060608"],
  ["Sector-6", "Jokbahar Dipatoli", "20367060609"],
  ["Sector-6", "Jokbahar Birangatoli", "20367060610"],
  ["Sector-6", "Purnadih", "20367060611"],
  ["Sector-6", "Muria Pujartoli", "20367060612"],
  ["Sector-6", "Muria Dhanaitoli", "20367060613"],
  ["Sector-6", "Tholkobeda", "20367060614"],
  ["Sector-6", "Kereyabeda", "20367060615"],
  ["Sector-6", "Kunutoli", "20367060616"],
  ["Sector-6", "Muria Sutram", "20367060617"],
  ["Sector-6", "Muria Pahartoli", "20367060618"],
  ["Sector-7", "Sarkhutoli", "20367060701"],
  ["Sector-7", "Kairbeda Dumardih", "20367060702"],
  ["Sector-7", "Kairbeda 1", "20367060703"],
  ["Sector-7", "Kairbeda 2", "20367060704"],
  ["Sector-7", "Keshalpur 1", "20367060705"],
  ["Sector-7", "Keshalpur 2", "20367060706"],
  ["Sector-7", "Paledih 1", "20367060707"],
  ["Sector-7", "Rengarpani", "20367060708"],
  ["Sector-7", "Haldibeda", "20367060709"],
  ["Sector-7", "Nanesera 1", "20367060710"],
  ["Sector-7", "Nanesera 2", "20367060711"],
  ["Sector-7", "Keshalpur Karamtoli", "20367060712"],
  ["Sector-7", "Nanesera Kayontoli", "20367060713"],
  ["Sector-7", "Gareya Paledih", "20367060714"],
  ["Sector-7", "Paledih 2", "20367060715"],
  ["Sector-7", "kairbera", "20367060716"],
  ["Sector-8", "Kobang", "20367060801"],
  ["Sector-8", "Thethaitangar", "20367060802"],
  ["Sector-8", "Gothaintangar", "20367060803"],
  ["Sector-8", "Ramloya", "20367060804"],
  ["Sector-8", "Pakartanr Nawatoli", "20367060805"],
  ["Sector-8", "Pakartanr 1", "20367060806"],
  ["Sector-8", "Pakartanr 2", "20367060807"],
  ["Sector-8", "Purnapani", "20367060808"],
  ["Sector-8", "Kyonddih 1", "20367060809"],
  ["Sector-8", "Kyonddih 2", "20367060810"],
  ["Sector-8", "Jaamtoli", "20367060811"],
  ["Sector-8", "Basantpur", "20367060812"],
  ["Sector-8", "Grondabeda", "20367060813"],
  ["Sector-8", "Jhumkatanr", "20367060814"],
  ["Sector-8", "Kobang Mosotoli", "20367060815"],
  ["Sector-8", "Sikariyatanr Bhandartoli", "20367060816"],
  ["Sector-8", "Saindih Mahuatoli", "20367060817"],
  ["Sector-8", "Dipatoli-1", "20367060818"],
  ["Sector-8", "Dipatoli-2", "20367060819"],
  ["Sector-8", "Sogra-1", "20367060820"],
  ["Sector-8", "Sogra-2", "20367060821"],
  ["Sector-8", "Sogra Banetoli", "20367060822"],
  ["Sector-8", "Sogra Ghoyotoli", "20367060823"],
  ["Sector-8", "Sogra Dongatoli", "20367060824"],
  ["Sector-8", "Saindih Girijatoli", "20367060825"],
  ["Sector-8", "Sikariyatanr Patratoli", "20367060826"],
  ["Sector-8", "Chogotoli", "20367060827"],
  ["Sector-9", "Belwadih", "20367060901"],
  ["Sector-9", "Ghaghra", "20367060902"],
  ["Sector-9", "Danrgurda", "20367060903"],
  ["Sector-9", "Japkakona", "20367060904"],
  ["Sector-9", "Pahargurda", "20367060905"],
  ["Sector-9", "Bhundupani", "20367060906"],
  ["Sector-9", "Lailonga", "20367060907"],
  ["Sector-9", "Bagichatoli Bajartanr", "20367060908"],
  ["Sector-9", "Sarlonga", "20367060909"],
  ["Sector-9", "Tilaitanr", "20367060910"],
  ["Sector-9", "Katasaru", "20367060911"],
  ["Sector-9", "Krushkela Khas", "20367060912"],
  ["Sector-9", "Kumharbandh", "20367060913"],
  ["Sector-9", "Bhundutoli", "20367060914"],
  ["Sector-9", "Bhelwadih Purabtoli", "20367060915"],
  ["Sector-9", "Sirupradhiya", "20367060916"],
  ["Sector-9", "Kadrukona", "20367060917"],
  ["Sector-9", "Takba", "20367060918"],
  ["Sector-9", "Karamukha", "20367060919"],
  ["Sector-9", "Khanjaloya", "20367060920"],
  ["Sector-9", "Asanbeda", "20367060921"],
  ["Sector-9", "Gondlipani", "20367060922"],
  ["Sector-9", "Nongara", "20367060923"],
  ["Sector-9", "Sarubeda", "20367060924"],
  ["Sector-9", "Lawabair", "20367060925"],
  ["Sector-9", "Krushkela Bagichatoli", "20367060926"],
  ["Sector-9", "Karambhadi", "20367060927"]
];
const awcLabel = a => `${a[1]} (${a[2]})`;
let AWC_BY_LABEL = new Map(AWC.map(a => [awcLabel(a).toLowerCase(), a]));
const sectorOf = label => (AWC_BY_LABEL.get(String(label || "").toLowerCase()) || [""])[0];
let SECTORS = [...new Set(AWC.map(a => a[0]))];
/* AWCs where milk is given (set by District Management on the server). null = not loaded yet */
let AWC_ON = null, AWC_INFO = new Map();
const awcOn = a => !AWC_ON || AWC_ON.has(a[2]);
function setAwcList(list){
  list.forEach(x => {
    if (!AWC.some(a => a[2] === x.code)) AWC.push([x.sector, x.name, x.code]);
    else { const a = AWC.find(y => y[2] === x.code); a[0] = x.sector; a[1] = x.name; }
    AWC_INFO.set(x.code, x);
  });
  AWC_ON = new Set(list.filter(x => x.active).map(x => x.code));
  AWC.sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }) || a[2].localeCompare(b[2]));
  AWC_BY_LABEL = new Map(AWC.map(a => [awcLabel(a).toLowerCase(), a]));
  SECTORS = [...new Set(AWC.map(a => a[0]))].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}
let awcFcs = [], awcFcsList = [];
async function loadAwcList(all){
  try {
    const r = await api("awcList", all ? { all: true } : {});
    if (all) awcFcsList = r.fcs || [];
    setAwcList(r.awcs); if (!all) store.set("mt.awcs", JSON.stringify(r.awcs));
    if (typeof renderAwcPicker === "function"){ $("#sSector").innerHTML = `<option value="">Sabhi sector</option>` + SECTORS.map(x => `<option>${x}</option>`).join(""); renderAwcPicker(); }
    return r.awcs;
  } catch(e){ return null; }
}
try { const c = JSON.parse(store.get("mt.awcs") || "null"); if (c) setAwcList(c); } catch(e){}
const R_MA = "Milk Ambassador", R_FC = "Field Coordinator", R_DM = "District Management", R_SM = "Senior Management";

const FACE_MATCH_MAX = 0.55;      // euclidean distance; lower = more similar
const HOME_AFTER_FAIL_SEC = 8;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => ymd(new Date());

const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k, v){ try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch(e){} }
};
const S = {
  api: store.get("mt.api") || DEFAULT_API_URL,
  token: store.get("mt.token") || "",
  user: JSON.parse(store.get("mt.user") || "null")
};

let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3500); }

/* ---------------- server ---------------- */
function gasCall(payload){
  return new Promise((res, rej) => google.script.run
    .withSuccessHandler(t => { try { res(JSON.parse(t)); } catch(e){ rej(e); } })
    .withFailureHandler(e => rej(e))
    .api(payload));
}
async function api(action, data = {}){
  if (WEB){
    let j;
    try { j = await gasCall(JSON.stringify(Object.assign({ action, token: S.token }, data))); }
    catch(e){ const er = new Error("Internet ya server se connection nahi hua. Network check karke dobara try karein."); er.offline = true; throw er; }
    if (!j.ok){ const err = new Error(j.error || "Kuch galat hua."); err.code = j.code; if (j.code === "AUTH"){ logoutLocal(); toast(j.error); } throw err; }
    return j;
  }
  if (!S.api) throw new Error("Server link set nahi hai.");
  let r;
  try {
    r = await fetch(S.api, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ action, token: S.token }, data)) });
  } catch(e){ const er = new Error("Internet ya server se connection nahi hua. Network check karke dobara try karein."); er.offline = true; throw er; }
  let j;
  try { j = await r.json(); } catch(e){ throw new Error("Server ka jawab samajh nahi aaya. Server link sahi hai?"); }
  if (!j.ok){
    const err = new Error(j.error || "Kuch galat hua."); err.code = j.code;
    if (j.code === "AUTH"){ logoutLocal(); toast(j.error); }
    throw err;
  }
  return j;
}
function busy(btn, on, label){
  if (!btn) return;
  if (on){ btn.dataset.label = btn.innerHTML; btn.innerHTML = `<span class="busy"></span> ${label || "Ruko\u2026"}`; btn.disabled = true; }
  else { if (btn.dataset.label) btn.innerHTML = btn.dataset.label; btn.disabled = false; }
}

/* ---------------- navigation ---------------- */
const TITLES = { awcs: "AWC list", kids: "Bachche ki list", arch: "Data Archive", lang: "Bhasha / \u092d\u093e\u0937\u093e / Language", home: "MATRIX Milk Tracker", reg: "Bachcha / Wajan", milk: "Doodh pilao", rep: "Reports", users: "Users / Accounts" };
let current = "";
function show(name){
  current = name;
  $$("main").forEach(m => m.hidden = m.id !== "scr-" + name);
  const inApp = ["home","reg","milk","rep","users","lang","arch","kids","awcs"].includes(name);
  $("#bar").hidden = !inApp;
  $("#barTitle").textContent = TITLES[name] || "MATRIX Milk Tracker";
  $("#backBtn").hidden = name === "home" || name === "lang" || !inApp;
  $("#logoutBtn").hidden = name !== "home";
  $("#langBtn").hidden = name !== "home";
  window.scrollTo(0, 0);
  if (name === "home") renderHome();
  if (name === "reg") openReg();
  if (name === "milk") openMilk();
  if (name === "rep") openRep();
  if (name === "users") openUsers();
  if (name === "arch") openArch();
  if (name === "kids") openKids();
  if (name === "awcs") openAwcs();
  renderNetBar();
}
$("#backBtn").onclick = () => show("home");
/* "growth" opens the registration screen straight on the Wajan / Lambai tab */
function go(name){
  if (name !== "growth" && name !== "reg") return show(name);
  show("reg");
  const t = document.querySelector(name === "growth" ? '[data-reg="growth"]' : '[data-reg="new"]'); if (t) t.click();
}
$$("[data-go]").forEach(b => b.onclick = () => show(b.dataset.go));
window.addEventListener("popstate", () => { if (current !== "home" && S.token) show("home"); });

/* ---------------- result overlay ---------------- */
const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
let ovTimer = null;
function overlay({ ok, title, sub, actions = [], autoHomeSec = 0 }){
  clearInterval(ovTimer);
  const o = $("#ov"); o.className = "overlay " + (ok ? "ok" : "bad");
  $("#ovMark").innerHTML = ok ? TICK : CROSS;
  $("#ovTitle").textContent = title; $("#ovSub").textContent = sub || "";
  const acts = $("#ovActs"); acts.innerHTML = "";
  actions.forEach(a => { const b = document.createElement("button"); b.type = "button"; b.className = "btn block " + (a.cls || "ghost"); b.textContent = a.label; b.onclick = () => { closeOverlay(); a.run && a.run(); }; acts.appendChild(b); });
  o.hidden = false;
  if (autoHomeSec){
    let left = autoHomeSec;
    const base = sub || "";
    const tick = () => { $("#ovSub").textContent = base + ` (${left} second mein Home)`; if (left-- <= 0){ closeOverlay(); show("home"); } };
    tick(); ovTimer = setInterval(tick, 1000);
  }
}
function closeOverlay(){ clearInterval(ovTimer); $("#ov").hidden = true; }

/* ---------------- setup ---------------- */
$("#setupForm").onsubmit = async e => {
  e.preventDefault();
  const url = $("#apiUrl").value.trim();
  $("#setupErr").textContent = "";
  if (!/^(https:\/\/\S+|http:\/\/(localhost|127\.0\.0\.1)[:\/]\S*)$/.test(url)){ $("#setupErr").textContent = "Poora https:// wala link paste karein."; return; }
  const old = S.api; S.api = url;
  busy($("#setupSave"), true, "Check kar rahe hain\u2026");
  try { await api("ping"); store.set("mt.api", url); show("auth"); toast("Server se jud gaye."); loadAwcList(); }
  catch(err){ S.api = old; $("#setupErr").textContent = err.message; }
  finally { busy($("#setupSave"), false); }
};
$("#changeServer").onclick = () => { $("#apiUrl").value = S.api || ""; show("setup"); };

/* ---------------- auth ---------------- */
$$("[data-auth]").forEach(b => b.onclick = () => {
  $$("[data-auth]").forEach(x => x.setAttribute("aria-selected", String(x === b)));
  $("#loginForm").hidden = b.dataset.auth !== "login"; $("#signupForm").hidden = b.dataset.auth !== "signup";
});
/* signup AWC picker */
const awcPicked = new Set();
function renderAwcPicker(){
  const sec = $("#sSector").value, q = $("#sAwcSearch").value.trim().toLowerCase();
  const list = AWC.filter(a => awcOn(a) && (!sec || a[0] === sec) && (!q || (a[1] + " " + a[2]).toLowerCase().includes(q)));
  $("#sAwcList").innerHTML = list.map(a => { const l = awcLabel(a);
    return `<label><input type="checkbox" value="${esc(l)}"${awcPicked.has(l) ? " checked" : ""}> <span>${esc(a[1])} <small>${esc(a[2])} \u00b7 ${esc(a[0])}</small></span></label>`; }).join("")
    || `<p class="muted" style="padding:8px">Koi AWC nahi mila.</p>`;
  $("#sAwcPicked").textContent = awcPicked.size ? "Chune gaye: " + [...awcPicked].join(", ") : "Abhi koi AWC nahi chuna.";
}
$("#sSector").innerHTML = `<option value="">Sabhi sector</option>` + SECTORS.map(x => `<option>${x}</option>`).join("");
$("#sSector").onchange = renderAwcPicker; $("#sAwcSearch").addEventListener("input", renderAwcPicker);
$("#sAwcList").addEventListener("change", e => { const c = e.target; if (c.type !== "checkbox") return; c.checked ? awcPicked.add(c.value) : awcPicked.delete(c.value); renderAwcPicker(); });
renderAwcPicker();

$("#sSecList").innerHTML = SECTORS.map(x => `<label><input type="checkbox" value="${x}"> ${x}</label>`).join("");
function roleChanged(){
  const role = (document.querySelector("input[name=sRole]:checked") || {}).value;
  $("#sCodeWrap").hidden = role === R_MA;
  $("#sPanchWrap").hidden = role !== R_MA;
  $("#sSecWrap").hidden = role !== R_FC;
}
$$("input[name=sRole]").forEach(r => r.onchange = roleChanged);

function loggedIn(res){
  S.token = res.token; S.user = res.user;
  store.set("mt.token", res.token); store.set("mt.user", JSON.stringify(res.user));
  openLang("home");
}
function logoutLocal(){ S.token = ""; S.user = null; store.set("mt.token", null); store.set("mt.user", null); show("auth"); }
$("#logoutBtn").onclick = async () => { try { await api("logout"); } catch(e){} logoutLocal(); };

$("#loginForm").onsubmit = async e => {
  e.preventDefault(); $("#lErr").textContent = "";
  busy($("#lBtn"), true, "Login ho raha hai\u2026");
  try { loggedIn(await api("login", { username: $("#lUser").value.trim(), password: $("#lPass").value })); $("#lPass").value = ""; }
  catch(err){ $("#lErr").textContent = err.message; }
  finally { busy($("#lBtn"), false); }
};
$("#signupForm").onsubmit = async e => {
  e.preventDefault(); $("#sErr").textContent = "";
  const role = document.querySelector("input[name=sRole]:checked").value;
  const d = { full_name: $("#sName").value.trim(), username: $("#sUser").value.trim().toLowerCase(), password: $("#sPass").value,
    phone: $("#sPhone").value.trim(), role, panchayats: role === R_MA ? [...awcPicked].join(", ") : role === R_FC ? $$("#sSecList input:checked").map(c => c.value).join(", ") : "", access_code: $("#sCode").value.trim() };
  if (!d.full_name || !d.username || !d.password){ $("#sErr").textContent = "Star (*) wale khane bharein."; return; }
  if (d.password.length < 6){ $("#sErr").textContent = "Password kam se kam 6 akshar ka ho."; return; }
  if (!/^[6-9]\d{9}$/.test(d.phone)){ $("#sErr").textContent = "Apna 10 ank ka sahi mobile number likhein."; return; }
  if (role === R_MA && !awcPicked.size){ $("#sErr").textContent = "Apna AWC chunein (kam se kam ek)."; return; }
  if (role === R_FC && !d.panchayats){ $("#sErr").textContent = "Apna sector chunein (kam se kam ek)."; return; }
  if (role !== R_MA && !d.access_code){ $("#sErr").textContent = "Access code daalein (admin se lein)."; return; }
  busy($("#sBtn"), true, "Ban raha hai\u2026");
  try { const res = await api("signup", d); toast("User ID ban gaya: " + d.username); loggedIn(res); }
  catch(err){ $("#sErr").textContent = err.message; }
  finally { busy($("#sBtn"), false); }
};

/* ---------------- home ---------------- */
const role = () => (S.user && S.user.role) || "";
const isCoord = () => role() !== R_MA;                 // sees more than own entries
const canEnter = () => role() === R_MA || role() === R_DM;
const ICONS = {
  reg: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10" cy="8" r="4"/><path d="M3 21c0-4 3-6 7-6s7 2 7 6"/><path d="M19 8v6M16 11h6"/></svg>',
  milk: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 2h8M9 2v4l-3 4v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10l-3-4V2"/><path d="M6 13h12"/></svg>',
  rep: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  growth: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="2" transform="rotate(-35 12 12)"/><path d="M8.5 9.7l1.4 2M11.4 7.7l1.4 2M14.3 5.7l1.4 2"/></svg>',
  archive: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></svg>',
  team: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5M14 15c3.6-.6 7 1 7 5"/></svg>'
};
const TILES = {
  [R_MA]: [["milk","milk","Doodh pilao","Aaj ki doodh entry yahan karo",2,1],["reg","reg","Naya bachcha","Bachcha register karo",1],["growth","growth","Wajan / Lambai","Har mahine naap bharo",4],["kids","team","Bachche ki list","Sudhaar \u00b7 sthiti badlo",1],["rep","rep","Mera data","AWC ki entries aur report",3]],
  [R_FC]: [["rep","team","Ambassador Monitoring","Ambassadors ki entry aur doodh pilana",4,1],["rep","rep","Reports","Daily \u00b7 Weekly \u00b7 Monthly \u00b7 CSV",3],["kids","reg","Bachche ki list","Sudhaar \u00b7 sthiti badlo",1]],
  [R_DM]: [["rep","rep","Poori Report","Sab AWC, sab ambassador, CSV, Sheet",3,1],["milk","milk","Doodh pilao","Doodh entry",2],["reg","reg","Naya bachcha","Registration",1],["growth","growth","Wajan / Lambai","Growth update",4],["kids","reg","Bachche ki list","Sudhaar \u00b7 sthiti badlo",1],["users","team","Users / Accounts","Account hatao \u00b7 password reset",4],["awcs","milk","AWC list","Doodh wali AWC \u00b7 nayi AWC jodo",3],["arch","archive","Data Archive","Purani doodh entries alag Sheet mein",2,1]],
  [R_SM]: [["rep","rep","Submission Report","Sector aur AWC ke hisaab se ginti",3,1]]
};
const REP_TITLE = { [R_MA]: "Mera Data", [R_FC]: "Ambassador Monitoring", [R_DM]: "Poori Report", [R_SM]: "Submission Report" };
const TILE_COL = { 1: "var(--coral)", 2: "var(--ocean)", 3: "var(--leaf)", 4: "var(--berry)" };
/* A glass of milk that fills up as more children get milk today. */
function milkGlassSvg(done, total){
  const f = total ? Math.min(1, done / total) : 0, topY = 22, botY = 128, lvl = botY - (botY - topY) * f;
  const xl = y => 18 + (y - topY) * 0.12, xr = y => 102 - (y - topY) * 0.12;
  const wave = `M${xl(lvl) - 2} ${lvl} q12 -7 24 0 t24 0 t24 0 t24 0 V${botY + 2} H${xl(lvl) - 2}Z`;
  return `<svg viewBox="0 0 120 170" role="img" aria-label="Aaj ${done} / ${total} bachchon ko doodh mila">
    <defs><clipPath id="gl-clip"><path d="M18 ${topY} L102 ${topY} L${xr(botY)} ${botY} Q60 ${botY + 10} ${xl(botY)} ${botY} Z"/></clipPath></defs>
    <ellipse cx="60" cy="150" rx="40" ry="6" fill="#123B5C" opacity=".12"/>
    <path d="M18 ${topY} L102 ${topY} L${xr(botY)} ${botY} Q60 ${botY + 10} ${xl(botY)} ${botY} Z" fill="rgba(18,59,92,.07)"/>
    <g clip-path="url(#gl-clip)">${f > 0 ? `<path d="${wave}" fill="#FFFFFF" stroke="#BFE0F5" stroke-width="2"/><circle cx="44" cy="${(lvl + botY) / 2}" r="3" fill="#E6F4FF"/><circle cx="74" cy="${(lvl + botY) / 2 + 12}" r="2.2" fill="#E6F4FF"/>` : ""}</g>
    <path d="M18 ${topY} L102 ${topY} L${xr(botY)} ${botY} Q60 ${botY + 10} ${xl(botY)} ${botY} Z" fill="none" stroke="var(--navy)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M26 34 L32 112" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    <text x="60" y="${f > 0.45 ? lvl + 26 : lvl - 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${f > 0.45 ? "#123B5C" : "var(--navy)"}" font-family="var(--f-display)">${Math.round(f * 100)}%</text>
    <text x="60" y="166" text-anchor="middle" font-size="12" font-weight="700" fill="var(--navy)">${done} / ${total} aaj</text>
  </svg>`;
}
const WDAY = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
/* This week vs last week, Sunday to Saturday. */
function weekCompareSvg(days){
  const byDate = new Map(days.map(d => [d.date, d.given]));
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const sun = new Date(t); sun.setDate(t.getDate() - t.getDay());
  const rows = WDAY.map((w, i) => { const a = new Date(sun); a.setDate(sun.getDate() + i); const b = new Date(a); b.setDate(a.getDate() - 7);
    return { w, cur: ymd(a), prev: ymd(b), future: a > t, isToday: +a === +t }; });
  rows.forEach(r => { r.c = byDate.get(r.cur) || 0; r.p = byDate.get(r.prev) || 0; });
  const W = 340, H = 150, base = 118, top = 18, max = Math.max(1, ...rows.map(r => Math.max(r.c, r.p))), slot = W / 7, bw = 15;
  const sumC = rows.reduce((a, r) => a + r.c, 0), sumP = rows.reduce((a, r) => a + r.p, 0);
  $("#hWeekLegend").innerHTML = `<span><i style="background:var(--wk-this)"></i>Is hafta: <b>${sumC}</b></span><span><i style="background:var(--wk-last)"></i>Pichla hafta: <b>${sumP}</b></span>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Is hafte ${sumC}, pichle hafte ${sumP} baar doodh diya">
    ${[0.5, 1].map(f => `<line x1="0" x2="${W}" y1="${base - (base - top) * f}" y2="${base - (base - top) * f}" stroke="var(--line)" stroke-dasharray="3 4"/>`).join("")}
    <line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--line)"/>
    ${rows.map((r, i) => { const cx = slot * i + slot / 2, hp = r.p / max * (base - top), hc = r.c / max * (base - top);
      return `${r.isToday ? `<rect x="${cx - 21}" y="6" width="42" height="${base + 26}" rx="12" fill="var(--sun)" opacity=".18"/>` : ""}
      <rect x="${cx - bw - 1}" y="${base - Math.max(hp, 2)}" width="${bw}" height="${Math.max(hp, 2)}" rx="5" fill="var(--wk-last)"><title>Pichla ${r.w} ${r.prev}: ${r.p}</title></rect>
      ${r.future ? `<rect x="${cx + 1}" y="${base - 14}" width="${bw}" height="14" rx="5" fill="none" stroke="var(--line)" stroke-dasharray="3 3"/>` : `<rect x="${cx + 1}" y="${base - Math.max(hc, 2)}" width="${bw}" height="${Math.max(hc, 2)}" rx="5" fill="var(--wk-this)"><title>${r.w} ${r.cur}: ${r.c}</title></rect>`}
      ${!r.future && r.c ? `<text x="${cx + 1 + bw / 2}" y="${base - hc - 4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--fg)">${r.c}</text>` : ""}
      <text x="${cx}" y="${base + 16}" text-anchor="middle" font-size="11" font-weight="${r.isToday ? 800 : 500}" fill="${r.isToday ? "var(--fg)" : "var(--muted)"}">${r.w}</text>`; }).join("")}
  </svg>`;
}
function renderHome(){
  if (!S.user) return;
  const u = S.user;
  $("#hRole span").textContent = u.role;
  const hr = new Date().getHours();
  $("#hName").textContent = (hr < 12 ? "Suprabhat, " : hr < 17 ? "Namaste, " : "Shubh sandhya, ") + u.full_name.split(" ")[0];
  $("#hMeta").textContent = u.panchayats.length ? u.panchayats.map(p => p.replace(/ \(\d+\)$/, "")).join(", ") : "";
  $("#homeTiles").innerHTML = (TILES[u.role] || TILES[R_MA]).map(([go, ic, t, sub, n, wide]) =>
    `<button class="tile${wide ? " wide" : ""}" data-go="${go}" type="button" style="--tc:${TILE_COL[n]}"><span class="ic">${ICONS[ic]}</span><span><b>${t}</b><span>${sub}</span></span><span class="go">\u203a</span></button>`).join("");
  $$("#homeTiles [data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  $("#hGlass").innerHTML = milkGlassSvg(0, 0);
  $("#hToday").innerHTML = "";
  $("#hWeek").innerHTML = weekCompareSvg([]);
  $("#recentTitle").textContent = u.role === R_MA ? "Doodh pilane ke baad ki updates" : "Ambassadors ki haal ki entries";
  loadDashboard();
}
async function loadDashboard(){
  try {
    let d;
    try { d = await api("dashboard"); store.set("mt.dash", JSON.stringify({ day: today(), d })); }
    catch(e){
      const c = JSON.parse(store.get("mt.dash") || "null");
      if (!e.offline || !c) throw e;
      d = c.d; if (c.day !== today()) d.fed_today = 0;
      d.fed_today += queuedToday().length; d.recent = d.recent || [];
    }
    $("#hGlass").innerHTML = milkGlassSvg(d.fed_today, d.kids);
    const left = Math.max(0, d.kids - d.fed_today);
    $("#hToday").innerHTML = `<span class="pill-stat"><b>${d.fed_today} / ${d.kids}</b> ko aaj doodh mila</span>` + (d.kids ? (left ? `<span class="pill-stat left"><b>${left}</b> baaki</span>` : `<span class="pill-stat done">Sab ho gaye \u2713</span>`) : "") + (role() === R_MA ? "" : `<span class="pill-stat"><b>${d.ambassadors}</b> ambassador</span>`);
    $("#hWeek").innerHTML = weekCompareSvg(d.last14 || d.last7 || []);
    const show = role() !== R_SM;
    $("#recentPanel").hidden = !show;
    if (show) $("#recentList").innerHTML = d.recent.map(m => {
      const fail = /not matched/i.test(m.face_result), yes = m.milk_given === "Yes";
      const col = fail ? "var(--bad)" : !yes ? "var(--muted)" : m.consumed === "Full" ? "var(--c-full)" : m.consumed === "Half" ? "var(--c-half)" : m.consumed === "Quarter" ? "var(--c-qtr)" : "var(--c-home)";
      const tag = fail ? "\u2715" : !yes ? "\u2013" : m.consumed === "Full" ? "1" : m.consumed === "Half" ? "\u00bd" : m.consumed === "Quarter" ? "\u00bc" : "\u2302";
      const viaCg = m.collected_by_name && m.collected_by_name !== "Bachcha khud";
      const what = fail ? (viaCg ? "Chehra nahi mila: " + m.collected_by_name : "Face match nahi hua") : !yes ? "Doodh nahi piya" + (viaCg ? " \u00b7 " + m.collected_by_name + " ke saath" : "") : m.consumed === "Taken home" ? "Ghar le gaye" : m.consumed + " piya" + (viaCg ? " \u00b7 " + m.collected_by_name + " ke saath" : "") + (m.face_result === "Override" ? " \u00b7 override" : "");
      return `<div class="rec"><span class="dot" style="background:${col}">${tag}</span><span><b>${esc(m.child_name)}</b><small>${esc(what)} \u00b7 ${esc(m.panchayat.replace(/ \(\d+\)$/, ""))}${role() !== R_MA ? " \u00b7 " + esc(m.recorded_by) : ""}</small></span><small>${m.date === today() ? esc(m.time) : esc(m.date.slice(5))}</small></div>`;
    }).join("") || `<p class="muted">Abhi koi entry nahi. Doodh pilane ke baad yahan dikhegi.</p>`;
    renderMaStatus(d.ma_status || []);
    $("#resetPanel").hidden = !d.reset_requests; $("#resetCount").textContent = d.reset_requests || 0;
    const al = d.alerts || [];
    $("#alertPanel").hidden = !al.length;
    $("#alertList").innerHTML = al.map(a => `<div class="rec"><span class="dot" style="background:var(--bad)">${a.days}d</span><span><b>${esc(a.child_name)}</b><small>Maa ${esc(a.mother_name)} \u00b7 ${esc(a.panchayat.replace(/ \(\d+\)$/, ""))}${role() !== R_MA ? " \u00b7 " + esc(a.registered_by) : ""}</small></span><small>${a.days} din se</small></div>`).join("");
    const nc = d.new_caregivers || [];
    $("#newCgPanel").hidden = !nc.length;
    $("#newCgList").innerHTML = nc.map(g => `<div class="rec"><span class="dot" style="background:var(--berry)">${esc(initials(g.name))}</span><span><b>${esc(g.name)} (${esc(g.relation)})</b><small>${esc(g.children.join(", "))} \u00b7 jode: ${esc(g.added_by)}</small></span><small>${esc(g.added_at.slice(5, 10))}</small></div>`).join("");
  } catch(e){}
}
$("#recentRefresh").onclick = loadDashboard;

/* ---------------- panchayat lists ---------------- */
let panchCache = null;
async function panchayats(force){
  if (!panchCache || force){ try { panchCache = (await api("panchayats")).panchayats; } catch(e){ panchCache = S.user.panchayats.slice(); } }
  return panchCache;
}
async function fillPanch(sel, { allOption = false, sectorOptions = false } = {}){
  const server = await panchayats();
  const cur = sel.value || store.get("mt.panch") || "";
  const r = role();
  let html = "";
  if (r === R_MA){
    if (allOption && server.length > 1) html += `<option value="">Mere sabhi AWC</option>`;
    html += server.map(p => `<option>${esc(p)}</option>`).join("");
  } else {
    const allowed = new Set(server.map(p => p.toLowerCase()));
    const secs = SECTORS.filter(x => AWC.some(a => a[0] === x && allowed.has(awcLabel(a).toLowerCase())));
    html += allOption ? `<option value="">${r === R_FC ? "Mere sabhi sector" : "Sabhi AWC (poora project)"}</option>` : `<option value="">\u2014 AWC chunein \u2014</option>`;
    if (sectorOptions) html += `<optgroup label="Poora sector">` + secs.map(x => `<option value="sector:${x}">${x} \u2014 sabhi AWC</option>`).join("") + `</optgroup>`;
    secs.forEach(x => { html += `<optgroup label="${x}">` + AWC.filter(a => a[0] === x && allowed.has(awcLabel(a).toLowerCase())).map(a => `<option>${esc(awcLabel(a))}</option>`).join("") + `</optgroup>`; });
    const extra = server.filter(p => !AWC_BY_LABEL.has(p.toLowerCase()));
    if (extra.length) html += `<optgroup label="Anya">` + extra.map(p => `<option>${esc(p)}</option>`).join("") + `</optgroup>`;
  }
  sel.innerHTML = html || `<option value="">Koi AWC nahi</option>`;
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
}
/* children of one AWC; the last list is kept on the phone so milk can be given without internet */
let AGE_RULE = { min: 6, max: 36 }, CHILD_STATUSES = { active: "Chalu", left: "Gaon/AWC chhod diya", aged_out: "Umr poori", duplicate: "Galti se / duplicate bana", died: "Mrityu", other: "Anya" };
let kidsFromCache = false;
async function childrenOf(panch){
  try {
    const r = await api("listChildren", { panchayat: panch });
    if (r.age_rule) AGE_RULE = r.age_rule; if (r.statuses) CHILD_STATUSES = r.statuses;
    store.set("mt.kids." + panch, JSON.stringify({ at: r.today || today(), kids: r.children }));
    kidsFromCache = false;
    return r.children;
  } catch(e){
    if (!e.offline) throw e;
    const c = JSON.parse(store.get("mt.kids." + panch) || "null");
    if (!c) throw e;
    kidsFromCache = true;
    const fresh = c.at === today();
    return c.kids.map(k => Object.assign({}, k, { given_today: fresh && k.given_today }));
  }
}
/* age from date of birth, in months, and as words */
function ageMonths(dob){
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || "")) return null;
  const b = new Date(dob + "T00:00:00"), t = new Date();
  let m = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) m--;
  return Math.max(0, m);
}
function ageText(dob){
  const m = ageMonths(dob); if (m === null) return "";
  const y = Math.floor(m / 12), r = m % 12;
  return y ? (r ? `${y} saal ${r} mahine` : `${y} saal`) : `${r} mahine`;
}
const ageOut = dob => { const m = ageMonths(dob); return m !== null && (m < AGE_RULE.min || m > AGE_RULE.max); };

/* ---------------- face model ---------------- */
let modelReady = false, modelLoading = null;
function loadModels(){
  if (modelLoading) return modelLoading;
  modelLoading = (async () => {
    try {
      try { await faceapi.tf.setBackend("webgl"); } catch(e){ await faceapi.tf.setBackend("cpu"); }
      await faceapi.tf.ready();
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      modelReady = true;
      ["#rFaceBtn","#gFaceBtn"].forEach(s => $(s).disabled = false);
      updateScanBtn();
    } catch(e){ console.error(e); toast("Face model load nahi hua. App band karke dobara kholein."); }
  })();
  return modelLoading;
}
function scaleCanvas(src, max){
  const w0 = src.videoWidth || src.width, h0 = src.videoHeight || src.height, s = Math.min(1, max / Math.max(w0, h0));
  const c = document.createElement("canvas"); c.width = Math.round(w0 * s); c.height = Math.round(h0 * s);
  c.getContext("2d").drawImage(src, 0, 0, c.width, c.height); return c;
}
async function faceOf(canvas){
  await loadModels();
  if (!modelReady) throw new Error("Face model abhi taiyaar nahi hai.");
  const res = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.45 }))
    .withFaceLandmarks().withFaceDescriptors();
  if (!res.length) return null;
  res.sort((a, b) => b.detection.box.area - a.detection.box.area);
  return { descriptor: Array.from(res[0].descriptor), count: res.length };
}

/* ---------------- camera ---------------- */
let stream = null, facing = "environment", camResolve = null, liveFailed = false;
function takePhoto(title, { gallery = false } = {}){
  return new Promise(res => {
    camResolve = res; $("#camTitle").textContent = title; $("#camMsg").textContent = "";
    $("#galLabel").hidden = !gallery;
    $("#camStart").hidden = liveFailed; $("#camSheet").hidden = false;
    if (!liveFailed && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) startLive();
  });
}
async function startLive(){
  try {
    stopLive();
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 } }, audio: false });
    const v = $("#camVideo"); v.srcObject = stream; v.hidden = false; await v.play();
    $("#liveRow").hidden = false; $("#camStart").hidden = true;
  } catch(e){
    stopLive(); liveFailed = true; $("#camStart").hidden = true;
    $("#camMsg").textContent = "Live camera nahi chal raha. 'Phone camera se' button use karein.";
  }
}
function stopLive(){ if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; $("#camVideo").hidden = true; $("#liveRow").hidden = true; }
function closeCam(result){ stopLive(); $("#camSheet").hidden = true; const r = camResolve; camResolve = null; if (r) r(result || null); }
$("#camStart").onclick = startLive;
$("#camFlip").onclick = () => { facing = facing === "user" ? "environment" : "user"; startLive(); };
$("#camClose").onclick = () => closeCam(null);
$("#camShoot").onclick = () => { const v = $("#camVideo"); if (v.videoWidth) closeCam(scaleCanvas(v, 1280)); };
function fileToCanvas(e){
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(img.src); closeCam(scaleCanvas(img, 1280)); };
  img.onerror = () => { $("#camMsg").textContent = "Ye photo khul nahi payi. Doosri photo lein."; };
  img.src = URL.createObjectURL(f);
}
$("#camFile").onchange = fileToCanvas; $("#galFile").onchange = fileToCanvas;
const jpeg = (canvas, max, q) => scaleCanvas(canvas, max).toDataURL("image/jpeg", q);

/* ---------------- CAREGIVER SHEET ---------------- */
const CG_MATCH_MAX = 0.5;           // adults: a little stricter than children
const cgDraft = { face: null, photo: null };
let cgResolve = null;
const initials = n => String(n || "?").trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
function openCgSheet(title, preset){
  return new Promise(res => {
    cgResolve = res; $("#cgTitle").textContent = title || "Saath aane wala vyakti";
    $("#cgForm").reset(); cgDraft.face = null; cgDraft.photo = null; $("#cgFaceBox").textContent = "Chehra"; $("#cgFaceMsg").textContent = "Seedha chehra, roshni mein."; $("#cgErr").textContent = "";
    if (preset){ $("#cgName").value = preset.name || ""; $("#cgRel").value = preset.relation || ""; }
    $("#cgSheet").hidden = false; loadModels();
  });
}
function closeCgSheet(v){ $("#cgSheet").hidden = true; const r = cgResolve; cgResolve = null; if (r) r(v || null); }
$("#cgCancel").onclick = () => closeCgSheet(null);
$("#cgFaceBtn").onclick = async () => {
  const c = await takePhoto("Dekhbhal karne wale ka chehra"); if (!c) return;
  $("#cgFaceMsg").innerHTML = '<span class="busy"></span> Chehra dhoondh rahe hain\u2026';
  const f = await faceOf(scaleCanvas(c, 900)).catch(() => null);
  if (!f){ cgDraft.face = null; $("#cgFaceBox").textContent = "Chehra nahi mila"; $("#cgFaceMsg").textContent = "Chehra nahi mila. Paas se, roshni mein dobara lein."; return; }
  cgDraft.face = f.descriptor; cgDraft.photo = jpeg(c, 480, 0.8);
  $("#cgFaceBox").innerHTML = `<img src="${cgDraft.photo}" alt="">`; $("#cgFaceMsg").textContent = "Chehra mil gaya \u2713";
};
$("#cgForm").onsubmit = e => {
  e.preventDefault();
  const v = { name: $("#cgName").value.trim(), relation: $("#cgRel").value, phone: $("#cgPhone").value.trim(), face: cgDraft.face, photo: cgDraft.photo };
  if (!v.name || !v.relation) return $("#cgErr").textContent = "Naam aur rishta bharein.";
  if (v.phone && !/^[6-9]\d{9}$/.test(v.phone)) return $("#cgErr").textContent = "Mobile 10 ank ka sahi number ho, ya khali chhod dein.";
  if (!v.face) return $("#cgErr").textContent = "Chehre ki photo lein.";
  closeCgSheet(v);
};

/* ---------------- REGISTRATION ---------------- */
const reg = { idPhoto: null, childPhoto: null, face: null, dup: false, cgs: [], links: new Map() };
function renderRegCgs(){
  const items = reg.cgs.map((g, i) => `<div class="cg-item"><img src="${g.photo}" alt=""><span><b>${esc(g.name)}</b><br><small>${esc(g.relation)}${g.phone ? " \u00b7 " + esc(g.phone) : ""} \u00b7 naya</small></span><button type="button" data-cgrm="${i}">Hatao</button></div>`)
    .concat([...reg.links.values()].map(g => `<div class="cg-item"><span class="cg-av">${esc(initials(g.name))}</span><span><b>${esc(g.name)}</b><br><small>${esc(g.relation)} \u00b7 parivar se: ${esc(g.children.join(", "))}</small></span><button type="button" data-cgun="${esc(g.cg_id)}">Hatao</button></div>`));
  $("#rCgList").innerHTML = items.join("") || `<p class="muted" style="margin:0">Abhi koi nahi juda.</p>`;
  const full = reg.cgs.length + reg.links.size >= 4;
  $("#rCgAdd").disabled = full; $("#rCgLink").disabled = full;
  $("#rCgAdd").textContent = hasMaa() ? "+ Aur vyakti (papa, dadi\u2026)" : "+ Maa ka chehra";
}
$("#rCgList").onclick = e => {
  const a = e.target.closest("[data-cgrm]"), b = e.target.closest("[data-cgun]");
  if (a){ reg.cgs.splice(+a.dataset.cgrm, 1); renderRegCgs(); }
  if (b){ reg.links.delete(b.dataset.cgun); renderRegCgs(); }
};
const hasMaa = () => reg.cgs.some(g => g.relation === "Maa") || [...reg.links.values()].some(g => g.relation === "Maa");
$("#rCgAdd").onclick = async () => {
  const maa = !hasMaa();
  const g = await openCgSheet(maa ? "Maa ka chehra" : "Saath aane wala vyakti", maa ? { name: $("#rMother").value.trim(), relation: "Maa" } : null);
  if (g){ reg.cgs.push(g); renderRegCgs(); }
};
$("#rCgLink").onclick = async () => {
  const box = $("#rCgLinkBox");
  if (!box.hidden){ box.hidden = true; return; }
  const p = regPanch(); if (!p) return toast("Pehle AWC chunein.");
  box.hidden = false; box.innerHTML = '<p class="muted" style="padding:8px">Load ho raha hai\u2026</p>';
  try {
    const list = (await api("listCaregivers", { panchayat: p })).caregivers;
    box.innerHTML = list.map(g => `<label><input type="checkbox" value="${esc(g.cg_id)}"${reg.links.has(g.cg_id) ? " checked" : ""}> <span>${esc(g.name)} <small>${esc(g.relation)} \u00b7 ${esc(g.children.join(", "))}</small></span></label>`).join("")
      || `<p class="muted" style="padding:8px">Is AWC mein abhi koi dekhbhal karne wala juda nahi hai.</p>`;
    box._list = list;
  } catch(err){ box.innerHTML = `<p class="err" style="padding:8px">${esc(err.message)}</p>`; }
};
$("#rCgLinkBox").addEventListener("change", e => {
  const c = e.target; if (c.type !== "checkbox") return;
  const g = ($("#rCgLinkBox")._list || []).find(x => x.cg_id === c.value);
  if (c.checked){ if (reg.cgs.length + reg.links.size >= 4){ c.checked = false; return toast("4 se zyada nahi jod sakte."); } reg.links.set(c.value, g); }
  else reg.links.delete(c.value);
  renderRegCgs();
});
$$("[data-reg]").forEach(b => b.onclick = () => {
  $$("[data-reg]").forEach(x => x.setAttribute("aria-selected", String(x === b)));
  $("#regForm").hidden = b.dataset.reg !== "new"; $("#growForm").hidden = b.dataset.reg !== "growth";
  if (b.dataset.reg === "growth") openGrowth();
});
async function openReg(){
  loadModels();
  await fillPanch($("#rPanch"));
  $("#rPanchNewW").hidden = $("#rPanch").value !== "__new";
}
const regPanch = () => $("#rPanch").value === "__new" ? $("#rPanchNew").value.trim() : $("#rPanch").value;
$("#rPanch").onchange = () => {
  const isNew = $("#rPanch").value === "__new";
  $("#rPanchNewW").hidden = !isNew; if (isNew) $("#rPanchNew").focus(); else store.set("mt.panch", $("#rPanch").value);
  checkDup();
};
$("#rPanchNew").addEventListener("input", () => checkDup());
let dupT;
function checkDup(){
  clearTimeout(dupT);
  dupT = setTimeout(async () => {
    const d = { child_name: $("#rChild").value.trim(), mother_name: $("#rMother").value.trim(), panchayat: regPanch() };
    reg.dup = false; $("#dupNote").hidden = true;
    if (!d.child_name || !d.mother_name || !d.panchayat) return;
    try {
      const r = await api("checkDuplicate", d);
      if (r.duplicate){ reg.dup = true; $("#dupNote").hidden = false;
        $("#dupNote").textContent = `Ye bachcha pehle se registered hai: ${r.existing.child_name} (maa ${r.existing.mother_name}), AWC ${r.existing.panchayat}, ID ${r.existing.child_id}. Dobara register nahi hoga.`; }
    } catch(e){}
  }, 450);
}
["#rChild","#rMother"].forEach(s => $(s).addEventListener("input", checkDup));

$("#rIdBtn").onclick = async () => {
  const c = await takePhoto("ID card (MCP / masked Aadhaar)", { gallery: true }); if (!c) return;
  reg.idPhoto = jpeg(c, 1280, 0.8);
  $("#rIdBox").innerHTML = `<img src="${reg.idPhoto}" alt="ID card">`;
};
$("#rFaceBtn").onclick = async () => {
  const c = await takePhoto("Bachche ki photo"); if (!c) return;
  reg.childPhoto = jpeg(c, 720, 0.82); reg.face = null;
  $("#rFaceBox").innerHTML = `<img src="${reg.childPhoto}" alt="Bachche ki photo">`;
  $("#rFaceMsg").textContent = "Photo li gayi \u2713";
  try { const f = await faceOf(scaleCanvas(c, 900)); if (f) reg.face = f.descriptor; } catch(err){}
  $("#rFaceMsg").textContent = reg.face ? "Chehra mil gaya \u2713" : "Chehra nahi mila. Paas se, roshni mein dobara lein.";
};
function resetReg(){
  $("#regForm").reset(); Object.assign(reg, { ageOk: false, idPhoto: null, childPhoto: null, face: null, dup: false, cgs: [], links: new Map() });
  $("#rCgLinkBox").hidden = true; renderRegCgs();
  $("#rIdBox").textContent = "ID card"; $("#rFaceBox").textContent = "Bachche ka chehra";
  $("#rFaceMsg").textContent = "Chehra seedha, achhi roshni mein, akele bachche ka."; $("#dupNote").hidden = true; $("#rErr").textContent = "";
  const p = store.get("mt.panch"); if (p && [...$("#rPanch").options].some(o => o.value === p)) $("#rPanch").value = p;
}
$("#regForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#rErr"); err.textContent = "";
  const d = { child_name: $("#rChild").value.trim(), mother_name: $("#rMother").value.trim(), phone: $("#rPhone").value.trim(),
    panchayat: regPanch(), dob: $("#rDob").value, weight_kg: $("#rWeight").value, height_cm: $("#rHeight").value,
    id_card_type: document.querySelector("input[name=rIdType]:checked").value };
  if (!d.child_name || !d.mother_name || !d.panchayat) return err.textContent = "Bachche ka naam, maa ka naam aur AWC bharein.";
  if (!/^[6-9]\d{9}$/.test(d.phone)) return err.textContent = "Phone number 10 ank ka sahi number likhein.";
  if (!(+d.weight_kg > 0) || !(+d.height_cm > 0)) return err.textContent = "Wajan (kg) aur lambai (cm) bharein.";
  if (!reg.idPhoto) return err.textContent = "ID card ki photo lein.";
  if (!reg.childPhoto) return err.textContent = "Bachche ki photo lein.";
  if (!reg.face) return err.textContent = "Bachche ki photo mein chehra nahi mila. Seedha chehra, roshni mein dobara photo lein.";
  if (reg.dup) return err.textContent = "Ye bachcha pehle se registered hai.";
  if (ageOut(d.dob) && !reg.ageOk){
    return overlay({ ok: false, title: "Umr niyam ke bahar", sub: `Umr ${ageText(d.dob)} hai. Niyam: ${AGE_RULE.min}\u2013${AGE_RULE.max} mahine. Phir bhi register karna hai?`,
      actions: [{ label: "Haan, register karo", cls: "primary", run: () => { reg.ageOk = true; $("#regForm").requestSubmit(); } }, { label: "Nahi, tareekh theek karo" }] });
  }
  busy($("#rSubmit"), true, "Save ho raha hai\u2026");
  try {
    const r = await api("registerChild", Object.assign(d, { id_photo: reg.idPhoto, child_photo: reg.childPhoto, face: reg.face,
      caregivers: reg.cgs.map(g => ({ name: g.name, relation: g.relation, phone: g.phone, face: g.face, photo: g.photo })), link_cg_ids: [...reg.links.keys()] }));
    resetReg(); $("#rPanchNewW").hidden = true;
    overlay({ ok: true, title: "Child registered", sub: `${d.child_name} (maa ${d.mother_name}) \u00b7 ID ${r.child_id}`,
      actions: [{ label: "Ek aur bachcha register karo", cls: "primary" }, { label: "Home", run: () => show("home") }] });
  } catch(ex){
    if (ex.code === "DUPLICATE") overlay({ ok: false, title: "Pehle se registered", sub: ex.message, actions: [{ label: "Theek hai", cls: "primary" }] });
    else err.textContent = ex.message;
  } finally { busy($("#rSubmit"), false); }
};

/* ---- growth update (monthly / quarterly), full history kept ---- */
const grow = { face: null, photo: null, type: store.get("mt.gtype") === "Quarterly" ? "Quarterly" : "Monthly" };
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function periodOf(month, type){
  if (!/^\d{4}-\d{2}$/.test(month)) return "";
  const y = +month.slice(0, 4), m = +month.slice(5, 7);
  if (type !== "Quarterly") return month;
  const fy = m >= 4 ? y : y - 1, q = m >= 4 ? Math.floor((m - 4) / 3) + 1 : 4;
  return `${fy}-${String(fy + 1).slice(2)} Q${q} (${["", "Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"][q]})`;
}
const monthName = m => /^\d{4}-\d{2}$/.test(m || "") ? MON[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) : (m || "");
function showPeriod(){
  const m = $("#gMonth").value;
  $("#gPeriod").textContent = m ? (grow.type === "Quarterly" ? "Ye entry is quarter ki hogi: " + periodOf(m, "Quarterly") : "Ye entry is mahine ki hogi: " + monthName(m)) : "";
}
function setGrowType(t){
  grow.type = t; store.set("mt.gtype", t);
  $$("#gType button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.gt === t)));
  showPeriod();
}
$$("#gType button").forEach(b => b.onclick = () => setGrowType(b.dataset.gt));
$("#gMonth").onchange = showPeriod;
const chg = v => { const s = String(v ?? ""); if (s === "") return ""; const n = +s; return `<span class="${n > 0 ? "up" : n < 0 ? "down" : "muted"}">${n > 0 ? "\u25b2 +" + Math.abs(n) : n < 0 ? "\u25bc \u2212" + Math.abs(n) : "0"}</span>`; };
function growthSpark(list){
  const pts = list.filter(g => +g.weight_kg > 0);
  if (pts.length < 2) return "";
  const W = 300, H = 70, ws = pts.map(g => +g.weight_kg), lo = Math.min(...ws), hi = Math.max(...ws), span = Math.max(0.5, hi - lo);
  const xy = pts.map((g, i) => [12 + i * (W - 24) / (pts.length - 1), 56 - (+g.weight_kg - lo) / span * 40]);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Wajan ka graph" style="width:100%;max-width:420px"><polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${xy.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}"/>${xy.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="var(--accent)"><title>${monthName(pts[i].month)}: ${pts[i].weight_kg} kg</title></circle><text x="${p[0].toFixed(1)}" y="${(p[1] - 7).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="var(--fg)">${pts[i].weight_kg}</text><text x="${p[0].toFixed(1)}" y="68" text-anchor="middle" font-size="9" fill="var(--muted)">${MON[+pts[i].month.slice(5, 7) - 1] || ""}</text>`).join("")}</svg>`;
}
async function loadGrowthHistory(){
  const box = $("#gHist"), id = $("#gChild").value;
  if (!id){ box.hidden = true; return; }
  box.hidden = false; box.innerHTML = `<p class="muted" style="margin:0">Pichhle record load ho rahe hain\u2026</p>`;
  try {
    const r = await api("growthHistory", { child_id: id });
    const list = r.history, live = list.filter(g => g.status !== "Replaced"), last = live[live.length - 1];
    box.innerHTML = `<h4>Pichhle record (${live.length})</h4>`
      + (last ? `<p style="margin:0">Aakhri: <b>${esc(last.weight_kg)} kg</b>, <b>${esc(last.height_cm)} cm</b> \u00b7 ${esc(monthName(last.month))}</p>` : "")
      + growthSpark(live)
      + `<div class="tw"><table><thead><tr><th>Mahina</th><th>Prakar</th><th class="n">Wajan kg</th><th class="n">Lambai cm</th></tr></thead><tbody>`
      + list.slice().reverse().map(g => `<tr class="${g.status === "Replaced" ? "old" : ""}"><td>${esc(monthName(g.month))}</td><td>${esc(g.period_type === "Quarterly" ? "3 mahine" : g.period_type === "Registration" ? "Regn." : "Mahina")}${g.status === "Replaced" ? "<br><small>(badla gaya)</small>" : ""}</td><td class="n">${esc(g.weight_kg)}<br><small>${chg(g.weight_change)}</small></td><td class="n">${esc(g.height_cm)}<br><small>${chg(g.height_change)}</small></td></tr>`).join("")
      + `</tbody></table></div>`;
  } catch(e){ box.innerHTML = `<p class="err" style="margin:0">${esc(e.message)}</p>`; }
}
$("#gChild").onchange = loadGrowthHistory;
async function openGrowth(){
  loadModels();
  $("#gMonth").value = today().slice(0, 7); $("#gMonth").max = today().slice(0, 7);
  setGrowType(grow.type);
  $("#gHist").hidden = true;
  await fillPanch($("#gPanch"));
  await loadGrowthKids();
}
async function loadGrowthKids(){
  const sel = $("#gChild"); sel.innerHTML = "<option value=''>Load ho raha hai\u2026</option>";
  try {
    const kids = $("#gPanch").value ? await childrenOf($("#gPanch").value) : [];
    sel.innerHTML = `<option value="">\u2014 Bachcha chunein \u2014</option>` + kids.map(k => `<option value="${esc(k.child_id)}">${esc(k.child_name)} (maa ${esc(k.mother_name)})</option>`).join("");
  } catch(e){ sel.innerHTML = "<option value=''>List nahi aayi</option>"; $("#gErr").textContent = e.message; }
}
$("#gPanch").onchange = () => { store.set("mt.panch", $("#gPanch").value); loadGrowthKids(); };
$("#gFaceBtn").onclick = async () => {
  const c = await takePhoto("Bachche ka naya chehra"); if (!c) return;
  const f = await faceOf(scaleCanvas(c, 900)).catch(() => null);
  if (!f){ grow.face = null; $("#gFaceBox").textContent = "Chehra nahi mila"; return; }
  grow.face = f.descriptor; grow.photo = jpeg(c, 720, 0.82);
  $("#gFaceBox").innerHTML = `<img src="${grow.photo}" alt="">`;
};
$("#growForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#gErr"); err.textContent = "";
  const id = $("#gChild").value, w = $("#gWeight").value, h = $("#gHeight").value;
  if (!id) return err.textContent = "Bachcha chunein.";
  if (!(+w > 0) || !(+h > 0)) return err.textContent = "Wajan aur lambai bharein.";
  await saveGrowthEntry(false);
};
async function saveGrowthEntry(replace){
  const err = $("#gErr"), id = $("#gChild").value, w = $("#gWeight").value, h = $("#gHeight").value, month = $("#gMonth").value;
  const name = $("#gChild").selectedOptions[0].textContent;
  busy($("#gSubmit"), true, "Save ho raha hai\u2026");
  try {
    const r = await api("saveGrowth", { child_id: id, month, weight_kg: w, height_cm: h, period_type: grow.type, replace });
    if (r.exists){
      overlay({ ok: false, title: "Is " + (grow.type === "Quarterly" ? "quarter" : "mahine") + " ka record pehle se hai",
        sub: `${name} \u00b7 ${r.period} \u00b7 pehle: ${r.old.weight_kg} kg, ${r.old.height_cm} cm (${r.old.date}). Naya bharoge to purana bhi record mein rahega (\u201cbadla gaya\u201d likha hoga).`,
        actions: [{ label: "Haan, naya sahi hai \u2014 save karo", cls: "primary", run: () => saveGrowthEntry(true) }, { label: "Nahi, wapas jao" }] });
      return;
    }
    if (grow.face) await api("addFace", { child_id: id, face: grow.face, child_photo: grow.photo });
    $("#gWeight").value = ""; $("#gHeight").value = ""; grow.face = null; grow.photo = null; $("#gFaceBox").textContent = "Naya chehra";
    const ch = r.prev ? ` \u00b7 Pichhle (${monthName(r.prev.month)}) se: ${r.weight_change} kg, ${r.height_change} cm` : "";
    const drop = r.prev && +r.weight_change < 0 ? " \u00b7 Dhyan dein: wajan kam hua hai!" : "";
    overlay({ ok: true, title: r.replaced ? "Record sudhar diya" : "Wajan/lambai save ho gaya", sub: `${name} \u00b7 ${r.period} \u00b7 ${w} kg, ${h} cm${ch}${drop}`,
      actions: [{ label: "Agla bachcha", cls: "primary", run: () => { $("#gChild").value = ""; $("#gHist").hidden = true; } }, { label: "Isi bachche ka record dekho", run: loadGrowthHistory }, { label: "Home", run: () => show("home") }] });
    loadGrowthHistory();
  } catch(ex){ err.textContent = ex.message; }
  finally { busy($("#gSubmit"), false); }
}

/* ---------------- MILK ---------------- */
const milk = { child: null, faces: null, cgs: [], result: null, score: null, given: null, overrideToken: "" };
async function openMilk(){
  loadModels();
  $("#milkForm").hidden = true; $("#famForm").hidden = true; $("#mCgBox").hidden = true; $("#milkPick").hidden = false; $("#mErr").textContent = "";
  $("#mDate").textContent = "Aaj: " + new Date().toLocaleDateString(LANG === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  await fillPanch($("#mPanch"));
  await loadMilkKids();
}
let milkKids = [];
async function loadMilkKids(){
  const sel = $("#mChild"); sel.innerHTML = "<option value=''>Load ho raha hai\u2026</option>"; milk.child = null; milk.faces = null; updateScanBtn();
  try {
    milkKids = $("#mPanch").value ? await childrenOf($("#mPanch").value) : [];
    sel.innerHTML = `<option value="">\u2014 Bachcha chunein (${milkKids.length}) \u2014</option>` + milkKids.map(k =>
      `<option value="${esc(k.child_id)}">${k.given_today ? "\u2713 " : ""}${esc(k.child_name)} (maa ${esc(k.mother_name)})${k.given_today ? " \u2014 aaj mil gaya" : ""}</option>`).join("");
    $("#mChildInfo").textContent = milkKids.length ? `${milkKids.filter(k => k.given_today).length} / ${milkKids.length} ko aaj doodh mil chuka hai.` : "Is AWC mein abhi koi bachcha registered nahi hai.";
    queuedToday().forEach(id => { const k = milkKids.find(x => x.child_id === id); if (k) k.given_today = true; });
    $("#mFind").value = ""; $("#mFindW").hidden = milkKids.length < 8; renderKidCards();
    if (kidsFromCache) $("#mChildInfo").textContent += " \u00b7 \ud83d\udcf4 Offline: phone mein rakhi list";
    else cacheFaces($("#mPanch").value);
  } catch(e){ sel.innerHTML = "<option value=''>List nahi aayi</option>"; $("#mErr").textContent = e.message; }
}
/* children as big tap-able cards: not-yet-fed first */
function renderKidCards(){
  const q = $("#mFind").value.trim().toLowerCase(), sel = $("#mChild").value;
  const list = milkKids.filter(k => !q || (k.child_name + " " + k.mother_name).toLowerCase().includes(q))
    .sort((a, b) => (a.given_today - b.given_today) || a.child_name.localeCompare(b.child_name));
  $("#mKids").innerHTML = list.map(k => `<button type="button" class="kid${k.given_today ? " done" : ""}${k.child_id === sel ? " on" : ""}" data-kid="${esc(k.child_id)}"><span class="kav">${esc(initials(k.child_name))}</span><span class="knm"><b>${esc(k.child_name)}</b><small>Maa: ${esc(k.mother_name)}${k.dob ? " \u00b7 " + esc(ageText(k.dob)) : ""}${ageOut(k.dob) ? ' <span class="age-warn">\u26a0 umr</span>' : ""}</small></span><span class="kst">${k.given_today ? "\u2713 Mil gaya" : "Baaki"}</span></button>`).join("")
    || (milkKids.length ? `<p class="muted" style="margin:0">Is naam ka bachcha nahi mila.</p>` : "");
}
$("#mFind").oninput = renderKidCards;
$("#mKids").onclick = e => {
  const b = e.target.closest("[data-kid]"); if (!b) return;
  $("#mChild").value = b.dataset.kid; $("#mChild").dispatchEvent(new Event("change")); renderKidCards();
  setTimeout(() => { const t = $("#mScan").hidden ? $("#mCgBtn") : $("#mScan"); if (t && !t.hidden) t.scrollIntoView({ behavior: "smooth", block: "center" }); }, 600);
};
$("#mPanch").onchange = () => { store.set("mt.panch", $("#mPanch").value); loadMilkKids(); };
$("#mChild").onchange = async () => {
  const id = $("#mChild").value; milk.child = milkKids.find(k => k.child_id === id) || null; milk.faces = null; milk.cgs = []; updateScanBtn();
  $("#mErr").textContent = "";
  if (!milk.child) return;
  if (milk.child.given_today) $("#mErr").textContent = "Is bachche ko aaj doodh pehle hi mil chuka hai.";
  $("#mCgBox").hidden = true; milk.cgs = [];
  showChildPhoto(milk.child);
  if (ageOut(milk.child.dob)) $("#mErr").textContent = `Dhyan dein: umr ${ageText(milk.child.dob)} hai (niyam ${AGE_RULE.min}\u2013${AGE_RULE.max} mahine).`;
  try { milk.faces = (await api("getFace", { child_id: id })).faces; }
  catch(e){
    const fc = JSON.parse(store.get("mt.faces." + milk.child.panchayat) || "null");
    if (e.offline && fc){ milk.faces = (fc.faces || {})[id] || []; }
    else $("#mErr").textContent = e.message;
  }
  try { milk.cgs = (await api("caregiversOf", { child_id: id })).caregivers; } catch(e){}
  updateScanBtn();
};
function renderCgChips(){
  $("#mCgChips").innerHTML = milk.cgs.map(g => `<button type="button" class="cg-chip" data-cg="${esc(g.cg_id)}"><span class="cg-av">${esc(initials(g.name))}</span><span>${esc(g.name)} <small>${esc(g.relation)}</small></span></button>`).join("")
    || `<p class="muted" style="margin:0">Is bachche ke saath abhi koi juda nahi hai. "+ Naya vyakti jodo" dabayein.</p>`;
  $("#mCgNew").hidden = milk.cgs.length >= 4;
}
$("#mCgBtn").onclick = () => { const box = $("#mCgBox"); box.hidden = !box.hidden; if (!box.hidden) renderCgChips(); };
$("#mCgChips").onclick = async e => {
  const chip = e.target.closest("[data-cg]"); if (!chip) return;
  const g = milk.cgs.find(x => x.cg_id === chip.dataset.cg); if (!g) return;
  const c = await takePhoto(g.name + " (" + g.relation + ") ka chehra"); if (!c) return;
  let f; try { f = await faceOf(scaleCanvas(c, 900)); } catch(err){ f = null; }
  if (!f) return overlay({ ok: false, title: "Chehra nahi dikha", sub: "Photo mein chehra nahi mila. Paas se, seedha aur roshni mein dobara lein.", actions: [{ label: "Theek hai", cls: "primary" }] });
  const d = Math.min(...g.faces.map(x => dist(f.descriptor, x)));
  milk.score = Math.round(d * 1000) / 1000;
  if (d <= CG_MATCH_MAX){
    overlay({ ok: true, title: g.name + " ka chehra mila", sub: `${g.relation} \u00b7 match ${Math.round((1 - d) * 100)}%`, actions: [{ label: "Aage badho", cls: "ok", run: () => openFamForm(g, "Caregiver") }] });
  } else {
    const child = milk.child;
    saveMilk({ child_id: child.child_id, face_result: "Caregiver not matched", cg_id: g.cg_id, match_score: milk.score }).catch(() => {});
    overlay({ ok: false, title: "Face doesn't match", sub: `Ye chehra ${g.name} (${g.relation}) se match nahi hua.`, autoHomeSec: HOME_AFTER_FAIL_SEC,
      actions: [{ label: "Home", cls: "primary", run: () => show("home") }, { label: "Field Coordinator override", run: startOverride }] });
  }
};
$("#mCgNew").onclick = async () => {
  const v = await openCgSheet("Naya vyakti: " + milk.child.child_name);
  if (!v) return;
  try {
    const r = await api("addCaregiver", Object.assign({ child_id: milk.child.child_id }, v));
    milk.cgs = (await api("caregiversOf", { child_id: milk.child.child_id })).caregivers; renderCgChips();
    const g = milk.cgs.find(x => x.cg_id === r.cg_id);
    milk.score = "";
    toast(v.name + " jud gaye. Field Coordinator ko dikhega.");
    if (g) openFamForm(g, "Caregiver (new)");
  } catch(err){ $("#mErr").textContent = err.message; }
};
let fam = null;
const AMTS = [["Full","Pura",1],["Half","Aadha",.5],["Quarter","Chauthai",.25],["No","Nahi piya",0]];
const glassIcon = f => `<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M7 4h16l-2 22H9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>${f ? `<path d="M${7.6 + (1 - f) * 1.6} ${4 + 22 * (1 - f)}h${14.8 - (1 - f) * 3.2}l-1.8 ${22 * f - 0.5}H${9.4}z" fill="#8EC9F0"/>` : `<path d="M10 11l10 10M20 11L10 21" stroke="#B3261E" stroke-width="2.2" stroke-linecap="round"/>`}</svg>`;
function openFamForm(g, result){
  fam = { g, result };
  $("#milkPick").hidden = true; $("#milkForm").hidden = true; $("#famForm").hidden = false; $("#famErr").textContent = "";
  $("#famTitle").textContent = `${g.name} (${g.relation})`;
  $("#famBadge").textContent = result === "Caregiver (new)" ? "Naya vyakti" : "Chehra mila"; $("#famBadge").className = "pill " + (result === "Caregiver (new)" ? "warn" : "ok");
  const kids = g.children.slice().sort((a, b) => (b.child_id === milk.child.child_id) - (a.child_id === milk.child.child_id));
  $("#famKids").innerHTML = kids.map(k => { const on = !k.given_today && k.child_id === milk.child.child_id;
    return `<div class="fam-kid${on ? "" : " off"}"><label class="top"><input type="checkbox" value="${esc(k.child_id)}"${k.given_today ? " disabled" : on ? " checked" : ""}> ${esc(k.child_name)}${k.given_today ? ' <small class="muted">\u2014 aaj mil chuka</small>' : ""}</label>
      <div class="amt">${AMTS.map(([v, l, f]) => `<label><input type="radio" name="amt-${esc(k.child_id)}" value="${v}">${glassIcon(f)}${l}</label>`).join("")}</div></div>`; }).join("");
  window.scrollTo(0, 0);
}
$("#famKids").addEventListener("change", e => { $("#famErr").textContent = ""; if (e.target.type === "checkbox") e.target.closest(".fam-kid").classList.toggle("off", !e.target.checked); });
$("#famCancel").onclick = () => { $("#famForm").hidden = true; $("#milkPick").hidden = false; };
$("#famForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#famErr"); err.textContent = "";
  const ids = $$("#famKids input[type=checkbox]:checked").map(c => c.value);
  if (!ids.length) return err.textContent = "Kam se kam ek bachcha chunein.";
  const amt = {};
  for (const id of ids){ const r = document.querySelector(`#famKids input[name="amt-${CSS.escape(id)}"]:checked`); if (!r) return err.textContent = "Har chune bachche ke liye chunein ki kitna doodh piya."; amt[id] = r.value; }
  busy($("#famSave"), true, "Save ho raha hai\u2026");
  const done = [], failed = [];
  for (const id of ids){
    try { const rr = await saveMilk({ child_id: id, face_result: fam.result, cg_id: fam.g.cg_id, match_score: milk.score, milk_given: amt[id] === "No" ? "No" : "Yes", consumed: amt[id] === "No" ? "" : amt[id] }); done.push(id); if (rr.offline) fam.offline = true; }
    catch(ex){ failed.push(ex.message); }
  }
  busy($("#famSave"), false);
  const names = fam.g.children.filter(k => done.includes(k.child_id)).map(k => k.child_name).join(", ");
  if (!done.length) return err.textContent = failed[0] || "Save nahi hua.";
  overlay({ ok: true, title: `${done.length} bachche ki entry save` + (fam.offline ? " (offline)" : ""), sub: `${names} \u00b7 ${fam.g.name} (${fam.g.relation}) ke saath${failed.length ? " \u00b7 " + failed.length + " nahi hua: " + failed[0] : ""}`,
    actions: [{ label: "Agla bachcha", cls: "primary", run: () => { $("#famForm").hidden = true; $("#milkPick").hidden = false; loadMilkKids(); } }, { label: "Home", run: () => show("home") }] });
};
function updateScanBtn(){
  const b = $("#mScan"); if (!b) return;
  const noFace = milk.child && milk.faces && !milk.faces.length;
  b.disabled = !(milk.child && milk.faces && milk.faces.length && modelReady);
  b.textContent = !modelReady ? "Face model load ho raha hai\u2026" : noFace ? "Is bachche ka chehra registered nahi" : "\ud83d\udcf7 Bachche ka chehra scan karo";
  b.hidden = !milk.child;
  $("#mCgBtn").hidden = !(milk.child && modelReady);
  if (noFace) $("#mErr").textContent = "Is bachche ka chehra save nahi hai. 'Wajan / Lambai' mein 'Bachche ki nayi photo' lekar chehra jodein, ya abhi 'Saath aaye vyakti se' entry karein.";
  const box = $("#mCgBox");
  if (box && !milk.child) box.hidden = true;
}
const dist = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++){ const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); };

$("#mScan").onclick = async () => {
  const c = await takePhoto(milk.child.child_name + " ka chehra"); if (!c) return;
  const b = $("#mScan"); busy(b, true, "Match kar rahe hain\u2026");
  let f;
  try { f = await faceOf(scaleCanvas(c, 900)); } catch(e){ f = null; }
  busy(b, false); updateScanBtn();
  if (!f){
    overlay({ ok: false, title: "Chehra nahi dikha", sub: "Photo mein chehra nahi mila. Bachche ka chehra paas se, seedha aur roshni mein rakh kar dobara photo lein.",
      actions: [{ label: "Dobara photo lo", cls: "primary", run: () => $("#mScan").click() }, { label: "Home", run: () => show("home") }] });
    return;
  }
  const d = Math.min(...milk.faces.map(x => dist(f.descriptor, x)));
  milk.score = Math.round(d * 1000) / 1000;
  if (d <= FACE_MATCH_MAX){
    milk.result = "Matched";
    overlay({ ok: true, title: "Face matched", sub: `${milk.child.child_name} \u00b7 match ${Math.round((1 - d) * 100)}%`,
      actions: [{ label: "Aage badho", cls: "ok", run: openMilkForm }] });
  } else {
    milk.result = "Not matched";
    const child = milk.child;
    saveMilk({ child_id: child.child_id, face_result: "Not matched", match_score: milk.score }).catch(() => {});
    overlay({ ok: false, title: "Face doesn't match", sub: `Ye chehra ${child.child_name} se match nahi hua.`, autoHomeSec: HOME_AFTER_FAIL_SEC,
      actions: [
        { label: "Home", cls: "primary", run: () => show("home") },
        { label: "Field Coordinator override", run: startOverride }
      ] });
  }
};
function startOverride(){
  if (role() === R_DM){ milk.result = "Override"; milk.overrideToken = ""; openMilkForm(); return; }
  $("#oErr").textContent = ""; $("#oUser").value = ""; $("#oPass").value = ""; $("#ovrSheet").hidden = false; $("#oUser").focus();
}
$("#oCancel").onclick = () => { $("#ovrSheet").hidden = true; show("home"); };
$("#ovrForm").onsubmit = async e => {
  e.preventDefault(); $("#oErr").textContent = "";
  busy($("#oBtn"), true, "Check\u2026");
  try {
    const r = await api("verifyOverride", { username: $("#oUser").value.trim(), password: $("#oPass").value });
    $("#ovrSheet").hidden = true; milk.result = "Override"; milk.overrideToken = r.override_token;
    toast("Override: " + r.name); openMilkForm();
  } catch(ex){ $("#oErr").textContent = ex.message; }
  finally { busy($("#oBtn"), false); $("#oPass").value = ""; }
};
function openMilkForm(){
  $("#milkPick").hidden = true; $("#milkForm").hidden = false; $("#mfErr").textContent = "";
  $("#mfName").textContent = milk.child.child_name;
  const ovr = milk.result === "Override";
  $("#mfBadge").className = "pill " + (ovr ? "warn" : "ok"); $("#mfBadge").textContent = ovr ? "Override" : "Face matched";
  $("#ovReasonWrap").hidden = !ovr; $("#ovReason").value = "";
  milk.given = null; $$("[data-given]").forEach(b => b.setAttribute("aria-pressed", "false"));
  $$("input[name=consumed]").forEach(r => r.checked = false); $("#consumeBox").hidden = true; $("#mfSave").disabled = true;
  window.scrollTo(0, 0);
}
$$("[data-given]").forEach(b => b.onclick = () => {
  milk.given = b.dataset.given; $$("[data-given]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  $("#consumeBox").hidden = milk.given !== "Yes"; $("#mfSave").disabled = false;
});
$("#mfCancel").onclick = () => { $("#milkForm").hidden = true; $("#milkPick").hidden = false; };
$("#milkForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#mfErr"); err.textContent = "";
  const consumed = (document.querySelector("input[name=consumed]:checked") || {}).value || "";
  if (!milk.given) return err.textContent = "Haan ya Nahi chunein.";
  if (milk.given === "Yes" && !consumed) return err.textContent = "Doodh kitna piya, chunein.";
  if (milk.result === "Override" && !$("#ovReason").value.trim()) return err.textContent = "Override ka kaaran likhein.";
  busy($("#mfSave"), true, "Save ho raha hai\u2026");
  try {
    const rr = await saveMilk({ child_id: milk.child.child_id, face_result: milk.result, match_score: milk.score,
      milk_given: milk.given, consumed, override_token: milk.overrideToken, override_reason: $("#ovReason").value.trim() });
    const name = milk.child.child_name;
    overlay({ ok: true, title: rr.offline ? "Phone mein save hua (offline)" : "Entry save ho gayi", sub: (milk.given === "Yes" ? `${name} \u00b7 ${consumed}` : `${name} \u00b7 doodh nahi diya`) + (rr.offline ? " \u00b7 Internet aate hi apne aap bhej di jayegi" : ""),
      actions: [{ label: "Agla bachcha", cls: "primary", run: () => { $("#milkForm").hidden = true; $("#milkPick").hidden = false; loadMilkKids(); } },
                { label: "Home", run: () => show("home") }] });
  } catch(ex){ err.textContent = ex.message; }
  finally { busy($("#mfSave"), false); }
};

/* Field Coordinator / District home: each Milk Ambassador today + entries waiting on her phone */
function agoText(ts){
  if (!ts) return "kabhi nahi";
  const t = new Date(ts.replace(" ", "T")), m = Math.round((Date.now() - t.getTime()) / 60000);
  if (isNaN(m)) return ts;
  if (m < 2) return "abhi"; if (m < 60) return m + " min pehle";
  const h = Math.round(m / 60); if (h < 24) return h + " ghante pehle";
  return Math.round(h / 24) + " din pehle";
}
function renderMaStatus(list){
  const box = $("#maPanel"); if (!box) return;
  box.hidden = !list.length; if (!list.length) return;
  const pend = list.filter(x => x.pending), pTot = pend.reduce((a, x) => a + x.pending, 0);
  $("#maSum").innerHTML = pTot ? `<span class="pill-stat left"><b>${pTot}</b> entry ${pend.length} MA ke phone mein pending</span>` : `<span class="pill-stat done">Kisi ke phone mein pending entry nahi \u2713</span>`;
  $("#maList").innerHTML = list.map(x => `<div class="rec ma-row${x.pending ? " pend" : ""}">
    <span class="dot" style="background:${x.pending ? "var(--bad)" : x.left ? "var(--drop)" : "var(--leaf)"}">${esc(initials(x.full_name))}</span>
    <span><b>${esc(x.full_name)}</b><small>${esc(x.awcs)}</small>
      <small>${x.kids ? `Aaj doodh mila: ${x.fed}/${x.kids}${x.left ? ` \u00b7 <b class="age-warn">${x.left} baaki</b>` : " \u2713"}` : "Abhi koi bachcha registered nahi"}</small>
      ${x.pending ? `<small class="age-warn">\u23f3 ${x.pending} entry phone mein pending${x.pending_oldest ? " (" + esc(x.pending_oldest) + " se)" : ""}</small>` : ""}
      <small>Aakhri baar online: ${esc(agoText(x.last_seen))}</small></span></div>`).join("");
}

/* ---------------- OFFLINE: milk entries saved on the phone, sent when internet returns ---------------- */
const OUTBOX = "mt.outbox";
const outbox = () => { try { return JSON.parse(store.get(OUTBOX) || "[]"); } catch(e){ return []; } };
const setOutbox = l => { store.set(OUTBOX, JSON.stringify(l)); renderNetBar(); heartbeat(); };
/* tell the server how many entries wait on this phone, so the Field Coordinator can see it */
let hbLast = { n: -1, at: 0 };
async function heartbeat(force){
  if (!S.token || !S.user || role() !== R_MA) return;
  const l = outbox(), n = l.length;
  if (!force && n === hbLast.n && Date.now() - hbLast.at < 10 * 60000) return;
  const oldest = l.reduce((m, o) => !m || o.payload.offline_date < m ? o.payload.offline_date : m, "");
  try { await api("heartbeat", { pending: n, oldest }); hbLast = { n, at: Date.now() }; } catch(e){}
}
const queuedToday = () => outbox().filter(o => o.payload.offline_date === today() && o.payload.milk_given === "Yes").map(o => o.payload.child_id);
async function saveMilk(payload){
  const now = new Date();
  const full = Object.assign({ client_id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }, payload);
  try { return await api("recordMilk", full); }
  catch(e){
    if (!e.offline || payload.face_result === "Override") throw e;
    full.offline_date = today(); full.offline_time = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const k = (milkKids || []).find(x => x.child_id === payload.child_id);
    setOutbox(outbox().concat([{ payload: full, child_name: k ? k.child_name : payload.child_id, at: Date.now() }]));
    if (k && payload.milk_given === "Yes") k.given_today = true;
    return { saved: true, offline: true };
  }
}
let syncing = false;
async function syncOutbox(manual){
  if (syncing || !S.token) return; const list = outbox(); if (!list.length){ if (manual) toast("Bhejne ke liye koi entry nahi."); return; }
  syncing = true; renderNetBar();
  let sent = 0, dropped = [];
  const left = [];
  for (let i = 0; i < list.length; i++){
    const o = list[i];
    try { await api("recordMilk", o.payload); sent++; }
    catch(e){
      if (e.offline){ left.push(...list.slice(i)); break; }
      if (e.code === "AUTH"){ left.push(...list.slice(i)); break; }
      dropped.push(o.child_name + ": " + e.message);       // already given / too old / not allowed: cannot be saved
    }
  }
  syncing = false; setOutbox(left); heartbeat(true);
  if (sent) toast(`${sent} offline entry server par bhej di \u2713`);
  if (dropped.length) overlay({ ok: false, title: `${dropped.length} offline entry save nahi hui`, sub: dropped.slice(0, 4).join(" \u00b7 "), actions: [{ label: "Theek hai", cls: "primary" }] });
  else if (manual && !sent && left.length) toast("Abhi bhi internet nahi hai.");
  if (sent && current === "home") loadDashboard();
}
function renderNetBar(){
  const bar = $("#netBar"); if (!bar) return;
  const n = outbox().length, off = !navigator.onLine;
  bar.hidden = !(n || off) || !S.token;
  $("#netText").textContent = syncing ? "Offline entry bhej rahe hain\u2026" : off ? (n ? `\ud83d\udcf4 Internet nahi hai \u00b7 ${n} entry phone mein rakhi hai` : "\ud83d\udcf4 Internet nahi hai \u00b7 doodh entry phone mein save hogi") : `\u23f3 ${n} offline entry bhejni baaki`;
  $("#netSync").hidden = !n || syncing;
}
$("#netSync").onclick = () => syncOutbox(true);
window.addEventListener("online", () => { renderNetBar(); syncOutbox(); });
window.addEventListener("offline", renderNetBar);
setInterval(() => { if (outbox().length && navigator.onLine) syncOutbox(); else heartbeat(); }, 60000);
/* faces of the AWC kept on the phone (for milk without internet) */
async function cacheFaces(panch){
  if (!panch || !canEnter()) return;
  const old = JSON.parse(store.get("mt.faces." + panch) || "null");
  if (old && old.day === today()) return;
  try { const r = await api("facesOfAwc", { panchayat: panch }); store.set("mt.faces." + panch, JSON.stringify({ day: today(), faces: r.faces })); } catch(e){}
}

/* ---------------- child photo while giving milk ---------------- */
const photoMem = new Map();
async function showChildPhoto(k){
  const box = $("#mPhoto"); if (!box) return;
  box.hidden = false; box.innerHTML = `<div class="ph-wait">${esc(initials(k.child_name))}</div><div><b>${esc(k.child_name)}</b><small>Maa: ${esc(k.mother_name)}${k.dob ? " \u00b7 " + esc(ageText(k.dob)) : ""}</small></div>`;
  let src = photoMem.get(k.child_id);
  if (src === undefined){ try { src = (await api("childPhoto", { child_id: k.child_id })).photo || ""; } catch(e){ src = ""; } photoMem.set(k.child_id, src); }
  if (milk.child && milk.child.child_id === k.child_id && src) box.querySelector(".ph-wait").outerHTML = `<img src="${src}" alt="${esc(k.child_name)} ki photo">`;
}

/* ---------------- CHILDREN LIST: edit details, change status ---------------- */
let kidsAll = [];
async function openKids(){
  await fillPanch($("#kPanch"), { allOption: true });
  await loadKidsList();
}
async function loadKidsList(){
  $("#kList").innerHTML = `<p class="muted">Load ho raha hai\u2026</p>`;
  try {
    const r = await api("listChildren", { panchayat: $("#kPanch").value, include_inactive: true });
    if (r.age_rule) AGE_RULE = r.age_rule; if (r.statuses) CHILD_STATUSES = r.statuses;
    kidsAll = r.children; renderKidsList();
  } catch(e){ $("#kList").innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
function renderKidsList(){
  const q = $("#kFind").value.trim().toLowerCase(), showAll = $("#kAll").checked;
  const list = kidsAll.filter(k => (showAll || k.status === "active") && (!q || (k.child_name + " " + k.mother_name + " " + k.phone).toLowerCase().includes(q)));
  const act = kidsAll.filter(k => k.status === "active");
  $("#kCount").textContent = `${act.length} chalu bachche \u00b7 ${act.filter(k => ageOut(k.dob)).length} umr-seema ke bahar \u00b7 ${act.filter(k => !k.has_face).length} bina chehre ke`;
  $("#kList").innerHTML = list.map(k => `<button type="button" class="kid${k.status !== "active" ? " done" : ""}" data-ck="${esc(k.child_id)}"><span class="kav">${esc(initials(k.child_name))}</span>
    <span class="knm"><b>${esc(k.child_name)}</b><small>Maa: ${esc(k.mother_name)} \u00b7 ${esc(String(k.panchayat).replace(/ \(\d+\)$/, ""))}</small><small>${k.dob ? esc(ageText(k.dob)) : "Janm tithi nahi"}${ageOut(k.dob) ? ' <span class="age-warn">\u26a0 umr-seema ke bahar</span>' : ""}${k.has_face ? "" : ' <span class="age-warn">chehra nahi</span>'}</small></span>
    <span class="kst">${k.status === "active" ? "Badlo \u203a" : esc(CHILD_STATUSES[k.status] || k.status)}</span></button>`).join("") || `<p class="muted">Koi bachcha nahi mila.</p>`;
}
$("#kPanch").onchange = loadKidsList; $("#kFind").oninput = renderKidsList; $("#kAll").onchange = renderKidsList;
$("#kList").onclick = async e => {
  const b = e.target.closest("[data-ck]"); if (!b) return;
  const k = kidsAll.find(x => x.child_id === b.dataset.ck); if (!k) return;
  $("#ckSheet").dataset.id = k.child_id; $("#ckErr").textContent = "";
  $("#ckName").value = k.child_name; $("#ckMother").value = k.mother_name; $("#ckPhone").value = k.phone; $("#ckDob").value = k.dob || ""; $("#ckDob").max = today();
  const awcs = await panchayats(); const sel = $("#ckPanch");
  sel.innerHTML = [...new Set([k.panchayat].concat(awcs))].map(a => `<option${a === k.panchayat ? " selected" : ""}>${esc(a)}</option>`).join("");
  $("#ckStatus").innerHTML = Object.entries(CHILD_STATUSES).map(([v, l]) => `<option value="${v}"${v === k.status ? " selected" : ""}>${esc(l)}</option>`).join("");
  $("#ckReason").value = k.status_reason || ""; $("#ckReasonW").hidden = k.status === "active";
  $("#ckAge").textContent = k.dob ? "Umr: " + ageText(k.dob) + (ageOut(k.dob) ? ` (niyam ${AGE_RULE.min}\u2013${AGE_RULE.max} mahine)` : "") : "";
  $("#ckMeta").textContent = `ID ${k.child_id} \u00b7 Registration: ${String(k.registered_at).slice(0, 10)} \u00b7 @${k.registered_by || ""}`;
  $("#ckPhoto").innerHTML = `<div class="ph-wait">${esc(initials(k.child_name))}</div>`;
  $("#ckSheet").hidden = false;
  let src = photoMem.get(k.child_id);
  if (src === undefined){ try { src = (await api("childPhoto", { child_id: k.child_id })).photo || ""; } catch(err){ src = ""; } photoMem.set(k.child_id, src); }
  if (src && $("#ckSheet").dataset.id === k.child_id) $("#ckPhoto").innerHTML = `<img src="${src}" alt="">`;
};
$("#ckStatus").onchange = () => { $("#ckReasonW").hidden = $("#ckStatus").value === "active"; };
$("#ckDob").onchange = () => { const d = $("#ckDob").value; $("#ckAge").textContent = d ? "Umr: " + ageText(d) + (ageOut(d) ? ` (niyam ${AGE_RULE.min}\u2013${AGE_RULE.max} mahine)` : "") : ""; };
$("#ckCancel").onclick = () => { $("#ckSheet").hidden = true; };
$("#ckForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#ckErr"); err.textContent = "";
  const d = { child_id: $("#ckSheet").dataset.id, child_name: $("#ckName").value.trim(), mother_name: $("#ckMother").value.trim(), phone: $("#ckPhone").value.trim(),
    dob: $("#ckDob").value, panchayat: $("#ckPanch").value, status: $("#ckStatus").value, status_reason: $("#ckReason").value.trim() };
  if (!d.child_name || !d.mother_name) return err.textContent = "Bachche ka naam aur maa ka naam bharein.";
  if (!/^[6-9]\d{9}$/.test(d.phone)) return err.textContent = "Phone number 10 ank ka sahi number likhein.";
  if (d.status !== "active" && !d.status_reason) return err.textContent = "Kaaran likhein (jaise kahan chale gaye).";
  busy($("#ckSave"), true, "Save ho raha hai\u2026");
  try {
    await api("updateChild", d);
    $("#ckSheet").hidden = true;
    toast(d.status === "active" ? "Bachche ki jaankari update ho gayi \u2713" : "Sthiti badal di: " + (CHILD_STATUSES[d.status] || d.status));
    store.set("mt.kids." + d.panchayat, null);
    await loadKidsList();
  } catch(ex){ err.textContent = ex.message; }
  finally { busy($("#ckSave"), false); }
};

/* ---------------- AWC LIST (District Management): which AWCs give milk, add new AWC ---------------- */
let awcAll = [];
async function openAwcs(){
  $("#wSector").innerHTML = SECTORS.map(x => `<option>${esc(x)}</option>`).join("");
  $("#wList").innerHTML = `<p class="muted">Load ho raha hai\u2026</p>`;
  const r = await loadAwcList(true);
  if (!r){ $("#wList").innerHTML = `<p class="err">List nahi aayi</p>`; return; }
  awcAll = r; awcFcs = awcFcsList; renderAwcs(); fillMaster();
  $("#wSector").innerHTML = SECTORS.map(x => `<option>${esc(x)}</option>`).join("");
}
function renderAwcs(){
  const q = $("#wFind").value.trim().toLowerCase();
  const list = awcAll.filter(a => !q || (a.name + " " + a.code + " " + a.sector + " " + (a.panchayat || "")).toLowerCase().includes(q))
    .sort((a, b) => (b.active - a.active) || a.sector.localeCompare(b.sector, "en", { numeric: true }) || a.name.localeCompare(b.name));
  const on = awcAll.filter(a => a.active);
  const ph = [1, 2, 3].map(n => on.filter(a => String(a.phase) === String(n)).length);
  $("#wCount").innerHTML = `<b>${on.length}</b> AWC mein doodh vitaran chalu \u00b7 ${awcAll.length - on.length} band (aage chalu hongi)` + (ph.some(Boolean) ? ` \u00b7 Phase 1: ${ph[0]}, Phase 2: ${ph[1]}, Phase 3: ${ph[2]}` : "");
  const firstOff = list.findIndex(a => !a.active);
  $("#wList").innerHTML = list.slice(0, 400).map((a, i) => (i === firstOff ? `<h4 class="aw-sep">\u23f8 Band \u2014 yahan doodh abhi shuru nahi hua (switch se chalu karein)</h4>` : "") + `<div class="aw-row${a.active ? "" : " off"}">
    <label class="sw"><input type="checkbox" data-on="${esc(a.code)}"${a.active ? " checked" : ""}><span></span></label>
    <span class="aw-t"><b>${esc(a.name)}</b><small>${esc(a.code)} \u00b7 ${esc(a.sector)}${a.panchayat ? " \u00b7 " + esc(a.panchayat) : ""}${a.area_type ? " \u00b7 " + esc(a.area_type) : ""}${a.phase ? " \u00b7 Phase " + esc(a.phase) : ""}</small>
      <small class="aw-fc${(a.fcs || []).length ? "" : " none"}">FC: ${(a.fcs || []).length ? esc(a.fcs.map(f => f.full_name).join(", ")) : "koi nahi"}</small></span>
    <span class="aw-btns"><button type="button" class="btn small primary" data-afc="${esc(a.code)}">\ud83d\udc64 FC</button><button type="button" class="btn small ghost" data-aedit="${esc(a.code)}">Badlo</button></span></div>`).join("") || `<p class="muted">Koi AWC nahi mili.</p>`;
}
$("#wFind").oninput = renderAwcs;
/* the government list of all 245 AWCs, only to help fill the add form */
function fillMaster(){
  const have = new Set(awcAll.map(a => a.code));
  $("#wMaster").innerHTML = AWC.filter(a => !have.has(a[2])).map(a => `<option value="${esc(a[1])} (${esc(a[2])})"></option>`).join("");
}
$("#wName").addEventListener("change", () => {
  const m = /^(.*) \((\d{11})\)$/.exec($("#wName").value.trim()); if (!m) return;
  const a = AWC.find(x => x[2] === m[2]); if (!a) return;
  $("#wName").value = a[1]; if (!$("#wCode").disabled) $("#wCode").value = a[2]; $("#wSector").value = a[0];
});
$("#wList").onchange = async e => {
  const c = e.target; if (!c.dataset.on) return;
  c.disabled = true;
  try { const r = await api("manageAwc", { op: "set_active", codes: [c.dataset.on], on: c.checked }); toast(r.message); const a = awcAll.find(x => x.code === c.dataset.on); if (a) a.active = c.checked; renderAwcs(); loadAwcList(); }
  catch(ex){ c.checked = !c.checked; toast(ex.message); }
  finally { c.disabled = false; }
};
$("#wList").onclick = e => {
  const f = e.target.closest("[data-afc]");
  if (f){
    const a = awcAll.find(x => x.code === f.dataset.afc); if (!a) return;
    if (!awcFcs.length) return overlay({ ok: false, title: "Abhi koi FC account nahi", sub: "Pehle Field Coordinator app mein 'Create user ID' se apna account banayein (role: Field Coordinator, admin ka access code). Phir yahan unka naam aayega.", actions: [{ label: "Theek hai", cls: "primary" }] });
    $("#afSheet").dataset.code = a.code; $("#afWho").textContent = `${a.name} (${a.code}) \u00b7 ${a.sector}`; $("#afErr").textContent = "";
    const on = new Set((a.fcs || []).map(x => x.username));
    $("#afList").innerHTML = awcFcs.map(u => `<label class="tag-row"><input type="checkbox" value="${esc(u.username)}"${on.has(u.username) ? " checked" : ""}> ${esc(u.full_name)} <small class="muted">@${esc(u.username)}</small></label>`).join("");
    $("#afSheet").hidden = false; return;
  }
  const b = e.target.closest("[data-aedit]"); if (!b) return;
  const a = awcAll.find(x => x.code === b.dataset.aedit); if (!a) return;
  $("#wForm").dataset.edit = a.code; $("#wFormTitle").textContent = "AWC badlo: " + a.name;
  $("#wName").value = a.name; $("#wCode").value = a.code; $("#wCode").disabled = true; $("#wSector").value = a.sector;
  $("#wPanch").value = a.panchayat || ""; $("#wArea").value = a.area_type || ""; $("#wPhase").value = a.phase || ""; $("#wErr").textContent = "";
  $("#wFormBox").open = true; $("#wFormBox").scrollIntoView({ behavior: "smooth", block: "start" });
};
$("#afCancel").onclick = () => { $("#afSheet").hidden = true; };
$("#afForm").onsubmit = async e => {
  e.preventDefault();
  busy($("#afSave"), true, "Save ho raha hai\u2026");
  try {
    const r = await api("manageAwc", { op: "set_fcs", code: $("#afSheet").dataset.code, fcs: $$("#afList input:checked").map(c => c.value) });
    $("#afSheet").hidden = true; toast(r.message); await openAwcs();
  } catch(ex){ $("#afErr").textContent = ex.message; }
  finally { busy($("#afSave"), false); }
};
function resetAwcForm(){ $("#wForm").reset(); $("#wForm").dataset.edit = ""; $("#wCode").disabled = false; $("#wFormTitle").textContent = "+ Nayi AWC jodo"; $("#wErr").textContent = ""; }
$("#wFormBox").addEventListener("toggle", () => { if (!$("#wFormBox").open && $("#wForm").dataset.edit) resetAwcForm(); });
$("#wForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#wErr"); err.textContent = "";
  const edit = $("#wForm").dataset.edit;
  const d = { op: edit ? "edit" : "add", name: $("#wName").value.trim(), code: edit || $("#wCode").value.trim(), sector: $("#wSector").value,
    panchayat: $("#wPanch").value.trim(), area_type: $("#wArea").value, phase: $("#wPhase").value };
  if (!d.name) return err.textContent = "AWC ka naam likhein.";
  if (!edit && d.code && !/^\d{6,15}$/.test(d.code)) return err.textContent = "AWC code sirf ank mein ho (jaise 20367060101).";
  busy($("#wSave"), true, "Save ho raha hai\u2026");
  try { const r = await api("manageAwc", d); toast(r.message); resetAwcForm(); $("#wFormBox").open = false; await openAwcs(); loadAwcList(); }
  catch(ex){ err.textContent = ex.message; }
  finally { busy($("#wSave"), false); }
};
async function awcPasteSet(only){
  const codes = ($("#wPaste").value.match(/\d{11}/g) || []);
  const known = new Set(awcAll.map(a => a.code)), bad = codes.filter(c => !known.has(c)), good = codes.filter(c => known.has(c));
  if (!good.length) return $("#wPasteMsg").textContent = "Koi sahi AWC code nahi mila.";
  const go = async () => {
    try { const r = await api("manageAwc", { op: "set_active", codes: good, on: true, only }); $("#wPasteMsg").innerHTML = esc(r.message) + (bad.length ? ` <span class="age-warn">${bad.length} code list mein nahi: ${esc(bad.slice(0, 6).join(", "))}</span>` : ""); await openAwcs(); loadAwcList(); }
    catch(ex){ $("#wPasteMsg").textContent = ex.message; }
  };
  if (only) overlay({ ok: false, title: "Sirf ye AWC chalu rakhein?", sub: `${good.length} AWC chalu rahengi, baaki sab band ho jayengi. Band AWC ka purana data nahi mitta.`, actions: [{ label: "Haan, yahi rakho", cls: "primary", run: go }, { label: "Cancel" }] });
  else go();
}
$("#wPasteAdd").onclick = () => awcPasteSet(false);
$("#wPasteOnly").onclick = () => awcPasteSet(true);

/* ---------------- AWC tagging (District Management) ---------------- */
function shortAwcs(list){
  const a = String(list).split(",").map(x => x.trim().replace(/ \(\d+\)$/, "")).filter(Boolean);
  return a.length > 5 ? a.slice(0, 5).join(", ") + ` +${a.length - 5}` : a.join(", ");
}
const tagS = { user: null, secs: new Set(), awcs: new Set() };
function openTag(u){
  tagS.user = u; tagS.secs = new Set(); tagS.awcs = new Set();
  String(u.panchayats || "").split(",").map(x => x.trim()).filter(Boolean).forEach(x => /^Sector-\d+$/i.test(x) ? tagS.secs.add(x) : tagS.awcs.add(x));
  $("#tagWho").textContent = `${u.full_name} (@${u.username}) \u00b7 ${u.role}`;
  $("#tagNote").textContent = u.role === R_FC ? "Poora sector tick karein (us sector ki sab AWC), ya sirf kuch AWC chunein. Ek AWC kai FC ko bhi tag ho sakti hai." : "Is Milk Ambassador ki AWC chunein.";
  const others = allUsers.filter(x => x.role === u.role && x.username !== u.username && x.active === "yes" && x.panchayats);
  $("#tagCopyW").hidden = !others.length;
  $("#tagCopyFrom").innerHTML = others.map(x => `<option value="${esc(x.username)}">${esc(x.full_name)} (${esc(shortAwcs(x.panchayats))})</option>`).join("");
  $("#tagPaste").value = ""; $("#tagPasteMsg").textContent = "";
  $("#tagFind").value = ""; $("#tagErr").textContent = ""; renderTag(); $("#tagSheet").hidden = false;
}
function renderTag(){
  const q = $("#tagFind").value.trim().toLowerCase(), fc = tagS.user.role === R_FC;
  const wasOpen = new Set($$("#tagList details[open]").map(d => d.dataset.s));
  $("#tagList").innerHTML = SECTORS.filter(sec => AWC.some(a => a[0] === sec && awcOn(a))).map(sec => {
    const items = AWC.filter(a => a[0] === sec && awcOn(a)), whole = tagS.secs.has(sec);
    const shown = items.filter(a => !q || awcLabel(a).toLowerCase().includes(q));
    if (q && !shown.length) return "";
    const picked = whole ? items.length : items.filter(a => tagS.awcs.has(awcLabel(a))).length;
    return `<details class="tag-sec" data-s="${esc(sec)}"${q || picked || wasOpen.has(sec) ? " open" : ""}><summary><b>${esc(sec)}</b> <small class="muted">${picked}/${items.length} chune</small></summary>
      ${fc ? `<label class="tag-row whole"><input type="checkbox" data-sec="${esc(sec)}"${whole ? " checked" : ""}> Poora ${esc(sec)} (${items.length} AWC)</label>` : ""}
      ${shown.map(a => { const l = awcLabel(a); return `<label class="tag-row"><input type="checkbox" data-awc="${esc(l)}"${whole || tagS.awcs.has(l) ? " checked" : ""}${whole ? " disabled" : ""}> ${esc(a[1])} <small class="muted">${esc(a[2])}</small></label>`; }).join("")}</details>`;
  }).join("") || `<p class="muted">Koi AWC nahi mila.</p>`;
  const n = [...tagS.secs].reduce((t, sc) => t + AWC.filter(a => a[0] === sc && awcOn(a)).length, 0) + [...tagS.awcs].filter(l => !tagS.secs.has((AWC.find(a => awcLabel(a) === l) || [])[0])).length;
  $("#tagCount").textContent = `${n} AWC chune` + (tagS.secs.size ? ` (${tagS.secs.size} poore sector)` : "");
}
$("#tagFind").oninput = renderTag;
$("#tagCopy").onclick = () => {
  const src = allUsers.find(x => x.username === $("#tagCopyFrom").value); if (!src) return;
  String(src.panchayats).split(",").map(x => x.trim()).filter(Boolean).forEach(x => /^Sector-\d+$/i.test(x) ? tagS.secs.add(x) : tagS.awcs.add(x));
  renderTag(); toast(src.full_name + " ki AWC jod di");
};
$("#tagClear").onclick = () => { tagS.secs.clear(); tagS.awcs.clear(); renderTag(); };
$("#tagPasteGo").onclick = () => {
  const txt = $("#tagPaste").value, found = new Set(), miss = [];
  const byCode = new Map(AWC.map(a => [a[2], a])), byName = new Map(AWC.map(a => [a[1].toLowerCase().replace(/\s+/g, " ").trim(), a]));
  (txt.match(/\d{11}/g) || []).forEach(c => { const a = byCode.get(c); a && awcOn(a) ? found.add(awcLabel(a)) : miss.push(a ? c + " (band AWC)" : c); });
  txt.split(/\r?\n/).map(l => l.replace(/\d{11}/g, "").replace(/\t.*$/, "").trim()).filter(l => l && /[a-z]/i.test(l)).forEach(l => {
    const a = byName.get(l.toLowerCase().replace(/\s+/g, " ")); if (a && awcOn(a)) found.add(awcLabel(a)); else if (a) miss.push(l + " (band AWC)"); else if (!/^(awc|name|awc name|awc code)$/i.test(l)) miss.push(l);
  });
  found.forEach(l => tagS.awcs.add(l)); renderTag();
  $("#tagPasteMsg").innerHTML = `${found.size} AWC tick ho gayi.` + (miss.length ? ` <span class="age-warn">${miss.length} nahi mili: ${esc(miss.slice(0, 8).join(", "))}${miss.length > 8 ? "\u2026" : ""}</span>` : "");
};
$("#tagList").onchange = e => {
  const c = e.target; if (c.dataset.sec){ c.checked ? tagS.secs.add(c.dataset.sec) : tagS.secs.delete(c.dataset.sec); }
  else if (c.dataset.awc){ c.checked ? tagS.awcs.add(c.dataset.awc) : tagS.awcs.delete(c.dataset.awc); }
  renderTag();
};
$("#tagCancel").onclick = () => { $("#tagSheet").hidden = true; };
$("#tagForm").onsubmit = async e => {
  e.preventDefault();
  if (!tagS.secs.size && !tagS.awcs.size) return $("#tagErr").textContent = "Kam se kam ek AWC chunein.";
  busy($("#tagSave"), true, "Save ho raha hai\u2026");
  try {
    const r = await api("manageUser", { username: tagS.user.username, op: "set_awcs", sectors: [...tagS.secs], awcs: [...tagS.awcs] });
    $("#tagSheet").hidden = true; toast(r.message); await openUsers();
  } catch(ex){ $("#tagErr").textContent = ex.message; }
  finally { busy($("#tagSave"), false); }
};

/* ---------------- USERS (District Management) ---------------- */
let allUsers = [];
async function openUsers(){
  $("#uList").innerHTML = '<p class="muted">Load ho raha hai\u2026</p>';
  try { allUsers = (await api("listUsers")).users; renderUsers(); }
  catch(e){ $("#uList").innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
function userState(u){
  if (u.active === "removed") return ["Hataya gaya", "bad"];
  if (u.active !== "yes") return ["Band", "warn"];
  if (u.locked) return ["Locked (15 min)", "warn"];
  return ["Chalu", "ok"];
}
function renderUsers(){
  const q = $("#uSearch").value.trim().toLowerCase(), r = $("#uRole").value;
  const list = allUsers.filter(u => (!r || u.role === r) && (!q || (u.full_name + " " + u.username + " " + u.phone).toLowerCase().includes(q)))
    .sort((a, b) => (!!(b.reset_requested && !String(b.reset_requested).startsWith("Khud")) - !!(a.reset_requested && !String(a.reset_requested).startsWith("Khud"))) || (a.active === "removed") - (b.active === "removed") || String(b.created_at).localeCompare(String(a.created_at)));
  $("#uCount").textContent = `${list.length} account \u00b7 ${allUsers.filter(u => u.active === "yes").length} chalu`;
  $("#uList").innerHTML = list.map(u => { const [st, cls] = userState(u);
    const btns = u.me ? `<span class="pill">Aap</span><button class="btn small ghost" data-uop="mypw" data-u="${esc(u.username)}">\ud83d\udd11 Mera password badlo</button>` : u.active === "removed" ? `<button class="btn small ghost" data-uop="enable" data-u="${esc(u.username)}">Wapas chalu karo</button>`
      : `<button class="btn small bad" data-uop="remove" data-u="${esc(u.username)}">Hatao</button>`
        + (u.active === "yes" ? `<button class="btn small ghost" data-uop="disable" data-u="${esc(u.username)}">Band karo</button>` : `<button class="btn small ghost" data-uop="enable" data-u="${esc(u.username)}">Chalu karo</button>`)
        + (u.locked ? `<button class="btn small ghost" data-uop="unlock" data-u="${esc(u.username)}">Unlock</button>` : "")
        + ((u.role === R_FC || u.role === R_MA) && u.active === "yes" ? `<button class="btn small ghost" data-uop="tag" data-u="${esc(u.username)}">\ud83d\udccd AWC tag karo</button>` : "")
        + `<button class="btn small ${u.reset_requested ? "primary" : "ghost"}" data-uop="reset" data-u="${esc(u.username)}">Password reset</button>`;
    return `<div class="panel ucard"><div class="who"><div><b>${esc(u.full_name)}</b> <small class="muted">@${esc(u.username)}</small></div><span class="pill ${cls}">${st}</span></div>
      <div class="muted">${esc(u.role)} \u00b7 Mobile ${esc(String(u.phone).replace(/^old-/, "") || "\u2014")}${u.phone && String(u.phone).startsWith("old-") ? " (free)" : ""}${u.panchayats ? " \u00b7 " + esc(shortAwcs(u.panchayats)) : ""}</div>
      <div class="muted">Bana: ${esc(String(u.created_at).slice(0, 10))} \u00b7 Registered bachche: ${u.children}</div>
      ${u.reset_requested && !String(u.reset_requested).startsWith("Khud") ? `<div class="note">\ud83d\udd11 Password reset maanga: ${esc(String(u.reset_requested).slice(0, 16))}</div>` : ""}
      <div class="row">${btns}</div></div>`; }).join("") || `<p class="muted">Koi account nahi mila.</p>`;
}
$("#uSearch").addEventListener("input", renderUsers); $("#uRole").onchange = renderUsers;
async function doUserOp(username, op, extra){
  try { const r = await api("manageUser", Object.assign({ username, op }, extra || {})); toast(r.message); await openUsers(); }
  catch(e){ overlay({ ok: false, title: "Nahi hua", sub: e.message, actions: [{ label: "Theek hai", cls: "primary" }] }); }
}
$("#uList").onclick = e => {
  const b = e.target.closest("[data-uop]"); if (!b) return;
  const u = allUsers.find(x => x.username === b.dataset.u), op = b.dataset.uop;
  if (op === "mypw") return openMyPw();
  if (op === "tag") return openTag(u);
  if (op === "remove") return overlay({ ok: false, title: "Account hatayein?", sub: `${u.full_name} (@${u.username}) login nahi kar payenge. Unka mobile number free ho jayega aur us number se naya account ban sakega. Unki purani entries Sheet mein rahengi.`,
    actions: [{ label: "Haan, hatao", cls: "bad", run: () => doUserOp(u.username, "remove") }, { label: "Cancel" }] });
  if (op === "disable") return overlay({ ok: false, title: "Account band karein?", sub: `${u.full_name} login nahi kar payenge. Baad mein "Chalu karo" se wapas khol sakte hain.`,
    actions: [{ label: "Haan, band karo", cls: "bad", run: () => doUserOp(u.username, "disable") }, { label: "Cancel" }] });
  if (op === "reset"){ $("#pwWho").textContent = `${u.full_name} (@${u.username})`; $("#pwNew").value = ""; $("#pwErr").textContent = ""; $("#pwSheet").hidden = false; $("#pwSheet").dataset.u = u.username; return; }
  doUserOp(u.username, op);
};
$("#pwCancel").onclick = () => { $("#pwSheet").hidden = true; };
/* own password: any logged-in user */
function openMyPw(){
  $("#pwWho").textContent = `${S.user.full_name} (@${S.user.username}) \u2014 apna naya password`;
  $("#pwNew").value = ""; $("#pwErr").textContent = ""; $("#pwSheet").dataset.u = ""; $("#pwSheet").hidden = false;
}
/* forgot password (login screen): username + registered mobile -> new password */
$("#fgBtn").onclick = () => { $("#fgUser").value = $("#lUser").value.trim(); ["#fgPhone", "#fgNew", "#fgNew2"].forEach(k => $(k).value = ""); $("#fgErr").textContent = ""; $("#fgSheet").hidden = false; };
$("#fgCancel").onclick = () => { $("#fgSheet").hidden = true; };
$$("#fgSheet [data-eye]").forEach(b => b.onclick = () => { const i = $("#" + b.dataset.eye), sh = i.type === "password"; i.type = sh ? "text" : "password"; b.classList.toggle("on", sh); });
$("#fgForm").onsubmit = async e => {
  e.preventDefault(); const err = $("#fgErr"); err.textContent = "";
  const d = { username: $("#fgUser").value.trim().toLowerCase(), phone: $("#fgPhone").value.trim(), new_password: $("#fgNew").value.trim() };
  if (!d.username || !/^\d{10}$/.test(d.phone)) return err.textContent = "Username aur 10 ank ka mobile number likhein.";
  if (d.new_password.length < 6) return err.textContent = "Naya password kam se kam 6 akshar ka ho.";
  if (d.new_password !== $("#fgNew2").value.trim()) return err.textContent = "Dono password ek jaise nahi hain.";
  busy($("#fgSubmit"), true, "Ban raha hai\u2026");
  try {
    const r = await api("forgotPassword", d);
    $("#fgSheet").hidden = true; $("#lUser").value = r.username || d.username; $("#lPass").value = "";
    overlay({ ok: true, title: "Naya password ban gaya", sub: "Ab isi naye password se login karein: " + d.new_password, actions: [{ label: "Login karo", cls: "primary", run: () => $("#lPass").focus() }] });
  } catch(ex){ err.textContent = ex.message; }
  finally { busy($("#fgSubmit"), false); }
};
$("#lEye").onclick = () => { const i = $("#lPass"), show = i.type === "password"; i.type = show ? "text" : "password"; $("#lEye").classList.toggle("on", show); };
$("#pwForm").onsubmit = async e => {
  e.preventDefault(); const pw = $("#pwNew").value.trim();
  if (pw.length < 6) return $("#pwErr").textContent = "Kam se kam 6 akshar.";
  $("#pwSheet").hidden = true;
  if (!$("#pwSheet").dataset.u){
    try { await api("changeMyPassword", { new_password: pw }); overlay({ ok: true, title: "Password badal gaya", sub: "Agli baar isi naye password se login karein: " + pw, actions: [{ label: "Theek hai", cls: "primary" }] }); }
    catch(ex){ overlay({ ok: false, title: "Password nahi badla", sub: ex.message, actions: [{ label: "Theek hai", cls: "primary" }] }); }
    return;
  }
  await doUserOp($("#pwSheet").dataset.u, "reset", { new_password: pw });
};

/* ---------------- REPORTS ---------------- */
let period = "day", lastReport = null;
$$("[data-per]").forEach(b => b.onclick = () => {
  period = b.dataset.per; $$("[data-per]").forEach(x => x.setAttribute("aria-selected", String(x === b)));
  $("#pDayW").hidden = !(period === "day" || period === "week");
  $("#pDayW").firstChild.textContent = period === "week" ? "Hafte ka koi bhi din" : "Tareekh";
  $("#pMonthW").hidden = period !== "month"; $("#pFromW").hidden = period !== "custom"; $("#pToW").hidden = period !== "custom";
});
function range(){
  if (period === "day"){ const d = $("#pDay").value || today(); return [d, d]; }
  if (period === "week"){
    const d = new Date(($("#pDay").value || today()) + "T00:00:00"); const dow = (d.getDay() + 6) % 7;
    const s = new Date(d); s.setDate(d.getDate() - dow); const e = new Date(s); e.setDate(s.getDate() + 6); return [ymd(s), ymd(e)];
  }
  if (period === "month"){
    const m = $("#pMonth").value || today().slice(0, 7); const [y, mo] = m.split("-").map(Number);
    return [m + "-01", ymd(new Date(y, mo, 0))];
  }
  return [$("#pFrom").value, $("#pTo").value];
}
async function openRep(){
  if (!$("#pDay").value) $("#pDay").value = today();
  if (!$("#pMonth").value) $("#pMonth").value = today().slice(0, 7);
  if (!$("#pFrom").value){ const d = new Date(); d.setDate(d.getDate() - 6); $("#pFrom").value = ymd(d); $("#pTo").value = today(); }
  await fillPanch($("#pPanch"), { allOption: true, sectorOptions: true });
  $("#barTitle").textContent = REP_TITLE[role()] || "Reports";
  $("#pAmbW").hidden = true;
}
$("#pAmb").onchange = () => { if (lastReport && lastReport.mode === "full") renderReport(lastReport); };
$("#pGo").onclick = async () => {
  const [from, to] = range(); $("#pErr").textContent = "";
  if (!from || !to || from > to) return $("#pErr").textContent = "Sahi tareekh chunein (from, to se pehle ho).";
  busy($("#pGo"), true, "Report ban rahi hai\u2026");
  try {
    const pv = $("#pPanch").value, sector = pv.startsWith("sector:") ? pv.slice(7) : "";
    const r = await api("report", { from, to, panchayat: sector ? "" : pv, sector });
    lastReport = Object.assign(r, { from, to, panch: sector || pv });
    if (r.mode === "summary") renderSummary(lastReport);
    else {
      const amb = $("#pAmb"), cur = amb.value;
      $("#pAmbW").hidden = !r.ambassadors.length;
      amb.innerHTML = `<option value="">Sabhi ambassador (${r.ambassadors.length})</option>` + r.ambassadors.map(a => `<option value="${esc(a.username)}">${esc(a.full_name)} (@${esc(a.username)})</option>`).join("");
      if ([...amb.options].some(o => o.value === cur)) amb.value = cur;
      renderReport(lastReport);
    }
  } catch(ex){ $("#pErr").textContent = ex.message; }
  finally { busy($("#pGo"), false); }
};
function summarise(r){
  const kids = new Map(r.children.map(c => [c.child_id, Object.assign({ days: 0, Full: 0, Half: 0, Quarter: 0, "Taken home": 0, no: 0, fail: 0, cg: 0 }, c)]));
  const days = new Map();
  r.milk.forEach(m => {
    const d = days.get(m.date) || { date: m.date, given: 0, Full: 0, Half: 0, Quarter: 0, "Taken home": 0, no: 0, fail: 0 };
    const k = kids.get(m.child_id);
    if (m.milk_given === "Yes"){ d.given++; d[m.consumed] = (d[m.consumed] || 0) + 1; if (k){ k.days++; k[m.consumed]++; if (String(m.face_result).startsWith("Caregiver")) k.cg++; } }
    else if (m.face_result === "Not matched" || m.face_result === "Caregiver not matched"){ d.fail++; if (k) k.fail++; }
    else { d.no++; if (k) k.no++; }
    days.set(m.date, d);
  });
  const latest = new Map();
  r.growth.filter(g => g.status !== "Replaced").sort((a, b) => (a.month + a.timestamp).localeCompare(b.month + b.timestamp)).forEach(g => latest.set(g.child_id, g));
  kids.forEach(k => { const g = latest.get(k.child_id); k.w = g ? g.weight_kg : k.weight_kg; k.h = g ? g.height_cm : k.height_cm; });
  return { kids: [...kids.values()].sort((a, b) => a.child_name.localeCompare(b.child_name)), days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)) };
}
const CATS = [["Full","Pura (Full)","var(--c-full)"],["Half","Aadha (Half)","var(--c-half)"],["Quarter","Chauthai (Qtr)","var(--c-qtr)"],["Taken home","Ghar le gaye","var(--c-home)"]];
function donutSvg(counts){
  const total = counts.reduce((a, b) => a + b, 0), r = 52, c = 2 * Math.PI * r;
  let off = 0;
  const arcs = total ? counts.map((n, i) => { const len = n / total * c; const el = n ? `<circle cx="70" cy="70" r="${r}" fill="none" stroke="${CATS[i][2]}" stroke-width="22" stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 70 70)"><title>${CATS[i][1]}: ${n}</title></circle>` : ""; off += len; return el; }).join("") : `<circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--sunk)" stroke-width="22"/>`;
  const full = total ? Math.round(counts[0] / total * 100) : 0;
  return `<svg viewBox="0 0 140 140" role="img" aria-label="Doodh kitna piya">${arcs}<text x="70" y="70" text-anchor="middle" font-size="24" font-weight="700" fill="var(--fg)" font-family="var(--f-display)">${full}%</text><text x="70" y="88" text-anchor="middle" font-size="11" fill="var(--muted)">pura piya</text></svg>`;
}
function legendHtml(counts){ return CATS.map(([k, l, c], i) => (k === "Taken home" && !counts[i]) ? "" : `<div><i style="background:${c}"></i><span>${l}</span><b>${counts[i]}</b></div>`).join(""); }
function dailySvg(days){
  if (!days.length) return `<p class="muted">Is samay mein koi entry nahi.</p>`;
  const n = days.length, W = Math.max(320, n * 34), H = 150, top = 18, base = 120, bw = Math.min(26, (W - 20) / n - 8), max = Math.max(1, ...days.map(d => d.given));
  return `<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="min-width:${Math.min(W, 900)}px" role="img" aria-label="Roz ki doodh entry"><line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--line)"/>${days.map((d, i) => {
    const x = 10 + i * ((W - 20) / n) + ((W - 20) / n - bw) / 2; let y = base;
    const seg = [["Full", d.Full], ["Half", d.Half], ["Quarter", d.Quarter], ["Taken home", d.home !== undefined ? d.home : d["Taken home"]]].map(([k, v], j) => { const h = v / max * (base - top); y -= h; return v ? `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${CATS[j][2]}"><title>${d.date} \u00b7 ${CATS[j][1]}: ${v}</title></rect>` : ""; }).join("");
    return seg + `<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--fg)">${d.given || ""}</text><text x="${x + bw / 2}" y="${base + 14}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${d.date.slice(8)}/${d.date.slice(5, 7)}</text>`
      + (d.fail ? `<text x="${x + bw / 2}" y="${base + 27}" text-anchor="middle" font-size="9.5" fill="var(--bad)">\u2715${d.fail}</text>` : ""); }).join("")}</svg></div>`;
}
function filtered(r){
  const a = $("#pAmb").value;
  if (!a) return r;
  const kids = r.children.filter(c => c.registered_by === a), ids = new Set(kids.map(c => c.child_id));
  return Object.assign({}, r, { children: kids, milk: r.milk.filter(m => m.recorded_by === a || ids.has(m.child_id)), growth: r.growth.filter(g => ids.has(g.child_id)) });
}
function renderReport(full){
  const r = filtered(full);
  const s = summarise(r); full.summary = s; full.view = r;
  $("#repOut").hidden = false; $("#sumOut").hidden = true;
  $("#pRange").textContent = `${r.from === r.to ? r.from : r.from + " se " + r.to} \u00b7 ${r.panch || (role() === R_MA ? "Mere AWC" : role() === R_FC ? "Mere sector" : "Sabhi AWC")}${$("#pAmb").value ? " \u00b7 @" + $("#pAmb").value : ""}`;
  const given = r.milk.filter(m => m.milk_given === "Yes");
  $("#kReg").textContent = r.children.filter(c => c.status === "active").length;
  $("#kGiven").textContent = given.length;
  $("#kKids").textContent = new Set(given.map(m => m.child_id)).size;
  $("#kFail").textContent = r.milk.filter(m => /not matched/i.test(m.face_result)).length;
  const counts = CATS.map(([k]) => given.filter(m => m.consumed === k).length);
  $("#kDonut").innerHTML = donutSvg(counts); $("#kLegend").innerHTML = legendHtml(counts);
  $("#kDaily").innerHTML = dailySvg(s.days);
  const ambs = full.ambassadors || [];
  $("#ambPanel").hidden = !ambs.length;
  $("#tAmb").innerHTML = ambs.filter(a => !$("#pAmb").value || a.username === $("#pAmb").value).map(a => {
    const mine = full.milk.filter(m => m.recorded_by === a.username), last = mine.slice().sort((x, y) => (y.date + y.time).localeCompare(x.date + x.time))[0];
    return `<tr><td><b>${esc(a.full_name)}</b><br><small class="muted">@${esc(a.username)}</small></td><td>${esc(String(a.panchayats).replace(/ \(\d+\)/g, ""))}</td><td class="n">${full.children.filter(c => c.registered_by === a.username).length}</td><td class="n">${mine.filter(m => m.milk_given === "Yes").length}</td><td class="n">${mine.filter(m => /not matched/i.test(m.face_result)).length}</td><td class="n">${mine.filter(m => m.face_result === "Override").length}</td><td>${last ? esc(last.date + " " + last.time) : "\u2014"}</td></tr>`; }).join("");
  $("#tDays").innerHTML = s.days.map(d => `<tr><td>${d.date}</td><td class="n">${d.given}</td><td class="n">${d.Full}</td><td class="n">${d.Half}</td><td class="n">${d.Quarter}</td><td class="n">${d.no}</td><td class="n">${d.fail}</td></tr>`).join("")
    || `<tr><td colspan="7" class="muted">Is samay mein koi entry nahi.</td></tr>`;
  $("#tKids").innerHTML = s.kids.map(k => `<tr><td>${esc(k.child_name)}</td><td>${esc(k.mother_name)}</td><td>${esc(k.panchayat)}</td><td class="n">${k.days}</td><td class="n">${k.Full}</td><td class="n">${k.Half}</td><td class="n">${k.Quarter}</td><td class="n">${esc(k.w)}</td><td class="n">${esc(k.h)}</td></tr>`).join("")
    || `<tr><td colspan="9" class="muted">Koi bachcha registered nahi.</td></tr>`;
  $("#tGrowth").innerHTML = r.growth.slice().sort((a, b) => (a.child_name + a.month + a.timestamp).localeCompare(b.child_name + b.month + b.timestamp)).map(g =>
    `<tr${g.status === "Replaced" ? ' class="old" style="opacity:.55;text-decoration:line-through"' : ""}><td>${esc(g.child_name)}</td><td>${esc(g.period || g.month)}<br><small class="muted">${esc(g.period_type === "Quarterly" ? "3 mahine" : g.period_type || "Mahina")}</small></td><td class="n">${esc(g.weight_kg)} ${chg(g.weight_change)}</td><td class="n">${esc(g.height_cm)} ${chg(g.height_change)}</td><td>${esc(g.recorded_by)}</td></tr>`).join("")
    || `<tr><td colspan="5" class="muted">Is samay ki growth entry nahi.</td></tr>`;
  renderGrowthViz(r, full);
  const link = $("#sheetLink"); link.hidden = !r.sheet_url; if (r.sheet_url) link.href = r.sheet_url;
}

/* growth graphics in the report */
let gCardsAll = [], gShown = 0;
function miniLine(pts, color){
  if (pts.length < 2) return `<svg viewBox="0 0 140 40" style="width:100%;height:40px"><text x="70" y="24" text-anchor="middle" font-size="10" fill="var(--muted)">Ek hi entry</text></svg>`;
  const ws = pts.map(g => +g.weight_kg), lo = Math.min(...ws), hi = Math.max(...ws), span = Math.max(0.3, hi - lo);
  const xy = pts.map((g, i) => [6 + i * 128 / (pts.length - 1), 34 - (+g.weight_kg - lo) / span * 28]);
  const line = xy.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  return `<svg viewBox="0 0 140 40" style="width:100%;height:40px" role="img" aria-label="Wajan graph"><polygon points="6,38 ${line} 134,38" fill="${color}" opacity=".15"/><polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>${xy.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="${color}"><title>${monthName(pts[i].month)}: ${pts[i].weight_kg} kg, ${pts[i].height_cm} cm</title></circle>`).join("")}</svg>`;
}
function renderGrowthViz(r, full){
  const ids = new Set(r.children.map(c => c.child_id));
  const all = (full.growth_all || r.growth).filter(g => ids.has(g.child_id) && g.status !== "Replaced" && +g.weight_kg > 0);
  const by = new Map();
  all.slice().sort((a, b) => (a.month + (a.timestamp || "")).localeCompare(b.month + (b.timestamp || ""))).forEach(g => { if (!by.has(g.child_id)) by.set(g.child_id, []); by.get(g.child_id).push(g); });
  let up = 0, same = 0, down = 0, gain = 0, nGain = 0;
  gCardsAll = [...by.values()].map(list => {
    const last = list[list.length - 1], prev = list[list.length - 2];
    const d = prev ? Math.round((+last.weight_kg - +prev.weight_kg) * 100) / 100 : null;
    if (d !== null){ if (d > 0) up++; else if (d < 0) down++; else same++; gain += d; nGain++; }
    return { name: last.child_name, awc: String(last.panchayat).replace(/ \(\d+\)/, ""), list, last, d };
  }).sort((a, b) => ((a.d ?? 0) - (b.d ?? 0)) || a.name.localeCompare(b.name));
  const once = by.size - nGain;
  $("#gTiles").innerHTML = by.size ? `<div class="gtile up"><span>\u25b2 Wajan badha</span><b>${up}</b></div><div class="gtile down"><span>\u25bc Wajan ghata</span><b>${down}</b></div><div class="gtile same"><span>\u25cf Koi badlav nahi</span><b>${same}</b></div><div class="gtile avg"><span>Ausat badlav</span><b>${nGain ? (gain / nGain > 0 ? "+" : "") + (gain / nGain).toFixed(2) : "\u2014"}<small style="font-size:.8rem"> kg</small></b></div>` : "";
  const tot = up + down + same;
  $("#gBars").innerHTML = tot ? `<div style="display:flex;height:16px;border-radius:9px;overflow:hidden;margin:2px 0" role="img" aria-label="Wajan badha ${up}, ghata ${down}, same ${same}">${[[up, "var(--ok)"], [same, "var(--drop)"], [down, "var(--bad)"]].map(([n, c]) => n ? `<div style="flex:${n};background:${c}" title="${n}"></div>` : "").join("")}</div><p class="muted" style="margin:0;font-size:.85rem">${tot} bachchon ka pichhli entry se mukabla${once ? ` \u00b7 ${once} bachchon ki abhi ek hi entry hai` : ""}</p>` : `<p class="muted">Abhi growth entry nahi hai.</p>`;
  gShown = 0; $("#gCards").innerHTML = ""; moreGrowthCards();
}
function moreGrowthCards(){
  const next = gCardsAll.slice(gShown, gShown + 24);
  $("#gCards").insertAdjacentHTML("beforeend", next.map(k => {
    const color = k.d === null ? "var(--accent)" : k.d > 0 ? "var(--ok)" : k.d < 0 ? "var(--bad)" : "var(--drop)";
    return `<div class="gcard${k.d < 0 ? " down" : ""}"><span class="nm" title="${esc(k.name)}">${esc(k.name)}</span><small>${esc(k.awc)}</small>${miniLine(k.list.slice(-8), color)}<span class="kg">${esc(k.last.weight_kg)} kg ${k.d === null ? "" : chg(k.d)}</span><small>${esc(k.last.height_cm)} cm \u00b7 ${esc(monthName(k.last.month))} \u00b7 ${k.list.length} entry</small></div>`; }).join(""));
  gShown += next.length; $("#gMore").hidden = gShown >= gCardsAll.length;
}
$("#gMore").onclick = moreGrowthCards;

/* ---------------- DATA ARCHIVE (District Management) ---------------- */
function archBefore(){
  const v = $("#aAge").value;
  if (v === "date") return $("#aDate").value;
  const d = new Date(); d.setMonth(d.getMonth() - +v); return ymd(d);
}
function archWhen(){
  const b = archBefore();
  $("#aWhen").textContent = b ? "Is tareekh se pehle ki entries nikalengi: " + b : "";
  $("#aPreview").hidden = true; $("#aGo").hidden = true; $("#aErr").textContent = "";
}
$("#aAge").onchange = () => { $("#aDateW").hidden = $("#aAge").value !== "date"; archWhen(); };
$("#aDate").onchange = archWhen; $("#aGrowth").onchange = archWhen;
async function openArch(){
  $("#aDate").max = today(); archWhen();
  $("#aList").innerHTML = `<p class="muted">Load ho raha hai\u2026</p>`;
  try {
    const r = await api("listArchives");
    $("#aList").innerHTML = r.archives.map(a => `<a class="rec" href="${esc(a.url)}" target="_blank" rel="noopener"><span class="dot" style="background:var(--ocean)">\ud83d\udce6</span><span><b>${esc(a.name)}</b><small>${esc(a.created)}</small></span><small>\u203a</small></a>`).join("") || `<p class="muted">Abhi koi archive nahi bana.</p>`;
    const f = $("#aFolder"); f.href = r.folder_url; f.hidden = !r.folder_url;
  } catch(e){ $("#aList").innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
$("#aCheck").onclick = async () => {
  const before = archBefore(); $("#aErr").textContent = "";
  if (!before) return $("#aErr").textContent = "Tareekh chunein.";
  busy($("#aCheck"), true, "Gin rahe hain\u2026");
  try {
    const r = await api("archiveData", { before, include_growth: $("#aGrowth").checked, dry_run: true });
    $("#aPreview").hidden = false;
    $("#aPreview").innerHTML = (r.milk || r.growth)
      ? `<b>${r.milk}</b> doodh entries${$("#aGrowth").checked ? ` aur <b>${r.growth}</b> wajan/lambai entries` : ""} archive hongi (${esc(r.from || "")} se ${esc(before)} se pehle tak).<br>Bachchon ka registration nahi hatega.`
      : "Is tareekh se pehle ka koi data nahi hai.";
    $("#aGo").hidden = !(r.milk || r.growth);
  } catch(e){ $("#aErr").textContent = e.message; }
  finally { busy($("#aCheck"), false); }
};
$("#aGo").onclick = () => {
  const before = archBefore();
  overlay({ ok: false, title: "Archive karein?", sub: `${before} se pehle ki entries nayi Google Sheet mein jayengi aur main Sheet se hat jayengi. App ki report mein ye purani entries nahi dikhengi (archive Sheet mein rahengi).`,
    actions: [{ label: "Haan, archive karo", cls: "primary", run: doArchive }, { label: "Cancel" }] });
};
async function doArchive(){
  const before = archBefore();
  busy($("#aGo"), true, "Archive ho raha hai\u2026");
  try {
    const r = await api("archiveData", { before, include_growth: $("#aGrowth").checked });
    $("#aPreview").hidden = true; $("#aGo").hidden = true;
    overlay({ ok: true, title: "Archive ho gaya", sub: `${r.milk} doodh entries${r.growth ? `, ${r.growth} growth entries` : ""} \u2192 "${r.name}"`,
      actions: [{ label: "Archive Sheet kholo", cls: "primary", run: () => window.open(r.url, "_blank") }, { label: "Theek hai" }] });
    openArch();
  } catch(e){ overlay({ ok: false, title: "Archive nahi hua", sub: e.message, actions: [{ label: "Theek hai", cls: "primary" }] }); }
  finally { busy($("#aGo"), false); }
}

/* CSV */
const cell = v => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = rows => "\ufeff" + rows.map((r, i) => i ? r : r.map(x => x === "panchayat" ? "awc" : x)).map(r => r.map(cell).join(",")).join("\r\n");
function saveFile(name, text){
  if (window.AndroidBridge && AndroidBridge.saveFile){
    const where = String(AndroidBridge.saveFile(name, text, "text/csv") || "");
    if (!where.startsWith("ERROR")){ toast("Save hua: " + where); return; }
    toast("File save nahi hui: " + where); return;
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast("Download: " + name);
}
const tag = () => { const r = lastReport; return (r.panch ? r.panch.replace(/\W+/g, "_") + "_" : "") + (r.from === r.to ? r.from : r.from + "_to_" + r.to); };
function need(){ if (!lastReport || lastReport.mode !== "full"){ toast("Pehle 'Report dekho' dabayein."); return false; } return true; }
function renderSummary(r){
  const t = r.summary.totals;
  $("#repOut").hidden = true; $("#sumOut").hidden = false;
  $("#pRange").textContent = `${r.from === r.to ? r.from : r.from + " se " + r.to} \u00b7 ${r.panch || "Sabhi AWC"}`;
  $("#sReg").textContent = t.registered; $("#sGiven").textContent = t.given; $("#sKids").textContent = t.kids; $("#sFail").textContent = t.fail;
  const counts = [t.Full, t.Half, t.Quarter, t.home];
  $("#sDonut").innerHTML = donutSvg(counts); $("#sLegend").innerHTML = legendHtml(counts);
  $("#sDaily").innerHTML = dailySvg(r.summary.days);
  const bySec = new Map();
  r.summary.awcs.forEach(a => { const k = a.sector || "Anya"; const o = bySec.get(k) || { sector: k, awcs: 0, registered: 0, given: 0, kids: 0, fail: 0 }; o.awcs++; o.registered += a.registered; o.given += a.given; o.kids += a.kids; o.fail += a.fail; bySec.set(k, o); });
  $("#tSec").innerHTML = [...bySec.values()].sort((a, b) => a.sector.localeCompare(b.sector, "en", { numeric: true })).map(o => `<tr><td><b>${esc(o.sector)}</b></td><td class="n">${o.awcs}</td><td class="n">${o.registered}</td><td class="n">${o.given}</td><td class="n">${o.kids}</td><td class="n">${o.fail}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Koi data nahi.</td></tr>`;
  renderSummaryGrowth(r.summary.growth);
  $("#tAwc").innerHTML = r.summary.awcs.map(a => `<tr><td>${esc(a.awc)}</td><td>${esc(a.sector)}</td><td class="n">${a.registered}</td><td class="n">${a.given}</td><td class="n">${a.kids}</td><td class="n">${a.fail}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Koi data nahi.</td></tr>`;
}
function growthTiles(t){
  return `<div class="gtile up"><span>\u25b2 Wajan badha</span><b>${t.up}</b></div><div class="gtile down"><span>\u25bc Wajan ghata</span><b>${t.down}</b></div><div class="gtile same"><span>\u25cf Koi badlav nahi</span><b>${t.same}</b></div><div class="gtile avg"><span>Ausat badlav</span><b>${t.avg === "" ? "\u2014" : (t.avg > 0 ? "+" : "") + Number(t.avg).toFixed(2)}<small style="font-size:.8rem"> kg</small></b></div>`;
}
function growthBar(o){
  const tot = o.up + o.same + o.down;
  if (!tot) return `<div style="height:14px;border-radius:8px;background:var(--sunk)"></div>`;
  return `<div style="display:flex;height:14px;border-radius:8px;overflow:hidden" role="img" aria-label="Badha ${o.up}, same ${o.same}, ghata ${o.down}">${[[o.up, "var(--ok)", "Badha"], [o.same, "var(--drop)", "Same"], [o.down, "var(--bad)", "Ghata"]].map(([n, c, l]) => n ? `<div style="flex:${n};background:${c}" title="${l}: ${n}"></div>` : "").join("")}</div>`;
}
function renderSummaryGrowth(g){
  if (!g || !g.totals.children){ $("#sgTiles").innerHTML = ""; $("#sgBars").innerHTML = `<p class="muted">Abhi growth entry nahi hai.</p>`; $("#sgSecBars").innerHTML = ""; $("#sgAwc").innerHTML = ""; return; }
  const t = g.totals;
  $("#sgTiles").innerHTML = growthTiles(t);
  $("#sgBars").innerHTML = growthBar(t) + `<p class="muted" style="margin:4px 0 0;font-size:.85rem">${t.children} bachchon ka growth record \u00b7 is samay mein ${t.measured} naape gaye${t.once ? ` \u00b7 ${t.once} ki abhi ek hi entry` : ""}</p>`;
  const sec = new Map();
  g.awcs.forEach(a => { const k = a.sector || "Anya"; const o = sec.get(k) || { sector: k, children: 0, up: 0, down: 0, same: 0 }; o.children += a.children; o.up += a.up; o.down += a.down; o.same += a.same; sec.set(k, o); });
  $("#sgSecBars").innerHTML = [...sec.values()].sort((a, b) => a.sector.localeCompare(b.sector, "en", { numeric: true })).map(o =>
    `<div style="display:grid;grid-template-columns:90px 1fr auto;gap:8px;align-items:center;margin:6px 0"><b style="font-size:.88rem">${esc(o.sector)}</b>${growthBar(o)}<small><span class="up">\u25b2${o.up}</span> <span class="down">\u25bc${o.down}</span></small></div>`).join("");
  $("#sgAwc").innerHTML = g.awcs.map(a => `<tr><td>${esc(a.awc)}</td><td>${esc(a.sector)}</td><td class="n">${a.children}</td><td class="n">${a.measured}</td><td class="n up">${a.up}</td><td class="n down">${a.down}</td><td class="n">${a.same}</td><td class="n">${a.avg === "" ? "\u2014" : (a.avg > 0 ? "+" : "") + a.avg}</td></tr>`).join("");
}
$("#dSubmG").onclick = () => {
  if (!lastReport || lastReport.mode !== "summary" || !lastReport.summary.growth) return toast("Pehle 'Report dekho' dabayein.");
  const g = lastReport.summary.growth;
  saveFile(`growth_summary_${tag()}.csv`, csv([["sector","awc","children_with_growth","measured_in_period","weight_up","weight_down","no_change","only_one_entry","avg_change_kg"], ...g.awcs.map(a => [a.sector, a.awc, a.children, a.measured, a.up, a.down, a.same, a.once, a.avg]), ["", "TOTAL", g.totals.children, g.totals.measured, g.totals.up, g.totals.down, g.totals.same, g.totals.once, g.totals.avg]]));
};
$("#dSubm").onclick = () => {
  if (!lastReport || lastReport.mode !== "summary") return toast("Pehle 'Report dekho' dabayein.");
  const sm = lastReport.summary;
  const rows = [["sector","awc","registered","submissions","children_fed","face_fail"], ...sm.awcs.map(a => [a.sector, a.awc, a.registered, a.given, a.kids, a.fail]), [], ["date","submissions","full","half","quarter","taken_home","not_given","face_fail"], ...sm.days.map(d => [d.date, d.given, d.Full, d.Half, d.Quarter, d.home, d.no, d.fail])];
  saveFile(`submission_report_${tag()}.csv`, csv(rows));
};
$("#dChildren").onclick = () => { if (!need()) return;
  const cols = ["child_id","child_name","mother_name","phone","sector","panchayat","dob","weight_kg","height_cm","id_card_type","id_card_photo","child_photo","registered_by","registered_at","status","caregivers"];
  saveFile(`children_${tag()}.csv`, csv([cols, ...(lastReport.view || lastReport).children.map(c => cols.map(k => k === "sector" ? sectorOf(c.panchayat) : c[k]))])); };
$("#dDaily").onclick = () => { if (!need()) return;
  const cols = ["date","time","child_id","child_name","mother_name","panchayat","face_result","match_score","milk_given","consumed","where","recorded_by","override_by","override_reason","collected_by_name"];
  const rows = (lastReport.view || lastReport).milk.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  saveFile(`daily_consumption_${tag()}.csv`, csv([cols, ...rows.map(m => cols.map(k => m[k]))])); };
$("#dSummary").onclick = () => { if (!need()) return;
  const s = lastReport.summary, dates = s.days.map(d => d.date);
  const byKidDate = new Map(); (lastReport.view || lastReport).milk.forEach(m => { if (m.milk_given === "Yes") byKidDate.set(m.child_id + "|" + m.date, m.consumed); else if (!byKidDate.has(m.child_id + "|" + m.date)) byKidDate.set(m.child_id + "|" + m.date, /not matched/i.test(m.face_result) ? "Face fail" : "No"); });
  const head = ["child_id","child_name","mother_name","sector","panchayat","days_given","full","half","quarter","taken_home","by_caregiver","not_given","face_fail","latest_weight_kg","latest_height_cm", ...dates];
  saveFile(`childwise_summary_${tag()}.csv`, csv([head, ...s.kids.map(k => [k.child_id,k.child_name,k.mother_name,sectorOf(k.panchayat),k.panchayat,k.days,k.Full,k.Half,k.Quarter,k["Taken home"],k.cg,k.no,k.fail,k.w,k.h, ...dates.map(d => byKidDate.get(k.child_id + "|" + d) || "")])])); };
$("#dGrowth").onclick = () => { if (!need()) return;
  const cols = ["month","period_type","period","date","child_id","child_name","panchayat","weight_kg","height_cm","prev_weight_kg","prev_height_cm","weight_change","height_change","status","note","recorded_by"];
  saveFile(`growth_${tag()}.csv`, csv([cols, ...(lastReport.view || lastReport).growth.map(g => cols.map(k => g[k]))])); };
$("#dGrowthAll").onclick = () => { if (!need()) return;
  const cols = ["child_id","child_name","panchayat","month","period_type","period","date","weight_kg","height_cm","prev_weight_kg","prev_height_cm","weight_change","height_change","status","note","recorded_by"];
  const ids = new Set((lastReport.view || lastReport).children.map(c => c.child_id));
  const rows = (lastReport.growth_all || []).filter(g => !$("#pAmb").value || ids.has(g.child_id)).sort((a, b) => (a.child_name + a.child_id + a.month + a.timestamp).localeCompare(b.child_name + b.child_id + b.month + b.timestamp));
  saveFile(`growth_history_upto_${lastReport.to}.csv`, csv([cols, ...rows.map(g => cols.map(k => k === "period_type" ? (g[k] || "Monthly") : k === "period" ? (g[k] || g.month) : k === "status" ? (g[k] || "active") : g[k]))])); };

const I18N_D = {"(Maa + 3 tak)":["(\u092e\u093e\u0901 + 3 \u0924\u0915)","(Mother + up to 3)"],"+ Aur vyakti (papa, dadi\u2026)":["+ \u0914\u0930 \u0935\u094d\u092f\u0915\u094d\u0924\u093f (\u092a\u093e\u092a\u093e, \u0926\u093e\u0926\u0940\u2026)","+ Another person (father, grandmother\u2026)"],"+ Maa ka chehra":["+ \u092e\u093e\u0901 \u0915\u093e \u091a\u0947\u0939\u0930\u093e","+ Mother's face"],"+ Naya vyakti jodo":["+ \u0928\u092f\u093e \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u091c\u094b\u0921\u093c\u094b","+ Add new person"],"3 mahine":["3 \u092e\u0939\u0940\u0928\u0947","3 months"],"4 se zyada nahi jod sakte.":["4 \u0938\u0947 \u091c\u093c\u094d\u092f\u093e\u0926\u093e \u0928\u0939\u0940\u0902 \u091c\u094b\u0921\u093c \u0938\u0915\u0924\u0947\u0964","You cannot add more than 4."],"AWC":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 (AWC)","AWC"],"AWC *":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 (AWC) *","AWC *"],"AWC / Sector":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 / \u0938\u0947\u0915\u094d\u091f\u0930","AWC / Sector"],"AWC chunein":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0947\u0902","Choose AWC"],"AWC dhoondo":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0916\u094b\u091c\u0947\u0902","Search AWC"],"AWC ke hisaab se":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947","By AWC"],"AWC naam ya code se dhoondo":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u093e \u0928\u093e\u092e \u092f\u093e \u0915\u094b\u0921 \u0932\u093f\u0916\u0947\u0902","Search by AWC name or code"],"Aadha":["\u0906\u0927\u093e","Half"],"Aadha (Half)":["\u0906\u0927\u093e","Half"],"Aadha (Half) \u2014 centre mein":["\u0906\u0927\u093e \u2014 \u0915\u0947\u0902\u0926\u094d\u0930 \u092e\u0947\u0902","Half \u2014 at the centre"],"Aage badho":["\u0906\u0917\u0947 \u092c\u0922\u093c\u0947\u0902","Continue"],"Aaj":["\u0906\u091c","Today"],"Aaj ki doodh entry yahan karo":["\u0906\u091c \u0915\u0940 \u0926\u0942\u0927 \u090f\u0902\u091f\u094d\u0930\u0940 \u092f\u0939\u093e\u0901 \u0915\u0930\u0947\u0902","Record today's milk here"],"Aakhri":["\u0906\u0916\u093c\u093f\u0930\u0940","Latest"],"Aakhri entry":["\u0906\u0916\u093c\u093f\u0930\u0940 \u090f\u0902\u091f\u094d\u0930\u0940","Last entry"],"Aakhri:":["\u0906\u0916\u093c\u093f\u0930\u0940:","Latest:"],"Aap":["\u0906\u092a","You"],"Aap kaun hain? *":["\u0906\u092a \u0915\u094c\u0928 \u0939\u0948\u0902? *","Who are you? *"],"Aapke AWC * (ek ya zyada chunein)":["\u0906\u092a\u0915\u0947 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 * (\u090f\u0915 \u092f\u093e \u091c\u093c\u094d\u092f\u093e\u0926\u093e \u091a\u0941\u0928\u0947\u0902)","Your AWCs * (choose one or more)"],"Aapke sector * (jinke ambassadors ka data dekhna hai)":["\u0906\u092a\u0915\u0947 \u0938\u0947\u0915\u094d\u091f\u0930 * (\u091c\u093f\u0928\u0915\u0947 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u093e \u0921\u0947\u091f\u093e \u0926\u0947\u0916\u0928\u093e \u0939\u0948)","Your sectors * (whose ambassadors you supervise)"],"Abhi growth entry nahi hai.":["\u0905\u092d\u0940 \u0935\u0943\u0926\u094d\u0927\u093f \u0915\u0940 \u0915\u094b\u0908 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","No growth entries yet."],"Abhi koi AWC nahi chuna.":["\u0905\u092d\u0940 \u0915\u094b\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0928\u0939\u0940\u0902 \u091a\u0941\u0928\u0940\u0964","No AWC selected yet."],"Abhi koi entry nahi. Doodh pilane ke baad yahan dikhegi.":["\u0905\u092d\u0940 \u0915\u094b\u0908 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902\u0964 \u0926\u0942\u0927 \u092a\u093f\u0932\u093e\u0928\u0947 \u0915\u0947 \u092c\u093e\u0926 \u092f\u0939\u093e\u0901 \u0926\u093f\u0916\u0947\u0917\u0940\u0964","No entries yet. They will appear here after milk is given."],"Abhi koi nahi juda.":["\u0905\u092d\u0940 \u0915\u094b\u0908 \u0928\u0939\u0940\u0902 \u091c\u0941\u0921\u093c\u093e\u0964","Nobody added yet."],"Access code * (admin se lein)":["\u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 * (\u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u0932\u0947\u0902)","Access code * (get it from admin)"],"Access code daalein (admin se lein).":["\u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0921\u093e\u0932\u0947\u0902 (\u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u0932\u0947\u0902)\u0964","Enter the access code (get it from admin)."],"Account band karein?":["\u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0902\u0926 \u0915\u0930\u0947\u0902?","Disable account?"],"Account dhoondo":["\u0905\u0915\u093e\u0909\u0902\u091f \u0916\u094b\u091c\u0947\u0902","Search accounts"],"Account hatao \u00b7 password reset":["\u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u093e\u090f\u0901 \u00b7 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0930\u0940\u0938\u0947\u091f","Remove account \u00b7 reset password"],"Account hatayein?":["\u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u093e\u090f\u0901?","Remove account?"],"Agla bachcha":["\u0905\u0917\u0932\u093e \u092c\u091a\u094d\u091a\u093e","Next child"],"Ambassador":["\u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930","Ambassador"],"Ambassador Monitoring":["\u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0928\u093f\u0917\u0930\u093e\u0928\u0940","Ambassador Monitoring"],"Ambassadors ki entry aur doodh pilana":["\u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0914\u0930 \u0926\u0942\u0927 \u092a\u093f\u0932\u093e\u0928\u093e","Ambassador entries and milk feeding"],"Ambassadors ki haal ki entries":["\u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u0940 \u0939\u093e\u0932 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940","Recent ambassador entries"],"Ambassadors ne mauke par jode. Ek baar pushti kar lein.":["\u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0928\u0947 \u092e\u094c\u0915\u0947 \u092a\u0930 \u091c\u094b\u0921\u093c\u0947\u0964 \u090f\u0915 \u092c\u093e\u0930 \u092a\u0941\u0937\u094d\u091f\u093f \u0915\u0930 \u0932\u0947\u0902\u0964","Added on the spot by ambassadors. Please verify once."],"Anya":["\u0905\u0928\u094d\u092f","Other"],"Apna 10 ank ka sahi mobile number likhein.":["\u0905\u092a\u0928\u093e 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0938\u0939\u0940 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0932\u093f\u0916\u0947\u0902\u0964","Enter your correct 10-digit mobile number."],"Apna AWC chunein (kam se kam ek).":["\u0905\u092a\u0928\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0947\u0902 (\u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915)\u0964","Choose your AWC (at least one)."],"Apna sector chunein (kam se kam ek).":["\u0905\u092a\u0928\u093e \u0938\u0947\u0915\u094d\u091f\u0930 \u091a\u0941\u0928\u0947\u0902 (\u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915)\u0964","Choose your sector (at least one)."],"App load ho raha hai\u2026":["\u0910\u092a \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","App is loading\u2026"],"Aur bachche dikhao":["\u0914\u0930 \u092c\u091a\u094d\u091a\u0947 \u0926\u093f\u0916\u093e\u0913","Show more children"],"Ausat badlav":["\u0914\u0938\u0924 \u092c\u0926\u0932\u093e\u0935","Average change"],"Ausat kg":["\u0914\u0938\u0924 \u0915\u093f\u0932\u094b","Average kg"],"Baaki":["\u092c\u093e\u0915\u0940","Pending"],"baaki":["\u092c\u093e\u0915\u0940","pending"],"Bachcha":["\u092c\u091a\u094d\u091a\u093e","Child"],"Bachcha *":["\u092c\u091a\u094d\u091a\u093e *","Child *"],"Bachcha / Wajan":["\u092c\u091a\u094d\u091a\u093e / \u0935\u091c\u0928","Child / Weight"],"Bachcha centre nahi aaya":["\u092c\u091a\u094d\u091a\u093e \u0915\u0947\u0902\u0926\u094d\u0930 \u0928\u0939\u0940\u0902 \u0906\u092f\u093e","Child did not come to the centre"],"Bachcha chunein":["\u092c\u091a\u094d\u091a\u093e \u091a\u0941\u0928\u0947\u0902","Choose child"],"Bachcha chunein.":["\u092c\u091a\u094d\u091a\u093e \u091a\u0941\u0928\u0947\u0902\u0964","Choose a child."],"Bachcha khud":["\u092c\u091a\u094d\u091a\u093e \u0916\u093c\u0941\u0926","Child alone"],"Bachcha register karo":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902","Register a child"],"Bachche":["\u092c\u091a\u094d\u091a\u0947","Children"],"Bachche ka chehra":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e","Child's face"],"Bachche ka chehra scan karo":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902","Scan child's face"],"Bachche ka naam *":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0928\u093e\u092e *","Child's name *"],"Bachche ka naam, maa ka naam aur AWC bharein.":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0928\u093e\u092e, \u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e \u0914\u0930 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092d\u0930\u0947\u0902\u0964","Fill child's name, mother's name and AWC."],"Bachche ka naya chehra":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0928\u092f\u093e \u091a\u0947\u0939\u0930\u093e","Child's new photo"],"Bachche ke hisaab se":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947","By child"],"Bachche ke saath aane wale *":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0938\u093e\u0925 \u0906\u0928\u0947 \u0935\u093e\u0932\u0947 *","People who come with the child *"],"Bachche ke saath kaun aaya hai?":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0938\u093e\u0925 \u0915\u094c\u0928 \u0906\u092f\u093e \u0939\u0948?","Who came with the child?"],"Bachche ki nayi photo (optional)":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u0928\u0908 \u092b\u093c\u094b\u091f\u094b (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)","New photo of child (optional)"],"Bachche ki photo":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b","Child's photo"],"Bachche ki photo kheecho":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u0916\u0940\u0902\u091a\u0947\u0902","Take child's photo"],"Bachche ki photo lein.":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902\u0964","Take the child's photo."],"Bachche ya maa ka naam":["\u092c\u091a\u094d\u091a\u0947 \u092f\u093e \u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e","Child or mother's name"],"Back":["\u0935\u093e\u092a\u0938","Back"],"\u2190 Back":["\u2190 \u0935\u093e\u092a\u0938","\u2190 Back"],"Badha":["\u092c\u0922\u093c\u093e","Up"],"\u25b2 Badha":["\u25b2 \u092c\u0922\u093c\u093e","\u25b2 Up"],"Bahan":["\u092c\u0939\u0928","Sister"],"Ban raha hai\u2026":["\u092c\u0928 \u0930\u0939\u093e \u0939\u0948\u2026","Creating\u2026"],"Band":["\u092c\u0902\u0926","Off"],"Band karo":["\u092c\u0902\u0926 \u0915\u0930\u0947\u0902","Disable"],"Bhai":["\u092d\u093e\u0908","Brother"],"Bua":["\u092c\u0941\u0906","Aunt (bua)"],"By":["\u0915\u093f\u0938\u0928\u0947","By"],"Camera badlo":["\u0915\u0948\u092e\u0930\u093e \u092c\u0926\u0932\u0947\u0902","Switch camera"],"Camera chalu karo":["\u0915\u0948\u092e\u0930\u093e \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902","Start camera"],"Cancel":["\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902","Cancel"],"Caregiver":["\u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u093e","Caregiver"],"Caregiver (new)":["\u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u093e (\u0928\u092f\u093e)","Caregiver (new)"],"Caregiver not matched":["\u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e","Caregiver not matched"],"Chacha":["\u091a\u093e\u091a\u093e","Uncle (chacha)"],"Chachi":["\u091a\u093e\u091a\u0940","Aunt (chachi)"],"Chalu":["\u091a\u093e\u0932\u0942","Active"],"Chalu karo":["\u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902","Enable"],"Chauthai":["\u091a\u094c\u0925\u093e\u0908","Quarter"],"Chauthai (Qtr)":["\u091a\u094c\u0925\u093e\u0908","Quarter"],"Chauthai (Quarter) \u2014 centre mein":["\u091a\u094c\u0925\u093e\u0908 \u2014 \u0915\u0947\u0902\u0926\u094d\u0930 \u092e\u0947\u0902","Quarter \u2014 at the centre"],"Check kar rahe hain\u2026":["\u091c\u093e\u0901\u091a \u0939\u094b \u0930\u0939\u0940 \u0939\u0948\u2026","Checking\u2026"],"Chehra":["\u091a\u0947\u0939\u0930\u093e","Face"],"Chehra dhoondh rahe hain\u2026":["\u091a\u0947\u0939\u0930\u093e \u0916\u094b\u091c \u0930\u0939\u0947 \u0939\u0948\u0902\u2026","Looking for the face\u2026"],"Chehra mil gaya \u2713":["\u091a\u0947\u0939\u0930\u093e \u092e\u093f\u0932 \u0917\u092f\u093e \u2713","Face found \u2713"],"Chehra mila":["\u091a\u0947\u0939\u0930\u093e \u092e\u093f\u0932\u093e","Face matched"],"Chehra nahi dikha":["\u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u0926\u093f\u0916\u093e","Face not visible"],"Chehra nahi mila":["\u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e","Face not found"],"Chehra nahi mila. Paas se, roshni mein dobara lein.":["\u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964 \u092a\u093e\u0938 \u0938\u0947, \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902 \u0926\u094b\u092c\u093e\u0930\u093e \u0932\u0947\u0902\u0964","Face not found. Retake closer, in good light."],"Chehra scan karo":["\u091a\u0947\u0939\u0930\u093e \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902","Scan face"],"Chehra seedha, achhi roshni mein, akele bachche ka.":["\u091a\u0947\u0939\u0930\u093e \u0938\u0940\u0927\u093e, \u0905\u091a\u094d\u091b\u0940 \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902, \u0905\u0915\u0947\u0932\u0947 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e\u0964","Child alone, face straight, in good light."],"Chehre ki photo":["\u091a\u0947\u0939\u0930\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b","Face photo"],"Chehre ki photo lein.":["\u091a\u0947\u0939\u0930\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902\u0964","Take a face photo."],"Child Registration":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u092a\u0902\u091c\u0940\u0915\u0930\u0923","Child Registration"],"Child registered":["\u092c\u091a\u094d\u091a\u093e \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0939\u094b \u0917\u092f\u093e","Child registered"],"Child-wise summary":["\u092c\u091a\u094d\u091a\u0947\u0935\u093e\u0930 \u0938\u093e\u0930\u093e\u0902\u0936","Child-wise summary"],"Children details":["\u092c\u091a\u094d\u091a\u094b\u0902 \u0915\u093e \u0935\u093f\u0935\u0930\u0923","Children details"],"Chune gaye":["\u091a\u0941\u0928\u0947 \u0917\u090f","Selected"],"Connect karo":["\u091c\u094b\u0921\u093c\u0947\u0902","Connect"],"Coordinator apna username-password daalein. Ye entry \"Override\" ke roop mein unke naam se save hogi.":["\u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u0905\u092a\u0928\u093e \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e-\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0921\u093e\u0932\u0947\u0902\u0964 \u092f\u0939 \u090f\u0902\u091f\u094d\u0930\u0940 \"\u0913\u0935\u0930\u0930\u093e\u0907\u0921\" \u0915\u0947 \u0930\u0942\u092a \u092e\u0947\u0902 \u0909\u0928\u0915\u0947 \u0928\u093e\u092e \u0938\u0947 \u0938\u0947\u0935 \u0939\u094b\u0917\u0940\u0964","Coordinator enters their username and password. This entry will be saved as an \"Override\" in their name."],"Coordinator username":["\u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e","Coordinator username"],"Create user ID":["\u0928\u0908 \u092f\u0942\u091c\u093c\u0930 ID \u092c\u0928\u093e\u090f\u0901","Create user ID"],"Dada":["\u0926\u093e\u0926\u093e","Grandfather"],"Dadi":["\u0926\u093e\u0926\u0940","Grandmother"],"Daily":["\u0930\u094b\u091c\u093c\u093e\u0928\u093e","Daily"],"Daily consumption":["\u0930\u094b\u091c\u093c \u0915\u0940 \u0916\u092a\u0924","Daily consumption"],"Daily \u00b7 Weekly \u00b7 Monthly \u00b7 CSV":["\u0930\u094b\u091c\u093c \u00b7 \u0939\u092b\u093c\u094d\u0924\u093e \u00b7 \u092e\u0939\u0940\u0928\u093e \u00b7 CSV","Daily \u00b7 Weekly \u00b7 Monthly \u00b7 CSV"],"Date":["\u0924\u093e\u0930\u0940\u0916\u093c","Date"],"Date se":["\u0924\u093e\u0930\u0940\u0916\u093c \u0938\u0947","Date range"],"Dekhbhal karne wala vyakti":["\u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u093e \u0935\u094d\u092f\u0915\u094d\u0924\u093f","Caregiver"],"Dekhbhal karne wale ka chehra":["\u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e","Caregiver's face"],"Dhyan dein: wajan kam hua hai!":["\u0927\u094d\u092f\u093e\u0928 \u0926\u0947\u0902: \u0935\u091c\u0928 \u0915\u092e \u0939\u0941\u0906 \u0939\u0948!","Attention: weight has gone down!"],"Din ke hisaab se":["\u0926\u093f\u0928 \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947","By day"],"Din mila":["\u0926\u093f\u0928 \u092e\u093f\u0932\u093e","Days given"],"District Management":["\u091c\u093c\u093f\u0932\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928","District Management"],"Dobara photo lo":["\u0926\u094b\u092c\u093e\u0930\u093e \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902","Retake photo"],"Doodh diya":["\u0926\u0942\u0927 \u0926\u093f\u092f\u093e","Milk given"],"Doodh diya gaya?":["\u0926\u0942\u0927 \u0926\u093f\u092f\u093e \u0917\u092f\u093e?","Was milk given?"],"Doodh entry":["\u0926\u0942\u0927 \u090f\u0902\u091f\u094d\u0930\u0940","Milk entry"],"Doodh kitna piya":["\u0915\u093f\u0924\u0928\u093e \u0926\u0942\u0927 \u092a\u093f\u092f\u093e","How much milk was drunk"],"Doodh kitna piya, chunein.":["\u0915\u093f\u0924\u0928\u093e \u0926\u0942\u0927 \u092a\u093f\u092f\u093e, \u091a\u0941\u0928\u0947\u0902\u0964","Choose how much milk was drunk."],"Doodh kitna piya?":["\u0915\u093f\u0924\u0928\u093e \u0926\u0942\u0927 \u092a\u093f\u092f\u093e?","How much milk was drunk?"],"Doodh nahi piya":["\u0926\u0942\u0927 \u0928\u0939\u0940\u0902 \u092a\u093f\u092f\u093e","Did not drink milk"],"Doodh pilane ke baad ki updates":["\u0926\u0942\u0927 \u092a\u093f\u0932\u093e\u0928\u0947 \u0915\u0947 \u092c\u093e\u0926 \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940","Updates after feeding"],"Doodh pilao":["\u0926\u0942\u0927 \u092a\u093f\u0932\u093e\u0913","Give milk"],"Download":["\u0921\u093e\u0909\u0928\u0932\u094b\u0921","Download"],"Download (CSV)":["\u0921\u093e\u0909\u0928\u0932\u094b\u0921 (CSV)","Download (CSV)"],"Ek aur bachcha register karo":["\u090f\u0915 \u0914\u0930 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902","Register another child"],"Ek hi entry":["\u0938\u093f\u0930\u094d\u092b\u093c \u090f\u0915 \u090f\u0902\u091f\u094d\u0930\u0940","Only one entry"],"Entry save ho gayi":["\u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0947\u0935 \u0939\u094b \u0917\u0908","Entry saved"],"Face doesn't match":["\u091a\u0947\u0939\u0930\u093e \u092e\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093e\u0924\u093e","Face doesn't match"],"Face fail":["\u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e","Face fail"],"Face match nahi hua":["\u091a\u0947\u0939\u0930\u093e \u092e\u0947\u0932 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906","Face did not match"],"Face matched":["\u091a\u0947\u0939\u0930\u093e \u092e\u093f\u0932 \u0917\u092f\u093e","Face matched"],"Face model abhi taiyaar nahi hai.":["\u092b\u093c\u0947\u0938 \u092e\u0949\u0921\u0932 \u0905\u092d\u0940 \u0924\u0948\u092f\u093e\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Face model is not ready yet."],"Face model load ho raha hai\u2026":["\u092b\u093c\u0947\u0938 \u092e\u0949\u0921\u0932 \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","Face model is loading\u2026"],"Face model load nahi hua. App band karke dobara kholein.":["\u092b\u093c\u0947\u0938 \u092e\u0949\u0921\u0932 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964 \u0910\u092a \u092c\u0902\u0926 \u0915\u0930\u0915\u0947 \u0926\u094b\u092c\u093e\u0930\u093e \u0916\u094b\u0932\u0947\u0902\u0964","Face model did not load. Close and reopen the app."],"Field Coordinator":["\u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930","Field Coordinator"],"Field Coordinator override":["\u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u0913\u0935\u0930\u0930\u093e\u0907\u0921","Field Coordinator override"],"File save nahi hui":["\u092b\u093c\u093e\u0907\u0932 \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908","File not saved"],"Full":["\u092a\u0942\u0930\u093e","Full"],"Gallery se upload":["\u0917\u0948\u0932\u0930\u0940 \u0938\u0947 \u0905\u092a\u0932\u094b\u0921","Upload from gallery"],"Ghar le gaye":["\u0918\u0930 \u0932\u0947 \u0917\u090f","Taken home"],"Ghata":["\u0918\u091f\u093e","Down"],"\u25bc Ghata":["\u25bc \u0918\u091f\u093e","\u25bc Down"],"Google Sheet kholo":["\u0917\u0942\u0917\u0932 \u0936\u0940\u091f \u0916\u094b\u0932\u0947\u0902","Open Google Sheet"],"Growth":["\u0935\u0943\u0926\u094d\u0927\u093f","Growth"],"Growth (poora itihas)":["\u0935\u0943\u0926\u094d\u0927\u093f (\u092a\u0942\u0930\u093e \u0907\u0924\u093f\u0939\u093e\u0938)","Growth (full history)"],"Growth monitoring (mahina / 3 mahine)":["\u0935\u0943\u0926\u094d\u0927\u093f \u0928\u093f\u0917\u0930\u093e\u0928\u0940 (\u092e\u0939\u0940\u0928\u093e / 3 \u092e\u0939\u0940\u0928\u0947)","Growth monitoring (monthly / quarterly)"],"Growth monitoring (wajan)":["\u0935\u0943\u0926\u094d\u0927\u093f \u0928\u093f\u0917\u0930\u093e\u0928\u0940 (\u0935\u091c\u0928)","Growth monitoring (weight)"],"Growth summary (CSV)":["\u0935\u0943\u0926\u094d\u0927\u093f \u0938\u093e\u0930\u093e\u0902\u0936 (CSV)","Growth summary (CSV)"],"Growth update":["\u0935\u0943\u0926\u094d\u0927\u093f \u0905\u092a\u0921\u0947\u091f","Growth update"],"Haal ki entries":["\u0939\u093e\u0932 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940","Recent entries"],"Haan (Yes)":["\u0939\u093e\u0901","Yes"],"Haan ya Nahi chunein.":["\u0939\u093e\u0901 \u092f\u093e \u0928\u0939\u0940\u0902 \u091a\u0941\u0928\u0947\u0902\u0964","Choose Yes or No."],"Haan, band karo":["\u0939\u093e\u0901, \u092c\u0902\u0926 \u0915\u0930\u0947\u0902","Yes, disable"],"Haan, hatao":["\u0939\u093e\u0901, \u0939\u091f\u093e\u090f\u0901","Yes, remove"],"Haan, naya sahi hai \u2014 save karo":["\u0939\u093e\u0901, \u0928\u092f\u093e \u0938\u0939\u0940 \u0939\u0948 \u2014 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902","Yes, the new one is correct \u2014 save"],"Hafte ka koi bhi din":["\u0939\u092b\u093c\u094d\u0924\u0947 \u0915\u093e \u0915\u094b\u0908 \u092d\u0940 \u0926\u093f\u0928","Any day of the week"],"Half":["\u0906\u0927\u093e","Half"],"Har 3 mahine":["\u0939\u0930 3 \u092e\u0939\u0940\u0928\u0947","Every 3 months"],"Har bachcha \u00b7 Har din \u00b7 Pura glass":["\u0939\u0930 \u092c\u091a\u094d\u091a\u093e \u00b7 \u0939\u0930 \u0926\u093f\u0928 \u00b7 \u092a\u0942\u0930\u093e \u0917\u093f\u0932\u093e\u0938","Every child \u00b7 Every day \u00b7 A full glass"],"Har bachche ka wajan graph":["\u0939\u0930 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0935\u091c\u0928 \u0917\u094d\u0930\u093e\u092b\u093c","Weight graph of each child"],"Har bachche ki aakhri entry ka pichhli entry se mukabla. Naam nahi dikhaye jaate.":["\u0939\u0930 \u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u0906\u0916\u093c\u093f\u0930\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0915\u0940 \u092a\u093f\u091b\u0932\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0947 \u0924\u0941\u0932\u0928\u093e\u0964 \u0928\u093e\u092e \u0928\u0939\u0940\u0902 \u0926\u093f\u0916\u093e\u090f \u091c\u093e\u0924\u0947\u0964","Each child's latest entry compared with the previous one. Names are not shown."],"Har chune bachche ke liye chunein ki kitna doodh piya.":["\u0939\u0930 \u091a\u0941\u0928\u0947 \u0939\u0941\u090f \u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0932\u093f\u090f \u091a\u0941\u0928\u0947\u0902 \u0915\u093f \u0915\u093f\u0924\u0928\u093e \u0926\u0942\u0927 \u092a\u093f\u092f\u093e\u0964","For each selected child, choose how much milk was drunk."],"Har mahine":["\u0939\u0930 \u092e\u0939\u0940\u0928\u0947","Every month"],"Har mahine naap bharo":["\u0939\u0930 \u092e\u0939\u0940\u0928\u0947 \u0928\u093e\u092a \u092d\u0930\u0947\u0902","Enter measurements every month"],"Hatao":["\u0939\u091f\u093e\u090f\u0901","Remove"],"Hataya gaya":["\u0939\u091f\u093e\u092f\u093e \u0917\u092f\u093e","Removed"],"Home":["\u0939\u094b\u092e","Home"],"ID card":["\u092a\u0939\u091a\u093e\u0928 \u092a\u0924\u094d\u0930","ID card"],"ID card (MCP / masked Aadhaar)":["\u092a\u0939\u091a\u093e\u0928 \u092a\u0924\u094d\u0930 (MCP / \u092e\u093e\u0938\u094d\u0915\u094d\u0921 \u0906\u0927\u093e\u0930)","ID card (MCP / masked Aadhaar)"],"ID card *":["\u092a\u0939\u091a\u093e\u0928 \u092a\u0924\u094d\u0930 *","ID card *"],"ID card ki photo":["\u092a\u0939\u091a\u093e\u0928 \u092a\u0924\u094d\u0930 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b","ID card photo"],"ID card ki photo lein.":["\u092a\u0939\u091a\u093e\u0928 \u092a\u0924\u094d\u0930 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902\u0964","Take the ID card photo."],"Inke saath aaye har bachche ke liye chunein ki usne centre par kitna doodh piya.":["\u0907\u0928\u0915\u0947 \u0938\u093e\u0925 \u0906\u090f \u0939\u0930 \u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0932\u093f\u090f \u091a\u0941\u0928\u0947\u0902 \u0915\u093f \u0909\u0938\u0928\u0947 \u0915\u0947\u0902\u0926\u094d\u0930 \u092a\u0930 \u0915\u093f\u0924\u0928\u093e \u0926\u0942\u0927 \u092a\u093f\u092f\u093e\u0964","For each child who came with them, choose how much milk they drank at the centre."],"Internet ya server se connection nahi hua. Network check karke dobara try karein.":["\u0907\u0902\u091f\u0930\u0928\u0947\u091f \u092f\u093e \u0938\u0930\u094d\u0935\u0930 \u0938\u0947 \u0915\u0928\u0947\u0915\u094d\u0936\u0928 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964 \u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u091c\u093e\u0901\u091a\u0915\u0930 \u0926\u094b\u092c\u093e\u0930\u093e \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964","Could not connect to the internet or server. Check the network and try again."],"Is AWC mein abhi koi bachcha registered nahi hai.":["\u0907\u0938 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092e\u0947\u0902 \u0905\u092d\u0940 \u0915\u094b\u0908 \u092c\u091a\u094d\u091a\u093e \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","No child is registered in this AWC yet."],"Is AWC mein abhi koi dekhbhal karne wala juda nahi hai.":["\u0907\u0938 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092e\u0947\u0902 \u0905\u092d\u0940 \u0915\u094b\u0908 \u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u093e \u0928\u0939\u0940\u0902 \u091c\u0941\u0921\u093c\u093e \u0939\u0948\u0964","No caregiver added in this AWC yet."],"Is bachche ke saath abhi koi juda nahi hai. \"+ Naya vyakti jodo\" dabayein.":["\u0907\u0938 \u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0938\u093e\u0925 \u0905\u092d\u0940 \u0915\u094b\u0908 \u0928\u0939\u0940\u0902 \u091c\u0941\u0921\u093c\u093e \u0939\u0948\u0964 \"+ \u0928\u092f\u093e \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u091c\u094b\u0921\u093c\u094b\" \u0926\u092c\u093e\u090f\u0901\u0964","Nobody is linked to this child yet. Tap \"+ Add new person\"."],"Is bachche ko aaj doodh pehle hi mil chuka hai.":["\u0907\u0938 \u092c\u091a\u094d\u091a\u0947 \u0915\u094b \u0906\u091c \u0926\u0942\u0927 \u092a\u0939\u0932\u0947 \u0939\u0940 \u092e\u093f\u0932 \u091a\u0941\u0915\u093e \u0939\u0948\u0964","This child has already been given milk today."],"Is hafta":["\u0907\u0938 \u0939\u092b\u093c\u094d\u0924\u0947","This week"],"Is hafta vs pichla hafta":["\u092f\u0939 \u0939\u092b\u093c\u094d\u0924\u093e \u092c\u0928\u093e\u092e \u092a\u093f\u091b\u0932\u093e \u0939\u092b\u093c\u094d\u0924\u093e","This week vs last week"],"Is naam ka bachcha nahi mila.":["\u0907\u0938 \u0928\u093e\u092e \u0915\u093e \u092c\u091a\u094d\u091a\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964","No child with this name."],"Is samay ki growth entry nahi.":["\u0907\u0938 \u0938\u092e\u092f \u0915\u0940 \u0935\u0943\u0926\u094d\u0927\u093f \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","No growth entries for this period."],"Is samay mein koi entry nahi.":["\u0907\u0938 \u0938\u092e\u092f \u092e\u0947\u0902 \u0915\u094b\u0908 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902\u0964","No entries in this period."],"Is samay naape":["\u0907\u0938 \u0938\u092e\u092f \u0928\u093e\u092a\u0947 \u0917\u090f","Measured in period"],"Isi bachche ka record dekho":["\u0907\u0938\u0940 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0926\u0947\u0916\u0947\u0902","See this child's record"],"Jaise: photo dhundhli, bachcha ro raha tha":["\u091c\u0948\u0938\u0947: \u092b\u093c\u094b\u091f\u094b \u0927\u0941\u0902\u0927\u0932\u0940, \u092c\u091a\u094d\u091a\u093e \u0930\u094b \u0930\u0939\u093e \u0925\u093e","e.g. photo blurred, child was crying"],"Janm tithi (DOB)":["\u091c\u0928\u094d\u092e \u0924\u093f\u0925\u093f","Date of birth"],"Jodo":["\u091c\u094b\u0921\u093c\u0947\u0902","Add"],"Kam se kam 6 akshar.":["\u0915\u092e \u0938\u0947 \u0915\u092e 6 \u0905\u0915\u094d\u0937\u0930\u0964","At least 6 characters."],"Kam se kam ek bachcha chunein.":["\u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915 \u092c\u091a\u094d\u091a\u093e \u091a\u0941\u0928\u0947\u0902\u0964","Choose at least one child."],"Kis bachche ko doodh dena hai? Naam dabao":["\u0915\u093f\u0938 \u092c\u091a\u094d\u091a\u0947 \u0915\u094b \u0926\u0942\u0927 \u0926\u0947\u0928\u093e \u0939\u0948? \u0928\u093e\u092e \u0926\u092c\u093e\u090f\u0901","Which child gets milk? Tap the name"],"Koi AWC nahi":["\u0915\u094b\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0928\u0939\u0940\u0902","No AWC"],"Koi AWC nahi mila.":["\u0915\u094b\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964","No AWC found."],"Koi account nahi mila.":["\u0915\u094b\u0908 \u0905\u0915\u093e\u0909\u0902\u091f \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964","No account found."],"Koi bachcha registered nahi.":["\u0915\u094b\u0908 \u092c\u091a\u094d\u091a\u093e \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0928\u0939\u0940\u0902\u0964","No children registered."],"Koi data nahi.":["\u0915\u094b\u0908 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902\u0964","No data."],"\u25cf Koi badlav nahi":["\u25cf \u0915\u094b\u0908 \u092c\u0926\u0932\u093e\u0935 \u0928\u0939\u0940\u0902","\u25cf No change"],"Kuch galat hua.":["\u0915\u0941\u091b \u0917\u0921\u093c\u092c\u0921\u093c \u0939\u0941\u0908\u0964","Something went wrong."],"Lambai":["\u0932\u0902\u092c\u093e\u0908","Height"],"Lambai (cm) *":["\u0932\u0902\u092c\u093e\u0908 (\u0938\u0947\u092e\u0940) *","Height (cm) *"],"Lambai cm":["\u0932\u0902\u092c\u093e\u0908 \u0938\u0947\u092e\u0940","Height cm"],"List nahi aayi":["\u0938\u0942\u091a\u0940 \u0928\u0939\u0940\u0902 \u0906\u0908","List did not load"],"Live camera nahi chal raha. 'Phone camera se' button use karein.":["\u0932\u093e\u0907\u0935 \u0915\u0948\u092e\u0930\u093e \u0928\u0939\u0940\u0902 \u091a\u0932 \u0930\u0939\u093e\u0964 '\u092b\u093c\u094b\u0928 \u0915\u0948\u092e\u0930\u093e \u0938\u0947' \u092c\u091f\u0928 \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930\u0947\u0902\u0964","Live camera is not working. Use the 'Phone camera' button."],"Load ho raha hai\u2026":["\u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","Loading\u2026"],"Login":["\u0932\u0949\u0917\u093f\u0928","Login"],"Login ho raha hai\u2026":["\u0932\u0949\u0917\u093f\u0928 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","Logging in\u2026"],"Logout":["\u0932\u0949\u0917\u0906\u0909\u091f","Logout"],"MCP card":["MCP \u0915\u093e\u0930\u094d\u0921","MCP card"],"Maa":["\u092e\u093e\u0901","Mother"],"Maa ka chehra":["\u092e\u093e\u0901 \u0915\u093e \u091a\u0947\u0939\u0930\u093e","Mother's face"],"Maa ka naam *":["\u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e *","Mother's name *"],"Maa ya saath aane wale kam se kam ek vyakti ka chehra jodein.":["\u092e\u093e\u0901 \u092f\u093e \u0938\u093e\u0925 \u0906\u0928\u0947 \u0935\u093e\u0932\u0947 \u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915 \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u091c\u094b\u0921\u093c\u0947\u0902\u0964","Add the face of the mother or at least one person who comes with the child."],"Mahina":["\u092e\u0939\u0940\u0928\u093e","Month"],"Masked Aadhaar (sirf last 4 ank dikhein)":["\u092e\u093e\u0938\u094d\u0915\u094d\u0921 \u0906\u0927\u093e\u0930 (\u0938\u093f\u0930\u094d\u092b\u093c \u0906\u0916\u093c\u093f\u0930\u0940 4 \u0905\u0902\u0915 \u0926\u093f\u0916\u0947\u0902)","Masked Aadhaar (only last 4 digits visible)"],"Match kar rahe hain\u2026":["\u092e\u093f\u0932\u093e\u0928 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","Matching\u2026"],"Matched":["\u092e\u093f\u0932 \u0917\u092f\u093e","Matched"],"Mausi":["\u092e\u094c\u0938\u0940","Aunt (mausi)"],"Mera Data":["\u092e\u0947\u0930\u093e \u0921\u0947\u091f\u093e","My Data"],"Mera data":["\u092e\u0947\u0930\u093e \u0921\u0947\u091f\u093e","My data"],"Mere AWC":["\u092e\u0947\u0930\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940","My AWCs"],"Mere sabhi AWC":["\u092e\u0947\u0930\u0940 \u0938\u092d\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940","All my AWCs"],"Mere sabhi sector":["\u092e\u0947\u0930\u0947 \u0938\u092d\u0940 \u0938\u0947\u0915\u094d\u091f\u0930","All my sectors"],"Mere sector":["\u092e\u0947\u0930\u0947 \u0938\u0947\u0915\u094d\u091f\u0930","My sectors"],"Meri entries aur report":["\u092e\u0947\u0930\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0914\u0930 \u0930\u093f\u092a\u094b\u0930\u094d\u091f","My entries and report"],"Milk Ambassador":["\u092e\u093f\u0932\u094d\u0915 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930","Milk Ambassador"],"Milk Ambassador ke hisaab se":["\u092e\u093f\u0932\u094d\u0915 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947","By Milk Ambassador"],"Milk Supplementation \u00b7 Login":["\u0926\u0942\u0927 \u092a\u0942\u0930\u0915 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e \u00b7 \u0932\u0949\u0917\u093f\u0928","Milk Supplementation \u00b7 Login"],"Mobile":["\u092e\u094b\u092c\u093e\u0907\u0932","Mobile"],"Mobile (optional)":["\u092e\u094b\u092c\u093e\u0907\u0932 (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)","Mobile (optional)"],"Mobile 10 ank ka sahi number ho, ya khali chhod dein.":["\u092e\u094b\u092c\u093e\u0907\u0932 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0938\u0939\u0940 \u0928\u0902\u092c\u0930 \u0939\u094b, \u092f\u093e \u0916\u093c\u093e\u0932\u0940 \u091b\u094b\u0921\u093c \u0926\u0947\u0902\u0964","Mobile must be a valid 10-digit number, or leave it empty."],"Mobile number * (ek number se ek hi account)":["\u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 * (\u090f\u0915 \u0928\u0902\u092c\u0930 \u0938\u0947 \u090f\u0915 \u0939\u0940 \u0905\u0915\u093e\u0909\u0902\u091f)","Mobile number * (one account per number)"],"Monthly":["\u092e\u093e\u0938\u093f\u0915","Monthly"],"Naam *":["\u0928\u093e\u092e *","Name *"],"Naam aur rishta bharein.":["\u0928\u093e\u092e \u0914\u0930 \u0930\u093f\u0936\u094d\u0924\u093e \u092d\u0930\u0947\u0902\u0964","Fill in name and relation."],"Naam chunein, phir unka chehra scan hoga. Doodh bachcha centre par hi piyega.":["\u0928\u093e\u092e \u091a\u0941\u0928\u0947\u0902, \u092b\u093f\u0930 \u0909\u0928\u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0938\u094d\u0915\u0948\u0928 \u0939\u094b\u0917\u093e\u0964 \u0926\u0942\u0927 \u092c\u091a\u094d\u091a\u093e \u0915\u0947\u0902\u0926\u094d\u0930 \u092a\u0930 \u0939\u0940 \u092a\u093f\u090f\u0917\u093e\u0964","Choose the name, then their face will be scanned. The child drinks the milk at the centre."],"Naam se dhundho":["\u0928\u093e\u092e \u0938\u0947 \u0916\u094b\u091c\u0947\u0902","Search by name"],"Naam, username ya mobile":["\u0928\u093e\u092e, \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u092f\u093e \u092e\u094b\u092c\u093e\u0907\u0932","Name, username or mobile"],"Naapne ka mahina *":["\u0928\u093e\u092a\u0928\u0947 \u0915\u093e \u092e\u0939\u0940\u0928\u093e *","Month of measurement *"],"Nahi":["\u0928\u0939\u0940\u0902","No"],"Nahi (No)":["\u0928\u0939\u0940\u0902","No"],"Nahi hua":["\u0928\u0939\u0940\u0902 \u0939\u0941\u0906","Not done"],"Nahi piya":["\u0928\u0939\u0940\u0902 \u092a\u093f\u092f\u093e","Did not drink"],"Nahi, wapas jao":["\u0928\u0939\u0940\u0902, \u0935\u093e\u092a\u0938 \u091c\u093e\u090f\u0901","No, go back"],"Nana":["\u0928\u093e\u0928\u093e","Grandfather (nana)"],"Nani":["\u0928\u093e\u0928\u0940","Grandmother (nani)"],"Naya bachcha":["\u0928\u092f\u093e \u092c\u091a\u094d\u091a\u093e","New child"],"Naya chehra":["\u0928\u092f\u093e \u091a\u0947\u0939\u0930\u093e","New photo"],"Naya password (kam se kam 6 akshar)":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 (\u0915\u092e \u0938\u0947 \u0915\u092e 6 \u0905\u0915\u094d\u0937\u0930)","New password (at least 6 characters)"],"Naya password set karein":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947\u091f \u0915\u0930\u0947\u0902","Set new password"],"Naya vyakti":["\u0928\u092f\u093e \u0935\u094d\u092f\u0915\u094d\u0924\u093f","New person"],"Naye AWC ka naam * (jaise: Kersai AWC-1)":["\u0928\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u093e \u0928\u093e\u092e * (\u091c\u0948\u0938\u0947: Kersai AWC-1)","New AWC name * (e.g. Kersai AWC-1)"],"Naye dekhbhal karne wale (7 din)":["\u0928\u090f \u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u0947 (7 \u0926\u093f\u0928)","New caregivers (7 days)"],"Not matched":["\u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e","Not matched"],"Override":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921","Override"],"Override ka kaaran *":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921 \u0915\u093e \u0915\u093e\u0930\u0923 *","Reason for override *"],"Override ka kaaran likhein.":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921 \u0915\u093e \u0915\u093e\u0930\u0923 \u0932\u093f\u0916\u0947\u0902\u0964","Write the reason for override."],"Override karo":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921 \u0915\u0930\u0947\u0902","Override"],"Papa":["\u092a\u093e\u092a\u093e","Father"],"Parivar se jodein":["\u092a\u0930\u093f\u0935\u093e\u0930 \u0938\u0947 \u091c\u094b\u0921\u093c\u0947\u0902","Link from family"],"Password":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921","Password"],"Password * (kam se kam 6 akshar)":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 * (\u0915\u092e \u0938\u0947 \u0915\u092e 6 \u0905\u0915\u094d\u0937\u0930)","Password * (at least 6 characters)"],"Password kam se kam 6 akshar ka ho.":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0915\u092e \u0938\u0947 \u0915\u092e 6 \u0905\u0915\u094d\u0937\u0930 \u0915\u093e \u0939\u094b\u0964","Password must be at least 6 characters."],"Password reset":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0930\u0940\u0938\u0947\u091f","Password reset"],"Pehle 'Report dekho' dabayein.":["\u092a\u0939\u0932\u0947 '\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0926\u0947\u0916\u0947\u0902' \u0926\u092c\u093e\u090f\u0901\u0964","First tap 'View report'."],"Pehle AWC chunein.":["\u092a\u0939\u0932\u0947 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0947\u0902\u0964","Choose an AWC first."],"Pehle se registered":["\u092a\u0939\u0932\u0947 \u0938\u0947 \u092a\u0902\u091c\u0940\u0915\u0943\u0924","Already registered"],"Pehle wo bachche jinka wajan ghata hai.":["\u092a\u0939\u0932\u0947 \u0935\u0947 \u092c\u091a\u094d\u091a\u0947 \u091c\u093f\u0928\u0915\u093e \u0935\u091c\u0928 \u0918\u091f\u093e \u0939\u0948\u0964","Children whose weight went down are shown first."],"Pehli baar setup":["\u092a\u0939\u0932\u0940 \u092c\u093e\u0930 \u0938\u0947\u091f\u0905\u092a","First-time setup"],"Phone camera se":["\u092b\u093c\u094b\u0928 \u0915\u0948\u092e\u0930\u093e \u0938\u0947","Phone camera"],"Phone number *":["\u092b\u093c\u094b\u0928 \u0928\u0902\u092c\u0930 *","Phone number *"],"Phone number 10 ank ka sahi number likhein.":["\u092b\u093c\u094b\u0928 \u0928\u0902\u092c\u0930 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0938\u0939\u0940 \u0932\u093f\u0916\u0947\u0902\u0964","Enter a correct 10-digit phone number."],"Photo":["\u092b\u093c\u094b\u091f\u094b","Photo"],"Photo kheecho":["\u092b\u093c\u094b\u091f\u094b \u0916\u0940\u0902\u091a\u0947\u0902","Take photo"],"Photo li gayi \u2713":["\u092b\u093c\u094b\u091f\u094b \u0932\u0940 \u0917\u0908 \u2713","Photo taken \u2713"],"Photo mein chehra nahi mila. Bachche ka chehra paas se, seedha aur roshni mein rakh kar dobara photo lein.":["\u092b\u093c\u094b\u091f\u094b \u092e\u0947\u0902 \u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u092a\u093e\u0938 \u0938\u0947, \u0938\u0940\u0927\u093e \u0914\u0930 \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902 \u0930\u0916\u0915\u0930 \u0926\u094b\u092c\u093e\u0930\u093e \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902\u0964","No face in the photo. Retake with the child's face close, straight and in good light."],"Photo mein chehra nahi mila. Paas se, seedha aur roshni mein dobara lein.":["\u092b\u093c\u094b\u091f\u094b \u092e\u0947\u0902 \u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964 \u092a\u093e\u0938 \u0938\u0947, \u0938\u0940\u0927\u093e \u0914\u0930 \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902 \u0926\u094b\u092c\u093e\u0930\u093e \u0932\u0947\u0902\u0964","No face in the photo. Retake close, straight and in good light."],"Pichhle":["\u092a\u093f\u091b\u0932\u0947","Previous"],"Pichhle record":["\u092a\u093f\u091b\u0932\u0947 \u0930\u093f\u0915\u0949\u0930\u094d\u0921","Previous records"],"Pichhle record load ho rahe hain\u2026":["\u092a\u093f\u091b\u0932\u0947 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u0947 \u0939\u0948\u0902\u2026","Loading previous records\u2026"],"Pichla hafta":["\u092a\u093f\u091b\u0932\u093e \u0939\u092b\u093c\u094d\u0924\u093e","Last week"],"Poora Aadhaar number dikhe to photo na lein.":["\u092a\u0942\u0930\u093e \u0906\u0927\u093e\u0930 \u0928\u0902\u092c\u0930 \u0926\u093f\u0916\u0947 \u0924\u094b \u092b\u093c\u094b\u091f\u094b \u0928 \u0932\u0947\u0902\u0964","Do not photograph if the full Aadhaar number is visible."],"Poora https:// wala link paste karein.":["\u092a\u0942\u0930\u093e https:// \u0935\u093e\u0932\u093e \u0932\u093f\u0902\u0915 \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0947\u0902\u0964","Paste the full https:// link."],"Poora naam *":["\u092a\u0942\u0930\u093e \u0928\u093e\u092e *","Full name *"],"Poora sector":["\u092a\u0942\u0930\u093e \u0938\u0947\u0915\u094d\u091f\u0930","Whole sector"],"Poori Report":["\u092a\u0942\u0930\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f","Full Report"],"Prakar":["\u092a\u094d\u0930\u0915\u093e\u0930","Type"],"Pura":["\u092a\u0942\u0930\u093e","Full"],"Pura (Full)":["\u092a\u0942\u0930\u093e","Full"],"Pura (Full) \u2014 centre mein":["\u092a\u0942\u0930\u093e \u2014 \u0915\u0947\u0902\u0926\u094d\u0930 \u092e\u0947\u0902","Full \u2014 at the centre"],"Qtr":["\u091a\u094c\u0925\u093e\u0908","Qtr"],"Quarter":["\u091a\u094c\u0925\u093e\u0908","Quarter"],"Quarterly":["\u0924\u093f\u092e\u093e\u0939\u0940","Quarterly"],"Record ke liye har mahine nayi photo.":["\u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0947 \u0932\u093f\u090f \u0939\u0930 \u092e\u0939\u0940\u0928\u0947 \u0928\u0908 \u092b\u093c\u094b\u091f\u094b\u0964","A new photo every month for the record."],"Record ke liye. Pehchaan saath aane wale vyakti ke chehre se hogi.":["\u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0947 \u0932\u093f\u090f\u0964 \u092a\u0939\u091a\u093e\u0928 \u0938\u093e\u0925 \u0906\u0928\u0947 \u0935\u093e\u0932\u0947 \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0915\u0947 \u091a\u0947\u0939\u0930\u0947 \u0938\u0947 \u0939\u094b\u0917\u0940\u0964","For the record. Identification is by the accompanying person's face."],"Record sudhar diya":["\u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0938\u0941\u0927\u093e\u0930 \u0926\u093f\u092f\u093e","Record corrected"],"Refresh":["\u0930\u0940\u092b\u093c\u094d\u0930\u0947\u0936","Refresh"],"Register karo":["\u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902","Register"],"Registered":["\u092a\u0902\u091c\u0940\u0915\u0943\u0924","Registered"],"Registered bachche":["\u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u092c\u091a\u094d\u091a\u0947","Registered children"],"Registration":["\u092a\u0902\u091c\u0940\u0915\u0930\u0923","Registration"],"Regn.":["\u092a\u0902\u091c\u0940\u0915\u0930\u0923","Regn."],"Replaced":["\u092c\u0926\u0932\u093e \u0917\u092f\u093e","Replaced"],"Report ban rahi hai\u2026":["\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u092c\u0928 \u0930\u0939\u0940 \u0939\u0948\u2026","Preparing report\u2026"],"Report dekho":["\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0926\u0947\u0916\u0947\u0902","View report"],"Reports":["\u0930\u093f\u092a\u094b\u0930\u094d\u091f","Reports"],"Rishta *":["\u0930\u093f\u0936\u094d\u0924\u093e *","Relation *"],"Role":["\u092d\u0942\u092e\u093f\u0915\u093e","Role"],"Roz ke submissions":["\u0930\u094b\u091c\u093c \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940","Daily submissions"],"Roz ki doodh entry":["\u0930\u094b\u091c\u093c \u0915\u0940 \u0926\u0942\u0927 \u090f\u0902\u091f\u094d\u0930\u0940","Daily milk entries"],"Roz ki entry":["\u0930\u094b\u091c\u093c \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940","Daily entries"],"Saari entries":["\u0938\u092d\u0940 \u090f\u0902\u091f\u094d\u0930\u0940","All entries"],"Saath aane wala vyakti":["\u0938\u093e\u0925 \u0906\u0928\u0947 \u0935\u093e\u0932\u093e \u0935\u094d\u092f\u0915\u094d\u0924\u093f","Accompanying person"],"Saath aaye vyakti":["\u0938\u093e\u0925 \u0906\u090f \u0935\u094d\u092f\u0915\u094d\u0924\u093f","Accompanying person"],"Sab AWC, sab ambassador, CSV, Sheet":["\u0938\u092d\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940, \u0938\u092d\u0940 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930, CSV, \u0936\u0940\u091f","All AWCs, all ambassadors, CSV, Sheet"],"Sab ho gaye \u2713":["\u0938\u092c \u0939\u094b \u0917\u090f \u2713","All done \u2713"],"Sabhi AWC":["\u0938\u092d\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940","All AWCs"],"Sabhi AWC (poora project)":["\u0938\u092d\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 (\u092a\u0942\u0930\u093e \u092a\u094d\u0930\u094b\u091c\u0947\u0915\u094d\u091f)","All AWCs (whole project)"],"Sabhi ambassador":["\u0938\u092d\u0940 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930","All ambassadors"],"Sabhi role":["\u0938\u092d\u0940 \u092d\u0942\u092e\u093f\u0915\u093e\u090f\u0901","All roles"],"Sabhi sector":["\u0938\u092d\u0940 \u0938\u0947\u0915\u094d\u091f\u0930","All sectors"],"Sahi tareekh chunein (from, to se pehle ho).":["\u0938\u0939\u0940 \u0924\u093e\u0930\u0940\u0916\u093c \u091a\u0941\u0928\u0947\u0902 (\u0936\u0941\u0930\u0942 \u0915\u0940 \u0924\u093e\u0930\u0940\u0916\u093c \u0906\u0916\u093c\u093f\u0930\u0940 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0939\u094b)\u0964","Choose valid dates (start must be before end)."],"Same":["\u092c\u0930\u093e\u092c\u0930","Same"],"Save ho raha hai\u2026":["\u0938\u0947\u0935 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","Saving\u2026"],"Save hua":["\u0938\u0947\u0935 \u0939\u0941\u0906","Saved"],"Save karo":["\u0938\u0947\u0935 \u0915\u0930\u0947\u0902","Save"],"Save nahi hua.":["\u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906\u0964","Not saved."],"Se (from)":["\u0938\u0947","From"],"Sector":["\u0938\u0947\u0915\u094d\u091f\u0930","Sector"],"Sector aur AWC ke hisaab se ginti":["\u0938\u0947\u0915\u094d\u091f\u0930 \u0914\u0930 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947 \u0917\u093f\u0928\u0924\u0940","Counts by sector and AWC"],"Sector ke hisaab se":["\u0938\u0947\u0915\u094d\u091f\u0930 \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947","By sector"],"Seedha chehra, roshni mein.":["\u0938\u0940\u0927\u093e \u091a\u0947\u0939\u0930\u093e, \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902\u0964","Face straight, in good light."],"Senior Management":["\u0935\u0930\u093f\u0937\u094d\u0920 \u092a\u094d\u0930\u092c\u0902\u0927\u0928","Senior Management"],"Server ka jawab samajh nahi aaya. Server link sahi hai?":["\u0938\u0930\u094d\u0935\u0930 \u0915\u093e \u091c\u0935\u093e\u092c \u0938\u092e\u091d \u0928\u0939\u0940\u0902 \u0906\u092f\u093e\u0964 \u0938\u0930\u094d\u0935\u0930 \u0932\u093f\u0902\u0915 \u0938\u0939\u0940 \u0939\u0948?","Could not understand the server reply. Is the server link correct?"],"Server link":["\u0938\u0930\u094d\u0935\u0930 \u0932\u093f\u0902\u0915","Server link"],"Server link badlo":["\u0938\u0930\u094d\u0935\u0930 \u0932\u093f\u0902\u0915 \u092c\u0926\u0932\u0947\u0902","Change server link"],"Server link set nahi hai.":["\u0938\u0930\u094d\u0935\u0930 \u0932\u093f\u0902\u0915 \u0938\u0947\u091f \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Server link is not set."],"Server se jud gaye.":["\u0938\u0930\u094d\u0935\u0930 \u0938\u0947 \u091c\u0941\u0921\u093c \u0917\u090f\u0964","Connected to server."],"Set karo":["\u0938\u0947\u091f \u0915\u0930\u0947\u0902","Set"],"Star (*) wale khane bharein.":["\u0938\u094d\u091f\u093e\u0930 (*) \u0935\u093e\u0932\u0947 \u0916\u093e\u0928\u0947 \u092d\u0930\u0947\u0902\u0964","Fill the fields marked with a star (*)."],"Submission Report":["\u0938\u092c\u092e\u093f\u0936\u0928 \u0930\u093f\u092a\u094b\u0930\u094d\u091f","Submission Report"],"Submission report (CSV)":["\u0938\u092c\u092e\u093f\u0936\u0928 \u0930\u093f\u092a\u094b\u0930\u094d\u091f (CSV)","Submission report (CSV)"],"Submissions":["\u0938\u092c\u092e\u093f\u0936\u0928","Submissions"],"Tak (to)":["\u0924\u0915","To"],"Taken home":["\u0918\u0930 \u0932\u0947 \u0917\u090f","Taken home"],"Tareekh":["\u0924\u093e\u0930\u0940\u0916\u093c","Date"],"Test ya dummy account":["\u091f\u0947\u0938\u094d\u091f \u092f\u093e \u0928\u0915\u0932\u0940 \u0905\u0915\u093e\u0909\u0902\u091f","Test or dummy account"],"Theek hai":["\u0920\u0940\u0915 \u0939\u0948","OK"],"Unlock":["\u0905\u0928\u0932\u0949\u0915 \u0915\u0930\u0947\u0902","Unlock"],"User ID ban gaya":["\u092f\u0942\u091c\u093c\u0930 ID \u092c\u0928 \u0917\u0908","User ID created"],"User ID banao":["\u092f\u0942\u091c\u093c\u0930 ID \u092c\u0928\u093e\u090f\u0901","Create user ID"],"Username":["\u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e","Username"],"Username * (chhote angrezi akshar/number, jaise pooja.k)":["\u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e * (\u091b\u094b\u091f\u0947 \u0905\u0902\u0917\u094d\u0930\u0947\u091c\u093c\u0940 \u0905\u0915\u094d\u0937\u0930/\u0905\u0902\u0915, \u091c\u0948\u0938\u0947 pooja.k)","Username * (small English letters/numbers, e.g. pooja.k)"],"Users / Accounts":["\u092f\u0942\u091c\u093c\u0930 / \u0905\u0915\u093e\u0909\u0902\u091f","Users / Accounts"],"Wajan":["\u0935\u091c\u0928","Weight"],"Wajan (kg) *":["\u0935\u091c\u0928 (\u0915\u093f\u0932\u094b) *","Weight (kg) *"],"Wajan (kg) aur lambai (cm) bharein.":["\u0935\u091c\u0928 (\u0915\u093f\u0932\u094b) \u0914\u0930 \u0932\u0902\u092c\u093e\u0908 (\u0938\u0947\u092e\u0940) \u092d\u0930\u0947\u0902\u0964","Enter weight (kg) and height (cm)."],"Wajan / Lambai":["\u0935\u091c\u0928 / \u0932\u0902\u092c\u093e\u0908","Weight / Height"],"Wajan / lambai update":["\u0935\u091c\u0928 / \u0932\u0902\u092c\u093e\u0908 \u0905\u092a\u0921\u0947\u091f","Weight / height update"],"Wajan aur lambai bharein.":["\u0935\u091c\u0928 \u0914\u0930 \u0932\u0902\u092c\u093e\u0908 \u092d\u0930\u0947\u0902\u0964","Enter weight and height."],"Wajan badha":["\u0935\u091c\u0928 \u092c\u0922\u093c\u093e","Weight up"],"\u25b2 Wajan badha":["\u25b2 \u0935\u091c\u0928 \u092c\u0922\u093c\u093e","\u25b2 Weight up"],"\u25bc Wajan ghata":["\u25bc \u0935\u091c\u0928 \u0918\u091f\u093e","\u25bc Weight down"],"Wajan graph":["\u0935\u091c\u0928 \u0917\u094d\u0930\u093e\u092b\u093c","Weight graph"],"Wajan ka graph":["\u0935\u091c\u0928 \u0915\u093e \u0917\u094d\u0930\u093e\u092b\u093c","Weight graph"],"Wajan kg":["\u0935\u091c\u0928 \u0915\u093f\u0932\u094b","Weight kg"],"Wajan/lambai save ho gaya":["\u0935\u091c\u0928/\u0932\u0902\u092c\u093e\u0908 \u0938\u0947\u0935 \u0939\u094b \u0917\u0908","Weight/height saved"],"Wapas chalu karo":["\u092b\u093f\u0930 \u0938\u0947 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902","Re-enable"],"Web app URL":["\u0935\u0947\u092c \u0910\u092a URL","Web app URL"],"Weekly":["\u0938\u093e\u092a\u094d\u0924\u093e\u0939\u093f\u0915","Weekly"],"Ye bachcha pehle se registered hai":["\u092f\u0939 \u092c\u091a\u094d\u091a\u093e \u092a\u0939\u0932\u0947 \u0938\u0947 \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0939\u0948","This child is already registered"],"Ye bachcha pehle se registered hai.":["\u092f\u0939 \u092c\u091a\u094d\u091a\u093e \u092a\u0939\u0932\u0947 \u0938\u0947 \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0939\u0948\u0964","This child is already registered."],"Ye bachche kai din se centre nahi aaye. Ghar jaakar pata karein.":["\u092f\u0947 \u092c\u091a\u094d\u091a\u0947 \u0915\u0908 \u0926\u093f\u0928\u094b\u0902 \u0938\u0947 \u0915\u0947\u0902\u0926\u094d\u0930 \u0928\u0939\u0940\u0902 \u0906\u090f\u0964 \u0918\u0930 \u091c\u093e\u0915\u0930 \u092a\u0924\u093e \u0915\u0930\u0947\u0902\u0964","These children have not come to the centre for several days. Please visit their homes."],"Ye photo khul nahi payi. Doosri photo lein.":["\u092f\u0939 \u092b\u093c\u094b\u091f\u094b \u0916\u0941\u0932 \u0928\u0939\u0940\u0902 \u092a\u093e\u0908\u0964 \u0926\u0942\u0938\u0930\u0940 \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902\u0964","This photo could not be opened. Take another one."],"Yes":["\u0939\u093e\u0901","Yes"],"No":["\u0928\u0939\u0940\u0902","No"],"\u2713 Mil gaya":["\u2713 \u092e\u093f\u0932 \u0917\u092f\u093e","\u2713 Given"],"aaj mil gaya":["\u0906\u091c \u092e\u093f\u0932 \u0917\u092f\u093e","given today"],"badla gaya":["\u092c\u0926\u0932\u093e \u0917\u092f\u093e","replaced"],"(badla gaya)":["(\u092c\u0926\u0932\u093e \u0917\u092f\u093e)","(replaced)"],"ko aaj doodh mila":["\u0915\u094b \u0906\u091c \u0926\u0942\u0927 \u092e\u093f\u0932\u093e","got milk today"],"ko aaj doodh":["\u0915\u094b \u0906\u091c \u0926\u0942\u0927","got milk today"],"ko aaj doodh mil chuka hai.":["\u0915\u094b \u0906\u091c \u0926\u0942\u0927 \u092e\u093f\u0932 \u091a\u0941\u0915\u093e \u0939\u0948\u0964","have got milk today."],"pura piya":["\u092a\u0942\u0930\u093e \u092a\u093f\u092f\u093e","drank fully"],"Mahina (Month)":["\u092e\u0939\u0940\u0928\u093e","Month"],"\u2014 chunein \u2014":["\u2014 \u091a\u0941\u0928\u0947\u0902 \u2014","\u2014 choose \u2014"],"Is hafta:":["\u0907\u0938 \u0939\u092b\u093c\u094d\u0924\u0947:","This week:"],"Pichla hafta:":["\u092a\u093f\u091b\u0932\u093e \u0939\u092b\u093c\u094d\u0924\u093e:","Last week:"],"Kullukera":["Kullukera","Kullukera"],"Aaj doodh piya":["\u0906\u091c \u0926\u0942\u0927 \u092a\u093f\u092f\u093e","Milk today"],"Hinglish":["Hinglish","Hinglish"],"Bhasha":["\u092d\u093e\u0937\u093e","Language"],"Mahine":["\u092e\u0939\u0940\u0928\u0947","Months"],"Har din":["\u0939\u0930 \u0926\u093f\u0928","Every day"],"Sun":["\u0930\u0935\u093f","Sun"],"Mon":["\u0938\u094b\u092e","Mon"],"Tue":["\u092e\u0902\u0917\u0932","Tue"],"Wed":["\u092c\u0941\u0927","Wed"],"Thu":["\u0917\u0941\u0930\u0941","Thu"],"Fri":["\u0936\u0941\u0915\u094d\u0930","Fri"],"Sat":["\u0936\u0928\u093f","Sat"],"Sector-wise":["\u0938\u0947\u0915\u094d\u091f\u0930\u0935\u093e\u0930","Sector-wise"],"Mahina (badla gaya)":["\u092e\u0939\u0940\u0928\u093e (\u092c\u0926\u0932\u093e \u0917\u092f\u093e)","Month (replaced)"],"3 mahine (badla gaya)":["3 \u092e\u0939\u0940\u0928\u0947 (\u092c\u0926\u0932\u093e \u0917\u092f\u093e)","3 months (replaced)"],"Aane wale mahine ki entry nahi ho sakti.":["\u0906\u0928\u0947 \u0935\u093e\u0932\u0947 \u092e\u0939\u0940\u0928\u0947 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0924\u0940\u0964","Entries cannot be made for a future month."],"Aapke role mein bachchon ki list nahi hai.":["\u0906\u092a\u0915\u0940 \u092d\u0942\u092e\u093f\u0915\u093e \u092e\u0947\u0902 \u092c\u091a\u094d\u091a\u094b\u0902 \u0915\u0940 \u0938\u0942\u091a\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Your role does not include the children list."],"Aapke role mein data entry ki anumati nahi hai.":["\u0906\u092a\u0915\u0940 \u092d\u0942\u092e\u093f\u0915\u093e \u092e\u0947\u0902 \u0921\u0947\u091f\u093e \u090f\u0902\u091f\u094d\u0930\u0940 \u0915\u0940 \u0905\u0928\u0941\u092e\u0924\u093f \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Your role is not allowed to enter data."],"Account band hai.":["\u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0902\u0926 \u0939\u0948\u0964","Account is disabled."],"Account nahi mila.":["\u0905\u0915\u093e\u0909\u0902\u091f \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964","Account not found."],"Apna 10 ank ka sahi mobile number likhein. Ek mobile number se ek hi account banta hai.":["\u0905\u092a\u0928\u093e 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0938\u0939\u0940 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0932\u093f\u0916\u0947\u0902\u0964 \u090f\u0915 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0938\u0947 \u090f\u0915 \u0939\u0940 \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u0924\u093e \u0939\u0948\u0964","Enter a correct 10-digit mobile number. Only one account per mobile number."],"Apne khud ke account par ye nahi kar sakte.":["\u0905\u092a\u0928\u0947 \u0916\u093c\u0941\u0926 \u0915\u0947 \u0905\u0915\u093e\u0909\u0902\u091f \u092a\u0930 \u092f\u0939 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u0947\u0964","You cannot do this on your own account."],"Bachcha nahi mila.":["\u092c\u091a\u094d\u091a\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964","Child not found."],"Bachche ka naam, maa ka naam aur AWC zaroori hai.":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0928\u093e\u092e, \u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e \u0914\u0930 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091c\u093c\u0930\u0942\u0930\u0940 \u0939\u0948\u0964","Child's name, mother's name and AWC are required."],"Bachche ki photo aur ID card ki photo dono zaroori hain.":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u0914\u0930 \u092a\u0939\u091a\u093e\u0928 \u092a\u0924\u094d\u0930 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u0926\u094b\u0928\u094b\u0902 \u091c\u093c\u0930\u0942\u0930\u0940 \u0939\u0948\u0902\u0964","Both the child's photo and the ID card photo are required."],"Chehre ka data nahi mila.":["\u091a\u0947\u0939\u0930\u0947 \u0915\u093e \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964","Face data not found."],"Dekhbhal karne wale ka naam aur rishta likhein.":["\u0926\u0947\u0916\u092d\u093e\u0932 \u0915\u0930\u0928\u0947 \u0935\u093e\u0932\u0947 \u0915\u093e \u0928\u093e\u092e \u0914\u0930 \u0930\u093f\u0936\u094d\u0924\u093e \u0932\u093f\u0916\u0947\u0902\u0964","Enter the caregiver's name and relation."],"District Management access code galat hai. Admin se code lein.":["\u091c\u093c\u093f\u0932\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u093e \u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0917\u093c\u0932\u0924 \u0939\u0948\u0964 \u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u0915\u094b\u0921 \u0932\u0947\u0902\u0964","District Management access code is wrong. Get the code from admin."],"Dobara login karein.":["\u0926\u094b\u092c\u093e\u0930\u093e \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902\u0964","Please log in again."],"Field Coordinator access code galat hai. Admin se code lein.":["\u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u0915\u093e \u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0917\u093c\u0932\u0924 \u0939\u0948\u0964 \u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u0915\u094b\u0921 \u0932\u0947\u0902\u0964","Field Coordinator access code is wrong. Get the code from admin."],"Galat kaam.":["\u0917\u093c\u0932\u0924 \u0915\u093e\u092e\u0964","Invalid action."],"Is mobile number se pehle se ek account bana hua hai. Naya account nahi banega. Password bhool gaye hain to admin se sampark karein.":["\u0907\u0938 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0938\u0947 \u090f\u0915 \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u093e \u0939\u0941\u0906 \u0939\u0948\u0964 \u0928\u092f\u093e \u0905\u0915\u093e\u0909\u0902\u091f \u0928\u0939\u0940\u0902 \u092c\u0928\u0947\u0917\u093e\u0964 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092d\u0942\u0932 \u0917\u090f \u0939\u0948\u0902 \u0924\u094b \u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902\u0964","An account already exists with this mobile number. A new account cannot be created. If you forgot the password, contact the admin."],"Kam se kam ek AWC chunein.":["\u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0947\u0902\u0964","Choose at least one AWC."],"Kam se kam ek sector chunein.":["\u0915\u092e \u0938\u0947 \u0915\u092e \u090f\u0915 \u0938\u0947\u0915\u094d\u091f\u0930 \u091a\u0941\u0928\u0947\u0902\u0964","Choose at least one sector."],"Login ka samay khatam. Dobara login karein.":["\u0932\u0949\u0917\u093f\u0928 \u0915\u093e \u0938\u092e\u092f \u0916\u093c\u0924\u094d\u092e\u0964 \u0926\u094b\u092c\u093e\u0930\u093e \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902\u0964","Session expired. Please log in again."],"Mahina sahi nahi hai.":["\u092e\u0939\u0940\u0928\u093e \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Month is not valid."],"Naya password kam se kam 6 akshar ka ho.":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0915\u092e \u0938\u0947 \u0915\u092e 6 \u0905\u0915\u094d\u0937\u0930 \u0915\u093e \u0939\u094b\u0964","New password must be at least 6 characters."],"Override ki anumati khatam ho gayi. Coordinator se dobara override karwayein.":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921 \u0915\u0940 \u0905\u0928\u0941\u092e\u0924\u093f \u0916\u093c\u0924\u094d\u092e \u0939\u094b \u0917\u0908\u0964 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u0938\u0947 \u0926\u094b\u092c\u093e\u0930\u093e \u0913\u0935\u0930\u0930\u093e\u0907\u0921 \u0915\u0930\u0935\u093e\u090f\u0901\u0964","Override permission expired. Ask the coordinator to override again."],"Override sirf Field Coordinator ya District Management kar sakte hain.":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921 \u0938\u093f\u0930\u094d\u092b\u093c \u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u092f\u093e \u091c\u093c\u093f\u0932\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964","Only a Field Coordinator or District Management can override."],"Phone number 10 ankon ka sahi number ho.":["\u092b\u093c\u094b\u0928 \u0928\u0902\u092c\u0930 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0938\u0939\u0940 \u0928\u0902\u092c\u0930 \u0939\u094b\u0964","Phone number must be a valid 10-digit number."],"Photo bahut badi hai.":["\u092b\u093c\u094b\u091f\u094b \u092c\u0939\u0941\u0924 \u092c\u0921\u093c\u0940 \u0939\u0948\u0964","Photo is too large."],"Photo ka format sahi nahi hai.":["\u092b\u093c\u094b\u091f\u094b \u0915\u093e \u092b\u093c\u0949\u0930\u094d\u092e\u0947\u091f \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Photo format is not valid."],"Poora naam likhein.":["\u092a\u0942\u0930\u093e \u0928\u093e\u092e \u0932\u093f\u0916\u0947\u0902\u0964","Enter the full name."],"Role chunein.":["\u092d\u0942\u092e\u093f\u0915\u093e \u091a\u0941\u0928\u0947\u0902\u0964","Choose a role."],"Senior Management access code galat hai. Admin se code lein.":["\u0935\u0930\u093f\u0937\u094d\u0920 \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u093e \u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0917\u093c\u0932\u0924 \u0939\u0948\u0964 \u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u0915\u094b\u0921 \u0932\u0947\u0902\u0964","Senior Management access code is wrong. Get the code from admin."],"Tareekh sahi chunein.":["\u0924\u093e\u0930\u0940\u0916\u093c \u0938\u0939\u0940 \u091a\u0941\u0928\u0947\u0902\u0964","Choose a valid date."],"Wajan aur lambai dono bharein.":["\u0935\u091c\u0928 \u0914\u0930 \u0932\u0902\u092c\u093e\u0908 \u0926\u094b\u0928\u094b\u0902 \u092d\u0930\u0947\u0902\u0964","Enter both weight and height."],"Wajan/lambai sahi number mein likhein.":["\u0935\u091c\u0928/\u0932\u0902\u092c\u093e\u0908 \u0938\u0939\u0940 \u0938\u0902\u0916\u094d\u092f\u093e \u092e\u0947\u0902 \u0932\u093f\u0916\u0947\u0902\u0964","Enter weight/height as valid numbers."],"Ye account band hai. Admin se baat karein.":["\u092f\u0939 \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0902\u0926 \u0939\u0948\u0964 \u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u092c\u093e\u0924 \u0915\u0930\u0947\u0902\u0964","This account is disabled. Talk to the admin."],"Ye account hata diya gaya hai. Naya account banayein.":["\u092f\u0939 \u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u093e \u0926\u093f\u092f\u093e \u0917\u092f\u093e \u0939\u0948\u0964 \u0928\u092f\u093e \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u093e\u090f\u0901\u0964","This account has been removed. Create a new account."],"Ye bachcha aapke dwara registered nahi hai.":["\u092f\u0939 \u092c\u091a\u094d\u091a\u093e \u0906\u092a\u0915\u0947 \u0926\u094d\u0935\u093e\u0930\u093e \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","This child was not registered by you."],"Ye sirf District Management ke liye hai.":["\u092f\u0939 \u0938\u093f\u0930\u094d\u092b\u093c \u091c\u093c\u093f\u0932\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0947 \u0932\u093f\u090f \u0939\u0948\u0964","This is only for District Management."],"Ye username pehle se liya hua hai. Doosra chunein.":["\u092f\u0939 \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u092a\u0939\u0932\u0947 \u0938\u0947 \u0932\u093f\u092f\u093e \u0939\u0941\u0906 \u0939\u0948\u0964 \u0926\u0942\u0938\u0930\u093e \u091a\u0941\u0928\u0947\u0902\u0964","This username is already taken. Choose another."],"Ye vyakti is bachche ke saath juda nahi hai.":["\u092f\u0939 \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0907\u0938 \u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0938\u093e\u0925 \u091c\u0941\u0921\u093c\u093e \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","This person is not linked to this child."],"Galat username ya password.":["\u0917\u093c\u0932\u0924 \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921\u0964","Wrong username or password."],"Username ya password galat hai.":["\u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0917\u093c\u0932\u0924 \u0939\u0948\u0964","Wrong username or password."],"Coordinator ka username ya password galat hai.":["\u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u0915\u093e \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0917\u093c\u0932\u0924 \u0939\u0948\u0964","Coordinator's username or password is wrong."],"Diya":["\u0926\u093f\u092f\u093e","Given"],"Full piya":["\u092a\u0942\u0930\u093e \u092a\u093f\u092f\u093e","Drank full"],"Half piya":["\u0906\u0927\u093e \u092a\u093f\u092f\u093e","Drank half"],"Quarter piya":["\u091a\u094c\u0925\u093e\u0908 \u092a\u093f\u092f\u093e","Drank quarter"],"override":["\u0913\u0935\u0930\u0930\u093e\u0907\u0921","override"],"Bachcha inhi mein se kisi ke saath centre aayega, aur doodh ke waqt inka chehra scan hoga. Pehle":["\u092c\u091a\u094d\u091a\u093e \u0907\u0928\u094d\u0939\u0940\u0902 \u092e\u0947\u0902 \u0938\u0947 \u0915\u093f\u0938\u0940 \u0915\u0947 \u0938\u093e\u0925 \u0915\u0947\u0902\u0926\u094d\u0930 \u0906\u090f\u0917\u093e, \u0914\u0930 \u0926\u0942\u0927 \u0915\u0947 \u0938\u092e\u092f \u0907\u0928\u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0938\u094d\u0915\u0948\u0928 \u0939\u094b\u0917\u093e\u0964 \u092a\u0939\u0932\u0947","The child will come to the centre with one of these people, and their face is scanned at milk time. First add the"],"ka chehra jodein, phir papa, dadi, nani\u2026":["\u0915\u093e \u091a\u0947\u0939\u0930\u093e \u091c\u094b\u0921\u093c\u0947\u0902, \u092b\u093f\u0930 \u092a\u093e\u092a\u093e, \u0926\u093e\u0926\u0940, \u0928\u093e\u0928\u0940\u2026","'s face, then father, grandmother\u2026"],"Jan":["\u091c\u0928","Jan"],"Feb":["\u092b\u093c\u0930","Feb"],"Mar":["\u092e\u093e\u0930\u094d\u091a","Mar"],"Apr":["\u0905\u092a\u094d\u0930\u0948\u0932","Apr"],"May":["\u092e\u0908","May"],"Jun":["\u091c\u0942\u0928","Jun"],"Jul":["\u091c\u0941\u0932","Jul"],"Aug":["\u0905\u0917","Aug"],"Sep":["\u0938\u093f\u0924","Sep"],"Oct":["\u0905\u0915\u094d\u091f\u0942","Oct"],"Nov":["\u0928\u0935","Nov"],"Dec":["\u0926\u093f\u0938","Dec"],"Bhasha badlo":["\u092d\u093e\u0937\u093e \u092c\u0926\u0932\u0947\u0902","Change language"],"\ud83d\udd11 Mera password badlo":["\ud83d\udd11 \u092e\u0947\u0930\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092c\u0926\u0932\u0947\u0902","\ud83d\udd11 Change my password"],"Password dikhao":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0926\u093f\u0916\u093e\u090f\u0901","Show password"],"Password badal gaya":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092c\u0926\u0932 \u0917\u092f\u093e","Password changed"],"Password nahi badla":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0928\u0939\u0940\u0902 \u092c\u0926\u0932\u093e","Password not changed"],"\ud83d\udd11 Password bhool gaye?":["\ud83d\udd11 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092d\u0942\u0932 \u0917\u090f?","\ud83d\udd11 Forgot password?"],"Password bhool gaye?":["\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092d\u0942\u0932 \u0917\u090f?","Forgot password?"],"Apna username aur account banate samay diya mobile number likhein.":["\u0905\u092a\u0928\u093e \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u0914\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u093e\u0924\u0947 \u0938\u092e\u092f \u0926\u093f\u092f\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0932\u093f\u0916\u0947\u0902\u0964","Enter your username and the mobile number you gave when creating the account."],"Mobile number":["\u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930","Mobile number"],"FC / District / Senior":["FC / \u091c\u093c\u093f\u0932\u093e / \u0935\u0930\u093f\u0937\u094d\u0920","FC / District / Senior"],"Aapki request District Management ke paas jayegi. Wo naya password set karke aapko batayenge.":["\u0906\u092a\u0915\u0940 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u091c\u093c\u093f\u0932\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0947 \u092a\u093e\u0938 \u091c\u093e\u090f\u0917\u0940\u0964 \u0935\u0947 \u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947\u091f \u0915\u0930\u0915\u0947 \u0906\u092a\u0915\u094b \u092c\u0924\u093e\u090f\u0901\u0917\u0947\u0964","Your request goes to District Management. They will set a new password and tell you."],"Access code (admin se mila)":["\u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 (\u090f\u0921\u092e\u093f\u0928 \u0938\u0947 \u092e\u093f\u0932\u093e)","Access code (from admin)"],"Request bhejo":["\u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c\u0947\u0902","Send request"],"Naya password set karo":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947\u091f \u0915\u0930\u0947\u0902","Set new password"],"Bhej rahe hain\u2026":["\u092d\u0947\u091c \u0930\u0939\u0947 \u0939\u0948\u0902\u2026","Sending\u2026"],"Username aur 10 ank ka mobile number likhein.":["\u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u0914\u0930 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0932\u093f\u0916\u0947\u0902\u0964","Enter the username and a 10-digit mobile number."],"Access code likhein.":["\u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0932\u093f\u0916\u0947\u0902\u0964","Enter the access code."],"Naya password set ho gaya":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947\u091f \u0939\u094b \u0917\u092f\u093e","New password set"],"Request bhej di":["\u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c \u0926\u0940","Request sent"],"District Management aapka naya password set karke aapko batayenge.":["\u091c\u093c\u093f\u0932\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0906\u092a\u0915\u093e \u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947\u091f \u0915\u0930\u0915\u0947 \u0906\u092a\u0915\u094b \u092c\u0924\u093e\u090f\u0901\u0917\u0947\u0964","District Management will set your new password and tell you."],"Username aur mobile number dono likhein.":["\u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u0914\u0930 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0926\u094b\u0928\u094b\u0902 \u0932\u093f\u0916\u0947\u0902\u0964","Enter both username and mobile number."],"Username aur mobile number match nahi hue.":["\u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u0914\u0930 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u092e\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093e\u090f\u0964","Username and mobile number do not match."],"Access code galat hai.":["\u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0917\u093c\u0932\u0924 \u0939\u0948\u0964","Access code is wrong."],"Milk Ambassador ke liye access code nahi chahiye. Khali chhod kar request bhejein.":["\u092e\u093f\u0932\u094d\u0915 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u0947 \u0932\u093f\u090f \u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921 \u0928\u0939\u0940\u0902 \u091a\u093e\u0939\u093f\u090f\u0964 \u0916\u093c\u093e\u0932\u0940 \u091b\u094b\u0921\u093c\u0915\u0930 \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u092d\u0947\u091c\u0947\u0902\u0964","Milk Ambassadors don't need an access code. Leave it empty and send a request."],"\ud83d\udd11 Password reset request":["\ud83d\udd11 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0930\u0940\u0938\u0947\u091f \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f","\ud83d\udd11 Password reset requests"],"logon ne password reset maanga hai.":["\u0932\u094b\u0917\u094b\u0902 \u0928\u0947 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0930\u0940\u0938\u0947\u091f \u092e\u093e\u0901\u0917\u093e \u0939\u0948\u0964","people asked for a password reset."],"Users / Accounts kholo":["\u092f\u0942\u091c\u093c\u0930 / \u0905\u0915\u093e\u0909\u0902\u091f \u0916\u094b\u0932\u0947\u0902","Open Users / Accounts"],"Apna username aur account banate samay diya mobile number likhein, phir naya password banayein.":["\u0905\u092a\u0928\u093e \u092f\u0942\u091c\u093c\u0930\u0928\u0947\u092e \u0914\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u093e\u0924\u0947 \u0938\u092e\u092f \u0926\u093f\u092f\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0932\u093f\u0916\u0947\u0902, \u092b\u093f\u0930 \u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092c\u0928\u093e\u090f\u0901\u0964","Enter your username and the mobile number you gave at sign-up, then create a new password."],"Naya password dobara":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0926\u094b\u092c\u093e\u0930\u093e","New password again"],"Naya password banao":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092c\u0928\u093e\u090f\u0901","Create new password"],"Dono password ek jaise nahi hain.":["\u0926\u094b\u0928\u094b\u0902 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u090f\u0915 \u091c\u0948\u0938\u0947 \u0928\u0939\u0940\u0902 \u0939\u0948\u0902\u0964","The two passwords do not match."],"Naya password ban gaya":["\u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092c\u0928 \u0917\u092f\u093e","New password created"],"Login karo":["\u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902","Log in"],"Doodh ke samay isi chehre se bachche ki pehchaan hogi. Seedha chehra, achhi roshni mein.":["\u0926\u0942\u0927 \u0915\u0947 \u0938\u092e\u092f \u0907\u0938\u0940 \u091a\u0947\u0939\u0930\u0947 \u0938\u0947 \u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u092a\u0939\u091a\u093e\u0928 \u0939\u094b\u0917\u0940\u0964 \u0938\u0940\u0927\u093e \u091a\u0947\u0939\u0930\u093e, \u0905\u091a\u094d\u091b\u0940 \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902\u0964","The child is identified with this face at milk time. Face straight, in good light."],"(optional \u00b7 Maa + 3 tak)":["(\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915 \u00b7 \u092e\u093e\u0901 + 3 \u0924\u0915)","(optional \u00b7 mother + up to 3)"],"Bachche ke saath aane wale":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0947 \u0938\u093e\u0925 \u0906\u0928\u0947 \u0935\u093e\u0932\u0947","People who come with the child"],"Zaroori nahi. Agar kabhi bachche ka chehra match na ho, to inka chehra scan karke bhi doodh entry ho sakti hai.":["\u091c\u093c\u0930\u0942\u0930\u0940 \u0928\u0939\u0940\u0902\u0964 \u0905\u0917\u0930 \u0915\u092d\u0940 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u092e\u0947\u0932 \u0928 \u0916\u093e\u090f, \u0924\u094b \u0907\u0928\u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0915\u0947 \u092d\u0940 \u0926\u0942\u0927 \u090f\u0902\u091f\u094d\u0930\u0940 \u0939\u094b \u0938\u0915\u0924\u0940 \u0939\u0948\u0964","Optional. If the child's face ever doesn't match, milk can also be recorded by scanning one of these faces."],"Saath aaye vyakti se (optional)":["\u0938\u093e\u0925 \u0906\u090f \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0938\u0947 (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)","Via accompanying person (optional)"],"\ud83d\udcf7 Bachche ka chehra scan karo":["\ud83d\udcf7 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902","\ud83d\udcf7 Scan child's face"],"Is bachche ka chehra registered nahi":["\u0907\u0938 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0926\u0930\u094d\u091c \u0928\u0939\u0940\u0902 \u0939\u0948","This child's face is not registered"],"Is bachche ka chehra save nahi hai. 'Wajan / Lambai' mein 'Bachche ki nayi photo' lekar chehra jodein, ya abhi 'Saath aaye vyakti se' entry karein.":["\u0907\u0938 \u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 '\u0935\u091c\u0928 / \u0932\u0902\u092c\u093e\u0908' \u092e\u0947\u0902 '\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u0928\u0908 \u092b\u093c\u094b\u091f\u094b' \u0932\u0947\u0915\u0930 \u091a\u0947\u0939\u0930\u093e \u091c\u094b\u0921\u093c\u0947\u0902, \u092f\u093e \u0905\u092d\u0940 '\u0938\u093e\u0925 \u0906\u090f \u0935\u094d\u092f\u0915\u094d\u0924\u093f \u0938\u0947' \u090f\u0902\u091f\u094d\u0930\u0940 \u0915\u0930\u0947\u0902\u0964","This child's face is not saved. Add it via 'Weight / Height' \u2192 'New photo of child', or record now via the accompanying person."],"Bachche ki photo mein chehra nahi mila. Seedha chehra, roshni mein dobara photo lein.":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u092b\u093c\u094b\u091f\u094b \u092e\u0947\u0902 \u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964 \u0938\u0940\u0927\u093e \u091a\u0947\u0939\u0930\u093e, \u0930\u094b\u0936\u0928\u0940 \u092e\u0947\u0902 \u0926\u094b\u092c\u093e\u0930\u093e \u092b\u093c\u094b\u091f\u094b \u0932\u0947\u0902\u0964","No face found in the child's photo. Retake with the face straight, in good light."],"Data Archive":["\u0921\u0947\u091f\u093e \u0906\u0930\u094d\u0915\u093e\u0907\u0935","Data Archive"],"Purani doodh entries alag Sheet mein":["\u092a\u0941\u0930\u093e\u0928\u0940 \u0926\u0942\u0927 \u090f\u0902\u091f\u094d\u0930\u0940 \u0905\u0932\u0917 \u0936\u0940\u091f \u092e\u0947\u0902","Move old milk entries to a separate Sheet"],"Purana data archive":["\u092a\u0941\u0930\u093e\u0928\u093e \u0921\u0947\u091f\u093e \u0906\u0930\u094d\u0915\u093e\u0907\u0935","Archive old data"],"Kitna purana data nikalna hai?":["\u0915\u093f\u0924\u0928\u093e \u092a\u0941\u0930\u093e\u0928\u093e \u0921\u0947\u091f\u093e \u0928\u093f\u0915\u093e\u0932\u0928\u093e \u0939\u0948?","How old should the data be?"],"1 mahine se purana":["1 \u092e\u0939\u0940\u0928\u0947 \u0938\u0947 \u092a\u0941\u0930\u093e\u0928\u093e","Older than 1 month"],"2 mahine se purana":["2 \u092e\u0939\u0940\u0928\u0947 \u0938\u0947 \u092a\u0941\u0930\u093e\u0928\u093e","Older than 2 months"],"3 mahine se purana":["3 \u092e\u0939\u0940\u0928\u0947 \u0938\u0947 \u092a\u0941\u0930\u093e\u0928\u093e","Older than 3 months"],"6 mahine se purana":["6 \u092e\u0939\u0940\u0928\u0947 \u0938\u0947 \u092a\u0941\u0930\u093e\u0928\u093e","Older than 6 months"],"Tareekh chunein\u2026":["\u0924\u093e\u0930\u0940\u0916\u093c \u091a\u0941\u0928\u0947\u0902\u2026","Choose a date\u2026"],"Is tareekh se pehle ka":["\u0907\u0938 \u0924\u093e\u0930\u0940\u0916\u093c \u0938\u0947 \u092a\u0939\u0932\u0947 \u0915\u093e","Before this date"],"Wajan / lambai entries bhi nikalo":["\u0935\u091c\u0928 / \u0932\u0902\u092c\u093e\u0908 \u090f\u0902\u091f\u094d\u0930\u0940 \u092d\u0940 \u0928\u093f\u0915\u093e\u0932\u0947\u0902","Also move weight / height entries"],"Na chunein to growth ka poora itihas app mein bana rahega (graph aur badlav ke liye behtar).":["\u0928 \u091a\u0941\u0928\u0947\u0902 \u0924\u094b \u0935\u0943\u0926\u094d\u0927\u093f \u0915\u093e \u092a\u0942\u0930\u093e \u0907\u0924\u093f\u0939\u093e\u0938 \u0910\u092a \u092e\u0947\u0902 \u092c\u0928\u093e \u0930\u0939\u0947\u0917\u093e (\u0917\u094d\u0930\u093e\u092b\u093c \u0914\u0930 \u092c\u0926\u0932\u093e\u0935 \u0915\u0947 \u0932\u093f\u090f \u092c\u0947\u0939\u0924\u0930)\u0964","If not chosen, the full growth history stays in the app (better for graphs and change)."],"1. Pehle dekho kitna data hai":["1. \u092a\u0939\u0932\u0947 \u0926\u0947\u0916\u0947\u0902 \u0915\u093f\u0924\u0928\u093e \u0921\u0947\u091f\u093e \u0939\u0948","1. First see how much data"],"2. Archive karo":["2. \u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0915\u0930\u0947\u0902","2. Archive"],"Pehle bane archive":["\u092a\u0939\u0932\u0947 \u092c\u0928\u0947 \u0906\u0930\u094d\u0915\u093e\u0907\u0935","Archives made earlier"],"Drive folder kholo":["\u0921\u094d\u0930\u093e\u0907\u0935 \u092b\u093c\u094b\u0932\u094d\u0921\u0930 \u0916\u094b\u0932\u0947\u0902","Open Drive folder"],"Abhi koi archive nahi bana.":["\u0905\u092d\u0940 \u0915\u094b\u0908 \u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0928\u0939\u0940\u0902 \u092c\u0928\u093e\u0964","No archive made yet."],"Gin rahe hain\u2026":["\u0917\u093f\u0928 \u0930\u0939\u0947 \u0939\u0948\u0902\u2026","Counting\u2026"],"Is tareekh se pehle ka koi data nahi hai.":["\u0907\u0938 \u0924\u093e\u0930\u0940\u0916\u093c \u0938\u0947 \u092a\u0939\u0932\u0947 \u0915\u093e \u0915\u094b\u0908 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","There is no data before this date."],"Archive karein?":["\u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0915\u0930\u0947\u0902?","Archive now?"],"Haan, archive karo":["\u0939\u093e\u0901, \u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0915\u0930\u0947\u0902","Yes, archive"],"Archive ho raha hai\u2026":["\u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0939\u094b \u0930\u0939\u093e \u0939\u0948\u2026","Archiving\u2026"],"Archive ho gaya":["\u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0939\u094b \u0917\u092f\u093e","Archive done"],"Archive Sheet kholo":["\u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0936\u0940\u091f \u0916\u094b\u0932\u0947\u0902","Open archive Sheet"],"Archive nahi hua":["\u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906","Archive failed"],"Tareekh chunein.":["\u0924\u093e\u0930\u0940\u0916\u093c \u091a\u0941\u0928\u0947\u0902\u0964","Choose a date."],"Aane wali tareekh nahi chun sakte.":["\u0906\u0928\u0947 \u0935\u093e\u0932\u0940 \u0924\u093e\u0930\u0940\u0916\u093c \u0928\u0939\u0940\u0902 \u091a\u0941\u0928 \u0938\u0915\u0924\u0947\u0964","You cannot choose a future date."],"Archive copy poori nahi bani. Main data nahi hataya gaya. Dobara koshish karein.":["\u0906\u0930\u094d\u0915\u093e\u0907\u0935 \u0915\u0949\u092a\u0940 \u092a\u0942\u0930\u0940 \u0928\u0939\u0940\u0902 \u092c\u0928\u0940\u0964 \u092e\u0941\u0916\u094d\u092f \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902 \u0939\u091f\u093e\u092f\u093e \u0917\u092f\u093e\u0964 \u0926\u094b\u092c\u093e\u0930\u093e \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964","The archive copy was incomplete. Main data was not removed. Please try again."],"Bachche ki list":["\u092c\u091a\u094d\u091a\u094b\u0902 \u0915\u0940 \u0938\u0942\u091a\u0940","Children list"],"Sudhaar \u00b7 sthiti badlo":["\u0938\u0941\u0927\u093e\u0930 \u00b7 \u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932\u0947\u0902","Edit \u00b7 change status"],"AWC ki entries aur report":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0914\u0930 \u0930\u093f\u092a\u094b\u0930\u094d\u091f","AWC entries and report"],"Galat naam, janm tithi ya mobile theek karein. Bachcha chala gaya ho ya umr poori ho gayi ho to sthiti badlein: wo doodh list se hat jayega, par record rahega.":["\u0917\u093c\u0932\u0924 \u0928\u093e\u092e, \u091c\u0928\u094d\u092e \u0924\u093f\u0925\u093f \u092f\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0920\u0940\u0915 \u0915\u0930\u0947\u0902\u0964 \u092c\u091a\u094d\u091a\u093e \u091a\u0932\u093e \u0917\u092f\u093e \u0939\u094b \u092f\u093e \u0909\u092e\u094d\u0930 \u092a\u0942\u0930\u0940 \u0939\u094b \u0917\u0908 \u0939\u094b \u0924\u094b \u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932\u0947\u0902: \u0935\u0939 \u0926\u0942\u0927 \u0938\u0942\u091a\u0940 \u0938\u0947 \u0939\u091f \u091c\u093e\u090f\u0917\u093e, \u092a\u0930 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0930\u0939\u0947\u0917\u093e\u0964","Fix a wrong name, date of birth or mobile. If a child has left or aged out, change the status: they leave the milk list but the record stays."],"Bachche / maa ka naam ya mobile":["\u092c\u091a\u094d\u091a\u0947 / \u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e \u092f\u093e \u092e\u094b\u092c\u093e\u0907\u0932","Child / mother name or mobile"],"Band / hataye bachche bhi dikhao":["\u092c\u0902\u0926 / \u0939\u091f\u093e\u090f \u092c\u091a\u094d\u091a\u0947 \u092d\u0940 \u0926\u093f\u0916\u093e\u090f\u0901","Also show inactive children"],"Bachche ki jaankari":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940","Child details"],"Bachche ka naam":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0928\u093e\u092e","Child's name"],"Maa ka naam":["\u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e","Mother's name"],"Janm tithi":["\u091c\u0928\u094d\u092e \u0924\u093f\u0925\u093f","Date of birth"],"Sthiti":["\u0938\u094d\u0925\u093f\u0924\u093f","Status"],"Kaaran *":["\u0915\u093e\u0930\u0923 *","Reason *"],"Jaise: parivar Ranchi chala gaya":["\u091c\u0948\u0938\u0947: \u092a\u0930\u093f\u0935\u093e\u0930 \u0930\u093e\u0901\u091a\u0940 \u091a\u0932\u093e \u0917\u092f\u093e","e.g. family moved to Ranchi"],"Badlo \u203a":["\u092c\u0926\u0932\u0947\u0902 \u203a","Edit \u203a"],"Janm tithi nahi":["\u091c\u0928\u094d\u092e \u0924\u093f\u0925\u093f \u0928\u0939\u0940\u0902","No date of birth"],"\u26a0 umr-seema ke bahar":["\u26a0 \u0909\u092e\u094d\u0930-\u0938\u0940\u092e\u093e \u0915\u0947 \u092c\u093e\u0939\u0930","\u26a0 outside age range"],"\u26a0 umr":["\u26a0 \u0909\u092e\u094d\u0930","\u26a0 age"],"chehra nahi":["\u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902","no face"],"Gaon/AWC chhod diya":["\u0917\u093e\u0901\u0935/\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091b\u094b\u0921\u093c \u0926\u093f\u092f\u093e","Left village/AWC"],"Umr poori":["\u0909\u092e\u094d\u0930 \u092a\u0942\u0930\u0940","Aged out"],"Galti se / duplicate bana":["\u0917\u093c\u0932\u0924\u0940 \u0938\u0947 / \u0921\u0941\u092a\u094d\u0932\u0940\u0915\u0947\u091f \u092c\u0928\u093e","Created by mistake / duplicate"],"Mrityu":["\u092e\u0943\u0924\u094d\u092f\u0941","Died"],"Kaaran likhein (jaise kahan chale gaye).":["\u0915\u093e\u0930\u0923 \u0932\u093f\u0916\u0947\u0902 (\u091c\u0948\u0938\u0947 \u0915\u0939\u093e\u0901 \u091a\u0932\u0947 \u0917\u090f)\u0964","Write the reason (e.g. where they moved)."],"Bachche ka naam aur maa ka naam bharein.":["\u092c\u091a\u094d\u091a\u0947 \u0915\u093e \u0928\u093e\u092e \u0914\u0930 \u092e\u093e\u0901 \u0915\u093e \u0928\u093e\u092e \u092d\u0930\u0947\u0902\u0964","Fill in the child's and mother's names."],"Bachche ki jaankari update ho gayi \u2713":["\u092c\u091a\u094d\u091a\u0947 \u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u0908 \u2713","Child details updated \u2713"],"Janm tithi sahi chunein.":["\u091c\u0928\u094d\u092e \u0924\u093f\u0925\u093f \u0938\u0939\u0940 \u091a\u0941\u0928\u0947\u0902\u0964","Choose a valid date of birth."],"Sthiti sahi chunein.":["\u0938\u094d\u0925\u093f\u0924\u093f \u0938\u0939\u0940 \u091a\u0941\u0928\u0947\u0902\u0964","Choose a valid status."],"Ye bachcha aapke AWC ka nahi hai.":["\u092f\u0939 \u092c\u091a\u094d\u091a\u093e \u0906\u092a\u0915\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u093e \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","This child is not in your AWC."],"Aapke account mein ye AWC nahi hai.":["\u0906\u092a\u0915\u0947 \u0905\u0915\u093e\u0909\u0902\u091f \u092e\u0947\u0902 \u092f\u0939 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","This AWC is not in your account."],"Aapke role mein ye anumati nahi hai.":["\u0906\u092a\u0915\u0940 \u092d\u0942\u092e\u093f\u0915\u093e \u092e\u0947\u0902 \u092f\u0939 \u0905\u0928\u0941\u092e\u0924\u093f \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Your role does not allow this."],"Umr niyam ke bahar":["\u0909\u092e\u094d\u0930 \u0928\u093f\u092f\u092e \u0915\u0947 \u092c\u093e\u0939\u0930","Age outside the rule"],"Haan, register karo":["\u0939\u093e\u0901, \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902","Yes, register"],"Nahi, tareekh theek karo":["\u0928\u0939\u0940\u0902, \u0924\u093e\u0930\u0940\u0916\u093c \u0920\u0940\u0915 \u0915\u0930\u0947\u0902","No, fix the date"],"Phone mein save hua (offline)":["\u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u0938\u0947\u0935 \u0939\u0941\u0906 (\u0911\u092b\u093c\u0932\u093e\u0907\u0928)","Saved on phone (offline)"],"Abhi bhejo":["\u0905\u092d\u0940 \u092d\u0947\u091c\u0947\u0902","Send now"],"Offline entry bhej rahe hain\u2026":["\u0911\u092b\u093c\u0932\u093e\u0907\u0928 \u090f\u0902\u091f\u094d\u0930\u0940 \u092d\u0947\u091c \u0930\u0939\u0947 \u0939\u0948\u0902\u2026","Sending offline entries\u2026"],"\ud83d\udcf4 Internet nahi hai \u00b7 doodh entry phone mein save hogi":["\ud83d\udcf4 \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u0928\u0939\u0940\u0902 \u0939\u0948 \u00b7 \u0926\u0942\u0927 \u090f\u0902\u091f\u094d\u0930\u0940 \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u0938\u0947\u0935 \u0939\u094b\u0917\u0940","\ud83d\udcf4 No internet \u00b7 milk entries will be saved on the phone"],"Bhejne ke liye koi entry nahi.":["\u092d\u0947\u091c\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u094b\u0908 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902\u0964","No entries to send."],"Abhi bhi internet nahi hai.":["\u0905\u092d\u0940 \u092d\u0940 \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u0928\u0939\u0940\u0902 \u0939\u0948\u0964","Still no internet."],"\ud83d\udcf4 Offline: phone mein rakhi list":["\ud83d\udcf4 \u0911\u092b\u093c\u0932\u093e\u0907\u0928: \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u0930\u0916\u0940 \u0938\u0942\u091a\u0940","\ud83d\udcf4 Offline: list saved on the phone"],"Milk Ambassadors aaj":["\u092e\u093f\u0932\u094d\u0915 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0906\u091c","Milk Ambassadors today"],"\"Pending\" = bina internet ke bhari entry jo abhi MA ke phone mein hai. MA ko app kholkar internet par \"Abhi bhejo\" dabane ko kahein.":["\"\u092a\u0947\u0902\u0921\u093f\u0902\u0917\" = \u092c\u093f\u0928\u093e \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u092d\u0930\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u091c\u094b \u0905\u092d\u0940 MA \u0915\u0947 \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u0939\u0948\u0964 MA \u0915\u094b \u0910\u092a \u0916\u094b\u0932\u0915\u0930 \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u092a\u0930 \"\u0905\u092d\u0940 \u092d\u0947\u091c\u0947\u0902\" \u0926\u092c\u093e\u0928\u0947 \u0915\u094b \u0915\u0939\u0947\u0902\u0964","\"Pending\" = entries made without internet that are still on the MA's phone. Ask the MA to open the app online and tap \"Send now\"."],"Kisi ke phone mein pending entry nahi \u2713":["\u0915\u093f\u0938\u0940 \u0915\u0947 \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u092a\u0947\u0902\u0921\u093f\u0902\u0917 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902 \u2713","No pending entries on any phone \u2713"],"Abhi koi bachcha registered nahi":["\u0905\u092d\u0940 \u0915\u094b\u0908 \u092c\u091a\u094d\u091a\u093e \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0928\u0939\u0940\u0902","No children registered yet"],"\ud83d\udccd AWC tag karo":["\ud83d\udccd AWC \u091f\u0948\u0917 \u0915\u0930\u0947\u0902","\ud83d\udccd Tag AWCs"],"Poora sector tick karein (us sector ki sab AWC), ya sirf kuch AWC chunein. Ek AWC kai FC ko bhi tag ho sakti hai.":["\u092a\u0942\u0930\u093e \u0938\u0947\u0915\u094d\u091f\u0930 \u091f\u093f\u0915 \u0915\u0930\u0947\u0902 (\u0909\u0938 \u0938\u0947\u0915\u094d\u091f\u0930 \u0915\u0940 \u0938\u092c \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940), \u092f\u093e \u0938\u093f\u0930\u094d\u092b\u093c \u0915\u0941\u091b \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0947\u0902\u0964 \u090f\u0915 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u0908 FC \u0915\u094b \u092d\u0940 \u091f\u0948\u0917 \u0939\u094b \u0938\u0915\u0924\u0940 \u0939\u0948\u0964","Tick a whole sector (all its AWCs), or pick only some AWCs. One AWC can be tagged to several FCs."],"Is Milk Ambassador ki AWC chunein.":["\u0907\u0938 \u092e\u093f\u0932\u094d\u0915 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0947\u0902\u0964","Choose this Milk Ambassador's AWCs."],"AWC sirf Field Coordinator ya Milk Ambassador ko tag hote hain.":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0938\u093f\u0930\u094d\u092b\u093c \u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u092f\u093e \u092e\u093f\u0932\u094d\u0915 \u090f\u092e\u094d\u092c\u0947\u0938\u0921\u0930 \u0915\u094b \u091f\u0948\u0917 \u0939\u094b\u0924\u0940 \u0939\u0948\u0902\u0964","AWCs can only be tagged to a Field Coordinator or Milk Ambassador."],"Doosre FC jaisi AWC lo":["\u0926\u0942\u0938\u0930\u0947 FC \u091c\u0948\u0938\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0932\u0947\u0902","Copy AWCs from another FC"],"Copy karo":["\u0915\u0949\u092a\u0940 \u0915\u0930\u0947\u0902","Copy"],"Excel se AWC code / naam paste karo":["Excel \u0938\u0947 AWC \u0915\u094b\u0921 / \u0928\u093e\u092e \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0947\u0902","Paste AWC codes / names from Excel"],"Excel se AWC Code (ya AWC Name) wala column copy karke yahan paste karein":["Excel \u0938\u0947 AWC Code (\u092f\u093e AWC Name) \u0935\u093e\u0932\u093e \u0915\u0949\u0932\u092e \u0915\u0949\u092a\u0940 \u0915\u0930\u0915\u0947 \u092f\u0939\u093e\u0901 \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0947\u0902","Copy the AWC Code (or AWC Name) column from Excel and paste it here"],"Inko tick karo":["\u0907\u0928\u094d\u0939\u0947\u0902 \u091f\u093f\u0915 \u0915\u0930\u0947\u0902","Tick these"],"Sab hatao":["\u0938\u092c \u0939\u091f\u093e\u090f\u0901","Clear all"],"AWC list":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0938\u0942\u091a\u0940","AWC list"],"Doodh wali AWC \u00b7 nayi AWC jodo":["\u0926\u0942\u0927 \u0935\u093e\u0932\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u00b7 \u0928\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091c\u094b\u0921\u093c\u0947\u0902","Milk AWCs \u00b7 add new AWC"],"Naam, code, sector ya panchayat":["\u0928\u093e\u092e, \u0915\u094b\u0921, \u0938\u0947\u0915\u094d\u091f\u0930 \u092f\u093e \u092a\u0902\u091a\u093e\u092f\u0924","Name, code, sector or panchayat"],"Sab":["\u0938\u092c","All"],"+ Nayi AWC jodo":["+ \u0928\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091c\u094b\u0921\u093c\u0947\u0902","+ Add new AWC"],"AWC ka naam *":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u093e \u0928\u093e\u092e *","AWC name *"],"Jaise: Pithra Tetartoli":["\u091c\u0948\u0938\u0947: Pithra Tetartoli","e.g. Pithra Tetartoli"],"AWC code (11 ank, na pata ho to khali chhodein)":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u094b\u0921 (11 \u0905\u0902\u0915, \u092a\u0924\u093e \u0928 \u0939\u094b \u0924\u094b \u0916\u093c\u093e\u0932\u0940 \u091b\u094b\u0921\u093c\u0947\u0902)","AWC code (11 digits, leave empty if unknown)"],"Sector *":["\u0938\u0947\u0915\u094d\u091f\u0930 *","Sector *"],"Panchayat / ward":["\u092a\u0902\u091a\u093e\u092f\u0924 / \u0935\u093e\u0930\u094d\u0921","Panchayat / ward"],"Jaise: Tamra / Ward no 3":["\u091c\u0948\u0938\u0947: Tamra / Ward no 3","e.g. Tamra / Ward no 3"],"Area":["\u0915\u094d\u0937\u0947\u0924\u094d\u0930","Area"],"Phase":["\u092b\u093c\u0947\u091c\u093c","Phase"],"Excel se AWC code paste karke chalu karo":["Excel \u0938\u0947 AWC \u0915\u094b\u0921 \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0915\u0947 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902","Paste AWC codes from Excel to turn on"],"AWC Code wala column copy karke yahan paste karein":["AWC Code \u0935\u093e\u0932\u093e \u0915\u0949\u0932\u092e \u0915\u0949\u092a\u0940 \u0915\u0930\u0915\u0947 \u092f\u0939\u093e\u0901 \u092a\u0947\u0938\u094d\u091f \u0915\u0930\u0947\u0902","Copy the AWC Code column and paste here"],"Inko bhi chalu karo":["\u0907\u0928\u094d\u0939\u0947\u0902 \u092d\u0940 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902","Also turn these on"],"Sirf yahi chalu rakho":["\u0938\u093f\u0930\u094d\u092b\u093c \u092f\u0939\u0940 \u091a\u093e\u0932\u0942 \u0930\u0916\u0947\u0902","Keep only these on"],"Koi sahi AWC code nahi mila.":["\u0915\u094b\u0908 \u0938\u0939\u0940 AWC \u0915\u094b\u0921 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964","No valid AWC code found."],"Sirf ye AWC chalu rakhein?":["\u0938\u093f\u0930\u094d\u092b\u093c \u092f\u0947 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u093e\u0932\u0942 \u0930\u0916\u0947\u0902?","Keep only these AWCs on?"],"Haan, yahi rakho":["\u0939\u093e\u0901, \u092f\u0939\u0940 \u0930\u0916\u0947\u0902","Yes, keep these"],"Koi AWC nahi mili.":["\u0915\u094b\u0908 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964","No AWC found."],"Badlo":["\u092c\u0926\u0932\u0947\u0902","Edit"],"AWC ka naam likhein.":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u093e \u0928\u093e\u092e \u0932\u093f\u0916\u0947\u0902\u0964","Enter the AWC name."],"Sector chunein.":["\u0938\u0947\u0915\u094d\u091f\u0930 \u091a\u0941\u0928\u0947\u0902\u0964","Choose a sector."],"AWC code sirf ank mein ho (jaise 20367060101).":["AWC \u0915\u094b\u0921 \u0938\u093f\u0930\u094d\u092b\u093c \u0905\u0902\u0915\u094b\u0902 \u092e\u0947\u0902 \u0939\u094b (\u091c\u0948\u0938\u0947 20367060101)\u0964","AWC code must be digits only (e.g. 20367060101)."],"Is sector mein isi naam ki AWC pehle se hai.":["\u0907\u0938 \u0938\u0947\u0915\u094d\u091f\u0930 \u092e\u0947\u0902 \u0907\u0938\u0940 \u0928\u093e\u092e \u0915\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092a\u0939\u0932\u0947 \u0938\u0947 \u0939\u0948\u0964","An AWC with this name already exists in this sector."],"AWC nahi mili.":["\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964","AWC not found."],"Naam likhein \u2014 sarkari list se chun bhi sakte hain":["\u0928\u093e\u092e \u0932\u093f\u0916\u0947\u0902 \u2014 \u0938\u0930\u0915\u093e\u0930\u0940 \u0938\u0942\u091a\u0940 \u0938\u0947 \u091a\u0941\u0928 \u092d\u0940 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902","Type a name \u2014 or pick from the government list"],"\u23f8 Band \u2014 yahan doodh abhi shuru nahi hua (switch se chalu karein)":["\u23f8 \u092c\u0902\u0926 \u2014 \u092f\u0939\u093e\u0901 \u0926\u0942\u0927 \u0905\u092d\u0940 \u0936\u0941\u0930\u0942 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906 (\u0938\u094d\u0935\u093f\u091a \u0938\u0947 \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902)","\u23f8 Off \u2014 milk not started here yet (turn on with the switch)"],"Ye program ki AWC hain. Sirf chalu AWC app mein dikhti hain (sign-up, doodh, registration, FC tag). Jahan doodh abhi shuru nahi hua, use band karo: wo neeche \"Band\" mein rahegi aur switch se kabhi bhi chalu kar sakte ho.":["\u092f\u0947 \u092a\u094d\u0930\u094b\u0917\u094d\u0930\u093e\u092e \u0915\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0939\u0948\u0902\u0964 \u0938\u093f\u0930\u094d\u092b\u093c \u091a\u093e\u0932\u0942 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0910\u092a \u092e\u0947\u0902 \u0926\u093f\u0916\u0924\u0940 \u0939\u0948\u0902 (\u0938\u093e\u0907\u0928-\u0905\u092a, \u0926\u0942\u0927, \u092a\u0902\u091c\u0940\u0915\u0930\u0923, FC \u091f\u0948\u0917)\u0964 \u091c\u0939\u093e\u0901 \u0926\u0942\u0927 \u0905\u092d\u0940 \u0936\u0941\u0930\u0942 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906, \u0909\u0938\u0947 \u092c\u0902\u0926 \u0915\u0930\u0947\u0902: \u0935\u0939 \u0928\u0940\u091a\u0947 \"\u092c\u0902\u0926\" \u092e\u0947\u0902 \u0930\u0939\u0947\u0917\u0940 \u0914\u0930 \u0938\u094d\u0935\u093f\u091a \u0938\u0947 \u0915\u092d\u0940 \u092d\u0940 \u091a\u093e\u0932\u0942 \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964","These are the programme AWCs. Only AWCs that are on appear in the app (sign-up, milk, registration, FC tags). Where milk has not started, turn it off: it stays below under \"Off\" and can be turned on any time."],"\ud83d\udc64 Is AWC ke Field Coordinator":["\ud83d\udc64 \u0907\u0938 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u0947 \u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930","\ud83d\udc64 Field Coordinators of this AWC"],"Jitne FC is AWC ko dekhenge, sab par tick karein (ek AWC kai FC ki ho sakti hai).":["\u091c\u093f\u0924\u0928\u0947 FC \u0907\u0938 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u094b \u0926\u0947\u0916\u0947\u0902\u0917\u0947, \u0938\u092c \u092a\u0930 \u091f\u093f\u0915 \u0915\u0930\u0947\u0902 (\u090f\u0915 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u0908 FC \u0915\u0940 \u0939\u094b \u0938\u0915\u0924\u0940 \u0939\u0948)\u0964","Tick every FC who will look after this AWC (one AWC can have several FCs)."],"Abhi koi FC account nahi":["\u0905\u092d\u0940 \u0915\u094b\u0908 FC \u0905\u0915\u093e\u0909\u0902\u091f \u0928\u0939\u0940\u0902","No FC accounts yet"],"Pehle Field Coordinator app mein 'Create user ID' se apna account banayein (role: Field Coordinator, admin ka access code). Phir yahan unka naam aayega.":["\u092a\u0939\u0932\u0947 \u092b\u093c\u0940\u0932\u094d\u0921 \u0915\u094b\u0911\u0930\u094d\u0921\u093f\u0928\u0947\u091f\u0930 \u0910\u092a \u092e\u0947\u0902 'Create user ID' \u0938\u0947 \u0905\u092a\u0928\u093e \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u093e\u090f\u0901 (\u0930\u094b\u0932: Field Coordinator, \u090f\u0921\u092e\u093f\u0928 \u0915\u093e \u090f\u0915\u094d\u0938\u0947\u0938 \u0915\u094b\u0921)\u0964 \u092b\u093f\u0930 \u092f\u0939\u093e\u0901 \u0909\u0928\u0915\u093e \u0928\u093e\u092e \u0906\u090f\u0917\u093e\u0964","First, Field Coordinators should create their accounts in the app with 'Create user ID' (role: Field Coordinator, admin access code). Their names will then appear here."],"FC: koi nahi":["FC: \u0915\u094b\u0908 \u0928\u0939\u0940\u0902","FC: none"]};
const I18N_RX = [[new RegExp("^(Suprabhat|Namaste|Shubh sandhya), (.+)$"), "{G}, $2", "{G}, $2"],
[new RegExp("^(\\d+) / (\\d+) ko aaj doodh mil chuka hai\\.$"), "$1 / $2 \u092c\u091a\u094d\u091a\u094b\u0902 \u0915\u094b \u0906\u091c \u0926\u0942\u0927 \u092e\u093f\u0932 \u091a\u0941\u0915\u093e \u0939\u0948\u0964", "$1 / $2 children have got milk today."],
[new RegExp("^\u2014 Bachcha chunein \\((\\d+)\\) \u2014$"), "\u2014 \u092c\u091a\u094d\u091a\u093e \u091a\u0941\u0928\u0947\u0902 ($1) \u2014", "\u2014 Choose child ($1) \u2014"],
[new RegExp("^Pichhle record \\((\\d+)\\)$"), "\u092a\u093f\u091b\u0932\u0947 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 ($1)", "Previous records ($1)"],
[new RegExp("^Ye entry is mahine ki hogi: (.+)$"), "\u092f\u0939 \u090f\u0902\u091f\u094d\u0930\u0940 \u0907\u0938 \u092e\u0939\u0940\u0928\u0947 \u0915\u0940 \u0939\u094b\u0917\u0940: $1", "This entry is for the month: $1"],
[new RegExp("^Ye entry is quarter ki hogi: (.+)$"), "\u092f\u0939 \u090f\u0902\u091f\u094d\u0930\u0940 \u0907\u0938 \u0924\u093f\u092e\u093e\u0939\u0940 \u0915\u0940 \u0939\u094b\u0917\u0940: $1", "This entry is for the quarter: $1"],
[new RegExp("^(\\d+) / (\\d+) aaj$"), "$1 / $2 \u0906\u091c", "$1 / $2 today"],
[new RegExp("^(.+) ko aaj doodh pehle hi diya ja chuka hai\\.$"), "$1 \u0915\u094b \u0906\u091c \u0926\u0942\u0927 \u092a\u0939\u0932\u0947 \u0939\u0940 \u0926\u093f\u092f\u093e \u091c\u093e \u091a\u0941\u0915\u093e \u0939\u0948\u0964", "$1 has already been given milk today."],
[new RegExp("^Is (quarter|mahine) ka record pehle se hai$"), "\u0907\u0938 {Q} \u0915\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u092a\u0939\u0932\u0947 \u0938\u0947 \u0939\u0948", "A record for this {QE} already exists"],
[new RegExp("^(\\d+) bachchon ka growth record \u00b7 is samay mein (\\d+) naape gaye(?: \u00b7 (\\d+) ki abhi ek hi entry)?$"), "$1 \u092c\u091a\u094d\u091a\u094b\u0902 \u0915\u093e \u0935\u0943\u0926\u094d\u0927\u093f \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u00b7 \u0907\u0938 \u0938\u092e\u092f \u092e\u0947\u0902 $2 \u0928\u093e\u092a\u0947 \u0917\u090f{ONE}", "Growth records of $1 children \u00b7 $2 measured in this period{ONEE}"],
[new RegExp("^(\\d+) bachchon ka pichhli entry se mukabla(?: \u00b7 (\\d+) bachchon ki abhi ek hi entry hai)?$"), "$1 \u092c\u091a\u094d\u091a\u094b\u0902 \u0915\u0940 \u092a\u093f\u091b\u0932\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0947 \u0924\u0941\u0932\u0928\u093e", "$1 children compared with their previous entry"],
[new RegExp("^(\\d+) entry$"), "$1 \u090f\u0902\u091f\u094d\u0930\u0940", "$1 entries"],
[new RegExp("^(\\d+) second mein Home\\)$"), "$1 \u0938\u0947\u0915\u0902\u0921 \u092e\u0947\u0902 \u0939\u094b\u092e)", "home in $1 seconds)"],
[new RegExp("^Download: (.+)$"), "\u0921\u093e\u0909\u0928\u0932\u094b\u0921: $1", "Download: $1"],
[new RegExp("^Save hua: (.+)$"), "\u0938\u0947\u0935 \u0939\u0941\u0906: $1", "Saved: $1"],
[new RegExp("^User ID ban gaya: (.+)$"), "\u092f\u0942\u091c\u093c\u0930 ID \u092c\u0928 \u0917\u0908: $1", "User ID created: $1"],
[new RegExp("^Bahut baar galat password daala gaya\\. Ye account (\\d+) minute ke liye band hai\\. Baad mein koshish karein\\.$"), "\u092c\u0939\u0941\u0924 \u092c\u093e\u0930 \u0917\u093c\u0932\u0924 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0921\u093e\u0932\u093e \u0917\u092f\u093e\u0964 \u092f\u0939 \u0905\u0915\u093e\u0909\u0902\u091f $1 \u092e\u093f\u0928\u091f \u0915\u0947 \u0932\u093f\u090f \u092c\u0902\u0926 \u0939\u0948\u0964 \u092c\u093e\u0926 \u092e\u0947\u0902 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964", "Too many wrong passwords. This account is locked for $1 minutes. Try again later."],
[new RegExp("^(\\d+) baar galat password\\. Account (\\d+) minute ke liye band kar diya gaya hai\\.$"), "$1 \u092c\u093e\u0930 \u0917\u093c\u0932\u0924 \u092a\u093e\u0938\u0935\u0930\u094d\u0921\u0964 \u0905\u0915\u093e\u0909\u0902\u091f $2 \u092e\u093f\u0928\u091f \u0915\u0947 \u0932\u093f\u090f \u092c\u0902\u0926 \u0915\u0930 \u0926\u093f\u092f\u093e \u0917\u092f\u093e \u0939\u0948\u0964", "$1 wrong passwords. The account has been locked for $2 minutes."],
[new RegExp("^Aaj: (.+)$"), "\u0906\u091c: $1", "Today: $1"],
[new RegExp("^(.+) ka chehra mila$"), "$1 \u0915\u093e \u091a\u0947\u0939\u0930\u093e \u092e\u093f\u0932\u093e", "$1's face matched"],
[new RegExp("^Pichhle \\((.+)\\) se: (.+)$"), "\u092a\u093f\u091b\u0932\u0947 ($1) \u0938\u0947: $2", "Since previous ($1): $2"],
[new RegExp("^Maa: (.+)$"), "\u092e\u093e\u0901: $1", "Mother: $1"],
[new RegExp("^(Username ya password galat hai\\.|Coordinator ka username ya password galat hai\\.) (\\d+) koshish baaki, uske baad account (\\d+) minute ke liye band ho jayega\\.$"), "{W} $2 \u0915\u094b\u0936\u093f\u0936 \u092c\u093e\u0915\u0940, \u0909\u0938\u0915\u0947 \u092c\u093e\u0926 \u0905\u0915\u093e\u0909\u0902\u091f $3 \u092e\u093f\u0928\u091f \u0915\u0947 \u0932\u093f\u090f \u092c\u0902\u0926 \u0939\u094b \u091c\u093e\u090f\u0917\u093e\u0964", "{WE} $2 tries left, then the account will be locked for $3 minutes."],
[new RegExp("^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\\d{4})$"), "{M} $2", "$1 $2"],
[new RegExp("^(\\S+) se (\\S+)$"), "$1 \u0938\u0947 $2", "$1 to $2"],
[new RegExp("^(.+) ke saath$"), "$1 \u0915\u0947 \u0938\u093e\u0925", "with $1"],
[new RegExp("^Chehra nahi mila: (.+)$"), "\u091a\u0947\u0939\u0930\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e: $1", "Face not matched: $1"],
[new RegExp("^(.+) cm$"), "$1 \u0938\u0947\u092e\u0940", "$1 cm"],
[new RegExp("^(\\d+) entry$"), "$1 \u090f\u0902\u091f\u094d\u0930\u0940", "$1 entries"],
[new RegExp("^\u00b7 (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\\d{4})$"), "\u00b7 {M} $2", "\u00b7 $1 $2"],
[new RegExp("^Agli baar isi naye password se login karein: (.+)$"), "\u0905\u0917\u0932\u0940 \u092c\u093e\u0930 \u0907\u0938\u0940 \u0928\u090f \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947 \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902: $1", "Next time, log in with this new password: $1"],
[new RegExp("^(.+) \u2014 apna naya password$"), "$1 \u2014 \u0905\u092a\u0928\u093e \u0928\u092f\u093e \u092a\u093e\u0938\u0935\u0930\u094d\u0921", "$1 \u2014 your new password"],
[new RegExp("^Ab isi naye password se login karein: (.+)$"), "\u0905\u092c \u0907\u0938\u0940 \u0928\u090f \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0938\u0947 \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902: $1", "Now log in with this new password: $1"],
[new RegExp("^\ud83d\udd11 Password reset maanga: (.+)$"), "\ud83d\udd11 \u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u0930\u0940\u0938\u0947\u091f \u092e\u093e\u0901\u0917\u093e: $1", "\ud83d\udd11 Password reset requested: $1"],
[new RegExp("^Bahut baar galat koshish\\. Ye account (\\d+) minute ke liye band hai\\. Baad mein koshish karein\\.$"), "\u092c\u0939\u0941\u0924 \u092c\u093e\u0930 \u0917\u093c\u0932\u0924 \u0915\u094b\u0936\u093f\u0936\u0964 \u092f\u0939 \u0905\u0915\u093e\u0909\u0902\u091f $1 \u092e\u093f\u0928\u091f \u0915\u0947 \u0932\u093f\u090f \u092c\u0902\u0926 \u0939\u0948\u0964 \u092c\u093e\u0926 \u092e\u0947\u0902 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964", "Too many wrong tries. This account is locked for $1 minutes. Try later."],
[new RegExp("^Is tareekh se pehle ki entries nikalengi: (.+)$"), "\u0907\u0938 \u0924\u093e\u0930\u0940\u0916\u093c \u0938\u0947 \u092a\u0939\u0932\u0947 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u093f\u0915\u0932\u0947\u0902\u0917\u0940: $1", "Entries before this date will be moved: $1"],
[new RegExp("^(\\d+) saal (\\d+) mahine$"), "$1 \u0938\u093e\u0932 $2 \u092e\u0939\u0940\u0928\u0947", "$1 yr $2 mo"],
[new RegExp("^(\\d+) saal$"), "$1 \u0938\u093e\u0932", "$1 yr"],
[new RegExp("^(\\d+) mahine$"), "$1 \u092e\u0939\u0940\u0928\u0947", "$1 months"],
[new RegExp("^Umr: (.+)$"), "\u0909\u092e\u094d\u0930: $1", "Age: $1"],
[new RegExp("^(\\d+) chalu bachche \u00b7 (\\d+) umr-seema ke bahar \u00b7 (\\d+) bina chehre ke$"), "$1 \u091a\u093e\u0932\u0942 \u092c\u091a\u094d\u091a\u0947 \u00b7 $2 \u0909\u092e\u094d\u0930-\u0938\u0940\u092e\u093e \u0915\u0947 \u092c\u093e\u0939\u0930 \u00b7 $3 \u092c\u093f\u0928\u093e \u091a\u0947\u0939\u0930\u0947 \u0915\u0947", "$1 active children \u00b7 $2 outside age range \u00b7 $3 without face"],
[new RegExp("^\ud83d\udcf4 Internet nahi hai \u00b7 (\\d+) entry phone mein rakhi hai$"), "\ud83d\udcf4 \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u0928\u0939\u0940\u0902 \u0939\u0948 \u00b7 $1 \u090f\u0902\u091f\u094d\u0930\u0940 \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u0930\u0916\u0940 \u0939\u0948", "\ud83d\udcf4 No internet \u00b7 $1 entries kept on the phone"],
[new RegExp("^\u23f3 (\\d+) offline entry bhejni baaki$"), "\u23f3 $1 \u0911\u092b\u093c\u0932\u093e\u0907\u0928 \u090f\u0902\u091f\u094d\u0930\u0940 \u092d\u0947\u091c\u0928\u0940 \u092c\u093e\u0915\u0940", "\u23f3 $1 offline entries to send"],
[new RegExp("^(\\d+) offline entry server par bhej di \u2713$"), "$1 \u0911\u092b\u093c\u0932\u093e\u0907\u0928 \u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0930\u094d\u0935\u0930 \u092a\u0930 \u092d\u0947\u091c \u0926\u0940 \u2713", "$1 offline entries sent \u2713"],
[new RegExp("^(\\d+) offline entry save nahi hui$"), "$1 \u0911\u092b\u093c\u0932\u093e\u0907\u0928 \u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908", "$1 offline entries could not be saved"],
[new RegExp("^Sthiti badal di: (.+)$"), "\u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932 \u0926\u0940: $1", "Status changed: $1"],
[new RegExp("^Dhyan dein: umr (.+) hai \\(niyam (\\d+)\u2013(\\d+) mahine\\)\\.$"), "\u0927\u094d\u092f\u093e\u0928 \u0926\u0947\u0902: \u0909\u092e\u094d\u0930 $1 \u0939\u0948 (\u0928\u093f\u092f\u092e $2\u2013$3 \u092e\u0939\u0940\u0928\u0947)\u0964", "Note: age is $1 (rule $2\u2013$3 months)."],
[new RegExp("^Internet aate hi apne aap bhej di jayegi$"), "\u0907\u0902\u091f\u0930\u0928\u0947\u091f \u0906\u0924\u0947 \u0939\u0940 \u0905\u092a\u0928\u0947-\u0906\u092a \u092d\u0947\u091c \u0926\u0940 \u091c\u093e\u090f\u0917\u0940", "Will be sent automatically when internet returns"],
[new RegExp("^(.+) \\(maa (.+)\\)$"), "$1 (\u092e\u093e\u0901 $2)", "$1 (mother $2)"],
[new RegExp("^Aaj doodh mila: (\\d+)/(\\d+)(.*)$"), "\u0906\u091c \u0926\u0942\u0927 \u092e\u093f\u0932\u093e: $1/$2$3", "Fed today: $1/$2$3"],
[new RegExp("^(\\d+) baaki$"), "$1 \u092c\u093e\u0915\u0940", "$1 pending"],
[new RegExp("^\u23f3 (\\d+) entry phone mein pending(?: \\((.+) se\\))?$"), "\u23f3 $1 \u090f\u0902\u091f\u094d\u0930\u0940 \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u092a\u0947\u0902\u0921\u093f\u0902\u0917{SE}", "\u23f3 $1 entries pending on phone{SEE}"],
[new RegExp("^Aakhri baar online: (.+)$"), "\u0906\u0916\u093c\u093f\u0930\u0940 \u092c\u093e\u0930 \u0911\u0928\u0932\u093e\u0907\u0928: {AGO}", "Last online: {AGOE}"],
[new RegExp("^(\\d+) entry (\\d+) MA ke phone mein pending$"), "$1 \u090f\u0902\u091f\u094d\u0930\u0940 $2 MA \u0915\u0947 \u092b\u093c\u094b\u0928 \u092e\u0947\u0902 \u092a\u0947\u0902\u0921\u093f\u0902\u0917", "$1 entries pending on $2 MA phones"],
[new RegExp("^(\\d+)/(\\d+) chune$"), "$1/$2 \u091a\u0941\u0928\u0947", "$1/$2 selected"],
[new RegExp("^(\\d+) AWC chune(?: \\((\\d+) poore sector\\))?$"), "$1 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u0941\u0928\u0940{PS}", "$1 AWCs selected{PSE}"],
[new RegExp("^Poora (Sector-\\d+) \\((\\d+) AWC\\)$"), "\u092a\u0942\u0930\u093e $1 ($2 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940)", "Whole $1 ($2 AWCs)"],
[new RegExp("^(.+) ko (.+) tag ho gaye\\.$"), "$1 \u0915\u094b $2 \u091f\u0948\u0917 \u0939\u094b \u0917\u090f\u0964", "$2 tagged to $1."],
[new RegExp("^(.+) ki AWC jod di$"), "$1 \u0915\u0940 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091c\u094b\u0921\u093c \u0926\u0940", "Added $1's AWCs"],
[new RegExp("^(\\d+) AWC tick ho gayi\\.$"), "$1 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091f\u093f\u0915 \u0939\u094b \u0917\u0908\u0902\u0964", "$1 AWCs ticked."],
[new RegExp("^(\\d+) nahi mili: (.+)$"), "$1 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0902: $2", "$1 not found: $2"],
[new RegExp("^AWC badlo: (.+)$"), "\u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092c\u0926\u0932\u0947\u0902: $1", "Edit AWC: $1"],
[new RegExp("^(\\d+) AWC mein doodh vitaran chalu \u00b7 (\\d+) band(.*)$"), "$1 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092e\u0947\u0902 \u0926\u0942\u0927 \u0935\u093f\u0924\u0930\u0923 \u091a\u093e\u0932\u0942 \u00b7 $2 \u092c\u0902\u0926$3", "Milk distribution on in $1 AWCs \u00b7 $2 off$3"],
[new RegExp("^(\\d+) AWC badli\\. Ab (\\d+) AWC mein doodh vitaran chalu hai\\.$"), "$1 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092c\u0926\u0932\u0940\u0902\u0964 \u0905\u092c $2 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092e\u0947\u0902 \u0926\u0942\u0927 \u0935\u093f\u0924\u0930\u0923 \u091a\u093e\u0932\u0942 \u0939\u0948\u0964", "$1 AWCs changed. Milk distribution is now on in $2 AWCs."],
[new RegExp("^(.+) jod di gayi\\.$"), "$1 \u091c\u094b\u0921\u093c \u0926\u0940 \u0917\u0908\u0964", "$1 added."],
[new RegExp("^(.+) update ho gayi\\.$"), "$1 \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u0908\u0964", "$1 updated."],
[new RegExp("^Ye AWC code pehle se hai: (.+)\\.$"), "\u092f\u0939 AWC \u0915\u094b\u0921 \u092a\u0939\u0932\u0947 \u0938\u0947 \u0939\u0948: $1\u0964", "This AWC code already exists: $1."],
[new RegExp("^(\\d+) AWC chalu rahengi, baaki sab band ho jayengi\\. Band AWC ka purana data nahi mitta\\.$"), "$1 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u091a\u093e\u0932\u0942 \u0930\u0939\u0947\u0902\u0917\u0940, \u092c\u093e\u0915\u0940 \u0938\u092c \u092c\u0902\u0926 \u0939\u094b \u091c\u093e\u090f\u0901\u0917\u0940\u0964 \u092c\u0902\u0926 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u0915\u093e \u092a\u0941\u0930\u093e\u0928\u093e \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u091f\u0924\u093e\u0964", "$1 AWCs stay on, all others turn off. Old data of AWCs that are off is kept."],
[new RegExp("^(\\d+) AWC mein doodh vitaran chalu \u00b7 (\\d+) band \\(aage chalu hongi\\)(.*)$"), "$1 \u0906\u0902\u0917\u0928\u0935\u093e\u0921\u093c\u0940 \u092e\u0947\u0902 \u0926\u0942\u0927 \u0935\u093f\u0924\u0930\u0923 \u091a\u093e\u0932\u0942 \u00b7 $2 \u092c\u0902\u0926 (\u0906\u0917\u0947 \u091a\u093e\u0932\u0942 \u0939\u094b\u0902\u0917\u0940)$3", "Milk on in $1 AWCs \u00b7 $2 off (to start later)$3"],
[new RegExp("^FC: (.+)$"), "FC: $1", "FC: $1"],
[new RegExp("^(.+): (.+) ka tag badla\\.$"), "$1: $2 \u0915\u093e \u091f\u0948\u0917 \u092c\u0926\u0932\u093e\u0964", "$1: tags changed for $2."],
[new RegExp("^(.+): koi badlav nahi\\.$"), "$1: \u0915\u094b\u0908 \u092c\u0926\u0932\u093e\u0935 \u0928\u0939\u0940\u0902\u0964", "$1: no change."]];
/* ---------------- language: Hinglish (base) / Hindi / English ----------------
   The app is written in Hinglish. For Hindi or English, every text on screen is
   swapped through the I18N dictionary below (and a few patterns for sentences with numbers). */
let LANG = ["hl", "hi", "en"].includes(store.get("mt.lang")) ? store.get("mt.lang") : "hl";
const I18N_G = { "Suprabhat": ["\u0938\u0941\u092a\u094d\u0930\u092d\u093e\u0924", "Good morning"], "Namaste": ["\u0928\u092e\u0938\u094d\u0924\u0947", "Hello"], "Shubh sandhya": ["\u0936\u0941\u092d \u0938\u0902\u0927\u094d\u092f\u093e", "Good evening"] };
const I18N_MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function trText(s){
  if (LANG === "hl" || !s) return s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2].replace(/\s+/g, " ");
  if (!core || !/[A-Za-z]/.test(core)) return s;
  let t = trCore(core);
  if (t === null && core.includes(" \u00b7 ")){              // "Full piya \u00b7 Kullukera 1": translate each part
    const parts = core.split(" \u00b7 ").map(x => { const y = trCore(x.trim()); return y === null ? x : y; });
    t = parts.join(" \u00b7 ");
  }
  return t === null ? s : m[1] + t + m[3];
}
function agoTr(t, k){
  const m = /^(\d+) (min|ghante|din) pehle$/.exec(t);
  if (t === "abhi") return k ? "just now" : "\u0905\u092d\u0940";
  if (t === "kabhi nahi") return k ? "never" : "\u0915\u092d\u0940 \u0928\u0939\u0940\u0902";
  if (!m) return t;
  const u = { min: ["\u092e\u093f\u0928\u091f", "min"], ghante: ["\u0918\u0902\u091f\u0947", "hours"], din: ["\u0926\u093f\u0928", "days"] }[m[2]];
  return k ? `${m[1]} ${u[1]} ago` : `${m[1]} ${u[0]} \u092a\u0939\u0932\u0947`;
}
function trCore(core){
  if (!/[A-Za-z]/.test(core)) return null;
  const k = LANG === "hi" ? 0 : 1;
  const hit = I18N_D[core];
  if (hit) return hit[k];
  for (const [re, hi, en] of I18N_RX){
    const g = re.exec(core); if (!g) continue;
    let out = (k ? en : hi).replace(/\$(\d)/g, (_, n) => g[+n] || "");
    out = out.replace("{G}", (I18N_G[g[1]] || [g[1], g[1]])[k])
      .replace("{Q}", g[1] === "quarter" ? "\u0924\u093f\u092e\u093e\u0939\u0940" : "\u092e\u0939\u0940\u0928\u0947").replace("{QE}", g[1] === "quarter" ? "quarter" : "month")
      .replace("{ONE}", g[3] ? ` \u00b7 ${g[3]} \u0915\u0940 \u0905\u092d\u0940 \u090f\u0915 \u0939\u0940 \u090f\u0902\u091f\u094d\u0930\u0940` : "").replace("{ONEE}", g[3] ? ` \u00b7 ${g[3]} have only one entry` : "")
      .replace("{W}", (I18N_D[g[1]] || [g[1], g[1]])[0]).replace("{WE}", (I18N_D[g[1]] || [g[1], g[1]])[1])
      .replace("{M}", (I18N_D[g[1]] || [g[1], g[1]])[0])
      .replace("{PS}", g[2] ? ` (${g[2]} \u092a\u0942\u0930\u0947 \u0938\u0947\u0915\u094d\u091f\u0930)` : "").replace("{PSE}", g[2] ? ` (${g[2]} whole sectors)` : "")
      .replace("{SE}", g[2] ? ` (${g[2]} \u0938\u0947)` : "").replace("{SEE}", g[2] ? ` (since ${g[2]})` : "")
      .replace("{AGO}", agoTr(g[1], 0)).replace("{AGOE}", agoTr(g[1], 1));
    return out;
  }
  return null;
}
const I18N_ATTR = ["placeholder", "aria-label", "title"];
let i18nBusy = false;
function trNode(n){
  if (n.nodeType === 3){
    const p = n.parentNode; if (!p || p.nodeName === "SCRIPT" || p.nodeName === "STYLE" || (p.closest && p.closest("[data-noi18n]"))) return;
    if (n.__t !== n.data) n.__o = n.data;          // the app wrote new text: remember the Hinglish original
    const t = trText(n.__o); n.__t = t;
    if (n.data !== t) n.data = t;
  } else if (n.nodeType === 1){
    if (n.closest && n.closest("[data-noi18n]")) return;
    I18N_ATTR.forEach(a => { if (!n.hasAttribute(a)) return; const v = n.getAttribute(a);
      if (n["__t" + a] !== v) n["__o" + a] = v; const t = trText(n["__o" + a]); n["__t" + a] = t; if (v !== t) n.setAttribute(a, t); });
    if (n.nodeName === "SCRIPT" || n.nodeName === "STYLE") return;
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let c = w.nextNode();
    while (c){ if (c.nodeType === 3) trNode(c); else I18N_ATTR.forEach(a => { if (c.hasAttribute(a)) trNode1Attr(c, a); }); c = w.nextNode(); }
  }
}
function trNode1Attr(el, a){ const v = el.getAttribute(a); if (el["__t" + a] !== v) el["__o" + a] = v; const t = trText(el["__o" + a]); el["__t" + a] = t; if (v !== t) el.setAttribute(a, t); }
function applyLang(){
  document.documentElement.lang = LANG === "hi" ? "hi" : "en";
  document.body.classList.toggle("lang-hi", LANG === "hi");
  i18nBusy = true; trNode(document.body); i18nBusy = false;
}
new MutationObserver(list => {
  if (i18nBusy) return;
  i18nBusy = true;
  for (const r of list){
    if (r.type === "characterData") trNode(r.target);
    else if (r.type === "attributes") trNode1Attr(r.target, r.attributeName);
    else r.addedNodes.forEach(trNode);
  }
  i18nBusy = false;
}).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: I18N_ATTR });
/* the language screen comes right after login, and from the globe button on Home */
let langNext = "home";
function openLang(next){
  langNext = next || "home";
  $$("#langList [data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === LANG));
  show("lang");
}
$$("#langList [data-lang]").forEach(b => b.onclick = () => {
  LANG = b.dataset.lang; store.set("mt.lang", LANG); applyLang();
  show(langNext);
});
$("#langBtn").onclick = () => openLang(current === "lang" ? "home" : current);
applyLang();

/* ---------------- auto-update (Android app) ---------------- */
// The Android app gets new app code from the server (Index.html of the Apps Script),
// so a new APK is needed only for camera/face-model/Android changes.
const OTA = !WEB && !!(window.AndroidBridge && typeof AndroidBridge.saveUpdate === "function");
function otaBuild(html){
  const m = html.match(/var __APP = \[([\s\S]*?)\];/);
  if (!m) throw new Error("update: app code nahi mila");
  const b64 = (m[1].match(/"[A-Za-z0-9+\/=]*"/g) || []).map(x => x.slice(1, -1)).join("");
  let js = atob(b64);
  if (!/^const DEFAULT_API_URL = .*$/m.test(js) || js.length < 50000) throw new Error("update: app code adhoora hai");
  js = js.replace(/^const DEFAULT_API_URL = .*$/m, () => "const DEFAULT_API_URL = " + JSON.stringify(S.api) + ";");
  const page = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@vladmandic\/face-api[^"]*"><\/script>\s*<script>\s*\/\* App code is stored as base64[\s\S]*?<\/script>/,
    () => '<script src="face-api.js"></script>\n<script src="app.js"></script>');
  if (page === html || page.indexOf('id="scr-home"') < 0) throw new Error("update: page adhoora hai");
  return { page, js };
}
async function otaCheck(){
  if (!OTA || !S.api || S.api === "web" || !navigator.onLine) return;
  try {
    const cur = String(AndroidBridge.otaVersion() || "");
    const bad = String((AndroidBridge.otaBad && AndroidBridge.otaBad()) || "");
    const v = await api("appVersion");
    if (!v.ver || v.ver === cur || v.ver === bad) return;
    const b = await api("appBundle");
    const x = otaBuild(b.html);
    if (String(AndroidBridge.saveUpdate(b.ver, x.page, x.js) || "") !== "OK") return;
    if (!cur) return; // first check after installing the APK: just keep it ready for next start
    if (current === "home") overlay({ ok: true, title: "Naya update aa gaya", sub: "App ka naya version download ho gaya. Abhi lagane ke liye 'Abhi update karo' dabayein, warna agli baar app kholne par apne aap lag jayega.",
      actions: [{ label: "Abhi update karo", cls: "primary", run: () => AndroidBridge.reloadApp() }, { label: "Baad mein", cls: "ghost" }] });
    else toast("Naya update tayyar hai \u2014 agli baar app kholne par lag jayega.");
  } catch(e){}
}

/* ---------------- boot ---------------- */
roleChanged();
if (WEB){ S.api = "web"; $("#changeServer").hidden = true; }
if (!S.api) show("setup");
else if (!S.token || !S.user) show("auth");
else { show("home"); api("me").then(r => { S.user = r.user; store.set("mt.user", JSON.stringify(r.user)); renderHome(); }).catch(() => {}); }
setTimeout(loadModels, 300);
loadAwcList();
setTimeout(() => { renderNetBar(); syncOutbox(); heartbeat(true); }, 2500);
setTimeout(otaCheck, 4000);
if (OTA && AndroidBridge.otaOk) try { AndroidBridge.otaOk(); } catch(e){}
window.__booted = true; if (window.__hideSplash) window.__hideSplash(); else { const bootEl = document.getElementById("boot"); if (bootEl) bootEl.hidden = true; }
})();
