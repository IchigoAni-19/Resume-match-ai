import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

/** Load the resume HTML template once at module level (it never changes at runtime) */
const RESUME_TEMPLATE = readFileSync(
    join(__dirname, "../templates/resume.html"),
    "utf-8"
);

/**
 * Returns true if MOCK_AI mode is enabled.
 * Arrow function — evaluated lazily at call time, not at module load.
 * This guarantees dotenv has already populated process.env before we read it.
 * @returns {boolean}
 */
const isMock = () => process.env.MOCK_AI === "true";

/**
 * Returns the configured Gemini model name from env, with a safe default.
 * @returns {string}
 */
const getModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Creates a Gemini AI client using the API key from env.
 * Called lazily inside functions so the key is always resolved after dotenv.config().
 * Throws a clear error immediately if the key is missing or looks invalid.
 * @returns {GoogleGenAI}
 */
function getAiClient() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GOOGLE_GENAI_API_KEY is not set. Add it to Backend/.env or set MOCK_AI=true."
        );
    }
    return new GoogleGenAI({ apiKey });
}

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

/**
 * Zod schema for the structured resume data returned by Gemini.
 * The AI generates structured JSON; we inject it into the HTML template.
 * This keeps layout concerns in the template and content concerns in the AI.
 */
const resumeDataSchema = z.object({
    name:       z.string().describe("Full name of the candidate extracted from the resume"),
    contact:    z.string().describe("Contact line: Phone | Email | LinkedIn URL | GitHub URL — use HTML <a> tags for links"),
    summary:    z.string().describe("2-3 sentence professional summary targeting the job description with ATS keywords"),
    projects:   z.string().describe("HTML snippet: multiple <div class='project'> blocks, each with project-header, tech stack italic line, and ul/li bullet points starting with action verbs"),
    languages:  z.string().describe("Comma-separated list of programming languages"),
    frameworks: z.string().describe("Comma-separated list of frameworks, libraries and tools"),
});

// ── Template helper ───────────────────────────────────────────────────────────

/**
 * Injects structured resume data into the HTML template by replacing
 * {{placeholder}} tokens with actual content.
 *
 * @param {object} data - Fields: name, contact, summary, projects, languages, frameworks
 * @returns {string} Complete HTML document ready for Puppeteer
 */
function renderResumeTemplate(data) {
    return RESUME_TEMPLATE
        .replace("{{name}}",       data.name       || "Candidate")
        .replace("{{contact}}",    data.contact    || "")
        .replace("{{summary}}",    data.summary    || "")
        .replace("{{projects}}",   data.projects   || "")
        .replace("{{languages}}",  data.languages  || "")
        .replace("{{frameworks}}", data.frameworks || "");
}

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
 * Returns mock structured resume data using the same schema as the real AI response.
 * Parses as much real content from the resume/selfDescription as possible.
 * Used when MOCK_AI=true so the template renders with actual candidate content.
 *
 * @param {{ resume: string, selfDescription: string, jobDescription: string }} params
 * @returns {import('zod').infer<typeof resumeDataSchema>}
 */
function getMockResumeData({ resume, selfDescription, jobDescription }) {
    const targetRole = jobDescription?.split("\n")[0]?.replace(/^Role:\s*/i, "").trim() || "Software Engineer";
    const sourceText = (resume?.trim() || selfDescription?.trim() || "").slice(0, 3000);
    const lines = sourceText.split(/\n+/).map(l => l.trim()).filter(Boolean);

    // Build bullet items from actual resume lines (max 8 meaningful lines)
    const bullets = lines.slice(0, 8).map(l => `<li>${l}</li>`).join("\n") ||
        "<li>Engineered full-stack web applications using React and Node.js.</li>" +
        "<li>Implemented RESTful APIs with Express.js and MongoDB.</li>" +
        "<li>Deployed applications using Git, GitHub, and CI/CD pipelines.</li>";

    const projectsHtml = `
<div class="project">
  <div class="project-header">
    <span>${targetRole} Project</span>
    <span>2024</span>
  </div>
  <p class="project-tech"><i>Tech Stack: React.js, Node.js, Express.js, MongoDB</i></p>
  <ul>
    ${bullets}
  </ul>
</div>`;

    return {
        name:       "Candidate",
        contact:    `+91-XXXXXXXXXX <span class="sep">|</span> candidate@email.com <span class="sep">|</span> <a href="#">LinkedIn</a> <span class="sep">|</span> <a href="#">GitHub</a>`,
        summary:    selfDescription?.trim().slice(0, 300) || `Motivated ${targetRole} with hands-on experience in full-stack development, building scalable web applications, and contributing to production systems.`,
        projects:   projectsHtml,
        languages:  "JavaScript, TypeScript, Python, HTML5, CSS3",
        frameworks: "React.js, Node.js, Express.js, MongoDB, REST API, Git, Tailwind CSS",
    };
}

