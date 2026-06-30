import express from "express"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from 'cors'
import interviewRouter from "./routes/interview.routes.js"

const app = express()

app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
}))

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

/** 404 handler — catches any route that doesn't match above */
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" })
})

/**
 * Global error handler — catches any unhandled errors thrown in route handlers.
 * Express identifies this as an error handler because it has 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err)
    const status = err.status || err.statusCode || 500
    res.status(status).json({
        message: err.message || "Internal server error",
    })
})

export default app