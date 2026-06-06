import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const NUM_QUESTIONS = 10;
const TIME_LIMIT = 15;
const MAX_SCORE = 1000;

const LANG_CONFIG = {
  English: { flag: "🇬🇧", color: "#3b82f6", label: "English", short: "EN" },
  Malay:   { flag: "🇲🇾", color: "#10b981", label: "Bahasa Melayu", short: "BM" },
  Chinese: { flag: "🇨🇳", color: "#ef4444", label: "中文", short: "中文" },
};

const ANS_COLORS = [
  { bg: "#7c3aed", light: "#9f67ff", dark: "#5b21b6", label: "A" },
  { bg: "#0891b2", light: "#22d3ee", dark: "#0e7490", label: "B" },
  { bg: "#d97706", light: "#fbbf24", dark: "#b45309", label: "C" },
  { bg: "#be185d", light: "#f472b6", dark: "#9d174d", label: "D" },
];

// ─── TOPIC POOL — 60+ language-specific skill topics ─────────────────────────
const TOPIC_POOL = {
  English: [
    // Vocabulary – Words & Meanings
    "synonyms for common adjectives (e.g. happy→joyful, big→enormous)",
    "antonyms / opposites of everyday words (hot/cold, fast/slow)",
    "vocabulary: animals and their young (cub, foal, lamb, kitten)",
    "vocabulary: occupations and what people do at work",
    "vocabulary: weather words and nature descriptions",
    "vocabulary: human body parts and the five senses",
    "vocabulary: tropical fruits and vegetables",
    "vocabulary: classroom objects and stationery",
    "vocabulary: emotions and feelings (furious, anxious, thrilled)",
    "vocabulary: action verbs (sprint, whisper, devour, construct)",
    "vocabulary: size and measurement words (tiny, vast, narrow)",
    "vocabulary: time words (frequently, immediately, eventually)",
    "vocabulary: food and cooking words (boil, fry, chop, simmer)",
    "vocabulary: transport and travel words",
    "vocabulary: colours and shades (crimson, turquoise, beige)",
    "compound words (sunflower, toothbrush, birthday, firefly)",
    "homophones: there/their/they're, to/two/too, here/hear",
    "homophones: its/it's, your/you're, bare/bear, blew/blue",
    "collective nouns (a flock of birds, a pride of lions, a school of fish)",
    "words with multiple meanings (bank, bark, bat, ring)",
    "word categories: which word does NOT belong?",
    "dictionary skills: word definitions and meanings",
    "similes: as brave as a _____, as cold as _____",
    // Grammar
    "singular and plural nouns – regular (cat→cats) and irregular (child→children)",
    "correct use of articles: a, an, the in sentences",
    "simple present vs simple past tense verbs",
    "future tense: will / going to",
    "subject-verb agreement (he runs / they run)",
    "correct use of pronouns: I/me, he/him, she/her, they/them",
    "possessive pronouns: mine, yours, his, hers, theirs",
    "comparatives: bigger than, faster than, more beautiful than",
    "superlatives: the biggest, the fastest, the most beautiful",
    "prepositions of place: in, on, under, beside, between, behind",
    "prepositions of time: at, on, in (at 3pm, on Monday, in June)",
    "conjunctions: and, but, because, so, although, however",
    "question words in context: who, what, where, when, why, how",
    "apostrophes for possession (dog's bone) and contractions (don't)",
    "countable vs uncountable nouns (some water / three apples)",
    "modal verbs: can, could, must, should, might",
    "active vs passive voice (The cat ate the fish / The fish was eaten)",
    // Sentence & Literacy
    "identifying the odd word out in a topic group",
    "completing a sentence with the correct missing word",
    "choosing the grammatically correct sentence",
    "rhyming words and word families",
    "suffixes: -tion, -ing, -ness, -ful, -less and their meanings",
    "prefixes: un-, re-, pre-, dis-, mis- and their meanings",
    "punctuation: commas, full stops, question marks, exclamation marks",
    "sentence types: statement, question, command, exclamation",
    "alphabetical order and dictionary skills",
    "formal vs informal language",
  ],
  Malay: [
    // Kosa Kata
    "kata nama am dan kata nama khas (sekolah vs Sekolah Kebangsaan Taman Maju)",
    "kata adjektif perasaan: gembira, sedih, marah, takut, terkejut",
    "kata berlawanan / antonim: panas-sejuk, besar-kecil, tinggi-rendah",
    "kosa kata: haiwan dan tempat tinggal mereka (rimba, laut, padang)",
    "kosa kata: makanan tradisional Malaysia (nasi lemak, roti canai, laksa)",
    "kosa kata: anggota keluarga dan panggilan hormat (pak cik, mak cik, datuk)",
    "kosa kata: peralatan sekolah dan buku pelajaran",
    "kosa kata: nombor ordinal (pertama, kedua, ketiga, keempat)",
    "kosa kata: warna dan bentuk geometri",
    "kosa kata: pakaian tradisional Malaysia (baju kurung, baju melayu, cheongsam)",
    "kosa kata: pekerjaan dan tugas (doktor, guru, polis, petani)",
    "kosa kata: tempat awam (hospital, perpustakaan, balai polis, stesen)",
    "kosa kata: buah-buahan tempatan (rambutan, durian, manggis, langsat)",
    "kosa kata: hari dan bulan dalam bahasa Melayu",
    "kosa kata: kata sifat benda (lembut, keras, licin, kasar)",
    "peribahasa mudah (bersatu teguh, bercerai roboh / seperti aur dengan tebing)",
    "kata ganda penuh (sayur-mayur, buah-buahan, pokok-pokok, kanak-kanak)",
    "kata ganda separa (lelaki, perempuan, tetamu, sesama)",
    "sinonim dalam Bahasa Melayu (cantik=molek, besar=agung)",
    "kata kerja aktif dan pasif (dia makan vs makanan itu dimakan)",
    // Tatabahasa
    "kata kerja tindakan: berlari, melompat, menulis, membaca, memasak",
    "penggunaan kata sendi nama: di, ke, dari, pada, oleh, untuk",
    "ayat penyata, ayat tanya, ayat perintah dan ayat seruan",
    "imbuhan awalan: me-, ber-, ter-, ke-, se-, pe-",
    "imbuhan akhiran: -kan, -an, -i dan kesannya pada makna",
    "imbuhan apitan: me-...-kan, ber-...-an, pe-...-an",
    "penggunaan kata ganti nama diri: saya/aku, kamu/awak, dia, mereka, kita, kami",
    "kata bilangan: beberapa, banyak, sedikit, semua, sebahagian",
    "kata hubung: dan, tetapi, kerana, supaya, walaupun, apabila",
    "kata tanya: siapa, apa, di mana, bila, mengapa, bagaimana, berapa",
    "tanda baca: noktah, koma, tanda soal, tanda seru",
    "membina ayat tunggal dan ayat majmuk yang betul",
    "kata penguat: sangat, amat, terlalu, paling, agak",
    "kata arah dan tempat: atas, bawah, dalam, luar, depan, belakang, tepi",
  ],
  Chinese: [
    // 词汇 Vocabulary
    "常见动物词汇及特征 (animal vocabulary: 老虎、大象、长颈鹿)",
    "家庭成员称呼 (family titles: 爷爷、奶奶、舅舅、姑姑)",
    "身体部位词汇 (body parts: 膝盖、手肘、眉毛、下巴)",
    "颜色词汇和深浅 (colors: 深红色、浅蓝色、金色、银色)",
    "数字和基本量词 (measure words: 一只猫、两本书、三杯水、四棵树)",
    "学校用品和文具词汇 (stationery: 铅笔盒、橡皮擦、直尺、剪刀)",
    "食物和饮料词汇 (food: 饺子、汤圆、炒饭、豆腐、粥)",
    "天气和四季词汇 (weather/seasons: 刮风、下雪、打雷、闪电)",
    "交通工具词汇 (transport: 地铁、飞机、轮船、摩托车)",
    "职业词汇 (occupations: 消防员、厨师、工程师、画家)",
    "反义词 (antonyms: 冷/热、快/慢、高/矮、胖/瘦、开心/难过)",
    "常用形容词 (adjectives: 聪明、勇敢、温柔、懒惰、好奇)",
    "水果和蔬菜词汇 (fruits/vegetables: 菠萝、芒果、菠菜、胡萝卜)",
    "地点和场所词汇 (places: 超市、图书馆、公园、医院、邮局)",
    "情感词汇 (emotions: 兴奋、担心、骄傲、羡慕、害羞)",
    "自然环境词汇 (nature: 森林、沙漠、海洋、山脉、河流)",
    "节日和传统词汇 (festivals: 春节、中秋节、元宵节、清明节)",
    "日常动作词汇 (daily actions: 刷牙、洗脸、梳头、整理书包)",
    // 语法 Grammar
    "量词的正确使用 (measure words: 一条鱼 vs 一匹马 vs 一头牛)",
    "时间词：昨天、今天、明天、上午、下午、晚上",
    "方位词的使用：上面、下面、里面、外面、前面、后面、旁边",
    "疑问词造句：谁、什么、哪里、为什么、怎么、多少、哪个",
    "常用动词搭配：吃饭、喝水、做作业、看书、玩游戏",
    "形容词比较：比 (A比B更高 / A没有B高)",
    "用'和'、'也'、'都'、'还是'造句",
    "把字句：把书放在桌子上 (把 sentence structure)",
    "被字句基础：书被小明拿走了 (passive with 被)",
    "用'因为…所以…'、'虽然…但是…'造句 (conjunctions)",
    "选择疑问句：你喜欢吃苹果还是香蕉？",
    "用'一边…一边…'造句 (simultaneous actions)",
    "否定句：不、没有、别 的用法 (negation)",
    "程度副词：很、非常、太、比较、有点 (degree adverbs)",
  ],
};

