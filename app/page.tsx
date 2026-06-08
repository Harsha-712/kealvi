import PollCard from "./polls/PollCard";
import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

async function getPolls() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://kealvi-nine.vercel.app";

  const res = await fetch(`${baseUrl}/api/polls`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const result = await res.json();
  return result.data || [];
}

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);
  const polls = await getPolls();

  return (
    <main className="min-h-screen bg-slate-50">
  <div className="max-w-3xl mx-auto px-6 py-8">

  <div className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
      Live Q&A
    </h1>

    <a
      href="/create-poll"
      className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow-indigo transition"
    >
      + Create Poll
    </a>
  </div>

      {Array.isArray(polls) &&
        polls.map((poll: any) => (
          <PollCard
            key={poll.id}
            poll={poll}
          />
        ))}

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
      </div>
    </main>
  );
}