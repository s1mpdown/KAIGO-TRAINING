/* 介護福祉士試験の13官科目分類 */

const DOMAINS = {
  "all": {
    name: "すべての問題",
    color: "#333333",
    icon: "📋",
    part: ""
  },
  "01": {
    name: "人間の尊厳と自立",
    color: "#FF6B6B",
    icon: "🧑",
    part: "A",
    keywords: ["尊厳", "自立", "人間"]
  },
  "02": {
    name: "介護の基本",
    color: "#FF8C94",
    icon: "🏥",
    part: "A",
    keywords: ["介護", "基本", "職倫理", "倫理", "専門", "安全", "感染"]
  },
  "03": {
    name: "社会の理解",
    color: "#FFB7B2",
    icon: "🌍",
    part: "A",
    keywords: ["社会", "理解", "福祉", "制度"]
  },
  "04": {
    name: "人間関係とコミュニケーション",
    color: "#FFDAB9",
    icon: "👥",
    part: "A",
    keywords: ["人間関係", "コミュニケーション", "対話", "関係"]
  },
  "05": {
    name: "コミュニケーション技術",
    color: "#FFE4B5",
    icon: "💬",
    part: "A",
    keywords: ["コミュニケーション", "傾聴", "報告", "相談", "記録"]
  },
  "06": {
    name: "生活支援技術",
    color: "#96CEB4",
    icon: "🛠️",
    part: "A",
    keywords: ["移動", "移乗", "歩行", "栄養", "食事", "排泄", "清潔", "入浴", "衣服"]
  },
  "07": {
    name: "こころとからだのしくみ",
    color: "#88D8B0",
    icon: "🧠",
    part: "B",
    keywords: ["神経", "筋肉", "骨", "器官", "解剖", "脳", "心臓"]
  },
  "08": {
    name: "発達と老化の理解",
    color: "#80CED7",
    icon: "🔄",
    part: "B",
    keywords: ["発達", "老化", "成長", "加齢"]
  },
  "09": {
    name: "認知症の理解",
    color: "#7FD8D5",
    icon: "💭",
    part: "B",
    keywords: ["認知症", "痴呆", "記憶", "行動"]
  },
  "10": {
    name: "障害の理解",
    color: "#7FD4D4",
    icon: "♿",
    part: "B",
    keywords: ["障害", "身体", "知的", "精神"]
  },
  "11": {
    name: "医療的ケア",
    color: "#6BB6D6",
    icon: "💊",
    part: "C",
    keywords: ["医療", "ケア", "吸引", "経管"]
  },
  "12": {
    name: "介護過程",
    color: "#5E9EC0",
    icon: "📊",
    part: "C",
    keywords: ["介護過程", "実施", "評価", "計画"]
  },
  "13": {
    name: "総合問題",
    color: "#4A7BA7",
    icon: "🎯",
    part: "C",
    keywords: ["総合", "事例", "問題解決"]
  }
};

/* ドメイン別問題マッピング - categoryMapから官科目に変換 */

// カテゴリから13官科目へのマッピング
const categoryToDomainMap = {
  "人間の尊厳と自立": "01",
  "介護の基本": "02",
  "社会の理解": "03",
  "人間関係とコミュニケーション": "04",
  "コミュニケーション技術": "05",
  "生活支援技術": "06",
  "こころとからだのしくみ": "07",
  "発達と老化の理解": "08",
  "認知症の理解": "09",
  "障害の理解": "10",
  "医療的ケア": "11",
  "介護過程": "12",
  "総合問題": "13"
};

// 試験ごとのドメイン別問題番号マッピング
function buildDomainMappings() {
  const domainMappings = {};
  
  // categoryMapが定義されていない場合は空のマッピングを返す
  if (typeof categoryMap === 'undefined') {
    return domainMappings;
  }
  
  // 各試験のドメイン別問題番号を作成
  for (const [examNum, questions] of Object.entries(examSets)) {
    domainMappings[examNum] = {
      "all": [],
      "01": [], "02": [], "03": [], "04": [], "05": [], "06": [],
      "07": [], "08": [], "09": [], "10": [], "11": [], "12": [], "13": []
    };
    
    // 各試験のcategoryMapを取得
    const examCategoryMap = categoryMap[examNum] || {};
    
    // 各問題をドメインに分類
    questions.forEach((question, index) => {
      const questionNum = index + 1;
      
      // categoryMapから旧カテゴリを取得
      const oldCategory = examCategoryMap[questionNum] || "その他";
      
      // 旧カテゴリから新しい官科目に変換
      const domainCode = categoryToDomainMap[oldCategory] || null;
      
      domainMappings[examNum]["all"].push(questionNum);
      
      if (domainCode) {
        domainMappings[examNum][domainCode].push(questionNum);
      }
    });
  }
  
  return domainMappings;
}

let domainMappings = {}; // グローバル変数として宣言（script.jsで初期化される）
