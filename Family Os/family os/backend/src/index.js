require("dotenv").config();

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health");
const aiRoutes = require("./routes/ai");
const { errorHandler } = require("./middleware/errorHandler");
const { logger } = require("./utils/logger");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ name: "Family OS API", status: "ok" });
});

app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger(`Family OS API listening on http://localhost:${PORT}`);
});
