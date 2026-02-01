import pdfParse from 'pdf-parse';
import fs from 'fs';

// Extract text from PDF file
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return data.text;
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  }
};

// Extract text from buffer
export const extractTextFromBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  }
};
