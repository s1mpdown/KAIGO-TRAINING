/* 本番シミュレーション（模擬試験）
   第38回の出題構成（科目・順序・問題数）をブループリントとして、
   第34〜38回の問題プールから科目ごとにランダム抽選した125問の
   フレッシュな模擬試験 "sim" を登録する。
   - 総合問題は事例がバラバラにならないよう、1年度分をブロックごと採用する。
   - 選択肢は問題ごとにシャッフルし、正解と解説の対応を保持する。
   - 出題構成（picks）は localStorage に保存し、中断→再開でも同じ問題用紙を復元する。
   - 制限時間は本番合計の210分。残り時間をヘッダーに表示し、0で自動終了する。
   - 結果画面では合格ライン目安（75点＝60%）で判定し直す。
   registerSimulation は script.js の初期化処理から呼ばれるため、
   このファイルは script.js より前に読み込むこと。 */
var SIM_LIMIT_SECONDS = 210 * 60;
var SIM_PASS_LINE = 75;
var SIM_PICKS_KEY = "sim_paper_v1";
var SIM_SOURCE_EXAMS = ["34", "35", "36", "37", "38"];
var SIM_SOGO_SOURCES = ["34", "35", "38"];

function simShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function simPermutation(n) {
  return simShuffle(
    Array.from({ length: n }, function (_, i) {
      return i;
    })
  );
}

/* 選択肢を perm の順に並べ替え、正解位置と解説の対応を付け替えたコピーを返す。
   perm[k] = 新しい位置 k に来る元の選択肢インデックス。元の問題オブジェクトは変更しない。 */
function simApplyPermutation(q, perm) {
  var newChoices = perm.map(function (oldIdx) {
    return q.choices[oldIdx];
  });
  var newAnswer =
    typeof q.answer === "number" ? perm.indexOf(q.answer) : q.answer;
  var newExplanations = {};
  if (q.explanations) {
    Object.keys(q.explanations).forEach(function (k) {
      var newIdx = perm.indexOf(Number(k));
      if (newIdx >= 0) newExplanations[newIdx] = q.explanations[k];
    });
  }
  var copy = Object.assign({}, q, {
    choices: newChoices,
    answer: newAnswer,
    explanations: newExplanations,
  });
  return copy;
}

function simBlueprintSequence() {
  var seq = [];
  var map = categoryMap["38"] || {};
  for (var i = 1; i <= 125; i++) seq.push(map[i] || "その他");
  return seq;
}

function simGeneratePicks() {
  var seq = simBlueprintSequence();
  var counts = {};
  var order = [];
  seq.forEach(function (name) {
    if (!(name in counts)) {
      counts[name] = 0;
      order.push(name);
    }
    counts[name]++;
  });

  var queues = {};
  order.forEach(function (name) {
    if (name === "総合問題") return;
    var candidates = [];
    SIM_SOURCE_EXAMS.forEach(function (examId) {
      var set = examSets[examId] || [];
      var map = categoryMap[examId] || {};
      set.forEach(function (q, idx) {
        if (map[idx + 1] === name) candidates.push({ e: examId, n: idx + 1 });
      });
    });
    queues[name] = simShuffle(candidates).slice(0, counts[name]);
  });

  /* 総合問題：事例問題のまとまりを壊さないよう、1年度分を丸ごと・順番どおりに使う */
  var sogoQueue = null;
  var sogoSources = simShuffle(SIM_SOGO_SOURCES);
  for (var s = 0; s < sogoSources.length && !sogoQueue; s++) {
    var src = sogoSources[s];
    var block = [];
    (examSets[src] || []).forEach(function (q, idx) {
      if ((categoryMap[src] || {})[idx + 1] === "総合問題") {
        block.push({ e: src, n: idx + 1 });
      }
    });
    if (block.length === counts["総合問題"]) sogoQueue = block;
  }
  if (!sogoQueue) {
    sogoQueue = (queues["総合問題"] = []);
    var fallback = [];
    (examSets["38"] || []).forEach(function (q, idx) {
      if ((categoryMap["38"] || {})[idx + 1] === "総合問題") {
        fallback.push({ e: "38", n: idx + 1 });
      }
    });
    sogoQueue = fallback.slice(0, counts["総合問題"]);
  }
  queues["総合問題"] = sogoQueue;

  var picks = seq.map(function (name) {
    return queues[name].shift();
  });
  return picks;
}

function simValidPicks(picks) {
  if (!Array.isArray(picks) || picks.length !== 125) return false;
  return picks.every(function (pk) {
    return (
      pk &&
      examSets[pk.e] &&
      examSets[pk.e][pk.n - 1] &&
      Array.isArray(pk.p) &&
      pk.p.length === examSets[pk.e][pk.n - 1].choices.length
    );
  });
}

