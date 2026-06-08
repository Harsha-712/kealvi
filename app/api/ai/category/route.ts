import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { question } = await req.json();

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Classify this programming question into ONE category only.

Possible categories:
- React
- Next.js
- JavaScript
- Java
- Python
- Database
- Deployment
- AI
- General

Return ONLY the category name.

Question:
${question}
      `,
    });

  return Response.json({
    category: response.text?.trim(),
  });
}