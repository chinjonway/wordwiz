const NUM_QUESTIONS = 10;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
}

function buildSystemPrompt(assignments, seed) {
  return `You create language quiz questions for children aged 8–10 years old.
Return ONLY a valid JSON array of exactly ${NUM_QUESTIONS} objects. No markdown, no extra text.
Each object must have: { "question": string, "answers": [4 strings], "correct": 0-3, "emoji": string, "lang": string, "skill": string }

ASSIGNMENTS — each question must test EXACTLY the assigned language and skill:
${assignments.map((item, index) => `Q${index + 1}: Language=${item.lang}, Skill="${item.topic}"`).join("\n")}

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
- NEVER ask the same question twice. Use creative, specific, targeted examples.`;
}

function parseQuestions(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const questions = JSON.parse(cleaned);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No questions in response");
  }

  return questions;
}

export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
  }

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  const seed = typeof payload.seed === "string" ? payload.seed : String(payload.seed || "");
  const assignments = Array.isArray(payload.assignments) ? payload.assignments : [];

  if (!seed) {
    return jsonResponse({ error: "Missing seed" }, { status: 400 });
  }

  if (assignments.length !== NUM_QUESTIONS) {
    return jsonResponse({ error: `Expected ${NUM_QUESTIONS} assignments` }, { status: 400 });
  }

  const anthropicRes = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2500,
      system: buildSystemPrompt(assignments, seed),
      messages: [{ role: "user", content: `Seed: ${seed}. Generate all ${NUM_QUESTIONS} language questions now. JSON array only.` }],
    }),
  });

  if (!anthropicRes.ok) {
    const body = await anthropicRes.text().catch(() => "");
    return jsonResponse({ error: `Anthropic ${anthropicRes.status}: ${body.slice(0, 200)}` }, { status: 502 });
  }

  let data;
  try {
    data = await anthropicRes.json();
  } catch {
    return jsonResponse({ error: "Invalid Anthropic JSON response" }, { status: 502 });
  }

  if (data.error?.message) {
    return jsonResponse({ error: data.error.message }, { status: 502 });
  }

  const text = data.content?.find(block => block.type === "text")?.text || "";
  if (!text) {
    return jsonResponse({ error: "Empty response from Anthropic" }, { status: 502 });
  }

  try {
    return jsonResponse({ questions: parseQuestions(text) });
  } catch {
    return jsonResponse({ error: `JSON parse failed: ${text.slice(0, 100)}` }, { status: 502 });
  }
}