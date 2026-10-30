// JLPT wing frame (PR-A): path picker + JLPT home/level screens.
// Additive only — if this file fails to load, the site behaves exactly as before:
// the care home (#exam-selection) is the default visible screen in the HTML,
// and this script merely hides it to present the path picker first.
(function () {
  var picker = document.getElementById("path-picker");
  if (!picker) return;

  var careHome = document.getElementById("exam-selection");
  var domainSelection = document.getElementById("domain-selection");
  var jlptHome = document.getElementById("jlpt-home");
  var jlptLevel = document.getElementById("jlpt-level");
  var levelTitle = document.getElementById("jlpt-level-title");
  var sectionRows = document.getElementById("jlpt-section-rows");

  // Section structure per level, mirroring the real exam.
  // Labels carry ruby, matching the rest of the site.
  var MOJI_GO =
    "<ruby>文字<rt>もじ</rt></ruby>・<ruby>語彙<rt>ごい</rt></ruby>";
  var BUNPO_DOKKAI =
    "<ruby>文法<rt>ぶんぽう</rt></ruby>・<ruby>読解<rt>どっかい</rt></ruby>";
  var GENGO_DOKKAI =
    "<ruby>言語知識<rt>げんごちしき</rt></ruby>・<ruby>読解<rt>どっかい</rt></ruby>";
  var CHOUKAI = "<ruby>聴解<rt>ちょうかい</rt></ruby>";
  var JUNBICHU = "<ruby>準備中<rt>じゅんびちゅう</rt></ruby>";

  var LEVEL_SECTIONS = {
    N5: [MOJI_GO, BUNPO_DOKKAI, CHOUKAI],
    N4: [MOJI_GO, BUNPO_DOKKAI, CHOUKAI],
    N3: [MOJI_GO, BUNPO_DOKKAI, CHOUKAI],
    N2: [GENGO_DOKKAI, CHOUKAI],
    N1: [GENGO_DOKKAI, CHOUKAI],
  };

  // Content sets per level, aligned by index with LEVEL_SECTIONS (PR-B).
  // Only levels with a shipped bank appear here. The setIds are registered
  // in examSets by jlpt-<level>.js, lazy-loaded on first open of the level.
  // null = no content for that section yet （聴解 stays 準備中）.
  var LEVEL_SETS = {
    N5: [
      { setId: "jlpt-n5-goi", count: 35 },
      { setId: "jlpt-n5-bunpo-dokkai", count: 32 },
      null,
    ],
    N4: [
      { setId: "jlpt-n4-goi", count: 35 },
      { setId: "jlpt-n4-bunpo-dokkai", count: 35 },
      null,
    ],
    N3: [
      { setId: "jlpt-n3-goi", count: 35 },
      { setId: "jlpt-n3-bunpo-dokkai", count: 39 },
      null,
    ],
  };
  var loadedLevels = {};
  var loadingLevels = {};

  function show(el) {
    if (el) el.classList.remove("hidden");
  }
  function hide(el) {
    if (el) el.classList.add("hidden");
  }
  function savePath(value) {
    try {
      localStorage.setItem("kaigo_last_path", value);
    } catch (e) {
      /* storage unavailable: picker simply shows no pre-highlight */
    }
  }

  function goPicker() {
    hide(careHome);
    hide(domainSelection);
    hide(jlptHome);
    hide(jlptLevel);
    show(picker);
  }

  function goCare() {
    hide(picker);
    hide(jlptHome);
    hide(jlptLevel);
    show(careHome);
    savePath("care");
  }

  function goJlpt() {
    hide(picker);
    hide(careHome);
    hide(jlptLevel);
    show(jlptHome);
    savePath("jlpt");
  }

  function bankReady(level) {
    var sets = LEVEL_SETS[level];
    if (!sets || typeof examSets === "undefined") return false;
    return sets.every(function (s) {
      return !s || (examSets[s.setId] && examSets[s.setId].length);
    });
  }

  function renderLevel(level) {
    var sections = LEVEL_SECTIONS[level];
    var sets = LEVEL_SETS[level] || [];
    var ready = bankReady(level);
    sectionRows.innerHTML = "";
    sections.forEach(function (labelHtml, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      var set = sets[i];
      if (ready && set) {
        btn.className = "path-row";
        btn.innerHTML =
          '<span class="path-row-side"></span>' +
          '<span class="path-row-label">' +
          labelHtml +
          "</span>" +
          '<span class="path-row-side path-row-count">' +
          set.count +
          "<ruby>問<rt>もん</rt></ruby></span>";
        btn.addEventListener("click", function () {
          startJlpt(set.setId);
        });
      } else {
        btn.className = "path-row is-soon";
        btn.disabled = true;
        btn.innerHTML =
          '<span class="path-row-side"></span>' +
          '<span class="path-row-label">' +
          labelHtml +
          "</span>" +
          '<span class="path-row-side path-row-count">' +
          JUNBICHU +
          "</span>";
      }
      sectionRows.appendChild(btn);
    });
  }

  function loadLevelData(level, done) {
    if (loadedLevels[level]) {
      done();
      return;
    }
    if (loadingLevels[level]) {
      loadingLevels[level].push(done);
      return;
    }
    loadingLevels[level] = [done];
    var s = document.createElement("script");
    s.src = "jlpt-" + level.toLowerCase() + ".js";
    s.onload = function () {
      loadedLevels[level] = true;
      var cbs = loadingLevels[level] || [];
      delete loadingLevels[level];
      cbs.forEach(function (cb) {
        cb();
      });
    };
    s.onerror = function () {
      // Data failed to load: rows stay 準備中， nothing breaks.
      delete loadingLevels[level];
    };
    document.head.appendChild(s);
  }

  function openLevel(level) {
    if (!LEVEL_SECTIONS[level] || !sectionRows || !levelTitle) return;
    levelTitle.textContent = level;
    hide(jlptHome);
    show(jlptLevel);
    renderLevel(level);
    if (LEVEL_SETS[level] && !bankReady(level)) {
      loadLevelData(level, function () {
        renderLevel(level);
      });
    }
  }

  function shuffleCopy(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  // Start a JLPT section run on the shared quiz engine. Every run shuffles
  // BOTH the question order and each question's choice order (answer and
  // per-choice explanations are remapped to follow their choice).
  function startJlpt(setId) {
    if (typeof examSets === "undefined") return;
    var bank = examSets[setId];
    if (!bank || !bank.length) return;

    var session = shuffleCopy(bank).map(function (q) {
      var order = shuffleCopy(
        q.choices.map(function (_, i) {
          return i;
        })
      );
      var explanations = {};
      order.forEach(function (oldIdx, newIdx) {
        if (q.explanations && q.explanations[String(oldIdx)] !== undefined) {
          explanations[String(newIdx)] = q.explanations[String(oldIdx)];
        }
      });
      return {
        question: q.question,
        choices: order.map(function (i) {
          return q.choices[i];
        }),
        answer: order.indexOf(q.answer),
        explanations: explanations,
      };
    });
    // Assign the session back so a mid-quiz resume replays the same order.
    examSets[setId] = session;

    clearIncompleteQuiz();
    selectedExamId = setId;
    selectedDomain = "all";
    questions = session;
    totalQuestions = session.length;
    userAnswers = new Array(totalQuestions).fill(null);
    currentIndex = 0;
    score = 0;
    attemptCount = 0;
    isReviewingFromResults = false;
    questionIndicesByDomain = [];

    startTimer();
    quizTitle.innerHTML =
      (examLabels[setId] || setId) +
      " (" +
      totalQuestions +
      "<ruby>問<rt>もん</rt></ruby>)";

    hide(picker);
    hide(jlptHome);
    hide(jlptLevel);
    hide(careHome);
    hide(domainSelection);
    document.getElementById("quiz-card").classList.remove("hidden");
    resultScreen.classList.add("hidden");
    menuNav.classList.remove("hidden");

    saveState();
    updateHistory(true);
    showQuestion();
  }

  // Called by script.js (showSelection) when a JLPT session ends via
  // "back to menu": return to that level's screen instead of the care home.
  window.jlptReturnToLevel = function (setId) {
    var m = /^jlpt-(n\d)-/i.exec(setId || "");
    var level = m ? m[1].toUpperCase() : "N5";
    if (!LEVEL_SECTIONS[level]) level = "N5";
    levelTitle.textContent = level;
    hide(picker);
    hide(jlptHome);
    hide(careHome);
    hide(domainSelection);
    show(jlptLevel);
    renderLevel(level);
    savePath("jlpt");
  };

  // Initial state: the picker is the front door (the splash covers this swap).
  hide(careHome);
  hide(jlptHome);
  hide(jlptLevel);
  show(picker);

  // Pre-highlight the path used last time, if any.
  var last = null;
  try {
    last = localStorage.getItem("kaigo_last_path");
  } catch (e) {
    last = null;
  }
  if (last === "care") {
    var careCard = document.getElementById("path-care");
    if (careCard) careCard.classList.add("last-used");
  }
  if (last === "jlpt") {
    var jlptCard = document.getElementById("path-jlpt");
    if (jlptCard) jlptCard.classList.add("last-used");
  }

  var careBtn = document.getElementById("path-care");
  if (careBtn) careBtn.addEventListener("click", goCare);
  var jlptBtn = document.getElementById("path-jlpt");
  if (jlptBtn) jlptBtn.addEventListener("click", goJlpt);

  var changePath = document.getElementById("change-path-button");
  if (changePath) changePath.addEventListener("click", goPicker);
  var backToPicker = document.getElementById("jlpt-back-to-picker");
  if (backToPicker) backToPicker.addEventListener("click", goPicker);
  var backToLevels = document.getElementById("jlpt-back-to-levels");
  if (backToLevels) backToLevels.addEventListener("click", goJlpt);

  var levelButtons = jlptHome.querySelectorAll("[data-level]");
  Array.prototype.forEach.call(levelButtons, function (btn) {
    btn.addEventListener("click", function () {
      openLevel(btn.getAttribute("data-level"));
    });
  });
})();

// Pages rebuild nudge: no behaviour change.
