const { verifyChoreWithAI, buildMockModeration } = require("../services/openaiService");

const verifyChore = async (req, res, next) => {
  try {
    const {
      choreTitle,
      choreDescription,
      checklist,
      imageUrls = [],
      childNotes = "",
    } = req.body || {};

    if (!choreTitle) {
      return res.status(400).json({ error: "choreTitle is required" });
    }

    const result = await verifyChoreWithAI({
      choreTitle,
      choreDescription,
      checklist,
      imageUrls,
      childNotes,
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

const moderateSubmission = async (req, res) => {
  const mock = buildMockModeration();
  res.json(mock);
};

module.exports = {
  verifyChore,
  moderateSubmission,
};
