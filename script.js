/* =========================================================================
   PREP DESK — script.js
   A fully offline JEE study tracker. No frameworks, no CDNs, no network
   calls. All persistence via localStorage. All charts/rings/confetti are
   drawn by hand on <canvas> so nothing depends on an internet connection.
   ========================================================================= */

(function () {
  "use strict";

  /* =======================================================================
     1. DATA: chapters, checklist template, quotes
     ======================================================================= */

  const CHAPTERS = [
    // Physics — 14
    { id: "electric-charges-fields", subject: "physics", name: "Electric Charges and Fields" },
    { id: "electrostatic-potential-capacitance", subject: "physics", name: "Electrostatic Potential and Capacitance" },
    { id: "current-electricity", subject: "physics", name: "Current Electricity" },
    { id: "moving-charges-magnetism", subject: "physics", name: "Moving Charges and Magnetism" },
    { id: "magnetism-matter", subject: "physics", name: "Magnetism and Matter" },
    { id: "electromagnetic-induction", subject: "physics", name: "Electromagnetic Induction" },
    { id: "alternating-current", subject: "physics", name: "Alternating Current" },
    { id: "electromagnetic-waves", subject: "physics", name: "Electromagnetic Waves" },
    { id: "ray-optics", subject: "physics", name: "Ray Optics and Optical Instruments" },
    { id: "wave-optics", subject: "physics", name: "Wave Optics" },
    { id: "dual-nature", subject: "physics", name: "Dual Nature of Radiation and Matter" },
    { id: "atoms", subject: "physics", name: "Atoms" },
    { id: "nuclei", subject: "physics", name: "Nuclei" },
    { id: "semiconductor-electronics", subject: "physics", name: "Semiconductor Electronics" },

    // Chemistry — 10
    { id: "solutions", subject: "chemistry", name: "Solutions" },
    { id: "electrochemistry", subject: "chemistry", name: "Electrochemistry" },
    { id: "chemical-kinetics", subject: "chemistry", name: "Chemical Kinetics" },
    { id: "d-f-block-elements", subject: "chemistry", name: "d- and f-Block Elements" },
    { id: "coordination-compounds", subject: "chemistry", name: "Coordination Compounds" },
    { id: "haloalkanes-haloarenes", subject: "chemistry", name: "Haloalkanes and Haloarenes" },
    { id: "alcohols-phenols-ethers", subject: "chemistry", name: "Alcohols, Phenols and Ethers" },
    { id: "aldehydes-ketones-carboxylic-acids", subject: "chemistry", name: "Aldehydes, Ketones and Carboxylic Acids" },
    { id: "amines", subject: "chemistry", name: "Amines" },
    { id: "biomolecules", subject: "chemistry", name: "Biomolecules" },

    // Mathematics — 13
    { id: "relations-functions", subject: "maths", name: "Relations and Functions" },
    { id: "inverse-trig-functions", subject: "maths", name: "Inverse Trigonometric Functions" },
    { id: "matrices", subject: "maths", name: "Matrices" },
    { id: "determinants", subject: "maths", name: "Determinants" },
    { id: "continuity-differentiability", subject: "maths", name: "Continuity and Differentiability" },
    { id: "application-derivatives", subject: "maths", name: "Application of Derivatives" },
    { id: "integrals", subject: "maths", name: "Integrals" },
    { id: "application-integrals", subject: "maths", name: "Application of Integrals" },
    { id: "differential-equations", subject: "maths", name: "Differential Equations" },
    { id: "vector-algebra", subject: "maths", name: "Vector Algebra" },
    { id: "three-d-geometry", subject: "maths", name: "Three-Dimensional Geometry" },
    { id: "linear-programming", subject: "maths", name: "Linear Programming" },
    { id: "probability", subject: "maths", name: "Probability" },
  ];

  const CHECKLIST_TEMPLATE = [
    { key: "conceptDone", label: "Concept Done" },
    { key: "ncertReading", label: "NCERT Reading" },
    { key: "ncertExamples", label: "NCERT Examples" },
    { key: "ncertExercise", label: "NCERT Exercise" },
    { key: "classNotes", label: "Class Notes" },
    { key: "formulaRevision", label: "Formula Revision" },
    { key: "moduleDone", label: "Module Done" },
    { key: "boardPYQs", label: "Board PYQs" },
    { key: "jeeMainPYQs", label: "JEE Main PYQs" },
    { key: "jeeAdvPYQs", label: "JEE Advanced PYQs" },
    { key: "dppDone", label: "DPP Done" },
    { key: "revision1", label: "Revision 1" },
    { key: "revision2", label: "Revision 2" },
    { key: "revision3", label: "Revision 3" },
    { key: "mockTest", label: "Mock Test" },
    { key: "mistakeNotebook", label: "Mistake Notebook Updated" },
  ];

  const SUBJECT_LABEL = { physics: "Physics", chemistry: "Chemistry", maths: "Mathematics" };
  const SUBJECT_COLOR = {
    physics: getCSS("--physics"), chemistry: getCSS("--chemistry"), maths: getCSS("--maths"),
  };

  const QUOTES = [
    "Discipline is choosing between what you want now and what you want most.",
    "Small daily gains beat rare big leaps.",
    "The syllabus does not care how you feel today. Show up anyway.",
    "You don't need motivation, you need a routine.",
    "Every solved PYQ is a rehearsal for exam day.",
    "Consistency compounds faster than talent.",
    "Rank follows revision, not intention.",
    "One focused hour beats four distracted ones.",
    "Mistakes recorded today won't be repeated in the exam hall.",
    "You are not behind. You are exactly where your effort has placed you — and effort compounds.",
    "The mock test is a mirror, not a verdict.",
    "Master NCERT before chasing shortcuts.",
    "Formulas fade. Understanding stays.",
    "Every chapter you close is one less thing to fear in March.",
    "Speed comes from repetition, not talent.",
    "Your competition is asleep right now. Keep going.",
    "Progress, not perfection, wins JEE.",
    "The best time to revise was yesterday. The next best time is now.",
    "A calm mind solves harder problems than an anxious one.",
    "Study like the exam is tomorrow, rest like it's a year away.",
    "Doubts cleared today are marks secured tomorrow.",
    "You don't rise to the level of the exam, you fall to the level of your practice.",
    "Difficulty is just unfamiliarity wearing a scary mask.",
    "Track it, and you can improve it.",
    "The streak is not the goal. The habit it builds is.",
    "Every rank list has a version of you who never gave up.",
    "Attempt first, look at the solution second.",
    "Your future self is counting on today's two hours.",
    "Clarity beats cramming, every single time.",
    "The paper rewards preparation, not panic.",
  ];

  /* =======================================================================
     2. STATE + PERSISTENCE
     ======================================================================= */

  const STORAGE_KEY = "prepdesk.v1";

  function defaultChapterState() {
    const checks = {};
    CHECKLIST_TEMPLATE.forEach((c) => (checks[c.key] = false));
    return { checks, notes: "", doubts: "", formulas: "" };
  }

  function defaultState() {
    const chapters = {};
    CHAPTERS.forEach((c) => (chapters[c.id] = defaultChapterState()));
    return {
      theme: "dark",
      chapters,
      studyDates: {},        // "YYYY-MM-DD" -> true (any activity that day)
      studyLog: {},          // "YYYY-MM-DD" -> number of checkbox toggles that day
      completionHistory: {}, // "YYYY-MM-DD" -> overall percent snapshot
      longestStreak: 0,
      celebratedChapters: [],
      celebratedSubjects: [],
      celebratedAll: false,
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const merged = defaultState();
      // shallow-merge top level, then ensure every chapter exists (future-proof if list edited)
      Object.assign(merged, parsed);
      merged.chapters = Object.assign({}, merged.chapters, parsed.chapters || {});
      CHAPTERS.forEach((c) => {
        if (!merged.chapters[c.id]) merged.chapters[c.id] = defaultChapterState();
        else {
          const existing = merged.chapters[c.id];
          existing.checks = Object.assign({}, defaultChapterState().checks, existing.checks || {});
          existing.notes = existing.notes || "";
          existing.doubts = existing.doubts || "";
          existing.formulas = existing.formulas || "";
        }
      });
      merged.studyDates = parsed.studyDates || {};
      merged.studyLog = parsed.studyLog || {};
      merged.completionHistory = parsed.completionHistory || {};
      merged.celebratedChapters = parsed.celebratedChapters || [];
      merged.celebratedSubjects = parsed.celebratedSubjects || [];
      return merged;
    } catch (e) {
      console.error("Prep Desk: failed to load saved data, starting fresh.", e);
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Prep Desk: failed to save data.", e);
      showToast("Storage is full or unavailable — your last change may not be saved.");
    }
  }

  /* =======================================================================
     3. DATE HELPERS
     ======================================================================= */

  function formatDateLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function todayStr() { return formatDateLocal(new Date()); }
  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }
  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

  /* =======================================================================
     4. DERIVED CALCULATIONS
     ======================================================================= */

  function chapterPercent(chapterId) {
    const ch = state.chapters[chapterId];
    const keys = CHECKLIST_TEMPLATE.map((c) => c.key);
    const done = keys.filter((k) => ch.checks[k]).length;
    return Math.round((done / keys.length) * 100);
  }

  function chapterStatus(pct) {
    if (pct === 0) return "not-started";
    if (pct === 100) return "completed";
    return "in-progress";
  }

  function subjectPercent(subject) {
    const chs = CHAPTERS.filter((c) => c.subject === subject);
    if (!chs.length) return 0;
    const total = chs.reduce((sum, c) => sum + chapterPercent(c.id), 0);
    return Math.round(total / chs.length);
  }

  function overallPercent() {
    const total = CHAPTERS.reduce((sum, c) => sum + chapterPercent(c.id), 0);
    return Math.round(total / CHAPTERS.length);
  }

  function totalChecklistItemsDone() {
    let done = 0;
    CHAPTERS.forEach((c) => {
      CHECKLIST_TEMPLATE.forEach((item) => {
        if (state.chapters[c.id].checks[item.key]) done++;
      });
    });
    return done;
  }

  function computeStreaks() {
    const dates = Object.keys(state.studyDates).sort();
    if (!dates.length) return { current: 0, longest: state.longestStreak || 0 };

    const dateSet = new Set(dates);
    // longest streak: scan all dates
    let longest = 0, run = 0, prev = null;
    dates.forEach((ds) => {
      const d = new Date(ds + "T00:00:00");
      if (prev && (d - prev) === 86400000) run += 1;
      else run = 1;
      longest = Math.max(longest, run);
      prev = d;
    });

    // current streak: walk backward from today (or yesterday, so a day not yet
    // logged doesn't zero out the streak prematurely)
    let current = 0;
    let cursor = new Date();
    if (!dateSet.has(formatDateLocal(cursor))) cursor = addDays(cursor, -1);
    while (dateSet.has(formatDateLocal(cursor))) {
      current += 1;
      cursor = addDays(cursor, -1);
    }
    longest = Math.max(longest, current, state.longestStreak || 0);
    return { current, longest };
  }

  function productivityScore(overall, currentStreak) {
    const streakFactor = Math.min(currentStreak / 30, 1) * 100;
    return Math.round(overall * 0.65 + streakFactor * 0.35);
  }

  function recordActivity() {
    const t = todayStr();
    state.studyDates[t] = true;
    state.studyLog[t] = (state.studyLog[t] || 0) + 1;
  }

  function snapshotCompletion() {
    state.completionHistory[todayStr()] = overallPercent();
  }

  /* =======================================================================
     5. CANVAS DRAWING HELPERS (rings, bars, lines — zero dependencies)
     ======================================================================= */

  function getCSS(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  function drawRing(canvas, percent, color) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || canvas.width;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2;
    const r = size / 2 - 8;
    const track = getCSS("--hairline-strong") || "rgba(255,255,255,0.14)";

    ctx.lineCap = "round";
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.strokeStyle = track;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const frac = Math.max(0, Math.min(1, percent / 100));
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
  }

  function drawCountdownRing(canvas, fraction, color) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || canvas.width;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2;
    const r = size / 2 - 10;
    ctx.lineCap = "round";
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.strokeStyle = getCSS("--hairline-strong") || "rgba(255,255,255,0.14)";
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
    ctx.stroke();
  }

  function setupCanvasScale(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.width;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  function drawBarChart(canvas, labels, values, colors, opts) {
    opts = opts || {};
    const { ctx, w, h } = setupCanvasScale(canvas);
    ctx.clearRect(0, 0, w, h);
    const padTop = 14, padBottom = 26, padLeft = 8, padRight = 8;
    const chartH = h - padTop - padBottom;
    const maxVal = opts.max || Math.max(1, ...values);
    const gap = 10;
    const barW = (w - padLeft - padRight - gap * (values.length - 1)) / values.length;
    const textColor = getCSS("--text-dim") || "#888";

    ctx.font = "11px " + getCSS("--font-body");
    ctx.textAlign = "center";

    values.forEach((v, i) => {
      const barH = maxVal === 0 ? 0 : (v / maxVal) * chartH;
      const x = padLeft + i * (barW + gap);
      const y = padTop + (chartH - barH);
      const color = Array.isArray(colors) ? colors[i] : colors;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, colorAlpha(color, 0.55));

      ctx.fillStyle = barH > 0 ? grad : "transparent";
      roundRectPath(ctx, x, y, barW, Math.max(barH, 0), 6);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.fillText(String(labels[i]), x + barW / 2, h - 8);

      if (opts.showValue) {
        ctx.fillStyle = getCSS("--text");
        ctx.font = "10px " + getCSS("--font-mono");
        ctx.fillText(String(v), x + barW / 2, Math.max(y - 5, 12));
        ctx.font = "11px " + getCSS("--font-body");
      }
    });
  }

  function drawLineChart(canvas, labels, values, color) {
    const { ctx, w, h } = setupCanvasScale(canvas);
    ctx.clearRect(0, 0, w, h);
    const padTop = 14, padBottom = 22, padLeft = 10, padRight = 10;
    const chartH = h - padTop - padBottom;
    const chartW = w - padLeft - padRight;
    const maxVal = 100;
    const textColor = getCSS("--text-dim") || "#888";

    // gridlines
    ctx.strokeStyle = getCSS("--hairline") || "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    [0, 0.5, 1].forEach((f) => {
      const y = padTop + chartH * f;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
    });

    if (values.length < 2) return;

    const stepX = chartW / (values.length - 1);
    const points = values.map((v, i) => ({
      x: padLeft + i * stepX,
      y: padTop + chartH - (v / maxVal) * chartH,
    }));

    // filled area
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, colorAlpha(color, 0.35));
    grad.addColorStop(1, colorAlpha(color, 0.02));
    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + chartH);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();

    // endpoint dot
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // x labels: first, middle, last
    ctx.fillStyle = textColor;
    ctx.font = "10px " + getCSS("--font-body");
    ctx.textAlign = "left";
    ctx.fillText(labels[0], padLeft, h - 6);
    ctx.textAlign = "right";
    ctx.fillText(labels[labels.length - 1], padLeft + chartW, h - 6);
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function colorAlpha(hexOrRgb, alpha) {
    // supports #rrggbb; falls back to rgba(255,255,255,alpha)
    if (typeof hexOrRgb === "string" && hexOrRgb.startsWith("#") && hexOrRgb.length === 7) {
      const r = parseInt(hexOrRgb.slice(1, 3), 16);
      const g = parseInt(hexOrRgb.slice(3, 5), 16);
      const b = parseInt(hexOrRgb.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return hexOrRgb;
  }

  /* =======================================================================
     6. CONFETTI (hand-rolled canvas particle burst)
     ======================================================================= */

  const confettiCanvas = document.getElementById("confettiCanvas");
  const confettiCtx = confettiCanvas.getContext("2d");
  let confettiParticles = [];
  let confettiRAF = null;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeConfettiCanvas);
  resizeConfettiCanvas();

  function launchConfetti(intensity) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = intensity || 120;
    const colors = [getCSS("--brass-strong"), getCSS("--physics"), getCSS("--chemistry"), getCSS("--maths"), getCSS("--brass")];
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 3.5,
        vy: 2 + Math.random() * 3.5,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 140 + Math.random() * 60,
      });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(tickConfetti);
  }

  function tickConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.vy += 0.03;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      p.life += 1;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      confettiCtx.restore();
    });
    confettiParticles = confettiParticles.filter((p) => p.life < p.maxLife && p.y < confettiCanvas.height + 40);
    if (confettiParticles.length) {
      confettiRAF = requestAnimationFrame(tickConfetti);
    } else {
      confettiRAF = null;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  function checkCelebrations(chapterId) {
    const pct = chapterPercent(chapterId);
    if (pct === 100 && !state.celebratedChapters.includes(chapterId)) {
      state.celebratedChapters.push(chapterId);
      launchConfetti(90);
      showToast("Chapter completed! Great work.");
    }
    const chapter = CHAPTERS.find((c) => c.id === chapterId);
    const subjPct = subjectPercent(chapter.subject);
    if (subjPct === 100 && !state.celebratedSubjects.includes(chapter.subject)) {
      state.celebratedSubjects.push(chapter.subject);
      launchConfetti(200);
      showToast(`${SUBJECT_LABEL[chapter.subject]} fully complete! 🎉`);
    }
    const overall = overallPercent();
    if (overall === 100 && !state.celebratedAll) {
      state.celebratedAll = true;
      launchConfetti(320);
      showToast("Entire syllabus complete. Incredible discipline.");
    }
  }

  /* =======================================================================
     7. TOAST
     ======================================================================= */
  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => (el.hidden = true), 200);
    }, 2600);
  }

  /* =======================================================================
     8. RENDER: DASHBOARD
     ======================================================================= */

  function renderDashboard() {
    const overall = overallPercent();
    const physics = subjectPercent("physics");
    const chemistry = subjectPercent("chemistry");
    const maths = subjectPercent("maths");
    const { current, longest } = computeStreaks();
    state.longestStreak = longest;

    document.getElementById("overallPct").textContent = overall + "%";
    drawRing(document.getElementById("overallRing"), overall, getCSS("--brass"));

    document.getElementById("physicsPct").textContent = physics + "%";
    document.getElementById("chemistryPct").textContent = chemistry + "%";
    document.getElementById("mathsPct").textContent = maths + "%";
    document.getElementById("physicsBar").style.width = physics + "%";
    document.getElementById("chemistryBar").style.width = chemistry + "%";
    document.getElementById("mathsBar").style.width = maths + "%";

    const completedChapters = CHAPTERS.filter((c) => chapterPercent(c.id) === 100).length;
    document.getElementById("totalChapters").textContent = CHAPTERS.length;
    document.getElementById("completedChapters").textContent = completedChapters;
    document.getElementById("remainingChapters").textContent = CHAPTERS.length - completedChapters;
    document.getElementById("productivityScore").textContent = productivityScore(overall, current);

    document.getElementById("currentStreak").textContent = current + (current === 1 ? " day" : " days");
    document.getElementById("longestStreak").textContent = longest;

    const now = new Date();
    document.getElementById("todayDate").textContent = now.toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    document.getElementById("dailyQuote").textContent = "“" + QUOTES[dayOfYear(now) % QUOTES.length] + "”";
  }

  /* =======================================================================
     9. RENDER: CHAPTER GRID
     ======================================================================= */

  let activeFilter = "all";
  let activeSubject = "all";
  let searchTerm = "";
  let hideCompleted = false;

  function renderChapterGrid() {
    const grid = document.getElementById("chapterGrid");
    grid.innerHTML = "";

    const term = searchTerm.trim().toLowerCase();
    const visible = CHAPTERS.filter((c) => {
      if (activeSubject !== "all" && c.subject !== activeSubject) return false;
      if (term && !c.name.toLowerCase().includes(term)) return false;
      const pct = chapterPercent(c.id);
      const status = chapterStatus(pct);
      if (activeFilter !== "all" && status !== activeFilter) return false;
      if (hideCompleted && status === "completed") return false;
      return true;
    });

    document.getElementById("emptyState").hidden = visible.length > 0;

    visible.forEach((c, idx) => {
      const pct = chapterPercent(c.id);
      const status = chapterStatus(pct);
      const card = document.createElement("article");
      card.className = "chapter-card";
      card.dataset.subject = c.subject;
      card.dataset.chapterId = c.id;
      card.style.animationDelay = Math.min(idx * 18, 240) + "ms";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `${c.name}, ${SUBJECT_LABEL[c.subject]}, ${pct}% complete`);

      card.innerHTML = `
        <div class="card-top">
          <div>
            <div class="card-subject-label">${SUBJECT_LABEL[c.subject]}</div>
            <div class="card-title">${c.name}</div>
          </div>
          <canvas class="card-ring" width="46" height="46"></canvas>
        </div>
        <span class="status-badge ${status}">${statusLabel(status)} · ${pct}%</span>
      `;

      grid.appendChild(card);
      drawRing(card.querySelector(".card-ring"), pct, SUBJECT_COLOR[c.subject] || getCSS("--brass"));

      card.addEventListener("click", () => openDrawer(c.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(c.id); }
      });
    });
  }

  function statusLabel(status) {
    if (status === "completed") return "Completed";
    if (status === "in-progress") return "In Progress";
    return "Not Started";
  }

  /* =======================================================================
     10. DRAWER (chapter detail)
     ======================================================================= */

  let currentChapterId = null;
  const drawer = document.getElementById("chapterDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");

  function openDrawer(chapterId) {
    currentChapterId = chapterId;
    const c = CHAPTERS.find((x) => x.id === chapterId);
    document.getElementById("drawerSubject").textContent = SUBJECT_LABEL[c.subject];
    document.getElementById("drawerTitle").textContent = c.name;
    renderDrawerContent();

    drawerOverlay.hidden = false;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("open"));
    document.getElementById("drawerCloseBtn").focus();
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    setTimeout(() => { drawer.hidden = true; drawerOverlay.hidden = true; }, 320);
  }

  function renderDrawerContent() {
    const c = CHAPTERS.find((x) => x.id === currentChapterId);
    const chState = state.chapters[currentChapterId];
    const pct = chapterPercent(currentChapterId);
    const status = chapterStatus(pct);

    document.getElementById("drawerPct").textContent = pct + "%";
    drawRing(document.getElementById("drawerRing"), pct, SUBJECT_COLOR[c.subject] || getCSS("--brass"));
    const badge = document.getElementById("drawerBadge");
    badge.textContent = statusLabel(status);
    badge.style.color = status === "completed" ? getCSS("--chemistry") : status === "in-progress" ? getCSS("--brass") : "";

    const list = document.getElementById("checklistItems");
    list.innerHTML = "";
    CHECKLIST_TEMPLATE.forEach((item) => {
      const li = document.createElement("li");
      li.className = "check-item" + (chState.checks[item.key] ? " checked" : "");
      const inputId = `chk-${currentChapterId}-${item.key}`;
      li.innerHTML = `
        <input type="checkbox" id="${inputId}" ${chState.checks[item.key] ? "checked" : ""}>
        <label for="${inputId}">${item.label}</label>
      `;
      list.appendChild(li);
      li.querySelector("input").addEventListener("change", (e) => {
        chState.checks[item.key] = e.target.checked;
        recordActivity();
        li.classList.toggle("checked", e.target.checked);
        saveAndRefreshAfterCheckboxChange();
      });
    });

    document.getElementById("notesPersonal").value = chState.notes;
    document.getElementById("notesDoubts").value = chState.doubts;
    document.getElementById("notesFormula").value = chState.formulas;
  }

  function saveAndRefreshAfterCheckboxChange() {
    snapshotCompletion();
    saveState();
    renderDrawerContent();
    renderDashboard();
    renderChapterGrid();
    renderStats();
    checkCelebrations(currentChapterId);
    // subtle "just completed" pulse on the corresponding card
    requestAnimationFrame(() => {
      const card = document.querySelector(`.chapter-card[data-chapter-id="${currentChapterId}"]`);
      if (card && chapterPercent(currentChapterId) === 100) card.classList.add("is-complete");
    });
  }

  document.getElementById("drawerCloseBtn").addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", (e) => { if (e.target === drawerOverlay) closeDrawer(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });

  document.querySelectorAll(".drawer-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".drawer-tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const target = tab.dataset.tab;
      document.getElementById("panelChecklist").hidden = target !== "checklist";
      document.getElementById("panelNotes").hidden = target !== "notes";
    });
  });

  function debounce(fn, delay) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), delay); };
  }

  const saveNotes = debounce(() => {
    const chState = state.chapters[currentChapterId];
    chState.notes = document.getElementById("notesPersonal").value;
    chState.doubts = document.getElementById("notesDoubts").value;
    chState.formulas = document.getElementById("notesFormula").value;
    saveState();
  }, 400);

  ["notesPersonal", "notesDoubts", "notesFormula"].forEach((id) => {
    document.getElementById(id).addEventListener("input", saveNotes);
  });

  /* =======================================================================
     11. SEARCH + FILTERS
     ======================================================================= */

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderChapterGrid();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      document.getElementById("searchInput").focus();
    }
  });

  document.querySelectorAll(".filter-row .chip[data-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-row .chip[data-filter]").forEach((c) => { c.classList.remove("active"); c.setAttribute("aria-selected", "false"); });
      chip.classList.add("active");
      chip.setAttribute("aria-selected", "true");
      activeFilter = chip.dataset.filter;
      renderChapterGrid();
    });
  });

  document.getElementById("hideCompletedToggle").addEventListener("change", (e) => {
    hideCompleted = e.target.checked;
    renderChapterGrid();
  });

  document.querySelectorAll(".subject-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".subject-tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      activeSubject = tab.dataset.subject;
      renderChapterGrid();
    });
  });

  /* =======================================================================
     12. STATISTICS
     ======================================================================= */

  function renderStats() {
    // Completion by subject
    drawBarChart(
      document.getElementById("chartSubject"),
      ["Physics", "Chemistry", "Maths"],
      [subjectPercent("physics"), subjectPercent("chemistry"), subjectPercent("maths")],
      [getCSS("--physics"), getCSS("--chemistry"), getCSS("--maths")],
      { max: 100, showValue: true }
    );

    // Weekly study activity — last 7 days
    const weekLabels = [], weekValues = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      weekLabels.push(d.toLocaleDateString(undefined, { weekday: "short" })[0]);
      weekValues.push(state.studyLog[formatDateLocal(d)] || 0);
    }
    drawBarChart(document.getElementById("chartWeekly"), weekLabels, weekValues, getCSS("--brass"), { showValue: true });

    // Monthly study activity — last 6 months, totals
    const monthLabels = [], monthValues = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString(undefined, { month: "short" });
      let total = 0;
      Object.keys(state.studyLog).forEach((ds) => {
        const dd = new Date(ds + "T00:00:00");
        if (dd.getFullYear() === d.getFullYear() && dd.getMonth() === d.getMonth()) total += state.studyLog[ds];
      });
      monthLabels.push(label);
      monthValues.push(total);
    }
    drawBarChart(document.getElementById("chartMonthly"), monthLabels, monthValues, getCSS("--maths"), { showValue: true });

    // Completion trend — last 30 days, carry-forward fill
    const trendLabels = [], trendValues = [];
    let lastKnown = 0;
    const hist = state.completionHistory;
    const sortedHistDates = Object.keys(hist).sort();
    if (sortedHistDates.length && new Date(sortedHistDates[0]) < addDays(new Date(), -29)) {
      // find value right before the 30-day window to seed carry-forward
      for (const ds of sortedHistDates) {
        if (new Date(ds) <= addDays(new Date(), -29)) lastKnown = hist[ds];
      }
    }
    for (let i = 29; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const ds = formatDateLocal(d);
      if (hist[ds] !== undefined) lastKnown = hist[ds];
      trendValues.push(lastKnown);
      trendLabels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    }
    drawLineChart(document.getElementById("chartTrend"), trendLabels, trendValues, getCSS("--brass"));

    // Snapshot
    const subjPcts = { physics: subjectPercent("physics"), chemistry: subjectPercent("chemistry"), maths: subjectPercent("maths") };
    const most = Object.keys(subjPcts).reduce((a, b) => (subjPcts[a] >= subjPcts[b] ? a : b));
    const least = Object.keys(subjPcts).reduce((a, b) => (subjPcts[a] <= subjPcts[b] ? a : b));
    const completedChapters = CHAPTERS.filter((c) => chapterPercent(c.id) === 100).length;

    document.getElementById("mostCompletedSubject").textContent = `${SUBJECT_LABEL[most]} (${subjPcts[most]}%)`;
    document.getElementById("leastCompletedSubject").textContent = `${SUBJECT_LABEL[least]} (${subjPcts[least]}%)`;
    document.getElementById("remainingWorkStat").textContent = `${CHAPTERS.length - completedChapters} chapters left`;
    document.getElementById("checklistItemsDone").textContent = `${totalChecklistItemsDone()} / ${CHAPTERS.length * CHECKLIST_TEMPLATE.length}`;
  }

  /* =======================================================================
     13. CALENDAR + HEATMAP
     ======================================================================= */

  let calViewDate = new Date();

  function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";
    const label = calViewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    document.getElementById("calMonthLabel").textContent = label;

    ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => {
      const cell = document.createElement("div");
      cell.className = "cal-cell cal-dow";
      cell.textContent = d;
      grid.appendChild(cell);
    });

    const year = calViewDate.getFullYear(), month = calViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDs = todayStr();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      blank.className = "cal-cell is-blank";
      grid.appendChild(blank);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const ds = formatDateLocal(d);
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      if (state.studyDates[ds]) cell.classList.add("has-study");
      if (ds === todayDs) cell.classList.add("is-today");
      cell.textContent = day;
      cell.title = state.studyDates[ds] ? "Studied this day" : "";
      grid.appendChild(cell);
    }
  }

  document.getElementById("calPrevBtn").addEventListener("click", () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("calNextBtn").addEventListener("click", () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    renderCalendar();
  });

  function renderHeatmap() {
    const container = document.getElementById("heatmapGrid");
    container.innerHTML = "";
    const totalDays = 371; // 53 weeks
    const start = addDays(new Date(), -(totalDays - 1));
    // pad to start on Sunday for clean week columns
    const startPad = start.getDay();
    const gridStart = addDays(start, -startPad);

    const maxCount = Math.max(1, ...Object.values(state.studyLog));

    for (let i = 0; i < totalDays + startPad; i++) {
      const d = addDays(gridStart, i);
      const ds = formatDateLocal(d);
      const count = state.studyLog[ds] || 0;
      const cell = document.createElement("div");
      let level = 0;
      if (count > 0) level = 1;
      if (count >= Math.ceil(maxCount * 0.35)) level = 2;
      if (count >= Math.ceil(maxCount * 0.65)) level = 3;
      if (count >= maxCount && maxCount > 0) level = 4;
      cell.className = `heat-cell heat-${level}`;
      cell.title = `${ds}: ${count} action${count === 1 ? "" : "s"}`;
      if (d > new Date()) cell.style.visibility = "hidden";
      container.appendChild(cell);
    }
  }

  /* =======================================================================
     14. POMODORO
     ======================================================================= */

  const pomodoroPanel = document.getElementById("pomodoroPanel");
  const pomodoroOverlay = document.getElementById("pomodoroOverlay");
  let pomodoroMode = "focus";
  let pomodoroTotalSeconds = 25 * 60;
  let pomodoroRemaining = pomodoroTotalSeconds;
  let pomodoroInterval = null;
  let pomodoroRunning = false;

  function openPomodoro() {
    pomodoroOverlay.hidden = false;
    pomodoroPanel.hidden = false;
    requestAnimationFrame(() => pomodoroPanel.classList.add("open"));
    document.getElementById("pomodoroToggleBtn").setAttribute("aria-expanded", "true");
    renderPomodoro();
  }
  function closePomodoro() {
    pomodoroPanel.classList.remove("open");
    document.getElementById("pomodoroToggleBtn").setAttribute("aria-expanded", "false");
    setTimeout(() => { pomodoroPanel.hidden = true; pomodoroOverlay.hidden = true; }, 320);
  }
  document.getElementById("pomodoroToggleBtn").addEventListener("click", openPomodoro);
  document.getElementById("pomodoroCloseBtn").addEventListener("click", closePomodoro);
  pomodoroOverlay.addEventListener("click", (e) => { if (e.target === pomodoroOverlay) closePomodoro(); });

  document.querySelectorAll(".pomodoro-mode").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pomodoro-mode").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      pomodoroMode = btn.dataset.mode;
      pausePomodoro();
      document.getElementById("pomodoroCustomRow").hidden = pomodoroMode !== "custom";
      if (pomodoroMode === "focus") pomodoroTotalSeconds = 25 * 60;
      else if (pomodoroMode === "short") pomodoroTotalSeconds = 5 * 60;
      else pomodoroTotalSeconds = Number(document.getElementById("customMinutes").value || 25) * 60;
      pomodoroRemaining = pomodoroTotalSeconds;
      renderPomodoro();
    });
  });

  document.getElementById("customMinutes").addEventListener("change", (e) => {
    let v = Math.max(1, Math.min(180, Number(e.target.value) || 25));
    e.target.value = v;
    if (pomodoroMode === "custom") {
      pomodoroTotalSeconds = v * 60;
      pomodoroRemaining = pomodoroTotalSeconds;
      renderPomodoro();
    }
  });

  function renderPomodoro() {
    const m = String(Math.floor(pomodoroRemaining / 60)).padStart(2, "0");
    const s = String(pomodoroRemaining % 60).padStart(2, "0");
    document.getElementById("pomodoroTime").textContent = `${m}:${s}`;
    const fraction = 1 - pomodoroRemaining / pomodoroTotalSeconds;
    drawCountdownRing(document.getElementById("pomodoroRing"), fraction, getCSS("--brass"));
    document.getElementById("pomodoroStartPauseBtn").textContent = pomodoroRunning ? "Pause" : "Start";
  }

  function startPomodoro() {
    if (pomodoroRunning) return;
    pomodoroRunning = true;
    renderPomodoro();
    pomodoroInterval = setInterval(() => {
      pomodoroRemaining -= 1;
      if (pomodoroRemaining <= 0) {
        pomodoroRemaining = 0;
        renderPomodoro();
        pausePomodoro();
        playChime();
        recordActivity();
        saveState();
        renderDashboard();
        renderCalendar();
        renderHeatmap();
        renderStats();
        showToast("Timer complete — nice focus session.");
        return;
      }
      renderPomodoro();
    }, 1000);
  }
  function pausePomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    renderPomodoro();
  }
  document.getElementById("pomodoroStartPauseBtn").addEventListener("click", () => {
    pomodoroRunning ? pausePomodoro() : startPomodoro();
  });
  document.getElementById("pomodoroResetBtn").addEventListener("click", () => {
    pausePomodoro();
    pomodoroRemaining = pomodoroTotalSeconds;
    renderPomodoro();
  });

  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.55);
      });
      setTimeout(() => ctx.close(), 1400);
    } catch (e) { /* audio unsupported — fail silently */ }
  }

  /* =======================================================================
     15. THEME
     ======================================================================= */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    state.theme = theme;
    saveState();
    // canvases read CSS vars, so redraw everything after a theme swap
    renderDashboard();
    renderChapterGrid();
    renderStats();
    if (!pomodoroPanel.hidden) renderPomodoro();
  }
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
  document.getElementById("setLightBtn").addEventListener("click", () => applyTheme("light"));
  document.getElementById("setDarkBtn").addEventListener("click", () => applyTheme("dark"));

  /* =======================================================================
     16. SETTINGS / BACKUP PANEL
     ======================================================================= */

  const settingsPanel = document.getElementById("settingsPanel");
  const settingsOverlay = document.getElementById("settingsOverlay");
  function openSettings() {
    settingsOverlay.hidden = false;
    settingsPanel.hidden = false;
    requestAnimationFrame(() => settingsPanel.classList.add("open"));
  }
  function closeSettings() {
    settingsPanel.classList.remove("open");
    setTimeout(() => { settingsPanel.hidden = true; settingsOverlay.hidden = true; }, 320);
  }
  document.getElementById("menuToggleBtn").addEventListener("click", openSettings);
  document.getElementById("settingsCloseBtn").addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("click", (e) => { if (e.target === settingsOverlay) closeSettings(); });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prep-desk-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Backup exported.");
  });

  document.getElementById("importInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || !parsed.chapters) {
          throw new Error("File does not look like a Prep Desk backup.");
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        state = loadState();
        renderAll();
        showToast("Backup imported successfully.");
        closeSettings();
      } catch (err) {
        showToast("Import failed: not a valid Prep Desk backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  /* ---- reset with typed confirmation ---- */
  const confirmOverlay = document.getElementById("confirmOverlay");
  const confirmInput = document.getElementById("confirmInput");
  const confirmProceedBtn = document.getElementById("confirmProceedBtn");

  document.getElementById("resetBtn").addEventListener("click", () => {
    confirmOverlay.hidden = false;
    confirmInput.value = "";
    confirmProceedBtn.disabled = true;
    confirmInput.focus();
  });
  document.getElementById("confirmCancelBtn").addEventListener("click", () => { confirmOverlay.hidden = true; });
  confirmInput.addEventListener("input", () => {
    confirmProceedBtn.disabled = confirmInput.value.trim() !== "RESET";
  });
  confirmProceedBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    saveState();
    confirmOverlay.hidden = true;
    closeSettings();
    renderAll();
    showToast("All data has been reset.");
  });

  /* =======================================================================
     17. INIT
     ======================================================================= */

  function renderAll() {
    document.documentElement.setAttribute("data-theme", state.theme || "dark");
    renderDashboard();
    renderChapterGrid();
    renderStats();
    renderCalendar();
    renderHeatmap();
  }

  snapshotCompletion();
  saveState();
  renderAll();

  // Redraw canvases on resize so ring/bar/line charts stay crisp.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderDashboard();
      renderChapterGrid();
      renderStats();
      if (!pomodoroPanel.hidden) renderPomodoro();
    }, 200);
  });
})();
