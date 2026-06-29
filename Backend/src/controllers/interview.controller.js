import PDFParser from "pdf2json";
import aiService from "../service/ai.service.js";
import interviewReportModel from "../models/interviewReport.model.js";

/**
 * @description Generates an interview report from an uploaded resume PDF,
 * optional self-description, and job description. Calls Gemini AI and persists the result.
 * @route POST /api/interview/
 * @access Private
 */
async function generateInterviewReportController(req, res) {
    try {
        let resumeContent = "";

        if (req.file) {
            resumeContent = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser();
                pdfParser.on("pdfParser_dataError", (err) => reject(err));
                pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    const text = pdfData.Pages.map((page) =>
                        page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
                    ).join("\n");
                    resolve(text);
                });
                pdfParser.parseBuffer(req.file.buffer);
            });
        }

        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription?.trim()) {
            return res.status(400).json({ message: "Job description is required." });
        }

        const interviewReportByAI = await aiService.generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            title: interviewReportByAI.title,
            matchScore: interviewReportByAI.matchScore,
            technicalQuestions: interviewReportByAI.technicalQuestions,
            behavioralQuestions: interviewReportByAI.behavioralQuestions,
            skillGaps: interviewReportByAI.skillGaps,
            preparationPlan: interviewReportByAI.preparationPlan,
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport,
        });
    } catch (error) {
        console.error("Error in generateInterviewReportController:", error);

        if (error.status === 429) {
            return res.status(429).json({
                message: "AI rate limit exceeded. Wait about a minute and try again.",
            });
        }

        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message,
        });
    }
}

/**
 * @description Fetches a single interview report by ID, scoped to the logged-in user.
 * @route GET /api/interview/report/:interviewId
 * @access Private
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id,
        });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport,
        });
    } catch (error) {
        console.error("Error in getInterviewReportByIdController:", error);
        res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message,
        });
    }
}

/**
 * @description Fetches all interview reports for the logged-in user.
 * Returns lightweight list — includes title, matchScore, skillGaps, and timestamps.
 * Heavy fields (resume text, questions, preparationPlan) are excluded for performance.
 * @route GET /api/interview/
 * @access Private
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports,
        });
    } catch (error) {
        console.error("Error in getAllInterviewReportsController:", error);
        res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message,
        });
    }
}

/**
 * @description Generates a tailored resume PDF using Gemini AI, based on the stored
 * interview report data. Streams the PDF buffer back as an attachment.
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @access Private
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id,
        });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        const pdfBuffer = await aiService.generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error in generateResumePdfController:", error);

        if (error.status === 429) {
            return res.status(429).json({
                message: "AI rate limit exceeded. Wait about a minute and try again.",
            });
        }

        res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message,
        });
    }
}

export default {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
};