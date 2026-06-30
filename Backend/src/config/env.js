/**
 * Environment variable loader.
 * This module MUST be the first import in server.js.
 *
 * In ESM, all static `import` statements are hoisted and evaluated before
 * any top-level code runs. By placing dotenv.config() in its own module and
 * importing it first, we guarantee env vars are populated before any other
 * module reads from process.env at load time.
 */
import dotenv from "dotenv";
dotenv.config();
