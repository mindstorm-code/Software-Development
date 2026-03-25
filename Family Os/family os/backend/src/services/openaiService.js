const OpenAI = require("openai");

const SYSTEM_PROMPT =
  "You review chore submissions. Return ONLY valid JSON with keys: confidenceScore (0-1), status (likely_complete|needs_review|likely_incomplete), notes (string). Keep notes short.";

const buildUserPrompt = ({ choreTitle, choreDescription, checklist, imageUrls, childNotes }) => {
  const checklistText = Array.isArray(checklist) && checklist.length
    ? checklist.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "No checklist provided.";

  const imagesText = Array.isArray(imageUrls) && imageUrls.length
    ? imageUrls.map((url, index) => `${index + 1}. ${url}`).join("\n")
    : "No image URLs provided.";

  return [
    `Chore: ${choreTitle}`,
    choreDescription ? `Description: ${choreDescription}` : "Description: (none)",
    `Checklist:\n${checklistText}`,
    `Images:\n${imagesText}`,
    childNotes ? `Child notes: ${childNotes}` : "Child notes: (none)",
    "Evaluate likelihood the chore is complete based on provided info.",
  ].join("\n\n");
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

const buildMockReview = (overrideNote) => ({
  confidenceScore: 0.62,
  status: "needs_review",
  notes: overrideNote || "Mock AI response (missing OpenAI key).",
  reviewedAt: new Date().toISOString(),
  source: "mock",
});

const buildMockModeration = () => ({
  status: "needs_review",
  notes: "Moderation placeholder. TODO: connect to real moderation model.",
  reviewedAt: new Date().toISOString(),
  source: "mock",
});

const verifyChoreWithAI = async (payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildMockReview();
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(payload) },
      ],
    });

    const content = completion?.choices?.[0]?.message?.content || "";
    const parsed = safeJsonParse(content);

    if (!parsed) {
      return buildMockReview("AI returned non-JSON. Check prompt formatting.");
    }

    return {
      confidenceScore: parsed.confidenceScore ?? 0.5,
      status: parsed.status ?? "needs_review",
      notes: parsed.notes ?? "AI response parsed with defaults.",
      reviewedAt: new Date().toISOString(),
      source: "openai",
    };
  } catch (error) {
    return buildMockReview("AI request failed. Returning mock response.");
  }
};

module.exports = {
  verifyChoreWithAI,
  buildMockModeration,
};
