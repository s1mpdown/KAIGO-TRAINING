/* 科目別クイックドリル
   ホーム画面（試験選択）に、社会の理解（第38回・12問）へ直接進めるボタンを追加する。
   既存の selectExam / selectDomain の流れをそのまま使うため、他のモードには影響しない。 */
(function () {
  function addShakaiDrillButton() {
    const container = document.getElementById("exam-buttons");
    if (!container || document.getElementById("shakai-drill-button")) return;
    if (typeof selectExam !== "function" || typeof selectDomain !== "function") return;

    const button = document.createElement("button");
    button.id = "shakai-drill-button";
    button.className = "primary-button";
    button.style.borderLeft = "4px solid #FFB7B2";
    button.innerHTML = "🌍 <ruby>社会<rt>しゃかい</rt></ruby>の<ruby>理解<rt>りかい</rt></ruby> <ruby>集中<rt>しゅうちゅう</rt></ruby>ドリル（<ruby>第<rt>だい</rt></ruby>38<ruby>回<rt>かい</rt></ruby>・12<ruby>問<rt>もん</rt></ruby>）";
    button.addEventListener("click", () => {
      selectExam("38");
      selectDomain("03");
    });
    container.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addShakaiDrillButton);
  } else {
    addShakaiDrillButton();
  }
})();
