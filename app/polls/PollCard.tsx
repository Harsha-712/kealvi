
"use client";

import { useState } from "react";

export default function PollCard({ poll }: any) {
  const [selectedOption, setSelectedOption] = useState("");

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

  return (
    <div className="border rounded p-4 mb-4">
      <h2 className="font-semibold mb-2">
        {poll.question}
      </h2>

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
    </div>
  );
}