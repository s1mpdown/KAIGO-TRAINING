let questions = [];
let selectedExamId = null;
let selectedDomain = "all";
let questionIndicesByDomain = [];
let totalQuestions = 0;
let currentIndex = 0;
let score = 0;
let userAnswers = [];
let acceptingAnswers = true;
let startTime = null;
let timerInterval = null;
let attemptCount = 0;
let elapsedSeconds = 0;
let isReviewingFromResults = false;

// Safety checks for global variables loaded from external scripts
if (typeof examSets === 'undefined') {
  console.error('examSets not loaded - ensure questions.js and questions38pm.js are loaded first');
}
if (typeof examLabels === 'undefined') {
  console.error('examLabels not loaded - ensure questions.js is loaded first');
}

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
const categoryTag = document.getElementById("category-tag");
const domainSelection = document.getElementById("domain-selection");
const domainButtonsContainer = document.getElementById("domain-buttons");
const backFromDomainButton = document.getElementById("back-from-domain");

// Category mapping for exam questions (Q1-125) - Official structure
const categoryMap = {
  "38": {
    1: "人間の尊厳と自立", 2: "人間の尊厳と自立",
    3: "介護の基本", 4: "介護の基本", 5: "介護の基本", 6: "介護の基本", 7: "介護の基本",
    8: "介護の基本", 9: "介護の基本", 10: "介護の基本", 11: "介護の基本", 12: "介護の基本",
    13: "社会の理解", 14: "社会の理解", 15: "社会の理解", 16: "社会の理解", 17: "社会の理解",
    18: "社会の理解", 19: "社会の理解", 20: "社会の理解", 21: "社会の理解", 22: "社会の理解",
    23: "社会の理解", 24: "社会の理解",
    25: "人間関係とコミュニケーション", 26: "人間関係とコミュニケーション", 27: "人間関係とコミュニケーション", 28: "人間関係とコミュニケーション",
    29: "コミュニケーション技術", 30: "コミュニケーション技術", 31: "コミュニケーション技術", 32: "コミュニケーション技術", 33: "コミュニケーション技術", 34: "コミュニケーション技術",
    35: "生活支援技術", 36: "生活支援技術", 37: "生活支援技術", 38: "生活支援技術", 39: "生活支援技術",
    40: "生活支援技術", 41: "生活支援技術", 42: "生活支援技術", 43: "生活支援技術", 44: "生活支援技術",
    45: "生活支援技術", 46: "生活支援技術", 47: "生活支援技術", 48: "生活支援技術", 49: "生活支援技術",
    50: "生活支援技術", 51: "生活支援技術", 52: "生活支援技術", 53: "生活支援技術", 54: "生活支援技術",
    55: "生活支援技術", 56: "生活支援技術", 57: "生活支援技術", 58: "生活支援技術", 59: "生活支援技術",
    60: "生活支援技術",
    61: "こころとからだのしくみ", 62: "こころとからだのしくみ", 63: "こころとからだのしくみ", 64: "こころとからだのしくみ", 65: "こころとからだのしくみ",
    66: "こころとからだのしくみ", 67: "こころとからだのしくみ", 68: "こころとからだのしくみ", 69: "こころとからだのしくみ", 70: "こころとからだのしくみ",
    71: "こころとからだのしくみ", 72: "こころとからだのしくみ",
    73: "発達と老化の理解", 74: "発達と老化の理解", 75: "発達と老化の理解", 76: "発達と老化の理解", 77: "発達と老化の理解",
    78: "発達と老化の理解", 79: "発達と老化の理解", 80: "発達と老化の理解",
    81: "認知症の理解", 82: "認知症の理解", 83: "認知症の理解", 84: "認知症の理解", 85: "認知症の理解",
    86: "認知症の理解", 87: "認知症の理解", 88: "認知症の理解", 89: "認知症の理解", 90: "認知症の理解",
    91: "障害の理解", 92: "障害の理解", 93: "障害の理解", 94: "障害の理解", 95: "障害の理解",
    96: "障害の理解", 97: "障害の理解", 98: "障害の理解", 99: "障害の理解", 100: "障害の理解",
    101: "医療的ケア", 102: "医療的ケア", 103: "医療的ケア", 104: "医療的ケア", 105: "医療的ケア",
    106: "介護過程", 107: "介護過程", 108: "介護過程", 109: "介護過程", 110: "介護過程",
    111: "介護過程", 112: "介護過程", 113: "介護過程",
    114: "総合問題", 115: "総合問題", 116: "総合問題", 117: "総合問題", 118: "総合問題",
    119: "総合問題", 120: "総合問題", 121: "総合問題", 122: "総合問題", 123: "総合問題",
    124: "総合問題", 125: "総合問題"
  },
  "36": {
    1: "人間の尊厳と自立", 2: "人間の尊厳と自立",
    3: "人間関係とコミュニケーション", 4: "人間関係とコミュニケーション", 5: "人間関係とコミュニケーション", 6: "人間関係とコミュニケーション",
    7: "人間関係とコミュニケーション", 8: "人間関係とコミュニケーション", 9: "人間関係とコミュニケーション", 10: "人間関係とコミュニケーション",
    11: "人間関係とコミュニケーション", 12: "人間関係とコミュニケーション",
    13: "社会の理解", 14: "社会の理解", 15: "社会の理解", 16: "社会の理解", 17: "社会の理解",
    18: "社会の理解", 19: "社会の理解", 20: "社会の理解", 21: "社会の理解", 22: "社会の理解",
    23: "社会の理解", 24: "社会の理解", 25: "社会の理解",
    26: "介護の基本", 27: "介護の基本", 28: "介護の基本", 29: "介護の基本", 30: "介護の基本",
    31: "介護の基本", 32: "介護の基本", 33: "介護の基本", 34: "介護の基本", 35: "介護の基本",
    36: "介護の基本", 37: "介護の基本", 38: "介護の基本", 39: "介護の基本", 40: "介護の基本",
    41: "介護の基本", 42: "介護の基本", 43: "介護の基本", 44: "介護の基本", 45: "介護の基本",
    46: "コミュニケーション技術", 47: "コミュニケーション技術", 48: "コミュニケーション技術", 49: "コミュニケーション技術", 50: "コミュニケーション技術",
    51: "コミュニケーション技術", 52: "コミュニケーション技術", 53: "コミュニケーション技術", 54: "コミュニケーション技術", 55: "コミュニケーション技術",
    56: "コミュニケーション技術", 57: "コミュニケーション技術", 58: "コミュニケーション技術", 59: "コミュニケーション技術", 60: "コミュニケーション技術",
    61: "生活支援技術", 62: "生活支援技術", 63: "生活支援技術", 64: "生活支援技術", 65: "生活支援技術",
    66: "生活支援技術", 67: "生活支援技術", 68: "生活支援技術", 69: "生活支援技術", 70: "生活支援技術",
    71: "生活支援技術", 72: "生活支援技術", 73: "生活支援技術", 74: "生活支援技術", 75: "生活支援技術",
    76: "生活支援技術", 77: "生活支援技術", 78: "生活支援技術", 79: "生活支援技術", 80: "生活支援技術",
    81: "生活支援技術", 82: "生活支援技術", 83: "生活支援技術", 84: "生活支援技術", 85: "生活支援技術",
    86: "生活支援技術", 87: "生活支援技術", 88: "生活支援技術", 89: "生活支援技術", 90: "生活支援技術",
    91: "介護過程", 92: "介護過程", 93: "介護過程", 94: "介護過程", 95: "介護過程",
    96: "介護過程", 97: "介護過程", 98: "介護過程", 99: "介護過程", 100: "介護過程",
    101: "介護過程", 102: "介護過程", 103: "介護過程", 104: "介護過程", 105: "介護過程",
    106: "こころとからだのしくみ", 107: "こころとからだのしくみ", 108: "こころとからだのしくみ", 109: "こころとからだのしくみ", 110: "こころとからだのしくみ",
    111: "こころとからだのしくみ", 112: "こころとからだのしくみ", 113: "こころとからだのしくみ", 114: "こころとからだのしくみ", 115: "こころとからだのしくみ",
    116: "こころとからだのしくみ", 117: "こころとからだのしくみ", 118: "こころとからだのしくみ", 119: "こころとからだのしくみ", 120: "こころとからだのしくみ",
    121: "医療的ケア", 122: "医療的ケア", 123: "医療的ケア", 124: "医療的ケア", 125: "医療的ケア"
  },
  "37": {
    1: "人間の尊厳と自立", 2: "人間の尊厳と自立",
    3: "人間関係とコミュニケーション", 4: "人間関係とコミュニケーション", 5: "人間関係とコミュニケーション", 6: "人間関係とコミュニケーション",
    7: "人間関係とコミュニケーション", 8: "人間関係とコミュニケーション", 9: "人間関係とコミュニケーション", 10: "人間関係とコミュニケーション",
    11: "人間関係とコミュニケーション", 12: "人間関係とコミュニケーション",
    13: "社会の理解", 14: "社会の理解", 15: "社会の理解", 16: "社会の理解", 17: "社会の理解",
    18: "社会の理解", 19: "社会の理解", 20: "社会の理解", 21: "社会の理解", 22: "社会の理解",
    23: "社会の理解", 24: "社会の理解", 25: "社会の理解",
    26: "介護の基本", 27: "介護の基本", 28: "介護の基本", 29: "介護の基本", 30: "介護の基本",
    31: "介護の基本", 32: "介護の基本", 33: "介護の基本", 34: "介護の基本", 35: "介護の基本",
    36: "介護の基本", 37: "介護の基本", 38: "介護の基本", 39: "介護の基本", 40: "介護の基本",
    41: "介護の基本", 42: "介護の基本", 43: "介護の基本", 44: "介護の基本", 45: "介護の基本",
    46: "コミュニケーション技術", 47: "コミュニケーション技術", 48: "コミュニケーション技術", 49: "コミュニケーション技術", 50: "コミュニケーション技術",
    51: "コミュニケーション技術", 52: "コミュニケーション技術", 53: "コミュニケーション技術", 54: "コミュニケーション技術", 55: "コミュニケーション技術",
    56: "コミュニケーション技術", 57: "コミュニケーション技術", 58: "コミュニケーション技術", 59: "コミュニケーション技術", 60: "コミュニケーション技術",
    61: "生活支援技術", 62: "生活支援技術", 63: "生活支援技術", 64: "生活支援技術", 65: "生活支援技術",
    66: "生活支援技術", 67: "生活支援技術", 68: "生活支援技術", 69: "生活支援技術", 70: "生活支援技術",
    71: "生活支援技術", 72: "生活支援技術", 73: "生活支援技術", 74: "生活支援技術", 75: "生活支援技術",
    76: "生活支援技術", 77: "生活支援技術", 78: "生活支援技術", 79: "生活支援技術", 80: "生活支援技術",
    81: "生活支援技術", 82: "生活支援技術", 83: "生活支援技術", 84: "生活支援技術", 85: "生活支援技術",
    86: "生活支援技術", 87: "生活支援技術", 88: "生活支援技術", 89: "生活支援技術", 90: "生活支援技術",
    91: "介護過程", 92: "介護過程", 93: "介護過程", 94: "介護過程", 95: "介護過程",
    96: "介護過程", 97: "介護過程", 98: "介護過程", 99: "介護過程", 100: "介護過程",
    101: "介護過程", 102: "介護過程", 103: "介護過程", 104: "介護過程", 105: "介護過程",
    106: "こころとからだのしくみ", 107: "こころとからだのしくみ", 108: "こころとからだのしくみ", 109: "こころとからだのしくみ", 110: "こころとからだのしくみ",
    111: "こころとからだのしくみ", 112: "こころとからだのしくみ", 113: "こころとからだのしくみ", 114: "こころとからだのしくみ", 115: "こころとからだのしくみ",
    116: "こころとからだのしくみ", 117: "こころとからだのしくみ", 118: "こころとからだのしくみ", 119: "こころとからだのしくみ", 120: "こころとからだのしくみ",
    121: "医療的ケア", 122: "医療的ケア", 123: "医療的ケア", 124: "医療的ケア", 125: "医療的ケア"
  },
  "38pm": {
    1: "こころとからだのしくみ", 2: "こころとからだのしくみ", 3: "こころとからだのしくみ", 4: "こころとからだのしくみ", 5: "こころとからだのしくみ",
    6: "こころとからだのしくみ", 7: "こころとからだのしくみ", 8: "こころとからだのしくみ", 9: "こころとからだのしくみ", 10: "こころとからだのしくみ",
    11: "こころとからだのしくみ", 12: "こころとからだのしくみ",
    13: "発達と老化の理解", 14: "発達と老化の理解", 15: "発達と老化の理解", 16: "発達と老化の理解", 17: "発達と老化の理解",
    18: "発達と老化の理解", 19: "発達と老化の理解", 20: "発達と老化の理解",
    21: "認知症の理解", 22: "認知症の理解", 23: "認知症の理解", 24: "認知症の理解", 25: "認知症の理解",
    26: "認知症の理解", 27: "認知症の理解", 28: "認知症の理解", 29: "認知症の理解", 30: "認知症の理解",
    31: "障害の理解", 32: "障害の理解", 33: "障害の理解", 34: "障害の理解", 35: "障害の理解",
    36: "障害の理解", 37: "障害の理解", 38: "障害の理解", 39: "障害の理解", 40: "障害の理解",
    41: "医療的ケア", 42: "医療的ケア", 43: "医療的ケア", 44: "医療的ケア", 45: "医療的ケア",
    46: "介護過程", 47: "介護過程", 48: "介護過程", 49: "介護過程", 50: "介護過程",
    51: "介護過程", 52: "介護過程", 53: "介護過程",
    54: "総合問題", 55: "総合問題", 56: "総合問題", 57: "総合問題", 58: "総合問題",
    59: "総合問題", 60: "総合問題", 61: "総合問題", 62: "総合問題", 63: "総合問題",
    64: "総合問題", 65: "総合問題"
  }
};

