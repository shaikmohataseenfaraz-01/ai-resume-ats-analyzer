import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const extractTextFromPDF = async (fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("PDF file is empty");
  }

  try {
    const pdfData = new Uint8Array(
      fileBuffer.buffer,
      fileBuffer.byteOffset,
      fileBuffer.byteLength
    );

    const pdf = await pdfjsLib.getDocument({
      data: pdfData,
    }).promise;

    let completeText = "";

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber += 1
    ) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      completeText += `${pageText}\n`;
    }

    return completeText.trim();
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw error;
  }
};

export default extractTextFromPDF;