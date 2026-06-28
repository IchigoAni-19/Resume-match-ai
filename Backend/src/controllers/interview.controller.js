import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')
import generateInterviewReport from '../service/ai.service.js'
import interviewReportModel from '../models/interviewReport.model.js'

async function generateInterviewReportController(req, res){

    const pdfData = await pdfParse(req.file.buffer)
    const resumeContent = pdfData.text
    const { selfDescription, jobDescription } = req.body

    const interviewReportByAI = await generateInterviewReport({
        resume: resumeContent, 
        selfDescription: selfDescription, 
        jobDescription: jobDescription, 
    })

    const interviewReport = await interviewReportModel.create({
         user: req.user.id, // req.user has id from auth.middleware, not _id!
         resume: resumeContent,
         selfDescription,
         jobDescription,
        ...interviewReportByAI       
    })
    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })
}

export default { generateInterviewReportController }