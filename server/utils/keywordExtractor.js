const extractKeywords = (text) => {
  const lowercaseText = text.toLowerCase();

  const keywords = lowercaseText.match(
    /\b[a-z]{3,}\b/g
  );

  return keywords || [];
};

export default extractKeywords;