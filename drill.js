/* 科目別ドリル（全年度プール）
   第36回・第37回・第38回の問題を科目ごとに集めた仮想セット "drill-XX" を登録する。
   registerSubjectDrills は script.js の初期化処理（ボタン生成・ドメイン対応表の構築）の
   直前に呼ばれるため、このファイルは script.js より前に読み込むこと。
   ホーム画面には科目別ドリルのボタンを追加し、タップでその科目だけを出題する。 */
function registerSubjectDrills() {
  if (typeof examSets === "undefined" || typeof categoryMap === "undefined") return;
  if (typeof DOMAINS === "undefined" || typeof categoryToDomainMap === "undefined") return;
  if (typeof examLabels === "undefined") return;

  var sourceExams = ["36", "37", "38", "35", "34"];
  Object.keys(DOMAINS).forEach(function (code) {
    if (code === "all") return;
    var drillId = "drill-" + code;
    if (examSets[drillId]) return;

    var pooled = [];
    var pooledMap = {};
    sourceExams.forEach(function (examId) {
      var set = examSets[examId] || [];
      var map = categoryMap[examId] || {};
      set.forEach(function (q, idx) {
        if (categoryToDomainMap[map[idx + 1]] === code) {
          pooled.push(q);
          pooledMap[pooled.length] = DOMAINS[code].name;
        }
      });
    });
    if (pooled.length === 0) return;

    examSets[drillId] = pooled;
    categoryMap[drillId] = pooledMap;
    examLabels[drillId] =
      "科目別ドリル " + DOMAINS[code].name + "（第34〜38回・" + pooled.length + "問）";
  });
}

(function () {
  function addDrillButtons() {
    var container = document.getElementById("drill-buttons");
    if (!container || container.childElementCount > 0) return;
    if (typeof selectExam !== "function" || typeof selectDomain !== "function") return;
    if (typeof DOMAINS === "undefined" || typeof examSets === "undefined") return;

    Object.keys(DOMAINS).forEach(function (code) {
      if (code === "all") return;
      var drillId = "drill-" + code;
      var set = examSets[drillId];
      if (!set || set.length === 0) return;

      var domain = DOMAINS[code];
      var button = document.createElement("button");
      button.className = "primary-button";
      button.style.borderLeft = "4px solid " + (domain.color || "#FFB7B2");
      button.textContent =
        (domain.icon ? domain.icon + " " : "") + domain.name + "（全年度・" + set.length + "問）";
      button.addEventListener("click", function () {
        selectExam(drillId);
        selectDomain(code);
      });
      container.appendChild(button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addDrillButtons);
  } else {
    addDrillButtons();
  }
})();
