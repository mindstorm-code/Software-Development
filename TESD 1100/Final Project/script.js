/*
Author: Jeffrey Jenson
Last Updated: 1/27/2026
*/

// Quote Rotator (simple, obvious JS)
const quotes = [
  "Failure is feedback in disguise.",
  "You own the outcome. AI is a tool, not an authority.",
  "Attention is power. Protect it.",
  "Don't collapse your standards. Collapse the time to your next lesson.",
];

let qi = 0;

function newQuote() {
  qi = (qi + 1) % quotes.length;
  const el = document.getElementById("quote");
  if (el) el.textContent = quotes[qi];
}

// Mini PHASE Quick Check (rubric-friendly JS)
function scoreQuickCheck() {
  // Types: Charger, Helper, Analyzer, Planner, Explorer
  const types = ["Charger", "Helper", "Analyzer", "Planner", "Explorer"];
  const scores = {
    Charger: 0,
    Helper: 0,
    Analyzer: 0,
    Planner: 0,
    Explorer: 0,
  };

  for (let q = 1; q <= 5; q++) {
    const selected = document.querySelector(`input[name="q${q}"]:checked`);
    if (selected) {
      scores[selected.value] += 1;
    }
  }

  const answeredCount = Object.values(scores).reduce((a, b) => a + b, 0);
  const resultBox = document.getElementById("quickResult");
  if (!resultBox) return;

  if (answeredCount < 3) {
    resultBox.textContent =
      "Answer at least 3 questions to get a useful result.";
    return;
  }

  let best = types[0];
  for (const t of types) {
    if (scores[t] > scores[best]) best = t;
  }

  const tip = {
    Charger:
      "You move fast and lead with action. Guardrail: pause for one quick check before committing.",
    Helper:
      "You lead with people and support. Guardrail: help without carrying everyone's load.",
    Analyzer:
      "You think deep and spot patterns. Guardrail: decide and ship version 1.",
    Planner:
      "You build structure and stability. Guardrail: don't wait for perfect conditions.",
    Explorer:
      "You're curious and creative. Guardrail: finish one thing before chasing the next.",
  };

  resultBox.textContent = `Quick result: You lean ${best}. ${tip[best]} (Full 40-question assessment coming soon.)`;
}

// Simple FAQ toggle (extra tiny JS polish, optional use)
function toggleFaq(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isHidden = el.style.display === "none" || el.style.display === "";
  el.style.display = isHidden ? "block" : "none";
}
