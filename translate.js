/* インドネシア語訳のタップ表示（学習支援用）
   問題文の訳はクイズ画面のボタンから、 正解の解説の訳は回答後のフィードバック内からのみ表示する
   （回答前に解説訳を見ると正解が漏れるため）。
   訳データ translations_id.js は初回タップ時に遅延読み込みし、通常の読み込みは重くしない。
   本番シミュレーション中は試験条件を保つため訳ボタンを出さない。
   このファイルは script.js より前に読み込み、UI の初期化は DOMContentLoaded で行う。 */
var TR_SOURCE_EXAMS = ["34", "35", "36", "37", "38", "38pm"];
var trLoadPromise = null;
var trCurrentRef = null;

function trEnsureLoaded() {
  if (typeof translationsID !== "undefined") return Promise.resolve(true);
  if (!trLoadPromise) {
    trLoadPromise = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "translations_id.js";
      s.onload = function () {
        resolve(typeof translationsID !== "undefined");
      };
      s.onerror = function () {
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }
  return trLoadPromise;
}

function trStrip(s) {
  if (!s) return "";
  return String(s)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<rt>[\s\S]*?<\/rt>/g, "")
    .replace(/<\/?ruby>/g, "")
    .replace(/｛[^｝]*｝/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trCurrentQuestion() {
  try {
    var actual =
      typeof questionIndicesByDomain !== "undefined" &&
      questionIndicesByDomain.length > 0
        ? questionIndicesByDomain[currentIndex]
        : currentIndex;
    return questions[actual] || null;
  } catch (e) {
    return null;
  }
}

/* 表示中の問題が元データのどれかを特定する（メタ情報→参照一致→本文一致の順） */
function trResolveRef() {
  var q = trCurrentQuestion();
  if (!q) return null;
  if (q._examId && q._questionNumber) {
    return { e: q._examId, idx: q._questionNumber - 1 };
  }
  var i, arr, idx;
  for (i = 0; i < TR_SOURCE_EXAMS.length; i++) {
    arr = examSets[TR_SOURCE_EXAMS[i]] || [];
    idx = arr.indexOf(q);
    if (idx >= 0) return { e: TR_SOURCE_EXAMS[i], idx: idx };
  }
  var t = trStrip(q.question);
  if (t) {
    for (i = 0; i < TR_SOURCE_EXAMS.length; i++) {
      arr = examSets[TR_SOURCE_EXAMS[i]] || [];
      for (var k = 0; k < arr.length; k++) {
        if (trStrip(arr[k].question) === t) {
          return { e: TR_SOURCE_EXAMS[i], idx: k };
        }
      }
    }
  }
  return null;
}

function trEntry() {
  if (!trCurrentRef || typeof translationsID === "undefined") return null;
  var set = translationsID[trCurrentRef.e];
  return set ? set[trCurrentRef.idx] || null : null;
}

(function () {
  function initTranslateUi() {
    var btn = document.getElementById("translate-button");
    var panel = document.getElementById("translate-panel");
    var text = document.getElementById("translate-text");
    if (!btn || !panel || !text) return;

    btn.addEventListener("click", function () {
      if (!panel.classList.contains("hidden")) {
        panel.classList.add("hidden");
        return;
      }
      text.textContent = "Memuat terjemahan...";
      panel.classList.remove("hidden");
      trEnsureLoaded().then(function (ok) {
        var entry = ok ? trEntry() : null;
        text.textContent = entry
          ? entry.q
          : "Terjemahan tidak tersedia untuk soal ini.";
      });
    });

    function resetTranslate() {
      panel.classList.add("hidden");
      text.textContent = "";
      document.querySelectorAll(".tr-exp-wrap").forEach(function (el) {
        el.remove();
      });
    }

    if (typeof showQuestion === "function") {
      var origShowQuestion = showQuestion;
      window.showQuestion = function () {
        origShowQuestion();
        resetTranslate();
        trCurrentRef = trResolveRef();
        try {
          btn.classList.toggle(
            "hidden",
            selectedExamId === "sim" || !trCurrentQuestion()
          );
        } catch (e) {}
      };
    }

    if (typeof renderFeedback === "function") {
      var origRenderFeedback = renderFeedback;
      window.renderFeedback = function (question, selectedChoice) {
        origRenderFeedback(question, selectedChoice);
        try {
          if (selectedExamId === "sim") return;
          var area = document.getElementById("correct-answer-area");
          var fb = document.getElementById("feedback-area");
          if (!area || !fb || fb.classList.contains("hidden")) return;
          if (!trCurrentRef) trCurrentRef = trResolveRef();
          if (!trCurrentRef) return;

          /* renderFeedback は正解時に2回呼ばれるため、既存の訳UIを消してから1つだけ追加する */
          document.querySelectorAll(".tr-exp-wrap").forEach(function (el) {
            el.remove();
          });

          var wrap = document.createElement("div");
          wrap.className = "tr-exp-wrap";
          var b = document.createElement("button");
          b.type = "button";
          b.className = "primary-button secondary-button tr-exp-button";
          b.textContent = "🌐 Penjelasan (Bahasa Indonesia)";
          var p = document.createElement("div");
          p.className = "tr-exp-panel hidden";
          var pt = document.createElement("p");
          p.appendChild(pt);
          b.addEventListener("click", function () {
            if (!p.classList.contains("hidden")) {
              p.classList.add("hidden");
              return;
            }
            pt.textContent = "Memuat terjemahan...";
            p.classList.remove("hidden");
            trEnsureLoaded().then(function (ok) {
              var entry = ok ? trEntry() : null;
              pt.textContent = entry
                ? entry.e
                : "Terjemahan tidak tersedia untuk soal ini.";
            });
          });
          wrap.appendChild(b);
          wrap.appendChild(p);
          area.appendChild(wrap);
        } catch (e) {}
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTranslateUi);
  } else {
    initTranslateUi();
  }
})();