function getCategory(examId, questionNumber) {
  const exam = categoryMap[examId];
  if (!exam) return "その他";
  return exam[questionNumber] || "その他";
}

function initializeExamButtons() {
  examButtonsContainer.innerHTML = "";

  // Add Random Quiz button first
  const randomButton = document.createElement("button");
  randomButton.className = "primary-button";
  randomButton.innerHTML = `${examLabels["random"] || "Random"} を<ruby>始<rt>はじ</rt></ruby>める`;
  randomButton.dataset.examId = "random";
  randomButton.addEventListener("click", () => selectExam("random"));
  examButtonsContainer.appendChild(randomButton);

  // Add separator or spacing
  const separator = document.createElement("div");
  separator.style.margin = "10px 0";
  separator.style.borderTop = "1px solid #ccc";
  examButtonsContainer.appendChild(separator);

  // Add regular exam buttons
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

function getRandomQuestions(count = 10) {
  // Collect all questions from all available exams
  const allQuestions = [];
  
  // Go through all exams and add their questions with exam ID metadata
  Object.keys(examSets).forEach((examId) => {
    const examQuestions = examSets[examId] || [];
    examQuestions.forEach((q, index) => {
      allQuestions.push({
        ...q,
        _examId: examId,
        _examLabel: examLabels[examId] || examId,
        _questionNumber: index + 1
      });
    });
  });
  
  // Fisher-Yates shuffle algorithm
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the first 'count' questions
  return shuffled.slice(0, count);
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
  selectedDomain = "all";
  
  // Handle random quiz differently - no domain selection needed
  if (examId === "random") {
    questions = getRandomQuestions(10);
    totalQuestions = questions.length;
    userAnswers = new Array(totalQuestions).fill(null);
    currentIndex = 0;
    score = 0;
    attemptCount = 0;
    isReviewingFromResults = false;
    
    // Start random quiz directly
    startTimer();
    quizTitle.innerHTML = `🎲 <ruby>ランダム<rt>らんだむ</rt></ruby><ruby>クイズ<rt>くいず</rt></ruby> (${totalQuestions}<ruby>問<rt>もん</rt></ruby>)`;
    
    examSelection.classList.add("hidden");
    document.getElementById("domain-selection").classList.add("hidden");
    document.getElementById("quiz-card").classList.remove("hidden");
    resultScreen.classList.add("hidden");
    menuNav.classList.remove("hidden");
    
    saveState();
    updateHistory(true);
    showQuestion();
  } else {
    // Regular exam - show domain selection
    questions = examSets[examId] || [];
    totalQuestions = questions.length;
    userAnswers = new Array(totalQuestions).fill(null);
    currentIndex = 0;
    score = 0;
    attemptCount = 0;
    isReviewingFromResults = false;

    // Show domain selection instead of starting quiz immediately
    showDomainSelection();
  }
}

function showDomainSelection() {
  domainButtonsContainer.innerHTML = "";
  
  // Add "All" option
  const allButton = document.createElement("button");
  allButton.className = "primary-button";
  allButton.innerHTML = "📋 すべての問題を<ruby>解<rt>と</rt></ruby>く";
  allButton.dataset.domain = "all";
  allButton.addEventListener("click", () => selectDomain("all"));
  domainButtonsContainer.appendChild(allButton);
  
  // Add domain-specific buttons in order (01-13)
  const domainOrder = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
  for (const domainKey of domainOrder) {
    const domain = DOMAINS[domainKey];
    if (!domain) continue;
    
    const button = document.createElement("button");
    button.className = "primary-button";
    button.style.borderLeft = `4px solid ${domain.color}`;
    
    const domainQuestions = domainMappings[selectedExamId][domainKey] || [];
    const count = domainQuestions.length;
    
    button.innerHTML = `${domain.icon} ${domain.name}<br><span style="font-size:0.9em">(${count}問)</span>`;
    button.dataset.domain = domainKey;
    button.addEventListener("click", () => selectDomain(domainKey));
    domainButtonsContainer.appendChild(button);
  }
  
  // Show domain selection, hide exam selection and quiz
  examSelection.classList.add("hidden");
  domainSelection.classList.remove("hidden");
  document.getElementById("quiz-card").classList.add("hidden");
  resultScreen.classList.add("hidden");
  menuNav.classList.add("hidden");
}

function selectDomain(domainKey) {
  selectedDomain = domainKey;
  
  // Get questions for this domain
  if (domainKey === "all") {
    questionIndicesByDomain = Array.from({length: questions.length}, (_, i) => i);
  } else {
    questionIndicesByDomain = (domainMappings[selectedExamId][domainKey] || []).map(q => q - 1); // Convert to 0-based index
  }
  
  totalQuestions = questionIndicesByDomain.length;
  userAnswers = new Array(questions.length).fill(null); // Keep full array for all questions
  currentIndex = 0;
  score = 0;
  attemptCount = 0;
  
  // Start the quiz
  startTimer();
  
  const questionLabel = examLabels[selectedExamId] || selectedExamId;
  const domainName = domainKey === "all" ? "すべての問題" : (DOMAINS[domainKey]?.name || domainKey);
  quizTitle.innerHTML = `${questionLabel} - ${domainName} (${totalQuestions}<ruby>問<rt>もん</rt></ruby>)`;
  
  domainSelection.classList.add("hidden");
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
  isReviewingFromResults = false;

  // Resume timer from paused elapsed time (don't add the pause duration)
  if (incompleteQuiz.pausedElapsedSeconds !== undefined && incompleteQuiz.pausedElapsedSeconds !== null) {
    stopTimer();
    startTime = new Date(Date.now() - incompleteQuiz.pausedElapsedSeconds * 1000);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    startTimer();
  }

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
    const pausedElapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const incompleteState = {
      selectedExamId,
      currentIndex,
      score,
      userAnswers,
      attemptCount,
      pausedElapsedSeconds: pausedElapsedSeconds,  // Save paused time instead of startTimestamp
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

  // Resume timer from saved elapsed seconds or timestamp
  if (state.elapsedSeconds) {
    stopTimer();
    startTime = new Date(Date.now() - state.elapsedSeconds * 1000);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  } else if (state.startTimestamp) {
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
  isReviewingFromResults = false;

  stopTimer();
  
  // Show/hide resume button and manage timer based on incomplete quiz status
  const incompleteQuiz = getIncompleteQuiz();
  
  // Always clear startTime when going to menu (pause the timer)
  if (startTime && incompleteQuiz) {
    // Calculate and display paused time
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    timerText.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  } else {
    timerText.textContent = "Time: 00:00";
  }

  quizTitle.innerHTML = "125<ruby>問<rt>もん</rt></ruby>クイズ";
  examSelection.classList.remove("hidden");
  document.getElementById("quiz-card").classList.add("hidden");
  resultScreen.classList.add("hidden");
  menuNav.classList.add("hidden");
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
  saveState();  // Save BEFORE clearing startTime
  
  startTime = null;  // Clear timer so it stops ticking in background
  updateHistory(true);
}

function showQuestion() {
  if (!questions || questions.length === 0 || currentIndex >= totalQuestions) {
    questionText.textContent = "Quiz data is not loaded.";
    choicesContainer.innerHTML = "";
    return;
  }

  // Get the actual question index in the full array (accounting for domain filtering)
  const actualQuestionIndex = questionIndicesByDomain.length > 0 ? questionIndicesByDomain[currentIndex] : currentIndex;
  const currentQuestion = questions[actualQuestionIndex];
  questionText.innerHTML = currentQuestion.question;
  
  // Display category tag
  const questionNumber = actualQuestionIndex + 1;
  const category = getCategory(selectedExamId, questionNumber);
  if (categoryTag) {
    categoryTag.textContent = `【${category}】`;
  }
  
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
  
  // Show/hide back-to-results button
  const backToResultsBtn = document.getElementById("back-to-results-button");
  if (isReviewingFromResults) {
    nextButton.classList.add("hidden");
    if (backToResultsBtn) backToResultsBtn.classList.remove("hidden");
  } else {
    nextButton.classList.remove("hidden");
    if (backToResultsBtn) backToResultsBtn.classList.add("hidden");
  }

  if (userAnswers[actualQuestionIndex] !== null) {
    acceptingAnswers = false;
    nextButton.disabled = false;
    
    // Highlight the selected answer
    const selectedChoice = userAnswers[actualQuestionIndex];
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
  // Recalculate score based on userAnswers for the current domain
  score = 0;
  for (let i = 0; i < totalQuestions; i++) {
    const actualIndex = questionIndicesByDomain.length > 0 ? questionIndicesByDomain[i] : i;
    if (questions[actualIndex] && userAnswers[actualIndex] === questions[actualIndex].answer && questions[actualIndex].answer !== null) {
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
  
  // Get the actual question index (accounting for domain filtering)
  const actualQuestionIndex = questionIndicesByDomain.length > 0 ? questionIndicesByDomain[currentIndex] : currentIndex;
  const correctChoice = questions[actualQuestionIndex].answer;
  const isPractice = correctChoice === null;

  userAnswers[actualQuestionIndex] = selectedChoice;
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
      
      correctAnswerText.innerHTML = questions[actualQuestionIndex].choices[correctChoice];
      correctAnswerArea.classList.remove("hidden");
    }
  }

  updateScore();
  saveState();
}

function generateSummary() {
  const summaryList = document.getElementById("summary-list");
  const summarySection = document.getElementById("summary-section");
  
  if (!summaryList || isQuestionOnlyMode()) {
    if (summarySection) summarySection.classList.add("hidden");
    return;
  }
  
  summaryList.innerHTML = "";
  
  for (let i = 0; i < totalQuestions; i++) {
    const item = document.createElement("button");
    item.className = "summary-item";
    item.type = "button";
    item.textContent = i + 1;
    
    // Get the actual question index in the full array (accounting for domain filtering)
    const actualIndex = questionIndicesByDomain.length > 0 ? questionIndicesByDomain[i] : i;
    const userAnswer = userAnswers[actualIndex];
    const correctAnswer = questions[actualIndex].answer;
    
    if (userAnswer === null) {
      item.classList.add("unanswered");
    } else if (userAnswer === correctAnswer) {
      item.classList.add("correct");
    } else {
      item.classList.add("wrong");
    }
    
    // Add category as tooltip
    const questionNumber = actualIndex + 1;
    const category = getCategory(selectedExamId, questionNumber);
    item.title = `Q${questionNumber}: ${category}`;
    
    item.addEventListener("click", () => {
      currentIndex = i;
      isReviewingFromResults = true;
      document.getElementById("quiz-card").classList.remove("hidden");
      resultScreen.classList.add("hidden");
      menuNav.classList.remove("hidden");
      showQuestion();
    });
    
    summaryList.appendChild(item);
  }
  
  if (summarySection) summarySection.classList.remove("hidden");
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
  startTime = null;  // Clear the timer after quiz completion
  const elapsed = timerText.textContent.replace("Time: ", "");
  finalTime.textContent = `経過時間: ${elapsed}`;

  updateScore();
  clearIncompleteQuiz();  // Clear incomplete quiz when finished
  generateSummary();  // Generate the summary list
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
backFromDomainButton.addEventListener("click", showSelection);

const backToResultsButton = document.getElementById("back-to-results-button");
if (backToResultsButton) {
  backToResultsButton.addEventListener("click", () => {
    isReviewingFromResults = false;
    document.getElementById("quiz-card").classList.add("hidden");
    resultScreen.classList.remove("hidden");
    menuNav.classList.remove("hidden");
  });
}

initializeExamButtons();
domainMappings = buildDomainMappings(); // Initialize domain mappings after categoryMap is loaded

const initialState = history.state || loadState();
if (initialState) {
  restoreState(initialState);
} else {
  showSelection();
}
