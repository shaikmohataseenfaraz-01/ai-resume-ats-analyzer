import extractKeywords from "./keywordExtractor.js";

const calculateATSScore = (
  resumeText,
  jobDescription
) => {
  const resumeKeywords =
    extractKeywords(resumeText);

  const jobKeywords =
    extractKeywords(jobDescription);

  const uniqueJobKeywords = [
    ...new Set(jobKeywords),
  ];

  if (uniqueJobKeywords.length === 0) {
    return 0;
  }

  const matchingKeywords =
    uniqueJobKeywords.filter((keyword) =>
      resumeKeywords.includes(keyword)
    );

  const score =
    (matchingKeywords.length /
      uniqueJobKeywords.length) *
    100;

  return Math.round(score);
};

export default calculateATSScore;