function pickTopics(n) {
  const distributions = [
    { English: 4, Malay: 3, Chinese: 3 },
    { English: 3, Malay: 4, Chinese: 3 },
    { English: 3, Malay: 3, Chinese: 4 },
    { English: 4, Malay: 4, Chinese: 2 },
    { English: 2, Malay: 4, Chinese: 4 },
    { English: 4, Malay: 2, Chinese: 4 },
  ];
  const counts = distributions[Math.floor(Math.random() * distributions.length)];
  const selected = [];
  for (const [lang, count] of Object.entries(counts)) {
    const pool = TOPIC_POOL[lang].slice().sort(() => Math.random() - 0.5);
    pool.slice(0, count).forEach(topic => selected.push({ lang, topic }));
  }
  return selected.sort(() => Math.random() - 0.5);
}

function newSeed() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────
function calcScore(correct, timeTaken) {
  if (!correct) return 0;
  const speed = Math.max(0, 1 - timeTaken / TIME_LIMIT);
  return Math.round(MAX_SCORE * (0.7 + 0.3 * speed));
}

// ─── AI QUESTION GENERATION ──────────────────────────────────────────────────
async function generateQuestions(seed) {
  const assignments = pickTopics(NUM_QUESTIONS);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      system: `You create language quiz questions for children aged 8–10 years old.
Return ONLY a valid JSON array of exactly ${NUM_QUESTIONS} objects. No markdown, no extra text.
Each object must have: { "question": string, "answers": [4 strings], "correct": 0-3, "emoji": string, "lang": string, "skill": string }

ASSIGNMENTS — each question must test EXACTLY the assigned language and skill:
${assignments.map((a, i) => `Q${i + 1}: Language=${a.lang}, Skill="${a.topic}"`).join("\n")}

RULES:
- The "lang" field must be one of: "English", "Malay", "Chinese"
- The "skill" field should be a SHORT label like "Vocabulary", "Grammar", "Spelling", "Antonym", etc.
- Write the question and all 4 answers in the TARGET LANGUAGE (e.g. Malay question in Malay, Chinese question in Chinese)
- Questions must be appropriate for 8–10 year old children — not too hard, not too easy
- All 4 answer choices must be plausible (no obviously silly wrong answers)
- Vary question formats: fill-in-the-blank, "which word means...", "choose the correct sentence", "what is the opposite of...", etc.
- For Chinese: use Simplified Chinese characters, include pinyin in parentheses if helpful
- For Malay: use standard Bahasa Malaysia
- UNIQUENESS SEED: ${seed} — ensure completely fresh, non-repeating questions every call
- NEVER ask the same question twice. Use creative, specific, targeted examples.`,
      messages: [{ role: "user", content: `Seed: ${seed}. Generate all ${NUM_QUESTIONS} language questions now. JSON array only.` }],
    }),
  });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(`API error: ${data.error.message}`);
  const text = data.content?.find(b => b.type === "text")?.text || "";
  if (!text) throw new Error("Empty response from API");
  let qs;
  try {
    qs = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    throw new Error(`JSON parse failed: ${text.slice(0, 100)}`);
  }
  if (!Array.isArray(qs) || qs.length === 0) throw new Error("No questions in response");
  return qs.map((q, i) => ({ ...q, id: i + 1 }));
}

