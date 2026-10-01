"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] =
    useState(initialQuestions);

  const [draft, setDraft] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [hasMore, setHasMore] =
    useState(initialHasMore);

  const [loading, setLoading] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(
            query
          )}`
        : `/api/questions`;

      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch(
      "/api/questions",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          body: draft,
        }),
      }
    );

    const created = await res.json();

    setQuestions((qs) => [
      {
        ...created,
        votes: 0,
      },
      ...qs,
    ]);

    setDraft("");
  }

  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? {
              ...q,
              votes: q.votes + 1,
            }
          : q
      )
    );

    const res = await fetch(
      `/api/questions/${id}/vote`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          voterId: getVoterId(),
        }),
      }
    );

    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id
            ? {
                ...q,
                votes: q.votes - 1,
              }
            : q
        )
      );
    }
  }

  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((qs) => [
      ...qs,
      ...data.questions,
    ]);

    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="space-y-5">

      {/* STATUS */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

        <div className="flex items-center gap-2">
          <span className="live-dot" />

          <span className="text-xs font-semibold text-slate-500">
            {hydrated
              ? "Community is live"
              : "Connecting..."}
          </span>
        </div>

        <span className="text-xs text-slate-400">
          {questions.length} question
          {questions.length !== 1
            ? "s"
            : ""}
        </span>

      </div>

      {/* ASK QUESTION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-4">

          <div className="mb-1 flex items-center gap-2">
            <span className="text-lg">
              💬
            </span>

            <h3 className="font-bold text-slate-900">
              Ask the community
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Share something you'd like
            people to discuss.
          </p>

        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <input
            value={draft}
            onChange={(e) =>
              setDraft(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                submit();
              }
            }}
            placeholder="What would you like to ask?"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />

          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-indigo transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ask Question
          </button>

        </div>

      </div>

      {/* SEARCH */}
      <div className="relative">

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search questions..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

      </div>

      {/* QUESTION LIST */}
      <div className="space-y-3">

        {questions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              💬
            </div>

            <h3 className="font-bold text-slate-800">
              No questions found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Be the first person to start
              the conversation.
            </p>

          </div>
        ) : (
          questions.map((q, index) => (
            <div
              key={q.id}
              className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md animate-fade-in"
              style={{
                animationDelay: `${Math.min(
                  index * 40,
                  300
                )}ms`,
              }}
            >

              {/* VOTE */}
              <button
                onClick={() =>
                  upvote(q.id)
                }
                className="flex h-14 min-w-[58px] shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >

                <span className="text-xs leading-none">
                  ▲
                </span>

                <span className="mt-1 font-mono text-sm font-bold">
                  {q.votes}
                </span>

              </button>

              {/* CONTENT */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-3">

                  <p className="text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                    {q.body}
                  </p>

                  <span className="hidden shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-500 sm:block">
                    Question
                  </span>

                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                  {q.author && (
                    <>
                      <span>
                        Asked by{" "}
                        <span className="font-semibold text-slate-500">
                          {q.author}
                        </span>
                      </span>

                      <span>•</span>
                    </>
                  )}

                  <span>
                    {q.votes} vote
                    {q.votes !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>

              </div>

            </div>
          ))
        )}

      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center pt-2">

          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
          >
            {loading
              ? "Loading questions..."
              : "Load more questions"}
          </button>

        </div>
      )}

    </div>
  );
}