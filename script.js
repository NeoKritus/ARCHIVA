/* ================================================================
   ARCHIVA — Subject database (Anna University, Regulation 2023, ECE)
   Transcribed from the finalized CGPA_CALCULATOR_NEW.py
   ================================================================ */

const GRADE_POINTS = { "O":10, "A+":9, "A":8, "B+":7, "B":6, "C":5, "U":0, "RA":0, "SA":0, "W":0 };
const ARREAR_GRADES = new Set(["U","RA","SA","W"]);
const GRADE_ORDER = ["O","A+","A","B+","B","C","U","RA","SA","W"];

const SEMESTERS = {
  1: [
    ["CY3151","Engineering Chemistry",3],
    ["GE3153","Programming in C",4],
    ["GE3154","Heritage of Tamils",1],
    ["GE3155","Engineering Drawing",4],
    ["GE3162","English Laboratory - I",1],
    ["HS3151","English for Communication - I",3],
    ["MA3151","Matrices and Calculus",4],
    ["PH3151","Engineering Physics",3],
    ["PH3161","Physics Laboratory",1],
  ],
  2: [
    ["CY3161","Chemistry Laboratory",1],
    ["EC3201","Circuit Theory",3],
    ["EC3202","Data Structures and Programming in C++",4],
    ["EC3211","Electronic Devices and Circuits Laboratory",2],
    ["GE3251","Tamils and Technology",1],
    ["GE3261","English Laboratory - II",1],
    ["HS3251","English for Communication - II",3],
    ["MA3251","Ordinary Differential Equations and Transform Techniques",4],
    ["PH3204","Physics of Semiconductors and Devices",3],
  ],
  3: [
    ["EC23301","Electromagnetic Fields",3],
    ["EC23302","Signals and Systems",3],
    ["EC23C02","Analog Circuits Design",4],
    ["EC23C13","Digital Electronics and System Design",4],
    ["MA23C03","Linear Algebra and Numerical Methods",4],
    ["EC23S01","Numerical and Signal Processing Practice through Python",2],
  ],
  4: [
    ["EC23401","Digital Signal Processing",4],
    ["EC23402","Transmission Lines",3],
    ["EC23403","Analog and Baseband Communication",4],
    ["EC23C05","Analog Electronic System Design",4],
    ["EC23C10","Computer Architecture and Organization",3],
    ["EC23C11","Control Systems",3],
    ["EC23S02","PCB Design Using CAD Tools for Electronic Systems",2],
    ["EC23L01","Self Learning Course",1],
  ],
  5: [
    ["EC23501","Antenna and Wave Propagation",4],
    ["EC23502","Digital Communication",4],
    ["EC23C21","Microprocessors and Microcontrollers",4],
    ["EC23503","Communication Networks",4],
    ["UC23E01","Engineering Entrepreneurship Development",3],
    ["PEC-I","Professional Elective - I",3],
    ["IOC-I","Industry Oriented Course I",1],
  ],
  6: [
    ["EC23601","Wireless Communications",4],
    ["EC23602","Machine Learning",3],
    ["EC23C14","Digital VLSI Design",4],
    ["EC23S12","RTL Design and Synthesis",2],
    ["EC23U02","Perspectives of Sustainable Development",3],
    ["ETC-I","Emerging Technology - I",3],
    ["OEC-I","Open Elective - I",3],
    ["IOC-II","Industry Oriented Course II",1],
  ],
};

/* ================================================================
   ARCHIVA — Application logic
   ================================================================ */

const APP_NAME = "ARCHIVA";
const STORAGE_KEY = "archiva_session_v1";

/* ---------------- State ---------------- */
const state = {
  student: { name: "", roll: "", department: "Electronics Engineering", regulation: "2023" },
  selectedSemesters: new Set(),
  activeSemester: 1,
  grades: {},          // { "SEM-CODE": "A+" }
  calculated: false,
  cgpa: 0,
  reportOpen: false,
};

function gradeKey(sem, code){ return sem + "-" + code; }

