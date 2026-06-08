"use client";

import { useState } from "react";

export default function CreatePollPage() {
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [minutes, setMinutes] = useState(60);

  async function handleSubmit() {
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  question,
  options: [option1, option2, option3],
  minutes,
}),
    });

    if (res.ok) {
      alert("Poll created successfully!");
      window.location.href = "/";
    } else {
      alert("Failed to create poll");
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Poll</h1>

      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        type="text"
        placeholder="Option 1"
        value={option1}
        onChange={(e) => setOption1(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        type="text"
        placeholder="Option 2"
        value={option2}
        onChange={(e) => setOption2(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        type="text"
        placeholder="Option 3"
        value={option3}
        onChange={(e) => setOption3(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        type="number"
        placeholder="Poll duration (minutes)"
        value={minutes}
        onChange={(e) =>
        setMinutes(Number(e.target.value))
      }
       className="border p-2 w-full mb-3"
      />

      <button
        onClick={handleSubmit}
        className="border px-4 py-2 rounded"
      >
        Create Poll
      </button>
    </main>
  );
}