/* MATRIX Milk Tracker — app logic (runs inside the Android WebView) */
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
const AWC = [
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
  ["Sector-2", "Mahkurtoli", "20367060218"],
  ["Sector-2", "Tetartoli", "20367060219"],
  ["Sector-2", "Dhawthatoli", "20367060220"],
  ["Sector-2", "Pithra Bhandartoli", "20367060221"],
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
const AWC_BY_LABEL = new Map(AWC.map(a => [awcLabel(a).toLowerCase(), a]));
const sectorOf = label => (AWC_BY_LABEL.get(String(label || "").toLowerCase()) || [""])[0];
const SECTORS = [...new Set(AWC.map(a => a[0]))];
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
    catch(e){ throw new Error("Internet ya server se connection nahi hua. Network check karke dobara try karein."); }
    if (!j.ok){ const err = new Error(j.error || "Kuch galat hua."); err.code = j.code; if (j.code === "AUTH"){ logoutLocal(); toast(j.error); } throw err; }
    return j;
  }
  if (!S.api) throw new Error("Server link set nahi hai.");
  let r;
  try {
    r = await fetch(S.api, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ action, token: S.token }, data)) });
  } catch(e){ throw new Error("Internet ya server se connection nahi hua. Network check karke dobara try karein."); }
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
  if (on){ btn.dataset.label = btn.innerHTML; btn.innerHTML = `<span class="busy"></span> ${label || "Ruko…"}`; btn.disabled = true; }
  else { if (btn.dataset.label) btn.innerHTML = btn.dataset.label; btn.disabled = false; }
}

