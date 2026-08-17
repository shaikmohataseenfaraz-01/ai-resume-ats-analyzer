import extractTextFromPDF from "../utils/resumeParser.js";
import calculateATSScore from "../utils/atsScore.js";
import analyzeWithGemini from "../utils/aiAnalyzer.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const extractedText = await extractTextFromPDF(
      req.file.buffer
    );

    if (!extractedText) {
      return res.status(400).json({
        error: "No text extracted from PDF",
      });
    }

    return res.json({
      success: true,
      preview: extractedText.slice(0, 500),
      text: extractedText,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const {
      resumeText,
      jobDescription,
    } = req.body;

    if (
      !resumeText?.trim() ||
      !jobDescription?.trim()
    ) {
      return res.status(400).json({
        error:
          "Resume text and job description are required",
      });
    }

    const score = calculateATSScore(
      resumeText,
      jobDescription
    );

    const suggestions = await analyzeWithGemini(
      resumeText,
      jobDescription
    );

    return res.json({
      success: true,
      score,
      suggestions,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};