"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatePollPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
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

    const validOptions = options.filter((o) => o.trim());

    if (validOptions.length < 2) {
      setError("Please enter at least 2 options.");
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
      setError(err.message || "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <Link href="/" className="text-blue-600">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">
        Create Poll
      </h1>

      <textarea
        className="w-full border rounded p-3 mb-4"
        rows={3}
        placeholder="Enter your poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) =>
                updateOption(index, e.target.value)
              }
            />

            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="px-3 bg-red-500 text-white rounded"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 6 && (
        <button
          onClick={addOption}
          className="mt-3 px-4 py-2 border rounded"
        >
          + Add Option
        </button>
      )}

      <div className="mt-6">
        <label className="font-medium">
          Poll Duration
        </label>

        <select
          className="block mt-2 border rounded p-2"
          value={duration}
          onChange={(e) =>
            setDuration(Number(e.target.value))
          }
        >
          <option value={15}>15 Minutes</option>
          <option value={30}>30 Minutes</option>
          <option value={60}>1 Hour</option>
          <option value={120}>2 Hours</option>
          <option value={360}>6 Hours</option>
          <option value={1440}>24 Hours</option>
        </select>
      </div>

      {error && (
        <p className="text-red-500 mt-4">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create Poll"}
      </button>
    </main>
  );
}