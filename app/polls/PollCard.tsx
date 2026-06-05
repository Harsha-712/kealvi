"use client";

import { useState } from "react";

export default function PollCard({ poll }: any) {
  
const [selectedOption, setSelectedOption] = useState("");
const [prediction, setPrediction] = useState("");

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
        className="mt-3 border px-3 py-1 rounded"
      >
        Vote
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
  className="mt-2 border px-3 py-1 rounded"
>
  Predict Winner
</button>
    </div>
  );
}