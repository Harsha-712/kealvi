import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    const prompt = `
You are an AI assistant.

A poll has the following data:

Question:
${question}

Options and votes:
${options
  .map(
    (o: any) =>
      `${o.option_text}: ${o.poll_votes?.[0]?.count ?? 0} votes`
  )
  .join("\n")}

Generate ONE short insight (maximum 2 sentences).

Examples:
- Python is clearly leading the poll.
- The competition is very close between the top choices.
- PostgreSQL has gained strong community support.

Do not use bullet points.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return Response.json({
      insight:
        response.text?.trim() ||
        "No insight available.",
    });
  } catch (err: any) {
    return Response.json(
      {
        error:
          err.message ||
          "Server error",
      },
      {
        status: 500,
      }
    );
  }
}