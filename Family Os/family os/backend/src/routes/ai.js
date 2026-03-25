const express = require("express");
const { verifyChore, moderateSubmission } = require("../controllers/aiController");

const router = express.Router();

router.post("/verify-chore", verifyChore);
router.post("/moderate-submission", moderateSubmission);

module.exports = router;
