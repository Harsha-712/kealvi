import PollCard from "./PollCard";

async function getPolls() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/polls`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return [];

  return res.json();
}

export default async function PollsPage() {
  const polls = await getPolls();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Polls</h1>

      {Array.isArray(polls) && polls.length > 0 ? (
        polls.map((poll: any) => (
          <PollCard key={poll.id} poll={poll} />
        ))
      ) : (
        <p>No polls found</p>
      )}
    </main>
  );
}