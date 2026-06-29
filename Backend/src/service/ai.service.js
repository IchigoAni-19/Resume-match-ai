import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const MOCK_AI = process.env.MOCK_AI === "true";

/** Singleton Gemini client — instantiated once when the module loads */
const ai = MOCK_AI ? null : new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// ── Zod schema for the AI-generated interview report ──────────────────────────

const interviewReportSchema = z.object({
    title: z
        .string()
        .describe("A short, descriptive title for the interview report (e.g., 'Senior Frontend Engineer Interview Preparation')"),
    matchScore: z
        .number()
        .int()
        .min(0)
        .max(100)
        .describe("A score between 0 and 100 indicating how well the candidate's profile and the job description match"),
    technicalQuestions: z
        .array(
            z.object({
                question: z.string().describe("The technical question that can be asked in the interview"),
                intention: z.string().describe("The intention of the interviewer behind asking this question"),
                answer: z.string().describe("How to answer this question, what points to cover and what approach to take"),
            }),
        )
        .min(1)
        .describe("Technical questions with intention and model answer guidance"),
    behavioralQuestions: z
        .array(
            z.object({
                question: z.string().describe("The behavioral question that can be asked in the interview"),
                intention: z.string().describe("The intention of the interviewer behind asking this question"),
                answer: z.string().describe("How to answer this question, what points to cover and what approach to take"),
            }),
        )
        .min(1)
        .describe("Behavioral questions with intention and model answer guidance"),
    skillGaps: z
        .array(
            z.object({
                skill: z.string().describe("The skill which the candidate is lacking"),
                severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap"),
            }),
        )
        .min(1)
        .describe("List of skill gaps with severity"),
    preparationPlan: z
        .array(
            z.object({
                day: z.number().int().min(1).describe("The day number in the preparation plan starting from Day 1"),
                focus: z.string().describe("The main focus of this day"),
                tasks: z.array(z.string()).min(1).describe("Tasks to complete on this day"),
            }),
        )
        .min(3)
        .describe("Day-wise preparation plan"),
});

// ── Mock helpers ──────────────────────────────────────────────────────────────

/**
 * Returns a deterministic mock interview report for development/testing.
 * @param {{ jobDescription: string }} params
 * @returns {import('zod').infer<typeof interviewReportSchema>}
 */
function getMockInterviewReport({ jobDescription }) {
    const roleHint = jobDescription?.split("\n")[0]?.replace(/^Role:\s*/i, "").trim() || "Software Engineer";

    return interviewReportSchema.parse({
        title: `${roleHint} Interview Preparation (Mock)`,
        matchScore: 78,
        technicalQuestions: [
            {
                question: "Explain how you would design a scalable REST API with Node.js and Express.",
                intention: "Assess backend architecture and API design skills.",
                answer: "Describe route structure, middleware, validation, error handling, and how you'd scale with caching and load balancing.",
            },
            {
                question: "How does React's virtual DOM improve rendering performance?",
                intention: "Test frontend fundamentals and React knowledge.",
                answer: "Explain reconciliation, diffing, batching updates, and when you'd optimize with memoization or code splitting.",
            },
        ],
        behavioralQuestions: [
            {
                question: "Tell me about a time you resolved a production bug under pressure.",
                intention: "Evaluate debugging process and communication under stress.",
                answer: "Use STAR format: describe the incident, your investigation steps, fix, and post-mortem improvements.",
            },
        ],
        skillGaps: [
            { skill: "AWS cloud services", severity: "medium" },
            { skill: "SQL query optimization", severity: "low" },
        ],
        preparationPlan: [
            { day: 1, focus: "Core JavaScript & React", tasks: ["Review hooks and state patterns", "Practice 2 coding warm-ups"] },
            { day: 2, focus: "Node.js & System Design", tasks: ["Design a URL shortener on paper", "Review REST best practices"] },
            { day: 3, focus: "Behavioral & Mock Interview", tasks: ["Prepare 5 STAR stories", "Do a timed mock interview"] },
        ],
    });
}

