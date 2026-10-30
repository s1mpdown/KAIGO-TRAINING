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

  function openLevel(level) {
    var sections = LEVEL_SECTIONS[level];
    if (!sections || !sectionRows || !levelTitle) return;
    levelTitle.textContent = level;
    sectionRows.innerHTML = "";
    sections.forEach(function (labelHtml) {
      var btn = document.createElement("button");
      btn.type = "button";
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
      sectionRows.appendChild(btn);
    });
    hide(jlptHome);
    show(jlptLevel);
  }

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
