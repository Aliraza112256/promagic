
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseComplaintText = async (rawText: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract the following complaint details from this text and return as JSON:
    
    TEXT: "${rawText}"
    
    FIELDS TO EXTRACT:
    - complaintNumber
    - customerName
    - phoneNumber
    - address
    - productType (Must be one of: AC, Refrigerator, Washing Machine, Other)
    - modelNumber
    - serialNumber
    - type (Warranty, Revenue, or Unknown)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          complaintNumber: { type: Type.STRING },
          customerName: { type: Type.STRING },
          phoneNumber: { type: Type.STRING },
          address: { type: Type.STRING },
          productType: { type: Type.STRING },
          modelNumber: { type: Type.STRING },
          serialNumber: { type: Type.STRING },
          type: { type: Type.STRING },
        },
        required: ["complaintNumber", "customerName", "phoneNumber"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return null;
  }
};