/* ---------------- Persistence ---------------- */
function saveState(){
  try{
    const payload = {
      student: state.student,
      selectedSemesters: [...state.selectedSemesters],
      activeSemester: state.activeSemester,
      grades: state.grades,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }catch(e){ /* storage unavailable — fail silently */ }
}
function loadSavedPayload(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}
function clearSavedState(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
}

/* ---------------- Calculation ---------------- */
function computeSemesterGPA(sem){
  const subjects = SEMESTERS[sem] || [];
  let credits = 0, points = 0;
  let hasArrear = false;
  const arrears = [];
  subjects.forEach(([code, name, credit]) => {
    const g = state.grades[gradeKey(sem, code)];
    if(!g) return;
    if(ARREAR_GRADES.has(g)){
      hasArrear = true;
      arrears.push({ sem, code, name, credit, grade: g });
    } else {
      credits += credit;
      points += credit * GRADE_POINTS[g];
    }
  });
  const gpa = credits > 0 ? points / credits : 0;
  return { credits, points, gpa, arrears };
}

function computeOverall(){
  const semesters = [...state.selectedSemesters].sort((a,b)=>a-b);
  let totalCredits = 0, totalPoints = 0;
  const perSem = {};
  const allArrears = [];
  const summaryRows = [];
  semesters.forEach(sem => {
    const r = computeSemesterGPA(sem);
    perSem[sem] = r;
    totalCredits += r.credits;
    totalPoints += r.points;
    allArrears.push(...r.arrears);
    const cumGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    summaryRows.push({ sem, credits: r.credits, points: r.points, gpa: r.gpa, cgpa: cumGpa });
  });
  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return { semesters, perSem, totalCredits, totalPoints, cgpa, arrears: allArrears, summaryRows };
}

function isSemesterComplete(sem){
  const subjects = SEMESTERS[sem] || [];
  return subjects.every(([code]) => !!state.grades[gradeKey(sem, code)]);
}

/* ---------------- Validation (Feature 7) ---------------- */
const ROLL_REGEX = /^20[2-9]\d\d{6}$/; // 2020+ year prefix, 6 trailing digits

function validateName(showError){
  const val = els.studentName.value.trim();
  const ok = val.length > 0;
  toggleFieldError(els.fieldName, showError && !ok);
  return ok;
}
function validateRoll(showError){
  const val = els.rollNumber.value.trim().toUpperCase();
  const ok = ROLL_REGEX.test(val);
  toggleFieldError(els.fieldRoll, showError && !ok);
  return ok;
}
function toggleFieldError(fieldEl, show){
  fieldEl.classList.toggle("has-error", !!show);
}

/* ---------------- DOM refs ---------------- */
const els = {};
function cacheEls(){
  [
    "studentName","rollNumber","department","regulation",
    "fieldName","fieldRoll","fieldDept","fieldReg",
    "semTabs","semPanelTitle","semPanelGpa","semTableWrap","gradeErrorMsg","semSelectError",
    "calcBtn","resultStage","cgpaValue","viewReportBtn","reportBlock",
    "reportStudentInfo","reportSemesters","reportSummaryTable","reportArrears","reportOverallCgpa",
    "downloadBtn","downloadPanel","shareBtn","sharePanel","shareCopy","shareTo",
    "themeSwitch","menuToggle","menuPanel","menuReset","menuHelp","menuAbout","menuPrivacy",
    "resetModal","confirmReset","helpModal","aboutModal",
    "pdfPreviewModal","pdfPreviewFrame","pdfPreviewTitle","pdfPreviewDownloadBtn",
    "recoverBanner","restoreRecover","dismissRecover",
    "toast","toastText",
  ].forEach(id => els[id] = document.getElementById(id));
}

/* ---------------- Rendering: Semester folder tabs ---------------- */
function renderSemList(){
  const semNums = Object.keys(SEMESTERS).map(Number);
  els.semTabs.innerHTML = semNums.map(sem => {
    const selected = state.selectedSemesters.has(sem);
    const active = state.activeSemester === sem;
    const r = selected ? computeSemesterGPA(sem) : null;
    return `<div class="sem-tab ${selected?'selected':''} ${active?'active':''}" data-sem="${sem}">
      <span class="dot"></span><span>Sem ${sem}</span>
      ${selected && r && r.credits>0 ? `<span class="gpa-tag">${r.gpa.toFixed(2)}</span>` : ""}
    </div>`;
  }).join("");

  els.semTabs.querySelectorAll(".sem-tab").forEach(elm => {
    elm.addEventListener("click", () => {
      const sem = Number(elm.dataset.sem);
      toggleSemesterSelection(sem);
    });
  });
}

function toggleSemesterSelection(sem){
  if(state.selectedSemesters.has(sem)){
    // clicking an already-selected, already-active semester toggles it off;
    // clicking a selected-but-inactive semester just makes it active
    if(state.activeSemester === sem){
      state.selectedSemesters.delete(sem);
      const remaining = [...state.selectedSemesters];
      state.activeSemester = remaining.length ? remaining[0] : sem;
    } else {
      state.activeSemester = sem;
    }
  } else {
    state.selectedSemesters.add(sem);
    state.activeSemester = sem;
  }
  clearSemSelectError();
  renderAll();
  saveState();
}
function clearSemSelectError(){
  els.semSelectError.style.color = "";
  els.semSelectError.textContent = "";
}

/* ---------------- Rendering: subject table ---------------- */
function renderSubjectTable(){
  const sem = state.activeSemester;
  const subjects = SEMESTERS[sem] || [];
  els.semPanelTitle.textContent = "Semester " + sem;

  const rows = subjects.map(([code, name, credit], idx) => {
    const g = state.grades[gradeKey(sem, code)] || "";
    const missing = !g;
    const options = ['<option value="">Select</option>'].concat(
      GRADE_ORDER.map(gr => `<option value="${gr}" ${gr===g?'selected':''}>${gr}</option>`)
    ).join("");
    return `<tr class="${missing?'grade-missing':''}" data-code="${code}">
      <td data-label="S.No">${idx+1}</td>
      <td class="code" data-label="Code">${code}</td>
      <td data-label="Subject">${name}</td>
      <td class="credit" data-label="Credit">${credit}</td>
      <td data-label="Grade"><select class="grade-select ${g && ARREAR_GRADES.has(g)?'arrear':''}" data-code="${code}">${options}</select></td>
    </tr>`;
  }).join("");

  els.semTableWrap.innerHTML = `<table class="subjects">
    <thead><tr><th>S.No</th><th>Code</th><th>Subject</th><th>Credit</th><th>Grade</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  els.semTableWrap.querySelectorAll("select.grade-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const code = sel.dataset.code;
      const val = sel.value;
      if(val){ state.grades[gradeKey(sem, code)] = val; }
      else { delete state.grades[gradeKey(sem, code)]; }
      sel.classList.toggle("arrear", val && ARREAR_GRADES.has(val));
      sel.closest("tr").classList.toggle("grade-missing", !val);
      renderSemList(); // update the GPA tag / dots without losing focus badly
      updateSemGpaLine();
      saveState();
    });
  });

  updateSemGpaLine();
  const hasSelection = state.selectedSemesters.size > 0;
  els.semTableWrap.parentElement.style.opacity = state.selectedSemesters.has(sem) ? "1" : ".5";
}
function updateSemGpaLine(){
  const sem = state.activeSemester;
  if(!state.selectedSemesters.has(sem)){
    els.semPanelGpa.textContent = "";
    return;
  }
  const r = computeSemesterGPA(sem);
  els.semPanelGpa.innerHTML = `Semester GPA&nbsp; <b>${r.credits>0 ? r.gpa.toFixed(2) : "—"}</b>`;
}

/* ---------------- Calculate ---------------- */
function runCalculate(){
  const nameOk = validateName(true);
  const rollOk = validateRoll(true);

  if(state.selectedSemesters.size === 0){
    els.semSelectError.style.color = "var(--error)";
    els.semSelectError.textContent = "Select at least one semester.";
    if(!nameOk) els.studentName.focus(); 
    return;
  }
  clearSemSelectError();

  const incomplete = [...state.selectedSemesters].filter(sem => !isSemesterComplete(sem));
  if(incomplete.length){
    state.activeSemester = incomplete[0];
    renderSemList(); renderSubjectTable();
    els.gradeErrorMsg.textContent = "Complete the remaining grades before calculating.";
    els.gradeErrorMsg.classList.remove("hidden");
    els.semTableWrap.scrollIntoView({behavior:"smooth", block:"center"});
    return;
  }
  els.gradeErrorMsg.classList.add("hidden");

  if(!nameOk || !rollOk){
    els.studentDetailsCard && els.studentDetailsCard.scrollIntoView({behavior:"smooth", block:"center"});
    document.getElementById("studentDetailsCard").scrollIntoView({behavior:"smooth", block:"center"});
    return;
  }

  state.student.name = els.studentName.value.trim();
  state.student.roll = els.rollNumber.value.trim().toUpperCase();

  const result = computeOverall();
  state.calculated = true;
  state.cgpa = result.cgpa;
  state.reportOpen = false;

  els.cgpaValue.textContent = result.cgpa.toFixed(2);
  els.resultStage.classList.add("show");
  els.reportBlock.classList.remove("show");
  // replay the stamp-landing animation on every calculation
  const stampEl = document.querySelector(".stamp");
  if(stampEl){ stampEl.style.animation = "none"; void stampEl.offsetWidth; stampEl.style.animation = ""; }
  els.viewReportBtn.textContent = "View Complete Academic Report";
  renderReport(result);
  els.resultStage.scrollIntoView({behavior:"smooth", block:"start"});
  saveState();
}

/* ---------------- Complete report (website UI) ---------------- */
function renderReport(result){
  els.reportStudentInfo.innerHTML = `
    <div><span>Student Name</span><b>${escapeHtml(state.student.name)}</b></div>
    <div><span>Roll Number</span><b>${escapeHtml(state.student.roll)}</b></div>
    <div><span>Department</span><b>${escapeHtml(state.student.department)}</b></div>
    <div><span>Regulation</span><b>${escapeHtml(state.student.regulation)}</b></div>
  `;

  els.reportSemesters.innerHTML = result.semesters.map(sem => {
    const r = result.perSem[sem];
    const subjects = SEMESTERS[sem];
    const rows = subjects.map(([code,name,credit],i) => {
      const g = state.grades[gradeKey(sem,code)];
      return `<tr><td class="num">${i+1}</td><td>${code}</td><td>${name}</td><td class="num">${credit}</td><td class="num">${g}</td></tr>`;
    }).join("");
    return `<div class="report-section">
      <h4>Semester ${sem}</h4>
      <table class="report-table">
        <thead><tr><th>S.No</th><th>Code</th><th>Subject</th><th>Credit</th><th>Grade</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="sem-gpa-line" style="margin-top:8px;">Semester GPA&nbsp;<b>${r.gpa.toFixed(2)}</b></div>
    </div>`;
  }).join("");

  els.reportSummaryTable.innerHTML = `<table class="report-table">
    <thead><tr><th>S.No</th><th>Semester</th><th>Credits</th><th>Credit Points</th><th>GPA</th><th>CGPA</th></tr></thead>
    <tbody>${result.summaryRows.map((r,i)=>`<tr><td class="num">${i+1}</td><td class="num">${r.sem}</td><td class="num">${r.credits}</td><td class="num">${r.points}</td><td class="num">${r.gpa.toFixed(2)}</td><td class="num">${r.cgpa.toFixed(2)}</td></tr>`).join("")}</tbody>
  </table>`;

  const arrearSection = document.getElementById("reportArrearsSection");
  if(result.arrears.length){
    if(arrearSection) arrearSection.style.display = "";
    els.reportArrears.innerHTML = `<table class="report-table">
      <thead><tr><th>S.No</th><th>Semester</th><th>Code</th><th>Subject</th><th>Grade</th></tr></thead>
      <tbody>${result.arrears.map((a,i)=>`<tr><td class="num">${i+1}</td><td class="num">${a.sem}</td><td>${a.code}</td><td>${a.name}</td><td class="num">${a.grade}</td></tr>`).join("")}</tbody>
    </table>`;
  } else {
    if(arrearSection) arrearSection.style.display = "none";
    els.reportArrears.innerHTML = "";
  }

  els.reportOverallCgpa.textContent = result.cgpa.toFixed(2);
}
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

/* ---------------- Master render ---------------- */
function renderAll(){
  renderSemList();
  renderSubjectTable();
}

/* ---------------- Theme ---------------- */
function setTheme(mode){
  document.documentElement.setAttribute("data-theme", mode);
  try{ localStorage.setItem("archiva_theme", mode); }catch(e){}
  const isDark = mode === "dark";
  if(els.themeIconTop){
    els.themeIconTop.innerHTML = isDark
      ? '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
      : '<path d="M21 12.6A9 9 0 1111.4 3a7 7 0 009.6 9.6z"/>';
  }
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme");
  setTheme(cur === "dark" ? "light" : "dark");
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function showToast(msg){
  msg = String(msg || "").toUpperCase();
  els.toastText.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> els.toast.classList.remove("show"), 2600);
}

/* ---------------- Panels (download/share/menu) ---------------- */
function closeAllPanels(except){
  [els.downloadPanel, els.sharePanel, els.menuPanel].forEach(p => {
    if(p !== except) p.classList.remove("show");
  });
}
document.addEventListener("click", (e) => {
  const isTrigger = e.target.closest("#downloadBtn,#shareBtn,#menuToggle");
  const isPanel = e.target.closest(".action-panel");
  if(!isTrigger && !isPanel) closeAllPanels(null);
});

/* ---------------- Reset ---------------- */
function performReset(){
  state.student = { name:"", roll:"", department:"Electronics Engineering", regulation:"2023" };
  state.selectedSemesters = new Set();
  state.activeSemester = 1;
  state.grades = {};
  state.calculated = false;
  state.cgpa = 0;

  els.studentName.value = "";
  els.rollNumber.value = "";
  toggleFieldError(els.fieldName, false);
  toggleFieldError(els.fieldRoll, false);
  els.gradeErrorMsg.classList.add("hidden");
  clearSemSelectError();
  els.resultStage.classList.remove("show");
  els.reportBlock.classList.remove("show");

  renderAll();
  clearSavedState();
  showToast("All data has been reset.");
}

/* ---------------- Init & wiring ---------------- */
function init(){
  cacheEls();

  const savedTheme = (()=>{ try{ return localStorage.getItem("archiva_theme"); }catch(e){ return null; }})();
  setTheme(savedTheme === "light" ? "light" : "dark");

  renderAll();
  initStarfield();

  // Field validation on blur
  els.studentName.addEventListener("blur", () => validateName(true));
  els.studentName.addEventListener("input", () => toggleFieldError(els.fieldName, false));
  els.rollNumber.addEventListener("blur", () => validateRoll(true));
  els.rollNumber.addEventListener("input", () => toggleFieldError(els.fieldRoll, false));

  els.calcBtn.addEventListener("click", runCalculate);

  els.viewReportBtn.addEventListener("click", () => {
    state.reportOpen = !state.reportOpen;
    els.reportBlock.classList.toggle("show", state.reportOpen);
    els.viewReportBtn.textContent = state.reportOpen ? "Hide Complete Academic Report" : "View Complete Academic Report";
  });

  // Theme controls
  els.themeSwitch.addEventListener("click", toggleTheme);

  // Menu
  els.menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const willShow = !els.menuPanel.classList.contains("show");
    closeAllPanels(null);
    els.menuPanel.classList.toggle("show", willShow);
  });
  els.menuReset.addEventListener("click", () => { closeAllPanels(null); openModal(els.resetModal); });
  els.menuHelp.addEventListener("click", () => { closeAllPanels(null); openModal(els.helpModal); });
  els.menuAbout.addEventListener("click", () => { closeAllPanels(null); openModal(els.aboutModal); });
  if(els.menuPrivacy){ els.menuPrivacy.addEventListener("click", () => { closeAllPanels(null); openModal(document.getElementById("privacyModal")); }); }
  els.confirmReset.addEventListener("click", () => { performReset(); closeModal(els.resetModal); });

  // Download panel
  els.downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willShow = !els.downloadPanel.classList.contains("show");
    closeAllPanels(null);
    els.downloadPanel.classList.toggle("show", willShow);
  });
  els.downloadPanel.querySelectorAll("button[data-report]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeAllPanels(null);
      openPdfPreview(btn.dataset.report);
    });
  });

  // Share panel
  els.shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willShow = !els.sharePanel.classList.contains("show");
    closeAllPanels(null);
    els.sharePanel.classList.toggle("show", willShow);
  });
  els.shareCopy.addEventListener("click", () => { closeAllPanels(null); copyResultText(); });
  els.sharePanel.querySelectorAll(".share-pdf").forEach(btn => {
    btn.addEventListener("click", () => { closeAllPanels(null); sharePdf(btn.dataset.report); });
  });
  els.shareTo.addEventListener("click", () => { closeAllPanels(null); shareToGeneric(); });

  // Modal close wiring
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(document.getElementById(btn.dataset.close)));
  });
  document.querySelectorAll(".modal-backdrop").forEach(bd => {
    bd.addEventListener("click", (e) => { if(e.target === bd) closeModal(bd); });
  });

  els.pdfPreviewDownloadBtn.addEventListener("click", downloadCurrentPreviewPdf);

  // Session recovery
  const saved = loadSavedPayload();
  if(saved && (saved.student?.name || saved.selectedSemesters?.length)){
    els.recoverBanner.classList.add("show");
  }
  els.restoreRecover.addEventListener("click", () => {
    if(saved){
      state.student = Object.assign(state.student, saved.student || {});
      state.selectedSemesters = new Set(saved.selectedSemesters || []);
      state.activeSemester = saved.activeSemester || (state.selectedSemesters.values().next().value) || 1;
      state.grades = saved.grades || {};
      els.studentName.value = state.student.name || "";
      els.rollNumber.value = state.student.roll || "";
      renderAll();
      showToast("Session restored.");
    }
    els.recoverBanner.classList.remove("show");
  });
  els.dismissRecover.addEventListener("click", () => {
    els.recoverBanner.classList.remove("show");
    clearSavedState();
  });

  els.studentName.addEventListener("input", saveState);
  els.rollNumber.addEventListener("input", saveState);

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      document.querySelectorAll(".modal-backdrop.show").forEach(closeModal);
      closeAllPanels(null);
    }
  });
}

function openModal(el){ el.classList.add("show"); }
function closeModal(el){ el.classList.remove("show"); }

/* ---------------- Starfield (Feature 9 — Milky Way background) ---------------- */
function initStarfield(){
  const canvas = document.getElementById("starfield");
  // The current UI does not always include the optional starfield canvas.
  // Never let that optional visual effect stop the application logic.
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.round((canvas.width * canvas.height) / 9000);
    stars = Array.from({length: count}, () => ({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.15 + 0.2,
      phase: Math.random()*Math.PI*2,
      speed: Math.random()*0.015 + 0.004,
    }));
  }
  let t = 0;
  function frame(){
    t += 1;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#cdd8ff";
    stars.forEach(s => {
      const twinkle = 0.55 + 0.45*Math.sin(t*s.speed + s.phase);
      ctx.globalAlpha = Math.max(0, twinkle) * 0.85;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
}

document.addEventListener("DOMContentLoaded", init);

/* ================================================================
   PDF GENERATION (Feature 1 / 5) + SHARE (Feature 2)
   ================================================================ */

function buildResultTextSummary(result){
  const lines = [];
  lines.push("ACADEMIC RESULT");
  lines.push("");
  lines.push(`Student Name : ${state.student.name}`);
  lines.push(`Roll Number  : ${state.student.roll}`);
  lines.push(`Department   : ${state.student.department}`);
  lines.push(`Regulation   : ${state.student.regulation}`);
  lines.push("");
  result.semesters.forEach(sem => {
    lines.push(`Semester ${sem} GPA : ${result.perSem[sem].gpa.toFixed(2)}`);
  });
  lines.push("");
  lines.push(`Overall CGPA : ${result.cgpa.toFixed(2)}`);
  if(result.arrears.length > 0){ lines.push(`Arrear Count : ${result.arrears.length}`); }
  return lines.join("\n");
}

function copyResultText(){
  const result = computeOverall();
  const text = buildResultTextSummary(result);
  navigator.clipboard?.writeText(text).then(() => {
    showToast("Result copied to clipboard.");
  }).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
    showToast("Result copied to clipboard.");
  });
}

/* ---- PDF GENERATION: REPLACED WITH REFERENCE HTML ENGINE ---- */
/* PDF seal policy: capture the exact View Complete Academic Report seal; use a clean box fallback only if capture fails. */
function pdfUpper(value){ return String(value ?? "").toUpperCase(); }

function addReferenceWatermarkAndPage(doc, pageNum){
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.saveGraphicsState();
  doc.setTextColor(178,52,43);
  doc.setFont("courier","bold"); doc.setFontSize(28);
  if(doc.setGState && doc.GState) doc.setGState(new doc.GState({opacity:.08}));
  doc.text("ARCHIVA", w/2, h/2, {align:"center", angle:45});
  doc.restoreGraphicsState();
  doc.setDrawColor(210,204,188); doc.setLineWidth(.25);
  doc.line(14,h-18,w-14,h-18);
  doc.setTextColor(90,86,78); doc.setFont("courier","normal"); doc.setFontSize(8);
  doc.text(String(pageNum), w/2, h-11, {align:"center"});
}

function ensurePdfEngine(){
  if(!window.jspdf || !window.jspdf.jsPDF || !window.jspdf.jsPDF.API || !window.jspdf.jsPDF.API.autoTable){
    throw new Error("PDF ENGINE IS UNAVAILABLE. CHECK YOUR INTERNET CONNECTION AND TRY AGAIN.");
  }
}
function ledgerPdfBase(doc){
  const w=doc.internal.pageSize.getWidth(), h=doc.internal.pageSize.getHeight();
  doc.setFillColor(249,247,240); doc.rect(0,0,w,h,"F");
  doc.setDrawColor(218,213,200); doc.setLineWidth(.18);
  for(let y=30;y<h-24;y+=7) doc.line(14,y,w-14,y);
}
function referencePdfHeader(doc, title){
  ledgerPdfBase(doc);
  const w=doc.internal.pageSize.getWidth();
  doc.setFillColor(31,32,35); doc.rect(0,0,w,24,"F");
  doc.setFillColor(190,58,48); doc.rect(0,22,w,2,"F");
  doc.setTextColor(245,241,230); doc.setFont("courier","bold"); doc.setFontSize(12);
  doc.text("ARCHIVA  /  ACADEMIC LEDGER",14,14);
  doc.setTextColor(31,32,35); doc.setFont("times","bold"); doc.setFontSize(16);
  doc.text(pdfUpper(title),14,36);
  doc.setDrawColor(190,58,48); doc.setLineWidth(.8); doc.line(14,40,w-14,40);
  const name=pdfUpper(state.student.name), roll=pdfUpper(state.student.roll), dept=pdfUpper(state.student.department);
  doc.setFont("courier","bold"); doc.setFontSize(8); doc.setTextColor(75,70,62);
  doc.text(`STUDENT NAME  : ${name}`,14,48);
  doc.text(`ROLL NUMBER   : ${roll}`,14,54);
  doc.text(`DEPARTMENT    : ${dept}`,14,60);
  doc.text(`REGULATION    : ${pdfUpper(state.student.regulation)}`,14,66);
}
function referenceAutoTable(doc, options){
  if(typeof doc.autoTable!=="function") throw new Error("PDF TABLE ENGINE IS UNAVAILABLE.");
  const base={
    margin:{left:14,right:14,bottom:24},
    theme:"grid",
    styles:{font:"courier",fontSize:8,cellPadding:2.4,textColor:[38,37,35],lineColor:[175,169,156],lineWidth:.2,overflow:"linebreak"},
    headStyles:{fillColor:[31,32,35],textColor:[248,244,235],fontStyle:"bold",font:"courier"},
    alternateRowStyles:{fillColor:[244,241,232]},
    tableLineColor:[190,58,48],tableLineWidth:.35
  };
  doc.autoTable({...base,...options,styles:{...base.styles,...(options.styles||{})},headStyles:{...base.headStyles,...(options.headStyles||{})}});
}
function ledgerSection(doc,title,y){
  const w=doc.internal.pageSize.getWidth();
  doc.setFillColor(190,58,48); doc.rect(14,y,w-28,7,"F");
  doc.setTextColor(255,250,242); doc.setFont("courier","bold"); doc.setFontSize(9);
  doc.text(pdfUpper(title),18,y+4.8); return y+10;
}

async function captureReferenceSealImage(result){
  /* Capture the actual web seal used above “View Complete Academic Report”.
     This makes the PDF seal a direct visual copy instead of a separately
     redrawn approximation. */
  const source = document.querySelector('.result-stage .stamp-wrap > .report-final-seal');
  if(!source || !window.html2canvas) return null;

  if(document.fonts && document.fonts.ready){
    try{ await document.fonts.ready; }catch(e){}
  }

  const clone = source.cloneNode(true);
  clone.querySelectorAll('.seal-score').forEach(el=>{ el.textContent=result.cgpa.toFixed(2); });
  clone.removeAttribute('id');
  clone.style.setProperty('--archiva-seal-size','300px');
  clone.style.width='300px';
  clone.style.height='300px';
  clone.style.maxWidth='none';
  clone.style.margin='0';
  clone.style.visibility='visible';

  const host=document.createElement('div');
  host.setAttribute('aria-hidden','true');
  host.style.cssText='position:fixed;left:-10000px;top:0;width:320px;height:320px;display:flex;align-items:center;justify-content:center;overflow:visible;pointer-events:none;z-index:-1;';
  host.appendChild(clone);
  document.body.appendChild(host);

  try{
    const canvas=await window.html2canvas(host,{
      backgroundColor:null,
      scale:3,
      logging:false,
      useCORS:true,
      allowTaint:false
    });
    return canvas.toDataURL('image/png');
  }catch(err){
    return null;
  }finally{
    host.remove();
  }
}

function drawCleanSealFallbackPdf(doc, result, centerY){
  /* Final clean PDF fallback:
     - shorter double-outline box
     - no rules above/below the CGPA
     - balanced vertical spacing
     - footer kept safely away from the border */
  const w=doc.internal.pageSize.getWidth();
  const boxW=120, boxH=50, x=(w-boxW)/2, y=centerY-boxH/2;
  const cx=w/2;

  doc.saveGraphicsState();

  /* Shorter, professional double border. */
  doc.setDrawColor(178,58,46); doc.setLineWidth(.75);
  doc.roundedRect(x,y,boxW,boxH,2.6,2.6,'S');
  doc.setDrawColor(190,58,48); doc.setLineWidth(.22);
  doc.roundedRect(x+4,y+4,boxW-8,boxH-8,1.4,1.4,'S');

  /* Ruled-paper background remains continuous through the full box. */
  doc.setDrawColor(218,213,200); doc.setLineWidth(.18);
  for(let ly=30;ly<y+boxH;ly+=7){
    if(ly>y+4) doc.line(x+4,ly,x+boxW-4,ly);
  }

  /* Heading. */
  doc.setTextColor(75,70,62); doc.setFont('courier','bold'); doc.setFontSize(8.8);
  doc.text('ARCHIVA · ACADEMIC LEDGER',cx,y+9,{align:'center'});

  /* CGPA label. */
  doc.setTextColor(178,58,46); doc.setFont('courier','bold'); doc.setFontSize(9.4);
  doc.text('CGPA',cx,y+16,{align:'center'});

  /* Clean score presentation — intentionally no line above or below. */
  const scoreY=y+31;
  doc.setTextColor(178,58,46); doc.setFont('times','bolditalic'); doc.setFontSize(30);
  doc.text(result.cgpa.toFixed(2),cx,scoreY,{align:'center'});

  /* Comfortable spacing below the CGPA. */
  doc.setTextColor(75,70,62); doc.setFont('courier','bold'); doc.setFontSize(7.6);
  doc.text('OUT OF 10.00',cx,y+39,{align:'center'});

  /* Footer sits clearly inside the border with safe bottom breathing room. */
  doc.setTextColor(178,58,46); doc.setFont('courier','bold'); doc.setFontSize(7.0);
  doc.text('SEALED RESULT · ARCHIVA',cx,y+44,{align:'center'});

  doc.restoreGraphicsState();
}
async function drawArchivaSealPdf(doc, result, centerY){
  const sealImage=await captureReferenceSealImage(result);
  const w=doc.internal.pageSize.getWidth();
  if(sealImage){
    /* The image is captured directly from the same DOM seal used on the page. */
    const size=76;
    doc.addImage(sealImage,'PNG',(w-size)/2,centerY-size/2,size,size,undefined,'FAST');
    return;
  }
  drawCleanSealFallbackPdf(doc,result,centerY);
}

function summaryTableRows(result){
  return result.summaryRows.map((r,i)=>[
    i+1,
    `SEMESTER ${r.sem}`,
    r.credits,
    r.points,
    r.gpa.toFixed(2),
    r.cgpa.toFixed(2)
  ]);
}

async function generateShortPdf(result){
  ensurePdfEngine(); const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:"mm",format:"a4"});
  referencePdfHeader(doc,"ACADEMIC RESULT");
  let y=76;
  y=ledgerSection(doc,"SEMESTER-WISE SUMMARY",y);
  referenceAutoTable(doc,{
    startY:y,
    head:[["S.NO","SEMESTER","CREDITS","CREDIT POINTS","GPA","CGPA"]],
    body:summaryTableRows(result),
    styles:{fontSize:7.7,halign:"center"}
  });
  y=doc.lastAutoTable.finalY+12;
  await drawArchivaSealPdf(doc,result,Math.min(y+35,245));
  addReferenceWatermarkAndPage(doc,1);
  return doc;
}

async function generateFullPdf(result){
  ensurePdfEngine(); const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:"mm",format:"a4"}); referencePdfHeader(doc,"COMPLETE ACADEMIC REPORT");
  let y=76;
  result.semesters.forEach(sem=>{
    if(y>238){doc.addPage();referencePdfHeader(doc,"COMPLETE ACADEMIC REPORT");y=76;}
    y=ledgerSection(doc,`SEMESTER ${sem}`,y);
    const rows=(SEMESTERS[sem]||[]).map((subject,i)=>{
      const[code,name,credit]=subject;
      return[i+1,pdfUpper(code),pdfUpper(name),credit,pdfUpper(state.grades[gradeKey(sem,code)]||"")];
    });
    referenceAutoTable(doc,{startY:y,head:[["S.NO","SUBJECT CODE","SUBJECT NAME","CREDIT","GRADE"]],body:rows,tableWidth:182,columnStyles:{0:{cellWidth:14},1:{cellWidth:28},2:{cellWidth:88},3:{cellWidth:22},4:{cellWidth:30}}});
    y=doc.lastAutoTable.finalY+7;
    doc.setFont("courier","bold"); doc.setFontSize(9); doc.setTextColor(190,58,48);
    doc.text(`SEMESTER GPA : ${result.perSem[sem].gpa.toFixed(2)}`,14,y); y+=12;
  });

  // Semester-wise summary must come immediately after all semester details.
  if(y>225){doc.addPage();referencePdfHeader(doc,"SEMESTER-WISE SUMMARY");y=76;}
  y=ledgerSection(doc,"SEMESTER-WISE SUMMARY",y);
  referenceAutoTable(doc,{
    startY:y,
    head:[["S.NO","SEMESTER","CREDITS","CREDIT POINTS","GPA","CGPA"]],
    body:summaryTableRows(result),
    styles:{fontSize:7.7,halign:"center"}
  });
  y=doc.lastAutoTable.finalY+12;

  // Overall result follows the semester-wise summary.
  if(y>225){doc.addPage();referencePdfHeader(doc,"OVERALL RESULT");y=76;}
  y=ledgerSection(doc,"OVERALL RESULT",y);
  referenceAutoTable(doc,{startY:y,head:[["TOTAL CREDITS","TOTAL CREDIT POINTS","OVERALL CGPA"]],body:[[result.totalCredits,result.totalPoints,result.cgpa.toFixed(2)]],styles:{fontSize:9,halign:"center"}});
  y=doc.lastAutoTable.finalY+10;

  if(result.arrears.length){
    if(y>220){doc.addPage();referencePdfHeader(doc,"ARREAR DETAILS");y=76;}
    y=ledgerSection(doc,"ARREAR DETAILS",y);
    const rows=result.arrears.slice().sort((a,b)=>a.sem-b.sem).map((a,i)=>[i+1,a.sem,pdfUpper(a.code),pdfUpper(a.name),pdfUpper(a.grade)]);
    referenceAutoTable(doc,{startY:y,head:[["S.NO","SEMESTER","SUBJECT CODE","SUBJECT NAME","GRADE"]],body:rows});
    y=doc.lastAutoTable.finalY+12;
  }

  if(y>230){doc.addPage();referencePdfHeader(doc,"COMPLETE ACADEMIC REPORT");y=76;}
  await drawArchivaSealPdf(doc,result,Math.min(y+38,245));
  for(let pg=1;pg<=doc.getNumberOfPages();pg++){doc.setPage(pg);addReferenceWatermarkAndPage(doc,pg);}
  return doc;
}

let currentPreviewDoc = null;
let currentPreviewName = "";

let previewRenderToken = 0;

async function renderPdfCanvasPreview(doc){
  const host = document.getElementById('pdfPreviewCanvasHost');
  const frame = els.pdfPreviewFrame;
  if(!host) return;
  const token = ++previewRenderToken;
  host.innerHTML = '';
  host.classList.add('is-empty');
  host.textContent = 'PREPARING PDF PREVIEW…';
  if(frame){ frame.style.display='none'; frame.src='about:blank'; }

  try{
    if(!window.pdfjsLib) throw new Error('PDF PREVIEW ENGINE IS UNAVAILABLE.');
    if(!pdfjsLib.GlobalWorkerOptions.workerSrc){
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    const data = new Uint8Array(doc.output('arraybuffer'));
    const pdf = await pdfjsLib.getDocument({data}).promise;
    if(token !== previewRenderToken) return;
    host.innerHTML='';
    host.classList.remove('is-empty');

    const available = Math.max(280, host.clientWidth - 16);
    for(let pageNumber=1; pageNumber<=pdf.numPages; pageNumber++){
      if(token !== previewRenderToken) return;
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({scale:1});
      const scale = Math.min(2, Math.max(1, available / base.width));
      const viewport = page.getViewport({scale});
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', {alpha:false});
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({canvasContext:context, viewport}).promise;
      if(token !== previewRenderToken) return;
      host.appendChild(canvas);
    }
  }catch(err){
    // Keep a desktop/browser fallback if PDF.js cannot load.
    host.innerHTML='';
    host.classList.add('is-empty');
    host.textContent='PDF preview is unavailable in this browser. Use OPEN or DOWNLOAD to view the PDF.';
    if(frame){
      const blobUrl = doc.output('bloburl');
      frame.src = blobUrl;
      frame.style.display='block';
    }
  }
}

async function openPdfPreview(type){
  try{
    const result = computeOverall();
    const doc = type === "short" ? await generateShortPdf(result) : await generateFullPdf(result);
    currentPreviewDoc = doc;
    const rollPart = state.student.roll ? "_" + String(state.student.roll).toUpperCase() : "";
    currentPreviewName = ((type === "short" ? "ARCHIVA_ACADEMIC_RESULT" : "ARCHIVA_COMPLETE_REPORT") + rollPart + ".PDF").toUpperCase();

    els.pdfPreviewTitle.textContent = type === "short" ? "ACADEMIC RESULT PDF" : "COMPLETE ACADEMIC REPORT PDF";
    openModal(els.pdfPreviewModal);
    renderPdfCanvasPreview(doc);
  }catch(err){
    showToast(err?.message || "Could not prepare the PDF.");
  }
}
function downloadCurrentPreviewPdf(){
  if(!currentPreviewDoc) return;
  currentPreviewDoc.save(currentPreviewName);
  closeModal(els.pdfPreviewModal);
  showToast("DOWNLOAD STARTED.");
}

async function sharePdf(type){
  let doc, filename, file;
  try{
    const result = computeOverall();
    doc = type === "short" ? await generateShortPdf(result) : await generateFullPdf(result);
    const rollPart = state.student.roll ? "_" + String(state.student.roll).toUpperCase() : "";
    filename = ((type === "short" ? "ARCHIVA_ACADEMIC_RESULT" : "ARCHIVA_COMPLETE_REPORT") + rollPart + ".PDF").toUpperCase();
    const blob = doc.output("blob");
    file = new File([blob], filename, { type: "application/pdf" });
  }catch(err){
    showToast(err?.message || "Could not prepare the PDF.");
    return;
  }

  if(navigator.canShare && navigator.canShare({ files: [file] })){
    try{
      await navigator.share({ files: [file], title: "ARCHIVA Academic Result" });
      return;
    }catch(e){
      /* If the user closes/cancels the native share sheet, do nothing. */
      if(e && (e.name === "AbortError" || e.name === "NotAllowedError")){
        return;
      }
      /* For other genuine sharing failures, continue to the download fallback. */
    }
  }
  doc.save(filename);
  showToast("Sharing isn't supported here — PDF downloaded instead.");
}

async function shareToGeneric(){
  const result = computeOverall();
  const text = buildResultTextSummary(result);
  if(navigator.share){
    try{
      await navigator.share({ title: "ARCHIVA Academic Result", text });
      return;
    }catch(e){ /* cancelled */ }
  } else {
    copyResultText();
  }
}

/* ================================================================
   ARCHIVA — All Feature Completion Layer
   Keeps the existing UI/UX intact and completes the requested workflow:
   Download, Share, PDF Preview, Watermark, Page Numbers, Validation,
   Theme, Reset, Help, About and Session Recovery.
   ================================================================ */
(function(){
  function hasCalculatedResult(){
    if(!state.calculated){
      showToast("CALCULATE & SEAL THE COMPLETED RECORD FIRST.");
      return false;
    }
    return true;
  }

  // Prevent incomplete data from being exported or shared.
  const originalOpenPdfPreview = openPdfPreview;
  openPdfPreview = function(type){
    if(!hasCalculatedResult()) return;
    originalOpenPdfPreview(type);
  };

  const originalSharePdf = sharePdf;
  sharePdf = async function(type){
    if(!hasCalculatedResult()) return;
    return originalSharePdf(type);
  };

  const originalShareToGeneric = shareToGeneric;
  shareToGeneric = async function(){
    if(!hasCalculatedResult()) return;
    return originalShareToGeneric();
  };

  const originalCopyResultText = copyResultText;
  copyResultText = async function(){
    if(!hasCalculatedResult()) return;
    return originalCopyResultText();
  };

  // Save all editable student fields as part of session recovery.
  function bindSessionField(id, key){
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('change', function(){
      state.student[key] = el.value;
      state.calculated = false;
      state.reportOpen = false;
      if(els.resultStage) els.resultStage.classList.remove('show');
      saveState();
    });
  }
  bindSessionField('department','department');
  bindSessionField('regulation','regulation');

  // Changing identity details invalidates a previously sealed result.
  ['studentName','rollNumber'].forEach(function(id){
    const el=document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', function(){
      if(state.calculated){
        state.calculated=false;
        state.reportOpen=false;
        els.resultStage.classList.remove('show');
      }
    });
  });

  // Persist the current session when the page is closed or refreshed.
  window.addEventListener('beforeunload', function(){ saveState(); });

  // Improve keyboard access without changing the visual UI.
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closeAllPanels(null);
      document.querySelectorAll('.modal-backdrop.show').forEach(function(m){ m.classList.remove('show'); });
    }
  });

  // Make semester items keyboard-operable.
  function improveSemesterAccessibility(){
    const tabs=document.querySelectorAll('#semTabs .sem-tab');
    tabs.forEach(function(tab){
      tab.setAttribute('tabindex','0');
      tab.setAttribute('role','button');
      tab.addEventListener('keydown',function(e){
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); tab.click(); }
      });
    });
  }
  const originalRenderSemList = renderSemList;
  renderSemList = function(){ originalRenderSemList(); improveSemesterAccessibility(); };
  try{ renderSemList(); }catch(e){ /* DOM not cached yet; init() renders correctly once ready */ }

  // Better reset completion: clear preview state as well.
  const originalPerformReset = performReset;
  performReset = function(){
    currentPreviewDoc=null;
    currentPreviewName='';
    if(els.pdfPreviewFrame) els.pdfPreviewFrame.src='about:blank';
    originalPerformReset();
  };

  // Ensure session recovery also restores department and regulation controls.
  const restoreBtn=document.getElementById('restoreRecover');
  if(restoreBtn){
    restoreBtn.addEventListener('click', function(){
      document.getElementById('department').value = state.student.department || 'Electronics Engineering';
      document.getElementById('regulation').value = state.student.regulation || '2023';
    });
  }
})();

/* ================================================================
   Runtime responsiveness + resilient utility controls
   Works across desktop, mobile, zoom, split-screen and viewport changes.
   ================================================================ */
(function(){
  const root = document.documentElement;
  const app = document.getElementById('app');
  const byId = id => document.getElementById(id);
  const panels = ['downloadPanel','sharePanel','menuPanel'].map(byId).filter(Boolean);
  const modals = Array.from(document.querySelectorAll('.modal-backdrop'));

  function refreshLayout(){
    const width = (app && app.getBoundingClientRect().width) || window.innerWidth || 0;
    const compact = width <= 760;
    const tiny = width <= 480;
    if(app){
      app.dataset.layout = tiny ? 'tiny' : (compact ? 'compact' : 'wide');
    }
    root.style.setProperty('--archiva-vw', width + 'px');
    root.style.setProperty('--archiva-vh', ((window.visualViewport && window.visualViewport.height) || window.innerHeight) + 'px');
  }

  function setThemeSafe(mode){
    const next = mode === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('archiva_theme', next); }catch(e){}
    const icon = byId('themeIconTop');
    if(icon){
      icon.innerHTML = next === 'dark'
        ? '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
        : '<path d="M21 12.6A9 9 0 1111.4 3a7 7 0 009.6 9.6z"/>';
    }
    const switcher = byId('themeSwitch');
    if(switcher){
      switcher.setAttribute('role','switch');
      switcher.setAttribute('aria-checked', String(next === 'dark'));
      switcher.setAttribute('aria-label', 'Toggle light and dark theme');
      switcher.tabIndex = 0;
    }
    const top = byId('themeToggleTop');
    if(top) top.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function toggleThemeSafe(){ setThemeSafe(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); }

  function closePanels(except){ panels.forEach(p => { if(p !== except) p.classList.remove('show'); }); }
  function togglePanel(id, trigger){
    const panel = byId(id);
    if(!panel) return;
    const show = !panel.classList.contains('show');
    closePanels(null);
    panel.classList.toggle('show', show);
    if(trigger) trigger.setAttribute('aria-expanded', String(show));
  }
  function openModalSafe(id){
    const modal = byId(id); if(!modal) return;
    closePanels(null);
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    const first = modal.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    requestAnimationFrame(()=>first && first.focus());
  }
  function closeModalSafe(modal){
    if(!modal) return;
    modal.classList.remove('show');
    if(!document.querySelector('.modal-backdrop.show')) document.body.classList.remove('modal-open');
  }

  // Capture phase makes controls reliable even if older listeners were added earlier.
  document.addEventListener('click', function(e){
    const target = e.target.closest('button,#themeSwitch,[data-close]');
    if(!target) return;
    const id = target.id;
    const modalClose = target.dataset && target.dataset.close;
    if(id === 'themeToggleTop' || id === 'themeSwitch'){
      e.preventDefault(); e.stopImmediatePropagation(); toggleThemeSafe(); return;
    }
    if(id === 'menuToggle'){
      e.preventDefault(); e.stopImmediatePropagation(); togglePanel('menuPanel', target); return;
    }
    if(id === 'menuHelp'){
      e.preventDefault(); e.stopImmediatePropagation(); openModalSafe('helpModal'); return;
    }
    if(id === 'menuAbout'){
      e.preventDefault(); e.stopImmediatePropagation(); openModalSafe('aboutModal'); return;
    }
    if(id === 'menuPrivacy'){
      e.preventDefault(); e.stopImmediatePropagation(); openModalSafe('privacyModal'); return;
    }
    if(id === 'menuReset'){
      e.preventDefault(); e.stopImmediatePropagation(); openModalSafe('resetModal'); return;
    }
    if(id === 'downloadBtn'){
      e.preventDefault(); e.stopImmediatePropagation(); togglePanel('downloadPanel', target); return;
    }
    if(id === 'shareBtn'){
      e.preventDefault(); e.stopImmediatePropagation(); togglePanel('sharePanel', target); return;
    }
    if(modalClose){
      e.preventDefault(); e.stopImmediatePropagation(); closeModalSafe(byId(modalClose)); return;
    }
  }, true);

  document.addEventListener('click', function(e){
    if(!e.target.closest('.action-panel,#menuToggle,#downloadBtn,#shareBtn,#themeSwitch')) closePanels(null);
    if(e.target.classList && e.target.classList.contains('modal-backdrop')) closeModalSafe(e.target);
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closePanels(null);
      document.querySelectorAll('.modal-backdrop.show').forEach(closeModalSafe);
    }
    if((e.key === 'Enter' || e.key === ' ') && e.target && e.target.id === 'themeSwitch'){
      e.preventDefault(); toggleThemeSafe();
    }
  });

  try{
    const saved = localStorage.getItem('archiva_theme');
    setThemeSafe(saved === 'light' ? 'light' : 'dark');
  }catch(e){ setThemeSafe(root.getAttribute('data-theme') || 'dark'); }

  const ro = window.ResizeObserver && app ? new ResizeObserver(refreshLayout) : null;
  if(ro) ro.observe(app);
  window.addEventListener('resize', refreshLayout, {passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', refreshLayout, {passive:true});
    window.visualViewport.addEventListener('scroll', refreshLayout, {passive:true});
  }
  refreshLayout();
})();

/* ================================================================
   ARCHIVA — Core Interaction Repair Layer
   Fixes optional-visual-script failures and guarantees that Calculate,
   Reset and responsive controls remain available.
   ================================================================ */
(function(){
  function ensureReady(){
    try{
      if(!els || !els.calcBtn || !els.studentName) cacheEls();
      if(!document.querySelector('#semTabs .sem-tab')) renderAll();
      return true;
    }catch(err){
      console.error('ARCHIVA initialization repair failed:', err);
      return false;
    }
  }

  function showInteractionError(message){
    try{ showToast(message); }catch(e){}
    const err = document.getElementById('gradeErrorMsg');
    if(err){
      err.textContent = String(message || "").toUpperCase();
      err.classList.remove('hidden');
    }
  }

  function safeCalculate(){
    if(!ensureReady()) return;
    try{
      // Clear any old visible error before validating again.
      const err = document.getElementById('gradeErrorMsg');
      if(err) err.classList.add('hidden');

      const name = document.getElementById('studentName');
      const roll = document.getElementById('rollNumber');

      if(!name || !name.value.trim()){
        name && name.focus();
        showInteractionError('ENTER YOUR STUDENT NAME BEFORE CALCULATING.');
        return;
      }
      if(!roll || !roll.value.trim()){
        roll && roll.focus();
        showInteractionError('ENTER YOUR ROLL NUMBER BEFORE CALCULATING.');
        return;
      }
      if(state.selectedSemesters.size === 0){
        const semError=document.getElementById('semSelectError');
        if(semError){
          semError.textContent='SELECT AT LEAST ONE SEMESTER SHEET BEFORE CALCULATING.';
          semError.style.color='var(--error)';
        }
        showInteractionError('SELECT AT LEAST ONE SEMESTER SHEET.');
        return;
      }

      const incomplete=[...state.selectedSemesters].filter(function(sem){
        return !isSemesterComplete(sem);
      });
      if(incomplete.length){
        state.activeSemester=incomplete[0];
        renderAll();
        const semError=document.getElementById('semSelectError');
        if(semError){
          semError.textContent='COMPLETE EVERY GRADE IN THE SELECTED SEMESTER SHEET(S).';
          semError.style.color='var(--error)';
        }
        showInteractionError('COMPLETE EVERY SUBJECT GRADE, THEN CALCULATE & SEAL.');
        return;
      }

      runCalculate();
      try{ showToast('CGPA CALCULATED AND SEALED SUCCESSFULLY.'); }catch(e){}
    }catch(err){
      console.error('Calculate & Seal error:', err);
      showInteractionError('CALCULATION COULD NOT BE COMPLETED. PLEASE CHECK THE ENTERED RECORD AND TRY AGAIN.');
    }
  }

  function safeReset(){
    if(!ensureReady()) return;
    try{
      currentPreviewDoc = null;
      currentPreviewName = '';
      const frame=document.getElementById('pdfPreviewFrame');
      if(frame) frame.src='about:blank';

      state.student={ name:'', roll:'', department:'Electronics Engineering', regulation:'2023' };
      state.selectedSemesters=new Set();
      state.activeSemester=1;
      state.grades={};
      state.calculated=false;
      state.cgpa=0;
      state.reportOpen=false;

      const name=document.getElementById('studentName');
      const roll=document.getElementById('rollNumber');
      const dept=document.getElementById('department');
      const reg=document.getElementById('regulation');
      if(name) name.value='';
      if(roll) roll.value='';
      if(dept) dept.value='Electronics Engineering';
      if(reg) reg.value='2023';

      if(els.fieldName) toggleFieldError(els.fieldName,false);
      if(els.fieldRoll) toggleFieldError(els.fieldRoll,false);
      if(els.gradeErrorMsg) els.gradeErrorMsg.classList.add('hidden');
      if(els.resultStage) els.resultStage.classList.remove('show');
      if(els.reportBlock) els.reportBlock.classList.remove('show');
      if(els.cgpaValue) els.cgpaValue.textContent='0.00';
      if(els.semSelectError){
        els.semSelectError.textContent='§2 — SELECT ANY SEMESTER(S) TO FILE';
        els.semSelectError.style.color='';
      }

      renderAll();
      clearSavedState();

      const resetModal=document.getElementById('resetModal');
      if(resetModal) resetModal.classList.remove('show');
      document.body.classList.remove('modal-open');
      showToast('ALL ENTERED DATA HAS BEEN RESET.');
    }catch(err){
      console.error('Reset error:',err);
      try{ showToast('RESET COULD NOT COMPLETE. PLEASE REFRESH AND TRY AGAIN.'); }catch(e){}
    }
  }

  // Capture phase guarantees these controls work even if an earlier listener
  // was never attached because an optional visual component failed.
  document.addEventListener('click', function(e){
    const target=e.target.closest('#calcBtn,#confirmReset');
    if(!target) return;
    if(target.id==='calcBtn'){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeCalculate();
      return;
    }
    if(target.id==='confirmReset'){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeReset();
    }
  }, true);

  // Keep controls usable when the page is opened after the DOM is already ready.
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ensureReady, {once:true});
  }else{
    ensureReady();
  }

  // Re-render the live subject sheet when viewport class changes so mobile
  // layouts never retain stale desktop dimensions after rotate/split-screen.
  let lastLayout='';
  function liveLayout(){
    const w=(window.visualViewport && window.visualViewport.width) || window.innerWidth || 0;
    const layout=w<=480?'tiny':(w<=760?'compact':'wide');
    const app=document.getElementById('app');
    if(app) app.dataset.layout=layout;
    if(layout!==lastLayout){
      lastLayout=layout;
      try{ renderSubjectTable(); }catch(e){}
    }
  }
  window.addEventListener('resize',liveLayout,{passive:true});
  window.addEventListener('orientationchange',function(){ setTimeout(liveLayout,120); });
  if(window.visualViewport) window.visualViewport.addEventListener('resize',liveLayout,{passive:true});
  liveLayout();
})();

  // Student name input repair: allow direct typing without address-autofill interference.
  document.addEventListener('input', function(e){
    if(e.target && e.target.id === 'studentName'){
      e.target.setCustomValidity('');
      if(els.fieldName) toggleFieldError(els.fieldName, false);
    }
  }, true);

/* ================================================================
   CHANGE SET 8 — LIVE VALIDATION CLEANUP
   ================================================================ */
(function(){
  function clearResolvedCalculationError(){
    var err = document.getElementById('gradeErrorMsg');
    if(!err) return;
    var text = (err.textContent || '').toUpperCase();
    var name = document.getElementById('studentName');
    var roll = document.getElementById('rollNumber');

    if(name && name.value.trim() &&
       text.indexOf('ENTER YOUR STUDENT NAME BEFORE CALCULATING') !== -1){
      err.textContent = '';
      err.classList.add('hidden');
    }

    if(roll && roll.value.trim() &&
       text.indexOf('ENTER YOUR ROLL NUMBER BEFORE CALCULATING') !== -1){
      err.textContent = '';
      err.classList.add('hidden');
    }
  }

  function bindLiveFieldCleanup(){
    var name = document.getElementById('studentName');
    var roll = document.getElementById('rollNumber');
    var reg = document.getElementById('regulation');

    if(name && !name.dataset.changeSet8Bound){
      name.dataset.changeSet8Bound = '1';
      name.addEventListener('input', function(){
        if(name.value.trim()){
          var field = document.getElementById('fieldName');
          if(field) field.classList.remove('has-error');
          clearResolvedCalculationError();
        }
      });
      name.addEventListener('change', clearResolvedCalculationError);
    }

    if(roll && !roll.dataset.changeSet8Bound){
      roll.dataset.changeSet8Bound = '1';
      roll.addEventListener('input', function(){
        if(roll.value.trim()){
          var field = document.getElementById('fieldRoll');
          if(field) field.classList.remove('has-error');
          clearResolvedCalculationError();
        }
      });
      roll.addEventListener('change', clearResolvedCalculationError);
    }

    if(reg && !reg.dataset.changeSet8Bound){
      reg.dataset.changeSet8Bound = '1';
      reg.addEventListener('change', function(){
        if(typeof state !== 'undefined' && state.student){
          state.student.regulation = reg.value;
          if(typeof saveState === 'function') saveState();
        }
      });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindLiveFieldCleanup);
  }else{
    bindLiveFieldCleanup();
  }
})();

/* Two focused improvements only: mobile PDF preview and duplicate report close control. */
(function(){
  const bottom = document.getElementById('bottomReportToggle');
  const top = document.getElementById('viewReportBtn');
  const block = document.getElementById('reportBlock');
  function syncReportButtons(){
    if(!bottom || !top || !block) return;
    const open = !!(window.state && state.reportOpen) || block.classList.contains('show');
    top.textContent = open ? 'Hide Complete Academic Report' : 'View Complete Academic Report';
    bottom.textContent = 'Hide Complete Academic Report';
  }
  if(bottom){
    bottom.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      if(!top || !block) return;

      /* Use the original, already-working report button logic so both buttons
         always control exactly the same report state. */
      if(block.classList.contains('show')){
        top.click();
      } else {
        block.classList.remove('show');
      }

      requestAnimationFrame(function(){
        syncReportButtons();
        top.scrollIntoView({behavior:'smooth', block:'center'});
      });
    });
  }
  if(top){ top.addEventListener('click', function(){ setTimeout(syncReportButtons, 0); }); }
  if(block && window.MutationObserver){
    new MutationObserver(syncReportButtons).observe(block,{attributes:true,attributeFilter:['class']});
  }
  syncReportButtons();

  document.querySelectorAll('[data-close="pdfPreviewModal"]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(typeof previewRenderToken !== 'undefined') previewRenderToken++;
      const host=document.getElementById('pdfPreviewCanvasHost');
      if(host) host.innerHTML='';
    });
  });
})();

(function(){
  const byId = id => document.getElementById(id);

  function openPrivacy(e){
    if(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    const menu = byId('menuPanel');
    const modal = byId('privacyModal');
    if(menu) menu.classList.remove('show');
    if(modal){
      modal.classList.add('show');
      document.body.classList.add('modal-open');
    }
  }

  // Privacy & Terms: capture + direct button handling so it also works when a phone
  // browser is switched to Desktop Site.
  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('#menuPrivacy');
    if(btn) openPrivacy(e);
  }, true);

  const privacyBtn = byId('menuPrivacy');
  if(privacyBtn){
    privacyBtn.onclick = openPrivacy;
    privacyBtn.addEventListener('touchend', openPrivacy, {passive:false});
    privacyBtn.addEventListener('pointerup', openPrivacy, {passive:false});
  }

  // Contact email behavior.
  function isPhoneOrTablet(){
    const ua = navigator.userAgent || '';
    if(/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
    if(/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;

    // "Request Desktop Site" on a phone browser swaps the user-agent string
    // for a desktop-looking one (no "Android"/"Mobile" token), so the checks
    // above miss it. The hardware is still a touch-only phone though: it has
    // touch points and no real hover/fine pointer, unlike an actual laptop or
    // desktop. Detect that combination so email still opens the normal way.
    const isTouchOnly = navigator.maxTouchPoints > 0 &&
      window.matchMedia &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches;
    return !!isTouchOnly;
  }

  function openContact(e){
    if(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    }

    const to = 'NEOKRITUS@gmail.com';
    const subject = 'WEBSITE QUERY - ARCHIVA';
    const mailto = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject);
    const gmailWeb = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subject);

    if(isPhoneOrTablet()){
      // Phone/tablet: use the operating system's normal compose dialog/app chooser.
      // This remains true even when the browser displays the desktop version of the site.
      window.location.href = mailto;
    }else{
      // Laptop/desktop: open Gmail's compose page in a new tab, not Outlook.
      window.open(gmailWeb, '_blank', 'noopener');
    }
  }

  document.addEventListener('click', function(e){
    const link = e.target.closest && e.target.closest('#contactEmailLink');
    if(link) openContact(e);
  }, true);

  const contact = byId('contactEmailLink');
  if(contact){
    contact.onclick = openContact;
  }
})();
