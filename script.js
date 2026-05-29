let questions = [];
let selectedExamId = null;
let totalQuestions = 0;
let currentIndex = 0;
let score = 0;
let acceptingAnswers = true;
let startTime = null;
let timerInterval = null;

const choiceLabels = ["A", "B", "C", "D", "E"];

const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choices");
const progressText = document.getElementById("progress");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const resultScreen = document.getElementById("result-screen");
const finalScore = document.getElementById("final-score");
const finalTime = document.getElementById("final-time");
const restartButton = document.getElementById("restart-button");
const backButton = document.getElementById("back-button");
const backButtonResult = document.getElementById("back-button-result");
const menuNav = document.getElementById("menu-nav");
const examSelection = document.getElementById("exam-selection");
const examButtonsContainer = document.getElementById("exam-buttons");
const quizTitle = document.getElementById("quiz-title");

function initializeExamButtons() {
  examButtonsContainer.innerHTML = "";

  Object.keys(examSets).forEach((examId) => {
    const button = document.createElement("button");
    button.className = "primary-button";
    button.innerHTML = `${examLabels[examId] || examId} を<ruby>始<rt>はじ</rt></ruby>める`;
    button.dataset.examId = examId;
    button.addEventListener("click", () => selectExam(examId));
    examButtonsContainer.appendChild(button);
  });
}

function isQuestionOnlyMode() {
  return questions.length > 0 && questions.every((q) => q.answer === null);
}

function selectExam(examId) {
  selectedExamId = examId;
  questions = examSets[examId] || [];
  totalQuestions = questions.length;
  currentIndex = 0;
  score = 0;

  startTimer(); // Start the stopwatch

  const questionLabel = examLabels[examId] || examId;
  quizTitle.innerHTML = `${questionLabel} ${totalQuestions}<ruby>問<rt>もん</rt></ruby>`;
  examSelection.classList.add("hidden");
  document.getElementById("quiz-card").classList.remove("hidden");
  resultScreen.classList.add("hidden");
  menuNav.classList.remove("hidden");

  saveState();
  updateHistory(true);
  showQuestion();
}

function saveState() {
  const state = {
    selectedExamId,
    currentIndex,
    score,
    stage: resultScreen.classList.contains("hidden") ? "quiz" : "result",
    startTimestamp: startTime ? startTime.toISOString() : null,
    elapsedSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
  };
  sessionStorage.setItem("quizState", JSON.stringify(state));
}

function loadState() {
  const stored = sessionStorage.getItem("quizState");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function updateHistory(replace = false) {
  const stage = resultScreen.classList.contains("hidden")
    ? "quiz"
    : "result";
  const state = {
    selectedExamId,
    currentIndex,
    score,
    stage,
  };
  const hash = selectedExamId ? `#exam-${selectedExamId}-${currentIndex}` : "#selection";
  if (replace) {
    history.replaceState(state, "", hash);
  } else {
    history.pushState(state, "", hash);
  }
}

function restoreState(state) {
  if (!state) {
    const stored = loadState();
    if (stored) {
      state = stored;
    }
  }

  if (!state || !state.selectedExamId || !examSets[state.selectedExamId]) {
    showSelection();
    return;
  }

  selectedExamId = state.selectedExamId;
  questions = examSets[selectedExamId] || [];
  totalQuestions = questions.length;
  currentIndex = Math.min(Math.max(state.currentIndex || 0, 0), totalQuestions);
  score = state.score || 0;

  quizTitle.innerHTML = `${examLabels[selectedExamId] || selectedExamId} 125<ruby>問<rt>もん</rt></ruby>クイズ`;
  examSelection.classList.add("hidden");
  document.getElementById("quiz-card").classList.remove("hidden");
  resultScreen.classList.add("hidden");

  if (state.startTimestamp) {
    startTimer(state.startTimestamp);
  } else {
    startTimer();
  }

  if (state.stage === "result" || currentIndex >= totalQuestions) {
    currentIndex = totalQuestions;
    showResult();
  } else {
    showQuestion();
  }
}

function showSelection() {
  selectedExamId = null;
  questions = [];
  totalQuestions = 0;
  currentIndex = 0;
  score = 0;
  acceptingAnswers = true;

  stopTimer();
  timerText.textContent = "Time: 00:00";

  quizTitle.innerHTML = "125<ruby>問<rt>もん</rt></ruby>クイズ";
  examSelection.classList.remove("hidden");
  document.getElementById("quiz-card").classList.add("hidden");
  resultScreen.classList.add("hidden");
  menuNav.classList.add("hidden");

  progressText.innerHTML = "<ruby>試験<rt>しけん</rt></ruby>を<ruby>選択<rt>せんたく</rt></ruby>してください";
  scoreText.textContent = "Score: 0";
  saveState();
  updateHistory(true);
}

function showQuestion() {
  if (!questions || questions.length === 0 || currentIndex >= totalQuestions) {
    questionText.textContent = "Quiz data is not loaded.";
    choicesContainer.innerHTML = "";
    return;
  }

  const currentQuestion = questions[currentIndex];
  questionText.innerHTML = currentQuestion.question;
  choicesContainer.innerHTML = "";

  currentQuestion.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    const label = choiceLabels[index] || String.fromCharCode(65 + index);
    button.innerHTML = `${label}: ${choice}`;
    button.dataset.choiceIndex = index;
    button.addEventListener("click", selectAnswer);
    choicesContainer.appendChild(button);
  });

  acceptingAnswers = true;
  updateScore();
  saveState();
  updateHistory(true);
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const hoursPart = hrs > 0 ? `${hrs}:` : "";
  const padded = (value) => String(value).padStart(2, "0");
  return `${hoursPart}${padded(mins)}:${padded(secs)}`;
}