/* ---------------- navigation ---------------- */
const TITLES = { lang: "Bhasha / भाषा / Language", home: "MATRIX Milk Tracker", reg: "Bachcha / Wajan", milk: "Doodh pilao", rep: "Reports", users: "Users / Accounts" };
let current = "";
function show(name){
  current = name;
  $$("main").forEach(m => m.hidden = m.id !== "scr-" + name);
  const inApp = ["home","reg","milk","rep","users","lang"].includes(name);
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
  busy($("#setupSave"), true, "Check kar rahe hain…");
  try { await api("ping"); store.set("mt.api", url); show("auth"); toast("Server se jud gaye."); }
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
  const list = AWC.filter(a => (!sec || a[0] === sec) && (!q || (a[1] + " " + a[2]).toLowerCase().includes(q)));
  $("#sAwcList").innerHTML = list.map(a => { const l = awcLabel(a);
    return `<label><input type="checkbox" value="${esc(l)}"${awcPicked.has(l) ? " checked" : ""}> <span>${esc(a[1])} <small>${esc(a[2])} · ${esc(a[0])}</small></span></label>`; }).join("")
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
  busy($("#lBtn"), true, "Login ho raha hai…");
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
  busy($("#sBtn"), true, "Ban raha hai…");
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
  team: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5M14 15c3.6-.6 7 1 7 5"/></svg>'
};
const TILES = {
  [R_MA]: [["milk","milk","Doodh pilao","Aaj ki doodh entry yahan karo",2,1],["reg","reg","Naya bachcha","Bachcha register karo",1],["growth","growth","Wajan / Lambai","Har mahine naap bharo",4],["rep","rep","Mera data","Meri entries aur report",3,1]],
  [R_FC]: [["rep","team","Ambassador Monitoring","Ambassadors ki entry aur doodh pilana",4,1],["rep","rep","Reports","Daily · Weekly · Monthly · CSV",3,1]],
  [R_DM]: [["rep","rep","Poori Report","Sab AWC, sab ambassador, CSV, Sheet",3,1],["milk","milk","Doodh pilao","Doodh entry",2],["reg","reg","Naya bachcha","Registration",1],["growth","growth","Wajan / Lambai","Growth update",4],["users","team","Users / Accounts","Account hatao · password reset",4]],
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
    `<button class="tile${wide ? " wide" : ""}" data-go="${go}" type="button" style="--tc:${TILE_COL[n]}"><span class="ic">${ICONS[ic]}</span><span><b>${t}</b><span>${sub}</span></span><span class="go">›</span></button>`).join("");
  $$("#homeTiles [data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  $("#hGlass").innerHTML = milkGlassSvg(0, 0);
  $("#hToday").innerHTML = "";
  $("#hWeek").innerHTML = weekCompareSvg([]);
  $("#recentTitle").textContent = u.role === R_MA ? "Doodh pilane ke baad ki updates" : "Ambassadors ki haal ki entries";
  loadDashboard();
}
async function loadDashboard(){
  try {
    const d = await api("dashboard");
    $("#hGlass").innerHTML = milkGlassSvg(d.fed_today, d.kids);
    const left = Math.max(0, d.kids - d.fed_today);
    $("#hToday").innerHTML = `<span class="pill-stat"><b>${d.fed_today} / ${d.kids}</b> ko aaj doodh mila</span>` + (d.kids ? (left ? `<span class="pill-stat left"><b>${left}</b> baaki</span>` : `<span class="pill-stat done">Sab ho gaye ✓</span>`) : "") + (role() === R_MA ? "" : `<span class="pill-stat"><b>${d.ambassadors}</b> ambassador</span>`);
    $("#hWeek").innerHTML = weekCompareSvg(d.last14 || d.last7 || []);
    const show = role() !== R_SM;
    $("#recentPanel").hidden = !show;
    if (show) $("#recentList").innerHTML = d.recent.map(m => {
      const fail = /not matched/i.test(m.face_result), yes = m.milk_given === "Yes";
      const col = fail ? "var(--bad)" : !yes ? "var(--muted)" : m.consumed === "Full" ? "var(--c-full)" : m.consumed === "Half" ? "var(--c-half)" : m.consumed === "Quarter" ? "var(--c-qtr)" : "var(--c-home)";
      const tag = fail ? "✕" : !yes ? "–" : m.consumed === "Full" ? "1" : m.consumed === "Half" ? "½" : m.consumed === "Quarter" ? "¼" : "⌂";
      const viaCg = m.collected_by_name && m.collected_by_name !== "Bachcha khud";
      const what = fail ? (viaCg ? "Chehra nahi mila: " + m.collected_by_name : "Face match nahi hua") : !yes ? "Doodh nahi piya" + (viaCg ? " · " + m.collected_by_name + " ke saath" : "") : m.consumed === "Taken home" ? "Ghar le gaye" : m.consumed + " piya" + (viaCg ? " · " + m.collected_by_name + " ke saath" : "") + (m.face_result === "Override" ? " · override" : "");
      return `<div class="rec"><span class="dot" style="background:${col}">${tag}</span><span><b>${esc(m.child_name)}</b><small>${esc(what)} · ${esc(m.panchayat.replace(/ \(\d+\)$/, ""))}${role() !== R_MA ? " · " + esc(m.recorded_by) : ""}</small></span><small>${m.date === today() ? esc(m.time) : esc(m.date.slice(5))}</small></div>`;
    }).join("") || `<p class="muted">Abhi koi entry nahi. Doodh pilane ke baad yahan dikhegi.</p>`;
    const al = d.alerts || [];
    $("#alertPanel").hidden = !al.length;
    $("#alertList").innerHTML = al.map(a => `<div class="rec"><span class="dot" style="background:var(--bad)">${a.days}d</span><span><b>${esc(a.child_name)}</b><small>Maa ${esc(a.mother_name)} · ${esc(a.panchayat.replace(/ \(\d+\)$/, ""))}${role() !== R_MA ? " · " + esc(a.registered_by) : ""}</small></span><small>${a.days} din se</small></div>`).join("");
    const nc = d.new_caregivers || [];
    $("#newCgPanel").hidden = !nc.length;
    $("#newCgList").innerHTML = nc.map(g => `<div class="rec"><span class="dot" style="background:var(--berry)">${esc(initials(g.name))}</span><span><b>${esc(g.name)} (${esc(g.relation)})</b><small>${esc(g.children.join(", "))} · jode: ${esc(g.added_by)}</small></span><small>${esc(g.added_at.slice(5, 10))}</small></div>`).join("");
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
    html += allOption ? `<option value="">${r === R_FC ? "Mere sabhi sector" : "Sabhi AWC (poora project)"}</option>` : `<option value="">— AWC chunein —</option>`;
    if (sectorOptions) html += `<optgroup label="Poora sector">` + secs.map(x => `<option value="sector:${x}">${x} — sabhi AWC</option>`).join("") + `</optgroup>`;
    secs.forEach(x => { html += `<optgroup label="${x}">` + AWC.filter(a => a[0] === x && allowed.has(awcLabel(a).toLowerCase())).map(a => `<option>${esc(awcLabel(a))}</option>`).join("") + `</optgroup>`; });
    const extra = server.filter(p => !AWC_BY_LABEL.has(p.toLowerCase()));
    if (extra.length) html += `<optgroup label="Anya">` + extra.map(p => `<option>${esc(p)}</option>`).join("") + `</optgroup>`;
  }
  sel.innerHTML = html || `<option value="">Koi AWC nahi</option>`;
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
}
async function childrenOf(panch){ return (await api("listChildren", { panchayat: panch })).children; }

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
  $("#cgFaceMsg").innerHTML = '<span class="busy"></span> Chehra dhoondh rahe hain…';
  const f = await faceOf(scaleCanvas(c, 900)).catch(() => null);
  if (!f){ cgDraft.face = null; $("#cgFaceBox").textContent = "Chehra nahi mila"; $("#cgFaceMsg").textContent = "Chehra nahi mila. Paas se, roshni mein dobara lein."; return; }
  cgDraft.face = f.descriptor; cgDraft.photo = jpeg(c, 480, 0.8);
  $("#cgFaceBox").innerHTML = `<img src="${cgDraft.photo}" alt="">`; $("#cgFaceMsg").textContent = "Chehra mil gaya ✓";
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
  const items = reg.cgs.map((g, i) => `<div class="cg-item"><img src="${g.photo}" alt=""><span><b>${esc(g.name)}</b><br><small>${esc(g.relation)}${g.phone ? " · " + esc(g.phone) : ""} · naya</small></span><button type="button" data-cgrm="${i}">Hatao</button></div>`)
    .concat([...reg.links.values()].map(g => `<div class="cg-item"><span class="cg-av">${esc(initials(g.name))}</span><span><b>${esc(g.name)}</b><br><small>${esc(g.relation)} · parivar se: ${esc(g.children.join(", "))}</small></span><button type="button" data-cgun="${esc(g.cg_id)}">Hatao</button></div>`));
  $("#rCgList").innerHTML = items.join("") || `<p class="muted" style="margin:0">Abhi koi nahi juda.</p>`;
  const full = reg.cgs.length + reg.links.size >= 4;
  $("#rCgAdd").disabled = full; $("#rCgLink").disabled = full;
  $("#rCgAdd").textContent = hasMaa() ? "+ Aur vyakti (papa, dadi…)" : "+ Maa ka chehra";
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
  box.hidden = false; box.innerHTML = '<p class="muted" style="padding:8px">Load ho raha hai…</p>';
  try {
    const list = (await api("listCaregivers", { panchayat: p })).caregivers;
    box.innerHTML = list.map(g => `<label><input type="checkbox" value="${esc(g.cg_id)}"${reg.links.has(g.cg_id) ? " checked" : ""}> <span>${esc(g.name)} <small>${esc(g.relation)} · ${esc(g.children.join(", "))}</small></span></label>`).join("")
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
  $("#rFaceMsg").textContent = "Photo li gayi ✓";
  try { const f = await faceOf(scaleCanvas(c, 900)); if (f) reg.face = f.descriptor; } catch(err){}
};
function resetReg(){
  $("#regForm").reset(); Object.assign(reg, { idPhoto: null, childPhoto: null, face: null, dup: false, cgs: [], links: new Map() });
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
  if (!reg.cgs.length && !reg.links.size) return err.textContent = "Maa ya saath aane wale kam se kam ek vyakti ka chehra jodein.";
  if (reg.dup) return err.textContent = "Ye bachcha pehle se registered hai.";
  busy($("#rSubmit"), true, "Save ho raha hai…");
  try {
    const r = await api("registerChild", Object.assign(d, { id_photo: reg.idPhoto, child_photo: reg.childPhoto, face: reg.face,
      caregivers: reg.cgs.map(g => ({ name: g.name, relation: g.relation, phone: g.phone, face: g.face, photo: g.photo })), link_cg_ids: [...reg.links.keys()] }));
    resetReg(); $("#rPanchNewW").hidden = true;
    overlay({ ok: true, title: "Child registered", sub: `${d.child_name} (maa ${d.mother_name}) · ID ${r.child_id}`,
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
const chg = v => { const s = String(v ?? ""); if (s === "") return ""; const n = +s; return `<span class="${n > 0 ? "up" : n < 0 ? "down" : "muted"}">${n > 0 ? "▲ +" + Math.abs(n) : n < 0 ? "▼ −" + Math.abs(n) : "0"}</span>`; };
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
  box.hidden = false; box.innerHTML = `<p class="muted" style="margin:0">Pichhle record load ho rahe hain…</p>`;
  try {
    const r = await api("growthHistory", { child_id: id });
    const list = r.history, live = list.filter(g => g.status !== "Replaced"), last = live[live.length - 1];
    box.innerHTML = `<h4>Pichhle record (${live.length})</h4>`
      + (last ? `<p style="margin:0">Aakhri: <b>${esc(last.weight_kg)} kg</b>, <b>${esc(last.height_cm)} cm</b> · ${esc(monthName(last.month))}</p>` : "")
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
  const sel = $("#gChild"); sel.innerHTML = "<option value=''>Load ho raha hai…</option>";
  try {
    const kids = $("#gPanch").value ? await childrenOf($("#gPanch").value) : [];
    sel.innerHTML = `<option value="">— Bachcha chunein —</option>` + kids.map(k => `<option value="${esc(k.child_id)}">${esc(k.child_name)} (maa ${esc(k.mother_name)})</option>`).join("");
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
  busy($("#gSubmit"), true, "Save ho raha hai…");
  try {
    const r = await api("saveGrowth", { child_id: id, month, weight_kg: w, height_cm: h, period_type: grow.type, replace });
    if (r.exists){
      overlay({ ok: false, title: "Is " + (grow.type === "Quarterly" ? "quarter" : "mahine") + " ka record pehle se hai",
        sub: `${name} · ${r.period} · pehle: ${r.old.weight_kg} kg, ${r.old.height_cm} cm (${r.old.date}). Naya bharoge to purana bhi record mein rahega (“badla gaya” likha hoga).`,
        actions: [{ label: "Haan, naya sahi hai — save karo", cls: "primary", run: () => saveGrowthEntry(true) }, { label: "Nahi, wapas jao" }] });
      return;
    }
    if (grow.face) await api("addFace", { child_id: id, face: grow.face, child_photo: grow.photo });
    $("#gWeight").value = ""; $("#gHeight").value = ""; grow.face = null; grow.photo = null; $("#gFaceBox").textContent = "Naya chehra";
    const ch = r.prev ? ` · Pichhle (${monthName(r.prev.month)}) se: ${r.weight_change} kg, ${r.height_change} cm` : "";
    const drop = r.prev && +r.weight_change < 0 ? " · Dhyan dein: wajan kam hua hai!" : "";
    overlay({ ok: true, title: r.replaced ? "Record sudhar diya" : "Wajan/lambai save ho gaya", sub: `${name} · ${r.period} · ${w} kg, ${h} cm${ch}${drop}`,
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
  const sel = $("#mChild"); sel.innerHTML = "<option value=''>Load ho raha hai…</option>"; milk.child = null; milk.faces = null; updateScanBtn();
  try {
    milkKids = $("#mPanch").value ? await childrenOf($("#mPanch").value) : [];
    sel.innerHTML = `<option value="">— Bachcha chunein (${milkKids.length}) —</option>` + milkKids.map(k =>
      `<option value="${esc(k.child_id)}">${k.given_today ? "✓ " : ""}${esc(k.child_name)} (maa ${esc(k.mother_name)})${k.given_today ? " — aaj mil gaya" : ""}</option>`).join("");
    $("#mChildInfo").textContent = milkKids.length ? `${milkKids.filter(k => k.given_today).length} / ${milkKids.length} ko aaj doodh mil chuka hai.` : "Is AWC mein abhi koi bachcha registered nahi hai.";
    $("#mFind").value = ""; $("#mFindW").hidden = milkKids.length < 8; renderKidCards();
  } catch(e){ sel.innerHTML = "<option value=''>List nahi aayi</option>"; $("#mErr").textContent = e.message; }
}
/* children as big tap-able cards: not-yet-fed first */
function renderKidCards(){
  const q = $("#mFind").value.trim().toLowerCase(), sel = $("#mChild").value;
  const list = milkKids.filter(k => !q || (k.child_name + " " + k.mother_name).toLowerCase().includes(q))
    .sort((a, b) => (a.given_today - b.given_today) || a.child_name.localeCompare(b.child_name));
  $("#mKids").innerHTML = list.map(k => `<button type="button" class="kid${k.given_today ? " done" : ""}${k.child_id === sel ? " on" : ""}" data-kid="${esc(k.child_id)}"><span class="kav">${esc(initials(k.child_name))}</span><span class="knm"><b>${esc(k.child_name)}</b><small>Maa: ${esc(k.mother_name)}</small></span><span class="kst">${k.given_today ? "✓ Mil gaya" : "Baaki"}</span></button>`).join("")
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
  try { milk.faces = (await api("getFace", { child_id: id })).faces; } catch(e){ $("#mErr").textContent = e.message; }
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
    overlay({ ok: true, title: g.name + " ka chehra mila", sub: `${g.relation} · match ${Math.round((1 - d) * 100)}%`, actions: [{ label: "Aage badho", cls: "ok", run: () => openFamForm(g, "Caregiver") }] });
  } else {
    const child = milk.child;
    api("recordMilk", { child_id: child.child_id, face_result: "Caregiver not matched", cg_id: g.cg_id, match_score: milk.score }).catch(() => {});
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
    return `<div class="fam-kid${on ? "" : " off"}"><label class="top"><input type="checkbox" value="${esc(k.child_id)}"${k.given_today ? " disabled" : on ? " checked" : ""}> ${esc(k.child_name)}${k.given_today ? ' <small class="muted">— aaj mil chuka</small>' : ""}</label>
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
  busy($("#famSave"), true, "Save ho raha hai…");
  const done = [], failed = [];
  for (const id of ids){
    try { await api("recordMilk", { child_id: id, face_result: fam.result, cg_id: fam.g.cg_id, match_score: milk.score, milk_given: amt[id] === "No" ? "No" : "Yes", consumed: amt[id] === "No" ? "" : amt[id] }); done.push(id); }
    catch(ex){ failed.push(ex.message); }
  }
  busy($("#famSave"), false);
  const names = fam.g.children.filter(k => done.includes(k.child_id)).map(k => k.child_name).join(", ");
  if (!done.length) return err.textContent = failed[0] || "Save nahi hua.";
  overlay({ ok: true, title: `${done.length} bachche ki entry save`, sub: `${names} · ${fam.g.name} (${fam.g.relation}) ke saath${failed.length ? " · " + failed.length + " nahi hua: " + failed[0] : ""}`,
    actions: [{ label: "Agla bachcha", cls: "primary", run: () => { $("#famForm").hidden = true; $("#milkPick").hidden = false; loadMilkKids(); } }, { label: "Home", run: () => show("home") }] });
};
function updateScanBtn(){
  const b = $("#mScan"); if (!b) return;
  b.disabled = !(milk.child && milk.faces && milk.faces.length && modelReady);
  b.textContent = !modelReady ? "Face model load ho raha hai…" : "Bachche ka chehra scan karo";
  b.hidden = true;
  const box = $("#mCgBox");
  if (box){ box.hidden = !(milk.child && modelReady); if (!box.hidden) renderCgChips(); }
}
const dist = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++){ const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); };

$("#mScan").onclick = async () => {
  const c = await takePhoto(milk.child.child_name + " ka chehra"); if (!c) return;
  const b = $("#mScan"); busy(b, true, "Match kar rahe hain…");
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
    overlay({ ok: true, title: "Face matched", sub: `${milk.child.child_name} · match ${Math.round((1 - d) * 100)}%`,
      actions: [{ label: "Aage badho", cls: "ok", run: openMilkForm }] });
  } else {
    milk.result = "Not matched";
    const child = milk.child;
    api("recordMilk", { child_id: child.child_id, face_result: "Not matched", match_score: milk.score }).catch(() => {});
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
  busy($("#oBtn"), true, "Check…");
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
  busy($("#mfSave"), true, "Save ho raha hai…");
  try {
    await api("recordMilk", { child_id: milk.child.child_id, face_result: milk.result, match_score: milk.score,
      milk_given: milk.given, consumed, override_token: milk.overrideToken, override_reason: $("#ovReason").value.trim() });
    const name = milk.child.child_name;
    overlay({ ok: true, title: "Entry save ho gayi", sub: milk.given === "Yes" ? `${name} · ${consumed}` : `${name} · doodh nahi diya`,
      actions: [{ label: "Agla bachcha", cls: "primary", run: () => { $("#milkForm").hidden = true; $("#milkPick").hidden = false; loadMilkKids(); } },
                { label: "Home", run: () => show("home") }] });
  } catch(ex){ err.textContent = ex.message; }
  finally { busy($("#mfSave"), false); }
};

/* ---------------- USERS (District Management) ---------------- */
let allUsers = [];
async function openUsers(){
  $("#uList").innerHTML = '<p class="muted">Load ho raha hai…</p>';
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
    .sort((a, b) => (a.active === "removed") - (b.active === "removed") || String(b.created_at).localeCompare(String(a.created_at)));
  $("#uCount").textContent = `${list.length} account · ${allUsers.filter(u => u.active === "yes").length} chalu`;
  $("#uList").innerHTML = list.map(u => { const [st, cls] = userState(u);
    const btns = u.me ? `<span class="pill">Aap</span>` : u.active === "removed" ? `<button class="btn small ghost" data-uop="enable" data-u="${esc(u.username)}">Wapas chalu karo</button>`
      : `<button class="btn small bad" data-uop="remove" data-u="${esc(u.username)}">Hatao</button>`
        + (u.active === "yes" ? `<button class="btn small ghost" data-uop="disable" data-u="${esc(u.username)}">Band karo</button>` : `<button class="btn small ghost" data-uop="enable" data-u="${esc(u.username)}">Chalu karo</button>`)
        + (u.locked ? `<button class="btn small ghost" data-uop="unlock" data-u="${esc(u.username)}">Unlock</button>` : "")
        + `<button class="btn small ghost" data-uop="reset" data-u="${esc(u.username)}">Password reset</button>`;
    return `<div class="panel ucard"><div class="who"><div><b>${esc(u.full_name)}</b> <small class="muted">@${esc(u.username)}</small></div><span class="pill ${cls}">${st}</span></div>
      <div class="muted">${esc(u.role)} · Mobile ${esc(String(u.phone).replace(/^old-/, "") || "—")}${u.phone && String(u.phone).startsWith("old-") ? " (free)" : ""}${u.panchayats ? " · " + esc(String(u.panchayats).replace(/ \(\d+\)/g, "")) : ""}</div>
      <div class="muted">Bana: ${esc(String(u.created_at).slice(0, 10))} · Registered bachche: ${u.children}</div>
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
  if (op === "remove") return overlay({ ok: false, title: "Account hatayein?", sub: `${u.full_name} (@${u.username}) login nahi kar payenge. Unka mobile number free ho jayega aur us number se naya account ban sakega. Unki purani entries Sheet mein rahengi.`,
    actions: [{ label: "Haan, hatao", cls: "bad", run: () => doUserOp(u.username, "remove") }, { label: "Cancel" }] });
  if (op === "disable") return overlay({ ok: false, title: "Account band karein?", sub: `${u.full_name} login nahi kar payenge. Baad mein "Chalu karo" se wapas khol sakte hain.`,
    actions: [{ label: "Haan, band karo", cls: "bad", run: () => doUserOp(u.username, "disable") }, { label: "Cancel" }] });
  if (op === "reset"){ $("#pwWho").textContent = `${u.full_name} (@${u.username})`; $("#pwNew").value = ""; $("#pwErr").textContent = ""; $("#pwSheet").hidden = false; $("#pwSheet").dataset.u = u.username; return; }
  doUserOp(u.username, op);
};
$("#pwCancel").onclick = () => { $("#pwSheet").hidden = true; };
$("#pwForm").onsubmit = async e => {
  e.preventDefault(); const pw = $("#pwNew").value.trim();
  if (pw.length < 6) return $("#pwErr").textContent = "Kam se kam 6 akshar.";
  $("#pwSheet").hidden = true; await doUserOp($("#pwSheet").dataset.u, "reset", { new_password: pw });
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
  busy($("#pGo"), true, "Report ban rahi hai…");
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
    const seg = [["Full", d.Full], ["Half", d.Half], ["Quarter", d.Quarter], ["Taken home", d.home !== undefined ? d.home : d["Taken home"]]].map(([k, v], j) => { const h = v / max * (base - top); y -= h; return v ? `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${CATS[j][2]}"><title>${d.date} · ${CATS[j][1]}: ${v}</title></rect>` : ""; }).join("");
    return seg + `<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--fg)">${d.given || ""}</text><text x="${x + bw / 2}" y="${base + 14}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${d.date.slice(8)}/${d.date.slice(5, 7)}</text>`
      + (d.fail ? `<text x="${x + bw / 2}" y="${base + 27}" text-anchor="middle" font-size="9.5" fill="var(--bad)">✕${d.fail}</text>` : ""); }).join("")}</svg></div>`;
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
  $("#pRange").textContent = `${r.from === r.to ? r.from : r.from + " se " + r.to} · ${r.panch || (role() === R_MA ? "Mere AWC" : role() === R_FC ? "Mere sector" : "Sabhi AWC")}${$("#pAmb").value ? " · @" + $("#pAmb").value : ""}`;
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
    return `<tr><td><b>${esc(a.full_name)}</b><br><small class="muted">@${esc(a.username)}</small></td><td>${esc(String(a.panchayats).replace(/ \(\d+\)/g, ""))}</td><td class="n">${full.children.filter(c => c.registered_by === a.username).length}</td><td class="n">${mine.filter(m => m.milk_given === "Yes").length}</td><td class="n">${mine.filter(m => /not matched/i.test(m.face_result)).length}</td><td class="n">${mine.filter(m => m.face_result === "Override").length}</td><td>${last ? esc(last.date + " " + last.time) : "—"}</td></tr>`; }).join("");
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
  $("#gTiles").innerHTML = by.size ? `<div class="gtile up"><span>▲ Wajan badha</span><b>${up}</b></div><div class="gtile down"><span>▼ Wajan ghata</span><b>${down}</b></div><div class="gtile same"><span>● Koi badlav nahi</span><b>${same}</b></div><div class="gtile avg"><span>Ausat badlav</span><b>${nGain ? (gain / nGain > 0 ? "+" : "") + (gain / nGain).toFixed(2) : "—"}<small style="font-size:.8rem"> kg</small></b></div>` : "";
  const tot = up + down + same;
  $("#gBars").innerHTML = tot ? `<div style="display:flex;height:16px;border-radius:9px;overflow:hidden;margin:2px 0" role="img" aria-label="Wajan badha ${up}, ghata ${down}, same ${same}">${[[up, "var(--ok)"], [same, "var(--drop)"], [down, "var(--bad)"]].map(([n, c]) => n ? `<div style="flex:${n};background:${c}" title="${n}"></div>` : "").join("")}</div><p class="muted" style="margin:0;font-size:.85rem">${tot} bachchon ka pichhli entry se mukabla${once ? ` · ${once} bachchon ki abhi ek hi entry hai` : ""}</p>` : `<p class="muted">Abhi growth entry nahi hai.</p>`;
  gShown = 0; $("#gCards").innerHTML = ""; moreGrowthCards();
}
function moreGrowthCards(){
  const next = gCardsAll.slice(gShown, gShown + 24);
  $("#gCards").insertAdjacentHTML("beforeend", next.map(k => {
    const color = k.d === null ? "var(--accent)" : k.d > 0 ? "var(--ok)" : k.d < 0 ? "var(--bad)" : "var(--drop)";
    return `<div class="gcard${k.d < 0 ? " down" : ""}"><span class="nm" title="${esc(k.name)}">${esc(k.name)}</span><small>${esc(k.awc)}</small>${miniLine(k.list.slice(-8), color)}<span class="kg">${esc(k.last.weight_kg)} kg ${k.d === null ? "" : chg(k.d)}</span><small>${esc(k.last.height_cm)} cm · ${esc(monthName(k.last.month))} · ${k.list.length} entry</small></div>`; }).join(""));
  gShown += next.length; $("#gMore").hidden = gShown >= gCardsAll.length;
}
$("#gMore").onclick = moreGrowthCards;

/* CSV */
const cell = v => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = rows => "﻿" + rows.map((r, i) => i ? r : r.map(x => x === "panchayat" ? "awc" : x)).map(r => r.map(cell).join(",")).join("\r\n");
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
  $("#pRange").textContent = `${r.from === r.to ? r.from : r.from + " se " + r.to} · ${r.panch || "Sabhi AWC"}`;
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
  return `<div class="gtile up"><span>▲ Wajan badha</span><b>${t.up}</b></div><div class="gtile down"><span>▼ Wajan ghata</span><b>${t.down}</b></div><div class="gtile same"><span>● Koi badlav nahi</span><b>${t.same}</b></div><div class="gtile avg"><span>Ausat badlav</span><b>${t.avg === "" ? "—" : (t.avg > 0 ? "+" : "") + Number(t.avg).toFixed(2)}<small style="font-size:.8rem"> kg</small></b></div>`;
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
  $("#sgBars").innerHTML = growthBar(t) + `<p class="muted" style="margin:4px 0 0;font-size:.85rem">${t.children} bachchon ka growth record · is samay mein ${t.measured} naape gaye${t.once ? ` · ${t.once} ki abhi ek hi entry` : ""}</p>`;
  const sec = new Map();
  g.awcs.forEach(a => { const k = a.sector || "Anya"; const o = sec.get(k) || { sector: k, children: 0, up: 0, down: 0, same: 0 }; o.children += a.children; o.up += a.up; o.down += a.down; o.same += a.same; sec.set(k, o); });
  $("#sgSecBars").innerHTML = [...sec.values()].sort((a, b) => a.sector.localeCompare(b.sector, "en", { numeric: true })).map(o =>
    `<div style="display:grid;grid-template-columns:90px 1fr auto;gap:8px;align-items:center;margin:6px 0"><b style="font-size:.88rem">${esc(o.sector)}</b>${growthBar(o)}<small><span class="up">▲${o.up}</span> <span class="down">▼${o.down}</span></small></div>`).join("");
  $("#sgAwc").innerHTML = g.awcs.map(a => `<tr><td>${esc(a.awc)}</td><td>${esc(a.sector)}</td><td class="n">${a.children}</td><td class="n">${a.measured}</td><td class="n up">${a.up}</td><td class="n down">${a.down}</td><td class="n">${a.same}</td><td class="n">${a.avg === "" ? "—" : (a.avg > 0 ? "+" : "") + a.avg}</td></tr>`).join("");
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

const I18N_D = {"(Maa + 3 tak)":["(माँ + 3 तक)","(Mother + up to 3)"],"+ Aur vyakti (papa, dadi…)":["+ और व्यक्ति (पापा, दादी…)","+ Another person (father, grandmother…)"],"+ Maa ka chehra":["+ माँ का चेहरा","+ Mother's face"],"+ Naya vyakti jodo":["+ नया व्यक्ति जोड़ो","+ Add new person"],"3 mahine":["3 महीने","3 months"],"4 se zyada nahi jod sakte.":["4 से ज़्यादा नहीं जोड़ सकते।","You cannot add more than 4."],"AWC":["आंगनवाड़ी (AWC)","AWC"],"AWC *":["आंगनवाड़ी (AWC) *","AWC *"],"AWC / Sector":["आंगनवाड़ी / सेक्टर","AWC / Sector"],"AWC chunein":["आंगनवाड़ी चुनें","Choose AWC"],"AWC dhoondo":["आंगनवाड़ी खोजें","Search AWC"],"AWC ke hisaab se":["आंगनवाड़ी के हिसाब से","By AWC"],"AWC naam ya code se dhoondo":["आंगनवाड़ी का नाम या कोड लिखें","Search by AWC name or code"],"Aadha":["आधा","Half"],"Aadha (Half)":["आधा","Half"],"Aadha (Half) — centre mein":["आधा — केंद्र में","Half — at the centre"],"Aage badho":["आगे बढ़ें","Continue"],"Aaj":["आज","Today"],"Aaj ki doodh entry yahan karo":["आज की दूध एंट्री यहाँ करें","Record today's milk here"],"Aakhri":["आख़िरी","Latest"],"Aakhri entry":["आख़िरी एंट्री","Last entry"],"Aakhri:":["आख़िरी:","Latest:"],"Aap":["आप","You"],"Aap kaun hain? *":["आप कौन हैं? *","Who are you? *"],"Aapke AWC * (ek ya zyada chunein)":["आपके आंगनवाड़ी * (एक या ज़्यादा चुनें)","Your AWCs * (choose one or more)"],"Aapke sector * (jinke ambassadors ka data dekhna hai)":["आपके सेक्टर * (जिनके एम्बेसडर का डेटा देखना है)","Your sectors * (whose ambassadors you supervise)"],"Abhi growth entry nahi hai.":["अभी वृद्धि की कोई एंट्री नहीं है।","No growth entries yet."],"Abhi koi AWC nahi chuna.":["अभी कोई आंगनवाड़ी नहीं चुनी।","No AWC selected yet."],"Abhi koi entry nahi. Doodh pilane ke baad yahan dikhegi.":["अभी कोई एंट्री नहीं। दूध पिलाने के बाद यहाँ दिखेगी।","No entries yet. They will appear here after milk is given."],"Abhi koi nahi juda.":["अभी कोई नहीं जुड़ा।","Nobody added yet."],"Access code * (admin se lein)":["एक्सेस कोड * (एडमिन से लें)","Access code * (get it from admin)"],"Access code daalein (admin se lein).":["एक्सेस कोड डालें (एडमिन से लें)।","Enter the access code (get it from admin)."],"Account band karein?":["अकाउंट बंद करें?","Disable account?"],"Account dhoondo":["अकाउंट खोजें","Search accounts"],"Account hatao · password reset":["अकाउंट हटाएँ · पासवर्ड रीसेट","Remove account · reset password"],"Account hatayein?":["अकाउंट हटाएँ?","Remove account?"],"Agla bachcha":["अगला बच्चा","Next child"],"Ambassador":["एम्बेसडर","Ambassador"],"Ambassador Monitoring":["एम्बेसडर निगरानी","Ambassador Monitoring"],"Ambassadors ki entry aur doodh pilana":["एम्बेसडर की एंट्री और दूध पिलाना","Ambassador entries and milk feeding"],"Ambassadors ki haal ki entries":["एम्बेसडर की हाल की एंट्री","Recent ambassador entries"],"Ambassadors ne mauke par jode. Ek baar pushti kar lein.":["एम्बेसडर ने मौके पर जोड़े। एक बार पुष्टि कर लें।","Added on the spot by ambassadors. Please verify once."],"Anya":["अन्य","Other"],"Apna 10 ank ka sahi mobile number likhein.":["अपना 10 अंकों का सही मोबाइल नंबर लिखें।","Enter your correct 10-digit mobile number."],"Apna AWC chunein (kam se kam ek).":["अपनी आंगनवाड़ी चुनें (कम से कम एक)।","Choose your AWC (at least one)."],"Apna sector chunein (kam se kam ek).":["अपना सेक्टर चुनें (कम से कम एक)।","Choose your sector (at least one)."],"App load ho raha hai…":["ऐप लोड हो रहा है…","App is loading…"],"Aur bachche dikhao":["और बच्चे दिखाओ","Show more children"],"Ausat badlav":["औसत बदलाव","Average change"],"Ausat kg":["औसत किलो","Average kg"],"Baaki":["बाकी","Pending"],"baaki":["बाकी","pending"],"Bachcha":["बच्चा","Child"],"Bachcha *":["बच्चा *","Child *"],"Bachcha / Wajan":["बच्चा / वजन","Child / Weight"],"Bachcha centre nahi aaya":["बच्चा केंद्र नहीं आया","Child did not come to the centre"],"Bachcha chunein":["बच्चा चुनें","Choose child"],"Bachcha chunein.":["बच्चा चुनें।","Choose a child."],"Bachcha khud":["बच्चा ख़ुद","Child alone"],"Bachcha register karo":["बच्चे का पंजीकरण करें","Register a child"],"Bachche":["बच्चे","Children"],"Bachche ka chehra":["बच्चे का चेहरा","Child's face"],"Bachche ka chehra scan karo":["बच्चे का चेहरा स्कैन करें","Scan child's face"],"Bachche ka naam *":["बच्चे का नाम *","Child's name *"],"Bachche ka naam, maa ka naam aur AWC bharein.":["बच्चे का नाम, माँ का नाम और आंगनवाड़ी भरें।","Fill child's name, mother's name and AWC."],"Bachche ka naya chehra":["बच्चे का नया चेहरा","Child's new photo"],"Bachche ke hisaab se":["बच्चे के हिसाब से","By child"],"Bachche ke saath aane wale *":["बच्चे के साथ आने वाले *","People who come with the child *"],"Bachche ke saath kaun aaya hai?":["बच्चे के साथ कौन आया है?","Who came with the child?"],"Bachche ki nayi photo (optional)":["बच्चे की नई फ़ोटो (वैकल्पिक)","New photo of child (optional)"],"Bachche ki photo":["बच्चे की फ़ोटो","Child's photo"],"Bachche ki photo kheecho":["बच्चे की फ़ोटो खींचें","Take child's photo"],"Bachche ki photo lein.":["बच्चे की फ़ोटो लें।","Take the child's photo."],"Bachche ya maa ka naam":["बच्चे या माँ का नाम","Child or mother's name"],"Back":["वापस","Back"],"← Back":["← वापस","← Back"],"Badha":["बढ़ा","Up"],"▲ Badha":["▲ बढ़ा","▲ Up"],"Bahan":["बहन","Sister"],"Ban raha hai…":["बन रहा है…","Creating…"],"Band":["बंद","Disabled"],"Band karo":["बंद करें","Disable"],"Bhai":["भाई","Brother"],"Bua":["बुआ","Aunt (bua)"],"By":["किसने","By"],"Camera badlo":["कैमरा बदलें","Switch camera"],"Camera chalu karo":["कैमरा चालू करें","Start camera"],"Cancel":["रद्द करें","Cancel"],"Caregiver":["देखभाल करने वाला","Caregiver"],"Caregiver (new)":["देखभाल करने वाला (नया)","Caregiver (new)"],"Caregiver not matched":["देखभाल करने वाले का चेहरा नहीं मिला","Caregiver not matched"],"Chacha":["चाचा","Uncle (chacha)"],"Chachi":["चाची","Aunt (chachi)"],"Chalu":["चालू","Active"],"Chalu karo":["चालू करें","Enable"],"Chauthai":["चौथाई","Quarter"],"Chauthai (Qtr)":["चौथाई","Quarter"],"Chauthai (Quarter) — centre mein":["चौथाई — केंद्र में","Quarter — at the centre"],"Check kar rahe hain…":["जाँच हो रही है…","Checking…"],"Chehra":["चेहरा","Face"],"Chehra dhoondh rahe hain…":["चेहरा खोज रहे हैं…","Looking for the face…"],"Chehra mil gaya ✓":["चेहरा मिल गया ✓","Face found ✓"],"Chehra mila":["चेहरा मिला","Face matched"],"Chehra nahi dikha":["चेहरा नहीं दिखा","Face not visible"],"Chehra nahi mila":["चेहरा नहीं मिला","Face not found"],"Chehra nahi mila. Paas se, roshni mein dobara lein.":["चेहरा नहीं मिला। पास से, रोशनी में दोबारा लें।","Face not found. Retake closer, in good light."],"Chehra scan karo":["चेहरा स्कैन करें","Scan face"],"Chehra seedha, achhi roshni mein, akele bachche ka.":["चेहरा सीधा, अच्छी रोशनी में, अकेले बच्चे का।","Child alone, face straight, in good light."],"Chehre ki photo":["चेहरे की फ़ोटो","Face photo"],"Chehre ki photo lein.":["चेहरे की फ़ोटो लें।","Take a face photo."],"Child Registration":["बच्चे का पंजीकरण","Child Registration"],"Child registered":["बच्चा पंजीकृत हो गया","Child registered"],"Child-wise summary":["बच्चेवार सारांश","Child-wise summary"],"Children details":["बच्चों का विवरण","Children details"],"Chune gaye":["चुने गए","Selected"],"Connect karo":["जोड़ें","Connect"],"Coordinator apna username-password daalein. Ye entry \"Override\" ke roop mein unke naam se save hogi.":["कोऑर्डिनेटर अपना यूज़रनेम-पासवर्ड डालें। यह एंट्री \"ओवरराइड\" के रूप में उनके नाम से सेव होगी।","Coordinator enters their username and password. This entry will be saved as an \"Override\" in their name."],"Coordinator username":["कोऑर्डिनेटर यूज़रनेम","Coordinator username"],"Create user ID":["नई यूज़र ID बनाएँ","Create user ID"],"Dada":["दादा","Grandfather"],"Dadi":["दादी","Grandmother"],"Daily":["रोज़ाना","Daily"],"Daily consumption":["रोज़ की खपत","Daily consumption"],"Daily · Weekly · Monthly · CSV":["रोज़ · हफ़्ता · महीना · CSV","Daily · Weekly · Monthly · CSV"],"Date":["तारीख़","Date"],"Date se":["तारीख़ से","Date range"],"Dekhbhal karne wala vyakti":["देखभाल करने वाला व्यक्ति","Caregiver"],"Dekhbhal karne wale ka chehra":["देखभाल करने वाले का चेहरा","Caregiver's face"],"Dhyan dein: wajan kam hua hai!":["ध्यान दें: वजन कम हुआ है!","Attention: weight has gone down!"],"Din ke hisaab se":["दिन के हिसाब से","By day"],"Din mila":["दिन मिला","Days given"],"District Management":["ज़िला प्रबंधन","District Management"],"Dobara photo lo":["दोबारा फ़ोटो लें","Retake photo"],"Doodh diya":["दूध दिया","Milk given"],"Doodh diya gaya?":["दूध दिया गया?","Was milk given?"],"Doodh entry":["दूध एंट्री","Milk entry"],"Doodh kitna piya":["कितना दूध पिया","How much milk was drunk"],"Doodh kitna piya, chunein.":["कितना दूध पिया, चुनें।","Choose how much milk was drunk."],"Doodh kitna piya?":["कितना दूध पिया?","How much milk was drunk?"],"Doodh nahi piya":["दूध नहीं पिया","Did not drink milk"],"Doodh pilane ke baad ki updates":["दूध पिलाने के बाद की जानकारी","Updates after feeding"],"Doodh pilao":["दूध पिलाओ","Give milk"],"Download":["डाउनलोड","Download"],"Download (CSV)":["डाउनलोड (CSV)","Download (CSV)"],"Ek aur bachcha register karo":["एक और बच्चे का पंजीकरण करें","Register another child"],"Ek hi entry":["सिर्फ़ एक एंट्री","Only one entry"],"Entry save ho gayi":["एंट्री सेव हो गई","Entry saved"],"Face doesn't match":["चेहरा मेल नहीं खाता","Face doesn't match"],"Face fail":["चेहरा नहीं मिला","Face fail"],"Face match nahi hua":["चेहरा मेल नहीं हुआ","Face did not match"],"Face matched":["चेहरा मिल गया","Face matched"],"Face model abhi taiyaar nahi hai.":["फ़ेस मॉडल अभी तैयार नहीं है।","Face model is not ready yet."],"Face model load ho raha hai…":["फ़ेस मॉडल लोड हो रहा है…","Face model is loading…"],"Face model load nahi hua. App band karke dobara kholein.":["फ़ेस मॉडल लोड नहीं हुआ। ऐप बंद करके दोबारा खोलें।","Face model did not load. Close and reopen the app."],"Field Coordinator":["फ़ील्ड कोऑर्डिनेटर","Field Coordinator"],"Field Coordinator override":["फ़ील्ड कोऑर्डिनेटर ओवरराइड","Field Coordinator override"],"File save nahi hui":["फ़ाइल सेव नहीं हुई","File not saved"],"Full":["पूरा","Full"],"Gallery se upload":["गैलरी से अपलोड","Upload from gallery"],"Ghar le gaye":["घर ले गए","Taken home"],"Ghata":["घटा","Down"],"▼ Ghata":["▼ घटा","▼ Down"],"Google Sheet kholo":["गूगल शीट खोलें","Open Google Sheet"],"Growth":["वृद्धि","Growth"],"Growth (poora itihas)":["वृद्धि (पूरा इतिहास)","Growth (full history)"],"Growth monitoring (mahina / 3 mahine)":["वृद्धि निगरानी (महीना / 3 महीने)","Growth monitoring (monthly / quarterly)"],"Growth monitoring (wajan)":["वृद्धि निगरानी (वजन)","Growth monitoring (weight)"],"Growth summary (CSV)":["वृद्धि सारांश (CSV)","Growth summary (CSV)"],"Growth update":["वृद्धि अपडेट","Growth update"],"Haal ki entries":["हाल की एंट्री","Recent entries"],"Haan (Yes)":["हाँ","Yes"],"Haan ya Nahi chunein.":["हाँ या नहीं चुनें।","Choose Yes or No."],"Haan, band karo":["हाँ, बंद करें","Yes, disable"],"Haan, hatao":["हाँ, हटाएँ","Yes, remove"],"Haan, naya sahi hai — save karo":["हाँ, नया सही है — सेव करें","Yes, the new one is correct — save"],"Hafte ka koi bhi din":["हफ़्ते का कोई भी दिन","Any day of the week"],"Half":["आधा","Half"],"Har 3 mahine":["हर 3 महीने","Every 3 months"],"Har bachcha · Har din · Pura glass":["हर बच्चा · हर दिन · पूरा गिलास","Every child · Every day · A full glass"],"Har bachche ka wajan graph":["हर बच्चे का वजन ग्राफ़","Weight graph of each child"],"Har bachche ki aakhri entry ka pichhli entry se mukabla. Naam nahi dikhaye jaate.":["हर बच्चे की आख़िरी एंट्री की पिछली एंट्री से तुलना। नाम नहीं दिखाए जाते।","Each child's latest entry compared with the previous one. Names are not shown."],"Har chune bachche ke liye chunein ki kitna doodh piya.":["हर चुने हुए बच्चे के लिए चुनें कि कितना दूध पिया।","For each selected child, choose how much milk was drunk."],"Har mahine":["हर महीने","Every month"],"Har mahine naap bharo":["हर महीने नाप भरें","Enter measurements every month"],"Hatao":["हटाएँ","Remove"],"Hataya gaya":["हटाया गया","Removed"],"Home":["होम","Home"],"ID card":["पहचान पत्र","ID card"],"ID card (MCP / masked Aadhaar)":["पहचान पत्र (MCP / मास्क्ड आधार)","ID card (MCP / masked Aadhaar)"],"ID card *":["पहचान पत्र *","ID card *"],"ID card ki photo":["पहचान पत्र की फ़ोटो","ID card photo"],"ID card ki photo lein.":["पहचान पत्र की फ़ोटो लें।","Take the ID card photo."],"Inke saath aaye har bachche ke liye chunein ki usne centre par kitna doodh piya.":["इनके साथ आए हर बच्चे के लिए चुनें कि उसने केंद्र पर कितना दूध पिया।","For each child who came with them, choose how much milk they drank at the centre."],"Internet ya server se connection nahi hua. Network check karke dobara try karein.":["इंटरनेट या सर्वर से कनेक्शन नहीं हुआ। नेटवर्क जाँचकर दोबारा कोशिश करें।","Could not connect to the internet or server. Check the network and try again."],"Is AWC mein abhi koi bachcha registered nahi hai.":["इस आंगनवाड़ी में अभी कोई बच्चा पंजीकृत नहीं है।","No child is registered in this AWC yet."],"Is AWC mein abhi koi dekhbhal karne wala juda nahi hai.":["इस आंगनवाड़ी में अभी कोई देखभाल करने वाला नहीं जुड़ा है।","No caregiver added in this AWC yet."],"Is bachche ke saath abhi koi juda nahi hai. \"+ Naya vyakti jodo\" dabayein.":["इस बच्चे के साथ अभी कोई नहीं जुड़ा है। \"+ नया व्यक्ति जोड़ो\" दबाएँ।","Nobody is linked to this child yet. Tap \"+ Add new person\"."],"Is bachche ko aaj doodh pehle hi mil chuka hai.":["इस बच्चे को आज दूध पहले ही मिल चुका है।","This child has already been given milk today."],"Is hafta":["इस हफ़्ते","This week"],"Is hafta vs pichla hafta":["यह हफ़्ता बनाम पिछला हफ़्ता","This week vs last week"],"Is naam ka bachcha nahi mila.":["इस नाम का बच्चा नहीं मिला।","No child with this name."],"Is samay ki growth entry nahi.":["इस समय की वृद्धि एंट्री नहीं है।","No growth entries for this period."],"Is samay mein koi entry nahi.":["इस समय में कोई एंट्री नहीं।","No entries in this period."],"Is samay naape":["इस समय नापे गए","Measured in period"],"Isi bachche ka record dekho":["इसी बच्चे का रिकॉर्ड देखें","See this child's record"],"Jaise: photo dhundhli, bachcha ro raha tha":["जैसे: फ़ोटो धुंधली, बच्चा रो रहा था","e.g. photo blurred, child was crying"],"Janm tithi (DOB)":["जन्म तिथि","Date of birth"],"Jodo":["जोड़ें","Add"],"Kam se kam 6 akshar.":["कम से कम 6 अक्षर।","At least 6 characters."],"Kam se kam ek bachcha chunein.":["कम से कम एक बच्चा चुनें।","Choose at least one child."],"Kis bachche ko doodh dena hai? Naam dabao":["किस बच्चे को दूध देना है? नाम दबाएँ","Which child gets milk? Tap the name"],"Koi AWC nahi":["कोई आंगनवाड़ी नहीं","No AWC"],"Koi AWC nahi mila.":["कोई आंगनवाड़ी नहीं मिली।","No AWC found."],"Koi account nahi mila.":["कोई अकाउंट नहीं मिला।","No account found."],"Koi bachcha registered nahi.":["कोई बच्चा पंजीकृत नहीं।","No children registered."],"Koi data nahi.":["कोई डेटा नहीं।","No data."],"● Koi badlav nahi":["● कोई बदलाव नहीं","● No change"],"Kuch galat hua.":["कुछ गड़बड़ हुई।","Something went wrong."],"Lambai":["लंबाई","Height"],"Lambai (cm) *":["लंबाई (सेमी) *","Height (cm) *"],"Lambai cm":["लंबाई सेमी","Height cm"],"List nahi aayi":["सूची नहीं आई","List did not load"],"Live camera nahi chal raha. 'Phone camera se' button use karein.":["लाइव कैमरा नहीं चल रहा। 'फ़ोन कैमरा से' बटन इस्तेमाल करें।","Live camera is not working. Use the 'Phone camera' button."],"Load ho raha hai…":["लोड हो रहा है…","Loading…"],"Login":["लॉगिन","Login"],"Login ho raha hai…":["लॉगिन हो रहा है…","Logging in…"],"Logout":["लॉगआउट","Logout"],"MCP card":["MCP कार्ड","MCP card"],"Maa":["माँ","Mother"],"Maa ka chehra":["माँ का चेहरा","Mother's face"],"Maa ka naam *":["माँ का नाम *","Mother's name *"],"Maa ya saath aane wale kam se kam ek vyakti ka chehra jodein.":["माँ या साथ आने वाले कम से कम एक व्यक्ति का चेहरा जोड़ें।","Add the face of the mother or at least one person who comes with the child."],"Mahina":["महीना","Month"],"Masked Aadhaar (sirf last 4 ank dikhein)":["मास्क्ड आधार (सिर्फ़ आख़िरी 4 अंक दिखें)","Masked Aadhaar (only last 4 digits visible)"],"Match kar rahe hain…":["मिलान हो रहा है…","Matching…"],"Matched":["मिल गया","Matched"],"Mausi":["मौसी","Aunt (mausi)"],"Mera Data":["मेरा डेटा","My Data"],"Mera data":["मेरा डेटा","My data"],"Mere AWC":["मेरी आंगनवाड़ी","My AWCs"],"Mere sabhi AWC":["मेरी सभी आंगनवाड़ी","All my AWCs"],"Mere sabhi sector":["मेरे सभी सेक्टर","All my sectors"],"Mere sector":["मेरे सेक्टर","My sectors"],"Meri entries aur report":["मेरी एंट्री और रिपोर्ट","My entries and report"],"Milk Ambassador":["मिल्क एम्बेसडर","Milk Ambassador"],"Milk Ambassador ke hisaab se":["मिल्क एम्बेसडर के हिसाब से","By Milk Ambassador"],"Milk Supplementation · Login":["दूध पूरक कार्यक्रम · लॉगिन","Milk Supplementation · Login"],"Mobile":["मोबाइल","Mobile"],"Mobile (optional)":["मोबाइल (वैकल्पिक)","Mobile (optional)"],"Mobile 10 ank ka sahi number ho, ya khali chhod dein.":["मोबाइल 10 अंकों का सही नंबर हो, या ख़ाली छोड़ दें।","Mobile must be a valid 10-digit number, or leave it empty."],"Mobile number * (ek number se ek hi account)":["मोबाइल नंबर * (एक नंबर से एक ही अकाउंट)","Mobile number * (one account per number)"],"Monthly":["मासिक","Monthly"],"Naam *":["नाम *","Name *"],"Naam aur rishta bharein.":["नाम और रिश्ता भरें।","Fill in name and relation."],"Naam chunein, phir unka chehra scan hoga. Doodh bachcha centre par hi piyega.":["नाम चुनें, फिर उनका चेहरा स्कैन होगा। दूध बच्चा केंद्र पर ही पिएगा।","Choose the name, then their face will be scanned. The child drinks the milk at the centre."],"Naam se dhundho":["नाम से खोजें","Search by name"],"Naam, username ya mobile":["नाम, यूज़रनेम या मोबाइल","Name, username or mobile"],"Naapne ka mahina *":["नापने का महीना *","Month of measurement *"],"Nahi":["नहीं","No"],"Nahi (No)":["नहीं","No"],"Nahi hua":["नहीं हुआ","Not done"],"Nahi piya":["नहीं पिया","Did not drink"],"Nahi, wapas jao":["नहीं, वापस जाएँ","No, go back"],"Nana":["नाना","Grandfather (nana)"],"Nani":["नानी","Grandmother (nani)"],"Naya bachcha":["नया बच्चा","New child"],"Naya chehra":["नया चेहरा","New photo"],"Naya password (kam se kam 6 akshar)":["नया पासवर्ड (कम से कम 6 अक्षर)","New password (at least 6 characters)"],"Naya password set karein":["नया पासवर्ड सेट करें","Set new password"],"Naya vyakti":["नया व्यक्ति","New person"],"Naye AWC ka naam * (jaise: Kersai AWC-1)":["नई आंगनवाड़ी का नाम * (जैसे: Kersai AWC-1)","New AWC name * (e.g. Kersai AWC-1)"],"Naye dekhbhal karne wale (7 din)":["नए देखभाल करने वाले (7 दिन)","New caregivers (7 days)"],"Not matched":["नहीं मिला","Not matched"],"Override":["ओवरराइड","Override"],"Override ka kaaran *":["ओवरराइड का कारण *","Reason for override *"],"Override ka kaaran likhein.":["ओवरराइड का कारण लिखें।","Write the reason for override."],"Override karo":["ओवरराइड करें","Override"],"Papa":["पापा","Father"],"Parivar se jodein":["परिवार से जोड़ें","Link from family"],"Password":["पासवर्ड","Password"],"Password * (kam se kam 6 akshar)":["पासवर्ड * (कम से कम 6 अक्षर)","Password * (at least 6 characters)"],"Password kam se kam 6 akshar ka ho.":["पासवर्ड कम से कम 6 अक्षर का हो।","Password must be at least 6 characters."],"Password reset":["पासवर्ड रीसेट","Password reset"],"Pehle 'Report dekho' dabayein.":["पहले 'रिपोर्ट देखें' दबाएँ।","First tap 'View report'."],"Pehle AWC chunein.":["पहले आंगनवाड़ी चुनें।","Choose an AWC first."],"Pehle se registered":["पहले से पंजीकृत","Already registered"],"Pehle wo bachche jinka wajan ghata hai.":["पहले वे बच्चे जिनका वजन घटा है।","Children whose weight went down are shown first."],"Pehli baar setup":["पहली बार सेटअप","First-time setup"],"Phone camera se":["फ़ोन कैमरा से","Phone camera"],"Phone number *":["फ़ोन नंबर *","Phone number *"],"Phone number 10 ank ka sahi number likhein.":["फ़ोन नंबर 10 अंकों का सही लिखें।","Enter a correct 10-digit phone number."],"Photo":["फ़ोटो","Photo"],"Photo kheecho":["फ़ोटो खींचें","Take photo"],"Photo li gayi ✓":["फ़ोटो ली गई ✓","Photo taken ✓"],"Photo mein chehra nahi mila. Bachche ka chehra paas se, seedha aur roshni mein rakh kar dobara photo lein.":["फ़ोटो में चेहरा नहीं मिला। बच्चे का चेहरा पास से, सीधा और रोशनी में रखकर दोबारा फ़ोटो लें।","No face in the photo. Retake with the child's face close, straight and in good light."],"Photo mein chehra nahi mila. Paas se, seedha aur roshni mein dobara lein.":["फ़ोटो में चेहरा नहीं मिला। पास से, सीधा और रोशनी में दोबारा लें।","No face in the photo. Retake close, straight and in good light."],"Pichhle":["पिछले","Previous"],"Pichhle record":["पिछले रिकॉर्ड","Previous records"],"Pichhle record load ho rahe hain…":["पिछले रिकॉर्ड लोड हो रहे हैं…","Loading previous records…"],"Pichla hafta":["पिछला हफ़्ता","Last week"],"Poora Aadhaar number dikhe to photo na lein.":["पूरा आधार नंबर दिखे तो फ़ोटो न लें।","Do not photograph if the full Aadhaar number is visible."],"Poora https:// wala link paste karein.":["पूरा https:// वाला लिंक पेस्ट करें।","Paste the full https:// link."],"Poora naam *":["पूरा नाम *","Full name *"],"Poora sector":["पूरा सेक्टर","Whole sector"],"Poori Report":["पूरी रिपोर्ट","Full Report"],"Prakar":["प्रकार","Type"],"Pura":["पूरा","Full"],"Pura (Full)":["पूरा","Full"],"Pura (Full) — centre mein":["पूरा — केंद्र में","Full — at the centre"],"Qtr":["चौथाई","Qtr"],"Quarter":["चौथाई","Quarter"],"Quarterly":["तिमाही","Quarterly"],"Record ke liye har mahine nayi photo.":["रिकॉर्ड के लिए हर महीने नई फ़ोटो।","A new photo every month for the record."],"Record ke liye. Pehchaan saath aane wale vyakti ke chehre se hogi.":["रिकॉर्ड के लिए। पहचान साथ आने वाले व्यक्ति के चेहरे से होगी।","For the record. Identification is by the accompanying person's face."],"Record sudhar diya":["रिकॉर्ड सुधार दिया","Record corrected"],"Refresh":["रीफ़्रेश","Refresh"],"Register karo":["पंजीकरण करें","Register"],"Registered":["पंजीकृत","Registered"],"Registered bachche":["पंजीकृत बच्चे","Registered children"],"Registration":["पंजीकरण","Registration"],"Regn.":["पंजीकरण","Regn."],"Replaced":["बदला गया","Replaced"],"Report ban rahi hai…":["रिपोर्ट बन रही है…","Preparing report…"],"Report dekho":["रिपोर्ट देखें","View report"],"Reports":["रिपोर्ट","Reports"],"Rishta *":["रिश्ता *","Relation *"],"Role":["भूमिका","Role"],"Roz ke submissions":["रोज़ की एंट्री","Daily submissions"],"Roz ki doodh entry":["रोज़ की दूध एंट्री","Daily milk entries"],"Roz ki entry":["रोज़ की एंट्री","Daily entries"],"Saari entries":["सभी एंट्री","All entries"],"Saath aane wala vyakti":["साथ आने वाला व्यक्ति","Accompanying person"],"Saath aaye vyakti":["साथ आए व्यक्ति","Accompanying person"],"Sab AWC, sab ambassador, CSV, Sheet":["सभी आंगनवाड़ी, सभी एम्बेसडर, CSV, शीट","All AWCs, all ambassadors, CSV, Sheet"],"Sab ho gaye ✓":["सब हो गए ✓","All done ✓"],"Sabhi AWC":["सभी आंगनवाड़ी","All AWCs"],"Sabhi AWC (poora project)":["सभी आंगनवाड़ी (पूरा प्रोजेक्ट)","All AWCs (whole project)"],"Sabhi ambassador":["सभी एम्बेसडर","All ambassadors"],"Sabhi role":["सभी भूमिकाएँ","All roles"],"Sabhi sector":["सभी सेक्टर","All sectors"],"Sahi tareekh chunein (from, to se pehle ho).":["सही तारीख़ चुनें (शुरू की तारीख़ आख़िरी से पहले हो)।","Choose valid dates (start must be before end)."],"Same":["बराबर","Same"],"Save ho raha hai…":["सेव हो रहा है…","Saving…"],"Save hua":["सेव हुआ","Saved"],"Save karo":["सेव करें","Save"],"Save nahi hua.":["सेव नहीं हुआ।","Not saved."],"Se (from)":["से","From"],"Sector":["सेक्टर","Sector"],"Sector aur AWC ke hisaab se ginti":["सेक्टर और आंगनवाड़ी के हिसाब से गिनती","Counts by sector and AWC"],"Sector ke hisaab se":["सेक्टर के हिसाब से","By sector"],"Seedha chehra, roshni mein.":["सीधा चेहरा, रोशनी में।","Face straight, in good light."],"Senior Management":["वरिष्ठ प्रबंधन","Senior Management"],"Server ka jawab samajh nahi aaya. Server link sahi hai?":["सर्वर का जवाब समझ नहीं आया। सर्वर लिंक सही है?","Could not understand the server reply. Is the server link correct?"],"Server link":["सर्वर लिंक","Server link"],"Server link badlo":["सर्वर लिंक बदलें","Change server link"],"Server link set nahi hai.":["सर्वर लिंक सेट नहीं है।","Server link is not set."],"Server se jud gaye.":["सर्वर से जुड़ गए।","Connected to server."],"Set karo":["सेट करें","Set"],"Star (*) wale khane bharein.":["स्टार (*) वाले खाने भरें।","Fill the fields marked with a star (*)."],"Submission Report":["सबमिशन रिपोर्ट","Submission Report"],"Submission report (CSV)":["सबमिशन रिपोर्ट (CSV)","Submission report (CSV)"],"Submissions":["सबमिशन","Submissions"],"Tak (to)":["तक","To"],"Taken home":["घर ले गए","Taken home"],"Tareekh":["तारीख़","Date"],"Test ya dummy account":["टेस्ट या नकली अकाउंट","Test or dummy account"],"Theek hai":["ठीक है","OK"],"Unlock":["अनलॉक करें","Unlock"],"User ID ban gaya":["यूज़र ID बन गई","User ID created"],"User ID banao":["यूज़र ID बनाएँ","Create user ID"],"Username":["यूज़रनेम","Username"],"Username * (chhote angrezi akshar/number, jaise pooja.k)":["यूज़रनेम * (छोटे अंग्रेज़ी अक्षर/अंक, जैसे pooja.k)","Username * (small English letters/numbers, e.g. pooja.k)"],"Users / Accounts":["यूज़र / अकाउंट","Users / Accounts"],"Wajan":["वजन","Weight"],"Wajan (kg) *":["वजन (किलो) *","Weight (kg) *"],"Wajan (kg) aur lambai (cm) bharein.":["वजन (किलो) और लंबाई (सेमी) भरें।","Enter weight (kg) and height (cm)."],"Wajan / Lambai":["वजन / लंबाई","Weight / Height"],"Wajan / lambai update":["वजन / लंबाई अपडेट","Weight / height update"],"Wajan aur lambai bharein.":["वजन और लंबाई भरें।","Enter weight and height."],"Wajan badha":["वजन बढ़ा","Weight up"],"▲ Wajan badha":["▲ वजन बढ़ा","▲ Weight up"],"▼ Wajan ghata":["▼ वजन घटा","▼ Weight down"],"Wajan graph":["वजन ग्राफ़","Weight graph"],"Wajan ka graph":["वजन का ग्राफ़","Weight graph"],"Wajan kg":["वजन किलो","Weight kg"],"Wajan/lambai save ho gaya":["वजन/लंबाई सेव हो गई","Weight/height saved"],"Wapas chalu karo":["फिर से चालू करें","Re-enable"],"Web app URL":["वेब ऐप URL","Web app URL"],"Weekly":["साप्ताहिक","Weekly"],"Ye bachcha pehle se registered hai":["यह बच्चा पहले से पंजीकृत है","This child is already registered"],"Ye bachcha pehle se registered hai.":["यह बच्चा पहले से पंजीकृत है।","This child is already registered."],"Ye bachche kai din se centre nahi aaye. Ghar jaakar pata karein.":["ये बच्चे कई दिनों से केंद्र नहीं आए। घर जाकर पता करें।","These children have not come to the centre for several days. Please visit their homes."],"Ye photo khul nahi payi. Doosri photo lein.":["यह फ़ोटो खुल नहीं पाई। दूसरी फ़ोटो लें।","This photo could not be opened. Take another one."],"Yes":["हाँ","Yes"],"No":["नहीं","No"],"✓ Mil gaya":["✓ मिल गया","✓ Given"],"aaj mil gaya":["आज मिल गया","given today"],"badla gaya":["बदला गया","replaced"],"(badla gaya)":["(बदला गया)","(replaced)"],"ko aaj doodh mila":["को आज दूध मिला","got milk today"],"ko aaj doodh":["को आज दूध","got milk today"],"ko aaj doodh mil chuka hai.":["को आज दूध मिल चुका है।","have got milk today."],"pura piya":["पूरा पिया","drank fully"],"Mahina (Month)":["महीना","Month"],"— chunein —":["— चुनें —","— choose —"],"Is hafta:":["इस हफ़्ते:","This week:"],"Pichla hafta:":["पिछला हफ़्ता:","Last week:"],"Kullukera":["Kullukera","Kullukera"],"Aaj doodh piya":["आज दूध पिया","Milk today"],"Hinglish":["Hinglish","Hinglish"],"Bhasha":["भाषा","Language"],"Mahine":["महीने","Months"],"Har din":["हर दिन","Every day"],"Sun":["रवि","Sun"],"Mon":["सोम","Mon"],"Tue":["मंगल","Tue"],"Wed":["बुध","Wed"],"Thu":["गुरु","Thu"],"Fri":["शुक्र","Fri"],"Sat":["शनि","Sat"],"Sector-wise":["सेक्टरवार","Sector-wise"],"Mahina (badla gaya)":["महीना (बदला गया)","Month (replaced)"],"3 mahine (badla gaya)":["3 महीने (बदला गया)","3 months (replaced)"],"Aane wale mahine ki entry nahi ho sakti.":["आने वाले महीने की एंट्री नहीं हो सकती।","Entries cannot be made for a future month."],"Aapke role mein bachchon ki list nahi hai.":["आपकी भूमिका में बच्चों की सूची नहीं है।","Your role does not include the children list."],"Aapke role mein data entry ki anumati nahi hai.":["आपकी भूमिका में डेटा एंट्री की अनुमति नहीं है।","Your role is not allowed to enter data."],"Account band hai.":["अकाउंट बंद है।","Account is disabled."],"Account nahi mila.":["अकाउंट नहीं मिला।","Account not found."],"Apna 10 ank ka sahi mobile number likhein. Ek mobile number se ek hi account banta hai.":["अपना 10 अंकों का सही मोबाइल नंबर लिखें। एक मोबाइल नंबर से एक ही अकाउंट बनता है।","Enter a correct 10-digit mobile number. Only one account per mobile number."],"Apne khud ke account par ye nahi kar sakte.":["अपने ख़ुद के अकाउंट पर यह नहीं कर सकते।","You cannot do this on your own account."],"Bachcha nahi mila.":["बच्चा नहीं मिला।","Child not found."],"Bachche ka naam, maa ka naam aur AWC zaroori hai.":["बच्चे का नाम, माँ का नाम और आंगनवाड़ी ज़रूरी है।","Child's name, mother's name and AWC are required."],"Bachche ki photo aur ID card ki photo dono zaroori hain.":["बच्चे की फ़ोटो और पहचान पत्र की फ़ोटो दोनों ज़रूरी हैं।","Both the child's photo and the ID card photo are required."],"Chehre ka data nahi mila.":["चेहरे का डेटा नहीं मिला।","Face data not found."],"Dekhbhal karne wale ka naam aur rishta likhein.":["देखभाल करने वाले का नाम और रिश्ता लिखें।","Enter the caregiver's name and relation."],"District Management access code galat hai. Admin se code lein.":["ज़िला प्रबंधन का एक्सेस कोड ग़लत है। एडमिन से कोड लें।","District Management access code is wrong. Get the code from admin."],"Dobara login karein.":["दोबारा लॉगिन करें।","Please log in again."],"Field Coordinator access code galat hai. Admin se code lein.":["फ़ील्ड कोऑर्डिनेटर का एक्सेस कोड ग़लत है। एडमिन से कोड लें।","Field Coordinator access code is wrong. Get the code from admin."],"Galat kaam.":["ग़लत काम।","Invalid action."],"Is mobile number se pehle se ek account bana hua hai. Naya account nahi banega. Password bhool gaye hain to admin se sampark karein.":["इस मोबाइल नंबर से पहले से एक अकाउंट बना हुआ है। नया अकाउंट नहीं बनेगा। पासवर्ड भूल गए हैं तो एडमिन से संपर्क करें।","An account already exists with this mobile number. A new account cannot be created. If you forgot the password, contact the admin."],"Kam se kam ek AWC chunein.":["कम से कम एक आंगनवाड़ी चुनें।","Choose at least one AWC."],"Kam se kam ek sector chunein.":["कम से कम एक सेक्टर चुनें।","Choose at least one sector."],"Login ka samay khatam. Dobara login karein.":["लॉगिन का समय ख़त्म। दोबारा लॉगिन करें।","Session expired. Please log in again."],"Mahina sahi nahi hai.":["महीना सही नहीं है।","Month is not valid."],"Naya password kam se kam 6 akshar ka ho.":["नया पासवर्ड कम से कम 6 अक्षर का हो।","New password must be at least 6 characters."],"Override ki anumati khatam ho gayi. Coordinator se dobara override karwayein.":["ओवरराइड की अनुमति ख़त्म हो गई। कोऑर्डिनेटर से दोबारा ओवरराइड करवाएँ।","Override permission expired. Ask the coordinator to override again."],"Override sirf Field Coordinator ya District Management kar sakte hain.":["ओवरराइड सिर्फ़ फ़ील्ड कोऑर्डिनेटर या ज़िला प्रबंधन कर सकते हैं।","Only a Field Coordinator or District Management can override."],"Phone number 10 ankon ka sahi number ho.":["फ़ोन नंबर 10 अंकों का सही नंबर हो।","Phone number must be a valid 10-digit number."],"Photo bahut badi hai.":["फ़ोटो बहुत बड़ी है।","Photo is too large."],"Photo ka format sahi nahi hai.":["फ़ोटो का फ़ॉर्मेट सही नहीं है।","Photo format is not valid."],"Poora naam likhein.":["पूरा नाम लिखें।","Enter the full name."],"Role chunein.":["भूमिका चुनें।","Choose a role."],"Senior Management access code galat hai. Admin se code lein.":["वरिष्ठ प्रबंधन का एक्सेस कोड ग़लत है। एडमिन से कोड लें।","Senior Management access code is wrong. Get the code from admin."],"Tareekh sahi chunein.":["तारीख़ सही चुनें।","Choose a valid date."],"Wajan aur lambai dono bharein.":["वजन और लंबाई दोनों भरें।","Enter both weight and height."],"Wajan/lambai sahi number mein likhein.":["वजन/लंबाई सही संख्या में लिखें।","Enter weight/height as valid numbers."],"Ye account band hai. Admin se baat karein.":["यह अकाउंट बंद है। एडमिन से बात करें।","This account is disabled. Talk to the admin."],"Ye account hata diya gaya hai. Naya account banayein.":["यह अकाउंट हटा दिया गया है। नया अकाउंट बनाएँ।","This account has been removed. Create a new account."],"Ye bachcha aapke dwara registered nahi hai.":["यह बच्चा आपके द्वारा पंजीकृत नहीं है।","This child was not registered by you."],"Ye sirf District Management ke liye hai.":["यह सिर्फ़ ज़िला प्रबंधन के लिए है।","This is only for District Management."],"Ye username pehle se liya hua hai. Doosra chunein.":["यह यूज़रनेम पहले से लिया हुआ है। दूसरा चुनें।","This username is already taken. Choose another."],"Ye vyakti is bachche ke saath juda nahi hai.":["यह व्यक्ति इस बच्चे के साथ जुड़ा नहीं है।","This person is not linked to this child."],"Galat username ya password.":["ग़लत यूज़रनेम या पासवर्ड।","Wrong username or password."],"Username ya password galat hai.":["यूज़रनेम या पासवर्ड ग़लत है।","Wrong username or password."],"Coordinator ka username ya password galat hai.":["कोऑर्डिनेटर का यूज़रनेम या पासवर्ड ग़लत है।","Coordinator's username or password is wrong."],"Diya":["दिया","Given"],"Full piya":["पूरा पिया","Drank full"],"Half piya":["आधा पिया","Drank half"],"Quarter piya":["चौथाई पिया","Drank quarter"],"override":["ओवरराइड","override"],"Bachcha inhi mein se kisi ke saath centre aayega, aur doodh ke waqt inka chehra scan hoga. Pehle":["बच्चा इन्हीं में से किसी के साथ केंद्र आएगा, और दूध के समय इनका चेहरा स्कैन होगा। पहले","The child will come to the centre with one of these people, and their face is scanned at milk time. First add the"],"ka chehra jodein, phir papa, dadi, nani…":["का चेहरा जोड़ें, फिर पापा, दादी, नानी…","'s face, then father, grandmother…"],"Jan":["जन","Jan"],"Feb":["फ़र","Feb"],"Mar":["मार्च","Mar"],"Apr":["अप्रैल","Apr"],"May":["मई","May"],"Jun":["जून","Jun"],"Jul":["जुल","Jul"],"Aug":["अग","Aug"],"Sep":["सित","Sep"],"Oct":["अक्टू","Oct"],"Nov":["नव","Nov"],"Dec":["दिस","Dec"],"Bhasha badlo":["भाषा बदलें","Change language"]};
const I18N_RX = [[new RegExp("^(Suprabhat|Namaste|Shubh sandhya), (.+)$"), "{G}, $2", "{G}, $2"],
[new RegExp("^(\\d+) / (\\d+) ko aaj doodh mil chuka hai\\.$"), "$1 / $2 बच्चों को आज दूध मिल चुका है।", "$1 / $2 children have got milk today."],
[new RegExp("^\u2014 Bachcha chunein \\((\\d+)\\) \u2014$"), "— बच्चा चुनें ($1) —", "— Choose child ($1) —"],
[new RegExp("^Pichhle record \\((\\d+)\\)$"), "पिछले रिकॉर्ड ($1)", "Previous records ($1)"],
[new RegExp("^Ye entry is mahine ki hogi: (.+)$"), "यह एंट्री इस महीने की होगी: $1", "This entry is for the month: $1"],
[new RegExp("^Ye entry is quarter ki hogi: (.+)$"), "यह एंट्री इस तिमाही की होगी: $1", "This entry is for the quarter: $1"],
[new RegExp("^(\\d+) / (\\d+) aaj$"), "$1 / $2 आज", "$1 / $2 today"],
[new RegExp("^(.+) ko aaj doodh pehle hi diya ja chuka hai\\.$"), "$1 को आज दूध पहले ही दिया जा चुका है।", "$1 has already been given milk today."],
[new RegExp("^Is (quarter|mahine) ka record pehle se hai$"), "इस {Q} का रिकॉर्ड पहले से है", "A record for this {QE} already exists"],
[new RegExp("^(\\d+) bachchon ka growth record \u00b7 is samay mein (\\d+) naape gaye(?: \u00b7 (\\d+) ki abhi ek hi entry)?$"), "$1 बच्चों का वृद्धि रिकॉर्ड · इस समय में $2 नापे गए{ONE}", "Growth records of $1 children · $2 measured in this period{ONEE}"],
[new RegExp("^(\\d+) bachchon ka pichhli entry se mukabla(?: \u00b7 (\\d+) bachchon ki abhi ek hi entry hai)?$"), "$1 बच्चों की पिछली एंट्री से तुलना", "$1 children compared with their previous entry"],
[new RegExp("^(\\d+) entry$"), "$1 एंट्री", "$1 entries"],
[new RegExp("^(\\d+) second mein Home\\)$"), "$1 सेकंड में होम)", "home in $1 seconds)"],
[new RegExp("^Download: (.+)$"), "डाउनलोड: $1", "Download: $1"],
[new RegExp("^Save hua: (.+)$"), "सेव हुआ: $1", "Saved: $1"],
[new RegExp("^User ID ban gaya: (.+)$"), "यूज़र ID बन गई: $1", "User ID created: $1"],
[new RegExp("^Bahut baar galat password daala gaya\\. Ye account (\\d+) minute ke liye band hai\\. Baad mein koshish karein\\.$"), "बहुत बार ग़लत पासवर्ड डाला गया। यह अकाउंट $1 मिनट के लिए बंद है। बाद में कोशिश करें।", "Too many wrong passwords. This account is locked for $1 minutes. Try again later."],
[new RegExp("^(\\d+) baar galat password\\. Account (\\d+) minute ke liye band kar diya gaya hai\\.$"), "$1 बार ग़लत पासवर्ड। अकाउंट $2 मिनट के लिए बंद कर दिया गया है।", "$1 wrong passwords. The account has been locked for $2 minutes."],
[new RegExp("^Aaj: (.+)$"), "आज: $1", "Today: $1"],
[new RegExp("^(.+) ka chehra mila$"), "$1 का चेहरा मिला", "$1's face matched"],
[new RegExp("^Pichhle \\((.+)\\) se: (.+)$"), "पिछले ($1) से: $2", "Since previous ($1): $2"],
[new RegExp("^Maa: (.+)$"), "माँ: $1", "Mother: $1"],
[new RegExp("^(Username ya password galat hai\\.|Coordinator ka username ya password galat hai\\.) (\\d+) koshish baaki, uske baad account (\\d+) minute ke liye band ho jayega\\.$"), "{W} $2 कोशिश बाकी, उसके बाद अकाउंट $3 मिनट के लिए बंद हो जाएगा।", "{WE} $2 tries left, then the account will be locked for $3 minutes."],
[new RegExp("^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\\d{4})$"), "{M} $2", "$1 $2"],
[new RegExp("^(\\S+) se (\\S+)$"), "$1 से $2", "$1 to $2"],
[new RegExp("^(.+) ke saath$"), "$1 के साथ", "with $1"],
[new RegExp("^Chehra nahi mila: (.+)$"), "चेहरा नहीं मिला: $1", "Face not matched: $1"],
[new RegExp("^(.+) cm$"), "$1 सेमी", "$1 cm"],
[new RegExp("^(\\d+) entry$"), "$1 एंट्री", "$1 entries"],
[new RegExp("^\u00b7 (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\\d{4})$"), "· {M} $2", "· $1 $2"]];
/* ---------------- language: Hinglish (base) / Hindi / English ----------------
   The app is written in Hinglish. For Hindi or English, every text on screen is
   swapped through the I18N dictionary below (and a few patterns for sentences with numbers). */
let LANG = ["hl", "hi", "en"].includes(store.get("mt.lang")) ? store.get("mt.lang") : "hl";
const I18N_G = { "Suprabhat": ["सुप्रभात", "Good morning"], "Namaste": ["नमस्ते", "Hello"], "Shubh sandhya": ["शुभ संध्या", "Good evening"] };
const I18N_MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function trText(s){
  if (LANG === "hl" || !s) return s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2].replace(/\s+/g, " ");
  if (!core || !/[A-Za-z]/.test(core)) return s;
  let t = trCore(core);
  if (t === null && core.includes(" · ")){              // "Full piya · Kullukera 1": translate each part
    const parts = core.split(" · ").map(x => { const y = trCore(x.trim()); return y === null ? x : y; });
    t = parts.join(" · ");
  }
  return t === null ? s : m[1] + t + m[3];
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
      .replace("{Q}", g[1] === "quarter" ? "तिमाही" : "महीने").replace("{QE}", g[1] === "quarter" ? "quarter" : "month")
      .replace("{ONE}", g[3] ? ` · ${g[3]} की अभी एक ही एंट्री` : "").replace("{ONEE}", g[3] ? ` · ${g[3]} have only one entry` : "")
      .replace("{W}", (I18N_D[g[1]] || [g[1], g[1]])[0]).replace("{WE}", (I18N_D[g[1]] || [g[1], g[1]])[1])
      .replace("{M}", (I18N_D[g[1]] || [g[1], g[1]])[0]);
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

/* ---------------- boot ---------------- */
roleChanged();
if (WEB){ S.api = "web"; $("#changeServer").hidden = true; }
if (!S.api) show("setup");
else if (!S.token || !S.user) show("auth");
else { show("home"); api("me").then(r => { S.user = r.user; store.set("mt.user", JSON.stringify(r.user)); renderHome(); }).catch(() => {}); }
setTimeout(loadModels, 300);
window.__booted = true; if (window.__hideSplash) window.__hideSplash(); else { const bootEl = document.getElementById("boot"); if (bootEl) bootEl.hidden = true; }
})();
