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
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          question: poll.question,
          options: poll.poll_options,
        }),
      }
    );

    const data =
      await res.json();

    setInsight(
      data.insight || ""
    );
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

const closingTime = new Date(
  poll.closes_at
).getTime();

const now = currentTime;

const pollClosed =
  now >= closingTime;

const remaining =
  Math.max(
    0,
    closingTime - now
  );

const hours = Math.floor(
  remaining / (1000 * 60 * 60)
);

const minutes = Math.floor(
  (remaining %
    (1000 * 60 * 60)) /
    (1000 * 60)
);

const seconds = Math.floor(
  (remaining %
    (1000 * 60)) /
    1000
);

const winner =
  poll.poll_options?.reduce(
    (best: any, current: any) =>
      (best?.poll_votes?.[0]?.count ?? 0) >
      (current?.poll_votes?.[0]?.count ?? 0)
        ? best
        : current
  );
  

  return (
    <div className="border rounded p-4 mb-4">
      <div className="mb-2">
  <h2 className="font-semibold">
    {poll.question}
  </h2>

  <p className="text-sm text-gray-500">
    Posted on{" "}
    {new Date(poll.created_at).toLocaleString()}
  </p>

  <p className="text-red-500">
    {pollClosed
      ? "🏆 Poll Closed"
      : `⏰ Poll closes in: ${hours}h ${minutes}m ${seconds}s`}
  </p>
</div>

      {poll.poll_options?.map((option: any) => (
        <div key={option.id}>
          <label>
            <input
              type="radio"
              name={poll.id}
              value={option.id}
              onChange={(e) =>
                setSelectedOption(e.target.value)
              }
            />
            {" "}
            {option.option_text}
            {" "}
            ({option.poll_votes?.[0]?.count ?? 0} votes)
          </label>
        </div>
      ))}

      <button
  onClick={handleVote}
  disabled={pollClosed}
  className="mt-3 border px-3 py-1 rounded disabled:opacity-50"
>
  {pollClosed ? "Poll Closed" : "Vote"}
</button>
      <hr className="my-4" />

<h3 className="font-medium">
  Predict the Winner 🏆
</h3>
{poll.poll_options?.map((option: any) => (
  <div key={`predict-${option.id}`}>
    <label>
      <input
        type="radio"
        name={`prediction-${poll.id}`}
        value={option.id}
        onChange={(e) =>
          setPrediction(e.target.value)
        }
      />
      {" "}
      {option.option_text}
    </label>
  </div>
))}

<button
  onClick={handlePrediction}
  disabled={pollClosed}
  className="mt-2 border px-3 py-1 rounded disabled:opacity-50"
>
  {pollClosed ? "Prediction Closed" : "Predict Winner"}
</button>

{insight && (
  <div className="mt-4 p-3 border rounded bg-blue-50">
    <h3 className="font-semibold">
      🤖 AI Insight
    </h3>

    <p className="text-sm mt-1">
      {insight}
    </p>
  </div>
)}

{pollClosed && (
  <div className="mt-4 p-3 border rounded bg-green-50">
    <h3 className="font-semibold text-green-700">
      🏆 Winner: {winner?.option_text}
    </h3>

    <p className="text-sm">
      Total Votes:{" "}
      {winner?.poll_votes?.[0]?.count ?? 0}
    </p>
  </div>
)}

</div>
  );
}