function updateTimer() {
  if (!startTime) return;
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timerText.textContent = `Time: ${formatTime(elapsedSeconds)}`;
}

function startTimer(startTimestamp = null) {
  stopTimer();
  if (startTimestamp) {
    startTime = new Date(startTimestamp);
  } else {
    startTime = new Date();
  }
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateScore() {
  if (isQuestionOnlyMode()) {
    scoreText.textContent = "Practice mode: no answer key";
  } else {
    scoreText.textContent = `Score: ${score}`;
  }

  progressText.textContent = questions.length
    ? `Question ${currentIndex + 1} / ${totalQuestions}`
    : "Question 0 / 0";
}

function selectAnswer(event) {
  if (!acceptingAnswers) return;
  acceptingAnswers = false;

  const selectedButton = event.currentTarget;
  const selectedChoice = Number(selectedButton.dataset.choiceIndex);
  const correctChoice = questions[currentIndex].answer;
  const isPractice = correctChoice === null;

  if (isPractice) {
    selectedButton.classList.add("selected");
  } else {
    if (selectedChoice === correctChoice) {
      selectedButton.classList.add("correct");
      score += 1;
    } else {
      selectedButton.classList.add("wrong");
      const correctButton = document.querySelector(
        `button[data-choice-index="${correctChoice}"]`
      );
      if (correctButton) correctButton.classList.add("correct");
    }
  }

  updateScore();
  saveState();

  setTimeout(() => {
    currentIndex += 1;
    if (currentIndex >= totalQuestions) {
      showResult();
      return;
    }
    showQuestion();
  }, 700);
}

function showResult() {
  document.getElementById("quiz-card").classList.add("hidden");
  const practiceMode = isQuestionOnlyMode();

  if (practiceMode) {
    resultScreen.classList.remove("result-pass", "result-fail");
    document.getElementById("result-status").innerHTML = "<ruby>問題<rt>もんだい</rt></ruby>のみモード";
    finalScore.innerHTML = `<ruby>全<rt>ぜん</rt></ruby>${totalQuestions}<ruby>問<rt>もん</rt></ruby>を<ruby>表示<rt>ひょうじ</rt></ruby>しました`;
    finalTime.innerHTML = `<ruby>経過時間<rt>けいかじかん</rt></ruby>: ${timerText.textContent.replace("Time: ", "")}`;
  } else {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const statusText = percentage >= 70 ? "<ruby>合格<rt>ごうかく</rt></ruby>" : "<ruby>不合格<rt>ふごうかく</rt></ruby>";
    const resultClass = percentage >= 70 ? "result-pass" : "result-fail";

    resultScreen.classList.remove("result-pass", "result-fail");
    resultScreen.classList.add(resultClass);
    document.getElementById("result-status").innerHTML = statusText;
    finalScore.innerHTML = `${score}/${totalQuestions} (${percentage}%)`;
    finalTime.innerHTML = `<ruby>経過時間<rt>けいかじかん</rt></ruby>: ${timerText.textContent.replace("Time: ", "")}`;
  }

  resultScreen.classList.remove("hidden");
  menuNav.classList.remove("hidden");

  stopTimer();
  const elapsed = timerText.textContent.replace("Time: ", "");
  finalTime.textContent = `経過時間: ${elapsed}`;

  updateScore();
  saveState();
  updateHistory(true);
}

window.addEventListener("popstate", (event) => {
  restoreState(event.state);
});

restartButton.addEventListener("click", () => {
  if (selectedExamId) {
    selectExam(selectedExamId);
  } else {
    showSelection();
  }
});

backButton.addEventListener("click", showSelection);
backButtonResult.addEventListener("click", showSelection);

initializeExamButtons();
const initialState = history.state || loadState();
if (initialState) {
  restoreState(initialState);
} else {
  showSelection();
}
