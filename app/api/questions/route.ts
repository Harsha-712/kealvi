import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({
      questions,
      hasMore: false,
    });
  }

  const offset = Number(
    searchParams.get("offset") ?? 0
  );

  const { questions, hasMore } =
    await getQuestionsPage(
      offset,
      PAGE_SIZE
    );

  return Response.json({
    questions,
    hasMore,
  });
}

export async function POST(req: Request) {
  try {
    const { body, author } =
      await req.json();

    let category = "General";

    try {
      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `
Classify this programming question into ONE category.

Possible categories:
React
Next.js
JavaScript
Java
Python
Database
Deployment
AI
General

Return ONLY the category.

Question:
${body}
`,
        });

      category =
        response.text?.trim() ||
        "General";
    } catch (e) {
      console.log(
        "Gemini classification failed."
      );
    }

    const finalBody = `🏷️ ${category}

${body}`;

    const { data, error } =
      await supabase
        .from("questions")
        .insert({
          body: finalBody,
          author,
        })
        .select()
        .single();

    if (error) {
      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(data);
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