// ─── RANK HELPER ─────────────────────────────────────────────────────────────
function getRank(pct) {
  if (pct === 100) return { label: "WORD MASTER!", emoji: "👑", color: "#FFD700" };
  if (pct >= 80)   return { label: "LANGUAGE STAR!", emoji: "⭐", color: "#7c3aed" };
  if (pct >= 60)   return { label: "GREAT EFFORT!", emoji: "🎉", color: "#0891b2" };
  if (pct >= 40)   return { label: "KEEP READING!", emoji: "📖", color: "#d97706" };
  return            { label: "PRACTICE MORE!", emoji: "💪", color: "#be185d" };
}

// ─── STARS ───────────────────────────────────────────────────────────────────
function Stars({ count, total }) {
  const filled = Math.round((count / total) * 5);
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", margin: "8px 0" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: 22, filter: i < filled ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>
      ))}
    </div>
  );
}

// ─── LANG BADGE ──────────────────────────────────────────────────────────────
function LangBadge({ lang, skill }) {
  const cfg = LANG_CONFIG[lang] || LANG_CONFIG.English;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: cfg.color + "22", border: `1px solid ${cfg.color}55`,
        borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: cfg.color,
      }}>
        <span>{cfg.flag}</span>
        <span>{cfg.short}</span>
      </div>
      {skill && (
        <div style={{
          display: "inline-flex", alignItems: "center",
          background: "#ffffff11", border: "1px solid #ffffff22",
          borderRadius: 8, padding: "3px 10px", fontSize: 11, color: "#aaa",
        }}>
          {skill}
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS DOTS ───────────────────────────────────────────────────────────
function ProgressDots({ total, current, results }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const correct = results[i]?.correct;
        return (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: done ? (correct ? "#7c3aed" : "#be185d") : i === current ? "#d97706" : "#2a2a3a",
            border: i === current ? "2px solid #d97706" : "2px solid transparent",
            transition: "all 0.3s",
            boxShadow: i === current ? "0 0 8px #d9770688" : done && correct ? "0 0 6px #7c3aed88" : "none",
          }} />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function HomeScreen({ onStart, loading, error }) {
  return (
    <div style={S.screen}>
      <div style={S.bgPattern} />
      <div style={S.card}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={S.logoIconWrap}>
            <span style={{ fontSize: 40 }}>📝</span>
          </div>
          <h1 style={S.logoTitle}>
            WORD<span style={{ color: "#7c3aed" }}>WIZ</span>
          </h1>
          <p style={{ color: "#555", fontSize: 13, letterSpacing: 1, marginTop: 4 }}>
            Language Challenge · Ages 8–10
          </p>
        </div>

        {/* Language pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {Object.values(LANG_CONFIG).map(cfg => (
            <div key={cfg.label} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: cfg.color + "18", border: `1px solid ${cfg.color}44`,
              borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: 700, color: cfg.color,
            }}>
              <span>{cfg.flag}</span>
              <span>{cfg.short}</span>
            </div>
          ))}
        </div>

        <div style={S.divider} />

        {/* Feature tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {[
            { icon: "🔤", title: "Grammar", sub: "Sentences & rules" },
            { icon: "📚", title: "Vocabulary", sub: "Words & meanings" },
            { icon: "🔁", title: "Antonyms", sub: "Opposites & pairs" },
            { icon: "✍️", title: "Usage", sub: "Fill in the blank" },
          ].map((t, i) => (
            <div key={i} style={S.featureTile}>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{t.title}</div>
                <div style={{ color: "#555", fontSize: 11 }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, fontSize: 13, color: "#555" }}>
          <span>❓ 10 Questions</span>
          <span>⏱ 15s Each</span>
          <span>🎯 Speed Bonus</span>
        </div>

        {error && (
          <div style={{ background: "#be185d22", border: "1px solid #be185d55", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
            <p style={{ color: "#be185d", textAlign: "center", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Failed to generate questions</p>
            <p style={{ color: "#be185d99", textAlign: "center", fontSize: 11, wordBreak: "break-all" }}>{error}</p>
          </div>
        )}

        <button style={{ ...S.startBtn, opacity: loading ? 0.6 : 1 }} onClick={onStart} disabled={loading}>
          {loading
            ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: 8 }}>✦</span>Creating questions...</>
            : "🚀 Start Quiz"}
        </button>
        {loading && <p style={{ textAlign: "center", color: "#555", fontSize: 12, marginTop: 10 }}>✨ AI generating fresh language questions...</p>}
        <p style={{ textAlign: "center", color: "#2a2a3a", fontSize: 11, marginTop: 14 }}>Every quiz is unique — questions never repeat!</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function QuestionScreen({ question, qIndex, total, results, onAnswer }) {
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    setPicked(null);
    setRevealed(false);
    setTimeLeft(TIME_LIMIT);
    startRef.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); doReveal(null, TIME_LIMIT); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question?.id]);

  const doReveal = (idx, time) => {
    clearInterval(timerRef.current);
    setPicked(idx);
    setRevealed(true);
    const correct = idx === question.correct;
    const gained = calcScore(correct, time);
    setTimeout(() => onAnswer({ idx, timeTaken: time, correct, gained }), 2000);
  };

  const handlePick = idx => {
    if (picked !== null || revealed) return;
    const timeTaken = Math.min((Date.now() - startRef.current) / 1000, TIME_LIMIT);
    doReveal(idx, timeTaken);
  };

  if (!question) return null;

  const progress = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timeLeft > 8 ? "#7c3aed" : timeLeft > 4 ? "#d97706" : "#be185d";
  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : null;
  const gained = picked !== null ? calcScore(picked === question.correct, Math.min((Date.now() - startRef.current) / 1000, TIME_LIMIT)) : 0;
  const runningScore = results.reduce((s, r) => s + (r.gained || 0), 0);
  const cfg = LANG_CONFIG[question.lang] || LANG_CONFIG.English;

  return (
    <div style={S.screen}>
      <div style={S.bgPattern} />
      <div style={S.gameWrap}>

        {/* Top bar */}
        <div style={S.topBar}>
          <div style={S.topStat}>
            <span style={S.statLabel}>Q</span>
            <span style={S.statVal}>{qIndex + 1}<span style={{ color: "#333", fontSize: 12 }}>/{total}</span></span>
          </div>

          {/* Timer ring */}
          <svg width="58" height="58" viewBox="0 0 58 58">
            <circle cx="29" cy="29" r="23" fill="#0d0d1a" stroke="#2a2a3a" strokeWidth="4" />
            <circle cx="29" cy="29" r="23" fill="none" stroke={timerColor} strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 23}`}
              strokeDashoffset={`${2 * Math.PI * 23 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              transform="rotate(-90 29 29)" />
            <text x="29" y="35" textAnchor="middle" fill="#fff" fontSize="16"
              style={{ fontFamily: "'Bebas Neue', cursive" }}>{timeLeft}</text>
          </svg>

          <div style={S.topStat}>
            <span style={S.statLabel}>SCORE</span>
            <span style={S.statVal}>{runningScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ marginBottom: 12 }}>
          <ProgressDots total={total} current={qIndex} results={results} />
        </div>

        {/* Language + skill badge */}
        <div style={{ marginBottom: 10 }}>
          <LangBadge lang={question.lang} skill={question.skill} />
        </div>

        {/* Question card */}
        <div style={{ ...S.questionCard, borderTop: `3px solid ${cfg.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <p style={{ ...S.qText, flex: 1 }}>{question.question}</p>
            <span style={{ fontSize: 34, flexShrink: 0, animation: "float 3s ease-in-out infinite" }}>{question.emoji}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div style={S.timerTrack}>
          <div style={{
            ...S.timerFill,
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${cfg.color}, ${timerColor})`,
          }} />
        </div>

        {/* Answers */}
        <div style={S.ansGrid}>
          {question.answers.map((ans, i) => {
            const col = ANS_COLORS[i];
            const isCorrect = i === question.correct;
            const isWrong = revealed && i === picked && !isCorrect;
            const showCorrect = revealed && isCorrect;
            const isPicked = i === picked;
            return (
              <button key={i}
                style={{
                  ...S.ansBtn,
                  background: showCorrect ? col.bg + "33" : isWrong ? "#2a2a3a" : "#1a1a2e",
                  border: showCorrect ? `2px solid ${col.bg}` : isPicked && !revealed ? `2px solid ${col.bg}88` : "2px solid #2a2a3a",
                  opacity: revealed && !isCorrect && !isPicked ? 0.3 : 1,
                  transform: showCorrect ? "scale(1.02)" : "scale(1)",
                  boxShadow: showCorrect ? `0 0 16px ${col.bg}55` : "none",
                  cursor: picked === null ? "pointer" : "default",
                }}
                onClick={() => handlePick(i)}
                disabled={picked !== null}>
                <div style={{
                  ...S.ansLetter,
                  background: showCorrect ? col.bg : col.bg + "22",
                  color: showCorrect ? "#fff" : col.light,
                }}>{col.label}</div>
                <span style={{ flex: 1, textAlign: "left", lineHeight: 1.4, fontSize: 14 }}>{ans}</span>
                {showCorrect && <span style={{ fontSize: 16 }}>✓</span>}
                {isWrong && <span style={{ fontSize: 16, color: "#be185d" }}>✗</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback strip */}
        {revealed && (
          <div style={{
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fadeUp 0.3s ease",
            background: picked === question.correct ? "#7c3aed22" : "#be185d22",
            border: `1px solid ${picked === question.correct ? "#7c3aed55" : "#be185d55"}`,
          }}>
            <span style={{ color: picked === question.correct ? "#a78bfa" : "#f472b6" }}>
              {picked === null
                ? "⏰ Time's up!"
                : picked === question.correct
                  ? "🎉 Correct!"
                  : `❌ Answer: ${question.answers[question.correct]}`}
            </span>
            {picked === question.correct && (
              <span style={{ color: "#FFD700", fontFamily: "'Bebas Neue', cursive", fontSize: 16 }}>
                +{gained} pts
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ questions, results, onPlayAgain, loading }) {
  const totalScore = results.reduce((s, r) => s + (r.gained || 0), 0);
  const correct = results.filter(r => r.correct).length;
  const pct = Math.round((correct / NUM_QUESTIONS) * 100);
  const rank = getRank(pct);
  const avgTime = results.reduce((s, r) => s + (r.timeTaken || 0), 0) / NUM_QUESTIONS;

  // Per-language stats
  const langStats = {};
  Object.keys(LANG_CONFIG).forEach(l => { langStats[l] = { correct: 0, total: 0 }; });
  questions.forEach((q, i) => {
    const l = q.lang;
    if (langStats[l]) {
      langStats[l].total++;
      if (results[i]?.correct) langStats[l].correct++;
    }
  });

  // Per-skill stats
  const skillStats = {};
  questions.forEach((q, i) => {
    const skill = q.skill || "Other";
    if (!skillStats[skill]) skillStats[skill] = { correct: 0, total: 0 };
    skillStats[skill].total++;
    if (results[i]?.correct) skillStats[skill].correct++;
  });

  return (
    <div style={S.screen}>
      <div style={S.bgPattern} />
      <div style={{ ...S.card, maxWidth: 500 }}>

        {/* Rank banner */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 50, marginBottom: 8, animation: "float 2s ease-in-out infinite", display: "block" }}>{rank.emoji}</div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: rank.color, letterSpacing: 3, marginBottom: 4 }}>{rank.label}</h2>
          <Stars count={correct} total={NUM_QUESTIONS} />
        </div>

        {/* Score stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { val: totalScore.toLocaleString(), label: "TOTAL SCORE", color: "#7c3aed" },
            { val: `${correct}/${NUM_QUESTIONS}`, label: "CORRECT", color: "#0891b2" },
            { val: `${pct}%`, label: "ACCURACY", color: "#d97706" },
            { val: `${avgTime.toFixed(1)}s`, label: "AVG TIME", color: "#be185d" },
          ].map((s, i) => (
            <div key={i} style={S.statBox}>
              <span style={{ fontSize: 28, fontFamily: "'Bebas Neue', cursive", color: s.color }}>{s.val}</span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 10, letterSpacing: 1.5, color: "#444" }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={S.divider} />

        {/* Language breakdown */}
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 12, letterSpacing: 2, color: "#444", marginBottom: 10 }}>BY LANGUAGE</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {Object.entries(LANG_CONFIG).map(([lang, cfg]) => {
            const stat = langStats[lang];
            if (!stat || stat.total === 0) return null;
            const p = Math.round((stat.correct / stat.total) * 100);
            return (
              <div key={lang} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{cfg.flag}</span>
                <span style={{ fontSize: 12, color: cfg.color, fontWeight: 700, width: 60 }}>{cfg.short}</span>
                <div style={{ flex: 1, height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p}%`, background: cfg.color, borderRadius: 3, transition: "width 0.7s ease" }} />
                </div>
                <span style={{ fontSize: 12, color: "#555", width: 36, textAlign: "right" }}>{stat.correct}/{stat.total}</span>
              </div>
            );
          })}
        </div>

        {/* Skill breakdown */}
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 12, letterSpacing: 2, color: "#444", marginBottom: 10 }}>BY SKILL</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {Object.entries(skillStats).map(([skill, stat]) => {
            const p = Math.round((stat.correct / stat.total) * 100);
            const color = p >= 75 ? "#7c3aed" : p >= 50 ? "#0891b2" : "#be185d";
            return (
              <div key={skill} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                background: color + "18", border: `1px solid ${color}44`,
                borderRadius: 10, padding: "6px 12px", minWidth: 80,
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color }}>{p}%</span>
                <span style={{ fontSize: 10, color: "#666", textAlign: "center" }}>{skill}</span>
              </div>
            );
          })}
        </div>

        <div style={S.divider} />

        {/* Question breakdown */}
        <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 12, letterSpacing: 2, color: "#444", marginBottom: 10 }}>QUESTION BREAKDOWN</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20, maxHeight: 260, overflowY: "auto" }}>
          {questions.map((q, i) => {
            const r = results[i];
            const cfg = LANG_CONFIG[q.lang] || LANG_CONFIG.English;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                background: r?.correct ? "#7c3aed11" : "#be185d11",
                borderRadius: 12,
                border: `1px solid ${r?.correct ? "#7c3aed33" : "#be185d33"}`,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{cfg.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: cfg.color, fontWeight: 700, background: cfg.color + "22", borderRadius: 4, padding: "1px 6px" }}>{q.skill}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#ccc", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{q.question}</p>
                  <p style={{ fontSize: 11, color: r?.correct ? "#a78bfa" : "#f472b6" }}>
                    {r?.correct
                      ? `✓ Correct · ${r.timeTaken?.toFixed(1)}s · +${r.gained} pts`
                      : `✗ Answer: ${q.answers[q.correct]}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button style={{ ...S.startBtn, opacity: loading ? 0.6 : 1 }} onClick={onPlayAgain} disabled={loading}>
          {loading
            ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: 8 }}>✦</span>Generating new quiz...</>
            : "🔄 Play Again — New Questions"}
        </button>
        {loading && <p style={{ textAlign: "center", color: "#555", fontSize: 12, marginTop: 8 }}>✨ Fresh questions coming up...</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function WordWiz() {
  const [screen, setScreen] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = await generateQuestions(newSeed());
      setQuestions(qs);
      setQIndex(0);
      setResults([]);
      setScreen("question");
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = result => {
    const newResults = [...results, result];
    setResults(newResults);
    if (qIndex + 1 >= NUM_QUESTIONS) setScreen("results");
    else setQIndex(i => i + 1);
  };

  const handlePlayAgain = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = await generateQuestions(newSeed());
      setQuestions(qs);
      setQIndex(0);
      setResults([]);
      setScreen("question");
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0a0a14; }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#1a1a2e; }
        ::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:2px; }
      `}</style>

      {screen === "home"     && <HomeScreen onStart={startGame} loading={loading} error={error} />}
      {screen === "question" && (
        <QuestionScreen
          key={qIndex}
          question={questions[qIndex]}
          qIndex={qIndex}
          total={NUM_QUESTIONS}
          results={results}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "results"  && (
        <ResultsScreen
          questions={questions}
          results={results}
          onPlayAgain={handlePlayAgain}
          loading={loading}
        />
      )}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight:"100vh", background:"#0a0a14", fontFamily:"'DM Sans',sans-serif", color:"#fff", overflowX:"hidden" },
  screen: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", position:"relative" },
  bgPattern: {
    position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
    background:"radial-gradient(ellipse at 20% 20%, #7c3aed18 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #0891b218 0%, transparent 50%)",
  },
  card: { position:"relative", zIndex:1, background:"#111120", borderRadius:22, padding:"30px 24px", width:"100%", maxWidth:440, border:"1px solid #1e1e35", boxShadow:"0 32px 80px #00000099", animation:"fadeUp 0.4s ease" },
  logoIconWrap: { width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#7c3aed,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", boxShadow:"0 8px 24px #7c3aed44" },
  logoTitle: { fontFamily:"'Bebas Neue',cursive", fontSize:44, letterSpacing:4, color:"#fff", lineHeight:1 },
  divider: { height:1, background:"linear-gradient(90deg,transparent,#2a2a3a,transparent)", margin:"16px 0" },
  featureTile: { display:"flex", alignItems:"center", gap:10, background:"#0d0d1a", borderRadius:12, padding:"11px 13px", border:"1px solid #1e1e35" },
  startBtn: { width:"100%", padding:"16px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#0891b2)", color:"#fff", fontSize:17, fontWeight:900, fontFamily:"'Bebas Neue',cursive", letterSpacing:2, cursor:"pointer", boxShadow:"0 8px 28px #7c3aed44", transition:"opacity 0.2s", display:"flex", alignItems:"center", justifyContent:"center" },
  gameWrap: { position:"relative", zIndex:1, width:"100%", maxWidth:540, animation:"fadeUp 0.3s ease" },
  topBar: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, background:"#111120", borderRadius:16, padding:"10px 18px", border:"1px solid #1e1e35" },
  topStat: { display:"flex", flexDirection:"column", alignItems:"center", minWidth:64 },
  statLabel: { fontSize:10, color:"#444", letterSpacing:1.5, fontFamily:"'Bebas Neue',cursive" },
  statVal: { fontSize:20, fontFamily:"'Bebas Neue',cursive", letterSpacing:1, color:"#fff" },
  questionCard: { background:"#111120", borderRadius:18, padding:"18px 18px", border:"1px solid #1e1e35", marginBottom:10, marginTop:10, boxShadow:"0 8px 24px #00000044" },
  qText: { fontSize:17, fontWeight:700, lineHeight:1.55, color:"#eee" },
  timerTrack: { height:4, background:"#1a1a2e", borderRadius:2, marginBottom:12, overflow:"hidden" },
  timerFill: { height:"100%", borderRadius:2, transition:"width 1s linear" },
  ansGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 },
  ansBtn: { display:"flex", alignItems:"center", gap:10, padding:"12px 13px", borderRadius:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, color:"#fff", transition:"all 0.2s", textAlign:"left" },
  ansLetter: { width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',cursive", fontSize:15, flexShrink:0 },
  statBox: { display:"flex", flexDirection:"column", alignItems:"center", background:"#0d0d1a", borderRadius:13, padding:"13px 10px", border:"1px solid #1e1e35", gap:4 },
};
