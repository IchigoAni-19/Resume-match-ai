import { GoogleGenAI } from "@google/genai";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const interviewReportSchema = z.object({
    matchScore: z
        .number()
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
        .describe(
            "The list of skill gaps in the candidate's profile along with their severity",
        ),

    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
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
                    .describe(
                        "The list of tasks to be done on this day to follow the preparation plan",
                    ),
            }),
        )
        .describe(
            "A day-wise preparation plan for the candidate to prepare for the interview effectively",
        ),
});

async function generateInterviewReport({
    resume,
    jobDescription,
    selfDescription,
}) {
    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

    const prompt = `Generate an interview report for a candidate with the following details : 
                         Resume: ${resume},
                         Self Description: ${selfDescription},
                         Job Description: ${jobDescription}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        },
    });

    return JSON.parse(response.text);
}

export default generateInterviewReport;
