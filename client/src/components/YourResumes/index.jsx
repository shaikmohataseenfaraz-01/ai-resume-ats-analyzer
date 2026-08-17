import { API_BASE_URL } from "../../config.js";
import { useState } from "react";
import "./index.css";

const YourResumes = () => {
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysisResult, setAnalysisResult] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

    const [jobDescription, setJobDescription] =
  useState("");

    const handleFileChange = (event) => {
  const file = event.target.files[0];

  setSelectedFile(file || null);
  setError("");
};

const handleJobDescriptionChange = (event) => {
  setJobDescription(event.target.value);
  setError("");
};

const handleUpload = async () => {
  if (!selectedFile) {
    setError("Please select a PDF file");
    return;
  }

  if (!jobDescription.trim()) {
    setError("Please enter a job description");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setError("Please log in before uploading");
    return;
  }

  const formData = new FormData();
  formData.append("resume", selectedFile);

  setLoading(true);
  setError("");

  try {
    const uploadResponse = await fetch(
      `${API_BASE_URL}/resume/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const uploadData =
      await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData.error ||
        "Resume upload failed"
      );
    }

    const analysisResponse = await fetch(
      `${API_BASE_URL}/resume/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeText: uploadData.text,
          jobDescription,
        }),
      }
    );

    const analysisData =
      await analysisResponse.json();

    if (!analysisResponse.ok) {
      throw new Error(
        analysisData.error ||
        "Resume analysis failed"
      );
    }

    setAnalysisResult(analysisData);
    setIsModalOpen(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const report =
  analysisResult?.suggestions?.analysis ??
  analysisResult?.suggestions ??
  analysisResult;

return (
  <div className="resume-container">
    <h2>Upload Your Resume</h2>

    <p>
      Select your résumé PDF to extract and analyze its text.
    </p>

    <input
      type="file"
      accept="application/pdf"
      onChange={handleFileChange}
    />

    {selectedFile && (
      <p>
        Selected file: <strong>{selectedFile.name}</strong>
      </p>
    )}

    <label htmlFor="job-description">
        Job Description
    </label>

    <textarea
        id="job-description"
        rows="8"
        placeholder="Paste the complete job description here..."
        value={jobDescription}
        onChange={handleJobDescriptionChange}
    />
    <button
      type="button"
      onClick={handleUpload}
      disabled={loading}
    >
      {loading ? "Processing..." : "Upload & Analyze"}
    </button>
    {analysisResult && !isModalOpen && (
  <button
    type="button"
    onClick={() => setIsModalOpen(true)}
  >
    View Report
  </button>
)}
    {error && (
      <p className="error">{error}</p>
    )}
{isModalOpen && analysisResult && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>ATS Analysis Report</h2>

      <h3>Compatibility Score</h3>
      <p>
        <strong>
          {report?.compatibility_score ??
            analysisResult?.score ??
            "N/A"}
          %
        </strong>
      </p>

      {analysisResult?.suggestions?.success ===
        false && (
        <p className="error">
          {analysisResult.suggestions.error ||
            "Gemini analysis failed"}
        </p>
      )}

      <h3>Resume Skills</h3>
      <ul>
        {(report?.resume_skills ?? []).map(
          (skill, index) => (
            <li key={`resume-${index}`}>
              {skill}
            </li>
          )
        )}
      </ul>

      <h3>Job Description Skills</h3>
      <ul>
        {(
          report?.job_description_skills ?? []
        ).map((skill, index) => (
          <li key={`job-${index}`}>
            {skill}
          </li>
        ))}
      </ul>

      <h3>Missing Skills — Add to Resume</h3>
      <ul>
        {(
          report?.missing_skills
            ?.from_resume_for_job_description ??
          []
        ).map((skill, index) => (
          <li key={`missing-${index}`}>
            {skill}
          </li>
        ))}
      </ul>

      <h3>Extra Skills</h3>
      <ul>
        {(
          report?.missing_skills
            ?.from_job_description_for_resume ??
          []
        ).map((skill, index) => (
          <li key={`extra-${index}`}>
            {skill}
          </li>
        ))}
      </ul>

      <h3>ATS Optimization Tips</h3>
      <ul>
        {(
          report?.ats_optimization_tips ?? []
        ).map((tip, index) => (
          <li key={`tip-${index}`}>
            {String(tip).replace(/\*\*/g, "")}
          </li>
        ))}
      </ul>

      <h3>Bullet Point Improvements</h3>
      {(
        report
          ?.ats_optimized_bullet_point_improvements ??
        []
      ).map((improvement, index) => (
        <div key={`improvement-${index}`}>
          <p>
            <strong>Original:</strong>{" "}
            {improvement.original_summary}
          </p>

          <p>
            <strong>Reason:</strong>{" "}
            {improvement.reasoning}
          </p>

          <ul>
            {(
              improvement.suggested_bullets ?? []
            ).map((bullet, bulletIndex) => (
              <li key={`bullet-${bulletIndex}`}>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Overall Assessment</h3>
      <p>
        {report?.overall_assessment ||
          "No assessment available"}
      </p>

      <button
        type="button"
        onClick={() => setIsModalOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
  </div>
);
};

export default YourResumes;