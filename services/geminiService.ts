
import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const restorePhoto = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';
  const prompt = "Please restore the color and quality of this old photo. Fix any scratches, tears, and discoloration. Enhance the details and clarity while maintaining a natural look.";

  const imagePart = fileToGenerativePart(base64Image, mimeType);
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart && firstPart.inlineData) {
    return firstPart.inlineData.data;
  }
  
  throw new Error("Could not restore the image. The API did not return an image.");
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("Could not generate the image. The API did not return an image.");
};