/**
 * Returns HTML for a mock resume PDF (used when MOCK_AI=true).
 * @param {{ selfDescription: string, jobDescription: string }} params
 * @returns {string} HTML string
 */
function getMockResumeHtml({ selfDescription, jobDescription }) {
    const summary = selfDescription?.slice(0, 300) || "Experienced software engineer.";
    const role = jobDescription?.split("\n")[0]?.replace(/^Role:\s*/i, "").trim() || "Software Engineer";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;color:#222;margin:0;padding:24px;line-height:1.5}
h1{margin:0 0 4px;font-size:28px;color:#1a365d}
h2{margin:24px 0 8px;font-size:16px;color:#2b6cb0;border-bottom:1px solid #bee3f8}
p,li{font-size:14px}
.header{margin-bottom:20px}
.tag{color:#4a5568;font-size:14px}
</style></head><body>
<div class="header"><h1>Candidate Resume</h1><p class="tag">Target role: ${role} (mock PDF)</p></div>
<h2>Summary</h2><p>${summary}</p>
<h2>Skills</h2><ul><li>JavaScript, React, Node.js</li><li>REST APIs, MongoDB, Git</li><li>Agile, CI/CD, automated testing</li></ul>
<h2>Experience</h2><p>Full-stack development with focus on scalable web applications and cross-functional delivery.</p>
</body></html>`;
}

// ── Core AI functions ─────────────────────────────────────────────────────────

/**
 * Generates a structured interview preparation report via Gemini AI.
 * @param {{ resume: string, jobDescription: string, selfDescription: string }} params
 * @returns {Promise<import('zod').infer<typeof interviewReportSchema>>}
 */
async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    if (MOCK_AI) {
        console.log("[MOCK_AI] Returning sample interview report.");
        return getMockInterviewReport({ jobDescription });
    }

    const prompt = `You are an expert career coach and interview preparation specialist.
Generate a detailed interview report for a candidate with the following details:

1. RESUME:
${resume || "No resume provided"}

2. SELF DESCRIPTION:
${selfDescription || "Not provided"}

3. JOB DESCRIPTION:
${jobDescription}

Return ONLY a valid JSON object matching this schema exactly — no markdown, no extra text:
{
  "title": string,
  "matchScore": number (0-100),
  "technicalQuestions": [{ "question": string, "intention": string, "answer": string }],
  "behavioralQuestions": [{ "question": string, "intention": string, "answer": string }],
  "skillGaps": [{ "skill": string, "severity": "low"|"medium"|"high" }],
  "preparationPlan": [{ "day": number, "focus": string, "tasks": [string] }]
}`;

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });

    const parsedResponse = JSON.parse(response.text);
    const validatedReport = interviewReportSchema.parse(parsedResponse);
    return validatedReport;
}

/**
 * Converts an HTML string to a PDF buffer using Puppeteer.
 * Launches with --no-sandbox for compatibility in Linux/Docker environments.
 * @param {string} htmlContent
 * @returns {Promise<Buffer>}
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
        });
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

/**
 * Generates a tailored resume PDF for a candidate using Gemini AI.
 * @param {{ resume: string, selfDescription: string, jobDescription: string }} params
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    if (MOCK_AI) {
        console.log("[MOCK_AI] Returning sample resume PDF.");
        return generatePdfFromHtml(getMockResumeHtml({ selfDescription, jobDescription }));
    }

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume, suitable for PDF conversion via Puppeteer"),
    });

    const prompt = `Generate a tailored, ATS-friendly resume in HTML for this candidate:

Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}

Return a JSON object with a single field "html" containing well-formatted HTML.
Requirements:
- Professional and clean design, simple colour accents
- ATS-friendly structure (parseable, no tables for layout)
- 1-2 pages when printed to A4
- Content should read naturally, not AI-generated
- Highlight skills and experience relevant to the job description`;

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        },
    });

    const { html } = JSON.parse(response.text);
    return generatePdfFromHtml(html);
}

export default { generateInterviewReport, generateResumePdf };
