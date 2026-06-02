import PollCard from "./PollCard";

async function getPolls() {
  const res = await fetch("http://localhost:3000/api/polls", {
    cache: "no-store",
  });

  return res.json();
}

export default async function PollsPage() {
  const polls = await getPolls();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Polls
      </h1>

      {polls.map((poll: any) => (
        <PollCard
          key={poll.id}
          poll={poll}
        />
      ))}
    </main>
  );
}