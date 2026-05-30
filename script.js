let questions = [];
let selectedExamId = null;
let totalQuestions = 0;
let currentIndex = 0;
let score = 0;
let userAnswers = [];
let acceptingAnswers = true;
let startTime = null;
let timerInterval = null;
let attemptCount = 0;
let elapsedSeconds = 0;

const choiceLabels = ["A", "B", "C", "D", "E"];

const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choices");
const correctAnswerArea = document.getElementById("correct-answer-area");
const correctAnswerText = document.getElementById("correct-answer-text");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const progressText = document.getElementById("progress");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const resultScreen = document.getElementById("result-screen");
const finalScore = document.getElementById("final-score");
const finalTime = document.getElementById("final-time");
const finalAttempts = document.getElementById("final-attempts");
const bestTimeDisplay = document.getElementById("best-time");
const avgTimeDisplay = document.getElementById("avg-time");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const backButton = document.getElementById("back-button");
const backButtonResult = document.getElementById("back-button-result");
const menuNav = document.getElementById("menu-nav");
const examSelection = document.getElementById("exam-selection");
const examButtonsContainer = document.getElementById("exam-buttons");
const quizTitle = document.getElementById("quiz-title");

function initializeExamButtons() {
  examButtonsContainer.innerHTML = "";

  Object.keys(examSets).reverse().forEach((examId) => {
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

// Quiz state persistence functions
function getIncompleteQuiz() {
  const stored = localStorage.getItem("incomplete_quiz");
  return stored ? JSON.parse(stored) : null;
}

function saveIncompleteQuiz(state) {
  localStorage.setItem("incomplete_quiz", JSON.stringify(state));
}

function clearIncompleteQuiz() {
  localStorage.removeItem("incomplete_quiz");
}

// Time tracking functions
function getExamTimes(examId) {
  const stored = localStorage.getItem(`exam_times_${examId}`);
  return stored ? JSON.parse(stored) : [];
}

function saveExamTime(examId, seconds) {
  const times = getExamTimes(examId);
  times.push(seconds);
  localStorage.setItem(`exam_times_${examId}`, JSON.stringify(times));
}

function getBestTime(examId) {
  const times = getExamTimes(examId);
  return times.length > 0 ? Math.min(...times) : null;
}

function getAverageTime(examId) {
  const times = getExamTimes(examId);
  if (times.length === 0) return null;
  const sum = times.reduce((a, b) => a + b, 0);
  return Math.round(sum / times.length);
}

function selectExam(examId) {
  clearIncompleteQuiz();  // Clear any previous incomplete quiz
  
  selectedExamId = examId;
  questions = examSets[examId] || [];
  totalQuestions = questions.length;
  userAnswers = new Array(totalQuestions).fill(null);
  currentIndex = 0;
  score = 0;
  attemptCount = 0;

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

function resumeQuiz() {
  const incompleteQuiz = getIncompleteQuiz();
  if (!incompleteQuiz) return;

  selectedExamId = incompleteQuiz.selectedExamId;
  questions = examSets[selectedExamId] || [];
  totalQuestions = questions.length;
  currentIndex = incompleteQuiz.currentIndex;
  score = incompleteQuiz.score;
  userAnswers = incompleteQuiz.userAnswers;
  attemptCount = incompleteQuiz.attemptCount;

  startTimer(incompleteQuiz.startTimestamp);

  const questionLabel = examLabels[selectedExamId] || selectedExamId;
  quizTitle.innerHTML = `${questionLabel} ${totalQuestions}<ruby>問<rt>もん</rt></ruby>`;
  examSelection.classList.add("hidden");
  document.getElementById("quiz-card").classList.remove("hidden");
  resultScreen.classList.add("hidden");
  menuNav.classList.remove("hidden");

  updateHistory(true);
  showQuestion();
}

function saveState() {
  const stage = resultScreen.classList.contains("hidden") ? "quiz" : "result";
  const state = {
    selectedExamId,
    currentIndex,
    score,
    userAnswers,
    stage,
    startTimestamp: startTime ? startTime.toISOString() : null,
    elapsedSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
  };
  sessionStorage.setItem("quizState", JSON.stringify(state));
  
  // Also save to localStorage if quiz is in progress (not completed)
  if (stage === "quiz" && currentIndex < totalQuestions) {
    const incompleteState = {
      selectedExamId,
      currentIndex,
      score,
      userAnswers,
      attemptCount,
      startTimestamp: startTime ? startTime.toISOString() : null,
    };
    saveIncompleteQuiz(incompleteState);
  }
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
    userAnswers,
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
  userAnswers = state.userAnswers || new Array(totalQuestions).fill(null);
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
  userAnswers = [];
  currentIndex = 0;
  score = 0;
  attemptCount = 0;
  acceptingAnswers = true;

  stopTimer();
  timerText.textContent = "Time: 00:00";

  quizTitle.innerHTML = "125<ruby>問<rt>もん</rt></ruby>クイズ";
  examSelection.classList.remove("hidden");
  document.getElementById("quiz-card").classList.add("hidden");
  resultScreen.classList.add("hidden");
  menuNav.classList.add("hidden");

  // Show/hide resume button based on incomplete quiz
  const incompleteQuiz = getIncompleteQuiz();
  if (resumeButton) {
    if (incompleteQuiz) {
      const examLabel = examLabels[incompleteQuiz.selectedExamId] || incompleteQuiz.selectedExamId;
      resumeButton.innerHTML = `<ruby>再開<rt>さいかい</rt></ruby>: ${examLabel} (Q${incompleteQuiz.currentIndex + 1})`;
      resumeButton.classList.remove("hidden");
    } else {
      resumeButton.classList.add("hidden");
    }
  }

  progressText.innerHTML = "";
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

  correctAnswerArea.classList.add("hidden");
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = true;

  if (userAnswers[currentIndex] !== null) {
    acceptingAnswers = false;
    nextButton.disabled = false;
    
    // Highlight the selected answer
    const selectedChoice = userAnswers[currentIndex];
    const correctChoice = currentQuestion.answer;
    const isPractice = correctChoice === null;
    
    const buttons = choicesContainer.querySelectorAll("button");
    if (isPractice) {
      if (buttons[selectedChoice]) buttons[selectedChoice].classList.add("selected");
    } else {
      if (selectedChoice === correctChoice) {
        if (buttons[selectedChoice]) buttons[selectedChoice].classList.add("correct");
      } else {
        if (buttons[selectedChoice]) buttons[selectedChoice].classList.add("wrong");
        if (buttons[correctChoice]) buttons[correctChoice].classList.add("correct");
        
        correctAnswerText.innerHTML = currentQuestion.choices[correctChoice];
        correctAnswerArea.classList.remove("hidden");
      }
    }
  } else {
    acceptingAnswers = true;
  }

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
  // Recalculate score based on userAnswers
  score = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (questions[i] && userAnswers[i] === questions[i].answer && questions[i].answer !== null) {
      score++;
    }
  }

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
  nextButton.disabled = false;

  const selectedButton = event.currentTarget;
  const selectedChoice = Number(selectedButton.dataset.choiceIndex);
  const correctChoice = questions[currentIndex].answer;
  const isPractice = correctChoice === null;

  userAnswers[currentIndex] = selectedChoice;
  attemptCount++;

  if (isPractice) {
    selectedButton.classList.add("selected");
  } else {
    if (selectedChoice === correctChoice) {
      selectedButton.classList.add("correct");
    } else {
      selectedButton.classList.add("wrong");
      const correctButton = document.querySelector(
        `button[data-choice-index="${correctChoice}"]`
      );
      if (correctButton) correctButton.classList.add("correct");
      
      correctAnswerText.innerHTML = questions[currentIndex].choices[correctChoice];
      correctAnswerArea.classList.remove("hidden");
    }
  }

  updateScore();
  saveState();
}

function showResult() {
  document.getElementById("quiz-card").classList.add("hidden");
  const practiceMode = isQuestionOnlyMode();
  
  // Calculate elapsed time in seconds
  elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  
  if (practiceMode) {
    resultScreen.classList.remove("result-pass", "result-fail");
    document.getElementById("result-status").innerHTML = "<ruby>問題<rt>もんだい</rt></ruby>のみモード";
    finalScore.innerHTML = `<ruby>全<rt>ぜん</rt></ruby>${totalQuestions}<ruby>問<rt>もん</rt></ruby>を<ruby>表示<rt>ひょうじ</rt></ruby>しました`;
    finalTime.innerHTML = `<ruby>経過時間<rt>けいかじかん</rt></ruby>: ${timerText.textContent.replace("Time: ", "")}`;
    if (finalAttempts) finalAttempts.innerHTML = `<ruby>試行回数<rt>しこうかいすう</rt></ruby>: ${attemptCount}`;
  } else {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const statusText = percentage >= 70 ? "<ruby>合格<rt>ごうかく</rt></ruby>" : "<ruby>不合格<rt>ふごうかく</rt></ruby>";
    const resultClass = percentage >= 70 ? "result-pass" : "result-fail";

    resultScreen.classList.remove("result-pass", "result-fail");
    resultScreen.classList.add(resultClass);
    document.getElementById("result-status").innerHTML = statusText;
    finalScore.innerHTML = `${score}/${totalQuestions} (${percentage}%)`;
    finalTime.innerHTML = `<ruby>経過時間<rt>けいかじかん</rt></ruby>: ${timerText.textContent.replace("Time: ", "")}`;
    if (finalAttempts) finalAttempts.innerHTML = `<ruby>試行回数<rt>しこうかいすう</rt></ruby>: ${attemptCount}`;
    
    // Save time and show stats
    saveExamTime(selectedExamId, elapsedSeconds);
    const bestTime = getBestTime(selectedExamId);
    const avgTime = getAverageTime(selectedExamId);
    
    if (bestTimeDisplay) {
      bestTimeDisplay.innerHTML = bestTime 
        ? `<ruby>自己最高記録<rt>じこさいこうきろく</rt></ruby>: ${formatTime(bestTime)}` 
        : `<ruby>自己最高記録<rt>じこさいこうきろく</rt></ruby>: --:--`;
    }
    
    if (avgTimeDisplay) {
      avgTimeDisplay.innerHTML = avgTime 
        ? `<ruby>平均時間<rt>へいきんじかん</rt></ruby>: ${formatTime(avgTime)}` 
        : `<ruby>平均時間<rt>へいきんじかん</rt></ruby>: --:--`;
    }
  }

  resultScreen.classList.remove("hidden");
  menuNav.classList.remove("hidden");

  stopTimer();
  const elapsed = timerText.textContent.replace("Time: ", "");
  finalTime.textContent = `経過時間: ${elapsed}`;

  updateScore();
  clearIncompleteQuiz();  // Clear incomplete quiz when finished
  saveState();
  updateHistory(true);
}

window.addEventListener("popstate", (event) => {
  restoreState(event.state);
});

if (resumeButton) {
  resumeButton.addEventListener("click", resumeQuiz);
}

restartButton.addEventListener("click", () => {
  if (selectedExamId) {
    selectExam(selectedExamId);
  } else {
    showSelection();
  }
});

prevButton.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    showQuestion();
  }
});

nextButton.addEventListener("click", () => {
  currentIndex += 1;
  if (currentIndex >= totalQuestions) {
    showResult();
  } else {
    showQuestion();
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
