import mongoose from "mongoose";

/**
 * @typedef {Object} ITechnicalQuestion
 * @property {string} question  - The technical interview question.
 * @property {string} intention - Why the interviewer asks this question.
 * @property {string} answer    - Guidance on how to answer it.
 */
const technicalQuestionSchema = new mongoose.Schema(
    {
        question:  { type: String, required: [true, "Technical question is required"] },
        intention: { type: String, required: [true, "Intention is required"] },
        answer:    { type: String, required: [true, "Answer is required"] },
    },
    { _id: false }
);

/**
 * @typedef {Object} IBehavioralQuestion
 * @property {string} question  - The behavioral interview question.
 * @property {string} intention - Why the interviewer asks this question.
 * @property {string} answer    - Guidance on how to answer it.
 */
const behavioralQuestionSchema = new mongoose.Schema(
    {
        question:  { type: String, required: [true, "Behavioral question is required"] },
        intention: { type: String, required: [true, "Intention is required"] },
        answer:    { type: String, required: [true, "Answer is required"] },
    },
    { _id: false }
);

/**
 * @typedef {Object} ISkillGap
 * @property {string} skill                    - Name of the missing skill.
 * @property {"low"|"medium"|"high"} severity  - How critical the gap is.
 */
const skillGapSchema = new mongoose.Schema(
    {
        skill:    { type: String, required: [true, "Skill is required"] },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: [true, "Severity is required"],
        },
    },
    { _id: false }
);

/**
 * @typedef {Object} IPreparationDay
 * @property {number}   day   - Day number starting from 1.
 * @property {string}   focus - Topic or theme for the day.
 * @property {string[]} tasks - List of tasks to complete that day.
 */
const preparationPlanSchema = new mongoose.Schema({
    day:   { type: Number, required: [true, "Day is required"] },
    focus: { type: String, required: [true, "Focus is required"] },
    tasks: [{ type: String, required: [true, "Task is required"] }],
});

/**
 * @typedef {Object} IInterviewReport
 * @property {mongoose.Types.ObjectId} user   - Reference to the owning user.
 * @property {string} title                   - AI-generated report title.
 * @property {string} jobDescription          - The target job description text.
 * @property {string} [resume]                - Extracted plain-text content of the uploaded PDF resume.
 * @property {string} [selfDescription]       - Candidate's free-text self-description.
 * @property {number} matchScore              - 0–100 match score between candidate and role.
 * @property {ITechnicalQuestion[]} technicalQuestions
 * @property {IBehavioralQuestion[]} behavioralQuestions
 * @property {ISkillGap[]} skillGaps
 * @property {IPreparationDay[]} preparationPlan
 */
const interviewReportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: [true, "User ID is required"],
        },
        title: {
            type: String,
            required: [true, "Report title is required"],
            default: "Untitled Interview Report",
        },
        jobDescription: {
            type: String,
            required: [true, "Job Description is required"],
        },
        resume:          { type: String },
        selfDescription: { type: String },
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        technicalQuestions:  [technicalQuestionSchema],
        behavioralQuestions: [behavioralQuestionSchema],
        skillGaps:           [skillGapSchema],
        preparationPlan:     [preparationPlanSchema],
    },
    { timestamps: true }
);

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

export default interviewReportModel;
