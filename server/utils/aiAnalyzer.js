import dotenv from "dotenv";

dotenv.config();

const buildPrompt = (
  resumeText,
  jobDescription
) => `
You are an expert ATS resume analyzer.

Compare the resume with the job description.

Return only valid JSON.
Do not use Markdown.
Do not use backticks.
Do not include explanations outside the JSON.

Return exactly this structure:

{
  "success": true,
  "analysis": {
    "resume_skills": [],
    "job_description_skills": [],
    "missing_skills": {
      "from_resume_for_job_description": [],
      "from_job_description_for_resume": []
    },
    "ats_optimized_bullet_point_improvements": [
      {
        "original_summary": "",
        "suggested_bullets": [],
        "reasoning": ""
      }
    ],
    "ats_optimization_tips": [],
    "compatibility_score": 0,
    "overall_assessment": ""
  }
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

const analyzeWithGemini = async (
  resumeText,
  jobDescription
) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is missing"
      );
    }

    const prompt = buildPrompt(
      resumeText,
      jobDescription
    );

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        responseData
      );

      throw new Error(
        responseData.error?.message ||
        "Gemini request failed"
      );
    }

    const modelOutput =
      responseData.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (!modelOutput) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    const cleanedOutput = modelOutput
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleanedOutput);
    } catch (parseError) {
      return {
        success: false,
        raw_model_output: modelOutput,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export default analyzeWithGemini;