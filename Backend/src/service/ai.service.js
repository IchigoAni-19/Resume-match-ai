import { GoogleGenAI } from "@google/genai";
import z from "zod";

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .int()
        .min(0)
        .max(100)
        .describe(
            "A score between 0 and 100 indicating how well the candidate's profile and the job describe match",
        ),
    technicalQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe(
                        "The technical question that can be asked in the interview",
                    ),
                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question",
                    ),
                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover and what approach to take",
                    ),
            }),
        )
        .min(1)
        .describe(
            "The technical questions that can be asked in the interview along with their intention and how to answer them",
        ),

    behavioralQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe(
                        "The behavioral question that can be asked in the interview",
                    ),
                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question",
                    ),
                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover and what approach to take",
                    ),
            }),
        )
        .min(1)
        .describe(
            "The behavioral questions that can be asked in the interview along with their intention and how to answer them",
        ),

    skillGaps: z
        .array(
            z.object({
                skill: z
                    .string()
                    .describe("The skill which the candidate is lacking"),
                severity: z
                    .enum(["low", "medium", "high"])
                    .describe("The severity of the skill gap i.e. low, medium, high"),
            }),
        )
        .min(1)
        .describe(
            "The list of skill gaps in the candidate's profile along with their severity",
        ),

    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
                    .int()
                    .min(1)
                    .describe(
                        "The day number in the preparation plan starting from Day 1",
                    ),
                focus: z
                    .string()
                    .describe(
                        "The main focus of this day in the preparation plan , e.g. data structure , dbms , algorithms, etc.",
                    ),
                tasks: z
                    .array(z.string())
                    .min(1)
                    .describe(
                        "The list of tasks to be done on this day to follow the preparation plan",
                    ),
            }),
        )
        .min(3)
        .describe(
            "A day-wise preparation plan for the candidate to prepare for the interview effectively",
        ),
});

async function generateInterviewReport({
    resume,
    jobDescription,
    selfDescription,
}) {
    console.log("Starting generateInterviewReport with inputs:", {
        resumeLength: resume?.length,
        jobDescriptionLength: jobDescription?.length,
        selfDescriptionLength: selfDescription?.length
    });

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    const prompt = `You are an expert career coach and interview preparation specialist.
    Generate a detailed interview report for a candidate with the following details:

    1. RESUME:
    ${resume || "No resume provided"}

    2. SELF DESCRIPTION:
    ${selfDescription}

    3. JOB DESCRIPTION:
    ${jobDescription}

    Please generate a complete, valid JSON object that strictly follows this schema:
    {
        "matchScore": number (0-100),
        "technicalQuestions": [{
            "question": string,
            "intention": string,
            "answer": string
        }] (at least 1 item),
        "behavioralQuestions": [{
            "question": string,
            "intention": string,
            "answer": string
        }] (at least 1 item),
        "skillGaps": [{
            "skill": string,
            "severity": "low" | "medium" | "high"
        }] (at least 1 item),
        "preparationPlan": [{
            "day": number (starting at 1),
            "focus": string,
            "tasks": [string] (at least 1 item)
        }] (at least 3 items)
    }

    Return only the JSON, no additional text!`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        console.log("Google GenAI response received:", response.text);

        const parsedResponse = JSON.parse(response.text);
        console.log("Parsed response:", parsedResponse);

        // Validate with Zod
        const validatedReport = interviewReportSchema.parse(parsedResponse);
        console.log("Validated report:", validatedReport);

        return validatedReport;
    } catch (error) {
        console.error("Error in generateInterviewReport:", error);
        throw error;
    }
}

export default generateInterviewReport;
