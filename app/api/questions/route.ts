import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
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
    const { body, author } = await req.json();

    let category = "General";

    try {
      const classificationPrompt = [
        "You are an expert programming question classifier.",
        "",
        "Classify the following programming question into EXACTLY ONE category.",
        "",
        "Available categories:",
        "React",
        "Next.js",
        "JavaScript",
        "Java",
        "Python",
        "Database",
        "Deployment",
        "AI",
        "General",
        "",
        "Database includes:",
        "SQL, MySQL, PostgreSQL, Postgres, MongoDB, database, databases, DBMS, tables, schemas, normalization, denormalization, primary keys, foreign keys, constraints, indexes, queries, joins, transactions, ACID, stored procedures, triggers, views, full-text search, database design.",
        "",
        "Deployment includes:",
        "Vercel, Netlify, Render, hosting, deployment, production, production builds, CI/CD, domains, server deployment.",
        "",
        "React includes:",
        "React, React hooks, useState, useEffect, useContext, useReducer, props, components, JSX, React state, React lifecycle.",
        "",
        "Next.js includes:",
        "Next.js, Next JS, App Router, API routes, server components, server actions, middleware, Next.js pages, dynamic routes, Next.js configuration.",
        "",
        "JavaScript includes:",
        "JavaScript, JS syntax, variables, functions, arrays, objects, closures, promises, async/await, DOM, events, loops, callbacks.",
        "",
        "Java includes:",
        "Core Java, JVM, JDK, classes, objects, inheritance, polymorphism, encapsulation, abstraction, interfaces, exceptions, collections, multithreading.",
        "",
        "Python includes:",
        "Python, Django, Flask, Pandas, NumPy, Python functions, Python classes, Python modules, Python syntax.",
        "",
        "AI includes:",
        "Artificial Intelligence, AI, Machine Learning, ML, Deep Learning, Gemini, OpenAI, LLMs, Generative AI, neural networks, machine learning models.",
        "",
        "General includes questions that do not clearly belong to any category.",
        "",
        "Important:",
        "Choose only ONE category.",
        "Return ONLY the category name.",
        "Do not explain.",
        "Do not return Markdown.",
        "Do not return extra words.",
        "",
        "Question:",
        body
      ].join("\n");

      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: classificationPrompt,
        });

      const result =
        response.text?.trim();

      const validCategories = [
        "React",
        "Next.js",
        "JavaScript",
        "Java",
        "Python",
        "Database",
        "Deployment",
        "AI",
        "General",
      ];

      if (
        result &&
        validCategories.includes(result)
      ) {
        category = result;
      }

    } catch (e) {
      console.log(
        "Gemini classification failed:",
        e
      );
    }

    const finalBody =
      `🏷️ ${category}\n\n${body}`;

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

