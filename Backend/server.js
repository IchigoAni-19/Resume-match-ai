/**
 * Application entry point.
 *
 * Import order matters in ESM — env.js MUST be first so that dotenv.config()
 * runs before any other module reads from process.env at load time.
 */
import "./src/config/env.js";

import app from "./src/app.js";
import connectToDb from "./src/config/database.js";

connectToDb();

if (process.env.MOCK_AI === "true") {
    console.log("MOCK_AI=true — Gemini calls are disabled; using sample AI responses.");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
