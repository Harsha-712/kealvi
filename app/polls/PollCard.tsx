"use client";

import { useState, useEffect } from "react";

export default function PollCard({ poll }: any) {
  const [selectedOption, setSelectedOption] = useState("");
  const [prediction, setPrediction] = useState("");
  const [insight, setInsight] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadInsight() {
      const res = await fetch(
        "/api/polls/insight",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: poll.question,
            options: poll.poll_options,
          }),
        }
      );

      const data = await res.json();

      setInsight(data.insight || "");
    }

    loadInsight();
  }, [poll]);

  async function handleVote() {
    if (!selectedOption) {
      alert("Please select an option");
      return;
    }

    const res = await fetch("/api/polls/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        optionId: selectedOption,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Vote submitted!");
      window.location.reload();
    }
  }

  async function handlePrediction() {
    if (!prediction) {
      alert("Select a prediction");
      return;
    }

    const res = await fetch("/api/polls/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pollId: poll.id,
        optionId: prediction,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Prediction submitted!");
    } else {
      alert(data.error || "Something went wrong");
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      "Delete this poll?"
    );

    if (!confirmDelete) return;

    const res = await fetch(
      `/api/polls?id=${poll.id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("Poll deleted");
      window.location.reload();
    } else {
      alert("Delete failed");
    }
  }

  const closingTime = new Date(
    poll.closes_at
  ).getTime();

  const now = currentTime;

  const pollClosed =
    now >= closingTime;

  const remaining = Math.max(
    0,
    closingTime - now
  );

  const hours = Math.floor(
    remaining / (1000 * 60 * 60)
  );

  const minutes = Math.floor(
    (remaining % (1000 * 60 * 60)) /
      (1000 * 60)
  );

  const seconds = Math.floor(
    (remaining % (1000 * 60)) /
      1000
  );

  const winner =
    (poll.poll_options ?? []).length
      ? poll.poll_options.reduce(
          (best: any, current: any) =>
            (best?.poll_votes?.[0]?.count ?? 0) >
            (current?.poll_votes?.[0]?.count ?? 0)
              ? best
              : current
        )
      : null;

  const totalVotes =
    poll.poll_options?.reduce(
      (total: number, option: any) =>
        total +
        (option.poll_votes?.[0]?.count ?? 0),
      0
    ) ?? 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* TOP ACCENT */}
      <div
        className={`h-1 ${
          pollClosed
            ? "bg-slate-300"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400"
        }`}
      />

      <div className="p-5 sm:p-6">

        {/* HEADER */}
        <div className="mb-5 flex items-start justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-3 flex flex-wrap items-center gap-2">

              {pollClosed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  ● Closed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                  <span className="live-dot" />
                  Live Poll
                </span>
              )}

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
              </span>

            </div>

            <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
              {poll.question}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Posted on{" "}
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Asia/Kolkata",
              }).format(
                new Date(poll.created_at)
              )}
            </p>

          </div>

          <button
            onClick={handleDelete}
            title="Delete poll"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            🗑
          </button>

        </div>

        {/* TIMER */}
        <div
          className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 ${
            pollClosed
              ? "border-red-100 bg-red-50"
              : "border-emerald-100 bg-emerald-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">
              {pollClosed ? "🏆" : "⏱️"}
            </span>

            <span
              className={`text-sm font-semibold ${
                pollClosed
                  ? "text-red-600"
                  : "text-emerald-600"
              }`}
            >
              {pollClosed
                ? "Poll Closed"
                : `Closes in ${hours}h ${minutes}m ${seconds}s`}
            </span>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="space-y-3">

          {poll.poll_options?.map(
            (option: any) => {
              const voteCount =
                option.poll_votes?.[0]?.count ?? 0;

              const percentage =
                totalVotes > 0
                  ? Math.round(
                      (voteCount / totalVotes) *
                        100
                    )
                  : 0;

              const selected =
                selectedOption === option.id;

              return (
                <label
                  key={option.id}
                  className={`relative block cursor-pointer overflow-hidden rounded-2xl border p-4 transition ${
                    selected
                      ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/40"
                  } ${
                    pollClosed
                      ? "cursor-default"
                      : ""
                  }`}
                >

                  {!pollClosed && (
                    <input
                      type="radio"
                      name={poll.id}
                      value={option.id}
                      checked={selected}
                      onChange={(e) =>
                        setSelectedOption(
                          e.target.value
                        )
                      }
                      className="sr-only"
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>

                      <span className="truncate text-sm font-semibold text-slate-700">
                        {option.option_text}
                      </span>

                    </div>

                    <span className="shrink-0 text-xs font-bold text-slate-500">
                      {voteCount} · {percentage}%
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="poll-bar-fill h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                </label>
              );
            }
          )}

        </div>

        {/* ACTIONS */}
        <div className="mt-5 flex flex-wrap gap-3">

          <button
            onClick={handleVote}
            disabled={pollClosed}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-indigo transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {pollClosed
              ? "Poll Closed"
              : "Submit Vote →"}
          </button>

        </div>

        {/* PREDICTION */}
        <div className="mt-7 border-t border-slate-100 pt-6">

          <div className="mb-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">🏆</span>

              <h3 className="font-bold text-slate-900">
                Predict the Winner
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Choose which option you think will win.
            </p>
          </div>

          <div className="space-y-2">

            {poll.poll_options?.map(
              (option: any) => (
                <label
                  key={`predict-${option.id}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    prediction === option.id
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 hover:bg-slate-50"
                  } ${
                    pollClosed
                      ? "cursor-default opacity-70"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name={`prediction-${poll.id}`}
                    value={option.id}
                    checked={
                      prediction === option.id
                    }
                    onChange={(e) =>
                      setPrediction(
                        e.target.value
                      )
                    }
                    disabled={pollClosed}
                    className="accent-amber-500"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {option.option_text}
                  </span>

                </label>
              )
            )}

          </div>

          <button
            onClick={handlePrediction}
            disabled={pollClosed}
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
          >
            {pollClosed
              ? "Prediction Closed"
              : "Submit Prediction"}
          </button>

        </div>

        {/* AI INSIGHT */}
        {insight && (
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 animate-fade-in">

            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                ✨
              </div>

              <div>
                <h3 className="text-sm font-bold text-indigo-900">
                  AI Insight
                </h3>

                <p className="text-[11px] text-indigo-400">
                  Powered by Gemini
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-indigo-950/80">
              {insight}
            </p>

          </div>
        )}

        {/* WINNER */}
        {pollClosed && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-5 animate-fade-in">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                🏆
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Poll Winner
                </p>

                <h3 className="text-lg font-bold text-emerald-900">
                  {winner?.option_text ||
                    "No winner"}
                </h3>
              </div>

            </div>

            <div className="mt-4 border-t border-emerald-200 pt-3 text-sm text-emerald-700">
              Total winning votes:{" "}
              <span className="font-bold">
                {winner?.poll_votes?.[0]?.count ??
                  0}
              </span>
            </div>

          </div>
        )}

      </div>
    </article>
  );
}