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
  const [duration, setDuration] = useState(60); // minutes
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, val: string) => {
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };

  const handleSubmit = async () => {
    setError("");
    if (!question.trim()) { setError("Please enter a question."); return; }
    const validOpts = options.filter((o) => o.trim());
    if (validOpts.length < 2) { setError("Add at least 2 options."); return; }

    setSubmitting(true);
    try {
      const closes_at = new Date(Date.now() + duration * 60 * 1000).toISOString();
      // Keep your existing Supabase insert logic
      const { data: poll, error: pollErr } = await supabase
        .from("polls")
       .insert([
  {
    question: question.trim(),
    closes_at,
  },
])
        .select()
        .single();

      if (pollErr || !poll) throw pollErr;

await supabase.from("poll_options").insert(
  validOpts.map((text) => ({
    poll_id: poll.id,
    text,
    votes: 0,
  }))
);

      router.push("/");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const durationOptions = [
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour",     value: 60 },
    { label: "2 hours",    value: 120 },
    { label: "6 hours",    value: 360 },
    { label: "24 hours",   value: 1440 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </Link>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">Kealvi</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-semibold mb-4">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
            New Poll
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">Create a Poll</h1>
          <p className="text-slate-500 text-sm">Set up a question, add options, and let the community vote.</p>
        </div>

        <div className="space-y-5 animate-fade-in delay-100">

          {/* Question */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Poll Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all duration-200 resize-none font-medium"
            />
          </div>

          {/* Options */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Options
              </label>
              <span className="text-xs text-slate-400 font-mono">{options.length}/6</span>
            </div>
            <div className="space-y-2.5">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center animate-fade-in-fast">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-500">{String.fromCharCode(65 + i)}</span>
                  </div>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all duration-200"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                onClick={addOption}
                className="mt-3 w-full py-2.5 border border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add option
              </button>
            )}
          </div>

          {/* Duration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Poll Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200
                    ${duration === d.value
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl animate-scale-in">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/"
              className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-indigo flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  Create Poll
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
