"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreatePollPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    "",
    "",
    "",
  ]);
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(
        options.filter((_, i) => i !== index)
      );
    }
  };

  const updateOption = (
    index: number,
    value: string
  ) => {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  };

  const handleSubmit = async () => {
    setError("");

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    const validOptions =
      options.filter((o) => o.trim());

    if (validOptions.length < 2) {
      setError(
        "Please enter at least 2 options."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          options: validOptions,
          minutes: duration,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      router.push("/");
      router.refresh();

    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong."
      );

      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-8 sm:px-6">

      <div className="mx-auto max-w-2xl">

        {/* BACK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          ← Back to Kealvi
        </Link>

        {/* HEADER */}
        <div className="mb-8 mt-8">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
            🗳️ New Poll
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
            Create a Poll
          </h1>

          <p className="mt-2 text-base text-slate-500">
            Ask the community and discover what
            people think.
          </p>

        </div>

        {/* FORM CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-7">

          {/* QUESTION */}
          <div>

            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">
                Your Question
              </label>

              <span className="text-xs text-slate-400">
                Required
              </span>
            </div>

            <textarea
              className="min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              rows={4}
              placeholder="What would you like to ask the community?"
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
            />

          </div>

          {/* OPTIONS */}
          <div className="mt-7">

            <div className="mb-3 flex items-end justify-between">

              <div>
                <label className="text-sm font-bold text-slate-800">
                  Answer Options
                </label>

                <p className="mt-0.5 text-xs text-slate-400">
                  Add between 2 and 6 options.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {options.length}/6
              </span>

            </div>

            <div className="space-y-3">

              {options.map(
                (option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500">
                      {index + 1}
                    </div>

                    <input
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      placeholder={`Option ${
                        index + 1
                      }`}
                      value={option}
                      onChange={(e) =>
                        updateOption(
                          index,
                          e.target.value
                        )
                      }
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeOption(index)
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      >
                        ×
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                + Add another option
              </button>
            )}

          </div>

          {/* DURATION */}
          <div className="mt-7">

            <label className="text-sm font-bold text-slate-800">
              Poll Duration
            </label>

            <p className="mt-0.5 text-xs text-slate-400">
              Choose how long people can vote.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">

              {[
                [15, "15 Minutes"],
                [30, "30 Minutes"],
                [60, "1 Hour"],
                [120, "2 Hours"],
                [360, "6 Hours"],
                [1440, "24 Hours"],
              ].map(([value, label]) => (

                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setDuration(
                      Number(value)
                    )
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    duration === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-7 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-indigo transition hover:bg-indigo-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Creating your poll..."
              : "Create Poll →"}
          </button>

        </div>

        {/* FOOTNOTE */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Your poll will appear on the Kealvi
          community feed.
        </p>

      </div>

    </main>
  );
}