function simBuildPaper(picks) {
  var usePicks = simValidPicks(picks) ? picks : simGeneratePicks();
  var paper = usePicks.map(function (pk) {
    var q = examSets[pk.e][pk.n - 1];
    if (!Array.isArray(pk.p) || pk.p.length !== q.choices.length) {
      pk.p = simPermutation(q.choices.length);
    }
    return simApplyPermutation(q, pk.p);
  });
  return { paper: paper, picks: usePicks };
}

function simSavePicks(picks) {
  try {
    localStorage.setItem(SIM_PICKS_KEY, JSON.stringify(picks));
  } catch (e) {}
}

function simResumePicks() {
  try {
    var inc = JSON.parse(localStorage.getItem("incomplete_quiz") || "null");
    if (!inc || inc.selectedExamId !== "sim") return null;
    var stored = JSON.parse(localStorage.getItem(SIM_PICKS_KEY) || "null");
    return simValidPicks(stored) ? stored : null;
  } catch (e) {
    return null;
  }
}

function registerSimulation() {
  if (typeof examSets === "undefined" || typeof categoryMap === "undefined") return;
  if (typeof examLabels === "undefined") return;
  if (!categoryMap["38"] || examSets["sim"]) return;

  categoryMap["sim"] = Object.assign({}, categoryMap["38"]);
  examLabels["sim"] = "本番シミュレーション（125問）";

  var built = simBuildPaper(simResumePicks());
  examSets["sim"] = built.paper;
  simSavePicks(built.picks);
}

(function () {
  function initSimUi() {
    /* 模擬試験ボタンを押すたびに新しい問題用紙を生成する。
       エンジン側の click リスナーが先に selectExam を実行するが、
       questions は examSets["sim"] と同じ配列参照なので、
       ここで中身を入れ替えれば新しい用紙で開始できる。 */
    var btn = document.querySelector(
      '#exam-buttons button[data-exam-id="sim"]'
    );
    if (btn) {
      btn.addEventListener("click", function () {
        if (!examSets["sim"]) return;
        var built = simBuildPaper(null);
        examSets["sim"].splice(
          0,
          examSets["sim"].length,
          ...built.paper
        );
        simSavePicks(built.picks);
      });
    }

    /* 残り時間バッジ（模擬試験のときだけ表示） */
    var panel = document.querySelector(".score-panel");
    var badge = null;
    if (panel) {
      badge = document.createElement("p");
      badge.id = "sim-countdown";
      badge.className = "hidden";
      panel.appendChild(badge);
    }

    /* 結果画面の判定を合格ライン目安（75点）で上書きする */
    if (typeof showResult === "function") {
      var originalShowResult = showResult;
      window.showResult = function () {
        originalShowResult();
        try {
          if (selectedExamId !== "sim") return;
          var pass = score >= SIM_PASS_LINE;
          resultScreen.classList.remove("result-pass", "result-fail");
          resultScreen.classList.add(pass ? "result-pass" : "result-fail");
          var statusEl = document.getElementById("result-status");
          if (statusEl) {
            statusEl.innerHTML = pass
              ? "<ruby>合格<rt>ごうかく</rt></ruby>（<ruby>目安<rt>めやす</rt></ruby>）"
              : "<ruby>不合格<rt>ふごうかく</rt></ruby>（<ruby>目安<rt>めやす</rt></ruby>）";
          }
          var fs = document.getElementById("final-score");
          if (fs) {
            fs.innerHTML +=
              "<br><ruby>合格<rt>ごうかく</rt></ruby>ライン<ruby>目安<rt>めやす</rt></ruby>: " +
              SIM_PASS_LINE +
              "/125（60%）";
          }
        } catch (e) {}
      };
    }

    /* カウントダウンと時間切れの自動終了 */
    setInterval(function () {
      try {
        var quizCard = document.getElementById("quiz-card");
        var active =
          selectedExamId === "sim" &&
          !!startTime &&
          quizCard &&
          !quizCard.classList.contains("hidden");
        if (!active) {
          if (badge) badge.classList.add("hidden");
          return;
        }
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        var remaining = SIM_LIMIT_SECONDS - elapsed;
        if (remaining <= 0) {
          if (badge) badge.classList.add("hidden");
          updateScore();
          currentIndex = totalQuestions;
          showResult();
          return;
        }
        if (badge) {
          badge.textContent = "⏱ 残り " + formatTime(remaining);
          badge.classList.remove("hidden");
        }
      } catch (e) {}
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSimUi);
  } else {
    initSimUi();
  }
})();
