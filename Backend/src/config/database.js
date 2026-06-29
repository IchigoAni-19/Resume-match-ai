import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB using the URI from the `MONGO_URI`
 * environment variable. Called once at server startup.
 *
 * Mongoose maintains a connection pool internally, so this function only
 * needs to be called once. If the connection fails, the error is logged
 * and the process continues — consider calling `process.exit(1)` in
 * production if a DB connection is critical.
 *
 * @returns {Promise<void>}
 */
async function connectToDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database");
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
}

export default connectToDb;
