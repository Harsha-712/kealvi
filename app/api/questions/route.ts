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
  You are an expert programming classifier.

Classify the following programming question into EXACTLY ONE category.

Available categories:
React
Next.js
JavaScript
Java
Python
Database
Deployment
AI
General

Rules:
- SQL, MySQL, PostgreSQL, MongoDB, indexes, constraints, tables, queries, voting systems → Database
- Vercel, Netlify, hosting, deployment, production builds → Deployment
- React hooks, state, props, components → React
- Next.js routing, API routes, server components → Next.js
- Machine learning, Gemini, AI models, LLMs → AI
- Core Java topics → Java
- Core Python topics → Python

Return ONLY the category name.
Do not explain.

Question:
${body}
,
`
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