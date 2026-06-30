import { GoogleGenAI } from "@google/genai";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";

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
const getModel = () => process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

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
 * Builds a professional single-column HTML resume matching the standard
 * "Harsh Patel" style resume from the images:
 * - Centered name + contact bar at top
 * - Bold section titles with a full-width bottom border
 * - Left-aligned content, bullet points, inline bold labels for skills
 * - White background, black text, no colours — clean ATS-friendly layout
 *
 * Used when MOCK_AI=true so download works without a Gemini API key.
 *
 * @param {{ resume: string, selfDescription: string, jobDescription: string }} params
 * @returns {string} HTML string ready for Puppeteer PDF conversion
 */
function getMockResumeHtml({ resume, selfDescription, jobDescription }) {
    const targetRole = jobDescription?.split("\n")[0]?.replace(/^Role:\s*/i, "").trim() || "Software Engineer";
    const sourceText  = (resume?.trim() || selfDescription?.trim() || "").slice(0, 3000);

    // Split into non-empty lines to use as content bullets
    const lines = sourceText.split(/\n+/).map(l => l.trim()).filter(Boolean);

    // Render the raw content as bullet points under "Experience & Background"
    const bulletItems = lines.length
        ? lines.slice(0, 20).map(l => `<li>${l}</li>`).join("\n")
        : "<li>Full-stack development with a focus on scalable, production-ready web applications.</li>";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    color: #000;
    background: #fff;
    padding: 28px 40px;
    line-height: 1.45;
  }

  /* ── Header ── */
  .name {
    text-align: center;
    font-size: 22pt;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .contact {
    text-align: center;
    font-size: 9.5pt;
    color: #333;
    margin-bottom: 14px;
  }
  .contact a { color: #1155cc; text-decoration: none; }
  .contact span { margin: 0 5px; color: #555; }

  /* ── Section ── */
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin-bottom: 7px;
  }

  /* ── Education row ── */
  .edu-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .edu-row .left  { font-weight: 700; }
  .edu-row .right { font-style: italic; font-size: 9.5pt; color: #333; }

  /* ── Bullet lists ── */
  ul { padding-left: 18px; margin: 4px 0; }
  li { margin-bottom: 3px; }

  /* ── Skills (inline bold labels) ── */
  .skill-line { margin-bottom: 3px; }
  .skill-label { font-weight: 700; }
</style>
</head>
<body>

  <!-- Name & Contact -->
  <div class="name">Candidate</div>
  <div class="contact">
    +91-XXXXXXXXXX
    <span>|</span> candidate@email.com
    <span>|</span> <a href="#">LinkedIn</a>
    <span>|</span> <a href="#">GitHub</a>
  </div>

  <!-- Education -->
  <div class="section">
    <div class="section-title">Education</div>
    <div class="edu-row">
      <span class="left">University Name</span>
      <span class="right">2022 – 2026</span>
    </div>
    <div class="edu-row">
      <span>B.Tech – Computer Science / Electronics Engineering</span>
      <span class="right" style="font-style:italic;color:#333">City, State</span>
    </div>
    <div style="margin-top:3px">CGPA: 8.0</div>
    <div style="margin-top:3px">
      <strong>Relevant Coursework:</strong>
      Data Structures and Algorithms &nbsp;|&nbsp; Object-Oriented Programming &nbsp;|&nbsp; Operating Systems
    </div>
  </div>

  <!-- Experience / Background from resume text -->
  <div class="section">
    <div class="section-title">Experience &amp; Background</div>
    <div><strong>${targetRole} — Candidate</strong></div>
    <ul>${bulletItems}</ul>
  </div>

  <!-- Technical Skills -->
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skill-line"><span class="skill-label">Languages:</span> JavaScript, TypeScript, Python, HTML5, CSS3</div>
    <div class="skill-line"><span class="skill-label">Developer Tools:</span> Git, GitHub, VS Code, Postman, npm, MongoDB Compass</div>
    <div class="skill-line"><span class="skill-label">Technologies/Frameworks:</span> React.js, Node.js, Express.js, MongoDB, REST API, Tailwind CSS</div>
    <div class="skill-line"><span class="skill-label">Coursework:</span> Data Structures and Algorithms, Object-Oriented Programming, Operating Systems</div>
    <div class="skill-line"><span class="skill-label">Professional Skills:</span> Problem Solving, Debugging, Communication</div>
  </div>

  <!-- Target Role note -->
  <div class="section">
    <div class="section-title">Target Position</div>
    <p>${targetRole}</p>
    ${selfDescription?.trim() ? `<p style="margin-top:5px;color:#333">${selfDescription.trim().slice(0, 400)}</p>` : ""}
  </div>

</body>
</html>`;
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
 * Generates a tailored resume PDF for a candidate using Gemini AI.
 * @param {{ resume: string, selfDescription: string, jobDescription: string }} params
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    if (isMock()) {
        console.log("[MOCK_AI] Returning sample resume PDF.");
        return generatePdfFromHtml(getMockResumeHtml({ resume, selfDescription, jobDescription }));
    }

    const ai = getAiClient();

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer"),
    });

    const prompt = `Generate resume for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.`;

    const response = await ai.models.generateContent({
        model: getModel(),
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
