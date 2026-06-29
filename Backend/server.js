import dotenv from "dotenv";
dotenv.config(); // Must be called before any other imports that read env vars

import app from "./src/app.js";
import connectToDb from "./src/config/database.js";

// Connect to MongoDB before starting the HTTP server
connectToDb();

if (process.env.MOCK_AI === "true") {
    console.log("MOCK_AI=true — Gemini calls are disabled; using sample AI responses.");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