// ── Core AI functions ─────────────────────────────────────────────────────────

/**
 * Generates a structured interview preparation report via Gemini AI.
 * @param {{ resume: string, jobDescription: string, selfDescription: string }} params
 * @returns {Promise<import('zod').infer<typeof interviewReportSchema>>}
 */
async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    if (isMock()) {
        console.log("[MOCK_AI] Returning sample interview report.");
        return getMockInterviewReport({ jobDescription });
    }

    const ai = getAiClient();

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
        model: getModel(),
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
 * Generates a tailored, ATS-optimized resume PDF for a candidate.
 *
 * Architecture:
 *   1. Gemini AI extracts structured data (name, contact, summary, projects, skills)
 *      from the candidate's raw resume + self-description, tailored to the job description.
 *   2. The structured data is injected into a fixed HTML template (resume.html).
 *   3. Puppeteer renders the final HTML to a PDF buffer.
 *
 * This keeps layout stable and consistent while letting the AI focus purely on content.
 *
 * @param {{ resume: string, selfDescription: string, jobDescription: string }} params
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    if (isMock()) {
        console.log("[MOCK_AI] Returning sample resume PDF.");
        const mockData = getMockResumeData({ resume, selfDescription, jobDescription });
        return generatePdfFromHtml(renderResumeTemplate(mockData));
    }

    const ai = getAiClient();

    const prompt = `Act as a world-class ATS-optimized Resume Engineer. Your task is to process the incoming resume data, self-description, and job description to produce a professional, structured resume.

Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}

Your output MUST be a strict JSON object with no markdown or preamble:
{
  "name": "Full Name",
  "contact": "Phone | Email | <a href='LINKEDIN_URL'>LinkedIn</a> | <a href='GITHUB_URL'>GitHub</a>",
  "summary": "2-3 sentence professional summary targeting the job description.",
  "projects": "HTML snippet: Use multiple <div class='project'> blocks. Each must have <div class='project-header'><span>Name</span> <span>Year</span></div><p class='project-tech'><i>Tech Stack: [Tech]</i></p><ul><li>Action-verb bullet 1</li><li>Action-verb bullet 2</li><li><a href='GITHUB'>Source</a> | <a href='LIVE'>Live</a></li></ul>",
  "languages": "CSV string of programming languages",
  "frameworks": "CSV string of frameworks, libraries and tools"
}

Critical Instructions:
1. DATA INTEGRITY: Use ONLY the data provided in the inputs. Do not invent experience, projects, or credentials.
2. ATS OPTIMIZATION: Ensure the summary contains top keywords from the provided job description.
3. FORMATTING: Ensure the projects HTML string is valid, semantic HTML. Do not merge projects; each project must have its own <div class='project'> block with its own tech stack and bullet points.
4. ACTION ORIENTATION: Every bullet point must start with a strong action verb (e.g., Architected, Engineered, Deployed, Implemented, Designed).
5. STYLE: Keep it concise and 1-2 pages in length.
6. LINKS: Extract and format LinkedIn, GitHub, and live project links clearly from the resume text. If a link is not found, use "#" as the href.
7. If resume or self-description is sparse, write reasonable bullets based on the skills and technologies mentioned.`;

    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumeDataSchema),
        },
    });

    const resumeData = resumeDataSchema.parse(JSON.parse(response.text));
    const html = renderResumeTemplate(resumeData);
    return generatePdfFromHtml(html);
}

export default { generateInterviewReport, generateResumePdf };
