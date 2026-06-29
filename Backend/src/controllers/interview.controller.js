import PDFParser from 'pdf2json'
import generateInterviewReport from '../service/ai.service.js'
import interviewReportModel from '../models/interviewReport.model.js'

// Function to extract text from PDF buffer
const extractPdfText = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()
    pdfParser.on("pdfParser_dataError", (err) => reject(err))
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
      ).join("\n")
      resolve(text)
    })
    pdfParser.parseBuffer(buffer)
  })
}

async function generateInterviewReportController(req, res){
    try {
        console.log("Received interview report request!")
        console.log("req.file:", req.file)
        console.log("req.body:", req.body)

        let resumeContent = ""
        if (req.file) {
            resumeContent = await extractPdfText(req.file.buffer)
            console.log("Extracted resume content length:", resumeContent.length)
        }

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
    } catch (error) {
        console.error("Error in generateInterviewReportController:", error)
        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        })
    }
}

export default { generateInterviewReportController }
